import os

from django.conf import settings
from django.db import models


def resource_path(instance, filename):
    folder = instance.course_id or "general"
    return f"resources/{folder}/{filename}"


class Resource(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    course = models.ForeignKey(
        "course.Course", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="resources",
    )
    file = models.FileField(upload_to=resource_path)
    file_type = models.CharField(max_length=10, blank=True)   # "pdf", "docx", ...
    size = models.PositiveIntegerField(default=0)             # bytes
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="uploaded_resources"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "resource"
        ordering = ["-id"]

    def __str__(self):
        return self.title

    @property
    def filename(self):
        return os.path.basename(self.file.name)