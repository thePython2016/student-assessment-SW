from django.conf import settings
from django.db import models


class Student(models.Model):
    admission_number = models.CharField(max_length=20, primary_key=True,db_index=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, db_index=True,on_delete=models.CASCADE, related_name='student_profile')
    class_level = models.CharField(max_length=20,db_index=True)
    stream = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    guardian_name = models.CharField(max_length=100, blank=True)
    guardian_phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.admission_number