# Generated by Django 5.0 on 2024-07-01 10:45

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MyAppPermissions',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
            options={
                'permissions': [('ver_menu_servicos', 'Ver Menu Serviços'), ('ver_consulta_cnpj', 'Ver Consulta CNPJ'), ('ver_outorgas_ana', 'Ver Outorgas ANA'), ('ver_cotacoes', 'Ver Cotações')],
                'managed': False,
            },
        ),
    ]
