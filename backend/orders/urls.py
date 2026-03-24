from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    path('',                               views.OrderListView.as_view(),               name='order-list'),
    path('checkout/',                      views.CheckoutView.as_view(),                name='checkout'),
    path('addresses/',                     views.ShippingAddressListCreateView.as_view(), name='address-list'),
    path('addresses/<int:pk>/',            views.ShippingAddressDetailView.as_view(),   name='address-detail'),
    path('<str:order_number>/',            views.OrderDetailView.as_view(),             name='order-detail'),
    path('<str:order_number>/cancel/',     views.OrderCancelView.as_view(),             name='order-cancel'),
]