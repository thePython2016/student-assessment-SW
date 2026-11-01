# models.py
from django.db import models


class Department(models.Model):
    department_name = models.CharField(max_length=100, unique=True)
    department_code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.department_code} - {self.department_name}"