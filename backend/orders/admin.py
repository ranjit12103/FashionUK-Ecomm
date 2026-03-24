from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem, ShippingAddress


class OrderItemInline(admin.TabularInline):
    model   = OrderItem
    extra   = 0
    fields  = [
        'product_name', 'variant_name', 'sku',
        'original_price', 'unit_price', 'quantity',
        'get_line_total',   # method column — safe on empty rows
    ]
    readonly_fields = [
        'product_name', 'variant_name', 'sku',
        'original_price', 'unit_price', 'quantity',
        'get_line_total',
    ]

    def get_line_total(self, obj):
        # obj.pk is None on blank inline rows — guard every value
        if obj.pk is None or obj.unit_price is None or obj.quantity is None:
            return '—'
        return f'₹{round(obj.unit_price * obj.quantity, 2)}'
    get_line_total.short_description = 'Line Total'


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display  = [
        'order_number', 'user', 'full_name',
        'status_badge', 'payment_badge',
        'subtotal', 'discount_amount', 'total',
        'created_at',
    ]
    list_filter   = ['status', 'payment_status', 'created_at']
    search_fields = ['order_number', 'user__email', 'full_name', 'email']
    readonly_fields = [
        'order_number', 'subtotal', 'discount_amount',
        'coupon_savings', 'total', 'created_at', 'updated_at',
    ]
    inlines = [OrderItemInline]

    fieldsets = (
        ('Order',    {'fields': ('order_number', 'user', 'status', 'payment_status')}),
        ('Address',  {'fields': ('full_name', 'email', 'phone',
                                 'address_line1', 'address_line2',
                                 'city', 'county', 'postcode', 'country')}),
        ('Pricing',  {'fields': ('subtotal', 'discount_amount',
                                 'coupon_code', 'coupon_savings',
                                 'shipping_cost', 'total')}),
        ('Notes',    {'fields': ('notes',)}),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def status_badge(self, obj):
        colors = {
            'pending':    '#f59e0b',
            'confirmed':  '#3b82f6',
            'processing': '#8b5cf6',
            'shipped':    '#06b6d4',
            'delivered':  '#10b981',
            'completed':  '#059669',
            'cancelled':  '#ef4444',
            'refunded':   '#6b7280',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:4px;font-size:11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def payment_badge(self, obj):
        colors = {
            'unpaid':   '#f59e0b',
            'paid':     '#10b981',
            'failed':   '#ef4444',
            'refunded': '#6b7280',
        }
        color = colors.get(obj.payment_status, '#6b7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;'
            'border-radius:4px;font-size:11px;">{}</span>',
            color, obj.get_payment_status_display()
        )
    payment_badge.short_description = 'Payment'


@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    list_display  = ['user', 'full_name', 'city', 'postcode', 'is_default']
    search_fields = ['user__email', 'full_name', 'postcode']
    list_filter   = ['is_default', 'country']