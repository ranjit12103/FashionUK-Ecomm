from django.urls import path
from . import views

app_name = 'cart'

urlpatterns = [
    path('',                      views.CartDetailView.as_view(),      name='cart-detail'),
    path('add/',                  views.CartAddItemView.as_view(),      name='cart-add'),
    path('clear/',                views.CartClearView.as_view(),        name='cart-clear'),
    path('items/<int:item_id>/',  views.CartUpdateItemView.as_view(),   name='cart-update'),
    path('items/<int:item_id>/delete/', views.CartRemoveItemView.as_view(), name='cart-remove'),
]