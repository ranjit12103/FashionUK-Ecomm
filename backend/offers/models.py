from decimal import Decimal
from django.db import models
from django.utils import timezone


class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('percent', 'Percentage (%)'),
        ('fixed',   'Fixed Amount (₹)'),
    ]

    code          = models.CharField(max_length=50, unique=True)
    description   = models.CharField(max_length=200, blank=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES, default='percent')
    discount_value = models.DecimalField(
        max_digits=8, decimal_places=2,
        help_text='Percentage (e.g. 10 for 10%) or fixed ₹ amount'
    )
    minimum_order_amount = models.DecimalField(
        max_digits=8, decimal_places=2, default=0,
        help_text='Minimum cart subtotal required to use this coupon'
    )
    maximum_discount = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True,
        help_text='Cap on maximum discount (for percentage coupons)'
    )

    is_active    = models.BooleanField(default=True)
    valid_from   = models.DateTimeField(default=timezone.now)
    valid_until  = models.DateTimeField(null=True, blank=True)
    usage_limit  = models.PositiveIntegerField(null=True, blank=True,
                                               help_text='Max total uses. Leave blank for unlimited.')
    times_used   = models.PositiveIntegerField(default=0)

    # Single-use per user
    single_use_per_user = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'coupons'
        ordering = ['-created_at']

    def is_valid(self):
        now = timezone.now()
        if not self.is_active:
            return False
        if now < self.valid_from:
            return False
        if self.valid_until and now > self.valid_until:
            return False
        if self.usage_limit and self.times_used >= self.usage_limit:
            return False
        return True

    def calculate_discount(self, subtotal: Decimal) -> Decimal:
        """Returns the ₹ discount amount for a given subtotal."""
        subtotal = Decimal(str(subtotal))
        if subtotal < self.minimum_order_amount:
            return Decimal('0.00')

        if self.discount_type == 'percent':
            discount = subtotal * (self.discount_value / Decimal('100'))
            if self.maximum_discount:
                discount = min(discount, self.maximum_discount)
        else:
            discount = min(self.discount_value, subtotal)

        return round(discount, 2)

    def __str__(self):
        if self.discount_type == 'percent':
            return f'{self.code} — {self.discount_value}% off'
        return f'{self.code} — ₹{self.discount_value} off'


class CouponUsage(models.Model):
    """Tracks which user used which coupon (for single_use_per_user enforcement)."""
    coupon    = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    user      = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='coupon_usages')
    order     = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='coupon_usages')
    used_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'coupon_usages'
        unique_together = [['coupon', 'user']]

    def __str__(self):
        return f'{self.user.email} used {self.coupon.code}'