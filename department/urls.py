from . import views
from django.urls import path
from .views import DepartmentCreateView
from .views import DepartmentDetailView


urlpatterns = [
    path("department/", DepartmentCreateView.as_view(), name="department-create"),
    path("department-list/", DepartmentCreateView.as_view(), name="department-create"),
    path("department/<int:pk>/", DepartmentDetailView.as_view(), name="department-detail"),
]