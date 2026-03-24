from django.urls import path
from . import views

app_name = 'wishlist'

urlpatterns = [
    path('',                              views.WishlistListView.as_view(),   name='wishlist-list'),
    path('add/',                          views.WishlistAddView.as_view(),    name='wishlist-add'),
    path('clear/',                        views.WishlistClearView.as_view(),  name='wishlist-clear'),
    path('check/<int:product_id>/',       views.WishlistCheckView.as_view(),  name='wishlist-check'),
    path('<int:product_id>/remove/',      views.WishlistRemoveView.as_view(), name='wishlist-remove'),
]