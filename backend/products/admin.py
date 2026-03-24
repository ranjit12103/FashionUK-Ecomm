from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Category, Brand, Tag, Size, Colour,
    Product, ProductImage, ProductVariant, ProductReview,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display        = ['name', 'slug', 'is_active', 'display_order', 'bg_preview']
    list_editable       = ['is_active', 'display_order']
    prepopulated_fields = {'slug': ('name',)}
    search_fields       = ['name']

    def bg_preview(self, obj):
        return format_html(
            '<div style="width:36px;height:18px;background:{};border:1px solid #ccc;border-radius:3px;"></div>',
            obj.bg_color
        )
    bg_preview.short_description = 'BG'


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display        = ['name', 'slug', 'is_active']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display        = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display  = ['name', 'size_type', 'display_order']
    list_editable = ['display_order']


@admin.register(Colour)
class ColourAdmin(admin.ModelAdmin):
    list_display  = ['name', 'hex_code', 'swatch', 'display_order']
    list_editable = ['display_order']

    def swatch(self, obj):
        if obj.hex_code:
            return format_html(
                '<div style="width:24px;height:24px;background:{};border-radius:4px;border:1px solid #ccc;"></div>',
                obj.hex_code
            )
        return '—'
    swatch.short_description = 'Swatch'


class ProductImageInline(admin.TabularInline):
    model  = ProductImage
    extra  = 1
    fields = ['image', 'alt_text', 'is_primary', 'display_order']


class ProductVariantInline(admin.TabularInline):
    model  = ProductVariant
    extra  = 1
    fields = ['colour', 'size', 'stock', 'price_override', 'is_active']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = [
        'name', 'sku', 'category',
        'rrp_col', 'price_col', 'discount_col',
        'badge', 'is_active', 'is_featured', 'is_new',
        'stock_col', 'sold_count',
    ]
    list_filter   = ['is_active', 'is_featured', 'is_new', 'is_bestseller',
                     'badge', 'category', 'fit', 'gender']
    list_editable = ['is_active', 'is_featured', 'is_new', 'badge']
    search_fields = ['name', 'sku', 'description']

    # slug is auto-generated in model.save() so we MUST NOT use
    # prepopulated_fields for it — that requires slug to be an editable
    # form field, but we declared it readonly below.
    prepopulated_fields = {}

    filter_horizontal = ['tags']
    inlines           = [ProductImageInline, ProductVariantInline]
    readonly_fields   = [
        'sku', 'slug',
        'discount_value', 'discount_percent',
        'view_count', 'sold_count', 'wishlist_count',
        'created_at', 'updated_at',
    ]

    fieldsets = (
        ('Core', {
            'fields': ('name', 'sku', 'slug', 'category', 'brand', 'tags')
        }),
        ('Pricing', {
            'fields': ('original_price', 'price', 'discount_value', 'discount_percent'),
            'description': (
                'Set price lower than original_price to activate a sale. '
                'Discount fields are read-only and auto-calculated.'
            ),
        }),
        ('Content', {
            'fields': ('short_description', 'description', 'material',
                       'care_instructions', 'country_of_origin')
        }),
        ('Style', {
            'fields': ('fit', 'gender', 'badge', 'bg_color')
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured', 'is_new', 'is_bestseller')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_desc'),
            'classes': ('collapse',)
        }),
        ('Analytics (read-only)', {
            'fields': ('view_count', 'sold_count', 'wishlist_count',
                       'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def rrp_col(self, obj):
        return f'₹{obj.original_price}'
    rrp_col.short_description = 'RRP'

    def price_col(self, obj):
        color = 'crimson' if obj.is_on_sale else 'inherit'
        return format_html('<span style="color:{}">₹{}</span>', color, obj.price)
    price_col.short_description = 'Price'

    def discount_col(self, obj):
        if obj.is_on_sale:
            return format_html(
                '<span style="color:green;font-weight:600;">-{}% (₹{})</span>',
                obj.discount_percent, obj.discount_value,
            )
        return '—'
    discount_col.short_description = 'Discount'

    def stock_col(self, obj):
        t = obj.total_stock
        color = 'green' if t > 10 else 'orange' if t > 0 else 'red'
        return format_html('<span style="color:{}">{}</span>', color, t)
    stock_col.short_description = 'Stock'


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display  = ['product', 'colour', 'size', 'variant_sku',
                     'stock', 'stock_status', 'effective_price', 'is_active']
    list_filter   = ['is_active', 'colour', 'size']
    search_fields = ['product__name', 'variant_sku']
    list_editable = ['stock', 'is_active']

    def stock_status(self, obj):
        if obj.stock > 0:
            return format_html('<span style="color:green;">{}</span>', 'In stock')
        if obj.stock == 0:
            return format_html('<span style="color:orange;">{}</span>', 'Out of stock')
        return format_html('<span style="color:red;">{}</span>', 'Unknown')
    stock_status.short_description = 'Stock status'


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display    = ['product', 'user', 'stars', 'title',
                       'is_verified_purchase', 'is_approved', 'created_at']
    list_filter     = ['is_approved', 'is_verified_purchase', 'rating']
    list_editable   = ['is_approved']
    search_fields   = ['product__name', 'user__email', 'comment']
    readonly_fields = ['product', 'user', 'rating', 'comment',
                       'is_verified_purchase', 'created_at']
    actions         = ['approve_reviews', 'reject_reviews']

    def stars(self, obj):
        return '★' * obj.rating + '☆' * (5 - obj.rating)
    stars.short_description = 'Rating'

    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, f'{queryset.count()} reviews approved.')
    approve_reviews.short_description = 'Approve selected'

    def reject_reviews(self, request, queryset):
        queryset.update(is_approved=False)
        self.message_user(request, f'{queryset.count()} reviews rejected.')
    reject_reviews.short_description = 'Reject selected'