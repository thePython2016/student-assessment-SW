from django.urls import path
from .views import RegisterView, LoginView, MeView, AdminOnlyView, StudentOnlyView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('me/', MeView.as_view()),
    path('admin-only/', AdminOnlyView.as_view()),
    path('student-only/', StudentOnlyView.as_view()),
]