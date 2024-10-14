from django.db import models
import uuid, time, random, os
from datetime import datetime, time as dtime, timedelta
from users.models import User

def gerarcode():
    timenumber = int(time.time())
    code = timenumber - 1200000000 + random.randint(1, 10000)
    return code

class Fluxo(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    nome = models.CharField(max_length=255, null=False, blank=False, verbose_name='Descricao Fluxo')
    pessoas = models.ManyToManyField(User, verbose_name='Pessoas Autorizadas', related_name="pessoas_autorizadas_custom")
    propriedades = models.JSONField(null=True, verbose_name='Propriedades Fluxo', blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Fluxos'
    def __str__(self):
        return self.nome

class Fase(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    fluxo = models.ForeignKey(Fluxo, on_delete=models.CASCADE)
    descricao = models.CharField(max_length=255, null=False, blank=False, verbose_name='Nome Fase')
    responsaveis = models.ManyToManyField(User, verbose_name='Responsáveis', related_name="responsaveis_fase_custom")
    destinos_permitidos = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='fases_origem')
    dias_prazo = models.IntegerField(null=True)
    propriedades = models.JSONField(null=True, verbose_name='Propriedades Fluxo')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_by_fase')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Fases'
    def __str__(self):
        return self.descricao

class Field(models.Model):
    TIPO_CHOICES = (('TC', 'Texto Curto'), ('TC', 'Texto Longo'), ('N','Numérico'), ('A','Anexo'),
        ('D','Data'), ('DH','Data e Hora'), ('CF','Conexão de Fluxo'), ('CD','Conexão de Database'),
        ('CB','Checkbox')
    )
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    fluxo = models.ForeignKey(Fluxo, on_delete=models.CASCADE)
    fase = models.ForeignKey(Fase, null=True, on_delete=models.CASCADE)
    tipo = models.CharField(choices=TIPO_CHOICES, null=True, max_length=5, verbose_name='Tipo')
    propriedades = models.JSONField(null=True, verbose_name='Propriedades Campo')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Cards'
    def __str__(self):
        return self.code

class Card(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    data = models.JSONField(null=True, verbose_name='Dados Card')
    data_vencimento = models.DateTimeField(null=True, verbose_name='Data de Vencimento')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Cards'
    def __str__(self):
        return self.code

class Relacao(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    field = models.ForeignKey(Field, null=True, on_delete=models.CASCADE)
    to_fluxo = models.ForeignKey(Fluxo, on_delete=models.CASCADE, related_name='to_fluxo')
    to_table = models.CharField(null=True, max_length=30, verbose_name='Nome Database')
    from_card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='from_card')
    to_card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='to_card')
    propriedades = models.JSONField(null=True, verbose_name='Propriedades Relação')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Cards'
    def __str__(self):
        return self.code

class Card_Anexos(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    card = models.ForeignKey(Card, on_delete=models.CASCADE, null=True, verbose_name='Fluxo')
    field = models.ForeignKey(Field, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    file = models.FileField(null=True, upload_to='custompipeline', verbose_name='Arquivo')
    name = models.CharField(null=True, max_length=100, verbose_name='Nome Arquivo')
    propriedades = models.JSONField(null=True, verbose_name='Propriedades Anexo')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Alterado por', related_name='upload_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Anexos Card'
    def save(self, *args, **kwargs):
        if self.file and not self.name:
            self.name = self.file.name
        super().save(*args, **kwargs)

class Card_Comments(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    card = models.ForeignKey(Card, on_delete=models.CASCADE, null=True, verbose_name='Card')
    text = models.TextField(null=True, verbose_name='Texto')
    phase = models.ForeignKey(Fase, null=True, verbose_name='Fase', on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Criado por', related_name='created_by_2')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Comentários Card'
    def __str__(self):
        return self.text

class Card_Activities(models.Model):
    TYPE_CHOICES = (('ch', 'change'),('co','comment'), ('mv','fase'), ('c','concluiu'))
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    card = models.ForeignKey(Card, on_delete=models.CASCADE, verbose_name='Card')
    type = models.CharField(null=True, max_length=60, choices=TYPE_CHOICES, verbose_name='Tipo')
    campo = models.ForeignKey(Field, on_delete=models.CASCADE, null=True, verbose_name='Campo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Alterado por', related_name='update_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Atividades Card'
    def __str__(self):
        return self.campo

class Phases_History(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    card = models.ForeignKey(Card, on_delete=models.CASCADE, null=True, verbose_name='Card')
    first_time_in = models.DateTimeField(null=True)
    last_time_in = models.DateTimeField(null=True)
    last_time_out = models.DateTimeField(null=True)
    phase = models.ForeignKey(Fase, on_delete=models.CASCADE, null=True, verbose_name='Fase')
    moved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Movido por', related_name='moved_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Histórico de Fases'