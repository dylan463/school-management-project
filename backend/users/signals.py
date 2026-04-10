@receiver(post_save, sender=CustomUser)
def send_user_email(sender, instance, created, **kwargs):
    if created:

        password = getattr(instance, "_plain_password", None)

        if instance.role == CustomUser.Role.STUDENT:
            subject = "Compte étudiant créé"

        elif instance.role == CustomUser.Role.TEACHER:
            subject = "Compte professeur créé"

        else:
            subject = "Compte créé"

        message = f"""
Bonjour,

Votre compte a été créé.

Username: {instance.username}
Email: {instance.email}
Password: {password if password else 'N/A'}
Role: {instance.role}
"""

        send_mail(
            subject=subject,
            message=message,
            from_email="admin@test.com",
            recipient_list=[instance.email],
        )