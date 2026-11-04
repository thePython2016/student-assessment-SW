from django.shortcuts import render

# Create your views here.
from collections import Counter

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from exam.models import ExamAttempt
from .models import Assessment, Submission
from .serializers import (
    AssessmentSerializer,
    AssessmentWriteSerializer,
    ExamSerializer,
    StudentAssessmentSerializer,
    SubmissionSerializer,
)


class AssessmentViewSet(
    mixins.CreateModelMixin,    # POST   /assessments
    mixins.ListModelMixin,      # GET    /assessments
    mixins.RetrieveModelMixin,  # GET    /assessments/<id>
    mixins.UpdateModelMixin,    # PUT / PATCH /assessments/<id>
    mixins.DestroyModelMixin,   # DELETE /assessments/<id>
    viewsets.GenericViewSet,
):
    queryset = (
        Assessment.objects.select_related("course")
        .prefetch_related("items__question")
        .annotate(question_count=Count("items"))
        .order_by("-id")
    )

    def get_serializer_class(self):
        return AssessmentWriteSerializer if self.action == "create" else AssessmentSerializer

    def create(self, request):
        serializer = AssessmentWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assessment = serializer.save()
        # The Angular create form expects { id: number }
        return Response({"id": assessment.id, "status": assessment.status}, status=status.HTTP_201_CREATED)

    # ---- Helpers (no GROUP BY, safe on Postgres) ----

    def _plain_queryset(self):
        return (
            Assessment.objects.select_related("course")
            .prefetch_related("items__question")
        )

    @staticmethod
    def _with_question_count(qs):
        # Items are already prefetched, so this costs no extra queries
        rows = list(qs)
        for a in rows:
            a.question_count = len(a.items.all())
        return rows

    # ---- Student side ----

    # GET /assessments/overview?studentId=7 : everything the student assessment page shows
    @action(detail=False, methods=["get"])
    def overview(self, request):
        raw = request.query_params.get("studentId", "")
        student_id = int(raw) if raw.isdigit() else None  # None = submissions saved without a student
        now = timezone.now()

        published = self._with_question_count(
            self._plain_queryset().filter(status=Assessment.Status.PUBLISHED).order_by("-id")
        )
        submissions = list(
            Submission.objects.filter(student_id=student_id, assessment__status=Assessment.Status.PUBLISHED)
            .select_related("assessment")
            .order_by("-id")
        )
        attempts_used = Counter(s.assessment_id for s in submissions)

        upcoming, missed = [], []
        for a in published:
            used = attempts_used.get(a.id, 0)
            if a.end and a.end < now:
                if used == 0:
                    missed.append(a)          # closed and never submitted
                continue
            if used >= a.attempts:
                continue                       # all attempts used
            item = dict(StudentAssessmentSerializer(a).data)
            item["available"] = (not a.start) or a.start <= now
            upcoming.append(item)

        # Latest submission of each assessment
        results, seen = [], set()
        for s in submissions:
            if s.assessment_id in seen:
                continue
            seen.add(s.assessment_id)
            a = s.assessment
            if s.score is None:
                percent, result_status = None, "Pending"       # not marked yet
            else:
                percent = round(s.score / a.total_marks * 100) if a.total_marks else 0
                result_status = "Passed" if s.score >= a.pass_marks else "Failed"
            results.append({"id": a.id, "title": a.title, "date": s.submitted_at,
                            "score": percent, "status": result_status})

        for a in missed:
            results.append({"id": a.id, "title": a.title, "date": a.end, "score": None, "status": "Missed"})

        scores = [r["score"] for r in results if r["score"] is not None]
        return Response({
            "upcoming": upcoming,
            "results": results,
            "stats": {
                "upcoming": len(upcoming),
                "completed": len(seen),
                "average_score": round(sum(scores) / len(scores)) if scores else None,
                "missed": len(missed),
            },
        })

    # GET /assessments/available : published assessments that have not closed yet
    @action(detail=False, methods=["get"])
    def available(self, request):
        now = timezone.now()
        qs = (
            self._plain_queryset()
            .filter(status=Assessment.Status.PUBLISHED)
            .filter(Q(end__isnull=True) | Q(end__gte=now))
        )

        # Hide exams this student has already submitted
        if request.user and request.user.is_authenticated:
            done = ExamAttempt.objects.filter(
                student=request.user, status=ExamAttempt.Status.SUBMITTED
            ).values_list("assessment_id", flat=True)
            qs = qs.exclude(id__in=list(done))

        qs = self._with_question_count(qs.order_by("start", "id"))
        return Response(StudentAssessmentSerializer(qs, many=True).data)

    # GET /assessments/<id>/exam : questions + how many seconds the student has
    @action(detail=True, methods=["get"])
    def exam(self, request, pk=None):
        assessment = self.get_object()
        now = timezone.now()

        if assessment.status != Assessment.Status.PUBLISHED:
            return Response({"detail": "This assessment is not published."}, status=status.HTTP_403_FORBIDDEN)
        if assessment.start and now < assessment.start:
            return Response({"detail": "This assessment has not opened yet."}, status=status.HTTP_403_FORBIDDEN)
        if assessment.end and now > assessment.end:
            return Response({"detail": "This assessment has closed."}, status=status.HTTP_403_FORBIDDEN)

        # The student gets the full duration, but never more time than is left before it closes.
        limit = assessment.duration * 60
        if assessment.end:
            limit = min(limit, int((assessment.end - now).total_seconds()))

        data = dict(ExamSerializer(assessment).data)
        data["limit_seconds"] = limit
        data["server_now"] = now
        return Response(data)

    # POST /assessments/<id>/submit : save the student's answers
    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        assessment = self.get_object()
        serializer = SubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        Submission.objects.create(
            assessment=assessment,
            student_id=d["studentId"],
            answers=d["answers"],
            auto_submitted=d["autoSubmitted"],
        )
        return Response({"submitted": True}, status=status.HTTP_201_CREATED)