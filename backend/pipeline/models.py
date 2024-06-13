from django.db import models
from users.models import User
import uuid

class Pipe(models.Model):
    id = models.BigIntegerField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    descricao = models.CharField(max_length=255, null=False, blank=False, verbose_name='Descricao  Pipe')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Pipe'
    def __str__(self):
        return self.descricao


class Fase(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    pipe = models.ForeignKey(Pipe, on_delete=models.CASCADE)
    descricao = models.CharField(max_length=255, null=False, blank=False, verbose_name='Nome Fase')
    done = models.BooleanField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Fases'
    def __str__(self):
        return self.descricao

class Grupos_Clientes(models.Model):
    id = models.BigIntegerField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    nome_grupo = models.CharField(max_length=255, null=False, blank=False, verbose_name='Nome Grupo')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Grupos Clientes'
    def __str__(self):
        return self.nome_grupo

class Cadastro_Pessoal(models.Model): 
    id = models.BigIntegerField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    razao_social = models.CharField(max_length=255, null=True, verbose_name='Nome ou Razão Social')
    natureza = models.CharField(max_length=10, null=True, verbose_name='Natureza Jurídica')
    cpf_cnpj = models.CharField(max_length=30, null=True, verbose_name='CPF ou CNPJ')
    numero_rg = models.CharField(max_length=50, null=True, verbose_name='Número RG')
    endereco = models.CharField(max_length=255, null=True, verbose_name='Endereço')
    municipio = models.CharField(max_length=255, null=True, verbose_name='Município')
    uf = models.CharField(max_length=30, null=True, verbose_name='UF')
    cep = models.CharField(max_length=30, null=True, verbose_name='CEP')
    data_nascimento = models.DateField(null=True, verbose_name='Data Nascimento')
    contato1 = models.CharField(max_length=100, null=True, verbose_name='Contato 01')
    contato2 = models.CharField(max_length=100, null=True, verbose_name='Contato 02')
    email = models.CharField(max_length=100, null=True, verbose_name='Email')
    grupo = models.ForeignKey(Grupos_Clientes, on_delete=models.SET_NULL, null=True, verbose_name='Id do Grupo')
    profissao = models.CharField(max_length=255, null=True, verbose_name='Profissão')
    #avatar = ResizedImageField(size=[128, 128], default='avatars/clients/default-avatar.jpg', upload_to='avatars/clients')
    record_url = models.CharField(max_length=255, null=True, verbose_name='URL do Registro')
    created_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField(null=True)
    class Meta:
        verbose_name_plural = 'Cadastro Pessoal'
    def __str__(self):
        return self.razao_social

class Cadastro_Pessoal_Info(models.Model):
    cadastro = models.OneToOneField(Cadastro_Pessoal, on_delete=models.CASCADE, null=True, verbose_name='Cadastro Pessoal')
    avatar = models.FileField(default='avatars/default-avatar.jpg', upload_to='avatars')
    description = models.TextField(null=True, verbose_name='Descrição')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Cad. Pessoal Informações Adicionais'
    def __str__(self):
        return self.cadastro.razao_social
    
class Contratos_Servicos(models.Model):
    id = models.BigIntegerField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    contratante = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Contratante')
    demais_membros = models.TextField(null=True, verbose_name='Demais Membros')
    servicos_contratados = models.TextField(null=True, verbose_name='Serviços Contratados')
    produto = models.CharField(max_length=255, null=True, verbose_name='Produto')
    detalhes_negociacao = models.TextField(null=True, verbose_name='Detalhe Negociação')
    percentual_gc = models.FloatField(null=True, verbose_name='Percentual GC')
    valor_gai = models.DecimalField(max_digits=15, decimal_places=2, null=True)
    data_assinatura = models.DateField(null=True, verbose_name='Data Assinatura')
    data_vencimento = models.DateField(null=True, verbose_name='Data Vencimento')
    url_record = models.CharField(max_length=255, null=True, verbose_name='URL do registro')
    created_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField(null=True)
    class Meta:
        verbose_name_plural = 'Contratos Serviços'
    def __str__(self):
        return self.contratante.razao_social
    
class Detalhamento_Servicos(models.Model):
    id = models.BigIntegerField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    produto = models.CharField(max_length=255, null=True)
    detalhamento_servico = models.CharField(max_length=255, null=True)
    created_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField(null=True)
    class Meta:
        verbose_name_plural = 'Detalhamento Serviços'
    def __str__(self):
        return self.detalhamento_servico

class Instituicoes_Razao_Social(models.Model): 
    id = models.BigIntegerField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    razao_social = models.CharField(max_length=255, null=True, verbose_name='Razão Social')
    cnpj = models.CharField(max_length=255, null=True, verbose_name='CNPJ')
    tipo_instituicao = models.CharField(max_length=255, null=True, verbose_name='Tipo Instituição')
    produto_vinculado = models.CharField(max_length=255, null=True, verbose_name='Produto Vinculado')
    abreviatura = models.CharField(max_length=255, null=True, verbose_name='Abreviatura')
    created_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField(null=True)
    class Meta:
        verbose_name_plural = 'Instituições Razão Social'
    def __str__(self):
        return self.razao_social


class Instituicoes_Parceiras(models.Model): 
    id = models.BigIntegerField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    instituicao = models.ForeignKey(Instituicoes_Razao_Social, on_delete=models.SET_NULL, null=True)
    identificacao  = models.CharField(max_length=255, null=True)
    record_url = models.CharField(max_length=255, null=True) 
    created_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField(null=True)
    class Meta:
        verbose_name_plural = 'Instituições Parceiras Frasson'
    def __str__(self):
        return self.instituicao.razao_social     
    
class Card_Produtos(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    card = models.CharField(max_length=255, null=True, verbose_name='Tipo Card')
    beneficiario = models.ManyToManyField(Cadastro_Pessoal, verbose_name='Nome Beneficiário')
    detalhamento = models.ForeignKey(Detalhamento_Servicos, on_delete=models.SET_NULL, null=True, verbose_name='Detalhamento Serviço')
    instituicao = models.ForeignKey(Instituicoes_Parceiras, on_delete=models.SET_NULL, null=True, verbose_name='Instituição Parceira')
    contrato = models.ForeignKey(Contratos_Servicos, on_delete=models.SET_NULL, null=True, verbose_name='Contrato Serviço')
    valor_operacao = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor da Operação')
    faturamento_estimado = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Faturamento Estimado')
    phase = models.ForeignKey(Fase, on_delete=models.CASCADE, null=True, verbose_name='Fase')
    card_url = models.CharField(max_length=255, null=True, verbose_name='URL do Card')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Produtos Frasson'
    def __str__(self):
        return self.detalhamento.detalhamento_servico