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
    path('contents/', views.module_content_list_create_view, name='content-list-create'),
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
    # Assignments
    path('modules/<slug:module_id>/assignments/', views.assignment_list_create, name='assignment-list-create'),
    path('assignments/<int:assignment_id>/submit/', views.submit_assignment, name='assignment-submit'),
    path('assignments/<int:assignment_id>/submissions/', views.view_submissions, name='view-submissions'),
    path('submissions/<int:submission_id>/grade/', views.grade_submission, name='grade-submission'),
    # Tags and Categories Extras
    path('tags/', views.tag_list, name='tag-list'),
    path('categories/', views.category_list, name='category-list'),
    path('subcategories/', views.subcategory_list, name='subcategory-list'),
    path('categories/<slug:category_slug>/subcategories/', views.subcategories_by_category, name='subcategories-by-category'),
    # Ratings 
    path('<slug:slug>/feedback/', views.submit_feedback, name='course-feedback'),
    path('<slug:slug>/feedback/list/', views.course_feedback_list, name='course-feedback-list'),

]

