import re
from datetime import date
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[UniqueValidator(
            queryset=Student.objects.all(),
            lookup="iexact",
            message="A student with this email already exists.",
        )]
    )

    class Meta:
        model = Student
        fields = [
            "id", "first_name", "last_name", "email", "phone",
            "address", "date_of_birth", "gender", "course",
        ]

    def validate_first_name(self, value):
        value = value.strip()
        if not re.fullmatch(r"[A-Za-z][A-Za-z\s'\-]+", value):
            raise serializers.ValidationError("First name must contain only letters (min 2).")
        return value.title()

    def validate_last_name(self, value):
        value = value.strip()
        if not re.fullmatch(r"[A-Za-z][A-Za-z\s'\-]+", value):
            raise serializers.ValidationError("Last name must contain only letters (min 2).")
        return value.title()

    def validate_email(self, value):
        return value.strip().lower()

    def validate_phone(self, value):
        value = value.strip()
        if not re.fullmatch(r"\+?\d{9,15}", value):
            raise serializers.ValidationError("Phone must be 9 to 15 digits, optionally starting with +.")
        return value

    def validate_date_of_birth(self, value):
        if value >= date.today():
            raise serializers.ValidationError("Date of birth must be in the past.")
        return value

    def validate_gender(self, value):
        if value not in ("Male", "Female", "Other"):
            raise serializers.ValidationError("Please select a valid gender.")
        return value

    def create(self, validated_data):
        return Student.objects.create(**validated_data)