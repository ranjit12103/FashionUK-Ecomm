from django.contrib import admin
from .models import WishlistItem


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display   = ['user', 'product', 'variant', 'added_at']
    search_fields  = ['user__email', 'product__name']
    list_filter    = ['added_at']

    # All three required fields must appear in the form
    fields         = ['user', 'product', 'variant']

    # added_at is auto_now_add so it can only be readonly, not in fields
    readonly_fields = ['added_at']

    # Autocomplete makes the dropdowns searchable for large datasets
    autocomplete_fields = ['user', 'product']

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Make variant optional in the admin form (it's nullable in the model)
        if 'variant' in form.base_fields:
            form.base_fields['variant'].required = False
        return form