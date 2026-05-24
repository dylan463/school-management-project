import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()


from users.models import User, Role
import getpass

if User.objects.filter(role=Role.SYSTEM_ADMIN).exists():
    print('Un SystemAdmin existe déjà')
else:
    email = input('Email: ')
    username = input('username: ')
    password = getpass.getpass('Password: ')
    confirm = getpass.getpass('Confirmer password: ')

    if password != confirm:
        print('Les mots de passe ne correspondent pas')
    else:
        User.objects.create_user(
            email=email,
            username=username,
            password=password,
            role=Role.SYSTEM_ADMIN,
            mention=None,
            is_staff=True,
            is_superuser=True,
        )
        print(f'SystemAdmin {email} créé avec succès')