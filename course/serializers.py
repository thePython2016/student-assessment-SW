import re
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(
        max_length=20,
        validators=[
            UniqueValidator(
                queryset=Course.objects.all(),
                lookup="iexact",
                message="A course with this code already exists.",
            )
        ],
    )

    class Meta:
        model = Course
        fields = [
            "id", "course_name", "course_code", "department",
            "credits", "instructor", "description",
        ]
        extra_kwargs = {
            "course_name": {"min_length": 2},
            "description": {"required": False, "allow_blank": True},
        }

    # def validate_course_code(self, value):
    #     value = value.strip().upper()
    #     if not re.fullmatch(r"[A-Z0-9\-]+", value):
    #         raise serializers.ValidationError(
    #             "Course code may contain only letters, numbers and hyphens."
    #         )
    #     return value

    # def validate_credits(self, value):
    #     if not 1 <= value <= 10:
    #         raise serializers.ValidationError("Credits must be between 1 and 10.")
    #     return value

    def create(self, validated_data):
        return Course.objects.create(**validated_data)