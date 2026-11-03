from django.urls import path
from rest_framework.routers import DefaultRouter

from .attempt_views import exam_questions, submit_exam, submission_detail
from .views import AssessmentViewSet

# trailing_slash=False so /assessments matches the Angular call.
router = DefaultRouter(trailing_slash=False)
router.register("assessments", AssessmentViewSet, basename="assessment")

urlpatterns = [
    path("assessments/<int:pk>/questions", exam_questions),
    path("assessments/<int:pk>/submit", submit_exam),
    path("submissions/<int:pk>", submission_detail),
]

urlpatterns += router.urls