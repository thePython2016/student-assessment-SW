"""
Staff endpoints for the Student Performance page. Put this in your `exam` app as admin_views.py.

Assumed models (rename to match yours, the lines marked ADJUST are the only ones that touch them):
  account.User       role ('admin' / 'student'), username, email, first_name, last_name
  exam.Submission    student (FK User), assessment (FK), score, submitted_at, released
  assessment.Assessment  title, course (FK, has .name), total_marks, pass_marks

urls.py:
  from .admin_views import StudentSearchView, StudentResultsView
  path('students', StudentSearchView.as_view()),
  path('exam/results/student/<int:student_id>', StudentResultsView.as_view()),
"""
from django.contrib.auth import get_user_model
from django.db.models import Avg, Q
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from exam.models import Submission            # ADJUST

User = get_user_model()


class IsAdminRole(BasePermission):
    """Only users whose `role` field is 'admin' (Django superusers also pass)."""
    message = 'Only admins can view this.'

    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (getattr(u, 'role', None) == 'admin' or u.is_superuser))


class StudentSearchView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        q = request.query_params.get('search', '').strip()
        students = User.objects.filter(role='student')
        if q:
            students = students.filter(
                Q(email__icontains=q) | Q(username__icontains=q)
                | Q(first_name__icontains=q) | Q(last_name__icontains=q)
            )
        data = [{
            'id': s.id,
            'name': (s.get_full_name() or s.username),
            'username': s.username,
            'email': s.email,
            'department': getattr(getattr(s, 'department', None), 'name', '') or '',   # ADJUST
            'course': getattr(getattr(s, 'course', None), 'name', '') or '',           # ADJUST
        } for s in students.order_by('username')[:20]]
        return Response(data)


class StudentResultsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, student_id):
        subs = (Submission.objects
                .filter(student_id=student_id)                       # ADJUST field name
                .select_related('assessment', 'assessment__course')  # ADJUST
                .order_by('-submitted_at'))

        # Average score per assessment, as a percent, across the whole class.
        class_avg = {
            row['assessment_id']: row['avg']
            for row in Submission.objects.filter(released=True)
            .values('assessment_id').annotate(avg=Avg('score'))
        }

        rows = []
        for s in subs:
            a = s.assessment
            avg = class_avg.get(a.id)
            rows.append({
                'assessment_id': a.id,
                'title': a.title,
                'course_name': getattr(a.course, 'name', ''),
                'submitted_at': s.submitted_at.isoformat() if s.submitted_at else None,
                'released': s.released,
                'score': s.score if s.released else None,
                'total_marks': a.total_marks,
                'pass_marks': getattr(a, 'pass_marks', None),
                'class_avg': round(avg / a.total_marks * 100) if avg is not None and a.total_marks else None,
            })
        return Response(rows)