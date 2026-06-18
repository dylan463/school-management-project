from notifications.models import Notification
from datetime import datetime
from .models import Enrollment


def maptomonth(m):
    return [
        "Janvier",
        "Fevrier",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Decembre"
    ][m]


def create_notifications_for_assessment(assessment):
    title = "Examen"
    session = "rattrapage" if assessment.session == "RETAKE" else "normale"
    cours = assessment.course_module.text
    date = assessment.date
    content = f"Vous avez un examen session {session} pour le cours {cours} le {date.day} {maptomonth(date.month)} {date.year}."

    enrollments = Enrollment.objects.filter(
        semester=assessment.course_module.semester,
        school_year=assessment.school_year,
        formation=assessment.course_module.course_unit.formation
    ).select_related("student")

    to_create = []

    for enrollment in enrollments:
        student = enrollment.student
        to_create.append(
            Notification(
                user=student,
                title=title,
                content=content
                )
        )
    
    Notification.objects.bulk_create(to_create)
    