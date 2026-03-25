from django.contrib import admin
from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display    = ['name', 'email', 'subject', 'is_read', 'created_at']
    list_filter     = ['subject', 'is_read']
    search_fields   = ['name', 'email', 'message']
    list_editable   = ['is_read']
    readonly_fields = ['name', 'email', 'subject', 'message', 'created_at']
    ordering        = ['-created_at']

    def has_add_permission(self, request):
        return False
