from django.db import connection
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Course
from .serializers import CourseSerializer


class CourseCreateView(APIView):

    def get(self, request):
        # LEFT JOINs keep courses even when the instructor or department is missing.
        # The regex check stops a non-numeric `instructor` value from crashing the ::bigint cast.
        sql = """
            SELECT c.id,
                   c.course_name,
                   c.course_code,
                   d.department_name,
                   c.credits,
                   i.first_name,
                   i.last_name
            FROM course_course c
            LEFT JOIN instructor_instructor i
                   ON i.id = CASE WHEN c.instructor ~ '^[0-9]+$'
                                  THEN c.instructor::bigint END
            LEFT JOIN department_department d
                   ON d.id = i.department_id
            ORDER BY c.id
        """
        with connection.cursor() as cursor:
            cursor.execute(sql)
            columns = [col[0] for col in cursor.description]
            data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return Response(data)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CourseDetailView(APIView):

    def get(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        return Response(CourseSerializer(course).data)

    def put(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        serializer = CourseSerializer(course, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        Course.objects.filter(id=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)