# department/admin.py
from django.contrib import admin
from .models import Department


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "department_code", "department_name", "short_description")
    search_fields = ("department_name", "department_code")   # needed for autocomplete elsewhere
    ordering = ("department_code",)
    list_per_page = 25

    @admin.display(description="Description")
    def short_description(self, obj):
        return obj.description[:60]