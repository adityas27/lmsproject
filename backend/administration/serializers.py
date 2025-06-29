from rest_framework import serializers
from accounts.models import CustomUser
from courses.models import Enrollment, Certificate, Course
from .models import TeacherApplication

class UserAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'is_teacher', 'is_semi_admin', 'is_banned']
        read_only_fields = ['id', 'username', 'email']


class TeacherApplicationSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = TeacherApplication
        fields = [
            'id', 'user', 'highest_education', 'skills',
            'expertise', 'past_experience', 'status', 'submitted_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'submitted_at']
    

class StudentInfoSerializer(serializers.ModelSerializer):
    enrolled_courses = serializers.SerializerMethodField()
    certificates_earned = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'is_banned', 'enrolled_courses', 'certificates_earned']

    def get_enrolled_courses(self, obj):
        enrollments = Enrollment.objects.filter(student=obj)
        return [enrollment.course.name for enrollment in enrollments]

    def get_certificates_earned(self, obj):
        certificates = Certificate.objects.filter(student=obj)
        return [cert.course.name for cert in certificates]

class CourseAdminSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Course
        fields = ['slug', 'name', 'author_name', 'is_visible']
