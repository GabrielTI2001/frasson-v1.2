from django.db import models
from users.models import User
from glebas.models import Cadastro_Glebas
from cadastro.models import Culturas_Agricolas
import uuid

# class Status(models.Model):
#     description = models.CharField(max_length=100, verbose_name='Descrição Status')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     class Meta:
#         verbose_name_plural = 'Status'
#     def __str__(self):
#         return self.description
    
class Sistema_Producao_Pecuaria(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    description = models.CharField(max_length=250, verbose_name='Descrição Sistema Produção')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Sistema Produção Pecuária'
    def __str__(self):
        return self.description
    

class Unidade_Producao_Pecuaria(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    description = models.CharField(max_length=250, verbose_name='Descrição Unidade Produção')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Unidade Produção Pecuária'
    def __str__(self):
        return self.description


class Produto_Principal_Pecuaria(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    description = models.CharField(max_length=250, verbose_name='Produto Principal Pecuária')
    sigla = models.CharField(max_length=100, verbose_name='Sigla Produto Principal Pecuária')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Produto Principal Pecuária'
    def __str__(self):
        return self.description
    

class Producao_Agricola(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    gleba = models.ForeignKey(Cadastro_Glebas, on_delete=models.CASCADE, null=True, verbose_name='Gleba')
    cultura = models.ForeignKey(Culturas_Agricolas, on_delete=models.CASCADE, null=True, blank=True, verbose_name='Cultura')
    variedade = models.CharField(max_length=150, null=True, verbose_name='Variedade Cultura')
    safra = models.CharField(max_length=255, null=True, blank=True, verbose_name='Safra')
    plantio = models.CharField(max_length=255, null=True, blank=True, verbose_name='Meses Plantio')
    colheita = models.CharField(max_length=255, null=True, blank=True, verbose_name='Meses Colheita')
    prod_prevista_kg = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Produção Prevista em kg')
    prod_obtida_kg = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True,verbose_name='Produção Obtida em kg')
    descricao = models.TextField(null=True, blank=True, verbose_name='Descrição')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Produção Agrícola'    
    def __str__(self):
        return self.cultura.cultura

class Producao_Pecuaria(models.Model):
    TIPO_CHOICES = (
        ('P', 'Prevista'),
        ('O', 'Obtida'),
    )
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    gleba = models.ForeignKey(Cadastro_Glebas, on_delete=models.CASCADE, null=True, verbose_name='Gleba')
    sistema_producao = models.ForeignKey(Sistema_Producao_Pecuaria, on_delete=models.SET_NULL, null=True, verbose_name='Sistema Produção Pecuária')
    unidade_producao = models.ForeignKey(Unidade_Producao_Pecuaria, on_delete=models.SET_NULL, null=True, verbose_name='Unidade Produção Pecuária')
    produto_principal = models.ForeignKey(Produto_Principal_Pecuaria, on_delete=models.SET_NULL, null=True, verbose_name='Produto Principal Pecuária')
    tipo_producao = models.CharField(max_length=1, choices=TIPO_CHOICES, null=True, verbose_name='Tipo Produção')
    ano = models.IntegerField(null=True, verbose_name='Ano')
    quantidade = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True,verbose_name='Quantidade')
    produtos_secundarios = models.TextField(null=True, blank=True, verbose_name='Produtos Secundários')
    observacoes = models.TextField(null=True, blank=True, verbose_name='Observações')
    file = models.FileField(upload_to='litecs/pecuaria', null=True, default=None, verbose_name='Arquivo PDF')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Produção Pecuária'    
    def __str__(self):
        return self.gleba.gleba