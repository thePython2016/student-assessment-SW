from django.urls import path
from .views import StudentCreateView, StudentDetailView

urlpatterns = [
    path('students/', StudentCreateView.as_view()),
    path('students/<int:pk>/', StudentDetailView.as_view()),
]