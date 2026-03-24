from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    # ── Lookup / filter option endpoints ──────────────────────────────
    path('categories/',             views.CategoryListView.as_view(),    name='category-list'),
    path('categories/<slug:slug>/', views.CategoryDetailView.as_view(),  name='category-detail'),
    path('brands/',                 views.BrandListView.as_view(),        name='brand-list'),
    path('tags/',                   views.TagListView.as_view(),          name='tag-list'),
    path('sizes/',                  views.SizeListView.as_view(),         name='size-list'),
    path('colours/',                views.ColourListView.as_view(),       name='colour-list'),

    # ── Curated collections ───────────────────────────────────────────
    path('featured/',               views.FeaturedProductsView.as_view(), name='featured'),
    path('new-in/',                 views.NewInProductsView.as_view(),    name='new-in'),
    path('sale/',                   views.SaleProductsView.as_view(),     name='sale'),
    path('bestsellers/',            views.BestsellerProductsView.as_view(), name='bestsellers'),

    # ── Search ────────────────────────────────────────────────────────
    path('search/',                 views.ProductSearchView.as_view(),    name='search'),

    # ── Reviews ───────────────────────────────────────────────────────
    path('reviews/<int:pk>/helpful/', views.ReviewHelpfulView.as_view(), name='review-helpful'),

    # ── Product list + detail  (keep last — slug catch-all) ───────────
    path('',                         views.ProductListView.as_view(),   name='product-list'),
    path('<slug:slug>/',             views.ProductDetailView.as_view(), name='product-detail'),
    path('<slug:slug>/reviews/',     views.ProductReviewListView.as_view(),  name='review-list'),
    path('<slug:slug>/reviews/create/', views.ProductReviewCreateView.as_view(), name='review-create'),
]