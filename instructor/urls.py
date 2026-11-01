from django.urls import path
from .views import InstructorCreateView
from .views import InstructorCreateView, InstructorDetailView

urlpatterns = [
    path("instructor/", InstructorCreateView.as_view(), name="instructor-list-create"),
    # path("instructor/<int:pk>/", InstructorDetailView.as_view(), name="instructor-detail"),
    path("instructor/<int:pk>/", InstructorDetailView.as_view(), name="instructor-detail"),
]


