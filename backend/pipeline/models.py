from django.db import models
from users.models import User, Profile
from cadastro.models import Cadastro_Pessoal, Instituicoes_Parceiras, Instituicoes_Razao_Social, Produtos_Frasson, Detalhamento_Servicos
from finances.models import Contratos_Ambiental , Contratos_Credito
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
    
class Fluxo_Gestao_Ambiental(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    prioridade = models.CharField(max_length=255, null=True, verbose_name='Prioridade')
    beneficiario = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Nome Beneficiário')
    responsaveis = models.ManyToManyField(User, verbose_name='Responsáveis', related_name='responsaveis')
    detalhamento = models.ForeignKey(Detalhamento_Servicos, on_delete=models.SET_NULL, null=True, verbose_name='Detalhamento Serviço')
    instituicao = models.ForeignKey(Instituicoes_Parceiras, on_delete=models.SET_NULL, null=True, verbose_name='Instituição Parceira')
    contrato = models.ForeignKey(Contratos_Ambiental, on_delete=models.SET_NULL, null=True, verbose_name='Contrato Serviço')
    data_vencimento = models.DateTimeField(null=True, verbose_name='Data de Vencimento')
    phase = models.ForeignKey(Fase, on_delete=models.CASCADE, null=True, verbose_name='Fase')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Fluxo Gestão Ambiental'
    def __str__(self):
        return self.detalhamento.detalhamento_servico

class Fluxo_Gestao_Credito(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    prioridade = models.CharField(max_length=255, null=True, verbose_name='Prioridade')
    card = models.CharField(max_length=255, null=True, verbose_name='Tipo Card')
    beneficiarios = models.ManyToManyField(Cadastro_Pessoal, verbose_name='Nome Beneficiário')
    responsaveis = models.ManyToManyField(User, verbose_name='Responsáveis', related_name='responsaveis2')
    detalhamento = models.ForeignKey(Detalhamento_Servicos, on_delete=models.SET_NULL, null=True, verbose_name='Detalhamento Serviço')
    instituicao = models.ForeignKey(Instituicoes_Parceiras, on_delete=models.SET_NULL, null=True, verbose_name='Instituição Parceira')
    contrato = models.ForeignKey(Contratos_Credito, on_delete=models.SET_NULL, null=True, verbose_name='Contrato Serviço')
    valor_operacao = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor')
    data_vencimento = models.DateTimeField(null=True, verbose_name='Data de Vencimento')
    phase = models.ForeignKey(Fase, on_delete=models.CASCADE, null=True, verbose_name='Fase')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Fluxo Gestão Crédito'
    def __str__(self):
        return self.detalhamento.detalhamento_servico
        
class Fluxo_Prospects(models.Model): 
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


class Phases_History(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    fluxo_ambiental = models.ForeignKey(Fluxo_Gestao_Ambiental, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    fluxo_prospect = models.ForeignKey(Fluxo_Prospects, on_delete=models.CASCADE, null=True, verbose_name='Prospect')
    fluxo_credito = models.ForeignKey(Fluxo_Gestao_Credito, on_delete=models.CASCADE, null=True, verbose_name='Produto')
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
    fluxo_ambiental = models.ForeignKey(Fluxo_Gestao_Ambiental, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    fluxo_prospect = models.ForeignKey(Fluxo_Prospects, on_delete=models.CASCADE, null=True, verbose_name='Prospect')
    fluxo_credito = models.ForeignKey(Fluxo_Gestao_Credito, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    text = models.TextField(null=True, verbose_name='Texto')
    phase = models.ForeignKey(Fase, null=True, verbose_name='Fase', on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Comentários Card'
    def __str__(self):
        return self.text

class Card_Activities(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    fluxo_ambiental = models.ForeignKey(Fluxo_Gestao_Ambiental, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    fluxo_prospect = models.ForeignKey(Fluxo_Prospects, on_delete=models.CASCADE, null=True, verbose_name='Prospect')
    fluxo_credito = models.ForeignKey(Fluxo_Gestao_Credito, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    type = models.CharField(null=True, max_length=60, choices=(('ch', 'change'),('co','comment'),('cf','fase')), verbose_name='Tipo')
    campo = models.CharField(null=True, max_length=60, verbose_name='Campo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Alterado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Atividades Card'
    def __str__(self):
        return self.campo

class Card_Anexos(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    fluxo_ambiental = models.ForeignKey(Fluxo_Gestao_Ambiental, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    fluxo_prospect = models.ForeignKey(Fluxo_Prospects, on_delete=models.CASCADE, null=True, verbose_name='Prospect')
    fluxo_credito = models.ForeignKey(Fluxo_Gestao_Credito, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    file = models.FileField(null=True, upload_to='pipeline/anexos', verbose_name='Arquivo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Alterado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Anexos Card'