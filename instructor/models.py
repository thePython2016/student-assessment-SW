from django.db import models


class Instructor(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=255)
    department = models.ForeignKey(
        "department.Department",   # "<app_label>.<ModelName>"
        on_delete=models.PROTECT,
        related_name="instructors",
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"