from rest_framework import serializers
from .models import (
    Category, Brand, Tag, Size, Colour,
    Product, ProductImage, ProductVariant, ProductReview,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image',
                  'bg_color', 'text_color', 'is_active', 'display_order',
                  'meta_title', 'meta_desc']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'description', 'is_active']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'name', 'size_type', 'display_order']


class ColourSerializer(serializers.ModelSerializer):
    class Meta:
        model = Colour
        fields = ['id', 'name', 'hex_code', 'display_order']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'display_order']


class ProductVariantSerializer(serializers.ModelSerializer):
    colour         = ColourSerializer(read_only=True)
    size           = SizeSerializer(read_only=True)
    effective_price = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'variant_sku', 'colour', 'size',
                  'stock', 'price_override', 'effective_price',
                  'image', 'is_active', 'is_in_stock', 'is_low_stock']


class ProductReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name  = serializers.SerializerMethodField()

    class Meta:
        model = ProductReview
        fields = ['id', 'user_email', 'user_name', 'rating', 'title',
                  'comment', 'image', 'is_verified_purchase',
                  'helpful_count', 'created_at']
        read_only_fields = ['is_verified_purchase', 'helpful_count', 'created_at']

    def get_user_name(self, obj):
        u = obj.user
        return u.get_full_name() or u.email.split('@')[0]


class ProductReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductReview
        fields = ['rating', 'title', 'comment', 'image']

    def validate(self, attrs):
        product = self.context['product']
        user    = self.context['request'].user
        if ProductReview.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError('You have already reviewed this product.')
        return attrs


# ── Product List (lightweight — for cards) ──────────────────────────

class ProductListSerializer(serializers.ModelSerializer):
    """
    Used on listing/category pages.
    Exposes both prices + discount_value (₹) + discount_percent (%)
    so the React card can render the sale badge with no extra requests.
    """
    category_name   = serializers.CharField(source='category.name', read_only=True)
    primary_image   = serializers.SerializerMethodField()
    discount_value  = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    is_on_sale      = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description',
            'category_name', 'primary_image',
            # ── pricing block ──────────────────
            'original_price',    # RRP / was-price
            'price',             # current selling price
            'discount_value',    # ₹ amount saved
            'discount_percent',  # % saved
            'is_on_sale',        # bool flag for badge
            # ── meta ──────────────────────────
            'fit', 'badge', 'bg_color',
            'is_featured', 'is_new', 'is_bestseller',
            'average_rating', 'review_count',
            'is_in_stock',
        ]

    def get_primary_image(self, obj):
        request = self.context.get('request')
        url = obj.primary_image
        return request.build_absolute_uri(url) if (url and request) else url


# ── Product Detail (full — for product page) ────────────────────────

class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer used on the single product page.
    All pricing fields, variants, images, and latest 10 approved reviews.
    """
    category        = CategorySerializer(read_only=True)
    brand           = BrandSerializer(read_only=True)
    tags            = TagSerializer(many=True, read_only=True)
    images          = ProductImageSerializer(many=True, read_only=True)
    variants        = ProductVariantSerializer(many=True, read_only=True)
    reviews         = serializers.SerializerMethodField()
    discount_value  = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    is_on_sale      = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'slug',
            'description', 'short_description',
            'category', 'brand', 'tags',
            # ── pricing block ──────────────────
            'original_price',    # RRP / was-price
            'price',             # current selling price
            'discount_value',    # ₹ saved
            'discount_percent',  # % saved
            'is_on_sale',
            # ── style ─────────────────────────
            'fit', 'gender', 'material', 'care_instructions',
            'country_of_origin', 'badge', 'bg_color',
            # ── status ────────────────────────
            'is_active', 'is_featured', 'is_new', 'is_bestseller',
            # ── analytics ─────────────────────
            'view_count', 'sold_count', 'wishlist_count',
            'average_rating', 'review_count',
            # ── stock ─────────────────────────
            'is_in_stock', 'total_stock',
            # ── relations ─────────────────────
            'images', 'variants', 'reviews',
            # ── seo ───────────────────────────
            'meta_title', 'meta_desc',
            'created_at', 'updated_at',
        ]

    def get_reviews(self, obj):
        qs = obj.reviews.filter(is_approved=True).order_by('-created_at')[:10]
        return ProductReviewSerializer(qs, many=True, context=self.context).data