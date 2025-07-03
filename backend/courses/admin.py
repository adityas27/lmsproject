from django.contrib import admin
from .models import Course, Certificate, Tag, Category, SubCategory, Module, ModuleContent, Enrollment, ContentProgress, Assignment, AssignmentSubmission
# Register your models here.
admin.site.register(Tag)
admin.site.register(Category)
admin.site.register(SubCategory)
admin.site.register(ModuleContent)
admin.site.register(Module)
admin.site.register(ContentProgress)
admin.site.register(Certificate)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'author', 'level', 'price', 'is_published', 'is_visible', 'created_at')
    list_filter = ('level', 'is_published', 'is_visible', 'category', 'subcategory')
    search_fields = ('name', 'description', 'author__username')
    readonly_fields = ('slug', 'created_at')

    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'slug', 'description', 'author', 'category', 'subcategory', 'tags')
        }),
        ('Course Settings', {
            'fields': ('level', 'price', 'launch_date', 'thumbnail', 'duration', 'auto_certificate')
        }),
        ('Visibility & Status', {
            'fields': ('is_published', 'is_visible', 'created_at')
        }),
    )

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'deadline', 'created_at', 'module__course__author')
    list_filter = ('module',)
    search_fields = ('title', 'description', 'module__title')
    readonly_fields = ('created_at',)

@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'student', 'submitted_at','grade')
    list_filter = ('assignment__module', 'grade')
    search_fields = ('student__username', 'assignment__title')
    readonly_fields = ('submitted_at',)

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrolled_at', 'payment_status', )
    list_filter = ('payment_status',)
    search_fields = ('student__username', 'course__name')
    readonly_fields = ('enrolled_at',)