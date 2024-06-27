from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Card_Produtos, Phases_History, Card_Coments
from datetime import datetime, timedelta
import re
from django.core.mail import send_mail

mention_pattern = re.compile(r'\@\[(.+?)\]\((.+?)\)')

@receiver(post_save, sender=Card_Produtos)
def create_or_update_phases_history(sender, instance, created, **kwargs):
    if created:
        phase = instance.phase
        responsaveis = [r.id for r in instance.phase.responsaveis.all()]
        produto_id = instance.id
        historico_fase = Phases_History.objects.filter(phase=phase, produto_id=produto_id)
        if historico_fase.exists():
            historico_fase.update(first_time_in=datetime.now())
        else:
            Phases_History.objects.create(first_time_in=datetime.now(), phase=phase, produto_id=produto_id)
        instance.responsaveis.set(responsaveis)
        if instance.phase.dias_prazo:
            instance.data_vencimento = datetime.now() + timedelta(days=instance.phase.dias_prazo)
        instance.save()

@receiver(post_save, sender=Card_Coments)
def mention_coment(sender, instance, created, **kwargs):
    if created:
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
        
