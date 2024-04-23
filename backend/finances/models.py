from django.db import models
from pipefy.models import Cadastro_Pessoal, Fornecedores_Colaboradores, Contratos_Servicos, Detalhamento_Servicos, Fase

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
    phase = models.ForeignKey(Fase, on_delete=models.CASCADE, null=True, verbose_name='Fase')
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
    phase = models.ForeignKey(Fase, on_delete=models.CASCADE, null=True, verbose_name='Fase')
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