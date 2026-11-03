# Add these two models to the SAME models.py that holds Assessment and AssessmentQuestion.
# Then run:
#   python manage.py makemigrations
#   python manage.py migrate

from django.db import models
from django.utils import timezone


class Attempt(models.Model):
    """One student taking one assessment once. Created when the student presses Begin."""

    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"   # handed in, waiting for a teacher to mark written answers
    GRADED = "graded"         # fully marked
    STATUS_CHOICES = [
        (IN_PROGRESS, "In progress"),
        (SUBMITTED, "Submitted, needs marking"),
        (GRADED, "Graded"),
    ]

    assessment = models.ForeignKey("Assessment", on_delete=models.CASCADE, related_name="submissions")
    # TODO: change this to a ForeignKey to your Student model when you have one, for example:
    # student = models.ForeignKey("student.Student", on_delete=models.CASCADE)
    student_id = models.IntegerField(db_index=True)

    attempt_number = models.PositiveSmallIntegerField(default=1)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default=IN_PROGRESS)

    # The SERVER decides when the exam ends, so refreshing the page cannot add time.
    started_at = models.DateTimeField(default=timezone.now)
    ends_at = models.DateTimeField()
    submitted_at = models.DateTimeField(null=True, blank=True)
    auto_submitted = models.BooleanField(default=False)   # time ran out or too many tab switches
    tab_switches = models.PositiveSmallIntegerField(default=0)

    # Results
    score = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    passed = models.BooleanField(null=True, blank=True)    # None while a teacher still has to mark
    needs_review = models.BooleanField(default=False)

    class Meta:
        db_table = "attempt"
        ordering = ["-started_at"]
        constraints = [
            # Attempt numbers are never repeated for the same student and assessment.
            models.UniqueConstraint(
                fields=["assessment", "student_id", "attempt_number"], name="uniq_attempt_number"
            ),
            # A student can have only ONE open attempt, so a double click cannot start two.
            models.UniqueConstraint(
                fields=["assessment", "student_id"],
                condition=models.Q(status="in_progress"),
                name="one_open_attempt",
            ),
        ]

    def __str__(self):
        return f"Student {self.student_id} - {self.assessment_id} - attempt {self.attempt_number}"


class AttemptAnswer(models.Model):
    """One answer inside an attempt, with the marks it earned."""

    attempt = models.ForeignKey(Attempt, on_delete=models.CASCADE, related_name="answers")
    # PROTECT: a question that has been answered cannot be deleted, so results are never lost.
    question = models.ForeignKey("questions.QuestionBank", on_delete=models.PROTECT)
    answer = models.TextField(blank=True, default="")
    is_correct = models.BooleanField(null=True, blank=True)   # None = a teacher must mark it
    marks_awarded = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        db_table = "attempt_answer"
        constraints = [
            models.UniqueConstraint(fields=["attempt", "question"], name="uniq_answer_per_question"),
        ]

    def __str__(self):
        return f"Attempt {self.attempt_id} - question {self.question_id}"