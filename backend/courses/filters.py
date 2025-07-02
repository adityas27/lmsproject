import django_filters
from .models import Course

class CourseFilter(django_filters.FilterSet):
    price_min = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    level = django_filters.CharFilter(lookup_expr='iexact')
    is_published = django_filters.BooleanFilter()
    is_visible = django_filters.BooleanFilter()
    category = django_filters.CharFilter(field_name='category__slug', lookup_expr='iexact')
    subcategory = django_filters.CharFilter(field_name='subcategory__slug', lookup_expr='iexact')
    tags = django_filters.AllValuesMultipleFilter(field_name='tags__id', conjoined=False)

    class Meta:
        model = Course
        fields = ['level', 'is_published', 'is_visible', 'category', 'subcategory', 'tags']
