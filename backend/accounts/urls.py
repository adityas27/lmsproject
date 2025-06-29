from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserDetailView, signup_view, update_profile, list_users, update_user_flags, submit_teacher_application, list_teacher_applications, update_application_status, list_students, toggle_ban_user
urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserDetailView.as_view(), name='user_detail'),
    path('signup/', signup_view, name='signup'),
    path('me/update/', update_profile, name='update-profile'),
    path('admin/users/', list_users, name='admin-user-list'),
    path('admin/users/<int:user_id>/update/', update_user_flags, name='admin-user-update'),
    path('teacher-application/submit/', submit_teacher_application, name='teacher-application-submit'),
    path('teacher-application/', list_teacher_applications, name='teacher-application-list'),
    path('teacher-application/<int:app_id>/status/', update_application_status, name='teacher-application-status'),
    path('admin/students/', list_students, name='student-list'),
    path('admin/students/<int:user_id>/ban-toggle/', toggle_ban_user, name='ban-student'),
]