from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets

from .models import QuestionBank
from .serializers import QuestionSerializer


class QuestionBankViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer

    def get_queryset(self):
        qs = QuestionBank.objects.all()
        course_id = self.request.query_params.get("courseId")
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs