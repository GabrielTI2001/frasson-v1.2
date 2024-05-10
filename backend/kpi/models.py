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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Indicadores Frasson'
    def __str__(self):
        return self.description

class Metas_Realizados(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    year = models.IntegerField(null=True, blank=True, verbose_name='Ano')
    indicator = models.ForeignKey(Indicadores_Frasson, to_field='uuid', on_delete=models.CASCADE, verbose_name='Indicador')
    target_january = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Meta Janeiro')
    actual_january = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Realizado Janeiro')
    target_february = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Meta Fevereiro')
    actual_february = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Realizado Fevereiro')
    target_march = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Meta Março')
    actual_march = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Realizado Março')
    target_april = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Meta Abril')
    actual_april = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Realizado Abril')
    target_may = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Meta Maio')
    actual_may = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Realizado Maio')
    target_june = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Meta Junho')
    actual_june = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Realizado Junho')
    target_july = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Meta Julho')
    actual_july = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Realizado Julho')
    target_august = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Meta Agosto')
    actual_august = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Realizado Agosto')
    target_september = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Meta Setembro')
    actual_september = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Realizado Setembro')
    target_october = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Meta Outubro')
    actual_october = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Realizado Outubro')
    target_november = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Meta Novembro')   
    actual_november = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Realizado Novembro')
    target_december = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Meta Dezembro')
    actual_december = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, default=0, verbose_name='Realizado Dezembro')
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Responsável')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Metas e Realizados Frasson'
    def __str__(self):
        return f"{self.indicator.description} - {self.year}"

