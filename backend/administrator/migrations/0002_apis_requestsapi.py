# Generated by Django 5.0 on 2024-06-07 10:21

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('administrator', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='APIs',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('descricao', models.CharField(max_length=60)),
                ('main_url', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='RequestsAPI',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('url', models.CharField(max_length=255)),
                ('type', models.CharField(choices=[('SP', 'SIGEF PARCELAS'), ('CI', 'CAR IMOVEL'), ('SV', 'VERTICES PARCELAS SIGEF'), ('CC', 'COORDENADAS IMOVEL CAR')], max_length=3)),
                ('codigo', models.CharField(max_length=255)),
                ('tempo_decorrido_ms', models.BigIntegerField(null=True)),
                ('valor_cobrado', models.DecimalField(decimal_places=2, max_digits=10)),
                ('cod_resposta', models.CharField(max_length=10)),
                ('text_resposta', models.CharField(max_length=255)),
                ('hora_requisicao', models.DateTimeField()),
                ('api', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='administrator.apis')),
            ],
        ),
    ]
