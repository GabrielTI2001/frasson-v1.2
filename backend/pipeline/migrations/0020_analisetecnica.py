# Generated by Django 5.0 on 2024-09-16 09:53

import django.db.models.deletion
import pipeline.models
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pipeline', '0019_fluxo_prospects_prioridade'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AnaliseTecnica',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('code', models.BigIntegerField(default=pipeline.models.gerarcode, unique=True)),
                ('observacoes', models.TextField(null=True, verbose_name='Observações')),
                ('tipo', models.CharField(choices=[('LC', 'Levantamento de Campo'), ('PA', 'Procedimentos Alternativos'), ('AT', 'Análise Técnica')], default='EA', max_length=3, verbose_name='Status')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('fluxo_prospect', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='pipeline.fluxo_prospects', verbose_name='Fluxo Prospect')),
                ('phase_origem', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='pipeline.fase', verbose_name='Fase Origem')),
            ],
            options={
                'verbose_name_plural': 'Análises Técnicas',
            },
        ),
    ]
