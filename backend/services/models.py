from django.db import models
from django.contrib.auth.models import User
import uuid
from django.conf import settings

class Commodity_Cotacao(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    commodity = models.CharField(max_length=255, null=True, verbose_name='Produto')
    description = models.TextField(null=True, blank=True, verbose_name='Descrição do Produto')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Commodity'
    def __str__(self):
        return self.commodity

class Localizacao_Cotacao(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    location = models.CharField(max_length=255, null=True, verbose_name='Localização')
    description = models.TextField(null=True, blank=True, verbose_name='Descrição da Localização')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Localização Cotação'
    def __str__(self):
        return self.location

class Commodity_Prices(models.Model):
    date = models.DateField(null=True, verbose_name='Data Referência')
    commodity = models.ForeignKey(Commodity_Cotacao, on_delete=models.SET_NULL, null=True, verbose_name='Produto Cotação')
    location = models.ForeignKey(Localizacao_Cotacao, on_delete=models.SET_NULL, null=True, verbose_name='Localização')
    type = models.CharField(max_length=255, null=True, verbose_name='Tipo')
    unit = models.CharField(max_length=100, null=True, blank=True, verbose_name='Unidade de Cotação')
    price = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Preço da Cotação')
    source = models.CharField(max_length=255, null=True, blank=True, verbose_name='Fonte da Cotação')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Criado Por')  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Commodity Prices'
    def __str__(self):
        return self.commodity.commodity