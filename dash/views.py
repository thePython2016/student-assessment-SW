import calendar
from collections import Counter, defaultdict
from datetime import timedelta

from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Change "assessments" to the app that holds Assessment and Attempt.
from assessments.models import Assessment, Attempt


def assessments_for_student(student_id):
    """
    Every published assessment this student should see.
    TODO: narrow this to the student's own course or class when you have that link, for example
    Assessment.objects.filter(status="published", course_id__in=student_course_ids)
    """
    return Assessment.objects.filter(status="published")


def percent(attempt):
    """Score as a percentage of the assessment's total marks, or None if not marked yet."""
    total = attempt.assessment.total_marks
    if attempt.status != Attempt.GRADED or attempt.score is None or not total:
        return None
    return float(attempt.score) / total * 100


def label(p):
    if p is None:
        return "Pending"
    return "Excellent" if p >= 80 else "Good" if p >= 50 else "At risk"


def average(values):
    values = [v for v in values if v is not None]
    return round(sum(values) / len(values), 1) if values else None


def trend(graded, rng, today):
    """Average score for each day (week), each week (month) or each month (year)."""
    def day_of(a):
        return timezone.localtime(a.submitted_at).date()

    if rng == "year":
        months, y, m = [], today.year, today.month
        for _ in range(12):
            months.append((y, m))
            m -= 1
            if m == 0:
                m, y = 12, y - 1
        months.reverse()
        labels = [calendar.month_abbr[m] for _, m in months]
        values = [average([percent(a) for a in graded
                           if (day_of(a).year, day_of(a).month) == ym]) for ym in months]
    elif rng == "month":
        spans = []
        for i in range(4):
            end = today - timedelta(days=7 * (3 - i))
            spans.append((end - timedelta(days=6), end))
        labels = [f"Week {i + 1}" for i in range(4)]
        values = [average([percent(a) for a in graded if lo <= day_of(a) <= hi]) for lo, hi in spans]
    else:  # week: the last 7 days
        days = [today - timedelta(days=6 - i) for i in range(7)]
        labels = [d.strftime("%a") for d in days]
        values = [average([percent(a) for a in graded if day_of(a) == d]) for d in days]
    return {"labels": labels, "values": values}


@api_view(["GET"])
def student_dashboard(request, student_id):
    # NOTE: there is no login check here yet. When you add login, use the logged-in
    # student instead of the id in the URL, so one student cannot read another's data.
    now = timezone.now()
    today = timezone.localdate()
    rng = request.query_params.get("range", "week")

    visible = list(assessments_for_student(student_id).select_related("course"))
    attempts = list(
        Attempt.objects.filter(student_id=student_id)
        .exclude(status=Attempt.IN_PROGRESS)
        .select_related("assessment__course")
    )
    graded = [a for a in attempts if a.status == Attempt.GRADED and a.score is not None and a.submitted_at]
    used = Counter(a.assessment_id for a in attempts)
    done_ids = set(used)

    # ---- Stat cards ----
    ended = [a for a in visible if a.end and a.end < now]
    missed = [a for a in ended if a.id not in done_ids]
    passed = [a for a in graded if a.passed]
    stats = {
        "total_assessments": len(visible),
        "completed": len(done_ids),
        "missed_rate": round(len(missed) / len(ended) * 100) if ended else 0,
        "pass_rate": round(len(passed) / len(graded) * 100) if graded else None,
        "overall_score": average([percent(a) for a in graded]),
    }

    # ---- Subject-wise strength: average score for each course ----
    by_course = defaultdict(list)
    for a in graded:
        course = a.assessment.course
        by_course[getattr(course, "course_name", None) or "No course"].append(percent(a))
    subjects = sorted(
        ({"subject": name, "score": average(vals)} for name, vals in by_course.items()),
        key=lambda s: s["score"], reverse=True,
    )

    # ---- Upcoming: open or opening soon, and attempts still left ----
    upcoming = sorted(
        (a for a in visible if a.end and a.end > now and used[a.id] < a.attempts),
        key=lambda a: a.end,
    )[:5]

    # ---- Recent results ----
    recent = sorted(attempts, key=lambda a: a.submitted_at or a.started_at, reverse=True)[:5]

    return Response({
        "stats": stats,
        "trend": trend(graded, rng, today),
        "subjects": subjects,
        "upcoming": [{
            "id": a.id,
            "title": a.title,
            "course": getattr(a.course, "course_name", "") if a.course else "",
            "start": a.start.isoformat() if a.start else None,
            "end": a.end.isoformat(),
            "duration": a.duration,
            "available": bool(a.start is None or a.start <= now),
        } for a in upcoming],
        "recent": [{
            "id": a.assessment_id,
            "title": a.assessment.title,
            "course": getattr(a.assessment.course, "course_name", "") if a.assessment.course else "",
            "date": (a.submitted_at or a.started_at).isoformat(),
            "percent": None if percent(a) is None else round(percent(a)),
            "status": label(percent(a)),
        } for a in recent],
    })