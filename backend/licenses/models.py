from django.db import models
from cadastro.models import Cadastro_Pessoal, Detalhamento_Servicos, Instituicoes_Razao_Social, Imoveis_Rurais
from users.models import User
import uuid, os

class Cadastro_Licencas(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    beneficiario = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Beneficiário')
    instituicao = models.ForeignKey(Instituicoes_Razao_Social, on_delete=models.SET_NULL, null=True, verbose_name='Instituição')
    tipo_licenca = models.ForeignKey(Detalhamento_Servicos, on_delete=models.SET_NULL, null=True, verbose_name='Tipo Licença')
    detalhe_licenca = models.CharField(max_length=255, null=True, blank=True, verbose_name='Detalhe da Licença')
    numero_requerimento = models.CharField(max_length=200, null=True, blank=True, verbose_name='Número do Requerimento')
    numero_processo = models.CharField(max_length=200, null=True, blank=True, verbose_name='Número do Processo')
    numero_licenca = models.CharField(max_length=150, null=True, blank=True, verbose_name='Número da Licença')
    propriedades = models.ManyToManyField(Imoveis_Rurais, verbose_name='Imóveis Rurais')
    area_beneficiada = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True, verbose_name='Área Beneficiada')
    data_emissao = models.DateField(null=True, blank=True, verbose_name='Data Emissão')
    data_validade = models.DateField(null=True, blank=True, verbose_name='Data Validade')
    dias_renovacao = models.IntegerField(null=True, default=90, verbose_name='Prazo Renovação (dias)')
    descricao = models.TextField(null=True, verbose_name='Descrição da Licença')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Criado por")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Cadastro Licenças'
    def __str__(self):
        return self.beneficiario.razao_social

def upload_anexo(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'{instance.uuid}.{ext}'
    if instance.licenca:
        return os.path.join('licenses/', filename)
    else:
        return os.path.join('licenses/other/', filename)
    
class Anexos(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    licenca = models.ForeignKey(Cadastro_Licencas, on_delete=models.CASCADE, null=True, verbose_name='Análise Solo')
    file = models.FileField(null=True, upload_to=upload_anexo, verbose_name='Arquivo')
    name = models.CharField(null=True, max_length=100, verbose_name='Nome Arquivo')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Carregado por', related_name='licupby')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Anexos Licenses'
    def save(self, *args, **kwargs):
        if self.file and not self.name:
            self.name = self.file.name
        super().save(*args, **kwargs)