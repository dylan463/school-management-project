from celery import shared_task
import pandas as pd
from structures.user_services import create_user,send_email,registration_email_template
from pathlib import Path
from structures.models import User,Formation,SchoolYear,Semester,Role
from rest_framework.exceptions import ValidationError
from assessments.services import create_enrollment
from django.db.models import Q
from django.db import transaction
from notifications.utils import create_notification

@shared_task(bind=True)
def create_users_from_dataset(self, records: list, formation_id: int, semester_id: int, school_year_id: int):
    formation = Formation.objects.get(pk=formation_id)
    semester = Semester.objects.get(pk=semester_id)
    school_year = SchoolYear.objects.get(pk=school_year_id)
    mention = semester.mention
    role = Role.STUDENT
    errors = []

    df = pd.DataFrame(records)
    total = len(df)

    for i, row in df.iterrows():
        sid = transaction.savepoint()
        try:
            if pd.isna(row.get("email")):
                raise AttributeError("l'email n'a pas été fourni")

            student ,password= create_user(row["nom"], row["prenoms"], row["email"], role, mention,no_email=True,return_password = True)
            create_enrollment(student, school_year, semester, formation,no_notification=True)
            transaction.savepoint_commit(sid)
            text_content,html_content = registration_email_template(student.username,password,mention.text)
            send_email('Creation de votre compte.',text_content,[student.email],html_content)
            create_notification(student,"Vous avez été inscrit.",f"votre réinscription en {semester.code} du parcours {formation.text} est réussit. L'année scolaire {school_year.text} ne fait que commencer. Bon courage !")

        except ValidationError as e:
            transaction.savepoint_rollback(sid)
            detail = e.detail
            if isinstance(detail, dict):
                msg = " | ".join(
                    f"{key}: {value}" for key, value in detail.items()
                )
            else:
                msg = str(detail)

            errors.append({
                "line": i + 2,
                "nom": row.get("nom"),
                "prenoms": row.get("prenoms"),
                "email": row.get("email"),
                "error": msg
            })

        except Exception as e:
            transaction.savepoint_rollback(sid)
            errors.append({
                "line": i + 2,
                "nom": row.get("nom"),
                "prenoms": row.get("prenoms"),
                "email": row.get("email"),
                "error": str(e)
            })

        self.update_state(
            state="PROGRESS",
            meta={
                "current": i + 1,
                "total": total,
                "percent": int((i + 1) * 100 / total)
            }
        )

    report_path = None
    if errors:
        report_dir = Path("media/import_reports")
        report_dir.mkdir(parents=True, exist_ok=True)
        report_path = report_dir / f"errors_{self.request.id}.csv"
        pd.DataFrame(errors).to_csv(report_path, index=False)

    return {
        "success": total - len(errors),
        "errors": len(errors),
        "report_path": str(report_path) if report_path else None
    }

@shared_task(bind=True)
def create_enrollment_from_dataset(self, records: list, formation_id: int, semester_id: int, school_year_id: int):
    formation = Formation.objects.get(pk=formation_id)
    semester = Semester.objects.get(pk=semester_id)
    school_year = SchoolYear.objects.get(pk=school_year_id)
    errors = []

    df = pd.DataFrame(records)
    total = len(df)

    base_query = Q(role=Role.STUDENT, mention=semester.mention)

    for i, row in df.iterrows():
        sid = transaction.savepoint()
        try:
            email_missing = pd.isna(row.get("email"))
            matricule_missing = pd.isna(row.get("matricule"))

            if email_missing:
                if matricule_missing:
                    raise AttributeError("Au moins soit l'email ou la matricule de l'utilisateur doit être fourni")
                else:
                    query = base_query & Q(username=row["matricule"])
            else:
                query = base_query & Q(email=row["email"])

            student = User.objects.filter(query).first()
            if not student:
                raise AttributeError("Cet étudiant n'existe pas dans la base de données")

            create_enrollment(student, school_year, semester, formation,no_notification=True)
            create_notification(student,"Vous avez été inscrit.",f"votre réinscription en {semester.code} du parcours {formation.text} est réussit. L'année scolaire {school_year.text} ne fait que commencer. Bon courage !")

            transaction.savepoint_commit(sid)

        except ValidationError as e:
            transaction.savepoint_rollback(sid)
            detail = e.detail
            if isinstance(detail, dict):
                msg = " | ".join(
                    f"{key}: {value}" for key, value in detail.items()
                )
            else:
                msg = str(detail)

            errors.append({
                "line": i + 2,
                "nom": row.get("nom"),
                "prenoms": row.get("prenoms"),
                "email": row.get("email"),
                "error": msg
            })

        except Exception as e:
            transaction.savepoint_rollback(sid)
            errors.append({
                "line": i + 2,
                "nom": row.get("nom"),
                "prenoms": row.get("prenoms"),
                "email": row.get("email"),
                "error": str(e)
            })

        self.update_state(
            state="PROGRESS",
            meta={
                "current": i + 1,
                "total": total,
                "percent": int((i + 1) * 100 / total)
            }
        )

    report_path = None
    if errors:
        report_dir = Path("media/import_reports")
        report_dir.mkdir(parents=True, exist_ok=True)
        report_path = report_dir / f"errors_{self.request.id}.csv"
        pd.DataFrame(errors).to_csv(report_path, index=False)

    return {
        "success": total - len(errors),
        "errors": len(errors),
        "report_path": str(report_path) if report_path else None
    }