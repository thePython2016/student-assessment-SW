from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Department
from .serializers import DepartmentSerializer
from rest_framework import generics


class DepartmentCreateView(APIView):

# Post Operations
    def post(self, request):
        print("1. request.data (raw JSON from Angular):", request.data)

        serializer = DepartmentSerializer(data=request.data)

        if serializer.is_valid():
            # validated_data2= serializer.validated_data

            saved_department = serializer.save()
            print("4. saved object returned by create():", saved_department)

            print("5. serializer.data (object turned back into JSON):", serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        print("Validation failed:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# Get operations
    def get(self, request):
        departments = Department.objects.all().order_by("id")
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)

    # views.py (add below your existing view)


class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
