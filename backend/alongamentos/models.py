from django.db import models
from cadastro.models import Municipios, Instituicoes_Parceiras
from cadastro.models import Cadastro_Pessoal
from farms.models import Imoveis_Rurais
from credit.models import Operacoes_Contratadas
from cadastro.models import Culturas_Agricolas
from users.models import User
import uuid

class Produto_Agricola(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    cultura = models.ForeignKey(Culturas_Agricolas, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Cultura')
    description = models.CharField(max_length=255, null=True, verbose_name='Descrição do Produto')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Produtos Agrícolas'
    def __str__(self):
        return self.description
    
class Tipo_Armazenagem(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    description = models.CharField(max_length=255, null=True, verbose_name='Descrição Tipo Armazenagem')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Tipo Armazenagem Produto'
    def __str__(self):
        return self.description
    
class Tipo_Classificacao(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    description = models.CharField(max_length=255, null=True, verbose_name='Descrição Tipo Classificação')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Tipo Classificação Produto'
    def __str__(self):
        return self.description

class Cadastro_Alongamentos(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    data = models.DateField(null=True, verbose_name='Data Alongamento')
    operacao = models.ForeignKey(Operacoes_Contratadas, on_delete=models.SET_NULL, null=True, verbose_name='Operação de Crédito')
    percentual = models.DecimalField(max_digits=5, decimal_places=2, null=True, verbose_name='Percentual Exigido Alongamento') 
    valor_unitario = models.DecimalField(max_digits=15, decimal_places=5, null=True, verbose_name='Valor Unitário')
    valor_total = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor Total Alongamento')
    quant_penhor_kg = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Quantidade de Penhor') 
    quant_penhor_tons = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Quantidade Penhos Tons')
    quant_sacas_60_kg = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Quantidade Sacas')
    agencia_bancaria = models.ForeignKey(Instituicoes_Parceiras, on_delete=models.SET_NULL, null=True, verbose_name='Agência Bancária')
    propriedades = models.ManyToManyField(Imoveis_Rurais, verbose_name='Imóveis Rurais')
    fiel_depositario = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Fiel Depositário', related_name='fiel_depositario_id')
    produto_agricola = models.ForeignKey(Produto_Agricola, on_delete=models.SET_NULL, null=True, verbose_name='Produto Agrícola')
    tipo_armazenagem = models.ForeignKey(Tipo_Armazenagem, on_delete=models.SET_NULL, null=True, verbose_name='Tipo Armazenagem')
    capacidade_estatica_sacas_60_kg = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Capacidade Estática Armazenagem')
    tipo_classificacao = models.ForeignKey(Tipo_Classificacao, on_delete=models.SET_NULL, null=True, verbose_name='Tipo Classificação')
    testemunha01 = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Testemunha 01', related_name='testemunha01_id')
    testemunha02 = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Testemunha 01', related_name='testemunha02_id')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Cadastro Alongamentos'
    def __str__(self):
        return f"{self.operacao.numero_operacao} - {self.operacao.beneficiario.razao_social}"
    
