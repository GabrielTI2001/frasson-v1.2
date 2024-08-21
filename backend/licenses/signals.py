from django.db.models.signals import pre_delete, pre_save, post_save
from django.dispatch import receiver
from .models import Anexos
import os

@receiver(pre_delete, sender=Anexos)
def excluir_arquivo_anexo(sender, instance, **kwargs):
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)