from django.contrib import admin
from .models import Course


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "course_code", "course_name", "department", "credits", "instructor")
    list_filter = ("department", "credits")
    search_fields = ("course_name", "course_code", "department", "instructor")
    list_per_page = 25
    ordering = ("course_code",)