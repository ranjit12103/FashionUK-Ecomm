from django.db import models
from django.conf import settings
from products.models import Product, ProductVariant


class Cart(models.Model):
    """One cart per user. Created on first add-to-cart."""
    user       = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'carts'

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        """Sum of (effective unit price × quantity) for all items."""
        return sum(item.line_total for item in self.items.all())

    @property
    def total_savings(self):
        """Total ₹ saved across all sale items in the cart."""
        return sum(item.line_savings for item in self.items.all())

    def __str__(self):
        return f'Cart — {self.user.email}'


class CartItem(models.Model):
    cart     = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product  = models.ForeignKey(Product,        on_delete=models.CASCADE, related_name='cart_items')
    variant  = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL,
                                 null=True, blank=True, related_name='cart_items')
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table     = 'cart_items'
        unique_together = [['cart', 'variant']]
        ordering     = ['added_at']

    # ── Pricing helpers (respects variant price_override) ────────────
    @property
    def unit_price(self):
        """Current selling price for this variant (or product base price)."""
        return self.variant.effective_price if self.variant else self.product.price

    @property
    def original_unit_price(self):
        """RRP / was-price for this product."""
        return self.product.original_price

    @property
    def unit_savings(self):
        """₹ saved per unit."""
        diff = self.original_unit_price - self.unit_price
        return round(diff, 2) if diff > 0 else 0.00

    @property
    def discount_percent(self):
        """% saved on this item."""
        if self.unit_savings and self.original_unit_price > 0:
            return round((self.unit_savings / self.original_unit_price) * 100)
        return 0

    @property
    def line_total(self):
        """unit_price × quantity."""
        return round(self.unit_price * self.quantity, 2)

    @property
    def line_savings(self):
        """Total ₹ saved for this line (unit_savings × quantity)."""
        return round(self.unit_savings * self.quantity, 2)

    def __str__(self):
        return f'{self.product.name} × {self.quantity}'