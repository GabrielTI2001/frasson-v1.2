from django.db import models
from cadastro.models import Municipios
from cadastro.models import Cadastro_Pessoal
from users.models import User
import uuid

#modelo para cadastro de fabricantes de pivot central
class Fabricantes_Pivots(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    nome_fabricante = models.CharField(max_length=255, null=False, blank=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Fabricantes Pivots'
    def __str__(self):
        return self.nome_fabricante

#modelo para cadastro de fabricantes de bombas
class Fabricantes_Bombas(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    nome_fabricante = models.CharField(max_length=255, null=False, blank=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Fabricantes Bombas'
    def __str__(self):
        return self.nome_fabricante

#modelo para cadastro de equipamentos pivot central - perfil de irrigação
# class  Perfil_Irrigacao(models.Model):
#     uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
#     nome_proprietario = models.CharField(max_length=255, null=True)
#     municipio_localizacao = models.ForeignKey(Municipios, on_delete=models.CASCADE)
#     identificacao_pivot = models.CharField(max_length=255, null=True)
#     created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     class Meta:
#         verbose_name_plural = 'Perfil Irrigação'
#     def __str__(self):
#         return self.nome_proprietario

#modelo para cadastro de equipamentos pivot central - cadastro geral
class Cadastro_Pivots(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    razao_social_proprietario = models.CharField(max_length=100, null=True, blank=True, verbose_name='Razão Social Proprietário')
    cpf_cnpj_proprietario = models.CharField(max_length=20, null=True, blank=True, verbose_name='CPF/CNPJ Proprietário')
    propriedade_localizacao = models.CharField(max_length=255, null=True, blank=True, verbose_name='Nome da Fazenda')
    municipio_localizacao = models.ForeignKey(Municipios, on_delete=models.CASCADE, null=True, verbose_name='Município Localização')
    identificacao_pivot = models.CharField(max_length=100, null=True, blank=True, verbose_name='Indentificação do Pivot')
    fabricante_pivot = models.ForeignKey(Fabricantes_Pivots, on_delete=models.SET_NULL, null=True, verbose_name = 'Fabricante Pivot')
    area_circular_ha = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=False, verbose_name='Área circular (ha)')
    vazao_total_m3_h = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True,verbose_name='Vazão Total (m3/h)')
    lamina_bruta_21_h = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Lâmina Bruta (mm/dia)')
    periodo_rele_100 = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, verbose_name='Período giro 100% (h)')
    raio_irrigado_m = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=False, verbose_name='Raio irrigado (m)')
    lat_center_gd = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=False, verbose_name='Lat. Centro GD')
    long_center_gd = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=False, verbose_name='Long. Centro GD')
    comprimento_adutora_m = models.DecimalField(max_digits=10, decimal_places=2, null=True, verbose_name='Comprimento Adutora (m)')
    diametro_adutora_mm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Diâmetro Adutora (mm)')
    fabricante_bomba = models.ForeignKey(Fabricantes_Bombas, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Fabricante Bomba')
    modelo_bomba = models.CharField(max_length=255, null=True, blank=True, verbose_name='Modelo Bomba')
    fabricante_motor = models.CharField(max_length=255, null=True, blank=True, verbose_name='Marca Motor')
    pot_motor_cv = models.DecimalField(max_digits=10, decimal_places=2, null=True, verbose_name='Pot. Motor (cv)')
    data_montagem_pivot = models.DateField(null=True, blank=True, verbose_name='Data Montagem Pivot')
    file = models.FileField(upload_to='pivots/fichas', null=True, default=None, verbose_name='Ficha Técnica PDF')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Cadastro Pivots'

    def __str__(self):
        return self.proprietario.razao_social

