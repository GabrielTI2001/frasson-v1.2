# Generated by Django 5.0 on 2024-09-12 17:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pipeline', '0017_remove_fluxo_prospects_origem'),
    ]

    operations = [
        migrations.AddField(
            model_name='fluxo_prospects',
            name='descricao',
            field=models.TextField(null=True, verbose_name='Descrição'),
        ),
    ]
