from django.contrib import admin
from .models import CustomUser
from django.contrib.auth.admin import UserAdmin
# Register your models here.


class CustomUserAdmin(admin.ModelAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'is_teacher', 'is_semi_admin', 'is_banned', 'is_staff', 'is_superuser', 'joined_at', 'is_active' )
    list_filter = ('is_teacher', 'is_semi_admin', 'is_banned', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'phone_number', 'first_name', 'last_name')
    list_per_page = 20
    readonly_fields = ('joined_at',)
    fieldsets = UserAdmin.fieldsets + (
        ('Profile Info', {
            'fields': ('profile_image', 'banner_image', 'bio', 'phone_number', 'date_of_birth', 'joined_at')
        }),
        ('Platform Access', {
            'fields': ('is_teacher', 'is_semi_admin', 'is_banned', 'is_verified')
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)