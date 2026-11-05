from django.contrib import admin
from .models import Course


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "course_code", "course_name", "department", "credits", "instructor")
    search_fields = ("course_name", "course_code", "department", "instructor")