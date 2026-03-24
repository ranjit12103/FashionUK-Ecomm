from django.db import models
from orders.models import Order


class Payment(models.Model):
    STATUS_CHOICES = [
        ('created',   'Created'),
        ('paid',      'Paid'),
        ('failed',    'Failed'),
        ('refunded',  'Refunded'),
    ]

    order                  = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')

    # Razorpay IDs
    razorpay_order_id      = models.CharField(max_length=200, unique=True)
    razorpay_payment_id    = models.CharField(max_length=200, blank=True)
    razorpay_signature     = models.CharField(max_length=500, blank=True)

    amount                 = models.DecimalField(max_digits=10, decimal_places=2)
    currency               = models.CharField(max_length=3, default='INR')
    status                 = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    failure_reason         = models.TextField(blank=True)

    created_at             = models.DateTimeField(auto_now_add=True)
    updated_at             = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.order.order_number} — {self.status} — ₹{self.amount}'