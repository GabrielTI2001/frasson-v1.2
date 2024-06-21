from django.db import models
import uuid
from cadastro.models import Cadastro_Pessoal, Instituicoes_Parceiras
from farms.models import Imoveis_Rurais
from users.models import User

class Itens_Financiados(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    item = models.CharField(max_length=255, null=True, verbose_name='Item Financiado')
    tipo = models.CharField(max_length=255, null=True, verbose_name='Tipo Item Financiado')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Cadastro de Itens Financiados'
    def __str__(self):
        return self.item

class Operacoes_Contratadas(models.Model): 
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    beneficiario = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Beneficiário')
    numero_operacao = models.CharField(max_length=255, null=True, verbose_name='Número da Operação')
    item_financiado = models.ForeignKey(Itens_Financiados, on_delete=models.SET_NULL, null=True, verbose_name='Item Financiado')
    valor_operacao = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor da Operação')
    area_beneficiada = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Área Total Beneficiada')
    quantidade_kg = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Quantidade em Kg')
    varidade_semente = models.CharField(max_length=255, null=True, verbose_name='Variedade Semente')
    prod_esperada_kg_ha = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Produtividade Esperada')
    adubacao_total = models.TextField(null=True, verbose_name='Adubação Total')
    instituicao = models.ForeignKey(Instituicoes_Parceiras, on_delete=models.SET_NULL, null=True, verbose_name='Instituição Parceira')
    fonte_recurso = models.CharField(max_length=255, null=True, verbose_name='Fonte do Recurso')
    imoveis_beneficiados = models.ManyToManyField(Imoveis_Rurais, verbose_name='Imóvel Beneficiado')
    data_emissao_cedula = models.DateField(null=True, verbose_name='Data Emissão Cédula')
    data_primeiro_vencimento = models.DateField(null=True, verbose_name='Data Primeiro Vencimento')
    data_prod_armazenado = models.DateField(null=True, verbose_name='Data Prod. Armazenado')
    data_vencimento = models.DateField(null=True, verbose_name='Data Vencimento')
    taxa_juros = models.DecimalField(max_digits=10, decimal_places=4, null=True, verbose_name='Taxa Juros')
    safra = models.CharField(max_length=50, null=True, verbose_name='Safra')
    garantia = models.TextField(null=True, verbose_name='Garantia')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Operações Contratadas'
    def __str__(self):
        return self.beneficiario.razao_social
    
class Operacoes_Contratadas_Cedulas(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    operacao = models.ForeignKey(Operacoes_Contratadas, on_delete=models.CASCADE, null=True)
    file = models.FileField(upload_to='credit/cedulas', null=True, verbose_name='Arquivo PDF Cédula')
    upload_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    upload_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        verbose_name_plural = 'Cédulas Operações'
    def __str__(self):
        return self.operacao.beneficiario.razao_social

class Operacoes_Contratadas_Glebas(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    operacao = models.ForeignKey(Operacoes_Contratadas, on_delete=models.CASCADE, null=True, verbose_name='Gleba')
    latitude_gd = models.DecimalField(max_digits=15, decimal_places=12, verbose_name='Latitude GD')
    longitude_gd = models.DecimalField(max_digits=15, decimal_places=12, verbose_name='Longitude GD')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Coordenadas Glebas Operações'
    def __str__(self):
        return self.operacao.beneficiario.razao_social