# instructor/admin.py
from django.contrib import admin
from .models import Instructor


@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ("id", "first_name", "last_name", "email", "phone", "department")
    list_filter = ("department",)
    search_fields = ("first_name", "last_name", "email", "phone", "department__department_name")
    autocomplete_fields = ("department",)    # requires DepartmentAdmin with search_fields
    list_select_related = ("department",)
    ordering = ("first_name", "last_name")
    list_per_page = 25