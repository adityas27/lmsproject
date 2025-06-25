from rest_framework import serializers
from .models import Course, Module, ModuleContent, Enrollment, ContentProgress, Certificate, Assignment, AssignmentSubmission
from accounts.serializers import AuthorSerializer

class ModuleContentSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    course_id = serializers.SerializerMethodField()

    class Meta:
        model = ModuleContent
        fields = [
            'id', 'title','content_type', 'text', 'video_url', 'file', 'module', 'course_id',
            'order', 'is_required', 'duration', 'created_at', 'is_completed'
        ]

    def get_is_completed(self, obj):
        request = self.context.get('request')
        user = request.user if request and hasattr(request, 'user') else None
        if not user or user.is_anonymous:
            return False
        return obj.progresses.filter(student=user, is_completed=True).exists()
    
    def get_course_id(self, obj):
        return obj.module.course.slug if obj.module else None

class ModuleSerializer(serializers.ModelSerializer):
    contents = ModuleContentSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = [
            'slug', 'course', 'title', 'description', 'order', 'is_published',
            'prerequisites', 'contents', 'created_at', 'last_updated'
        ]

class CourseSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)  # replace default ID with nested details
    modules = ModuleSerializer(many=True, read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    is_author = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'slug', 'name', 'description', 'created_at', 'rating',
            'launch_date', 'is_published', 'thumbnail', 'level', 'duration',
            'author', 'category', 'subcategory', 'tags', 'students_enrolled', 'modules', 'is_enrolled', 'is_author',
        ]
    read_only_fields = ['created_at', 'slug', 'author']

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return request.user in obj.students_enrolled.all()
        return False

    def get_is_author(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.author == request.user
        return False

    def create(self, validated_data):
        # Automatically assign author from context
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Let DRF handle the update logic
        return super().update(instance, validated_data)

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'enrolled_at']
        read_only_fields = ['enrolled_at']

class ContentProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentProgress
        fields = ['id', 'student', 'content', 'course', 'is_completed', 'completed_at']
        read_only_fields = ['student', 'completed_at']


class CourseProgressSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['slug', 'name', 'thumbnail', 'progress']

    def get_progress(self, obj):
        user = self.context['request'].user
        completed = ContentProgress.objects.filter(course=obj, student=user, is_completed=True).count()
        total = ModuleContent.objects.filter(module__course=obj).count()
        return round((completed / total) * 100) if total else 0

class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = '__all__'
        read_only_fields = ['student', 'issued_at', 'pdf_file']


class DashboardSerializer(serializers.Serializer):
    full_name = serializers.CharField(source='get_full_name')
    username = serializers.CharField()
    email = serializers.EmailField()
    bio = serializers.CharField(source='profile.bio', default='')
    enrolled_courses = CourseProgressSerializer(source='courses_enrolled', many=True)
    completed_courses = serializers.SerializerMethodField()
    certificates = CertificateSerializer(source='certificate_set', many=True)
    
    def get_completed_courses(self, obj):
        completed = []
        for course in obj.courses_enrolled.all():
            total = ModuleContent.objects.filter(module__course=course).count()
            completed_count = ContentProgress.objects.filter(course=course, student=obj, is_completed=True).count()
            if total > 0 and total == completed_count:
                completed.append({
                    'name': course.name,
                    'slug': course.slug,
                })
        return completed

class PendingCertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name')
    student_email = serializers.EmailField(source='student.email')
    course_title = serializers.CharField(source='course.name')
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = ['id', 'student_name', 'student_email', 'course_title', 'status', 'applied_at', 'progress']

    def get_progress(self, obj):
        return ContentProgress.get_course_progress_percent(obj.student, obj.course)


class AssignmentSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    is_author = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = ['id', 'module','type', 'title', 'description', 'attachment', 'deadline', 'created_at', 'is_author']

    def get_type(self, obj):
        return 'assignment'
    
    def get_is_author(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.module.course.author == request.user
        return False
    

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = AssignmentSubmission
        fields = '__all__'
        read_only_fields = ['student', 'submitted_at', 'assignment']

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.student == request.user
        return False