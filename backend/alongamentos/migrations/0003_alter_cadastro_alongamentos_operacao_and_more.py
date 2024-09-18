# Generated by Django 5.0 on 2024-08-29 11:12

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('alongamentos', '0002_initial'),
        ('credit', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='cadastro_alongamentos',
            name='operacao',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='credit.operacoes_contratadas', verbose_name='Operação de Crédito'),
        ),
        migrations.CreateModel(
            name='Alongamentos_Cancelados',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('operacao', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='credit.operacoes_contratadas', verbose_name='Operação de Crédito')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='Criado por')),
            ],
            options={
                'verbose_name_plural': 'Alongamentos Cancelados',
            },
        ),
    ]
