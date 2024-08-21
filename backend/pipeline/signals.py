from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import Fluxo_Gestao_Ambiental, Phases_History, Card_Comments, Card_Activities, Card_Anexos, Fluxo_Prospects
from datetime import datetime, timedelta, time
import re, os
from django.core.mail import send_mail

mention_pattern = re.compile(r'\@\[(.+?)\]\((.+?)\)')

@receiver(post_save, sender=Fluxo_Prospects)
def phase_history_prospect(sender, instance, created, **kwargs):
    if created:
        phase = instance.phase
        responsaveis = [r.id for r in instance.phase.responsaveis.all()]
        id = instance.id
        historico_fase = Phases_History.objects.filter(phase=phase, fluxo_prospect_id=id)
        if historico_fase.exists():
            historico_fase.update(first_time_in=datetime.now())
        else:
            Phases_History.objects.create(first_time_in=datetime.now(), phase=phase, fluxo_prospect_id=id)
        instance.responsaveis.set(responsaveis)
        if instance.phase.dias_prazo:
            data_vencimento = datetime.now().date() + timedelta(days=instance.phase.dias_prazo)
        else:
            data_vencimento = datetime.now().date() + timedelta(days=5)
        data_e_hora_vencimento = datetime.combine(data_vencimento, time(18, 0))
        instance.data_vencimento = data_e_hora_vencimento
        instance.save()

@receiver(post_save, sender=Fluxo_Gestao_Ambiental)
def phase_history_gai(sender, instance, created, **kwargs):
    if created:
        phase = instance.phase
        responsaveis = [r.id for r in instance.phase.responsaveis.all()]
        produto_id = instance.id
        historico_fase = Phases_History.objects.filter(phase=phase, fluxo_ambiental_id=produto_id)
        if historico_fase.exists():
            historico_fase.update(first_time_in=datetime.now())
        else:
            Phases_History.objects.create(first_time_in=datetime.now(), phase=phase, fluxo_ambiental_id=produto_id)
        instance.responsaveis.set(responsaveis)
        if instance.phase.dias_prazo:
            data_vencimento = datetime.now().date() + timedelta(days=instance.phase.dias_prazo)
            data_e_hora_vencimento = datetime.combine(data_vencimento, time(18, 0))
            instance.data_vencimento = data_e_hora_vencimento
        instance.save()

@receiver(post_save, sender=Card_Comments)
def mention_coment(sender, instance, created, **kwargs):
    if created:
        Card_Activities.objects.create(type='co', updated_by_id=instance.created_by.id, 
            fluxo_ambiental=instance.fluxo_ambiental, pvtec=instance.pvtec, campo=instance.text)
        mentions = mention_pattern.findall(instance.text)
        for display, id in mentions:
            # mentioned_user = get_object_or_404(User, id=id)
            # send_mail(
            #     "Teste Aplicação Frasson",
            #     "Olá. Mencionaram Você em um Card",
            #     "suporte@frassonconsultoria.com.br",
            #     ["damatagabriel@hotmail.com"],
            #     fail_silently=False,
            # )
            print(f"User mentioned: {display}")
        
@receiver(pre_delete, sender=Card_Anexos)
def excluir_arquivo_no_delete(sender, instance, **kwargs):
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)

@receiver(post_save, sender=Card_Anexos)
def anexo_atividade(sender, instance, created, **kwargs):
    if created:
        if instance.fluxo_ambiental:
            Card_Activities.objects.create(type='ch', updated_by_id=instance.uploaded_by.id, 
                fluxo_ambiental_id=instance.fluxo_ambiental.id, campo='a Lista de Anexos')