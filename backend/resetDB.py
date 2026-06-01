import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from django.apps import apps
import os
from structures.models import User,SchoolYear,Formation,Semester,Mention,CourseModule,CourseUnit
from portal.models import ImportJob

models = [
 ImportJob,
 User,
 SchoolYear,
 Formation,
 Semester,
 Mention,
 CourseModule,
 CourseUnit,
]

def reset_db():
    # 1) DROP TOUT
    for model in models:
        print(f"Resetting {model.__name__}...")
        model.objects.all().delete()

if __name__ == "__main__":
    reset_db()
