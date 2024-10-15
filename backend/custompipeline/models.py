from django.db import models
import uuid, time, random, os
from datetime import datetime, time as dtime, timedelta
from users.models import User

def gerarcode():
    timenumber = int(time.time())
    code = timenumber - 1200000000 + random.randint(1, 10000)
    return code

class Pipe(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    name = models.CharField(max_length=255, null=False, blank=False, verbose_name='Descricao Fluxo')
    members = models.ManyToManyField(User, verbose_name='Pessoas Autorizadas', related_name="pessoas_autorizadas_custom")
    settings = models.JSONField(null=True, verbose_name='Propriedades Pipe', blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_by_id')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_by_id')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Pipes'
    def __str__(self):
        return self.name

class Fase(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    pipe = models.ForeignKey(Pipe, on_delete=models.CASCADE)
    name = models.CharField(max_length=150, null=False, blank=False, verbose_name='Nome Fase')
    description = models.TextField(null=False, blank=False, verbose_name='Descrição Fase')
    assignees = models.ManyToManyField(User, verbose_name='Responsáveis', related_name="responsaveis_fase_custom")
    allowed_destiny_phases = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='fases_origem')
    settings = models.JSONField(null=True, verbose_name='Propriedades Fase')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_by_phase')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_by_phase')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Fases'
    def __str__(self):
        return self.name

class Field(models.Model):
    TIPO_CHOICES = (('TC', 'Texto Curto'), ('TC', 'Texto Longo'), ('N','Numérico'), ('A','Anexo'),
        ('D','Data'), ('DH','Data e Hora'), ('CF','Conexão de Fluxo'), ('CD','Conexão de Database'),
        ('CB','Checkbox')
    )
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    pipe = models.ForeignKey(Pipe, on_delete=models.CASCADE)
    phase = models.ForeignKey(Fase, null=True, on_delete=models.CASCADE)
    type = models.CharField(choices=TIPO_CHOICES, null=True, max_length=5, verbose_name='Tipo')
    settings = models.JSONField(null=True, verbose_name='Propriedades Campo')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_by_field')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_by_field')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Fields'
    def __str__(self):
        return self.code

class Card(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    data = models.JSONField(null=True, verbose_name='Dados Card')
    due_date = models.DateTimeField(null=True, verbose_name='Data de Vencimento')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_by_card')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_by_card')
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
    to_pipe = models.ForeignKey(Pipe, on_delete=models.CASCADE, related_name='to_fluxo')
    to_table = models.CharField(null=True, max_length=30, verbose_name='Nome Database')
    from_card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='from_card')
    to_card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name='to_card')
    settings = models.JSONField(null=True, verbose_name='Propriedades Relação')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_by_relacao')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_by_relacao')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Cards'
    def __str__(self):
        return self.code

class Card_Anexos(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    card = models.ForeignKey(Card, on_delete=models.CASCADE, null=True, verbose_name='Fluxo')
    field = models.ForeignKey(Field, on_delete=models.CASCADE, null=True, verbose_name='Produto')
    file = models.FileField(null=True, upload_to='custompipeline', verbose_name='Arquivo')
    name = models.CharField(null=True, max_length=100, verbose_name='Nome Arquivo')
    settings = models.JSONField(null=True, verbose_name='Propriedades Anexo')
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
    code = models.BigIntegerField(unique=True, default=gerarcode)
    card = models.ForeignKey(Card, on_delete=models.CASCADE, null=True, verbose_name='Card')
    text = models.TextField(null=True, verbose_name='Texto')
    phase = models.ForeignKey(Fase, null=True, verbose_name='Fase', on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_by_comment')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_by_comment')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Comentários Card'
    def __str__(self):
        return self.text

class Card_Activities(models.Model):
    TYPE_CHOICES = (('ch', 'change'),('co','comment'), ('mv','fase'), ('c','concluiu'))
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    code = models.BigIntegerField(unique=True, default=gerarcode)
    card = models.ForeignKey(Card, on_delete=models.CASCADE, verbose_name='Card')
    type = models.CharField(null=True, max_length=60, choices=TYPE_CHOICES, verbose_name='Tipo')
    field = models.ForeignKey(Field, on_delete=models.CASCADE, null=True, verbose_name='Campo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Alterado por', related_name='update_by')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Atividades Card'
    def __str__(self):
        return self.field

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