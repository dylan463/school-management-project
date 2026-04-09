from django.contrib.auth.management.commands.createsuperuser import Command as BaseCommand
from users.models import CustomUser

class Command(BaseCommand):

    def handle(self, *args, **options):
        # Sauvegarder le username avant le handle
        username = options.get('username')

        super().handle(*args, **options)

        # Si username pas dans options (saisi interactivement)
        # on prend le dernier superuser créé
        if not username:
            user = CustomUser.objects.filter(
                is_superuser=True
            ).order_by('-date_joined').first()
        else:
            user = CustomUser.objects.get(username=username)

        # Forcer le rôle TEACHER
        user.role = CustomUser.Role.TEACHER
        user.is_staff = True
        user.is_superuser = True
        user.save()

        self.stdout.write(self.style.SUCCESS(
            f"✅ '{user.username}' est maintenant professeur admin"
        ))