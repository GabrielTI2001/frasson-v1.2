# Generated by Django 5.0 on 2024-07-04 16:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pipeline', '0007_alter_card_activities_campo_alter_pvtec_cliente_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='pvtec',
            name='cliente',
        ),
        migrations.RemoveField(
            model_name='pvtec',
            name='detalhe_demanda',
        ),
    ]
