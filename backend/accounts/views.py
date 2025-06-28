from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .serializers import UserSerializer, Profile, UserUpdateSerializer, UserAdminSerializer, TeacherApplicationSerializer
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import CustomUser, TeacherApplication
from .permissions import IsAdminOrSemiAdmin 
from django.shortcuts import get_object_or_404

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = Profile(request.user)
        return Response(serializer.data)

@api_view(['POST'])
def signup_view(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User created successfully.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def update_profile(request):
    user = request.user
    serializer = UserUpdateSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
    new_status = request.data.get('status')

    if new_status not in ['approved', 'rejected', 'on_hold', 'pending']:
        return Response({'detail': 'Invalid status value.'}, status=status.HTTP_400_BAD_REQUEST)

    application.status = new_status
    application.save()
    serializer = TeacherApplicationSerializer(application)
    return Response(serializer.data)