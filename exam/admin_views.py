"""
Admin endpoints for the Student Performance page.
Save as backend/exam/admin_views.py  (same folder as exam/models.py).

project/urls.py (or exam/urls.py):
    from exam.admin_views import StudentSearchView, StudentResultsView, PredictionView
    path('prediction', PredictionView.as_view()),
    path('students', StudentSearchView.as_view()),
    path('exam/results/student/<int:student_id>', StudentResultsView.as_view()),
"""
from django.contrib.auth import get_user_model
from django.db.models import Avg, Q
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from exam.models import ExamAttempt
from student.models import Student

User = get_user_model()


class IsAdminRole(BasePermission):
    """Only users whose role is 'admin' (Django superusers also pass)."""
    message = 'Only admins can view this.'

    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (u.role == 'admin' or u.is_superuser))


def _course_name(course):
    if course is None:
        return ''
    return getattr(course, 'name', None) or getattr(course, 'title', None) or str(course)


class StudentSearchView(APIView):
    """GET /students?search=<email, username or name>"""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        q = request.query_params.get('search', '').strip()
        users = User.objects.filter(role='student')
        if q:
            users = users.filter(
                Q(email__icontains=q) | Q(username__icontains=q)
                | Q(first_name__icontains=q) | Q(last_name__icontains=q)
            )
        users = list(users.order_by('username')[:20])

        # The course lives on the Student profile, matched by email.
        courses = dict(Student.objects.filter(email__in=[u.email for u in users])
                       .values_list('email', 'course'))

        return Response([{
            'id': u.id,
            'name': u.get_full_name() or u.username,
            'username': u.username,
            'email': u.email,
            'department': '',
            'course': courses.get(u.email, ''),
        } for u in users])


class StudentResultsView(APIView):
    """GET /exam/results/student/<user id>  -> one row per attempt, admins see every score."""
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, student_id):
        attempts = (ExamAttempt.objects
                    .filter(student_id=student_id)
                    .select_related('assessment', 'assessment__course')
                    .order_by('-started_at'))

        # Class average per assessment (percent), from submitted attempts only.
        class_avg = {
            r['assessment_id']: r['avg']
            for r in ExamAttempt.objects.filter(status=ExamAttempt.Status.SUBMITTED)
            .values('assessment_id').annotate(avg=Avg('score'))
        }

        rows = []
        for at in attempts:
            a = at.assessment
            submitted = at.status == ExamAttempt.Status.SUBMITTED
            avg = class_avg.get(a.id)
            rows.append({
                'assessment_id': a.id,
                'title': a.title,
                'course_name': _course_name(a.course),
                'submitted_at': at.submitted_at.isoformat() if at.submitted_at else None,
                'released': submitted,
                'score': float(at.score) if submitted else None,
                'total_marks': a.total_marks,
                'pass_marks': a.pass_marks,
                'class_avg': round(float(avg) / a.total_marks * 100) if avg is not None and a.total_marks else None,
            })
        return Response(rows)


class PredictionView(APIView):
    """GET /prediction -> one risk row for every student who has submitted at least one exam."""
    permission_classes = [IsAuthenticated, IsAdminRole]

    PASS_PERCENT = 50

    @staticmethod
    def _avg(values):
        return round(sum(values) / len(values)) if values else 0

    def get(self, request):
        students = list(User.objects.filter(role='student'))
        courses = dict(Student.objects.filter(email__in=[u.email for u in students])
                       .values_list('email', 'course'))

        by_student = {}
        qs = (ExamAttempt.objects.select_related('assessment')
              .filter(student__in=students).order_by('submitted_at', 'started_at'))
        for at in qs:
            by_student.setdefault(at.student_id, []).append(at)

        out = []
        for u in students:
            attempts = by_student.get(u.id, [])
            done = [a for a in attempts if a.status == ExamAttempt.Status.SUBMITTED]
            if not done:
                continue                      # nothing to predict from yet
            missed = len(attempts) - len(done)

            pct = [round(float(a.score) / a.assessment.total_marks * 100)
                   if a.assessment.total_marks else 0 for a in done]
            failed = [a for a in done if float(a.score) < a.assessment.pass_marks]
            avg = self._avg(pct)
            trend = (self._avg(pct[-3:]) - self._avg(pct[:-3])) if len(pct) > 3 else 0

            fail_rate = len(failed) / len(done)
            miss_rate = missed / len(attempts)
            probability = min(100, round(fail_rate * 60 + miss_rate * 30
                                         + max(0, self.PASS_PERCENT + 20 - avg) * 0.5))
            risk = 'High' if probability >= 70 else 'Medium' if probability >= 40 else 'Low'

            reasons, actions = [], []
            if avg < self.PASS_PERCENT:
                reasons.append(f'Average score is {avg}%')
                actions.append('Arrange a meeting with the instructor')
            if trend <= -5:
                reasons.append(f'Scores dropped {abs(trend)} points recently')
                actions.append('Check in on workload and recent topics')
            if failed:
                reasons.append(f'Failed {len(failed)} of {len(done)} assessments')
                actions.append('Assign practice quizzes on the failed topics')
            if missed:
                reasons.append(f'Started but did not submit {missed} assessment{"s" if missed > 1 else ""}')
                actions.append('Send a reminder about deadlines')
            if not reasons:
                reasons, actions = ['No risk factors found'], ['No action needed']

            out.append({
                'id': u.id,
                'name': u.get_full_name() or u.username,
                'department': '',
                'course': courses.get(u.email, ''),
                'avgScore': avg,
                'trend': trend,
                'attempted': len(done),
                'missed': missed,
                'predicted': 'Fail' if probability >= 50 else 'Pass',
                'probability': probability,
                'risk': risk,
                'reasons': reasons,
                'actions': actions,
            })
        return Response(out)