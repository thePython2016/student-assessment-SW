from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from account.permissions import IsStudentRole
from assessment.models import Assessment  # ADAPT

from .models import ExamAttempt
from .services import exam_questions, grade, is_late, seconds_left


class ExamStartView(APIView):
    """GET: starts the attempt on first call, resumes it on later calls."""
    permission_classes = [IsAuthenticated, IsStudentRole]

    def get(self, request, pk):
        assessment = get_object_or_404(Assessment, pk=pk)

        now = timezone.now()
        if assessment.status != Assessment.Status.PUBLISHED:
            return Response({"detail": "This assessment is not published."}, status=403)
        if assessment.start and now < assessment.start:
            return Response({"detail": "This assessment has not opened yet."}, status=403)
        if assessment.end and assessment.end < now:
            return Response({"detail": "This assessment has closed."}, status=403)

        attempt, created = ExamAttempt.objects.get_or_create(
            assessment=assessment, student=request.user
        )
        if attempt.status == ExamAttempt.Status.SUBMITTED:
            return Response({"detail": "You have already submitted this assessment."}, status=403)

        left = seconds_left(attempt)
        if left <= 0:
            return Response({"detail": "Your time for this assessment has ended."}, status=403)

        questions = [
            {
                "id": q.id,
                "text": q.text,
                "type": q.type,
                "marks": q.marks,
                "options": q.options or [],
                # correct_answer is never sent to the browser
            }
            for q in exam_questions(assessment)
        ]

        return Response({
            "id": assessment.id,
            "title": assessment.title,
            "description": assessment.description,
            "duration": assessment.duration,
            "end": assessment.end,
            "total_marks": assessment.total_marks,
            "negative_marking": assessment.negative_marking,
            "shuffle_questions": assessment.shuffle_questions,
            "auto_submit": assessment.auto_submit,
            "limit_seconds": left,      # time remaining, decided by the server
            "resumed": not created,
            "questions": questions,
        })


class ExamSubmitView(APIView):
    permission_classes = [IsAuthenticated, IsStudentRole]

    @transaction.atomic
    def post(self, request, pk):
        attempt = (
            ExamAttempt.objects.select_for_update()
            .filter(assessment_id=pk, student=request.user)
            .first()
        )
        if not attempt:
            return Response({"detail": "You have not started this exam."}, status=400)
        if attempt.status == ExamAttempt.Status.SUBMITTED:
            return Response({"detail": "Already submitted."}, status=400)
        if is_late(attempt):
            return Response({"detail": "Time is over. Submission rejected."}, status=403)

        answers = request.data.get("answers", {}) or {}

        attempt.answers = answers
        attempt.score = grade(attempt.assessment, answers)
        attempt.auto_submitted = bool(request.data.get("autoSubmitted", False))
        attempt.status = ExamAttempt.Status.SUBMITTED
        attempt.submitted_at = timezone.now()
        attempt.save()

        return Response({"message": "Submitted"})


class ExamResultView(APIView):
    """GET: the student's own result after submitting."""
    permission_classes = [IsAuthenticated, IsStudentRole]

    def get(self, request, pk):
        attempt = get_object_or_404(
            ExamAttempt, assessment_id=pk, student=request.user,
            status=ExamAttempt.Status.SUBMITTED,
        )
        return Response({
            "score": attempt.score,
            "total_marks": attempt.assessment.total_marks,
            "submitted_at": attempt.submitted_at,
            "auto_submitted": attempt.auto_submitted,
        })


class ExamResultsListView(APIView):
    """GET: all of the student's submitted attempts, with scores only when released."""
    permission_classes = [IsAuthenticated, IsStudentRole]

    @staticmethod
    def _released(assessment, now):
        visibility = getattr(assessment, "result_visibility", "Immediately")
        if visibility == "Immediately":
            return True
        if visibility == "After the deadline":
            return bool(assessment.end and assessment.end < now)
        return False  # "Hidden until released"

    def get(self, request):
        now = timezone.now()
        attempts = (
            ExamAttempt.objects
            .filter(student=request.user, status=ExamAttempt.Status.SUBMITTED)
            .select_related("assessment")
            .order_by("-submitted_at")
        )

        data = []
        for a in attempts:
            asm = a.assessment
            released = self._released(asm, now)
            data.append({
                "id": asm.id,
                "title": asm.title,
                "submitted_at": a.submitted_at,
                "auto_submitted": a.auto_submitted,
                "total_marks": asm.total_marks,
                "pass_marks": getattr(asm, "pass_marks", None),
                "released": released,
                "score": float(a.score) if released else None,
            })
        return Response(data)