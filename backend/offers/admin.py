from django.contrib import admin
from django.utils.html import format_html
from .models import Coupon, CouponUsage


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display  = ['code', 'discount_display', 'min_order', 'is_active',
                     'valid_from', 'valid_until', 'usage_display', 'is_valid_now']
    list_filter   = ['is_active', 'discount_type']
    search_fields = ['code', 'description']
    list_editable = ['is_active']

    def discount_display(self, obj):
        if obj.discount_type == 'percent':
            return f'{obj.discount_value}%'
        return f'₹{obj.discount_value}'
    discount_display.short_description = 'Discount'

    def min_order(self, obj):
        return f'₹{obj.minimum_order_amount}' if obj.minimum_order_amount else '—'
    min_order.short_description = 'Min Order'

    def usage_display(self, obj):
        limit = str(obj.usage_limit) if obj.usage_limit else '∞'
        return f'{obj.times_used} / {limit}'
    usage_display.short_description = 'Used'

    def is_valid_now(self, obj):
        valid = obj.is_valid()
        return format_html(
            '<span style="color:{}">●</span> {}',
            'green' if valid else 'red',
            'Valid' if valid else 'Invalid'
        )
    is_valid_now.short_description = 'Status'


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display  = ['coupon', 'user', 'order', 'used_at']
    search_fields = ['coupon__code', 'user__email']
    readonly_fields = ['coupon', 'user', 'order', 'used_at']