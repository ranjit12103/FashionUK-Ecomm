from rest_framework import serializers
from .models import Order, OrderItem, ShippingAddress


class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ShippingAddress
        fields = ['id', 'full_name', 'phone', 'address_line1', 'address_line2',
                  'city', 'county', 'postcode', 'country', 'is_default', 'created_at']
        read_only_fields = ['created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    discount_percent = serializers.IntegerField(read_only=True)
    unit_savings     = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    line_total       = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    line_savings     = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model  = OrderItem
        fields = [
            'id', 'product', 'variant',
            'product_name', 'variant_name', 'sku',
            'original_price', 'unit_price',
            'discount_percent', 'unit_savings',
            'quantity', 'line_total', 'line_savings',
        ]


class OrderSerializer(serializers.ModelSerializer):
    items       = OrderItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status',
            # address
            'full_name', 'email', 'phone',
            'address_line1', 'address_line2', 'city',
            'county', 'postcode', 'country',
            # pricing
            'subtotal', 'discount_amount', 'coupon_code',
            'coupon_savings', 'shipping_cost', 'total',
            # items
            'items', 'total_items',
            'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['order_number', 'status', 'payment_status',
                            'subtotal', 'discount_amount', 'total', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.Serializer):
    """Validates the checkout payload submitted by the client."""
    full_name     = serializers.CharField(max_length=200)
    email         = serializers.EmailField()
    phone         = serializers.CharField(max_length=30, required=False, allow_blank=True)
    address_line1 = serializers.CharField(max_length=255)
    address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city          = serializers.CharField(max_length=100)
    county        = serializers.CharField(max_length=100, required=False, allow_blank=True)
    postcode      = serializers.CharField(max_length=20)
    country       = serializers.CharField(max_length=100, default='India')
    coupon_code   = serializers.CharField(max_length=50, required=False, allow_blank=True)
    notes         = serializers.CharField(required=False, allow_blank=True)
    save_address  = serializers.BooleanField(default=False)