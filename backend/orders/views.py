from decimal import Decimal
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import Cart
from offers.models import Coupon
from .models import Order, OrderItem, ShippingAddress
from .serializers import OrderSerializer, OrderCreateSerializer, ShippingAddressSerializer
from .emails import send_order_confirmation_email


# ── Shipping Addresses ───────────────────────────────────────────────

class ShippingAddressListCreateView(generics.ListCreateAPIView):
    """GET / POST /api/orders/addresses/"""
    serializer_class   = ShippingAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ShippingAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



class ShippingAddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET / PATCH / DELETE /api/orders/addresses/<pk>/"""
    serializer_class   = ShippingAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ShippingAddress.objects.filter(user=self.request.user)


# ── Order List ───────────────────────────────────────────────────────

class OrderListView(generics.ListAPIView):
    """GET /api/orders/  — authenticated user's order history."""
    serializer_class   = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related('items')
            .order_by('-created_at')
        )


class OrderDetailView(generics.RetrieveAPIView):
    """GET /api/orders/<order_number>/"""
    serializer_class   = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field       = 'order_number'

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')


# ── Checkout (create order from cart) ────────────────────────────────

class CheckoutView(APIView):
    """
    POST /api/orders/checkout/

    1. Validates the cart has items
    2. Applies coupon if provided
    3. Snapshots cart → Order + OrderItems
    4. Clears the cart
    5. Sends confirmation email
    6. Returns the created order + Stripe client_secret (if applicable)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        # ── 1. Validate cart ─────────────────────────────────────────
        try:
            cart = Cart.objects.prefetch_related(
                'items__product', 'items__variant'
            ).get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        if not cart.items.exists():
            return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        # ── 2. Coupon ─────────────────────────────────────────────────
        coupon         = None
        coupon_savings = Decimal('0.00')
        coupon_code    = d.get('coupon_code', '').strip().upper()

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code, is_active=True)
                if not coupon.is_valid():
                    return Response({'detail': 'This coupon has expired or reached its usage limit.'},
                                    status=status.HTTP_400_BAD_REQUEST)
            except Coupon.DoesNotExist:
                return Response({'detail': 'Invalid coupon code.'}, status=status.HTTP_400_BAD_REQUEST)

        # ── 3. Pricing ────────────────────────────────────────────────
        subtotal       = cart.subtotal
        sale_savings   = cart.total_savings
        shipping_cost  = Decimal('0.00') if subtotal >= Decimal('50.00') else Decimal('3.99')

        if coupon:
            coupon_savings = coupon.calculate_discount(subtotal)

        total_discount = sale_savings + coupon_savings
        total          = subtotal - coupon_savings + shipping_cost

        # ── 4. Create Order ───────────────────────────────────────────
        order = Order.objects.create(
            user            = request.user,
            full_name       = d['full_name'],
            email           = d['email'],
            phone           = d.get('phone', ''),
            address_line1   = d['address_line1'],
            address_line2   = d.get('address_line2', ''),
            city            = d['city'],
            county          = d.get('county', ''),
            postcode        = d['postcode'],
            country         = d.get('country', 'India'),
            subtotal        = subtotal,
            discount_amount = total_discount,
            coupon_code     = coupon_code,
            coupon_savings  = coupon_savings,
            shipping_cost   = shipping_cost,
            total           = total,
            notes           = d.get('notes', ''),
        )

        # ── 5. Snapshot cart items → OrderItems ───────────────────────
        for item in cart.items.all():
            variant_name = ''
            if item.variant:
                parts = []
                if item.variant.colour: parts.append(item.variant.colour.name)
                if item.variant.size:   parts.append(item.variant.size.name)
                variant_name = ' / '.join(parts)

            OrderItem.objects.create(
                order          = order,
                product        = item.product,
                variant        = item.variant,
                product_name   = item.product.name,
                variant_name   = variant_name,
                sku            = item.variant.variant_sku if item.variant else item.product.sku,
                original_price = item.original_unit_price,
                unit_price     = item.unit_price,
                quantity       = item.quantity,
            )

            # Increment sold_count
            from products.models import Product
            Product.objects.filter(pk=item.product.pk).update(
                sold_count=item.product.sold_count + item.quantity
            )

        # ── 6. Redeem coupon ──────────────────────────────────────────
        if coupon:
            coupon.times_used += 1
            coupon.save(update_fields=['times_used'])

        # ── 7. Save address if requested ──────────────────────────────
        if d.get('save_address'):
            ShippingAddress.objects.create(
                user          = request.user,
                full_name     = d['full_name'],
                phone         = d.get('phone', ''),
                address_line1 = d['address_line1'],
                address_line2 = d.get('address_line2', ''),
                city          = d['city'],
                county        = d.get('county', ''),
                postcode      = d['postcode'],
                country       = d.get('country', 'India'),
            )

        # ── 8. Clear cart ─────────────────────────────────────────────
        cart.items.all().delete()

        # ── 9. Confirmation email ─────────────────────────────────────
        try:
            send_order_confirmation_email(order)
        except Exception:
            pass  # Don't fail the checkout if email fails

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderCancelView(APIView):
    """POST /api/orders/<order_number>/cancel/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if order.status not in ('pending', 'confirmed'):
            return Response(
                {'detail': f'Cannot cancel an order with status "{order.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = 'cancelled'
        order.save(update_fields=['status'])

        from .emails import send_order_cancelled_email
        try:
            send_order_cancelled_email(order)
        except Exception:
            pass

        return Response(OrderSerializer(order).data)