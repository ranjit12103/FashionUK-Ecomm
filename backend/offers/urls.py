from django.urls import path
from . import views

app_name = 'offers'

urlpatterns = [
    path('coupons/validate/', views.ValidateCouponView.as_view(), name='coupon-validate'),
]