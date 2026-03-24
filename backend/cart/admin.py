from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model  = CartItem
    extra  = 0
    fields = ['product', 'variant', 'quantity', 'line_total']
    readonly_fields = ['line_total']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display  = ['user', 'total_items', 'subtotal', 'total_savings', 'updated_at']
    search_fields = ['user__email']
    readonly_fields = ['total_items', 'subtotal', 'total_savings']
    inlines = [CartItemInline]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display  = ['cart', 'product', 'variant', 'quantity', 'unit_price', 'line_total']
    search_fields = ['cart__user__email', 'product__name']