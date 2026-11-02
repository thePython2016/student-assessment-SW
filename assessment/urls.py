from rest_framework.routers import DefaultRouter

from .views import AssessmentViewSet

# trailing_slash=False so /assessments matches the Angular call.
router = DefaultRouter(trailing_slash=False)
router.register("assessments", AssessmentViewSet, basename="assessment")

urlpatterns = router.urls