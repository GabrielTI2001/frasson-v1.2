from django.db import models
from django.db import models
from pipeline.models import Fluxo_Gestao_Ambiental
from users.models import User
from datetime import datetime, timedelta

class Processos_Andamento(models.Model):
    processo = models.ForeignKey(Fluxo_Gestao_Ambiental, on_delete=models.SET_NULL, null=True, verbose_name='Processo Frason')
    requerimento = models.CharField(max_length=255, null=True, verbose_name='Número do Requerimento')
    data_requerimento = models.DateField(null=True, verbose_name='Data Requerimento')
    data_enquadramento = models.DateField(null=True, verbose_name='Data Enquadramento')
    data_validacao = models.DateField(null=True, verbose_name='Data Validação Prévia')
    valor_boleto = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor do Boleto')
    vencimento_boleto = models.DateField(null=True, verbose_name='Data Vencimento Boleto')
    data_formacao = models.DateField(null=True, verbose_name='Data Formação do Processo')
    numero_processo = models.CharField(max_length=255, null=True, verbose_name='Número do Processo')
    processo_sei  = models.CharField(max_length=255, null=True, verbose_name='Número do Processo SEI')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Processos Gestão Ambiental'
    
class Status_Acompanhamento(models.Model):
    description = models.CharField(max_length=255, null=True, verbose_name='Descrição do Status')
    sigla = models.CharField(max_length=255, null=True, verbose_name='Sigla Status')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Status Processos GAI'
    def __str__(self):
        return self.description

class Acompanhamento_Processos(models.Model):
    processo = models.ForeignKey(Processos_Andamento, on_delete=models.CASCADE, null=True, verbose_name='Processo')
    data = models.DateField(null=True, verbose_name='Data da atualização')
    status  = models.ForeignKey(Status_Acompanhamento, on_delete=models.SET_NULL, null=True, verbose_name='Status Processos')
    detalhamento = models.TextField(null=True, verbose_name='Detalhamento da Atualização')
    proxima_consulta = models.DateField(null=True, verbose_name='Próxima Consulta')
    file = models.FileField(upload_to='inema/followup', null=True, blank=True, default=None, verbose_name='Arquivo PDF')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Registros de Acompanhamento'
    def save(self, *args, **kwargs):
        prox_consulta = self.data + timedelta(days=15)
        self.proxima_consulta = prox_consulta
        super().save(*args, **kwargs)