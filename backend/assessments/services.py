from .models import (
    Assessment,Grade,EnrollmentResult,Debt,Enrollment
)
from structures.models import SchoolYear,CourseModule
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.db.models import Prefetch,Q
from collections import defaultdict
from .query import attend_to_assessment,promoted_people,people_with_course_debt
from structures.models import User,Formation,Semester,SchoolYear,CourseUnit,CourseModule
from notifications.utils import create_notification
from .task import create_notifications_for_assessment
from django.db.models import Sum, F, FloatField, ExpressionWrapper

# ----------------- enrollment -----------------

@transaction.atomic
def create_enrollment(student : User,school_year: SchoolYear,semester : Semester,formation : Formation,no_notification=True):
    if Enrollment.objects.filter(
        student=student,
        school_year=school_year
    ).exists():
        raise ValidationError({
            "detail": "Cet étudiant est déjà inscrit pour cette année scolaire."
        })
    elif school_year.status == SchoolYear.Status.CLOSED:
        raise ValidationError({
            "detail":"Impossible d'inscrire l'etudiant dans une année scolaire déjà cloturé."
        })
    elif Enrollment.objects.filter(student=student,school_year__status__in=[SchoolYear.Status.ACTIVE,SchoolYear.Status.UPCOMING]).exists():
        raise ValidationError({
            "detail":"Impossible d'réinscrit l'etudiant tant qu'il est déjà inscrit dans année ouverte."
        })

    redoublement = Enrollment.objects.filter(student=student,semester=semester,formation=formation).order_by("opened_at").last()
    if redoublement:
        # on repete les resultat qui sont déjà validé donc l'eleve ne participe qu'au examen dont il n'as pas encore de note
        is_repeated_results = EnrollmentResult.objects.filter(
            enrollment=redoublement,
            course_module__is_active=True,
            status__in=[EnrollmentResult.Status.VALIDATED,EnrollmentResult.Status.VALIDATED_AFTER_RETAKE]
            ).select_related("course_module")
        
        new_enrollment = Enrollment.objects.create(
            student=student,
            formation=formation,
            semester=semester,
            school_year=school_year
        )

        to_create = []
        for result in is_repeated_results:
            to_create.append(EnrollmentResult(
                enrollment=new_enrollment,
                course_module=result.course_module,
                status= result.status,
                final_score=result.final_score,
                comment= result.comment,
                is_repeated = True
            ))
        EnrollmentResult.objects.bulk_create(to_create)
        if not no_notification:
            create_notification(student,"Vous avez été inscrit.",f"votre réinscription en {semester.code} du parcours {formation.text} est réussit. L'année scolaire {school_year.text} ne fait que commencer. Bon courage !")
        return new_enrollment
    if not no_notification:
        create_notification(student,"Vous avez été inscrit.",f"votre réinscription en {semester.code} du parcours {formation.text} est réussit. L'année scolaire {school_year.text} ne fait que commencer. Bon courage !")
    
    return Enrollment.objects.create(
        student=student,
        formation=formation,
        semester=semester,
        school_year=school_year
    )

@transaction.atomic
def change_enrollment_status(enrollment: Enrollment, status: str):
    if status not in Enrollment.Status.values:
        raise ValidationError({
            "detail": "Décision invalide."
        })

    active_sy = SchoolYear.objects.filter(status=SchoolYear.Status.ACTIVE).first()
    if not active_sy:
        raise ValidationError({
            "detail": "Modification Impossible : aucune année scolaire active"
        })

    if active_sy.id == enrollment.school_year_id:
        if status == Enrollment.Status.ACTIVE:
            Debt.objects.filter(result__enrollment=enrollment).delete()
        else:
            # Bug fix : select_related pour éviter N+1 sur course_module
            results = EnrollmentResult.objects.filter(
                enrollment=enrollment,
                status=EnrollmentResult.Status.NOT_VALIDATED
            ).select_related("course_module")

            debts = [
                Debt(
                    result = result,
                    original_score=result.final_score,
                    original_status=result.status,
                )
                for result in results
            ]

            if debts:
                Debt.objects.bulk_create(debts)
    else:
        # on a annuler le resultat de l'inscription donc on dit que les debt ne sont pas encore délibéré
        if status == Enrollment.Status.ACTIVE:
            Debt.objects.filter(result__enrollment=enrollment).update(last_deliberation=None)
        else:
            debts = Debt.objects.filter(result__enrollment=enrollment).select_related("result")

            to_update = []

            for debt in debts:
                debt.cleared = debt.result.status != EnrollmentResult.Status.NOT_VALIDATED
                debt.last_deliberation = active_sy
                to_update.append(debt)

            if to_update:
                Debt.objects.bulk_update(to_update, ["cleared", "last_deliberation"])

    enrollment.status = status
    enrollment.save()
    return enrollment

@transaction.atomic
def delete_enrollment(enrollment : Enrollment):
    enrollment.delete()

# --------------- Assessments ----------------

@transaction.atomic
def create_assessment(data: dict):
    session = data.get("session")

    course_module = CourseModule.objects.get(
        id=data.get("course_module").id
    )

    school_year = SchoolYear.objects.filter(status = SchoolYear.Status.ACTIVE).first()

    if not school_year:
        raise ValidationError({"detail":"veuillez créer votre éxamen pendant une année scolaire active"})

    data["school_year"] = school_year

    if session == "RETAKE":
        if not Assessment.objects.filter(
            session="NORMAL",
            course_module=course_module,
            school_year=school_year,
            is_published=True
        ).exists():

            raise ValidationError({"detail":
                "veuillez publier une session normal avant d'entamer un rattrappage"
            })
    
    examen = Assessment.objects.create(**data)

    query = attend_to_assessment(examen)
    enrollments = Enrollment.objects.filter(query)
    to_create = []
    for enrollment in enrollments:
        to_create.append(
            Grade(
                enrollment=enrollment,
                assessment=examen,
                score=None
            )
        )
    
    Grade.objects.bulk_create(to_create)

    create_notifications_for_assessment(examen)

    return examen

def compute_weighted_score(grades):
    weighted = [(g.score, g.assessment.grade_weight) for g in grades]
    total_weight = sum(w for _, w in weighted)
    return sum(s * w for s, w in weighted) / total_weight


@transaction.atomic
def update_results(course_module):
    # Récupération unique et sécurisée de l'année scolaire active
    school_year = SchoolYear.objects.filter(status="ACTIVE").first()
    if school_year is None:
        raise ValidationError({"detail":"Vous ne pouvez publier les résultats que pendant une année scolaire active"})

    def get_grades(session):
        """Récupère les notes en une seule requête avec les relations nécessaires."""
        return (
            Grade.objects
            .filter(
                assessment__course_module=course_module,
                assessment__school_year=school_year,
                assessment__session=session,
                assessment__is_published=True,
                score__isnull=False
            )
            .select_related("enrollment", "assessment")
        )

    def group_by_enrollment(grades):
        groups = defaultdict(list)
        for g in grades:
            groups[g.enrollment_id].append(g)
        return groups

    def process_session(session, validated_status):
        grades = get_grades(session)
        if not grades.exists():
            return

        # Calcul des scores en Python (évite N requêtes)
        enrollment_data = {}
        for enrollment_id, grade_list in group_by_enrollment(grades).items():
            score = round(compute_weighted_score(grade_list), 2)
            status = (
                validated_status
                if score >= course_module.min_val_score
                else "NOT_VALIDATED"
            )
            enrollment_data[enrollment_id] = (score, status)

        enrollment_ids = list(enrollment_data.keys())

        # Récupérer les résultats existants en une seule requête
        existing_results = {
            r.enrollment_id: r
            for r in EnrollmentResult.objects.filter(
                enrollment_id__in=enrollment_ids,
                course_module=course_module,
            )
        }

        to_create = []
        to_update = []

        for enrollment_id, (score, status) in enrollment_data.items():
            if enrollment_id in existing_results:
                result = existing_results[enrollment_id]
                result.final_score = score
                result.status = status
                to_update.append(result)
            else:
                to_create.append(
                    EnrollmentResult(
                        enrollment_id=enrollment_id,
                        course_module=course_module,
                        final_score=score,
                        status=status,
                    )
                )

        # Deux requêtes bulk au lieu de N×2
        if to_create:
            EnrollmentResult.objects.bulk_create(to_create)
        if to_update:
            EnrollmentResult.objects.bulk_update(to_update, ["final_score", "status"])

    has_published_assessments = Assessment.objects.filter(
        course_module=course_module,
        school_year=school_year,
        is_published=True,
    ).exists()

    if has_published_assessments:
        process_session("NORMAL", "VALIDATED")

        # Suppression en une seule requête
        Grade.objects.filter(
            assessment__course_module=course_module,
            assessment__school_year=school_year,
            assessment__session="RETAKE",
            enrollment__enrollment_results__status="VALIDATED",
        ).delete()

        process_session("RETAKE", "VALIDATED_AFTER_RETAKE")

    else:
        EnrollmentResult.objects.filter(
            enrollment__in=Enrollment.objects.filter(
                promoted_people(course_module, school_year)
            ),
            course_module=course_module,
        ).delete()

        debted_enrollments = Enrollment.objects.filter(
            people_with_course_debt(course_module)
        )

        # Récupération des dettes avec les résultats liés
        debts = list(
            Debt.objects
            .filter(result__enrollment__in=debted_enrollments)
            .select_related("result")
        )

        # Bulk update au lieu de N saves
        results_to_update = []
        for debt in debts:
            debt.result.final_score = debt.original_score
            debt.result.status = debt.original_status
            results_to_update.append(debt.result)

        if results_to_update:
            EnrollmentResult.objects.bulk_update(
                results_to_update, ["final_score", "status"]
            )

@transaction.atomic
def toggle_assessment_publication(assessment: Assessment):
    if assessment.is_published:
        # --- DÉPUBLICATION ---
        # Bloquer si une session RETAKE publiée dépend de cette session NORMAL
        if assessment.session == "NORMAL":
            retake_published = Assessment.objects.filter(
                course_module=assessment.course_module,
                school_year=assessment.school_year,
                session="RETAKE",
                is_published=True,
            ).exists()
            if retake_published:
                raise ValidationError({
                    "detail":"La session de rattrapage doit être dépubliée avant de dépublier la session normale."
                })

        assessment.is_published = False
        assessment.save(update_fields=["is_published"])

    else:
        # --- PUBLICATION ---
        if assessment.session == "RETAKE":
            normal_published = Assessment.objects.filter(
                course_module=assessment.course_module,
                school_year=assessment.school_year,
                session="NORMAL",
                is_published=True,
            ).exists()
            if not normal_published:
                raise ValidationError({"detail":"La session normale doit être publiée avant la session de rattrapage."})
        else:
            retake_published = Assessment.objects.filter(
                course_module=assessment.course_module,
                school_year=assessment.school_year,
                session="RETAKE",
                is_published=True,
            ).exists()
            if retake_published:
                raise ValidationError(
                    {"detail":"La session de rattrapage doit être dépubliée avant de publier la session normale."}
                )

        if Grade.objects.filter(
            assessment=assessment,
            score__isnull=True,
        ).exists():
            raise ValidationError({"detail" : "Certains élèves n'ont pas de note à cet examen."})

        assessment.is_published = True
        assessment.save(update_fields=["is_published"])

    # --- UPDATE DES RÉSULTATS dans les deux cas ---
    update_results(assessment.course_module)

    return assessment

def delete_assessment(assessment : Assessment):
    if assessment.session == Assessment.Session.NORMAL:
        if Assessment.objects.filter(
            course_module=assessment.course_module,
            school_year=assessment.school_year,
            session=Assessment.Session.RETAKE
            ).exists():
            raise ValidationError({"detail":"suppression impossible : des examen session rattrapage éxiste encore"})
        
    update_results(assessment.course_module)
    assessment.delete()

@transaction.atomic
def bulk_deliberate(formation_id=None,semester_id=None):

    active_sy = SchoolYear.objects.filter(
        status=SchoolYear.Status.ACTIVE
    ).exists()

    if not active_sy:
        raise ValidationError({
            "detail": "aucune année scolaire est active pour le moment."
        })

    query = Q(enrollment__status=Enrollment.Status.ACTIVE)
    if formation_id:
        query = query & Q(enrollment__formation__id=formation_id)
    if semester_id:
        query = query & Q(enrollment__semester_id=semester_id)


    # 1. Trouver les UE non validées par enrollment
    failed_enrollments = (
        EnrollmentResult.objects
        .filter(query)
        .values(
            "enrollment_id",
            "course_module__course_unit_id",
            "course_module__course_unit__min_val_score",
        )
        .annotate(
            weighted_score=Sum(
                F("final_score") * F("course_module__credits"),
                output_field=FloatField()
            ),
            total_credits=Sum("course_module__credits"),
        )
        .annotate(
            average=ExpressionWrapper(
                F("weighted_score") / F("total_credits"),
                output_field=FloatField(),
            )
        )
        .filter(
            average__lt=F("course_module__course_unit__min_val_score")
        )
        .values_list("enrollment_id", flat=True)
        .distinct()
    )

    # 2. Tous les enrollments actifs
    qs = Enrollment.objects.filter(
        status=Enrollment.Status.ACTIVE
    )

    qs.exclude(
        id__in=failed_enrollments
    ).update(status=Enrollment.Status.VALIDATED)