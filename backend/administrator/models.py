from django.db import models
import uuid
from pipefy.models import Pipe

class MyAppPermissions(models.Model):
    class Meta:
        managed = False  # No database table creation or deletion operations will be performed for this model.
        permissions = [
            ("ver_administrator", "Ver Administrator Panel")
        ]

class APIs(models.Model):
    descricao = models.CharField(max_length=60)
    main_url = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class RequestsAPI(models.Model):
    CHOICES = (('SP', 'SIGEF PARCELAS'), ('CI', 'CAR IMOVEL'), ('SV', 'VERTICES PARCELAS SIGEF'), ('CC', 'COORDENADAS IMOVEL CAR'))
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    api = models.ForeignKey(APIs, on_delete=models.SET_NULL, null=True)
    url = models.CharField(max_length=255)
    type = models.CharField(choices=CHOICES, max_length=3)
    codigo = models.CharField(max_length=255)
    tempo_decorrido_ms = models.BigIntegerField(null=True)
    valor_cobrado = models.DecimalField(decimal_places=2, max_digits=10)
    cod_resposta = models.CharField(max_length=10)
    text_resposta = models.CharField(max_length=255)
    hora_requisicao = models.DateTimeField()