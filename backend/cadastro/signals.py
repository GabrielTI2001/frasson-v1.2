from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import Pictures_Benfeitorias, Analise_Solo
import os

@receiver(pre_delete, sender=Pictures_Benfeitorias)
def excluir_arquivo_no_delete(sender, instance, **kwargs):
    # Verifica se o campo arquivo está definido
    if instance.file:
        # Remove o arquivo do sistema de arquivos
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)

@receiver(pre_delete, sender=Analise_Solo)
def excluir_arquivo_no_delete(sender, instance, **kwargs):
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)