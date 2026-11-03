from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import DestroyAPIView, ListCreateAPIView
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import BasePermission, IsAuthenticated

from .models import Resource
from .serializers import ResourceSerializer


class IsAdminRole(BasePermission):
    """ADAPT: matches your User.role field. Staff users are allowed too."""

    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (u.is_staff or getattr(u, "role", None) == "admin"))


class ResourceListCreateView(ListCreateAPIView):
    """GET /resources/?course=3 (any logged-in user), POST /resources/ (admin only)."""
    serializer_class = ResourceSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        return [IsAuthenticated()] if self.request.method == "GET" else [IsAdminRole()]

    def get_queryset(self):
        qs = Resource.objects.select_related("course")
        course = self.request.query_params.get("course")
        if course and course.isdigit():
            qs = qs.filter(course_id=int(course))
        return qs

    def perform_create(self, serializer):
        f = serializer.validated_data["file"]
        ext = f.name.rsplit(".", 1)[-1].lower() if "." in f.name else ""
        serializer.save(uploaded_by=self.request.user, file_type=ext, size=f.size)


class ResourceDeleteView(DestroyAPIView):
    """DELETE /resources/<id>/ (admin only). Also removes the file from disk."""
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [IsAdminRole]

    def perform_destroy(self, instance):
        instance.file.delete(save=False)
        instance.delete()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_resource(request, pk):
    """GET /resources/<id>/download/ (any logged-in user). Forces a file save."""
    resource = get_object_or_404(Resource, pk=pk)
    try:
        handle = resource.file.open("rb")
    except (FileNotFoundError, ValueError):
        raise Http404("File is missing on the server.")
    return FileResponse(handle, as_attachment=True, filename=resource.filename)