from users.models import CustomUser
from .models import SchoolYear

def create_student(data):
    school_year = data.pop("school_year")
    level = data.pop("level")
    formation = data.pop("formation")
