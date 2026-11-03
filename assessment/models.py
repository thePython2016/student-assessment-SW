from django.db import models


class Assessment(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft"
        PUBLISHED = "published"

    # basic
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    # Plain ids because I don't know your department/instructor apps.
    # Change to ForeignKey("yourapp.Department", ...) / ("yourapp.Instructor", ...) if you want.
    department_id = models.PositiveIntegerField(null=True, blank=True)
    instructor_id = models.PositiveIntegerField(null=True, blank=True)
    course = models.ForeignKey("course.Course", null=True, blank=True, on_delete=models.SET_NULL, related_name="assessments")
    type = models.CharField(max_length=30, default="Quiz")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)

    # settings
    start = models.DateTimeField(null=True, blank=True)
    end = models.DateTimeField(null=True, blank=True)
    duration = models.PositiveIntegerField(default=60)
    attempts = models.PositiveIntegerField(default=1)
    total_marks = models.PositiveIntegerField(default=50)
    pass_marks = models.PositiveIntegerField(default=25)
    result_visibility = models.CharField(max_length=30, default="Immediately")
    negative_marking = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    shuffle_questions = models.BooleanField(default=True)
    shuffle_options = models.BooleanField(default=True)
    auto_submit = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "assessment"
        ordering = ["-id"]

    def __str__(self):
        return self.title


class AssessmentQuestion(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name="items")
    # QuestionBank lives in the "questions" app only. Do NOT define it again here.
    question = models.ForeignKey("questions.QuestionBank", on_delete=models.CASCADE, related_name="assessment_items")
    marks = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "assessment_question"
        unique_together = ("assessment", "question")
        ordering = ["id"]


class Submission(models.Model):
    """One student's attempt for one assessment, with its answers and result."""

    class Status(models.TextChoices):
        IN_PROGRESS = "In progress"
        SUBMITTED = "Submitted"   # waiting for marking
        MARKED = "Marked"         # score is final

    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name="submissions")
    student_id = models.PositiveIntegerField(null=True, blank=True)  # change to a ForeignKey to your student/user model
    answers = models.JSONField(default=dict)  # { "questionId": "answer text" }
    auto_submitted = models.BooleanField(default=False)  # True when the timer ran out

    # --- new: attempt and result fields ---
    started_at = models.DateTimeField(null=True, blank=True)
    time_spent_sec = models.PositiveIntegerField(default=0)
    score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)  # null until marked
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.SUBMITTED)

    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "assessment_submission"
        ordering = ["-id"]