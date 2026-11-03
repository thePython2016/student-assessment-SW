from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "phone", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    list_editable = ("role",)   # change role right from the list
    search_fields = ("username", "email", "phone")

    fieldsets = UserAdmin.fieldsets + (
        ("Extra info", {"fields": ("phone", "address", "role")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Extra info", {"fields": ("email", "phone", "address", "role")}),
    )