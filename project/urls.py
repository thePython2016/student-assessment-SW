from django.contrib import admin

from django.conf import settings
from exam.admin_views import StudentSearchView, StudentResultsView
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/account/', include('account.urls')),
    path('', include('student.urls')),
    path('', include('course.urls')),
    path('', include('department.urls')),
    path('', include('questions.urls')),
    path('', include('assessment.urls')),
    path('', include('instructor.urls')),
    path('exam/', include('exam.urls')),
    path('resources/', include('resources.urls')),
    path('exam/', include('exam.urls')),
    path('students', StudentSearchView.as_view()),
path('exam/results/student/<int:student_id>', StudentResultsView.as_view()),
    path('exam/results/student/<int:student_id>', StudentResultsView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)