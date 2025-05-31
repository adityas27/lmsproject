from rest_framework import serializers
from .models import Course, Module, ModuleContent, Enrollment
from accounts.serializers import AuthorSerializer


class ModuleContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleContent
        fields = [
            'id', 'module', 'content_type', 'text', 'video_url', 'file',
            'order', 'is_required', 'duration', 'created_at'
        ]


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

    class Meta:
        model = Course
        fields = [
            'slug', 'name', 'description', 'created_at', 'rating', 'price',
            'launch_date', 'is_published', 'thumbnail', 'level', 'duration',
            'author', 'category', 'subcategory', 'tags', 'students_enrolled', 'modules', 'is_enrolled',
        ]
    read_only_fields = ['created_at', 'slug', 'author']

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return request.user in obj.students_enrolled.all()
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

