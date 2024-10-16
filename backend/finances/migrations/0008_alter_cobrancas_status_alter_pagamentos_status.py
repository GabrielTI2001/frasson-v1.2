# Generated by Django 5.0 on 2024-07-17 12:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finances', '0007_alter_cobrancas_options_alter_activities_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cobrancas',
            name='status',
            field=models.CharField(choices=[('AD', 'Aguardando Distribuição'), ('NT', 'Notificação'), ('FT', 'Faturamento'), ('AG', 'Agendado'), ('PG', 'Pago')], max_length=10, null=True, verbose_name='Status'),
        ),
        migrations.AlterField(
            model_name='pagamentos',
            name='status',
            field=models.CharField(choices=[('AD', 'Aguardando Distribuição'), ('AG', 'Agendado'), ('PG', 'Pago')], max_length=10, null=True, verbose_name='Status'),
        ),
    ]
