# Generated by Django 5.0 on 2024-07-01 11:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pipeline', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='fluxo_gestao_credito',
            name='valor_operacao',
            field=models.DecimalField(decimal_places=2, max_digits=15, null=True, verbose_name='Valor'),
        ),
    ]
