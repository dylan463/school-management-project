from django.core.exceptions import ValidationError
from django.db import transaction, IntegrityError

from ..models import SchoolYear, StudentSchoolYear, FormationLevel,Semester,Enrollment
from users.models import CustomUser


@transaction.atomic
def create_student_school_year(
    student: CustomUser,
    school_year: SchoolYear,
    formation,
    level,
    status=StudentSchoolYear.Status.ACTIVE
    ):
    """
    Méthode centralisée pour créer une inscription annuelle d'étudiant.
    Vérifie les doublons, le verrouillage et crée le StudentSchoolYear avec transaction.
    """
    if StudentSchoolYear.objects.filter(student=student,status__in=[StudentSchoolYear.Status.ACTIVE]).exists():
        raise ValidationError(
            "Cet étudiant est déjà inscrit dans une année scolaire ouverte."
        )
    # Vérification du statut de l'année scolaire
    if school_year.status == SchoolYear.Status.CLOSED:
        raise ValidationError(
            "Impossible d'inscrire un étudiant dans une année scolaire clôturée."
        )
    try:
        student_school_year = StudentSchoolYear.objects.create(
            student=student,
            school_year=school_year,
            formation=formation,
            level=level,
            status=status,
        )

        semesters = Semester.objects.filter(level=level).order_by("order")
        Enrollment.objects.create(
            student_school_year = student_school_year,
            semester=semesters.first(),
            is_current= school_year.period == "FIRST"
        )
        Enrollment.objects.create(
            student_school_year= student_school_year,
            semester = semesters.last(),
            is_current = school_year.period == "SECOND"
        )      
        return student_school_year
    except IntegrityError:
        raise ValidationError(
            "L'étudiant est déjà inscrit dans cette année scolaire."
        )

@transaction.atomic
def promote_or_repeat_for_new_school_years(
    student: CustomUser,
    new_school_year: SchoolYear
    ):
    """
    Réinscription automatique :
    - PROMOTED → niveau supérieur
    - REPEAT   → même niveau
    - EXCLUDED → interdit
    """
    last_ssy = StudentSchoolYear.objects.filter(student=student).order_by("-created_at").first()
    if not last_ssy:
        raise ValidationError(
            "Aucune inscription précédente trouvée."
        )
    if last_ssy.status == StudentSchoolYear.Status.EXCLUDED:
        raise ValidationError(
            "L'étudiant est exclu et ne peut pas être réinscrit."
        )
    if last_ssy.status == StudentSchoolYear.Status.PROMOTED:
        next_order = last_ssy.level.order + 1

        new_level = FormationLevel.objects.filter(
            formation=last_ssy.formation,
            level__order=next_order
        ).first()

        if not new_level:
            raise ValidationError(
                f"Aucun niveau supérieur après {last_ssy.level.code}."
            )
    elif last_ssy.status == StudentSchoolYear.Status.REPEAT:
        new_level = last_ssy.level
    else:
        raise ValidationError(
            "La délibération de cet étudiant n'est pas terminée."
        )
    return create_student_school_year(
        student=student,
        school_year=new_school_year,
        formation=last_ssy.formation,
        level=new_level,
        status=StudentSchoolYear.Status.ACTIVE
    )

