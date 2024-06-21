from django.db import models
from cadastro.models import Instituicoes_Razao_Social
from users.models import User
import uuid

# Create your models here.
class Acessos_Bancarios(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    instituicao = models.ForeignKey(Instituicoes_Razao_Social, on_delete=models.SET_NULL, null=True, verbose_name='Instituição')
    agencia = models.CharField(max_length=20, null=True, verbose_name='Número Agência')
    conta = models.CharField(max_length=20, null=True, verbose_name='Número Conta')
    usuario = models.CharField(max_length=30, null=True, verbose_name='Usuário')
    chave_jota = models.CharField(max_length=30, null=True, verbose_name='Chave J')
    senha_acesso = models.CharField(max_length=50, null=True, verbose_name='Senha de Acesso')
    senha_conta = models.CharField(max_length=15, null=True, verbose_name='Senha da Conta')
    contato_instituicao = models.CharField(max_length=200, null=True, verbose_name='Contato Instituição')
    telefone_contato = models.CharField(max_length=20, null=True, verbose_name='Telefone Contato')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Acessos Bancários'
    def _str_(self):
        return f"{self.instituicao.razao_social}"