from django.db import models


class QuestionBank(models.Model):
    class Difficulty(models.TextChoices):
        EASY = "Easy"
        MEDIUM = "Medium"
        HARD = "Hard"

  
    course = models.ForeignKey("course.Course", on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    topic = models.CharField(max_length=100)
    type = models.CharField(max_length=30, default="MCQ")
    difficulty = models.CharField(max_length=10, choices=Difficulty.choices, default=Difficulty.EASY)
    marks = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "question_bank"
        ordering = ["id"]

    def __str__(self):
        return self.text[:50]