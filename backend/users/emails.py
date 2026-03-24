from django.core.mail import send_mail
from django.conf import settings


def send_welcome_email(user):
    """Sent immediately after a new user registers."""
    name = user.first_name or user.email.split('@')[0]
    send_mail(
        subject='Welcome to FashionUK',
        message=f"""Hi {name},

Welcome to FashionUK! 🎉

Your account has been created successfully.
Email: {user.email}

Start browsing our latest collections at {settings.FRONTEND_URL}

— The FashionUK Team
""",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )


def send_password_changed_email(user):
    """Sent after a user successfully changes their password."""
    name = user.first_name or user.email.split('@')[0]
    send_mail(
        subject='FashionUK — Password Changed',
        message=f"""Hi {name},

Your FashionUK password was recently changed.

If you did not make this change, contact us immediately at support@fashionuk.com.

— The FashionUK Team
""",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )