from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Course
from .serializers import CourseSerializer
from django.shortcuts import get_object_or_404
from django.db import connection
import pandas as pd


class CourseCreateView(APIView):

    def get(self, request):
        cursor=connection.cursor()
        sql="""
        select c.id,c.course_name,c.course_code,department_name,credits,first_name,last_name 
            from course_course c,department_department d,instructor_instructor i where c.instructor::bigint=i.id and  d.id=i.department_id
        """
        cursor.execute(sql)
        rows=cursor.fetchall()
        df=pd.DataFrame(rows)
        df.columns=[col[0] for col in cursor.description]
        data=df.to_dict(orient='records')
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
        # id = request.GET.get("pk")

        course=Course.objects.filter(id=pk)
        course.delete()
        
        
        return Response(status=status.HTTP_204_NO_CONTENT)