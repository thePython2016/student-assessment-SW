# course/models.py
from django.db import models


class Course(models.Model):
    course_name = models.CharField(max_length=200)
    course_code = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    credits = models.PositiveSmallIntegerField()
    instructor = models.CharField(max_length=150)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.course_code} - {self.course_name}"