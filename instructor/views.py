from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Instructor
from .serializers import InstructorSerializer


class InstructorCreateView(APIView):

    def get(self, request):
        instructors = Instructor.objects.select_related("department").order_by("id")
        serializer = InstructorSerializer(instructors, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = InstructorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class InstructorDetailView(APIView):

    # def get(self, request, pk):
    #     instructor = get_object_or_404(
    #         Instructor.objects.select_related("department"), pk=pk
    #     )
        # return Response(InstructorSerializer(instructor).data)

    def put(self, request, pk):
        instructor = get_object_or_404(Instructor, pk=pk)
        serializer = InstructorSerializer(instructor, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        instructor = get_object_or_404(Instructor, pk=pk)
        instructor.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)