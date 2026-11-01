from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Student
from .serializers import StudentSerializer
from django.shortcuts import get_object_or_404


class StudentCreateView(APIView):

    def get(self, request):
        student=Student.objects.all()
        data=[]
        for s in student:
                data.append({
          
                "id":s.id,
                "first_name":s.first_name,
                "last_name":s.last_name,
                "email":s.email,
                "phone":s.phone,
                "adddress":s.address,
                "date_of_birth":s.date_of_birth,
                "gender":s.gender,
                "course":s.course,

                }
                )
        return Response(data)

class StudentDetailView(APIView):

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
        # student = get_object_or_404(Student, pk=pk)
        student=Student.objects.filter(id=pk)
        student.delete()
        return Response()
    
    def post(self, request):
        serializer = StudentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"Success":"Data added"})