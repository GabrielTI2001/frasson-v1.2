# Generated by Django 5.0 on 2024-07-11 13:40

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finances', '0005_remove_contratos_ambiental_data_vencimento_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='cobrancas',
            name='contrato_ambiental',
        ),
        migrations.RemoveField(
            model_name='cobrancas',
            name='contrato_credito',
        ),
        migrations.RemoveField(
            model_name='cobrancas',
            name='detalhamento',
        ),
        migrations.RemoveField(
            model_name='cobrancas',
            name='etapa_cobranca',
        ),
        migrations.AddField(
            model_name='cobrancas',
            name='etapa_ambiental',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='finances.contratos_ambiental_pagamentos', verbose_name='Etapa da Cobrança GAI'),
        ),
        migrations.AddField(
            model_name='cobrancas',
            name='etapa_credito',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='finances.contratos_credito_pagamentos', verbose_name='Etapa da Cobrança GC'),
        ),
    ]
