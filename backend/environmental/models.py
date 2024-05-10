from django.db import models
from cadastro.models import Municipios
from users.models import User
import uuid, os

class Finalidade_APPO(models.Model):
    description = models.CharField(verbose_name='Finalidade APPO', max_length=255, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Finalidade APPO'
    def __str__(self):
        return self.description

class Tipo_Captacao(models.Model):
    description = models.CharField(verbose_name='Tipo Captação', max_length=255, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Tipos Captação'
    def __str__(self):
        return self.description
    
class Aquifero_APPO(models.Model):
    description = models.CharField(verbose_name='Tipo Aquífero', max_length=255, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Tipos Aquífero'
    def __str__(self):
        return self.description

class Processos_Outorga(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    numero_processo = models.CharField(max_length=100, null=True, unique=True, verbose_name='Número Processo INEMA', error_messages={'unique': 'Processo já cadastrado!'})
    numero_portaria = models.CharField(max_length=50, null=True, verbose_name='Número Portaria')
    data_publicacao = models.DateField(null=True, verbose_name='Data Publicação')
    data_validade = models.DateField(null=True, verbose_name='Data Validade')
    nome_requerente = models.CharField(max_length=255, null=True, verbose_name='Nome Requerente')
    cpf_cnpj = models.CharField(max_length=40, null=True, verbose_name='CPF/CNPJ')
    nome_propriedade = models.CharField(max_length=255, null=True, verbose_name='Nome Propriedade')
    municipio = models.ForeignKey(Municipios, on_delete=models.CASCADE, null=True, verbose_name='Município Localização')
    bacia_hidro = models.CharField(max_length=255, null=True, verbose_name='Bacia Hidrográfica')
    captacao = models.ForeignKey(Tipo_Captacao, on_delete=models.SET_NULL, null=True, verbose_name='Tipo Captação')
    finalidade = models.ForeignKey(Finalidade_APPO, on_delete=models.SET_NULL, null=True, verbose_name='Finalidade Outorga')
    area_ha = models.DecimalField(max_digits=15, decimal_places=4, null=True)
    processo_frasson = models.BooleanField(default=False, null=True, verbose_name='Conduzido Frasson')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Processos Outorga'
    def __str__(self):
        return self.nome_requerente

class Processos_Outorga_Coordenadas(models.Model):
    processo = models.ForeignKey(Processos_Outorga, on_delete=models.CASCADE, null=True)
    descricao_ponto = models.CharField(max_length=100, null=True, blank=True, verbose_name='Descrição Ponto Outorga')
    latitude_gd = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Latitude')
    longitude_gd = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Longitude')
    vazao_m3_dia = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Vazão m3/dia')
    bombeamento_h = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, verbose_name='Horas de Bombeamento')
    vazao_m3_dia_jan = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Vazão m3/dia janeiro')
    vazao_m3_dia_fev = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Vazão m3/dia fevereiro')
    vazao_m3_dia_mar = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Vazão m3/dia março')
    vazao_m3_dia_abr = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Vazão m3/dia abril')
    vazao_m3_dia_mai = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Vazão m3/dia maio')
    vazao_m3_dia_jun = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Vazão m3/dia junho')
    vazao_m3_dia_jul = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Vazão m3/dia julho')
    vazao_m3_dia_ago = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Vazão m3/dia agosto')
    vazao_m3_dia_set = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Vazão m3/dia setembro')
    vazao_m3_dia_out = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Vazão m3/dia outubro')
    vazao_m3_dia_nov = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Vazão m3/dia novembro')
    vazao_m3_dia_dez = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name='Vazão m3/dia dezembro')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Coordenadas processos outorga'  
    def __str__(self):
        return self.processo

class Requerimentos_APPO(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    nome_requerente = models.CharField(max_length=255, null=True, verbose_name='Nome Requerente')
    cpf_cnpj = models.CharField(max_length=255, null=True, verbose_name='CPF/CNPJ')
    numero_requerimento = models.CharField(max_length=255, null=True, unique=True, verbose_name='Número Requerimento', error_messages={'unique': 'Requerimento já cadastrado!'})
    data_requerimento = models.DateField(null=True, verbose_name='Data Requerimento')
    municipio = models.ForeignKey(Municipios, on_delete=models.CASCADE, verbose_name='Município Localização')
    email = models.CharField(max_length=255, null=True, verbose_name='Email')
    numero_processo = models.CharField(max_length=100, null=True, unique=True, verbose_name='Número Processo',error_messages={'unique': 'Processo já cadastrado!'})
    data_formacao = models.DateField(null=True, verbose_name='Data Formação')
    frasson = models.BooleanField(default=False, verbose_name='Requerido pela Frasson?')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'requerimentos APPO'
    def __str__(self):
        return self.numero_requerimento

class Requerimentos_APPO_Coordenadas(models.Model):
    requerimento = models.ForeignKey(Requerimentos_APPO, on_delete=models.CASCADE)
    numero_poco = models.IntegerField(null=True, verbose_name='Número Poço')
    latitude_gd = models.DecimalField(max_digits=10, decimal_places=8, verbose_name='Latitude GD')
    longitude_gd = models.DecimalField(max_digits=10, decimal_places=8, verbose_name='Longitude GD')
    vazao_m3_dia = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Expect. Vazão (m3/dia)')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Requerimentos APPO - Coordenadas'
    def __str__(self):
        return self.requerimento.nome_requerente


def upload_to_appo(instance, filename):
    #gera o nome do file com o uuid
    ext = filename.split('.')[-1]
    uuid = str(instance.uuid)
    filename = f'{uuid}.{ext}'
    return os.path.join('inema/appo/', filename)

class Processos_APPO(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    nome_requerente = models.CharField(max_length=255, null=False, blank=False, verbose_name='Nome Requerente')
    cpf_cnpj = models.CharField(max_length=100, null=False, blank=False, verbose_name='CPF/CNPJ')
    numero_processo = models.CharField(max_length=100, null=True, blank=False, unique=True, verbose_name='Número Processo', error_messages={'unique': 'Processo já cadastrado!'})
    municipio = models.ForeignKey(Municipios, on_delete=models.CASCADE, verbose_name='Município')
    nome_fazenda = models.CharField(max_length=255, null=True, blank=False, verbose_name='Propriedade')
    aquifero = models.ForeignKey(Aquifero_APPO, on_delete=models.CASCADE, verbose_name='Tipo Aquífero')
    data_documento = models.DateField(null=True, verbose_name='Data Documento')
    data_vencimento = models.DateField(null=True, verbose_name='Data Vencimento')
    processo_frasson = models.BooleanField(null=True, default=False, verbose_name='Processo Frasson')
    reappo = models.BooleanField(verbose_name='Processo Renovado', default=False, null=True)
    file = models.FileField(upload_to=upload_to_appo, null=True, default=None, verbose_name='Arquivo PDF')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def delete(self, *args, **kwargs):
        # Deletar o arquivo associado se existir
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)
    class Meta:
        verbose_name_plural = 'Processos APPO'
    def __str__(self):
        return self.nome_requerente

class Processos_APPO_Coordenadas(models.Model):
    processo = models.ForeignKey(Processos_APPO, on_delete=models.CASCADE)
    numero_poco = models.IntegerField(null=True, verbose_name='Número Poço')
    latitude_gd = models.DecimalField(max_digits=10, decimal_places=8, verbose_name='Latitude GD')
    longitude_gd = models.DecimalField(max_digits=10, decimal_places=8, verbose_name='Longitude GD')
    vazao_m3_dia = models.DecimalField(max_digits=10, decimal_places=2, null=True, verbose_name='Vazão (m3/dia)')
    finalidade = models.ForeignKey(Finalidade_APPO, on_delete=models.CASCADE, verbose_name='Finalidade Ponto')
    poco_perfurado = models.BooleanField(null=True, blank=True, default=0, verbose_name='Poço Perfurado')
    data_perfuracao = models.DateField(null=True, blank=True, default=None, verbose_name='Data Perfuração')
    profundidade_poco = models.DecimalField(max_digits=10, decimal_places=2, null=True, verbose_name='Profundidade Poço')
    nivel_estatico = models.DecimalField(max_digits=10, decimal_places=2, null=True, verbose_name='Nível Estático')
    nivel_dinamico = models.DecimalField(max_digits=10, decimal_places=2, null=True, verbose_name='Nível Dinâmico')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Processos APPO - Coordenadas'
    def __str__(self):
        return self.processo.nome_requerente

class Empresas_Consultoria(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    razao_social = models.CharField(max_length=255, null=True, verbose_name='Razão Social')
    cnpj = models.CharField(max_length=40, null=True, blank=True, unique=True, verbose_name='CNPJ', error_messages={'unique': 'CNPJ já cadastrado!'})
    municipio = models.ForeignKey(Municipios, on_delete=models.CASCADE, null=True, verbose_name='Município')
    endereco = models.TextField(null=True, blank=True, verbose_name='Endereço Empresa')
    contato_telefone = models.CharField(max_length=255, null=True, blank=True, verbose_name='Contato Telefone')
    contato_email = models.CharField(max_length=255, null=True, blank=True, verbose_name='Contato Email')
    responsavel = models.CharField(max_length=255, null=True, blank=True, verbose_name='Contato Email')
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    class Meta:
        verbose_name_plural = 'Empresas Consultoria'  
    def __str__(self):
        return self.razao_social

def upload_to_asv(instance, filename):
    #gera o nome do file com o uuid
    ext = filename.split('.')[-1]
    uuid = str(instance.uuid)
    filename = f'{uuid}.{ext}'
    return os.path.join('inema/asv/portarias/', filename)
class Processos_ASV(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    processo = models.CharField(max_length=255, null=True, unique=True,  verbose_name='Número Processo', error_messages={'unique': 'Processo já cadastrado!'})
    requerente = models.CharField(max_length=255, null=True, blank=True, verbose_name='Nome Requerente')
    cpf_cnpj = models.CharField(max_length=40, null=True, blank=True, verbose_name='CPF/CNPJ')
    portaria = models.CharField(max_length=30, null=True, blank=True, verbose_name='Portaria')
    data_publicacao = models.DateField(null=True, blank=True, verbose_name='Data Publicação')
    data_vencimento = models.DateField(null=True, blank=True, verbose_name='Data Publicação')
    area_total = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Área Total ASV')
    localidade = models.CharField(max_length=255, null=True, blank=True, verbose_name='Localidade')
    municipio = models.ForeignKey(Municipios, on_delete=models.SET_NULL, null=True, verbose_name='Município')
    rendimento = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Rendimento Lenhoso')
    empresa = models.ForeignKey(Empresas_Consultoria, on_delete=models.SET_NULL, null=True, verbose_name='Empresa Consultoria')
    data_formacao = models.DateField(null=True, blank=True, verbose_name='Data Formação')
    tecnico = models.CharField(max_length=255, null=True, blank=True, verbose_name='Técnico responsável')
    file = models.FileField(upload_to=upload_to_asv, null=True, default=None, verbose_name='Arquivo PDF')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado Por')  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Processos ASV'
    def __str__(self):
        return self.requerente

class Processos_ASV_Areas(models.Model):
    processo = models.ForeignKey(Processos_ASV, on_delete=models.CASCADE, null=True, verbose_name='Processo ASV')
    identificacao_area = models.CharField(max_length=100, null=True, blank=True, verbose_name='Identificação da Área')
    file = models.FileField(upload_to='inema/asv/kml', null=True, default=None, verbose_name='Arquivo PDF')
    area_total = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Área Total')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Áreas Processos ASV'
    def __str__(self):
        return self.processo

class Atos_Administrativos(models.Model):
    description = models.CharField(max_length=255, null=True)
    sigla = models.CharField(max_length=30, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Atos Administrativos'
    def __str__(self):
        return self.description

class Prazos_Renovacao(models.Model):
    ato_admin = models.ForeignKey(Atos_Administrativos, on_delete=models.CASCADE, null=True, verbose_name='Ato Administrativo')
    dias_para_renov = models.IntegerField(verbose_name='Prazo Renovação (dias)')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Prazos Renovação'
    def __str__(self):
        return self.ato_admin.description