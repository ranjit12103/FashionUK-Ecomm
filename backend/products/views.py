from django.db.models import Q, F
from rest_framework import generics, status, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Category, Brand, Tag, Size, Colour,
    Product, ProductReview,
)
from .serializers import (
    CategorySerializer, BrandSerializer, TagSerializer,
    SizeSerializer, ColourSerializer,
    ProductListSerializer, ProductDetailSerializer,
    ProductReviewSerializer, ProductReviewCreateSerializer,
)
from .filters import ProductFilter


# ── Lookup tables ────────────────────────────────────────────────────

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class CategoryDetailView(generics.RetrieveAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]


class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    permission_classes = [AllowAny]


class TagListView(generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]


class SizeListView(generics.ListAPIView):
    queryset = Size.objects.all()
    serializer_class = SizeSerializer
    permission_classes = [AllowAny]


class ColourListView(generics.ListAPIView):
    queryset = Colour.objects.all()
    serializer_class = ColourSerializer
    permission_classes = [AllowAny]


# ── Product list ─────────────────────────────────────────────────────

class ProductListView(generics.ListAPIView):
    """
    GET /api/products/
    ?category=<slug>  ?brand=<slug>  ?tag=<slug>
    ?fit=slim         ?gender=men    ?badge=sale
    ?min_price=10     ?max_price=80  ?is_on_sale=true
    ?is_featured=true ?is_new=true   ?is_bestseller=true
    ?size=M           ?colour=navy
    ?search=<query>
    ?ordering=price|-price|created_at|-created_at|sold_count
    """
    serializer_class   = ProductListSerializer
    permission_classes = [AllowAny]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class    = ProductFilter
    search_fields      = ['name', 'short_description', 'sku', 'description']
    ordering_fields    = ['price', 'created_at', 'sold_count', 'view_count']
    ordering           = ['-created_at']

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True)
            .select_related('category', 'brand')
            .prefetch_related('images', 'variants', 'tags', 'reviews')
        )


# ── Product detail ───────────────────────────────────────────────────

class ProductDetailView(generics.RetrieveAPIView):
    """GET /api/products/<slug>/  — increments view_count on each call."""
    serializer_class   = ProductDetailSerializer
    permission_classes = [AllowAny]
    lookup_field       = 'slug'

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True)
            .select_related('category', 'brand')
            .prefetch_related(
                'images', 'variants__colour', 'variants__size',
                'tags', 'reviews__user',
            )
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Product.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        return Response(self.get_serializer(instance).data)


# ── Curated collections ──────────────────────────────────────────────

def _base_qs():
    return (
        Product.objects
        .filter(is_active=True)
        .select_related('category')
        .prefetch_related('images', 'variants')
    )


class FeaturedProductsView(generics.ListAPIView):
    """GET /api/products/featured/"""
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return _base_qs().filter(is_featured=True)[:20]


class NewInProductsView(generics.ListAPIView):
    """GET /api/products/new-in/"""
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return _base_qs().filter(is_new=True).order_by('-created_at')[:20]


class SaleProductsView(generics.ListAPIView):
    """GET /api/products/sale/ — products where price < original_price (DB-level filter)."""
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return _base_qs().filter(price__lt=F('original_price')).order_by('-created_at')


class BestsellerProductsView(generics.ListAPIView):
    """GET /api/products/bestsellers/"""
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return _base_qs().filter(is_bestseller=True).order_by('-sold_count')[:20]


# ── Search ───────────────────────────────────────────────────────────

class ProductSearchView(generics.ListAPIView):
    """GET /api/products/search/?q=<query>"""
    serializer_class   = ProductListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        q = self.request.query_params.get('q', '').strip()
        if not q:
            return Product.objects.none()
        return (
            Product.objects
            .filter(is_active=True)
            .filter(
                Q(name__icontains=q) |
                Q(short_description__icontains=q) |
                Q(sku__icontains=q) |
                Q(category__name__icontains=q) |
                Q(brand__name__icontains=q)
            )
            .select_related('category', 'brand')
            .prefetch_related('images', 'variants')
            .distinct()
        )


# ── Reviews ──────────────────────────────────────────────────────────

class ProductReviewListView(generics.ListAPIView):
    """GET /api/products/<slug>/reviews/"""
    serializer_class   = ProductReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            ProductReview.objects
            .filter(product__slug=self.kwargs['slug'], is_approved=True)
            .select_related('user')
            .order_by('-created_at')
        )


class ProductReviewCreateView(generics.CreateAPIView):
    """POST /api/products/<slug>/reviews/create/"""
    serializer_class   = ProductReviewCreateSerializer
    permission_classes = [IsAuthenticated]

    def _get_product(self):
        return generics.get_object_or_404(Product, slug=self.kwargs['slug'], is_active=True)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['product'] = self._get_product()
        return ctx

    def perform_create(self, serializer):
        product     = self._get_product()
        is_verified = False
        try:
            from orders.models import OrderItem
            is_verified = OrderItem.objects.filter(
                order__user=self.request.user,
                product=product,
                order__status__in=['delivered', 'completed'],
            ).exists()
        except Exception:
            pass
        serializer.save(user=self.request.user, product=product, is_verified_purchase=is_verified)


class ReviewHelpfulView(APIView):
    """POST /api/products/reviews/<pk>/helpful/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        review = generics.get_object_or_404(ProductReview, pk=pk, is_approved=True)
        ProductReview.objects.filter(pk=pk).update(helpful_count=F('helpful_count') + 1)
        return Response({'detail': 'Marked as helpful.'}, status=status.HTTP_200_OK)