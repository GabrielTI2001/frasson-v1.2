from django.db.models.signals import pre_delete, pre_save, post_save
from django.dispatch import receiver
from .models import Operacoes_Contratadas, Operacoes_Contratadas_Cedulas, Operacoes_Contratadas_Glebas
import os

@receiver(pre_delete, sender=Operacoes_Contratadas_Cedulas)
def excluir_arquivo_no_delete(sender, instance, **kwargs):
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)

@receiver(pre_save, sender=Operacoes_Contratadas_Cedulas)
def remover_arquivo_antigo(sender, instance, **kwargs):
    if instance.pk:  # Verifica se é uma atualização
        try:
            registro_anterior = Operacoes_Contratadas_Cedulas.objects.get(pk=instance.pk)
            arquivo_antigo = registro_anterior.file 
            if arquivo_antigo:
                if os.path.isfile(arquivo_antigo.path):
                    os.remove(arquivo_antigo.path) 
        except Operacoes_Contratadas_Cedulas.DoesNotExist:
            pass 