from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        STUDENT = "student", "Student"

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)
    address = models.CharField(max_length=200)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
    )
    REQUIRED_FIELDS = ["email", "phone", "address"]
    def __str__(self):
        return self.email