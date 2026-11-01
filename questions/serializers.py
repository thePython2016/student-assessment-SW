from rest_framework import serializers

from course.models import Course  # change to your Course model
from .models import QuestionBank


class QuestionSerializer(serializers.ModelSerializer):
    # The Angular form sends "courseId"; it maps to the course foreign key.
    courseId = serializers.PrimaryKeyRelatedField(
        source="course", queryset=Course.objects.all(), write_only=True
    )

    class Meta:
        model = QuestionBank
        fields = ["id", "courseId", "text", "topic", "type", "difficulty", "marks"]

    def validate_text(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Enter the question (at least 3 characters).")
        return value.strip()

    def validate_marks(self, value):
        if value < 1:
            raise serializers.ValidationError("Marks must be at least 1.")
        return value