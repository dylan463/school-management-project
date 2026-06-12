from django.db import models

class ImportJob(models.Model):
    IMPORT_TYPE_CHOICES = (
        ('STUDENT_CREATION', 'Création d\'étudiants'),
        ('ENROLLMENT', 'Inscription'),
    )
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'En attente'
        PROGRESS = 'PROGRESS', 'En cours'
        COMPLETED = 'COMPLETED', 'Terminé'
        FAILED = 'FAILED', 'Échoué'
    task_id = models.CharField(max_length=255)
    name= models.CharField(max_length=255,blank=True,null=True)
    import_type = models.CharField(max_length=50, choices=IMPORT_TYPE_CHOICES, default='STUDENT_CREATION')
    total_rows = models.IntegerField(default=0)
    processed_rows = models.IntegerField(default=0)
    status = models.CharField(max_length=50, choices=Status.choices)
    success_count = models.IntegerField(default=0)
    error_count = models.IntegerField(default=0)
    input_file = models.FileField(upload_to='imports/', null=True, blank=True)
    report_file = models.FileField(upload_to='import_reports/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def delete(self, *args, **kwargs):
        if self.input_file:
            self.input_file.delete(save=False)
        if self.report_file:
            self.report_file.delete(save=False)
        super().delete(*args, **kwargs)
