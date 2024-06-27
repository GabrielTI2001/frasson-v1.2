from django.db import models
from users.models import User, Profile
from finances.models import Caixas_Frasson, Categorias_Pagamentos, Contratos_Servicos
from cadastro.models import Cadastro_Pessoal, Instituicoes_Parceiras, Instituicoes_Razao_Social, Produtos_Frasson, Detalhamento_Servicos
import uuid, time, random

def gerarcode():
    timenumber = int(time.time())
    code = timenumber - 1200000000 + random.randint(1, 10000)
    return code

class Pipe(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    descricao = models.CharField(max_length=255, null=False, blank=False, verbose_name='Descricao Pipe')
    pessoas = models.ManyToManyField(User, verbose_name='Pessoas Autorizadas', related_name="pessoas_autorizadas")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Pipe'
    def __str__(self):
        return self.descricao


class Fase(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    pipe = models.ForeignKey(Pipe, on_delete=models.CASCADE)
    descricao = models.CharField(max_length=255, null=False, blank=False, verbose_name='Nome Fase')
    responsaveis = models.ManyToManyField(User, verbose_name='Responsáveis', related_name="responsaveis_fase")
    dias_prazo = models.IntegerField(null=True)
    done = models.BooleanField(null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Fases'
        ordering = ['done', 'pk']
    def __str__(self):
        return self.descricao
    
class Card_Produtos(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    card = models.CharField(max_length=255, null=True, verbose_name='Tipo Card')
    prioridade = models.CharField(max_length=255, null=True, verbose_name='Prioridade')
    beneficiario = models.ManyToManyField(Cadastro_Pessoal, verbose_name='Nome Beneficiário')
    responsaveis = models.ManyToManyField(User, verbose_name='Responsáveis', related_name='responsaveis')
    detalhamento = models.ForeignKey(Detalhamento_Servicos, on_delete=models.SET_NULL, null=True, verbose_name='Detalhamento Serviço')
    instituicao = models.ForeignKey(Instituicoes_Parceiras, on_delete=models.SET_NULL, null=True, verbose_name='Instituição Parceira')
    contrato = models.ForeignKey(Contratos_Servicos, on_delete=models.SET_NULL, null=True, verbose_name='Contrato Serviço')
    valor_operacao = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor da Operação')
    faturamento_estimado = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Faturamento Estimado')
    data_vencimento = models.DateField(null=True, verbose_name='Data de Vencimento')
    phase = models.ForeignKey(Fase, on_delete=models.CASCADE, null=True, verbose_name='Fase')
    card_url = models.CharField(max_length=255, null=True, verbose_name='URL do Card')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Produtos Frasson'
    def __str__(self):
        return self.detalhamento.detalhamento_servico
        
class Card_Prospects(models.Model): 
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    cliente = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Cadastro Prospect')
    produto = models.CharField(max_length=255, null=True, verbose_name='Produto de Interesse')
    classificacao = models.CharField(max_length=255, null=True, verbose_name='Classificação do Prospect')
    origem = models.CharField(max_length=255, null=True, verbose_name='Origem do Prospect')
    proposta_inicial = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Proposta Inicial')
    proposta_aprovada = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Proposta Aprovada')
    percentual_inicial = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Percentual Inicial')
    percentual_aprovado = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Percentual Aprovado')
    data_vencimento = models.DateTimeField(null=True, verbose_name='Data de Vencimento')
    phase = models.ForeignKey(Fase, on_delete=models.CASCADE, null=True, verbose_name='Fase Atual')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Prospects Frasson'
    def __str__(self):
        return self.cliente.razao_social

class Card_Pagamentos(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    beneficiario = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True)
    descricao = models.CharField(max_length=255, null=True, verbose_name='Descrição')
    detalhamento = models.TextField(null=True, verbose_name='Detalhamento Pagamento')
    categoria = models.ForeignKey(Categorias_Pagamentos, on_delete=models.SET_NULL, null=True, verbose_name='Categoria')
    phase_id = models.BigIntegerField(null=True, verbose_name='Id da Fase Atual')
    phase_name = models.CharField(max_length=255, null=True, verbose_name='Nome da Fase Atual')
    valor_pagamento = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    data_vencimento = models.DateField(null=True, verbose_name='Data Vencimento')
    data_pagamento = models.DateField(null=True, verbose_name='Data Pagamento')
    caixa = models.ForeignKey(Caixas_Frasson, on_delete=models.SET_NULL, null=True, verbose_name='Caixa Saída')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Pagamentos Pipefy'
    def __str__(self):
        return self.beneficiario.razao_social

class Card_Cobrancas(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
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
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Cobranças Pipefy'
    def __str__(self):
        return self.cliente.razao_social

class Phases_History(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    produto = models.ForeignKey(Card_Produtos, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    prospec = models.ForeignKey(Card_Prospects, on_delete=models.CASCADE, null=True, verbose_name='Prospect')
    cobranca = models.ForeignKey(Card_Cobrancas, on_delete=models.CASCADE, null=True, verbose_name='Pagamento')
    pagamento = models.ForeignKey(Card_Pagamentos, on_delete=models.CASCADE, null=True, verbose_name='Pagamento')
    first_time_in = models.DateTimeField(null=True)
    last_time_in = models.DateTimeField(null=True)
    last_time_out = models.DateTimeField(null=True)
    phase = models.ForeignKey(Fase, on_delete=models.CASCADE, null=True, verbose_name='Fase')
    moved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Movido por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Histórico de Fases'

class Card_Coments(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    card_produto = models.ForeignKey(Card_Produtos, null=True, verbose_name='Card Produtos', on_delete=models.CASCADE)
    card_prospect = models.ForeignKey(Card_Prospects, null=True, verbose_name='Card Prospects', on_delete=models.CASCADE)
    card_pagamento = models.ForeignKey(Card_Pagamentos, null=True, verbose_name='Card Pagamentos', on_delete=models.CASCADE)
    card_cobranca = models.ForeignKey(Card_Cobrancas, null=True, verbose_name='Card Cobranças', on_delete=models.CASCADE)
    text = models.TextField(null=True, verbose_name='Texto')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Produtos Frasson'
    def __str__(self):
        return self.text