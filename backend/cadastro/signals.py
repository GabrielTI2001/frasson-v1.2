from django.db.models.signals import pre_delete, pre_save, post_save
from django.dispatch import receiver
from .models import Pictures_Benfeitorias, Analise_Solo, Feedbacks_Replies, Feedbacks_System
from backend.frassonUtilities import Frasson
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

@receiver(pre_save, sender=Pictures_Benfeitorias)
def remover_arquivo_antigo(sender, instance, **kwargs):
    if instance.pk:  # Verifica se é uma atualização
        try:
            registro_anterior = Pictures_Benfeitorias.objects.get(pk=instance.pk)
            arquivo_antigo = registro_anterior.file 
            novo_arquivo = instance.file
            if arquivo_antigo != novo_arquivo:
                if os.path.isfile(arquivo_antigo.path):
                    os.remove(arquivo_antigo.path) 
        except Pictures_Benfeitorias.DoesNotExist:
            pass 

@receiver(pre_save, sender=Analise_Solo)
def remover_arquivo_antigo(sender, instance, **kwargs):
    if instance.pk:  # Verifica se é uma atualização
        try:
            registro_anterior = Analise_Solo.objects.get(pk=instance.pk)
            arquivo_antigo = registro_anterior.file 
            novo_arquivo = instance.file
            if arquivo_antigo != novo_arquivo:
                if os.path.isfile(arquivo_antigo.path):
                    os.remove(arquivo_antigo.path) 
        except Analise_Solo.DoesNotExist:
            pass 

# @receiver(post_save, sender=Feedbacks_Replies)
# def criar_notificacao(sender, instance, created, **kwargs):
#     if created:
#         reply = Feedbacks_Replies.objects.get(pk=instance.pk)
#         Frasson.createNotificationMessageUsers(
#             str_title='Nova resposta de feedback',
#             str_subject='Resposta de feedback da aplicação',
#             str_text=reply.text,
#             str_icon='fa-solid fa-comment',
#             str_icon_color='info',
#             int_recipient=reply.feedback.user.id,
#             int_sender=1  # id do Adriano
#         )