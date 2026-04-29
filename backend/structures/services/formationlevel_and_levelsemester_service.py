from ..models import Level,Semester,FormationLevel,Formation
from django.core.exceptions import ValidationError
from django.db import transaction


from django.db import transaction
from ..models import FormationLevel, Formation,Level

from django.db import transaction


def create_formation_levels(formation,from_level,to_level):
    levels = Level.objects.filter(
        order__gte=from_level,
        order__lte=to_level
    )

    FormationLevel.objects.bulk_create([
        FormationLevel(formation=formation, level=level)
        for level in levels
    ])


@transaction.atomic
def create_formation_and_its_levels(data: dict):
    from_level = data.pop("from_level")
    to_level = data.pop("to_level")

    formation = Formation.objects.create(**data)
    create_formation_levels(formation,from_level,to_level)
    return formation

@transaction.atomic
def update_formation_and_its_level(formation : Formation,data:dict):
    from_level = data.pop("from_level",None)
    to_level = data.pop("to_level",None)

    for attr,val in data.items():
        setattr(formation,attr,val)

    formation.save()

    if from_level is None or to_level is None:
        return formation
    
    FormationLevel.objects.filter(formation=formation).delete()
    create_formation_levels(formation,from_level,to_level)

    return formation


@transaction.atomic
def create_level(code : str,order : int):
    if order <= 0:
        raise ValidationError("l'order doit être positif")
    level = Level.objects.create(code=code,order=order)
    
    semester_order1 = order*2 - 1
    semester_order2 = order*2
    Semester.objects.create(code=f"S{semester_order1}",order=semester_order1,level=level)
    Semester.objects.create(code=f"S{semester_order2}",order=semester_order2,level=level)
    
    return level

