import django_filters
from django.db.models import F
from .models import Product


class ProductFilter(django_filters.FilterSet):
    category    = django_filters.CharFilter(field_name='category__slug', lookup_expr='exact')
    brand       = django_filters.CharFilter(field_name='brand__slug',    lookup_expr='exact')
    tag         = django_filters.CharFilter(field_name='tags__slug',     lookup_expr='exact')
    size        = django_filters.CharFilter(field_name='variants__size__name',   lookup_expr='iexact')
    colour      = django_filters.CharFilter(field_name='variants__colour__name', lookup_expr='iexact')
    min_price   = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price   = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    is_on_sale  = django_filters.BooleanFilter(method='filter_is_on_sale')
    fit         = django_filters.MultipleChoiceFilter(choices=Product.FIT_CHOICES)
    gender      = django_filters.ChoiceFilter(choices=Product.GENDER_CHOICES)
    badge       = django_filters.CharFilter(field_name='badge', lookup_expr='exact')
    is_featured = django_filters.BooleanFilter()
    is_new      = django_filters.BooleanFilter()
    is_bestseller = django_filters.BooleanFilter()

    class Meta:
        model = Product
        fields = [
            'category', 'brand', 'tag', 'size', 'colour',
            'min_price', 'max_price', 'is_on_sale',
            'fit', 'gender', 'badge',
            'is_featured', 'is_new', 'is_bestseller',
        ]

    def filter_is_on_sale(self, queryset, name, value):
        if value:
            return queryset.filter(price__lt=F('original_price'))
        return queryset.exclude(price__lt=F('original_price'))