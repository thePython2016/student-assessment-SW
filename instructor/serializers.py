from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Instructor


class InstructorSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source="department.department_name", read_only=True
    )
    email = serializers.EmailField(
    validators=[
        UniqueValidator(
            queryset=Instructor.objects.all(),
            lookup="iexact",
            message="An instructor with this email already exists.",
        )
    ]
)

    class Meta:
        model = Instructor
        fields = [
            "id", "first_name", "last_name", "email",
            "phone", "address", "department", "department_name",
        ]

    def create(self, validated_data):
        instructor = Instructor.objects.create(**validated_data)
        return instructor