from django.urls import path
from .views import CourseCreateView
from .views import CourseCreateView, CourseDetailView

urlpatterns = [
    path("course/", CourseCreateView.as_view(), name="course-create"),
    path("course/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
]