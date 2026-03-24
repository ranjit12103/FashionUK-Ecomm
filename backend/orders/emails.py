from django.core.mail import send_mail
from django.conf import settings


def send_order_confirmation_email(order):
    """Sent immediately after an order is created at checkout."""
    items_lines = '\n'.join([
        f'  • {item.product_name}'
        f'{" / " + item.variant_name if item.variant_name else ""}'
        f' × {item.quantity}  —  ₹{item.line_total}'
        + (f'  (was ₹{round(item.original_price * item.quantity, 2)}, saved ₹{item.line_savings})' if item.unit_savings else '')
        for item in order.items.all()
    ])

    savings_line = ''
    if order.discount_amount:
        savings_line = f'\nTotal savings:    ₹{order.discount_amount}'
    if order.coupon_code:
        savings_line += f'\nCoupon ({order.coupon_code}):  -₹{order.coupon_savings}'

    body = f"""Hi {order.full_name},

Thank you for your order with FashionUK! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Order #{order.order_number}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ITEMS ORDERED
{items_lines}

PRICING SUMMARY
  Subtotal:         ₹{order.subtotal}
  Shipping:         ₹{order.shipping_cost}{savings_line}
  ─────────────────────
  TOTAL:            ₹{order.total}

DELIVERY ADDRESS
  {order.full_name}
  {order.address_line1}{', ' + order.address_line2 if order.address_line2 else ''}
  {order.city}{', ' + order.county if order.county else ''}
  {order.postcode}
  {order.country}

We'll send you another email when your order ships.

Thank you for shopping with FashionUK.

— The FashionUK Team
"""

    send_mail(
        subject=f'FashionUK Order Confirmed — #{order.order_number}',
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.email],
        fail_silently=False,
    )


def send_order_shipped_email(order, tracking_number=None):
    """Notify customer that their order has shipped."""
    tracking_line = f'\nTracking number: {tracking_number}' if tracking_number else ''
    body = f"""Hi {order.full_name},

Great news — your FashionUK order #{order.order_number} has been shipped! 📦{tracking_line}

Delivering to:
  {order.address_line1}{', ' + order.address_line2 if order.address_line2 else ''}
  {order.city}, {order.postcode}

Expected delivery: 2–4 working days.

— The FashionUK Team
"""
    send_mail(
        subject=f'FashionUK — Your order #{order.order_number} is on its way!',
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.email],
        fail_silently=False,
    )


def send_order_cancelled_email(order):
    """Notify customer that their order has been cancelled."""
    body = f"""Hi {order.full_name},

Your FashionUK order #{order.order_number} has been cancelled.

If a payment was taken, a full refund of ₹{order.total} will appear on your statement within 3–5 working days.

If you have any questions, please contact us at support@fashionuk.com.

— The FashionUK Team
"""
    send_mail(
        subject=f'FashionUK — Order #{order.order_number} Cancelled',
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.email],
        fail_silently=False,
    )