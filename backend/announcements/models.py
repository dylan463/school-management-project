from django.db import models
from users.models import CustomUser
from structures.models import SchoolYear,Level,Formation

# Create your models here.
class Announcement(models.Model):
    title = models.CharField(max_length=100)
    content = models.CharField()
    author = models.ForeignKey(CustomUser,on_delete=models.CASCADE)
    created_at = models.DateField(auto_now_add=True)


class Audience(models.Model):
    school_year = models.ForeignKey(SchoolYear,on_delete=models.CASCADE)
    level = models.ForeignKey(Level,on_delete=models.CASCADE)
    Formation = models.ForeignKey(Formation,on_delete=models.CASCADE)
    announcement = models.ForeignKey(Announcement,on_delete=models.CASCADE,related_name="audiences")


class Read(models.Model):
    user = models.ForeignKey(CustomUser,on_delete=models.CASCADE)
    announcement = models.ForeignKey(Announcement,on_delete=models.CASCADE,related_name="reads")