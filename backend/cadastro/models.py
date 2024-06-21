from django.db import models
from users.models import User
import uuid, os

class MyAppPermissions(models.Model):
    class Meta:
        managed = False  # No database table creation or deletion operations will be performed for this model.
        permissions = [
            ("ver_feedbacks_users", "Ver Feedbacks Users"),
            ("ver_cadastros_gerais", "Ver Cadastros Gerais"),
        ]

class Culturas_Agricolas(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    cultura = models.CharField(max_length=255, null=True, verbose_name='Cultura Agrícola')
    nome_cientifico = models.CharField(max_length=150, null=True, blank=True, verbose_name='Nome Científico')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado Por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Culturas Agrícolas'
    def __str__(self):
        return self.cultura

class Municipios(models.Model):
    id = models.BigIntegerField(primary_key=True, verbose_name='Código Município')
    cod_uf = models.IntegerField(verbose_name='Código UF')
    sigla_uf = models.CharField(max_length=2, null=True, verbose_name='Sigla UF')
    nome_uf = models.CharField(max_length=255, null=True, verbose_name='Nome UF')
    nome_municipio = models.CharField(max_length=255, null=True, verbose_name='Nome Município')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Municípios'
    def __str__(self):
        return f"{self.nome_municipio} - {self.sigla_uf}"
    
class Grupos_Clientes(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    nome_grupo = models.CharField(max_length=255, null=False, blank=False, verbose_name='Nome Grupo')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado Por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Grupos Clientes'
    def __str__(self):
        return self.nome_grupo

class Categoria_Cadastro(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    categoria = models.CharField(max_length=255, null=False, blank=False, verbose_name='Categoria')
    sigla = models.CharField(max_length=30, null=False, blank=False, verbose_name='Sigla')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado Por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Grupos Clientes'
    def __str__(self):
        return self.categoria
    
class Tipo_Instituicao(models.Model): 
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    descricao = models.CharField(max_length=150, null=True, verbose_name='Descricao do Tipo')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Tipos Instituição'
    def __str__(self):
        return self.descricao
    
class Instituicoes_Razao_Social(models.Model): 
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    tipo = models.ForeignKey(Tipo_Instituicao, null=True, on_delete=models.SET_NULL, verbose_name='Tipo Instituição')
    razao_social = models.CharField(max_length=255, null=True, verbose_name='Razão Social')
    cnpj = models.CharField(max_length=255, null=True, verbose_name='CNPJ', unique=True)
    abreviatura = models.CharField(max_length=100, null=True, verbose_name='Abreviatura')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Instituições Razão Social'
    def __str__(self):
        return self.razao_social

class Instituicoes_Parceiras(models.Model): 
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    instituicao = models.ForeignKey(Instituicoes_Razao_Social, on_delete=models.SET_NULL, null=True)
    identificacao  = models.CharField(max_length=255, null=True, verbose_name='Identificação da Instituição')
    numero_agencia = models.CharField(max_length=30, null=True, default=None, verbose_name='Número Agência')
    cep_logradouro = models.CharField(max_length=30, null=True, verbose_name='CEP Logradouro')
    logradouro = models.CharField(max_length=255, null=True, verbose_name='Logradouro')
    municipio = models.ForeignKey(Municipios, null=True, on_delete=models.SET_NULL, verbose_name='Município')
    telefone_agencia =  models.CharField(max_length=50, null=True, blank=True, default=None, verbose_name='Telefone Contato Agência')
    email_agencia =  models.CharField(max_length=100, null=True, blank=True, default=None, verbose_name='E-mail Contato Agência')
    gerente_agencia = models.CharField(max_length=255, null=True, blank=True, default=None, verbose_name='Nome Gerente Agência')
    email_gerente = models.CharField(max_length=100, null=True, blank=True, default=None, verbose_name='E-mail Gerente Agência')
    telefone_gerente = models.CharField(max_length=50, null=True, blank=True, default=None, verbose_name='Telefone Gerente Agência')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Instituições Parceiras Frasson'
    def __str__(self):
        return self.identificacao 

class Cadastro_Pessoal(models.Model): 
    CHOICES_NATUREZA = (('PF', 'Pessoa Física'), ('PJ', 'Pessoa Jurídica'))
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    categoria = models.ForeignKey(Categoria_Cadastro, on_delete=models.SET_NULL, null=True, verbose_name='Categoria Cadastro')
    natureza = models.CharField(choices=CHOICES_NATUREZA, max_length=2, null=True, verbose_name='Natureza Jurídica')
    razao_social = models.CharField(max_length=255, null=True, verbose_name='Nome ou Razão Social')
    fantasia = models.CharField(max_length=255, null=True, verbose_name='Nome Fantasia')
    cpf_cnpj = models.CharField(max_length=30, null=True, verbose_name='CPF ou CNPJ')
    numero_rg = models.CharField(max_length=50, null=True, verbose_name='Número RG')
    cep_logradouro = models.CharField(max_length=30, null=True, verbose_name='CEP Logradouro')
    logradouro = models.CharField(max_length=255, null=True, verbose_name='Logradouro')
    municipio = models.ForeignKey(Municipios, null=True, on_delete=models.SET_NULL, verbose_name='Município')
    data_nascimento = models.DateField(null=True, verbose_name='Data Nascimento')
    contato1 = models.CharField(max_length=100, null=True, verbose_name='Contato 01')
    contato2 = models.CharField(max_length=100, null=True, verbose_name='Contato 02')
    email1 = models.CharField(max_length=100, null=True, verbose_name='Email 01')
    email2 = models.CharField(max_length=100, null=True, verbose_name='Email 02')
    grupo = models.ForeignKey(Grupos_Clientes, on_delete=models.SET_NULL, null=True, verbose_name='Id do Grupo')
    # profissao = models.CharField(max_length=255, null=True, verbose_name='Profissão')
    avatar = models.FileField(default='avatars/clients/default-avatar.jpg', upload_to='avatars/clients')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado Por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Cadastro Pessoal'
    def __str__(self):
        return self.razao_social
    
class Senhas_Logins(models.Model): 
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    cliente = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Cliente')
    usuario_cpf = models.CharField(max_length=255, null=True, verbose_name='Usuário ou CPF')
    email = models.CharField(max_length=255, null=True, verbose_name='Email')
    senha = models.CharField(max_length=20, null=True, verbose_name='Senha')
    instituicao = models.ForeignKey(Instituicoes_Razao_Social, on_delete=models.SET_NULL, null=True, verbose_name='Instituição')
    observacoes = models.TextField(null=True, verbose_name='Observações')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado Por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Senhas e Logins Clientes'
    def __str__(self):
        return self.cliente.razao_social

class Empresas_Frasson(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    razao_social = models.CharField(max_length=255, null=True, blank=True, verbose_name='Razão Social')
    fantasia = models.CharField(max_length=255, null=True, blank=True, verbose_name='Nome Fantasia')
    cnpj = models.CharField(max_length=15, null=True, blank=True, verbose_name='CNPJ')
    endereco = models.CharField(max_length=255, null=True, blank=True, verbose_name='Endereço')
    cep = models.CharField(max_length=15, null=True, blank=True, verbose_name='CEP')
    municipio = models.ForeignKey(Municipios, null=True, on_delete=models.SET_NULL, verbose_name='Municípios')
    socios = models.ManyToManyField(Cadastro_Pessoal, verbose_name='Sócios')
    email = models.CharField(max_length=50, null=True, verbose_name='Email')
    telefone = models.CharField(max_length=50, null=True, verbose_name='Telefone')
    data_abertura = models.DateField(null=True, verbose_name='Data Abertura')
    observacoes = models.TextField(null=True, verbose_name='Observações')
    logo = models.FileField(upload_to='logos/empresas', null=True, verbose_name='Logo')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Cartorios_Registro(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    razao_social = models.CharField(max_length=255, null=True, verbose_name='Nome do Cartório')
    cnpj = models.CharField(max_length=50, null=True, verbose_name='CNPJ do Cartório')
    cep_logradouro = models.CharField(max_length=30, null=True, verbose_name='CEP Logradouro')
    logradouro = models.CharField(max_length=255, null=True, verbose_name='Logradouro')
    municipio = models.ForeignKey(Municipios, null=True, on_delete=models.SET_NULL, verbose_name='Município')
    atendente = models.CharField(max_length=255, null=True, verbose_name='Nome Atendente')
    contato_01 = models.CharField(max_length=50, null=True, verbose_name='Contato')
    contato_02 = models.CharField(max_length=50, null=True, verbose_name='Contato')
    email = models.CharField(max_length=50, null=True, verbose_name='Email')
    observacoes = models.TextField(null=True, verbose_name='Observações')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Cadastro Cartórios'
    def __str__(self):
        return self.razao_social    

class Tipo_Maquina_Equipamento(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    description = models.CharField(max_length=255, null=True, verbose_name='Descrição Tipo')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Tipo Máquina ou Equipamento'
    def __str__(self):
        return self.description

class Maquinas_Equipamentos(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    proprietario = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Nome Proprietário')
    tipo = models.ForeignKey(Tipo_Maquina_Equipamento, on_delete=models.SET_NULL,  null=True, blank=True, verbose_name='Tipo Máquina')
    quantidade = models.IntegerField(null=True, verbose_name='Quantidade', default=1)
    ano_fabricacao = models.IntegerField(null=True, verbose_name='Ano Fabricação')
    fabricante = models.CharField(max_length=255, null=True, verbose_name='Fabricante')
    modelo = models.CharField(max_length=255, null=True, verbose_name='Modelo da Máquina ou Equipamento')
    valor_total = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor Total da Máquina ou Equipamento')
    situacao = models.CharField(max_length=1, null=True, verbose_name='Situação')
    cor = models.CharField(max_length=50, null=True, verbose_name='Cor da Máquina ou Equipamento')
    serie_chassi = models.CharField(max_length=255, null=True, verbose_name='N° Chassi ou Série')
    potencia_capacidade = models.CharField(max_length=255, null=True, verbose_name='Potência ou Capacidade')
    propriedade = models.CharField(max_length=255, null=True, verbose_name='Imóvel Rural')
    estado_conservacao = models.CharField(max_length=50, null=True, verbose_name='Estado Conservação')
    participacao = models.DecimalField(max_digits=6, decimal_places=2, null=True, verbose_name='Percentual Participação')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Máquinas e Equipamentos'
    def __str__(self):
        return self.proprietario.razao_social
    

class Fotos_Maquinas_Equipamentos(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    description = models.CharField(max_length=255, null=True, verbose_name='Descrição')
    file = models.FileField(upload_to='maquinas', null=True, verbose_name='Foto')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Uploaded by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Fotos - Máquinas e Equipamentos'
    def __str__(self):
        return self.description

class Tipo_Benfeitorias(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    description = models.CharField(max_length=255, null=True, verbose_name='Descrição')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.description

from farms.models import Imoveis_Rurais
class Benfeitorias_Fazendas(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    type = models.ForeignKey(Tipo_Benfeitorias, on_delete=models.SET_NULL, null=True, verbose_name='Tipo de Benfeitoria')
    farm = models.ForeignKey(Imoveis_Rurais, on_delete=models.SET_NULL, null=True, verbose_name='Fazenda')
    tamanho = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Tamanho (m²)')
    valor_estimado = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor Estimado (R$)')
    data_construcao = models.DateField(verbose_name='Data Construção')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

def upload_to_picture_benfeitoria(instance, filename):
    # Gera um nome de arquivo usando o UUID do registro.
    ext = filename.split('.')[-1]
    uuid = str(instance.uuid)
    filename = f'{uuid}.{ext}'
    return os.path.join('benfeitorias/', filename)

class Pictures_Benfeitorias(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    benfeitoria = models.ForeignKey(Benfeitorias_Fazendas, on_delete=models.CASCADE, null=True)
    file = models.FileField(upload_to=upload_to_picture_benfeitoria, null=True, verbose_name='Fotos')
    upload_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    upload_at = models.DateTimeField(auto_now_add=True)

def upload_to_analise(instance, filename):
    ext = filename.split('.')[-1]
    uuid = str(instance.uuid)
    filename = f'{uuid}.{ext}'
    return os.path.join('analises_solo/', filename)

class Analise_Solo(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    cliente = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Cliente')
    fazenda = models.ForeignKey(Imoveis_Rurais, on_delete=models.SET_NULL, null=True, verbose_name='Fazenda')
    data_coleta = models.DateField(verbose_name='Data Coleta')
    identificacao_amostra = models.CharField(max_length=255, null=True, verbose_name='Identificação Amostra')
    profundidade = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Profundidade (cm)')
    numero_controle = models.CharField(max_length=255, null=True, verbose_name='Número da amostra', blank=True)
    latitude_gd = models.DecimalField(max_digits=15, decimal_places=12, verbose_name='Latitude (GD)')
    longitude_gd = models.DecimalField(max_digits=15, decimal_places=12, verbose_name='Longitude (GD)')
    responsavel = models.CharField(max_length=255, null=True, verbose_name='Responsável pela coleta')
    laboratorio_analise = models.CharField(max_length=255, null=True, verbose_name='Laboratório da análise')
    calcio_cmolc_dm3 = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Cálcio')
    magnesio_cmolc_dm3 = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Magnésio')
    aluminio_cmolc_dm3 = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Alumínio')
    potassio_cmolc_dm3 = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Potássio')
    fosforo = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Fósforo')
    fosforo_rem = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Fósforo rem')
    enxofre = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Enxofre')
    zinco = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Zinco')
    boro = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Boro')
    cobre = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Cobre')
    ferro = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Ferro')
    manganes = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Manganês')
    ph_h2O = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Ph em Água')
    ph_cacl2 = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='')
    h_mais_al = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='')
    sodio = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='')
    mat_org_dag_dm3 = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Matéria Orgânica (dag/dm3)')
    argila_percentual = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Argila (%)')
    silte_percentual = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Silte (%)')
    areia_percentual = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Areia (%)')
    file = models.FileField(upload_to=upload_to_analise, null=True, blank=True, verbose_name='Arquivo em PDF')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Welcome_Messages(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    message = models.CharField(verbose_name='Mensagem', max_length=255, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Welcome Messages'
    def __str__(self):
        return self.message

class Feedbacks_Category(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    description = models.CharField(max_length=150, verbose_name='Descrição Categoria')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Categorias Feedbacks'
    def __str__(self):
        return self.description

class Feedbacks_System(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    category = models.ForeignKey(Feedbacks_Category, on_delete=models.CASCADE, verbose_name='Categoria')
    description = models.TextField(null=True,verbose_name='Detalhamento Feedback')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Feedbacks Sistema'
    def __str__(self):
        return self.user.first_name

class Feedbacks_Replies(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    feedback = models.ForeignKey(Feedbacks_System, on_delete=models.CASCADE, null=True, verbose_name='Feedback')
    text = models.TextField(null=True, verbose_name='Texto de Resposta')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Respostas Feedback'

class Produtos_Frasson(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    description = models.CharField(max_length=255, null=True, blank=True, verbose_name='Descrição')
    acronym = models.CharField(max_length=10, null=True, blank=True, verbose_name='Sigla')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Cadastro Produtos'
    def __str__(self):
        return self.description
    
class Detalhamento_Servicos(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    produto = models.ForeignKey(Produtos_Frasson, null=True, on_delete=models.CASCADE)
    detalhamento_servico = models.CharField(max_length=255, null=True)
    acronym = models.CharField(max_length=10, null=True, blank=True, verbose_name='Sigla')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Detalhamento Serviços'
    def __str__(self):
        return self.detalhamento_servico

class Contas_Bancarias_Clientes(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    cliente = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True)
    instituicao = models.ForeignKey(Instituicoes_Parceiras, on_delete=models.SET_NULL, null=True)
    agencia = models.CharField(max_length=20, null=True)
    conta = models.CharField(max_length=20, null=True)
    gerente = models.CharField(max_length=255, null=True)
    contato = models.CharField(max_length=255, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Contas Bancárias Clientes'
    def __str__(self):
        return self.cliente.razao_social

# class Colaboradores_Frasson(models.Model): 
#     uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
#     colaborador = models.ForeignKey(Cadastro_Pessoal, on_delete=models.CASCADE, null=True, verbose_name='Colaborador')
#     created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     class Meta:
#         verbose_name_plural = 'Cadastro Colaboradores'
#     def __str__(self):
#         return self.colaborador.razao_social