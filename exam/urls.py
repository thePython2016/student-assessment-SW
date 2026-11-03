from django.urls import path
from .insights import InsightsView
from exam.admin_views import StudentSearchView, StudentResultsView, PredictionView

from .views import ExamResultsListView, ExamResultView, ExamStartView, ExamSubmitView

urlpatterns = [
    path("results", ExamResultsListView.as_view()),
    path("<int:pk>/start", ExamStartView.as_view()),
    path("<int:pk>/submit", ExamSubmitView.as_view()),
    path("<int:pk>/result", ExamResultView.as_view()),
    path("insights/", InsightsView.as_view(), name="exam-insights"),
      path('prediction', PredictionView.as_view()),
    
    
]