from django.db import models
from users.models import User
from pipefy.models import Cadastro_Pessoal, Imoveis_Rurais, Instituicoes_Razao_Social
import uuid, os

class MyAppPermissions(models.Model):
    class Meta:
        managed = False  # No database table creation or deletion operations will be performed for this model.
        permissions = [
            ("ver_feedbacks_users", "Ver Feedbacks Users"),
            ("ver_cadastros_gerais", "Ver Cadastros Gerais"),
        ]

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
    
class Agencias_Bancarias(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    instituicao = models.ForeignKey(Instituicoes_Razao_Social, on_delete=models.CASCADE, null=True, verbose_name='Instituição')
    descricao_agencia = models.CharField(max_length=150, null=True, verbose_name='Descrição da Agência')
    numero_agencia = models.CharField(max_length=30, null=True, default=None, verbose_name='Número Agência')
    municipio_agencia = models.ForeignKey(Municipios, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Município Agência')
    cep_agencia = models.CharField(max_length=30, null=True, default=None, verbose_name='CEP Agência')
    endereco_agencia = models.CharField(max_length=255, null=True, blank=True, default=None, verbose_name='Endereço Agência')
    telefone_agencia =  models.CharField(max_length=50, null=True, blank=True, default=None, verbose_name='Telefone Contato Agência')
    email_agencia =  models.CharField(max_length=100, null=True, blank=True, default=None, verbose_name='E-mail Contato Agência')
    gerente_agencia = models.CharField(max_length=255, null=True, blank=True, default=None, verbose_name='Nome Gerente Agência')
    email_gerente = models.CharField(max_length=100, null=True, blank=True, default=None, verbose_name='E-mail Gerente Agência')
    telefone_gerente = models.CharField(max_length=50, null=True, blank=True, default=None, verbose_name='Telefone Gerente Agência')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Agências Bancárias'
    def __str__(self):
        return self.descricao_agencia

class Tipo_Maquina_Equipamento(models.Model):
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
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Máquinas e Equipamentos'
    def __str__(self):
        return self.proprietario.razao_social
    

class Fotos_Maquinas_Equipamentos(models.Model):
    description = models.CharField(max_length=255, null=True, verbose_name='Descrição')
    file = models.FileField(upload_to='maquinas', null=True, verbose_name='Foto')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Fotos - Máquinas e Equipamentos'
    def __str__(self):
        return self.description


class Tipo_Benfeitorias(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    description = models.CharField(max_length=255, null=True, verbose_name='Descrição')
    def __str__(self):
        return self.description
    
class Benfeitorias_Fazendas(models.Model):
    id = models.AutoField(primary_key=True)
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
    id = models.AutoField(primary_key=True)
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
    id = models.AutoField(primary_key=True)
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
