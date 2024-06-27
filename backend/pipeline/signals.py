from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Card_Produtos, Phases_History
from datetime import datetime, timedelta
import re

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
        
        
