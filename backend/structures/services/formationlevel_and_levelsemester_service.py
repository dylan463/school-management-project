from ..models import Level,Semester,FormationLevel,Formation
from django.core.exceptions import ValidationError
from django.db import transaction


from django.db import transaction
from ..models import FormationLevel, Formation


@transaction.atomic()
def regenerate_levels_for_formation(from_level_order: int, to_level_order: int, formation: Formation):
    if from_level_order is None or to_level_order is None:
        raise ValueError("from_level_order et to_level_order ne peuvent pas être None")

    # 🔁 correction du swap
    if from_level_order > to_level_order:
        from_level_order, to_level_order = to_level_order, from_level_order

    FormationLevel.objects.filter(formation=formation).delete()

    formation_levels = [
        FormationLevel(
            formation=formation,
            level_order=order
        )
        for order in range(from_level_order, to_level_order + 1)
    ]

    FormationLevel.objects.bulk_create(formation_levels)

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

