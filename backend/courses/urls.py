from django.urls import path
from . import views

urlpatterns = [
    # Course
    path('courses/', views.course_list_create, name='course-list-create'),
    path('courses/<slug:slug>/', views.course_detail, name='course-detail'),
    # Module
    path('modules/', views.module_list_create_view, name='module-list-create'),
    path('modules/<slug:slug>/', views.module_detail_view, name='module-detail'),
    # Module Contents
    # path('contents/', views.module_content_list_create_view, name='content-list-create'),
    path('contents/<int:pk>/', views.module_content_detail_view, name='content-detail'),
    # Enrollment
    path('courses/<slug:slug>/enroll/', views.enroll_student, name='enroll-student'),
    # Content Progress
    path('content-progress/complete/', views.mark_content_completed, name='mark-content-completed'),
    # Course Progress
    path('courses/<slug:course_id>/progress/', views.course_progress, name='course-progress'),
    # User Dashboard
    path('dashboard/', views.user_dashboard_view, name='user-dashboard'),
    # Certificates
    path('certificates/apply/<slug:course_id>/', views.apply_for_certificate, name='apply-certificate'),
    path('certificates/approve/<int:cert_id>/', views.approve_certificate, name='approve-certificate'),
    path('certificates/reject/<int:cert_id>/', views.reject_certificate, name='reject-certificate'),
    path('certificates/pending/', views.pending_certificates_view, name='pending-certificates'),
]
