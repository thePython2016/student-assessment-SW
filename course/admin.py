# course/admin.py
from django.contrib import admin
from .models import Course


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    # `department` and `instructor` are plain text fields on Course.
    # Your API expects `instructor` to hold the Instructor's id number.
    list_display = ("id", "course_code", "course_name", "department", "credits", "instructor")
    list_filter = ("department", "credits")
    search_fields = ("course_name", "course_code", "department", "instructor")  # needed for autocomplete elsewhere
    ordering = ("course_code",)
    list_per_page = 25