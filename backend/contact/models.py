from django.db import models


class ContactMessage(models.Model):
    SUBJECT_CHOICES = [
        ('order',    'Order Issue'),
        ('return',   'Return & Refund'),
        ('product',  'Product Query'),
        ('payment',  'Payment Issue'),
        ('shipping', 'Shipping Query'),
        ('other',    'Other'),
    ]

    name       = models.CharField(max_length=100)
    email      = models.EmailField()
    subject    = models.CharField(max_length=20, choices=SUBJECT_CHOICES)
    message    = models.TextField()
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contact_messages'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} — {self.get_subject_display()} ({self.email})'
