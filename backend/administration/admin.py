from django.contrib import admin
from .models import TeacherApplication

@admin.register(TeacherApplication)
class TeacherApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'highest_education', 'status', 'submitted_at')
    list_filter = ('status', 'highest_education')
    search_fields = ('user__username', 'skills', 'expertise')
    readonly_fields = ('submitted_at',)

    fieldsets = (
        ('Information', {
            'fields': ('user', 'highest_education', 'skills', 'expertise', 'past_experience', 'status')
        }),
        ('Timestamps', {
            'fields': ('submitted_at',)
        }),
    )
