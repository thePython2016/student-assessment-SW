# Put this in the admin.py of the app that holds Student
from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("id", "first_name", "last_name", "email", "phone", "course", "gender", "date_of_birth")
    list_filter = ("gender", "course")
    search_fields = ("first_name", "last_name", "email", "phone", "course")
    ordering = ("first_name", "last_name")
    list_per_page = 25