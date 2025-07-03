from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserAdminSerializer, TeacherApplicationSerializer, StudentInfoSerializer
from .models import TeacherApplication
from accounts.models import CustomUser
from accounts.permissions import IsAdminOrSemiAdmin
from django.shortcuts import get_object_or_404
from courses.models import Course
from administration.serializers import CourseAdminSerializer
# Create your views here.
@api_view(['GET'])
@permission_classes([IsAdminOrSemiAdmin])
def list_users(request):
    users = CustomUser.objects.all()
    serializer = UserAdminSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAdminOrSemiAdmin])
def update_user_flags(request, user_id):
    user = get_object_or_404(CustomUser, id=user_id)
    data = request.data.copy()

    # Prevent semi-admins from changing is_semi_admin
    if not request.user.is_superuser and 'is_semi_admin' in data:
        data.pop('is_semi_admin')

    serializer = UserAdminSerializer(user, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_teacher_application(request):
    if TeacherApplication.objects.filter(user=request.user).exists():
        return Response({"detail": "Application already submitted."}, status=status.HTTP_400_BAD_REQUEST)
    
    data = request.data.copy()
    data['user'] = request.user.id
    serializer = TeacherApplicationSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAdminOrSemiAdmin])
def list_teacher_applications(request):
    applications = TeacherApplication.objects.all().order_by('-submitted_at')
    serializer = TeacherApplicationSerializer(applications, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAdminOrSemiAdmin])
def update_application_status(request, app_id):
    application = get_object_or_404(TeacherApplication, id=app_id)
    user = get_object_or_404(CustomUser, id=application.user.id)
    new_status = request.data.get('status')

    if new_status not in ['approved', 'rejected', 'on_hold', 'pending']:
        return Response({'detail': 'Invalid status value.'}, status=status.HTTP_400_BAD_REQUEST)

    application.status = new_status
    application.save()
    user.is_teacher = True
    user.save()
    serializer = TeacherApplicationSerializer(application)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminOrSemiAdmin])
def list_students(request):
    students = CustomUser.objects.filter(is_teacher=False)
    serializer = StudentInfoSerializer(students, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAdminOrSemiAdmin])
def toggle_ban_user(request, user_id):
    user = get_object_or_404(CustomUser, id=user_id)
    if user.is_superuser or user.is_semi_admin:
        return Response({'detail': "Cannot ban an admin user."}, status=status.HTTP_403_FORBIDDEN)
    
    user.is_banned = not user.is_banned
    user.save()
    return Response({'id': user.id, 'is_banned': user.is_banned})


@api_view(['GET'])
@permission_classes([IsAdminOrSemiAdmin])
def list_all_courses_for_admin(request):
    courses = Course.objects.select_related('author').all()
    serializer = CourseAdminSerializer(courses, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAdminOrSemiAdmin])
def toggle_course_visibility(request, course_id):
    course = get_object_or_404(Course, slug=course_id)
    course.is_visible = not course.is_visible
    course.save()
    return Response({
        'id': course.slug,
        'title': course.name,
        'is_visible': course.is_visible
    })