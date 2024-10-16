from django.db import models
from users.models import User, Profile
from cadastro.models import Cadastro_Pessoal, Instituicoes_Parceiras, Produtos_Frasson, Detalhamento_Servicos
import uuid, time, random, os
from datetime import datetime, time as dtime, timedelta

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
    destinos_permitidos = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='fases_origem')
    dias_prazo = models.IntegerField(null=True)
    done = models.BooleanField(null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Fases'
    def __str__(self):
        return self.descricao


from finances.models import Contratos_Ambiental, Pagamentos, Cobrancas, Contratos_Credito
class Fluxo_Prospects(models.Model): 
    CHOICES_PRIORIDADE = (('A','Alta'), ('M','Média'), ('B','Baixa'))
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    nome = models.CharField(max_length=255, null=True, verbose_name='Nome Prospect')
    prioridade = models.CharField(max_length=2, choices=CHOICES_PRIORIDADE, null=True, verbose_name='Prioridade')
    produto = models.ForeignKey(Produtos_Frasson, on_delete=models.SET_NULL, null=True, verbose_name='Produto')
    classificacao = models.CharField(max_length=255, null=True, verbose_name='Classificação do Prospect')
    descricao = models.TextField(null=True, verbose_name='Descrição')
    proposta_inicial = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Proposta Inicial')
    proposta_aprovada = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Proposta Aprovada')
    percentual_inicial = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Percentual Inicial')
    percentual_aprovado = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Percentual Aprovado')
    data_vencimento = models.DateTimeField(null=True, verbose_name='Data de Vencimento')
    contrato_gc = models.ForeignKey(Contratos_Credito, on_delete=models.SET_NULL, null=True, verbose_name='Contrato GC')
    contrato_gai = models.ForeignKey(Contratos_Ambiental, on_delete=models.SET_NULL, null=True, verbose_name='Contrato GAI')
    phase = models.ForeignKey(Fase, on_delete=models.CASCADE, null=True, verbose_name='Fase Atual')
    responsaveis = models.ManyToManyField(User, verbose_name='Responsáveis', related_name='responsaveisprospect')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Fluxo Prospect'
    def __str__(self):
        return self.nome

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

class PVTEC(models.Model): 
    STATUS_CHOICES = (('EA', 'Em Andamento'),('OK','Concluído'),)
    ATIVIDADES_CHOICES = (('AC', 'Ação com Cliente'),('AT','Ação com Terceiros'),('ET', 'Entrega Técnica'), 
        ('LLC', 'LITEC - Levantamento de Campo'), ('LPT', 'LITEC - PTC'), ('LNT', 'LITEC - NT'), ('FB', 'Feedback'), 
        ('RC', 'Renovação de Contrato'),('ND', 'Novas Demandas'), ('MT', 'Make Time'), ('FOC', 'Formalização Operação de Crédito'), 
        ('OF', 'Outras Frentes'),
    )
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    responsaveis = models.ManyToManyField(User, verbose_name='Responsáveis', related_name='responsaveis_pvtec')
    data_vencimento = models.DateTimeField(null=True, verbose_name='Data de Vencimento')
    fluxo_ambiental = models.ForeignKey(Fluxo_Gestao_Ambiental, on_delete=models.CASCADE, null=True, verbose_name='Fluxo Ambiental')
    fluxo_credito = models.ForeignKey(Fluxo_Gestao_Credito, on_delete=models.CASCADE, null=True, verbose_name='Fluxo Crédito')
    phase_origem = models.ForeignKey(Fase, on_delete=models.CASCADE, null=True, verbose_name='Fase Origem')
    atividade = models.CharField(choices=ATIVIDADES_CHOICES, null=True, max_length=5, verbose_name='Atividade')
    orientacoes = models.TextField(null=True, verbose_name='Orientações')
    status = models.CharField(choices=STATUS_CHOICES, default='EA', max_length=3, verbose_name='Status')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'PVTEC'
    def __str__(self):
        return self.cliente.razao_social
    def save(self, *args, **kwargs):
        data_e_hora_vencimento = datetime.combine(datetime.now().date() + timedelta(days=3), dtime(18, 0))
        self.data_vencimento = data_e_hora_vencimento
        super().save(*args, **kwargs)

class AnaliseTecnica(models.Model): 
    TIPOS_CHOICES = (('LC', 'Levantamento de Campo'), ('PA','Procedimentos Alternativos'), ('AT','Análise Técnica'))
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    fluxo_prospect = models.ForeignKey(Fluxo_Prospects, on_delete=models.CASCADE, null=True, verbose_name='Fluxo Prospect')
    phase_origem = models.ForeignKey(Fase, on_delete=models.CASCADE, null=True, verbose_name='Fase Origem')
    observacoes = models.TextField(null=True, verbose_name='Observações')
    tipo = models.CharField(choices=TIPOS_CHOICES, default='EA', max_length=3, verbose_name='Status')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Análises Técnicas'
    def __str__(self):
        return self.tipo

class Card_Comments(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    fluxo_ambiental = models.ForeignKey(Fluxo_Gestao_Ambiental, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    fluxo_prospect = models.ForeignKey(Fluxo_Prospects, on_delete=models.CASCADE, null=True, verbose_name='Prospect')
    fluxo_credito = models.ForeignKey(Fluxo_Gestao_Credito, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    pagamento = models.ForeignKey(Pagamentos, on_delete=models.CASCADE, null=True, verbose_name='Pagamento')
    cobranca = models.ForeignKey(Cobrancas, on_delete=models.CASCADE, null=True, verbose_name='Cobrança')
    pvtec = models.ForeignKey(PVTEC, on_delete=models.CASCADE, null=True, verbose_name='PVTEC')
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
    TYPE_CHOICES = (('ch', 'change'),('co','comment'), ('cf','fase'), ('c','concluiu'))
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    fluxo_ambiental = models.ForeignKey(Fluxo_Gestao_Ambiental, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    fluxo_prospect = models.ForeignKey(Fluxo_Prospects, on_delete=models.CASCADE, null=True, verbose_name='Prospect')
    fluxo_credito = models.ForeignKey(Fluxo_Gestao_Credito, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    pvtec = models.ForeignKey(PVTEC, on_delete=models.CASCADE, null=True, verbose_name='PVTEC')
    type = models.CharField(null=True, max_length=60, choices=TYPE_CHOICES, verbose_name='Tipo')
    campo = models.TextField(null=True, verbose_name='Campo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Alterado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Atividades Card'
    def __str__(self):
        return self.campo

def upload_anexo(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'{instance.uuid}.{ext}'
    if instance.pvtec:
        return os.path.join('pipeline/pvtec-anexos/', filename)
    elif instance.fluxo_credito:
        return os.path.join('pipeline/credit-anexos/', filename)
    elif instance.fluxo_prospect:
        return os.path.join('pipeline/prospect-anexos/', filename)
    elif instance.acomp_gai:
        return os.path.join('pipeline/followup/', filename)
    elif instance.analise_tecnica:
        return os.path.join('pipeline/analisetecnica/', filename)
    else:
        return os.path.join('pipeline/ambiental-anexos/', filename)

class Card_Anexos(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    fluxo_ambiental = models.ForeignKey(Fluxo_Gestao_Ambiental, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    from processes.models import Acompanhamento_Processos
    fluxo_prospect = models.ForeignKey(Fluxo_Prospects, on_delete=models.CASCADE, null=True, verbose_name='Prospect')
    fluxo_credito = models.ForeignKey(Fluxo_Gestao_Credito, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    pvtec = models.ForeignKey(PVTEC, on_delete=models.CASCADE, null=True, verbose_name='PVTEC')
    acomp_gai = models.ForeignKey(Acompanhamento_Processos, on_delete=models.CASCADE, null=True, verbose_name='Acomp GAI')
    analise_tecnica = models.ForeignKey(AnaliseTecnica, on_delete=models.CASCADE, null=True, verbose_name='AT')
    pvtec_response = models.BooleanField(default=False)
    file = models.FileField(null=True, upload_to=upload_anexo, verbose_name='Arquivo')
    name = models.CharField(null=True, max_length=100, verbose_name='Nome Arquivo')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Alterado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Anexos Card'
    def save(self, *args, **kwargs):
        if self.file and not self.name:
            self.name = self.file.name
        super().save(*args, **kwargs)