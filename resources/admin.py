# admin.py
import os

from django.contrib import admin
from .models import Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "course", "file_type", "readable_size", "uploaded_by", "created_at")
    list_filter = ("file_type", "course", "created_at")
    search_fields = ("title", "description", "course__course_name", "course__course_code")
    autocomplete_fields = ("course",)          # CourseAdmin already has search_fields
    list_select_related = ("course", "uploaded_by")
    readonly_fields = ("file_type", "size", "uploaded_by", "created_at")
    date_hierarchy = "created_at"
    ordering = ("-id",)
    list_per_page = 25

    @admin.display(description="Size", ordering="size")
    def readable_size(self, obj):
        size = float(obj.size)
        for unit in ("B", "KB", "MB", "GB"):
            if size < 1024:
                return f"{size:.0f} {unit}" if unit == "B" else f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"

    def save_model(self, request, obj, form, change):
        # Fill in the fields that are not typed by hand.
        if not change and not obj.uploaded_by_id:
            obj.uploaded_by = request.user
        if obj.file:
            obj.file_type = os.path.splitext(obj.file.name)[1].lstrip(".").lower()[:10]
            obj.size = obj.file.size
        super().save_model(request, obj, form, change)