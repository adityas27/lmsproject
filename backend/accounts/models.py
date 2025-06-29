from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class CustomUser(AbstractUser):
    is_teacher = models.BooleanField(default=False)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    banner_image = models.ImageField(upload_to='banner/', blank=True, null=True)
    bio = models.TextField(blank=True)
    phone_number = models.CharField(max_length=10, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    is_semi_admin = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)



