from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Student
from .serializers import StudentSerializer


class StudentCreateView(APIView):
    """students/  ->  list (GET) + create (POST)"""

    def get(self, request):
        data = []
        for s in Student.objects.all():
            data.append({
                "id": s.id,
                "first_name": s.first_name,
                "last_name": s.last_name,
                "email": s.email,
                "phone": s.phone,
                "address": s.address,
                "date_of_birth": s.date_of_birth,
                "gender": s.gender,
                # works whether course is a text field or a ForeignKey
                "course": getattr(s.course, "course_name", s.course),
            })
        return Response(data)

    def post(self, request):
        serializer = StudentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"Success": "Data added"}, status=status.HTTP_201_CREATED)


class StudentDetailView(APIView):
    """students/<pk>/  ->  get one, update, delete"""

    def get(self, request, pk):
        student = get_object_or_404(Student, pk=pk)
        return Response(StudentSerializer(student).data)

    def put(self, request, pk):
        student = get_object_or_404(Student, pk=pk)
        serializer = StudentSerializer(student, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        student = get_object_or_404(Student, pk=pk)
        student.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)