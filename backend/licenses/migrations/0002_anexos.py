# Generated by Django 5.0 on 2024-08-08 15:07

import django.db.models.deletion
import licenses.models
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('licenses', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Anexos',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('file', models.FileField(null=True, upload_to=licenses.models.upload_anexo, verbose_name='Arquivo')),
                ('name', models.CharField(max_length=100, null=True, verbose_name='Nome Arquivo')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('licenca', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='licenses.cadastro_licencas', verbose_name='Análise Solo')),
                ('uploaded_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='licupby', to=settings.AUTH_USER_MODEL, verbose_name='Carregado por')),
            ],
            options={
                'verbose_name_plural': 'Anexos Licenses',
            },
        ),
    ]
