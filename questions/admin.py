# admin.py
from django.contrib import admin
from .models import QuestionBank


@admin.register(QuestionBank)
class QuestionBankAdmin(admin.ModelAdmin):
    list_display = ("id", "short_text", "course", "topic", "type", "difficulty", "marks", "answer")
    list_filter = ("course", "type", "difficulty", "answer")
    search_fields = ("text", "topic", "course__course_name")
    list_editable = ("marks", "difficulty")
    list_per_page = 25
    ordering = ("id",)
    autocomplete_fields = ("course",)

    @admin.display(description="Question")
    def short_text(self, obj):
        return obj.text[:60]