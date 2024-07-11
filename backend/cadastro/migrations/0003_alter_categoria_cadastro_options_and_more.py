# Generated by Django 5.0 on 2024-07-08 16:28

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cadastro', '0002_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='categoria_cadastro',
            options={'verbose_name_plural': 'Categoria Cadastro Pessoal'},
        ),
        migrations.AlterField(
            model_name='cadastro_pessoal',
            name='avatar',
            field=models.FileField(blank=True, default='avatars/clients/default-avatar.jpg', null=True, upload_to='avatars/clients'),
        ),
        migrations.AlterField(
            model_name='cadastro_pessoal',
            name='cep_logradouro',
            field=models.CharField(blank=True, max_length=30, null=True, verbose_name='CEP Logradouro'),
        ),
        migrations.AlterField(
            model_name='cadastro_pessoal',
            name='contato1',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Contato 01'),
        ),
        migrations.AlterField(
            model_name='cadastro_pessoal',
            name='contato2',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Contato 02'),
        ),
        migrations.AlterField(
            model_name='cadastro_pessoal',
            name='data_nascimento',
            field=models.DateField(blank=True, null=True, verbose_name='Data Nascimento'),
        ),
        migrations.AlterField(
            model_name='cadastro_pessoal',
            name='email1',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Email 01'),
        ),
        migrations.AlterField(
            model_name='cadastro_pessoal',
            name='email2',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Email 02'),
        ),
        migrations.AlterField(
            model_name='cadastro_pessoal',
            name='fantasia',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Nome Fantasia'),
        ),
        migrations.AlterField(
            model_name='cadastro_pessoal',
            name='grupo',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='cadastro.grupos_clientes', verbose_name='Grupo'),
        ),
        migrations.AlterField(
            model_name='cadastro_pessoal',
            name='logradouro',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Logradouro'),
        ),
        migrations.AlterField(
            model_name='cadastro_pessoal',
            name='numero_rg',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='Número RG'),
        ),
        migrations.AlterField(
            model_name='instituicoes_parceiras',
            name='cep_logradouro',
            field=models.CharField(blank=True, max_length=30, null=True, verbose_name='CEP Logradouro'),
        ),
        migrations.AlterField(
            model_name='instituicoes_parceiras',
            name='logradouro',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Logradouro'),
        ),
        migrations.AlterField(
            model_name='instituicoes_parceiras',
            name='numero_agencia',
            field=models.CharField(blank=True, default=None, max_length=30, null=True, verbose_name='Número Agência'),
        ),
        migrations.AlterField(
            model_name='instituicoes_razao_social',
            name='abreviatura',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='Abreviatura'),
        ),
    ]
