from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('create-order/',          views.CreateRazorpayOrderView.as_view(),  name='create-order'),
    path('verify/',                views.VerifyRazorpayPaymentView.as_view(), name='verify'),
    path('webhook/',               views.RazorpayWebhookView.as_view(),      name='webhook'),
    path('<str:order_number>/',    views.PaymentDetailView.as_view(),        name='payment-detail'),
    path('success/', views.payment_success_redirect, name='payment_success_redirect'),
]