from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver
from .models import Processos_ASV_Areas, Processos_APPO
import os

@receiver(pre_delete, sender=Processos_ASV_Areas)
def excluir_arquivo_no_delete(sender, instance, **kwargs):
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)

@receiver(pre_save, sender=Processos_ASV_Areas)
def remover_arquivo_antigo(sender, instance, **kwargs):
    if instance.pk:  # Verifica se é uma atualização
        try:
            registro_anterior = Processos_ASV_Areas.objects.get(pk=instance.pk)
            arquivo_antigo = registro_anterior.file 
            novo_arquivo = instance.file
            if arquivo_antigo != novo_arquivo:
                if os.path.isfile(arquivo_antigo.path):
                    os.remove(arquivo_antigo.path) 
        except Processos_ASV_Areas.DoesNotExist:
            pass 

@receiver(pre_save, sender=Processos_APPO)
def remover_arquivo_antigo(sender, instance, **kwargs):
    if instance.pk:  # Verifica se é uma atualização
        try:
            registro_anterior = Processos_APPO.objects.get(pk=instance.pk)
            arquivo_antigo = registro_anterior.file 
            novo_arquivo = instance.file
            if arquivo_antigo != novo_arquivo:
                if os.path.isfile(arquivo_antigo.path):
                    os.remove(arquivo_antigo.path) 
        except Processos_APPO.DoesNotExist:
            pass 