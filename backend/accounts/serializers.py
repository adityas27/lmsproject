from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'bio']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'username', 'is_teacher', 'profile_image', 'bio',
                  'password', 'password2','first_name', 'last_name')
        extra_kwargs = {
            'profile_image': {'required': False},
            'bio': {'required': False},
        }

    def validcate(self, data):
        if data.get("password") != data.get("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            is_teacher=validated_data.get('is_teacher', False),
            profile_image=validated_data.get('profile_image'),
            bio=validated_data.get('bio', '')
        )
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email', 'profile_image', 'bio', 'phone_number', 'date_of_birth']
        