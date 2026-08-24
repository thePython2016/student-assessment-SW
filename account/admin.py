from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from .models import Profile

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'

class CustomUserAdmin(UserAdmin):
    inlines = (ProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_phone', 'get_address', 'is_staff')

    def get_phone(self, obj):
        return obj.profile.phone if hasattr(obj, 'profile') else '-'
    get_phone.short_description = 'Phone'

    def get_address(self, obj):
        return obj.profile.address if hasattr(obj, 'profile') else '-'
    get_address.short_description = 'Address'

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)