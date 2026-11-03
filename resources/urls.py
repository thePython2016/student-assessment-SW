from django.urls import path
from .views import ResourceListCreateView, ResourceDeleteView, download_resource

urlpatterns = [
    path("", ResourceListCreateView.as_view(), name="resource-list"),
    path("<int:pk>/", ResourceDeleteView.as_view(), name="resource-delete"),
    path("<int:pk>/download/", download_resource, name="resource-download"),
]