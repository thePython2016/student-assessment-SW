# admin.py
from django.contrib import admin
from .models import ExamAttempt


@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = (
        "id", "student", "assessment", "status",
        "score", "auto_submitted", "started_at", "submitted_at",
    )
    list_filter = ("status", "auto_submitted", "assessment", "started_at")
    search_fields = ("student__username", "student__email", "assessment__title")
    list_select_related = ("student", "assessment")
    raw_id_fields = ("student", "assessment")
    readonly_fields = ("started_at",)
    date_hierarchy = "started_at"
    ordering = ("-started_at",)
    list_per_page = 25