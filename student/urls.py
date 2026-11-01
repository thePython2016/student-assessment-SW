from django.urls import path
from . import views
from .views import StudentCreateView
from .views import StudentCreateView, StudentDetailView

urlpatterns = [
    path("students/", StudentDetailView.as_view(), name="students-create"),
     path("students/<int:pk>/", StudentDetailView.as_view(), name="students-detail")
]