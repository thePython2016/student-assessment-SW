from decimal import Decimal
from types import SimpleNamespace

from django.utils import timezone

GRACE_SECONDS = 15  # allowance for network delay when a student submits right at the deadline


def exam_questions(assessment):
    """Questions of an assessment, with the marks chosen for THIS assessment."""
    items = []
    for link in assessment.items.select_related("question"):
        q = link.question
        items.append(SimpleNamespace(
            id=q.id,
            text=q.text,
            type=q.type,
            marks=link.marks,
            options=getattr(q, "options", None),
            correct_answer=q.answer,
        ))
    return items


def seconds_left(attempt):
    """Seconds remaining, based on the duration only."""
    now = timezone.now()
    asm = attempt.assessment
    return int(asm.duration * 60 - (now - attempt.started_at).total_seconds())


def is_late(attempt):
    """True when the time is over, after a short grace period."""
    return seconds_left(attempt) < -GRACE_SECONDS


def _same(given, correct):
    return str(given).strip().lower() == str(correct).strip().lower()


def grade(assessment, answers):
    """Returns the score as a Decimal.

    answers: {"<questionId>": "True" | "False"}, as sent by the exam page.
    Correct: + marks. Wrong (answered): - negative_marking. Blank: 0. Never below 0.
    """
    penalty = Decimal(str(assessment.negative_marking or 0))
    score = Decimal("0")

    for q in exam_questions(assessment):
        given = answers.get(str(q.id), answers.get(q.id))
        if given in (None, "", []):
            continue                      # unanswered, no penalty

        if q.correct_answer and _same(given, q.correct_answer):
            score += Decimal(str(q.marks))
        else:
            score -= penalty

    return max(score, Decimal("0"))