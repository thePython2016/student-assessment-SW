import os

from rest_framework import serializers

from .models import Resource

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".txt"}
MAX_MB = 20


class ResourceSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source="course.course_name", read_only=True, default="")
    file_url = serializers.SerializerMethodField()
    filename = serializers.CharField(read_only=True)

    class Meta:
        model = Resource
        fields = ["id", "title", "description", "course", "course_name",
                  "file", "file_url", "filename", "file_type", "size", "created_at"]
        read_only_fields = ["id", "file_type", "size", "created_at"]
        extra_kwargs = {"file": {"write_only": True}}

    def get_file_url(self, obj):
        request = self.context.get("request")
        url = obj.file.url
        return request.build_absolute_uri(url) if request else url

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Enter a title (at least 3 characters).")
        return value.strip()

    def validate_file(self, f):
        ext = os.path.splitext(f.name)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            allowed = ", ".join(sorted(e.lstrip(".") for e in ALLOWED_EXTENSIONS))
            raise serializers.ValidationError(f"File type not allowed. Use: {allowed}.")
        if f.size > MAX_MB * 1024 * 1024:
            raise serializers.ValidationError(f"File is too large. Maximum is {MAX_MB} MB.")
        return f