from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import Activities, Anexos
import re, os
from django.core.mail import send_mail

mention_pattern = re.compile(r'\@\[(.+?)\]\((.+?)\)')
        
@receiver(pre_delete, sender=Anexos)
def excluir_arquivo_no_delete(sender, instance, **kwargs):
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)

@receiver(post_save, sender=Anexos)
def anexo_atividade(sender, instance, created, **kwargs):
    if created:
        Activities.objects.create(type='ch', updated_by_id=instance.uploaded_by.id, 
            contrato_ambiental_id=instance.contrato_ambiental.id if instance.contrato_ambiental else None, 
            campo='a Lista de Anexos'
        )