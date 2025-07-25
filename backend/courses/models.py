from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
from django.contrib.auth import get_user_model

User = get_user_model()
# --- Category Model ---
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(primary_key=True, unique=True, editable=False)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

# --- SubCategory Model ---
class SubCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(primary_key=True, unique=True, editable=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.category.name}-{self.name}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category.name} - {self.name}"

# --- Course Model ---
class Course(models.Model):
    slug = models.SlugField(primary_key=True, unique=True, editable=False)  # used as ID
    name = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses')
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(0), MaxValueValidator(5)], default=0)
    launch_date = models.DateField()
    is_published = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Price of the course in INR")
    thumbnail = models.ImageField(upload_to='course_thumbnails/', null=True, blank=True)
    level = models.CharField(
        max_length=20,
        choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')],
        default='beginner'
    )
    duration = models.PositiveIntegerField(help_text='Duration in hours')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='courses')
    subcategory = models.ForeignKey(SubCategory, on_delete=models.SET_NULL, null=True, related_name='courses')
    tags = models.ManyToManyField('Tag', blank=True)
    students_enrolled = models.ManyToManyField(User, through='Enrollment', related_name='courses_enrolled', blank=True)
    auto_certificate = models.BooleanField(default=True)
    is_visible = models.BooleanField(default=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            self.slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

# --- Tag Model ---
class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Module(models.Model):
    slug = models.SlugField(primary_key=True, unique=True, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    prerequisites = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='prerequisite_modules')

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            self.slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.name} - {self.title}"

class ModuleContent(models.Model):
    CONTENT_TYPES = (
        ('text', 'Article'),
        ('video', 'Video'),
        ('file', 'Document'),
    )
    title = models.CharField(max_length=255, blank=True, null=True, default="Deafault Title for Content")
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='contents')
    order = models.PositiveIntegerField(default=0)
    content_type = models.CharField(max_length=10, choices=CONTENT_TYPES)
    text = models.TextField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    file = models.FileField(upload_to='module_files/', blank=True, null=True)
    is_required = models.BooleanField(default=False)
    duration = models.PositiveIntegerField(default=0, help_text="Duration in minutes (optional)")
    created_at = models.DateTimeField(auto_now_add=True)    

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.module.title} - {self.get_content_type_display()} ({self.order})"

class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    # Stripe Integration Fields : For future use, might need to update this model then
    stripe_session_id = models.CharField(max_length=255, blank=True, null=True)
    payment_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed')
    ], default='pending')
    payment_timestamp = models.DateTimeField(blank=True, null=True)
    access_granted = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.username} → {self.course.title}"

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} enrolled in {self.course.name}"



class ContentProgress(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='content_progress')
    content = models.ForeignKey(ModuleContent, on_delete=models.CASCADE, related_name='progresses')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='progress')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'content')

    def __str__(self):
        return f"{self.student.username} - {'Completed' if self.is_completed else 'Not Completed'} {self.content} in {self.course.name}"
    
    def get_course_progress_percent(user, course):
        total = ModuleContent.objects.filter(module__course=course).count()
        completed = ContentProgress.objects.filter(student=user, content__module__course=course, is_completed=True).count()
        return int((completed / total) * 100) if total else 0


class Certificate(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    # is_approved = models.BooleanField(default=False)
    pdf_file = models.FileField(upload_to='certificates/', null=True, blank=True)
    status = models.CharField(max_length=10, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ], default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    issued_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'course')

class Assignment(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=255)
    description = models.TextField()
    attachment = models.FileField(upload_to='assignments/', null=True, blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    submitted_files = models.FileField(upload_to='submissions/')  # use ManyToMany if allowing multiple
    submitted_at = models.DateTimeField(auto_now_add=True)
    comment = models.TextField(blank=True, null=True)
    corrected_file = models.FileField(upload_to='corrected/', null=True, blank=True)
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('assignment', 'student')
    
class CourseFeedback(models.Model):
    RATING_CHOICES = [(i, i) for i in range(1, 6)]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='feedbacks')
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'course']
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.user.username} rated {self.course.name}: {self.rating}/5"