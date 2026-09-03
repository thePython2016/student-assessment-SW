from django.urls import path
from . import views

urlpatterns = [
    path('student/<str:token>/', views.student, name='student-registration'),
]