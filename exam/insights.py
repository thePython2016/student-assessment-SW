import os
from collections import defaultdict

from django.core.cache import cache
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from account.permissions import IsStudentRole
from .models import ExamAttempt

RESOURCES_ROUTE = "/student-course/resources"  # ADAPT to your student resources route


def _released(asm, now):
    """Same rule as the results list: never use scores the student can't see yet."""
    v = getattr(asm, "result_visibility", "Immediately")
    if v == "Immediately":
        return True
    if v == "After the deadline":
        return bool(asm.end and asm.end < now)
    return False


def _mean(xs):
    xs = list(xs)
    return sum(xs) / len(xs) if xs else 0.0


def _course_name(asm):
    return getattr(getattr(asm, "course", None), "course_name", "")  # ADAPT


def _correct_value(q):
    """The correct answer may be stored as correct_answer or answer."""
    for field in ("correct_answer", "answer"):
        v = getattr(q, field, None)
        if v not in (None, ""):
            return v
    return ""


def _norm(v):
    if isinstance(v, (list, tuple)):
        return sorted(str(x).strip().lower() for x in v)
    return str(v).strip().lower()


def _suggest(topic, mastery, missed_in):
    if mastery < 50:
        text = f"Let's build up {topic} from the basics, then try some practice questions."
    elif mastery < 70:
        text = f"A bit more practice on {topic} will help before your next assessment."
    else:
        text = f"You're almost there on {topic}. A quick review should do it."
    if missed_in >= 2:
        text += f" It came up in {missed_in} assessments, so it's worth the time."
    return text


def _ai_summary(facts, fallback):
    """Optional: Claude writes the summary from the facts. Falls back to plain text."""
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        return fallback
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=key)
        msg = client.messages.create(
            model=os.environ.get("INSIGHTS_MODEL", "claude-sonnet-5-5"),
            max_tokens=250,
            messages=[{
                "role": "user",
                "content": (
                    "Write a 2-3 sentence, warm, plain-language summary for a student, "
                    "speaking to them as 'you'. Mention one strength and one thing to focus on next. "
                    "Use ONLY these facts. Do not invent numbers.\n" + str(facts)
                ),
            }],
        )
        return msg.content[0].text.strip() or fallback
    except Exception:
        return fallback


def build_insights(user):
    now = timezone.now()
    attempts = (
        ExamAttempt.objects
        .filter(student=user, status=ExamAttempt.Status.SUBMITTED)
        .select_related("assessment")
        .order_by("submitted_at")
    )

    pcts, pairs = [], []     # pairs: (student %, class average %)
    topics = defaultdict(lambda: {"right": 0, "total": 0, "missed_in": set(), "course": ""})
    blanks = total_q = auto = 0

    for a in attempts:
        asm = a.assessment
        total = float(asm.total_marks or 0)
        if total <= 0 or not _released(asm, now):
            continue

        pct = float(a.score) / total * 100
        pcts.append(pct)
        auto += 1 if a.auto_submitted else 0

        others = list(
            ExamAttempt.objects
            .filter(assessment=asm, status=ExamAttempt.Status.SUBMITTED)
            .exclude(student=user)
            .values_list("score", flat=True)
        )
        if len(others) >= 3:
            pairs.append((pct, _mean(float(s) for s in others) / total * 100))

        answers = a.answers or {}
        for link in asm.items.select_related("question"):
            q = link.question
            given = answers.get(str(q.id))
            t = topics[getattr(q, "topic", "") or "General"]   # ADAPT: q.topic
            t["total"] += 1
            t["course"] = t["course"] or _course_name(asm)
            total_q += 1

            is_blank = given in (None, "")
            blanks += 1 if is_blank else 0
            if not is_blank and _norm(given) == _norm(_correct_value(q)):
                t["right"] += 1
            else:
                t["missed_in"].add(asm.id)

    if not pcts:
        return {"has_data": False}

    avg = _mean(pcts)
    delta = pcts[-1] - _mean(pcts[:-1]) if len(pcts) > 1 else 0.0

    risk = (
        "at-risk" if avg < 50
        else "needs-attention" if avg < 70 or delta < -10
        else "on-track"
    )

    comparison = ""
    if pairs:
        diff = _mean(p for p, _ in pairs) - _mean(c for _, c in pairs)
        comparison = f"{abs(round(diff))}% {'above' if diff >= 0 else 'below'} class average"

    # Weakest topics first
    ranked = sorted(
        ((v["right"] / v["total"] * 100, name, v) for name, v in topics.items()),
        key=lambda x: x[0],
    )
    weak = [r for r in ranked if r[0] < 80][:3]

    recommendations = [
        {
            "topic": name,
            "courseName": v["course"],
            "masteryPercent": round(m),
            "suggestion": _suggest(name, m, len(v["missed_in"])),
            "resourceLink": RESOURCES_ROUTE,
        }
        for m, name, v in weak
    ]

    next_steps = []
    for m, name, _ in weak[:2]:
        next_steps.append({"icon": "menu_book", "text": f"Spend some time on {name}. You're at {round(m)}% now, and practice will lift it."})
    if total_q and blanks / total_q > 0.1:
        next_steps.append({"icon": "edit_note", "text": f"You left {blanks} question(s) blank. Try an answer for each one before you submit."})
    if auto:
        next_steps.append({"icon": "timer", "text": "Some exams ended when the timer ran out. Check the clock now and then so you can finish calmly."})
    if not next_steps:
        next_steps.append({"icon": "emoji_events", "text": "Great work! Keep practising to stay sharp."})

    patterns = []
    if len(pcts) > 1:
        if delta >= 3:
            patterns.append({"icon": "trending_up", "text": f"Nice progress! Your latest score is {round(delta)}% above your earlier average."})
        elif delta <= -3:
            patterns.append({"icon": "trending_down", "text": f"Your latest score is {abs(round(delta))}% below your earlier average. It's a good moment to review."})
    for m, name, v in weak:
        if len(v["missed_in"]) >= 2:
            patterns.append({"icon": "repeat", "text": f"{name} questions were missed in {len(v['missed_in'])} different assessments."})
    if total_q and blanks:
        patterns.append({"icon": "help_outline", "text": f"{round(blanks / total_q * 100)}% of questions were left unanswered."})
    if auto:
        patterns.append({"icon": "schedule", "text": f"{auto} exam(s) were submitted automatically when time ran out."})

    # Plain-text summary (used if there is no API key)
    n = len(pcts)
    word = "assessment" if n == 1 else "assessments"
    fallback = f"You're averaging {round(avg)}% across {n} {word}."
    if n > 1 and abs(delta) >= 3:
        fallback += f" Your latest result is {'up' if delta > 0 else 'down'} {abs(round(delta))}% on your earlier average."
    if weak:
        fallback += f" A little practice on {weak[0][1]} would help the most right now."
    else:
        fallback += " Keep up the good work!"

    facts = {
        "average_percent": round(avg),
        "assessments_taken": len(pcts),
        "latest_vs_earlier_change": round(delta),
        "vs_class": comparison or "not enough class data",
        "weakest_topics": [{"topic": n_, "mastery": round(m)} for m, n_, _ in weak],
    }

    return {
        "has_data": True,
        "riskLevel": risk,
        "summary": _ai_summary(facts, fallback),
        "courseAverageComparison": comparison,
        "topicRecommendations": recommendations,
        "nextSteps": next_steps,
        "studyPatterns": patterns,
    }


class InsightsView(APIView):
    """GET /exam/insights/ : the student's own insights."""
    permission_classes = [IsAuthenticated, IsStudentRole]

    def get(self, request):
        count = ExamAttempt.objects.filter(
            student=request.user, status=ExamAttempt.Status.SUBMITTED
        ).count()
        key = f"insights:{request.user.id}:{count}"   # recalculated after each new submission
        data = cache.get(key)
        if data is None:
            data = build_insights(request.user)
            cache.set(key, data, 3600)               # 1 hour, so the AI call isn't repeated
        return Response(data)