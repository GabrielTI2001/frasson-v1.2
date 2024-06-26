from django.db.models.signals import pre_delete, pre_save, post_save
from django.dispatch import receiver
from .models import Regimes_Exploracao, Imoveis_Rurais
import os
from backend.backgroundTasks import InsertParcelasImoveisRurais, InsertCARImoveisRurais

@receiver(pre_delete, sender=Regimes_Exploracao)
def excluir_arquivo_no_delete(sender, instance, **kwargs):
    if instance.instrumento_cessao:
        if os.path.isfile(instance.instrumento_cessao.path):
            os.remove(instance.instrumento_cessao.path)

@receiver(pre_save, sender=Regimes_Exploracao)
def remover_arquivo_antigo(sender, instance, **kwargs):
    if instance.pk:  # Verifica se é uma atualização
        try:
            registro_anterior = Regimes_Exploracao.objects.get(pk=instance.pk)
            arquivo_antigo = registro_anterior.instrumento_cessao 
            if arquivo_antigo:
                if os.path.isfile(arquivo_antigo.path):
                    os.remove(arquivo_antigo.path) 
        except Regimes_Exploracao.DoesNotExist:
            pass 

@receiver(post_save, sender=Imoveis_Rurais)
def cadastrar_car_sigef(sender, instance, created, **kwargs):
    if created: # Verifica se é uma atualização
        try:
            id = instance.pk
            if instance.codigo_imovel:
                InsertParcelasImoveisRurais(id, instance.codigo_imovel)
            if instance.codigo_car:  
                InsertCARImoveisRurais(id, instance.codigo_car)
        except Regimes_Exploracao.DoesNotExist:
            pass 