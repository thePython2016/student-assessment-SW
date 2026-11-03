from django.conf import settings
from django.db import models


class ExamAttempt(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = "in_progress", "In progress"
        SUBMITTED = "submitted", "Submitted"

    assessment = models.ForeignKey(
        "assessment.Assessment", on_delete=models.CASCADE, related_name="exam_attempts"
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="exam_attempts"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.IN_PROGRESS)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    auto_submitted = models.BooleanField(default=False)
    answers = models.JSONField(default=dict, blank=True)
    score = models.DecimalField(max_digits=7, decimal_places=2, default=0)

    class Meta:
        unique_together = ("assessment", "student")   # one attempt each
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.student} - {self.assessment} ({self.status})"