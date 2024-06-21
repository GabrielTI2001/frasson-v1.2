from django.db import models
from users.models import User
import uuid

class MyAppPermissions(models.Model):
    class Meta:
        managed = False  # No database table creation or deletion operations will be performed for this model.
        permissions = [
            ("gerenciar_kpis", "Gerenciar KPIs")
        ]

class Indicadores_Frasson(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    description = models.CharField(max_length=255, null=True, verbose_name='Descrição Indicador')
    polarity = models.BooleanField(default=True, null=True, verbose_name='Polaridade do Indicador')
    is_active = models.BooleanField(default=1)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Indicadores Frasson'
    def __str__(self):
        return self.description

class Metas_Realizados(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    indicator = models.ForeignKey(Indicadores_Frasson, to_field='uuid', on_delete=models.CASCADE, verbose_name='Indicador')
    year = models.IntegerField(null=True, blank=True, verbose_name='Ano')
    month = models.IntegerField(null=True, verbose_name='Mês')
    target = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Meta Mês')
    actual = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Realizado Mês')
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Responsável')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Metas e Realizados Frasson'
    def __str__(self):
        return f"{self.indicator.description} - {self.year}"

