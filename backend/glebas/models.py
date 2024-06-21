from django.db import models
from farms.models import Imoveis_Rurais
from cadastro.models import Cadastro_Pessoal
from users.models import User
import uuid

class Cadastro_Glebas(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    cliente = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Cliente')
    gleba = models.CharField(max_length=255, null=True, verbose_name='Identificação da Gleba')
    propriedades = models.ManyToManyField(Imoveis_Rurais, verbose_name='Fazendas')
    area = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Área da Gleba')
    descricao = models.TextField(null=True, default=None, verbose_name='Descrição da Gleba')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Cadastro Glebas'
    def __str__(self):
        return self.cliente.razao_social

class Cadastro_Glebas_Coordenadas(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    gleba = models.ForeignKey(Cadastro_Glebas, on_delete=models.CASCADE, null=True, verbose_name='Gleba')
    latitude_gd = models.DecimalField(max_digits=15, decimal_places=12, verbose_name='Latitude GD')
    longitude_gd = models.DecimalField(max_digits=15, decimal_places=12, verbose_name='Longitude GD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Coordenadas Glebas'
    def __str__(self):
        return self.gleba.gleba