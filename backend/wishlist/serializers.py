from rest_framework import serializers
from products.serializers import ProductListSerializer
from .models import WishlistItem


class WishlistItemSerializer(serializers.ModelSerializer):
    product    = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        write_only=True, source='product',
        queryset=__import__('products.models', fromlist=['Product']).Product.objects.filter(is_active=True)
    )

    class Meta:
        model  = WishlistItem
        fields = ['id', 'product', 'product_id', 'added_at']
        read_only_fields = ['added_at']

    def validate(self, attrs):
        user    = self.context['request'].user
        product = attrs['product']
        if WishlistItem.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError('Already in your wishlist.')
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)