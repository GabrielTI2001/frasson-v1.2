# Generated by Django 5.0 on 2024-08-05 10:10

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cadastro', '0003_alter_categoria_cadastro_options_and_more'),
        ('pipeline', '0011_status_acompanhamento_alter_card_activities_type_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='fluxo_prospects',
            options={'verbose_name_plural': 'Fluxo Prospect'},
        ),
        migrations.AlterField(
            model_name='fluxo_prospects',
            name='cliente',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='cadastro.cadastro_pessoal', verbose_name='Cliente'),
        ),
        migrations.AlterField(
            model_name='fluxo_prospects',
            name='produto',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='cadastro.produtos_frasson', verbose_name='Produto'),
        ),
    ]
