import uuid
from django.db import models
from django.conf import settings
from products.models import Product, ProductVariant


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',    'Pending'),
        ('confirmed',  'Confirmed'),
        ('processing', 'Processing'),
        ('shipped',    'Shipped'),
        ('delivered',  'Delivered'),
        ('completed',  'Completed'),
        ('cancelled',  'Cancelled'),
        ('refunded',   'Refunded'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('unpaid',    'Unpaid'),
        ('paid',      'Paid'),
        ('failed',    'Failed'),
        ('refunded',  'Refunded'),
    ]

    # ── Identifiers ───────────────────────────
    order_number = models.CharField(max_length=20, unique=True, blank=True)
    user         = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                     null=True, related_name='orders')

    # ── Status ────────────────────────────────
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')

    # ── Shipping address (snapshot at order time) ─────────────────────
    full_name     = models.CharField(max_length=200)
    email         = models.EmailField()
    phone         = models.CharField(max_length=30, blank=True)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city          = models.CharField(max_length=100)
    county        = models.CharField(max_length=100, blank=True)
    postcode      = models.CharField(max_length=20)
    country       = models.CharField(max_length=100, default='India')

    # ── Pricing snapshot ──────────────────────
    subtotal        = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                                          help_text='Total discount applied (coupon + sale savings)')
    shipping_cost   = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total           = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # ── Coupon ────────────────────────────────
    coupon_code    = models.CharField(max_length=50, blank=True)
    coupon_savings = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    # ── Stripe / payment reference ───────────
    stripe_payment_intent = models.CharField(max_length=200, blank=True)
    notes                 = models.TextField(blank=True)

    # ── Timestamps ────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f'FUK-{uuid.uuid4().hex[:8].upper()}'
        super().save(*args, **kwargs)

    @property
    def total_items(self):
        return sum(i.quantity for i in self.items.all())

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    """Snapshot of a product/variant at the time of purchase."""
    order   = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product,        on_delete=models.SET_NULL, null=True, related_name='order_items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)

    # ── Snapshot fields (preserved even if product changes) ───────────
    product_name   = models.CharField(max_length=255)
    variant_name   = models.CharField(max_length=100, blank=True)
    sku            = models.CharField(max_length=80, blank=True)

    # Both prices stored — shows "was ₹X, paid ₹Y" in order history
    original_price = models.DecimalField(max_digits=8, decimal_places=2)  # RRP at purchase time
    unit_price     = models.DecimalField(max_digits=8, decimal_places=2)  # Price actually paid
    quantity       = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = 'order_items'
        ordering = ['id']

    @property
    def discount_percent(self):
        if self.unit_price < self.original_price and self.original_price > 0:
            return round(((self.original_price - self.unit_price) / self.original_price) * 100)
        return 0

    @property
    def unit_savings(self):
        diff = self.original_price - self.unit_price
        return round(diff, 2) if diff > 0 else 0.00

    @property
    def line_total(self):
        return round(self.unit_price * self.quantity, 2)

    @property
    def line_savings(self):
        return round(self.unit_savings * self.quantity, 2)

    def __str__(self):
        return f'{self.product_name} × {self.quantity}'


class ShippingAddress(models.Model):
    """Saved addresses for faster checkout."""
    user          = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    full_name     = models.CharField(max_length=200)
    phone         = models.CharField(max_length=30, blank=True)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city          = models.CharField(max_length=100)
    county        = models.CharField(max_length=100, blank=True)
    postcode      = models.CharField(max_length=20)
    country       = models.CharField(max_length=100, default='India')
    is_default    = models.BooleanField(default=False)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'shipping_addresses'
        ordering = ['-is_default', '-created_at']

    def save(self, *args, **kwargs):
        if self.is_default:
            ShippingAddress.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.full_name}, {self.city} ({self.postcode})'