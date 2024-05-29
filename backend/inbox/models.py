from django.db import models
from users.models import User
import uuid
# Create your models here.

class Notifications_Messages(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    title = models.CharField(max_length=255, null=True, verbose_name='Título da Mensagem')
    subject = models.CharField(max_length=255, null=True, verbose_name='Assunto da Mensagem')
    text = models.TextField(null=True, verbose_name='Texto da Mensagem')
    icon = models.CharField(max_length=100, null=True, verbose_name='Icone da Mensagem')
    icon_color = models.CharField(max_length=30, null=True, verbose_name='Cor do Ícone')
    read = models.BooleanField(default=False, null=True, verbose_name='Mensagem Lida')
    recipient = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='recipient_id', verbose_name='Destinatário da Mensagem')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sender_id', verbose_name='Remetente da Mensagem')
    archived = models.BooleanField(default=False, null=True, verbose_name='Mensagem Arquivada')
    archived_at = models.DateTimeField(null=True, blank=True, verbose_name='Arquivada em')
    deleted = models.BooleanField(default=False, null=True, verbose_name='Mensagem Deletada')
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name='Enviada para a lixeira em')
    starred = models.BooleanField(default=False, null=True, verbose_name='Mensagem Favoritada')
    starred_at = models.DateTimeField(null=True, blank=True, verbose_name='Favoritada em')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Mensagens de Notificação'
    def __str__(self):
        return self.subject