from django.db import models
from pipefy.models import Cadastro_Pessoal, Imoveis_Rurais
from cadastro.models import Municipios
from users.models import User

class Glebas_Areas(models.Model):
    cliente = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Cliente')
    gleba = models.CharField(max_length=255, null=True, verbose_name='Identificação da Gleba')
    propriedade = models.ManyToManyField(Imoveis_Rurais, verbose_name='Fazendas')
    municipio = models.ForeignKey(Municipios, on_delete=models.CASCADE, null=True, verbose_name='Município')
    area = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Área da Gleba')
    descricao = models.TextField(null=True, default=None, verbose_name='Descrição da Gleba')
    #pivot = models.ForeignKey(Cadastro_Pivots, on_delete=models.CASCADE, null=True, default=None, verbose_name='Pivot')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Glebas e Áreas'
    def __str__(self):
        return self.cliente.razao_social

class Glebas_Coordenadas(models.Model):
    gleba = models.ForeignKey(Glebas_Areas, on_delete=models.CASCADE, null=True, verbose_name='Gleba')
    latitude_gd = models.DecimalField(max_digits=15, decimal_places=12, verbose_name='Latitude GD')
    longitude_gd = models.DecimalField(max_digits=15, decimal_places=12, verbose_name='Longitude GD')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Coordenadas Glebas'
    def __str__(self):
        return self.gleba.gleba