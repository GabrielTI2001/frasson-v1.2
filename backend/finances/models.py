from django.db import models
from cadastro.models import Cadastro_Pessoal, Detalhamento_Servicos
from users.models import User
import uuid

class MyAppPermissions(models.Model):
    class Meta:
        managed = False  # No database table creation or deletion operations will be performed for this model.
        permissions = [
            ("ver_menu_financeiro", "Ver Menu Financeiro"),
            ("ver_saldos_bancarios", "Ver Saldos Bancários"),
            ("ver_dre_consolidado", "Ver DRE Consolidado"),
            ("ver_dre_provisionado", "Ver DRE Provisionado"),
        ]


class Caixas_Frasson(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    nome = models.CharField(max_length=255, null=True, verbose_name='Nome Caixa')
    sigla = models.CharField(max_length=50, null=True, blank=True, verbose_name='Sigla')
    numero_agencia = models.CharField(max_length=100, null=True, blank=True, verbose_name='Número Agência')
    numero_conta = models.CharField(max_length=100, null=True, blank=True, verbose_name='Número Conta')
    saldo_inicial = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    is_active = models.BooleanField(default=True)
    logo = models.FileField(upload_to='logos/caixas', null=True, verbose_name='Logo')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Caixas Frasson'
    def __str__(self):
        return self.nome

class Contratos_Servicos(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    contratante = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Contratante')
    servicos = models.ManyToManyField(Detalhamento_Servicos, verbose_name='Serviços Contratados')
    detalhes = models.TextField(null=True, verbose_name='Detalhe Negociação')
    percentual = models.FloatField(null=True, verbose_name='Percentual')
    valor = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    data_assinatura = models.DateField(null=True, verbose_name='Data Assinatura')
    data_vencimento = models.DateField(null=True, verbose_name='Data Vencimento')
    pdf = models.FileField(upload_to='finances/contratos', null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Contratos Serviços'
    def __str__(self):
        return self.contratante.razao_social
    
class Contratos_Servicos_Pagamentos(models.Model):
    CHOICES_ETAPAS = (
        ("A", "Assinatura Contrato"),
        ("P", "Protocolo"),
        ("E", "Encerramento")
    )
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    contrato = models.ForeignKey(Contratos_Servicos, on_delete=models.CASCADE, null=True)
    servico = models.ForeignKey(Detalhamento_Servicos, on_delete=models.SET_NULL, null=True)
    etapa = models.CharField(max_length=1, choices=CHOICES_ETAPAS, null=True, verbose_name="Etapa Pagamento")
    percentual = models.DecimalField(max_digits=8, decimal_places=2, null=True, verbose_name="percentual")
    valor = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor')
    observacoes = models.TextField(null=True, blank=True, verbose_name="Observações")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Contratos - Forma Pagamento'
    def __str__(self):
        return self.contrato.contratante.razao_social

class Categorias_Pagamentos(models.Model):
    CHOICES_CLASS = (
        ("COE", "Custo Operacional"),
        ("DOP", "Despesa Operacional"),
        ("DNOP", "Despesa Não Operacional"),
        ("II", "Impostos Indiretos"),
        ("ID", "Impostos Diretos"),
        ("RS", "Retirada de Sócio"),
        ("PC", "Pagamento Comissão"),
        ("AI", "Ativos Imobilizados"),
        ("O", "Outros")
    )
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    category = models.CharField(max_length=255, verbose_name='Descrição da categoria')
    sub_category = models.CharField(max_length=255, verbose_name='Descrição da sub categoria')
    classification = models.CharField(max_length=5, choices=CHOICES_CLASS, null=True, verbose_name='Classificação')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Categorias Pagamentos'
    def __str__(self):
        return self.category
    
class Tipo_Receita_Despesa(models.Model):
    TIPO_CHOICES = (
        ("R", "Receita"),
        ("D", "Despesa")
    )
    tipo = models.CharField(max_length=1, choices=TIPO_CHOICES, null=True, verbose_name='Receita ou Despesa')
    description = models.CharField(max_length=255, null=True, verbose_name='Descrição da Receita ou Despesa')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Tipos de Receita ou Despesa'
    def __str__(self):
        return self.description


class Resultados_Financeiros(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    data = models.DateField(null=True, verbose_name='Data da Movimentação')
    tipo = models.ForeignKey(Tipo_Receita_Despesa, on_delete=models.SET_NULL, null=True, verbose_name='Tipo de Receita ou Despesa')
    valor = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor da Movimentação')
    caixa = models.ForeignKey(Caixas_Frasson, on_delete=models.SET_NULL, null=True, verbose_name='Caixa')
    description = models.CharField(max_length=255, null=True, verbose_name='Descrição da Movimentação')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Movimentações Financeiras'
    def __str__(self):
        return self.tipo.description


class Transferencias_Contas(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    caixa_origem = models.ForeignKey(Caixas_Frasson, on_delete=models.SET_NULL, null=True, related_name='caixa_origem_id')
    caixa_destino = models.ForeignKey(Caixas_Frasson, on_delete=models.SET_NULL, null=True, related_name='caixa_destino_id')
    description = models.TextField(null=True, blank=True)
    valor = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    data = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Transferências Entre Contas'
    def __str__(self):
        return self.caixa_origem

class Reembolso_Cliente(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    cliente = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Cliente')
    data = models.DateField(null=True, verbose_name="Data")
    description = models.TextField(null=True, blank=True, verbose_name="Descrição")
    valor = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name="Valor")
    cobranca = models.BooleanField(default=False, verbose_name="Cobrança?")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Reembolsos Clientes'
    def __str__(self):
        return self.cliente.razao_social
    
class Lancamentos_Automaticos_Pagamentos(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    beneficiario = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Beneficiário')
    descricao = models.CharField(max_length=255, null=True, blank=True, verbose_name='Descrição do Lançamento')
    detalhamento = models.TextField(null=True, blank=True, verbose_name='Detalhamento do Lançamento')
    categoria_pagamento = models.ForeignKey(Categorias_Pagamentos, on_delete=models.SET_NULL, null=True)
    valor_pagamento = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Valor Pagamento')
    dia_vencimento = models.IntegerField(null=True, blank=True, verbose_name='Dia do Vencimento')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Lançamentos Autom. Pagamentos'
    def __str__(self):
        return self.beneficiario.razao_social