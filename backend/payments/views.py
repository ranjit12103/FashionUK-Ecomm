import hmac
import hashlib
import razorpay

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import redirect                    # add this
from django.http import HttpResponseBadRequest          # add this
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from .models import Payment

# Initialise Razorpay client once at module level
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


# ── 1. Create Razorpay Order ─────────────────────────────────────────

class CreateRazorpayOrderView(APIView):
    """
    POST /api/payments/create-order/
    Body: { "order_number": "FUK-XXXXXXXX" }

    Creates a Razorpay order and returns the order_id + key_id
    so the React frontend can open the Razorpay checkout modal.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_number = request.data.get('order_number')
        if not order_number:
            return Response({'detail': 'order_number is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_status == 'paid':
            return Response({'detail': 'This order is already paid.'}, status=status.HTTP_400_BAD_REQUEST)

        # Razorpay expects amount in paise (1 INR = 100 paise)
        amount_in_paise = int(order.total * 100)

        razorpay_order = client.order.create({
            'amount':          amount_in_paise,
            'currency':        'INR',
            'receipt':         order.order_number,
            'payment_capture': 1,   # auto-capture on success
        })

        # Save the Razorpay order against our order
        payment, _ = Payment.objects.update_or_create(
            order=order,
            defaults={
                'razorpay_order_id': razorpay_order['id'],
                'amount':            order.total,
                'currency':          'INR',
                'status':            'created',
            }
        )

        return Response({
            'razorpay_order_id': razorpay_order['id'],
            'razorpay_key_id':   settings.RAZORPAY_KEY_ID,   # needed by frontend
            'amount':            amount_in_paise,              # in paise
            'currency':          'INR',
            'order_number':      order.order_number,
            'name':              order.full_name,
            'email':             order.email,
            'phone':             order.phone,
        })


# ── 2. Verify Payment (called after Razorpay modal success) ──────────

class VerifyRazorpayPaymentView(APIView):
    """
    POST /api/payments/verify/
    Body: {
        "razorpay_order_id":   "order_xxx",
        "razorpay_payment_id": "pay_xxx",
        "razorpay_signature":  "xxxxxxx"
    }

    Verifies the HMAC signature Razorpay sends after a successful payment.
    If valid → marks order as paid.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id   = request.data.get('razorpay_order_id', '')
        razorpay_payment_id = request.data.get('razorpay_payment_id', '')
        razorpay_signature  = request.data.get('razorpay_signature', '')

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response({'detail': 'Missing payment fields.'}, status=status.HTTP_400_BAD_REQUEST)

        # ── Signature verification (HMAC-SHA256) ─────────────────────
        body        = f'{razorpay_order_id}|{razorpay_payment_id}'.encode()
        expected_sig = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            body,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_sig, razorpay_signature):
            return Response({'detail': 'Invalid payment signature. Payment not verified.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # ── Signature valid → update Payment + Order ──────────────────
        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment record not found.'}, status=status.HTTP_404_NOT_FOUND)

        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature  = razorpay_signature
        payment.status              = 'paid'
        payment.save(update_fields=['razorpay_payment_id', 'razorpay_signature', 'status', 'updated_at'])

        order = payment.order
        order.payment_status = 'paid'
        order.status         = 'confirmed'
        order.save(update_fields=['payment_status', 'status'])

        return Response({'detail': 'Payment verified successfully.', 'order_number': order.order_number})


# ── 3. Webhook (optional but recommended for server-side confirmation) ─

@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(APIView):
    """
    POST /api/payments/webhook/
    Razorpay Dashboard → Webhooks → point to this URL.
    Handles: payment.captured, payment.failed, refund.created
    """
    permission_classes = [AllowAny]

    def post(self, request):
        webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET

        # Verify webhook signature
        razorpay_signature = request.headers.get('X-Razorpay-Signature', '')
        body               = request.body

        expected = hmac.new(
            webhook_secret.encode(),
            body,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected, razorpay_signature):
            return Response({'detail': 'Invalid webhook signature.'}, status=status.HTTP_400_BAD_REQUEST)

        import json
        event = json.loads(body)
        event_type = event.get('event')

        if event_type == 'payment.captured':
            self._handle_captured(event)
        elif event_type == 'payment.failed':
            self._handle_failed(event)
        elif event_type == 'refund.created':
            self._handle_refund(event)

        return Response({'status': 'ok'})

    def _handle_captured(self, event):
        payment_entity     = event['payload']['payment']['entity']
        razorpay_order_id  = payment_entity.get('order_id')
        razorpay_payment_id = payment_entity.get('id')
        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
            payment.razorpay_payment_id = razorpay_payment_id
            payment.status = 'paid'
            payment.save(update_fields=['razorpay_payment_id', 'status', 'updated_at'])
            order = payment.order
            order.payment_status = 'paid'
            order.status = 'confirmed'
            order.save(update_fields=['payment_status', 'status'])
        except Payment.DoesNotExist:
            pass

    def _handle_failed(self, event):
        payment_entity    = event['payload']['payment']['entity']
        razorpay_order_id = payment_entity.get('order_id')
        reason            = payment_entity.get('error_description', '')
        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
            payment.status         = 'failed'
            payment.failure_reason = reason
            payment.save(update_fields=['status', 'failure_reason', 'updated_at'])
            order = payment.order
            order.payment_status = 'failed'
            order.save(update_fields=['payment_status'])
        except Payment.DoesNotExist:
            pass

    def _handle_refund(self, event):
        razorpay_payment_id = event['payload']['refund']['entity'].get('payment_id')
        try:
            payment = Payment.objects.get(razorpay_payment_id=razorpay_payment_id)
            payment.status = 'refunded'
            payment.save(update_fields=['status', 'updated_at'])
            order = payment.order
            order.payment_status = 'refunded'
            order.status = 'refunded'
            order.save(update_fields=['payment_status', 'status'])
        except Payment.DoesNotExist:
            pass


# ── 4. Payment Status ─────────────────────────────────────────────────

class PaymentDetailView(APIView):
    """GET /api/payments/<order_number>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, order_number):
        try:
            order   = Order.objects.get(order_number=order_number, user=request.user)
            payment = order.payment
        except (Order.DoesNotExist, Payment.DoesNotExist):
            return Response({'detail': 'Payment not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'order_number':         order.order_number,
            'payment_status':       order.payment_status,
            'razorpay_order_id':    payment.razorpay_order_id,
            'razorpay_payment_id':  payment.razorpay_payment_id,
            'amount':               str(payment.amount),
            'currency':             payment.currency,
            'status':               payment.status,
            'created_at':           payment.created_at,
        })
        

# ── 4. Payment success ─────────────────────────────────────────────────     
@csrf_exempt
def payment_success_redirect(request):
    payment_id = request.GET.get('razorpay_payment_id')
    order_id   = request.GET.get('razorpay_order_id')
    signature  = request.GET.get('razorpay_signature')

    if not (payment_id and order_id and signature):
        return HttpResponseBadRequest("Missing payment parameters")

    try:
        client.utility.verify_payment_signature({
            'razorpay_payment_id': payment_id,
            'razorpay_order_id':   order_id,
            'razorpay_signature':  signature
        })
    except Exception:
        return redirect(f"{settings.FRONTEND_URL.rstrip('/')}/payment/failed?order={order_id}")

    # mark order as paid
    try:
        payment = Payment.objects.get(razorpay_order_id=order_id)
        payment.razorpay_payment_id = payment_id
        payment.status = 'paid'
        payment.save(update_fields=['razorpay_payment_id', 'status'])

        order = payment.order
        order.payment_status = 'paid'
        order.status = 'confirmed'
        order.save(update_fields=['payment_status', 'status'])
    except Payment.DoesNotExist:
        pass

    return redirect(
        f"{settings.FRONTEND_URL.rstrip('/')}/payment/success?order={order_id}&payment={payment_id}"
    )