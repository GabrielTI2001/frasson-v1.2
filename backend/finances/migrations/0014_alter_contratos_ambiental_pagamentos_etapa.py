# Generated by Django 5.0 on 2024-09-10 14:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finances', '0013_pagamentos_observacoes'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contratos_ambiental_pagamentos',
            name='etapa',
            field=models.CharField(max_length=100, null=True, verbose_name='Etapa Pagamento'),
        ),
    ]
