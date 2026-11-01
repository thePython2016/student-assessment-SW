from rest_framework.routers import DefaultRouter

from .views import QuestionBankViewSet

# trailing_slash=False so /question-bank works exactly as the Angular app calls it.
router = DefaultRouter(trailing_slash=False)
router.register("question-bank", QuestionBankViewSet, basename="question-bank")

urlpatterns = router.urls