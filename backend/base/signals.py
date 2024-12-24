from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User 

@receiver(post_save, sender=User)
def send_approval_email(sender, instance, created, **kwargs):
    if not created and instance.is_active:  
        subject = "Your Account Approval Confirmation"
        # login_url = "http://localhost:5173/login"  
        message = (
            f"Dear {instance.username},\n\n"
            f"We are pleased to inform you that your account has been successfully approved. \n\n"
            f"You can now log in to access your HRMS account and our services.\n\n"
            # f"Please use the following link to log in:\n"
            # f"{login_url}\n\n"
            f"If you have any questions or need assistance, feel free to contact us.\n\n"
            f"Best regards,\n"
            f"The Hr Team"
        )
        from_email = 'your_email@gmail.com'
        recipient_list = [instance.email]
        send_mail(subject, message, from_email, recipient_list)
