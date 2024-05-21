from django.db import models
from pipefy.models import Cadastro_Pessoal, Fornecedores_Colaboradores, Contratos_Servicos, Detalhamento_Servicos
from users.models import User

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
    id = models.BigIntegerField(primary_key=True)
    caixa = models.CharField(max_length=255, null=True, verbose_name='Conta')
    sigla = models.CharField(max_length=50, null=True, blank=True, verbose_name='Sigla')
    numero_agencia = models.CharField(max_length=100, null=True, blank=True, verbose_name='Número Agência')
    numero_conta = models.CharField(max_length=100, null=True, blank=True, verbose_name='Número Conta')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Caixas Frasson'
    def __str__(self):
        return self.caixa
    
class Saldos_Iniciais(models.Model):
    caixa = models.OneToOneField(Caixas_Frasson, on_delete=models.CASCADE, null=True, verbose_name='Caixa')
    valor = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    data_referencia = models.DateField(null=True, verbose_name='Data Referência')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Saldos Iniciais'
    def __str__(self):
        return self.caixa.caixa

class Status_Pagamentos(models.Model):
    description = models.CharField(max_length=255, verbose_name='Status do Pagamento')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Status Pagamento'
    def __str__(self):
        return self.description
    
class Categorias_Pagamentos(models.Model):
    id = models.BigIntegerField(primary_key=True)
    category = models.CharField(max_length=255, verbose_name='Descrição da categoria')
    sub_category = models.CharField(max_length=255, verbose_name='Descrição da sub categoria')
    classification = models.CharField(max_length=255, verbose_name='Classificação')
    created_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField(null=True)
    class Meta:
        verbose_name_plural = 'Categorias Pagamentos'
    def __str__(self):
        return self.category

class Pagamentos_Pipefy(models.Model):
    id = models.BigIntegerField(primary_key=True)
    beneficiario = models.ForeignKey(Fornecedores_Colaboradores, on_delete=models.SET_NULL, null=True)
    descricao = models.CharField(max_length=255, null=True, verbose_name='Descrição')
    detalhamento = models.TextField(null=True, verbose_name='Detalhamento Pagamento')
    categoria = models.ForeignKey(Categorias_Pagamentos, on_delete=models.SET_NULL, null=True, verbose_name='Categoria')
    phase_id = models.BigIntegerField(null=True, verbose_name='Id da Fase Atual')
    phase_name = models.CharField(max_length=255, null=True, verbose_name='Nome da Fase Atual')
    valor_pagamento = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    data_vencimento = models.DateField(null=True, verbose_name='Data Vencimento')
    data_pagamento = models.DateField(null=True, verbose_name='Data Pagamento')
    caixa = models.ForeignKey(Caixas_Frasson, on_delete=models.SET_NULL, null=True, verbose_name='Caixa Saída')
    card_url = models.CharField(max_length=255, null=True, verbose_name='URL do card')
    created_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField(null=True)
    class Meta:
        verbose_name_plural = 'Pagamentos Pipefy'
    def __str__(self):
        return self.beneficiario.razao_social

class Cobrancas_Pipefy(models.Model):
    id = models.BigIntegerField(primary_key=True)
    cliente = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Cliente')
    contrato = models.ForeignKey(Contratos_Servicos, on_delete=models.SET_NULL, null=True, verbose_name='Contrato Serviço')
    etapa_cobranca = models.CharField(max_length=100, null=True, verbose_name='Etapa da Cobrança')
    detalhamento = models.ForeignKey(Detalhamento_Servicos, on_delete=models.SET_NULL, null=True, verbose_name='Detalhe Demanda')
    valor_operacao = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor Contratado')
    percentual_contratado = models.DecimalField(max_digits=5, decimal_places=2, null=True, verbose_name='Percentual Contratado')
    saldo_devedor = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Saldo Devedor')
    phase_id = models.BigIntegerField(null=True, verbose_name='Id da Fase Atual')
    phase_name = models.CharField(max_length=255, null=True, verbose_name='Nome da Fase Atual')
    data_previsao = models.DateField(null=True, verbose_name='Data Previsão Pagamento')
    caixa = models.ForeignKey(Caixas_Frasson, on_delete=models.SET_NULL, null=True, verbose_name='Caixa Entrada')
    valor_faturado = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor Faturado')
    data_pagamento = models.DateField(null=True, verbose_name='Data Pagamento')
    card_url = models.CharField(max_length=255, null=True, verbose_name='URL do card')
    created_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField(null=True)
    class Meta:
        verbose_name_plural = 'Cobranças Pipefy'
    def __str__(self):
        return self.cliente.razao_social
    
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
    data = models.DateField(null=True, verbose_name='Data da Movimentação')
    tipo = models.ForeignKey(Tipo_Receita_Despesa, on_delete=models.SET_NULL, null=True, verbose_name='Tipo de Receita ou Despesa')
    valor = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor da Movimentação')
    caixa = models.ForeignKey(Caixas_Frasson, on_delete=models.SET_NULL, null=True, verbose_name='Caixa')
    description = models.CharField(max_length=255, null=True, verbose_name='Descrição da Movimentação')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Movimentações Financeiras'
    def __str__(self):
        return self.tipo.description


class Transferencias_Contas(models.Model):
    caixa_origem = models.ForeignKey(Caixas_Frasson, on_delete=models.SET_NULL, null=True, related_name='caixa_origem_id')
    caixa_destino = models.ForeignKey(Caixas_Frasson, on_delete=models.SET_NULL, null=True, related_name='caixa_destino_id')
    description = models.TextField(null=True, blank=True)
    valor = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    data = models.DateField(null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Transferências Entre Contas'
    def __str__(self):
        return self.caixa_origem

class Reembolso_Cliente(models.Model):
    caixa_destino = models.ForeignKey(Caixas_Frasson, on_delete=models.SET_NULL, null=True)
    description = models.TextField(null=True, blank=True)
    valor = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    data = models.DateField(null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Reembolsos Clientes'
    def __str__(self):
        return self.caixa_destino