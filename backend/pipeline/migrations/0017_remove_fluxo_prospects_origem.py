# Generated by Django 5.0 on 2024-09-12 17:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pipeline', '0016_remove_fluxo_prospects_cliente_fluxo_prospects_nome'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='fluxo_prospects',
            name='origem',
        ),
    ]
