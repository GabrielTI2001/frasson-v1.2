from django.db import models
import uuid
from cadastro.models import Municipios, Cadastro_Pessoal, Cartorios_Registro, Instituicoes_Razao_Social
from users.models import User

class Cadastro_Ambiental_Rural(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    numero_car = models.CharField(max_length=150, null=True, blank=True, verbose_name='Número do CAR')
    area_preservacao_permanente = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Área APP')
    area_uso_restrito = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Área Uso Restrito')
    condicao_cadastro = models.CharField(max_length=250, null=True, blank=True, verbose_name='Condição Cadastro')
    area_imovel = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Área Imóvel')
    modulos_fiscais = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Módulos Fiscais')
    endereco_municipio = models.CharField(max_length=250, null=True, blank=True, verbose_name='Endereço Município')
    endereco_latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Latitude')
    endereco_longitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Longitude')
    data_registro = models.DateField(null=True, blank=True, verbose_name='Data Registro')
    data_analise = models.DateField(null=True, blank=True, verbose_name='Data Análise')
    data_retificacao = models.DateField(null=True, blank=True, verbose_name='Data Retificação')
    reserva_situacao = models.CharField(max_length=150, null=True, blank=True, verbose_name='Reserva Situação')
    reserva_area_averbada = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='RL Área Averbada')
    reserva_area_nao_averbada = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='RL Área Não Averbada')
    reserva_legal_proposta = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='RL Proposta')
    reserva_legal_declarada = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='RL Declarada')
    situacao = models.CharField(max_length=250, null=True, blank=True, verbose_name='Situação CAR')
    solo_area_nativa = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Solo - Área Nativa')
    solo_area_uso = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Solo - Área Uso')
    solo_area_servidao = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Solo - Área Servidão')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Cadastro Ambiental Rural'
    def __str__(self):
        return f"{self.numero_car}"
    

class Cadastro_Ambiental_Rural_Restricoes(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    car = models.ForeignKey(Cadastro_Ambiental_Rural, on_delete=models.CASCADE, null=True, verbose_name='Imóvel Rural')
    origem = models.CharField(max_length=255, null=True, blank=True, verbose_name='Origem da Restrição')
    descricao = models.TextField(null=True, blank=True, verbose_name='Descrição da Restrição')
    data_processamento = models.DateField(null=True, blank=True, verbose_name='Data Processamento')
    area_conflito = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Área de Conflito')
    percentual = models.DecimalField(max_digits=8, decimal_places=4, null=True, blank=True, verbose_name='Percentual Área Conflito')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Restrições no CAR'
    def __str__(self):
        return f"{self.car}"


class Cadastro_Ambiental_Rural_Coordenadas(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    car = models.ForeignKey(Cadastro_Ambiental_Rural, on_delete=models.CASCADE, null=True, verbose_name='Imóvel Rural')
    longitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Longitude')
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Latitude')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Coordenadas do CAR'
    def __str__(self):
        return f"{self.car}"

class Imoveis_Rurais(models.Model):
    LOC_RESERVA_CHOICES = (
        ("AM", "Mesma Matrícula"),
        ("AE", "Área Externa"),
        ("AP", "Área Externa Parcial")
    )
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    nome = models.CharField(max_length=255, null=True, verbose_name='Nome Imóvel')
    matricula = models.CharField(max_length=100, null=True, verbose_name='Matrícula Imóvel')
    proprietarios = models.ManyToManyField(Cadastro_Pessoal, verbose_name='Proprietários')
    livro_registro = models.CharField(max_length=150, null=True, verbose_name='Livro Registro')
    numero_registro = models.CharField(max_length=150, null=True, verbose_name='Número Registro')
    cns = models.CharField(max_length=150, null=True, blank=True, verbose_name='CNS')
    data_registro = models.DateField(null=True, verbose_name='Data Registro')
    cartorio_registro = models.ForeignKey(Cartorios_Registro, on_delete=models.CASCADE, verbose_name='Cartório Registro')
    municipio = models.ForeignKey(Municipios, on_delete=models.CASCADE, verbose_name='Município')
    cep = models.CharField(max_length=50, null=True, verbose_name='CEP Localização')
    endereco = models.TextField(null=True, blank=True, verbose_name='Endereço da Fazenda')
    titulo_posse = models.CharField(max_length=255, null=True, verbose_name='Título de Posse')
    numero_nirf = models.CharField(max_length=100, null=True, verbose_name='Número NIRF')
    codigo_imovel = models.CharField(max_length=100, null=True, verbose_name='Código Imóvel Rural')
    codigo_car = models.CharField(max_length=150, null=True, verbose_name='Registro CAR')
    area_total = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Área Total')
    modulos_fiscais = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Módulos Fiscais')
    area_reserva = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Área de Reserva Legal')
    localizacao_reserva = models.CharField(max_length=2, choices=LOC_RESERVA_CHOICES, null=True, verbose_name='Localização da Reserva Legal')
    area_app = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Área de APP')
    area_veg_nat = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Área de Vegetação Nativa')
    area_explorada = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Área Explorada')
    roteiro_acesso = models.TextField(null=True, blank=True, verbose_name='Roteiro de Acesso')
    car = models.ForeignKey(Cadastro_Ambiental_Rural, on_delete=models.SET_NULL, null=True, verbose_name='CAR')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Imóveis Rurais'
    def _str_(self):
        return f"{self.nome}"

class Imoveis_Rurais_Coordenadas_Matricula(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    imovel = models.ForeignKey(Imoveis_Rurais, on_delete=models.CASCADE, null=True, verbose_name='Imóvel')
    latitude_gd = models.DecimalField(max_digits=15, decimal_places=12, verbose_name='Latitude GD')
    longitude_gd = models.DecimalField(max_digits=15, decimal_places=12, verbose_name='Longitude GD')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Coordenadas Matrícula Imóvel'
    def __str__(self):
        return self.imovel.nome

class Certificacao_Sigef_Parcelas(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    imovel = models.ForeignKey(Imoveis_Rurais, on_delete=models.CASCADE, null=True, verbose_name='Imóvel Rural')
    nome = models.CharField(max_length=255, null=True, blank=True, verbose_name='Nome Imóvel')
    area_ha = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Área Ha')
    detentor = models.CharField(max_length=255, null=True, blank=True, verbose_name='Detentor')
    cpf_cnpj_detentor = models.CharField(max_length=50, null=True, blank=True, verbose_name='CPF/CNPJ')
    cns = models.CharField(max_length=50, null=True, blank=True, verbose_name='CNS')
    codigo_parcela = models.UUIDField(null=True, blank=True, verbose_name='Código Parcela')
    matricula = models.CharField(max_length=50, null=True, blank=True, verbose_name='CNS')
    data_entrada = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Parcelas Certificações SIGEF'
    def __str__(self):
        return f"{self.imovel.nome} - {self.imovel.matricula}" if self.imovel.matricula else self.imovel.nome


class Certificacao_Sigef_Parcelas_Limites(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    parcela = models.ForeignKey(Certificacao_Sigef_Parcelas, on_delete=models.CASCADE, null=True, verbose_name='Parcela')
    do_vertice = models.CharField(max_length=100, null=True, blank=True, verbose_name='Do Vértice')
    ao_vertice = models.CharField(max_length=100, null=True, blank=True, verbose_name='Ao Vértice')
    tipo = models.CharField(max_length=100, null=True, blank=True, verbose_name='Tipo')
    lado = models.CharField(max_length=100, null=True, blank=True, verbose_name='Lado')
    azimute = models.CharField(max_length=100, null=True, blank=True, verbose_name='Azimute')
    comprimento = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Comprimento')
    confrontante = models.TextField(null=True, blank=True, verbose_name='Confrontante')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'SIGEF - Limites de Parcelas'
    def __str__(self):
        return f"{self.parcela.codigo_parcela}"


class Certificacao_Sigef_Parcelas_Vertices(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    parcela = models.ForeignKey(Certificacao_Sigef_Parcelas, on_delete=models.CASCADE, null=True, verbose_name='Parcela')
    codigo = models.CharField(max_length=100, null=True, blank=True, verbose_name='Código do Vértice')
    longitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Longitude')
    sigma_long = models.DecimalField(max_digits=4, decimal_places=4, null=True, blank=True, verbose_name='Sigma Long')
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Latitude')
    sigma_lat = models.DecimalField(max_digits=4, decimal_places=4, null=True, blank=True, verbose_name='Sigma Lat')
    altitude = models.DecimalField(max_digits=8, decimal_places=4, null=True, blank=True, verbose_name='Altitude')
    sigma_altitude = models.DecimalField(max_digits=4, decimal_places=4, null=True, blank=True, verbose_name='Sigma Altitude')
    metodo_posicionamento = models.CharField(max_length=100, null=True, blank=True, verbose_name='Método Posicionamento')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'SIGEF - Vértices de Parcelas'
    def __str__(self):
        return f"{self.parcela.codigo_parcela}"

class Regimes_Exploracao(models.Model):
    REGIMES_CHOICES = (
        ("PR", "Próprio"),
        ("AR", "Arrendamento"),
        ("CO", "Comodato"),
        ("PA", "Parceria"),
        ("AN", "Anuência"),
        ("CCA", "Condomínio com Anuência"),
        ("CSA", "Condomínio sem Anuência"),
    )
    ATIVIDADES_CHOICES = (
        ("AGRI", "Agricultura"),
        ("PEC", "Pecuária"),
        ("AGP", "Agricultura e Pecuária"),
        ("O", "Outras"),
    )
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    imovel = models.ForeignKey(Imoveis_Rurais, on_delete=models.SET_NULL, null=True, verbose_name='Imóvel Rural')
    quem_explora = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Quem Explora')
    instituicao = models.ForeignKey(Instituicoes_Razao_Social, on_delete=models.SET_NULL, null=True, verbose_name='Instituição')
    regime = models.CharField(choices=REGIMES_CHOICES, max_length=3, null=True, verbose_name='Regime de Exploração')
    data_inicio = models.DateField(null=True, verbose_name='Data de Início')
    data_termino = models.DateField(null=True, verbose_name='Data de Término')
    area = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Área Total Explorada')
    atividades = models.CharField(choices=ATIVIDADES_CHOICES, max_length=5, null=True, verbose_name='Atividades Exploradas')
    detalhamento = models.TextField(null=True, verbose_name='Detalhamento Regime Exploração')
    instrumento_cessao = models.FileField(upload_to='farms/regimes/instrumento', null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Regimes Exploração'
    def __str__(self):
        return self.imovel.nome

class Regimes_Exploracao_Coordenadas(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    regime = models.ForeignKey(Regimes_Exploracao, on_delete=models.CASCADE, null=True, verbose_name='Regime Exploração')
    longitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Longitude')
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Latitude')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Coordenadas Regime Exploração'
    def __str__(self):
        return f"{self.regime.quem_explora.razao_social}"