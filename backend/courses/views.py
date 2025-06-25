from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import Module, Course, ModuleContent, Enrollment, ContentProgress, Certificate, Assignment, AssignmentSubmission
from .serializers import ModuleSerializer, ModuleContentSerializer,CourseSerializer,PendingCertificateSerializer,  CertificateSerializer, DashboardSerializer, AssignmentSerializer, AssignmentSubmissionSerializer
from .utils.certificate_generator import generate_certificate_pdf
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
    """
    Handles GET and POST requests for courses.
    GET: Returns a list of all courses, filtered by published status if the user is not authenticated.
    POST: Creates a new course if the user is authenticated.
    If the user is authenticated, they can create a course.

    Args:
        request (Object): Django request object containing the data for the course creation.
    Returns:
        HTTP Response
    """
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
@permission_classes([IsAuthenticated])
def course_detail(request, slug):
    """
    Handles GET, PUT, PATCH, and DELETE requests for a specific course.
    GET: Retrieve course details, including certificate if exists. 
    PUT/PATCH: Update course details if the user is the author.
    DELETE: Delete the course if the user is the author.
    Args:
        request (Object): Django request object containing the data for the course.
        slug (Slug): course slug

    Returns:
        HTTP Response
    """
    course = get_object_or_404(Course, slug=slug)
    if request.method == 'GET':
        serializer = CourseSerializer(course, context={'request': request})
        data = serializer.data
        try:
            certificate = Certificate.objects.get(student=request.user, course=course)
            cert_serializer = CertificateSerializer(certificate, context={'request': request})
            data['certificate'] = cert_serializer.data
        except Certificate.DoesNotExist:
            data['certificate'] = None
        return Response(data)

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
    """
    Handles GET and POST requests for modules.
    GET: Returns a list of all modules.
    POST: Creates a new module if the user is the author of the course.

    Args:
        request (Object): Django request object containing the data for the module creation.

    Returns:
        HTTP Response
    """
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

    """
    Handles GET, PUT, PATCH, and DELETE requests for a specific module.
    GET: Retrieve module details.
    PUT/PATCH: Update module details.
    DELETE: Delete the module.
    """
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
    """
    Has no significane yet, but will be used in future.
    Handles GET and POST requests for module contents.
    GET: Returns a list of contents for a specific module.  
    POST: Creates a new module content if the user is the author of the course related to the module.
    Handles the details page for a specific module. Will send Graded Assignments and Module Contents for GET requests. along side pre requisites and other details.
    
    Args:
        request (Object): Django request object containing the data for the module content creation.
    Returns:
        HTTP Response
    """
    if request.method == 'GET':
        module_slug = request.query_params.get('module_slug')
        if not module_slug:
            return Response({'detail': 'Module slug is required.'}, status=400)

        try:
            module = Module.objects.get(slug=module_slug)
        except Module.DoesNotExist:
            return Response({'detail': 'Module not found.'}, status=404)

        # Only enrolled students or author can view
        is_enrolled = module.course.students_enrolled.filter(id=request.user.id).exists()
        is_author = module.course.author == request.user

        if not (is_enrolled or is_author):
            return Response({'detail': 'You are not authorized to view this module.'}, status=403)

        contents = ModuleContent.objects.filter(module=module)
        assignments = Assignment.objects.filter(module=module)

        content_data = ModuleContentSerializer(contents, many=True, context={'request': request}).data
        assignment_data = AssignmentSerializer(assignments, many=True, context={'request': request}).data

        combined = sorted(content_data + assignment_data, key=lambda x: x.get('created_at', ''))
        print(combined)
        return Response(combined)

    elif request.method == 'POST':
        # Extract module slug/id from request.data to check author permission
        module_slug = request.data.get('module')
 
        if not module_slug:
            return Response({'module': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)

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
    """
    Handles GET, PUT, PATCH, and DELETE requests for a specific module content.
    GET: Retrieve module content details.
    PUT/PATCH: Update module content details if the user is the author. # Not yet implemented in frontend.
    DELETE: Delete the module content if the user is the author. # Not yet implemented in frontend.

    Args:
        request (object): Django request object containing the data for the module content.
        pk (int): ID of the module content to retrieve or modify.

    Returns:
        HTTP Response
    """
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
    """
    Handles enrollment of a student in a course.
    Args:
        request (object): Django request object containing the data for enrollment.
        slug (str): Slug of the course to enroll in.
    Returns:
        HTTP Response
    """
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
    """
    Handles marking a module content as completed by a student.
    This endpoint expects `content_id` and `course_id` in the request data.
    Args:
        request (object): Django request object containing the data for marking content as completed.

    Returns:
        HTTP Response
    """
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
    print(data['certificates'])
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_for_certificate(request, course_id):
    course = Course.objects.get(slug=course_id)
    cert, created = Certificate.objects.get_or_create(student=request.user, course=course)
    if cert.status == 'approved':
        return Response({"res": "Certificate already approved."})
    if cert.status == 'rejected':
        cert.status = 'pending'
        cert.applied_at = timezone.now()
        cert.save()
        return Response({"res": "Certificate application was rejected, now its updated to pending approval."})
    student_name = cert.student.first_name + cert.student.last_name 
    course_title = cert.course.name
    if course.auto_certificate:
        cert.status = 'approved'
        pdf_path = generate_certificate_pdf(student_name, course_title, cert.id)
        cert.pdf_file = pdf_path
        cert.save()

    serializer = CertificateSerializer(cert)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_certificate(request, cert_id):
    cert = Certificate.objects.get(id=cert_id)
    student_name = cert.student.first_name + cert.student.last_name 
    course_title = cert.course.name

    if request.user != cert.course.author:
        return Response({"error": "Unauthorized"}, status=403)
    cert.status = 'approved'
    cert.issued_at = timezone.now()
    pdf_path = generate_certificate_pdf(student_name, course_title, cert.id)
    cert.pdf_file = pdf_path
    cert.save()
    return Response({"success": "Certificate approved."})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_certificates_view(request):
    user = request.user
    certificates = Certificate.objects.filter(
        course__author=user,
    ).select_related('student', 'course')

    serializer = PendingCertificateSerializer(certificates, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_certificate(request, cert_id):
    cert = Certificate.objects.get(pk=cert_id, course__author=request.user)
    cert.status = 'rejected'
    cert.save()
    return Response({'detail': 'Certificate rejected'}, status=200)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def assignment_list_create(request, module_id):
    if request.method == 'GET':
        assignments = Assignment.objects.filter(module__slug=module_id)
        serializer = AssignmentSerializer(assignments, many=True, context={'request': request})
        print("Assignments for module:", module_id, "are", serializer.data)
        return Response(serializer.data)

    elif request.method == 'POST':
        try:
            print("tried", module_id)
            module = Module.objects.get(slug=module_id)
        except Module.DoesNotExist:
            return Response({"detail": "Module not found."}, status=404)

        serializer = AssignmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(module=module)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_assignment(request, assignment_id):
    try:
        assignment = Assignment.objects.get(id=assignment_id)
    except Assignment.DoesNotExist:
        return Response({'detail': 'Assignment not found.'}, status=404)

    ## Check if the user is enrolled in the course of the assignment's module
    if not Enrollment.objects.filter(student=request.user, course=assignment.module.course).exists():
        return Response({'detail': 'You are not enrolled in this course.'}, status=403)
    
    # Check if the assignment is already submitted by the user
    if AssignmentSubmission.objects.filter(student=request.user, assignment=assignment).exists():
        return Response({'detail': 'You have already submitted this assignment.'}, status=400)

    serializer = AssignmentSubmissionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(student=request.user, assignment=assignment)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_submissions(request, assignment_id):
    submissions = AssignmentSubmission.objects.filter(assignment__id=assignment_id)
    serializer = AssignmentSubmissionSerializer(submissions, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def grade_submission(request, submission_id):
    try:
        submission = AssignmentSubmission.objects.get(id=submission_id)
    except AssignmentSubmission.DoesNotExist:
        return Response({'detail': 'Submission not found.'}, status=404)

    if submission.assignment.module.course.author != request.user:
        return Response({'detail': 'Not authorized to grade this submission.'}, status=403)

    serializer = AssignmentSubmissionSerializer(submission, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)