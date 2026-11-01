from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    departmentName_ = serializers.CharField(
        source="department_name",
        validators=[UniqueValidator(queryset=Department.objects.all())],
    )
    departmentCode_ = serializers.CharField(
        source="department_code",
        validators=[UniqueValidator(queryset=Department.objects.all())],
    )

    class Meta:
        model = Department
        fields = ["id", "departmentName_", "departmentCode_", "description"]

    def create(self, validated_data):
        print("3. create() received validated_data:", validated_data)
        department = Department.objects.create(**validated_data)
        return department