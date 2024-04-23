from django.db import models
import uuid
from pipefy.models import Pipe

class MyAppPermissions(models.Model):
    class Meta:
        managed = False  # No database table creation or deletion operations will be performed for this model.
        permissions = [
            ("ver_administrator", "Ver Administrator Panel")
        ]
        
# Create your models here.
class Testes(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    pipe = models.ForeignKey(Pipe, on_delete=models.SET_NULL, null=True, verbose_name="Pipe testado")
    created_at = models.DateTimeField(auto_now_add=True)    
    updated_at = models.DateTimeField(auto_now=True)