# course/serializers.py
from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "course_name", "course_code", "department",
                  "credits", "instructor", "description"]