from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display    = ['email', 'first_name', 'last_name', 'is_active', 'is_staff', 'date_joined']
    list_filter     = ['is_active', 'is_staff', 'is_superuser']
    search_fields   = ['email', 'first_name', 'last_name']
    ordering        = ['-date_joined']
    readonly_fields = ['date_joined', 'updated_at']

    fieldsets = (
        ('Account',     {'fields': ('email', 'password')}),
        ('Personal',    {'fields': ('first_name', 'last_name', 'phone', 'avatar')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Timestamps',  {'fields': ('date_joined', 'updated_at'), 'classes': ('collapse',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )