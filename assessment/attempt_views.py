from datetime import timedelta
from decimal import Decimal

from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Assessment, Submission


def _student_id(request):
    """The logged-in user's id, or None when the request is not authenticated."""
    user = request.user
    return user.id if getattr(user, "is_authenticated", False) else None


def _open_assessment(pk, grace_minutes=0):
    """Return (assessment, error_response). Blocks exams that are not open."""
    try:
        a = Assessment.objects.get(pk=pk, status=Assessment.Status.PUBLISHED)
    except Assessment.DoesNotExist:
        return None, Response({"detail": "Exam not found"}, status=404)

    now = timezone.now()
    if a.start and now < a.start:
        return None, Response({"detail": "This exam has not opened yet"}, status=403)
    if a.end and now > a.end + timedelta(minutes=grace_minutes):
        return None, Response({"detail": "This exam is closed"}, status=403)
    return a, None


def _attempts_used(a, student_id):
    if student_id is None:
        return 0
    return Submission.objects.filter(assessment=a, student_id=student_id).count()


def _result(sub):
    """The ExamResultData shape the Angular app expects."""
    a = sub.assessment
    visible = a.result_visibility == "Immediately"
    score = sub.score if visible else None
    pct = round(float(score) / a.total_marks * 100, 1) if score is not None and a.total_marks else None
    return {
        "id": sub.id,
        "assessmentId": a.id,
        "title": a.title,
        "status": "Marked" if visible else "Submitted",
        "score": float(score) if score is not None else None,
        "totalMarks": a.total_marks,
        "passMarks": a.pass_marks,
        "percentage": pct,
        "passed": (score >= a.pass_marks) if score is not None else None,
        "timeSpentSec": sub.time_spent_sec,
        "submittedAt": sub.submitted_at.isoformat(),
    }


@api_view(["GET"])
def exam_questions(request, pk):
    """Questions for one exam. The correct answers are never sent."""
    a, err = _open_assessment(pk)
    if err:
        return err

    if _attempts_used(a, _student_id(request)) >= a.attempts:
        return Response({"detail": "You have used all your attempts"}, status=403)

    items = a.items.select_related("question")
    return Response({
        "id": a.id,
        "title": a.title,
        "duration": a.duration,
        "totalMarks": a.total_marks,
        "autoSubmit": a.auto_submit,
        "questions": [
            {"id": i.question_id, "text": i.question.text, "marks": i.marks}
            for i in items
        ],
    })


@api_view(["POST"])
def submit_exam(request, pk):
    """Score the answers on the server and save the Submission."""
    a, err = _open_assessment(pk, grace_minutes=2)   # small grace for a timer that ends right at closing time
    if err:
        return err

    sid = _student_id(request)
    if _attempts_used(a, sid) >= a.attempts:
        return Response({"detail": "You have used all your attempts"}, status=403)

    data = request.data

    # questionId -> answer text, from the request
    given = {}
    for row in data.get("answers", []):
        try:
            given[int(row["questionId"])] = str(row.get("answer", "")).strip()
        except (KeyError, TypeError, ValueError):
            continue

    score = Decimal(0)
    saved = {}
    for item in a.items.select_related("question"):
        ans = given.get(item.question_id)
        if not ans:
            continue                                   # unanswered: no marks, no penalty
        saved[str(item.question_id)] = ans
        if ans.lower() == item.question.answer.lower():
            score += item.marks
        else:
            score -= a.negative_marking
    score = max(score, Decimal(0))

    try:
        spent = int(data.get("timeSpentSec") or 0)
    except (TypeError, ValueError):
        spent = 0
    spent = max(0, min(spent, a.duration * 60 + 120))   # cannot exceed the exam length

    sub = Submission.objects.create(
        assessment=a,
        student_id=sid,
        answers=saved,
        auto_submitted=bool(data.get("autoSubmitted")),
        started_at=parse_datetime(data.get("startedAt") or ""),
        time_spent_sec=spent,
        score=score,
        status=Submission.Status.MARKED,
    )
    return Response(_result(sub), status=201)


@api_view(["GET"])
def submission_detail(request, pk):
    """One result, for the result page and for history."""
    sub = get_object_or_404(Submission.objects.select_related("assessment"), pk=pk)
    sid = _student_id(request)
    if sid is not None and sub.student_id != sid:
        return Response({"detail": "Not found"}, status=404)
    return Response(_result(sub))