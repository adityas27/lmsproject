from django.contrib import admin
from .models import Course, Certificate, Tag, Category, SubCategory, Module, ModuleContent, Enrollment, ContentProgress
# Register your models here.
admin.site.register(Course)
admin.site.register(Tag)
admin.site.register(Category)
admin.site.register(SubCategory)
admin.site.register(ModuleContent)
admin.site.register(Module)
admin.site.register(Enrollment)
admin.site.register(ContentProgress)
admin.site.register(Certificate)