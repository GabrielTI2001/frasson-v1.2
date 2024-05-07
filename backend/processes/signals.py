from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver
from .models import Acompanhamento_Processos
import os

@receiver(pre_delete, sender=Acompanhamento_Processos)
def excluir_arquivo_no_delete(sender, instance, **kwargs):
    if instance.file:
        os.remove(instance.file.path)
