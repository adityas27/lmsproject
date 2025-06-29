from django.urls import path
from .views import (
    list_users,
    update_user_flags,
    submit_teacher_application,
    list_teacher_applications,
    update_application_status,
    toggle_ban_user,
    list_students,
    list_all_courses_for_admin,
    toggle_course_visibility
)

urlpatterns = [
    # Admin URLs
    path('', list_users, name='admin-user-list'),
    path('users/<int:user_id>/update/', update_user_flags, name='admin-user-update'),
    
    # Teacher Application URLs
    path('teacher-application/submit/', submit_teacher_application, name='teacher-application-submit'),
    path('teacher-application/', list_teacher_applications, name='teacher-application-list'),
    path('teacher-application/<int:app_id>/status/', update_application_status, name='teacher-application-status'),
    
    # Student Management URLs
    path('students/', list_students, name='student-list'),
    path('students/<int:user_id>/ban-toggle/', toggle_ban_user, name='ban-student'),
    
    # Course Management URLs
    path('courses/<slug:course_id>/toggle-visibility/', toggle_course_visibility, name='admin-course-toggle'),
    path('courses/', list_all_courses_for_admin, name='admin-course-list'),
]
