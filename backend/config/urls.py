from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/',    include('users.urls',    namespace='users')),
    path('api/products/', include('products.urls', namespace='products')),
    path('api/cart/',     include('cart.urls',     namespace='cart')),
    path('api/wishlist/', include('wishlist.urls', namespace='wishlist')),
    path('api/orders/',   include('orders.urls',   namespace='orders')),
    path('api/offers/',   include('offers.urls',   namespace='offers')),
    path('api/payments/', include('payments.urls', namespace='payments')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,  document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)