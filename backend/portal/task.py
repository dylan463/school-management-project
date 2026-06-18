from celery import shared_task
from django.core.files.base import ContentFile
import pandas as pd
from structures.user_services import create_user,send_email,registration_email_template
from structures.models import User,Formation,SchoolYear,Semester,Role
from rest_framework.exceptions import ValidationError
from assessments.services import create_enrollment
from django.db.models import Q
from django.db import transaction
from notifications.utils import create_notification
from .models import ImportJob

@shared_task(bind=True,acks_late=True)
def create_users_from_dataset(self, records: list, formation_id: int, semester_id: int, school_year_id: int,inculde_auth=False):
    try:
        formation = Formation.objects.get(pk=formation_id)
        semester = Semester.objects.get(pk=semester_id)
        school_year = SchoolYear.objects.get(pk=school_year_id)
        mention = semester.mention
        role = Role.STUDENT
        report = []
        name = f"IE-{semester.code}-{formation.text}-{school_year.text}"

        df = pd.DataFrame(records)
        total = len(df)

        import_job, _ = ImportJob.objects.get_or_create(task_id=self.request.id)
        import_job.import_type = "STUDENT_CREATION"
        import_job.name = name
        import_job.total_rows = total
        import_job.status = ImportJob.Status.PROGRESS
        import_job.save()
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
                
                msg = f"M:/P : {student.username}/{password}"
                report.append({
                    "nom": row.get("nom"),
                    "prenoms": row.get("prenoms"),
                    "email": row.get("email"),
                    "status": msg
                })
            except ValidationError as e:
                transaction.savepoint_rollback(sid)
                detail = e.detail
                if isinstance(detail, dict):
                    msg = " | ".join(
                        f"{key}: {value}" for key, value in detail.items()
                    )
                else:
                    msg = str(detail)
                report.append({
                    "nom": row.get("nom"),
                    "prenoms": row.get("prenoms"),
                    "email": row.get("email"),
                    "status": msg
                })
            except Exception as e:
                transaction.savepoint_rollback(sid)
                report.append({
                    "nom": row.get("nom"),
                    "prenoms": row.get("prenoms"),
                    "email": row.get("email"),
                    "status": msg
                })

            import_job.processed_rows = i + 1
            import_job.save()

        csv_content = pd.DataFrame(report).to_csv(index=False)
        import_job.report_file.save(f"report_{name}_{self.request.id}.csv", ContentFile(csv_content.encode('utf-8')))

        import_job.status = ImportJob.Status.COMPLETED
        import_job.success_count = total - len(report)
        import_job.error_count = len(report)
        import_job.save()

        return {
            "success": total - len(report),
            "report": len(report)
        }
    except Exception as e:
        print("-"*25)
        print("erreur pendant le traitement dans la task : \n",str(e))
        print("-"*25)
        import_job.status = ImportJob.Status.FAILED
        import_job.success_count = total - len(report)
        import_job.error_count = len(report)
        import_job.save()
        return {
            "success": total - len(report),
            "report": len(report)
        }

@shared_task(bind=True ,acks_late=True)
def create_enrollment_from_dataset(self, records: list, formation_id: int, semester_id: int, school_year_id: int):
    try :
        formation = Formation.objects.get(pk=formation_id)
        semester = Semester.objects.get(pk=semester_id)
        school_year = SchoolYear.objects.get(pk=school_year_id)
        report = []
        name = f"RE-{semester.code}-{formation.text}-{school_year.text}"

        df = pd.DataFrame(records)
        total = len(df)

        import_job, _ = ImportJob.objects.get_or_create(task_id=self.request.id)
        import_job.import_type = "ENROLLMENT"
        import_job.name = name
        import_job.total_rows = total
        import_job.status = ImportJob.Status.PROGRESS
        import_job.save()
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
                msg = "Inscription réussit"
                report.append({
                    "nom": row.get("nom"),
                    "prenoms": row.get("prenoms"),
                    "email": row.get("email"),
                    "status": msg
                })

            except ValidationError as e:
                transaction.savepoint_rollback(sid)
                detail = e.detail
                if isinstance(detail, dict):
                    msg = " | ".join(
                        f"{key}: {value}" for key, value in detail.items()
                    )
                else:
                    msg = str(detail)

                report.append({
                    "nom": row.get("nom"),
                    "prenoms": row.get("prenoms"),
                    "email": row.get("email"),
                    "status": msg
                })

            except Exception as e:
                transaction.savepoint_rollback(sid)
                report.append({
                    "nom": row.get("nom"),
                    "prenoms": row.get("prenoms"),
                    "email": row.get("email"),
                    "status": str(e)
                })

            import_job.processed_rows = i + 1
            import_job.save()

        csv_content = pd.DataFrame(report).to_csv(index=False)
        import_job.report_file.save(f"report_{name}_{self.request.id}.csv", ContentFile(csv_content.encode('utf-8')))

        import_job.status = ImportJob.Status.COMPLETED
        import_job.success_count = total - len(report)
        import_job.error_count = len(report)
        import_job.save()

        return {
            "success": total - len(report),
            "report": len(report)
        }
    except Exception as e:
        print("-"*25)
        print("erreur pendant le traitement dans la task : \n",str(e))
        print("-"*25)
        import_job.status = ImportJob.Status.FAILED
        import_job.success_count = total - len(report)
        import_job.error_count = len(report)
        import_job.save()
        return {
            "success": total - len(report),
            "report": len(report)
        }