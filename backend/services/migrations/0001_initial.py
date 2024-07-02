# Generated by Django 5.0 on 2024-07-01 10:46

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Commodity_Cotacao',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('commodity', models.CharField(max_length=255, null=True, verbose_name='Produto')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Descrição do Produto')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Commodity',
            },
        ),
        migrations.CreateModel(
            name='Localizacao_Cotacao',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('location', models.CharField(max_length=255, null=True, verbose_name='Localização')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Descrição da Localização')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Localização Cotação',
            },
        ),
        migrations.CreateModel(
            name='Commodity_Prices',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(null=True, verbose_name='Data Referência')),
                ('type', models.CharField(max_length=255, null=True, verbose_name='Tipo')),
                ('unit', models.CharField(blank=True, max_length=100, null=True, verbose_name='Unidade de Cotação')),
                ('price', models.DecimalField(decimal_places=2, max_digits=15, null=True, verbose_name='Preço da Cotação')),
                ('source', models.CharField(blank=True, max_length=255, null=True, verbose_name='Fonte da Cotação')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('commodity', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='services.commodity_cotacao', verbose_name='Produto Cotação')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='Criado Por')),
                ('location', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='services.localizacao_cotacao', verbose_name='Localização')),
            ],
            options={
                'verbose_name_plural': 'Commodity Prices',
            },
        ),
    ]
