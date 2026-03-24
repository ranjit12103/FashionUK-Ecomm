from rest_framework import serializers
from products.serializers import ProductListSerializer, ProductVariantSerializer
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product         = ProductListSerializer(read_only=True)
    variant         = ProductVariantSerializer(read_only=True)
    unit_price      = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    original_unit_price = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    unit_savings    = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    line_total      = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    line_savings    = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model  = CartItem
        fields = [
            'id', 'product', 'variant', 'quantity',
            'unit_price', 'original_unit_price',
            'unit_savings', 'discount_percent',
            'line_total', 'line_savings',
            'added_at',
        ]


class CartSerializer(serializers.ModelSerializer):
    items         = CartItemSerializer(many=True, read_only=True)
    total_items   = serializers.IntegerField(read_only=True)
    subtotal      = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_savings = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model  = Cart
        fields = ['id', 'items', 'total_items', 'subtotal', 'total_savings', 'updated_at']


class CartItemAddSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    quantity   = serializers.IntegerField(min_value=1, default=1)

    def validate(self, attrs):
        from products.models import Product, ProductVariant
        try:
            product = Product.objects.get(pk=attrs['product_id'], is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError({'product_id': 'Product not found.'})
        attrs['product'] = product

        variant_id = attrs.get('variant_id')
        if variant_id:
            try:
                variant = ProductVariant.objects.get(pk=variant_id, product=product, is_active=True)
            except ProductVariant.DoesNotExist:
                raise serializers.ValidationError({'variant_id': 'Variant not found for this product.'})
            if not variant.is_in_stock:
                raise serializers.ValidationError({'variant_id': 'This variant is out of stock.'})
            attrs['variant'] = variant
        else:
            attrs['variant'] = None
        return attrs


class CartItemUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)