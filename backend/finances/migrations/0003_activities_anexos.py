# Generated by Django 5.0 on 2024-07-10 14:47

import django.db.models.deletion
import finances.models
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finances', '0002_alter_contratos_ambiental_data_assinatura_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Activities',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('type', models.CharField(choices=[('ch', 'change'), ('c', 'concluiu')], max_length=60, null=True, verbose_name='Tipo')),
                ('campo', models.TextField(null=True, verbose_name='Campo')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('contrato_ambiental', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='finances.contratos_ambiental', verbose_name='Produto')),
                ('contrato_credito', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='finances.contratos_credito', verbose_name='Produto')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='Alterado por')),
            ],
            options={
                'verbose_name_plural': 'Atividades',
            },
        ),
        migrations.CreateModel(
            name='Anexos',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('file', models.FileField(null=True, upload_to=finances.models.upload_anexo, verbose_name='Arquivo')),
                ('name', models.CharField(max_length=100, null=True, verbose_name='Nome Arquivo')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('contrato_ambiental', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='finances.contratos_ambiental', verbose_name='Contrato GAI')),
                ('contrato_credito', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='finances.contratos_credito', verbose_name='Contrato GAI')),
                ('uploaded_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='Alterado por')),
            ],
            options={
                'verbose_name_plural': 'Anexos',
            },
        ),
    ]
