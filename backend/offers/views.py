from decimal import Decimal
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Coupon
from .serializers import CouponValidateSerializer, CouponResponseSerializer


class ValidateCouponView(APIView):
    """
    POST /api/offers/coupons/validate/
    Body: { code: "SUMMER20", subtotal: "75.00" }
    Returns discount amount and coupon details if valid.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CouponValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code     = serializer.validated_data['code'].strip().upper()
        subtotal = Decimal(str(serializer.validated_data['subtotal']))

        try:
            coupon = Coupon.objects.get(code=code, is_active=True)
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'detail': 'Invalid coupon code.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if not coupon.is_valid():
            return Response({'valid': False, 'detail': 'This coupon has expired or is no longer valid.'},
                            status=status.HTTP_400_BAD_REQUEST)

        if subtotal < coupon.minimum_order_amount:
            return Response({
                'valid': False,
                'detail': f'Minimum order of ₹{coupon.minimum_order_amount} required for this coupon.',
            }, status=status.HTTP_400_BAD_REQUEST)

        # Single-use-per-user check
        if coupon.single_use_per_user:
            from .models import CouponUsage
            if CouponUsage.objects.filter(coupon=coupon, user=request.user).exists():
                return Response({'valid': False, 'detail': 'You have already used this coupon.'},
                                status=status.HTTP_400_BAD_REQUEST)

        discount_amount = coupon.calculate_discount(subtotal)

        return Response({
            'valid':           True,
            'coupon':          CouponResponseSerializer(coupon).data,
            'discount_amount': str(discount_amount),
            'new_total':       str(subtotal - discount_amount),
        })