from django.db import models
from django.conf import settings
from products.models import Product, ProductVariant


class WishlistItem(models.Model):
    """One row per (user + product). variant is optional."""
    user     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist_items')
    product  = models.ForeignKey(Product,        on_delete=models.CASCADE, related_name='wishlisted_by')
    variant  = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL,
                                 null=True, blank=True, related_name='wishlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'wishlist_items'
        unique_together = [['user', 'product']]
        ordering        = ['-added_at']

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            Product.objects.filter(pk=self.product.pk).update(
                wishlist_count=models.F('wishlist_count') + 1
            )

    def delete(self, *args, **kwargs):
        pk = self.product.pk
        super().delete(*args, **kwargs)
        Product.objects.filter(pk=pk).update(
            wishlist_count=models.F('wishlist_count') - 1
        )

    def __str__(self):
        return f'{self.user.email} ♥ {self.product.name}'