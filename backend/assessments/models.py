from django.db import models
from users.models import User
import uuid

class Category_Avaliacao(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    description = models.CharField(max_length=150, null=True, verbose_name="Descrição")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.description

class Avaliacao_Colaboradores(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    description = models.CharField(max_length=150, null=True, verbose_name="Descrição")
    colaboradores = models.ManyToManyField(User, verbose_name="Colaboradores a Avaliar")
    data_ref = models.DateField(null=True)
    is_active = models.BooleanField(default=True, null=True, verbose_name="Ativo?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Questionario(models.Model):
    type_choices = (
        ('Q', 'Qualitativo'), 
        ('N', 'Quantitativo'))
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    type = models.CharField(max_length=1, choices=type_choices, null=True, verbose_name="Tipo do critério")
    category = models.ForeignKey(Category_Avaliacao, on_delete=models.SET_NULL, null=True, verbose_name="Categoria")
    text = models.TextField(verbose_name="Texto da pergunta", null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Notas_Avaliacao(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    avaliacao = models.ForeignKey(Avaliacao_Colaboradores, on_delete=models.CASCADE, null=True, verbose_name="Avaliação")
    questionario = models.ForeignKey(Questionario, on_delete=models.CASCADE, null=True, verbose_name="Questionário")
    ponderador = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Quem avalia", related_name="ponderador")
    nota = models.IntegerField(null=True, verbose_name="Nota da avaliação")
    avaliado = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Avaliado", related_name="avaliado")
    created_at = models.DateTimeField(auto_now_add=True)    
    updated_at = models.DateTimeField(auto_now=True)