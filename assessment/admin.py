# assessment/admin.py
from django.contrib import admin
from .models import Assessment, AssessmentQuestion, Submission


class AssessmentQuestionInline(admin.TabularInline):
    model = AssessmentQuestion
    extra = 1
    autocomplete_fields = ("question",)   # QuestionBankAdmin already has search_fields


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = (
        "id", "title", "course", "type", "status",
        "start", "end", "duration", "total_marks", "pass_marks", "created_at",
    )
    list_filter = ("status", "type", "course", "auto_submit", "shuffle_questions")
    search_fields = ("title", "description", "course__course_name", "course__course_code")
    autocomplete_fields = ("course",)      # CourseAdmin already has search_fields
    readonly_fields = ("created_at",)
    list_select_related = ("course",)
    date_hierarchy = "created_at"
    inlines = [AssessmentQuestionInline]
    actions = ["publish", "unpublish"]
    list_per_page = 25

    fieldsets = (
        ("Basic", {"fields": ("title", "description", "course", "type", "status",
                              "department_id", "instructor_id")}),
        ("Schedule", {"fields": ("start", "end", "duration", "attempts")}),
        ("Marking", {"fields": ("total_marks", "pass_marks", "negative_marking", "result_visibility")}),
        ("Behaviour", {"fields": ("shuffle_questions", "shuffle_options", "auto_submit")}),
        ("Meta", {"fields": ("created_at",)}),
    )

    @admin.action(description="Publish selected assessments")
    def publish(self, request, queryset):
        queryset.update(status=Assessment.Status.PUBLISHED)

    @admin.action(description="Move selected assessments to draft")
    def unpublish(self, request, queryset):
        queryset.update(status=Assessment.Status.DRAFT)


@admin.register(AssessmentQuestion)
class AssessmentQuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "assessment", "question", "marks")
    list_filter = ("assessment",)
    search_fields = ("assessment__title", "question__text")
    autocomplete_fields = ("assessment", "question")
    list_select_related = ("assessment", "question")
    list_per_page = 25


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "id", "assessment", "student_id", "status", "score",
        "auto_submitted", "time_spent_sec", "started_at", "submitted_at",
    )
    list_filter = ("status", "auto_submitted", "assessment")
    search_fields = ("assessment__title",)
    autocomplete_fields = ("assessment",)
    readonly_fields = ("submitted_at",)
    list_select_related = ("assessment",)
    date_hierarchy = "submitted_at"
    list_per_page = 25