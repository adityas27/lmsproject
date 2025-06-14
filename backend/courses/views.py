from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Course
from .serializers import CourseSerializer
from django.shortcuts import get_object_or_404
from .models import Module, ModuleContent, Enrollment, ContentProgress, Certificate
from .serializers import ModuleSerializer, ModuleContentSerializer, ContentProgressSerializer, CertificateSerializer, DashboardSerializer
from django.utils.timezone import now
from django.utils import timezone

# Helper function to check if the user is the author of the course and if they are enrolled in the course
def user_is_author(user, module_content):
    # Check if user is the author of the course the module_content belongs to
    return module_content.module.course.author == user

def user_is_enrolled(user, module_content):
    # Check if user is enrolled in the course
    course = module_content.module.course
    return user in course.students_enrolled.all()



@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def course_list_create(request):
    if request.method == 'GET':
        courses = Course.objects.all()
        if not request.user.is_authenticated:
            courses = courses.filter(is_published=True)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CourseSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def course_detail(request, slug):
    course = get_object_or_404(Course, slug=slug)

    if request.method == 'GET':
        serializer = CourseSerializer(course, context={'request': request})
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        if course.author != request.user:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CourseSerializer(course, data=request.data, partial=(request.method == 'PATCH'), context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if course.author != request.user:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
def module_list_create_view(request):
    course_slug = request.data.get('course')
    course = get_object_or_404(Course, slug=course_slug)

    if request.method == 'GET':
        modules = Module.objects.all()
        serializer = ModuleSerializer(modules, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST' and request.user == course.author:
        course_slug = request.data.get('course')
        course = get_object_or_404(Course, slug=course_slug)


        serializer = ModuleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(course=course)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    else:
        return Response({'detail': 'Not authorized to create module.'}, status=status.HTTP_403_FORBIDDEN)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def module_detail_view(request, slug):
    module = get_object_or_404(Module, slug=slug)

    if request.method == 'GET':
        serializer = ModuleSerializer(module)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        serializer = ModuleSerializer(module, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        module.delete()
        return Response({'message': 'Module deleted'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def module_content_list_create_view(request):
    if request.method == 'GET':
        module = Module.objects.get(slug=module_slug)
        print(module.course.author)
        # Same as before: only enrolled students can view module contents
        contents = ModuleContent.objects.filter(module__course__students_enrolled=request.user)
        serializer = ModuleContentSerializer(contents, many=True, context={'request': request})                                                                                     
        return Response(serializer.data)

    elif request.method == 'POST':
        # Extract module slug/id from request.data to check author permission
        module_slug = request.data.get('module')
 
        if not module_slug:
            return Response({'module': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        from .models import Module  # make sure imported

        try:
            module = Module.objects.get(slug=module_slug)
        except Module.DoesNotExist:
            return Response({'module': 'Module not found.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the request user is the author of the course related to the module
        if module.course.author != request.user:
            return Response({'detail': 'Only the author of the course can add module content.'}, status=status.HTTP_403_FORBIDDEN)

        # If passed, proceed to create
        serializer = ModuleContentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def module_content_detail_view(request, pk):
    content = get_object_or_404(ModuleContent, pk=pk)

    if request.method == 'GET':
        # Only enrolled students can view
        if not user_is_enrolled(request.user, content):
            return Response({'detail': 'You are not enrolled in this course.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ModuleContentSerializer(content, context={'request': request})
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        # Only author can update
        if not user_is_author(request.user, content):
            return Response({'detail': 'Only the author can edit content.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = ModuleContentSerializer(content, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        # Only author can delete
        if not user_is_author(request.user, content):
            return Response({'detail': 'Only the author can delete content.'}, status=status.HTTP_403_FORBIDDEN)
        content.delete()
        return Response({'message': 'Content deleted'}, status=status.HTTP_204_NO_CONTENT)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_student(request, slug):
    try:
        course = Course.objects.get(slug=slug)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    if Enrollment.objects.filter(student=request.user, course=course).exists():
        return Response({'message': 'Already enrolled'}, status=400)

    Enrollment.objects.create(student=request.user, course=course)
    return Response({'message': 'Enrolled successfully'}, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_content_completed(request):
    user = request.user
    content_id = request.data.get('content_id')
    course_id = request.data.get('course_id')

    if not content_id or not course_id:
        return Response({'error': 'Missing content_id or course_id'}, status=400)

    try:
        content = ModuleContent.objects.get(id=content_id)
        course = Course.objects.get(slug=course_id)
    except (ModuleContent.DoesNotExist, Course.DoesNotExist):
        return Response({'error': 'Invalid content or course'}, status=404)

    obj, created = ContentProgress.objects.get_or_create(
        student=user, content=content, course=course
    )
    if not obj.is_completed:
        obj.is_completed = True
        obj.save()

    return Response({'success': True})


# views.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_progress(request, course_id):
    try:
        course = Course.objects.get(slug=course_id)
    except Course.DoesNotExist:
        return Response({"detail": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

    total_contents = ModuleContent.objects.filter(module__course=course).count()
    completed = ContentProgress.objects.filter(student=request.user, course=course, is_completed=True).count()
    is_enrolled = Enrollment.objects.filter(student=request.user, course=course).exists()
    progress = int((completed / total_contents) * 100) if total_contents > 0 else 0

    return Response({"progress": progress, "is_enrolled":is_enrolled}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard_view(request):
    user = request.user
    user_certificates = Certificate.objects.filter(student=user)
    serializer = DashboardSerializer(user, context={'request': request})
    data = serializer.data
    data['certificates'] = CertificateSerializer(user_certificates, many=True).data
    return Response(data)
