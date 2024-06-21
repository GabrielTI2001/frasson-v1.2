# Generated by Django 5.0 on 2024-06-20 17:23

import django.db.models.deletion
import environmental.models
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('cadastro', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Atos_Administrativos',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('description', models.CharField(max_length=255, null=True)),
                ('sigla', models.CharField(max_length=30, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Atos Administrativos',
            },
        ),
        migrations.CreateModel(
            name='Aquifero_APPO',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('description', models.CharField(max_length=255, null=True, verbose_name='Tipo Aquífero')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Tipos Aquífero',
            },
        ),
        migrations.CreateModel(
            name='APPO_INEMA',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('nome_requerente', models.CharField(max_length=255, verbose_name='Nome Requerente')),
                ('cpf_cnpj', models.CharField(max_length=100, verbose_name='CPF/CNPJ')),
                ('numero_processo', models.CharField(error_messages={'unique': 'Processo já cadastrado!'}, max_length=100, null=True, unique=True, verbose_name='Número Processo')),
                ('nome_fazenda', models.CharField(max_length=255, null=True, verbose_name='Propriedade')),
                ('data_documento', models.DateField(null=True, verbose_name='Data Documento')),
                ('data_vencimento', models.DateField(null=True, verbose_name='Data Vencimento')),
                ('processo_frasson', models.BooleanField(default=False, null=True, verbose_name='Processo Frasson')),
                ('reappo', models.BooleanField(default=False, null=True, verbose_name='Processo Renovado')),
                ('file', models.FileField(default=None, null=True, upload_to=environmental.models.upload_to_appo, verbose_name='Arquivo PDF')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('municipio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='cadastro.municipios', verbose_name='Município')),
                ('aquifero', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='environmental.aquifero_appo', verbose_name='Tipo Aquífero')),
            ],
            options={
                'verbose_name_plural': 'Processos APPO',
            },
        ),
        migrations.CreateModel(
            name='ASV_INEMA',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('processo', models.CharField(error_messages={'unique': 'Processo já cadastrado!'}, max_length=255, null=True, unique=True, verbose_name='Número Processo')),
                ('requerente', models.CharField(blank=True, max_length=255, null=True, verbose_name='Nome Requerente')),
                ('cpf_cnpj', models.CharField(blank=True, max_length=40, null=True, verbose_name='CPF/CNPJ')),
                ('portaria', models.CharField(blank=True, max_length=30, null=True, verbose_name='Portaria')),
                ('data_publicacao', models.DateField(blank=True, null=True, verbose_name='Data Publicação')),
                ('data_vencimento', models.DateField(blank=True, null=True, verbose_name='Data Publicação')),
                ('area_total', models.DecimalField(decimal_places=4, max_digits=15, null=True, verbose_name='Área Total ASV')),
                ('localidade', models.CharField(blank=True, max_length=255, null=True, verbose_name='Localidade')),
                ('rendimento', models.DecimalField(decimal_places=4, max_digits=15, null=True, verbose_name='Rendimento Lenhoso')),
                ('data_formacao', models.DateField(blank=True, null=True, verbose_name='Data Formação')),
                ('tecnico', models.CharField(blank=True, max_length=255, null=True, verbose_name='Técnico responsável')),
                ('file', models.FileField(default=None, null=True, upload_to=environmental.models.upload_to_asv, verbose_name='Arquivo PDF')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='Criado Por')),
                ('municipio', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='cadastro.municipios', verbose_name='Município')),
            ],
            options={
                'verbose_name_plural': 'Processos ASV',
            },
        ),
        migrations.CreateModel(
            name='ASV_INEMA_Areas',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('identificacao_area', models.CharField(blank=True, max_length=100, null=True, verbose_name='Identificação da Área')),
                ('file', models.FileField(default=None, null=True, upload_to='inema/asv/kml', verbose_name='Arquivo PDF')),
                ('area_total', models.DecimalField(decimal_places=4, max_digits=15, null=True, verbose_name='Área Total')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('processo', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='environmental.asv_inema', verbose_name='Processo ASV')),
            ],
            options={
                'verbose_name_plural': 'Áreas Processos ASV',
            },
        ),
        migrations.CreateModel(
            name='Empresas_Consultoria',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('razao_social', models.CharField(max_length=255, null=True, verbose_name='Razão Social')),
                ('cnpj', models.CharField(blank=True, error_messages={'unique': 'CNPJ já cadastrado!'}, max_length=40, null=True, unique=True, verbose_name='CNPJ')),
                ('endereco', models.TextField(blank=True, null=True, verbose_name='Endereço Empresa')),
                ('contato_telefone', models.CharField(blank=True, max_length=255, null=True, verbose_name='Contato Telefone')),
                ('contato_email', models.CharField(blank=True, max_length=255, null=True, verbose_name='Contato Email')),
                ('responsavel', models.CharField(blank=True, max_length=255, null=True, verbose_name='Contato Email')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('municipio', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='cadastro.municipios', verbose_name='Município')),
            ],
            options={
                'verbose_name_plural': 'Empresas Consultoria',
            },
        ),
        migrations.AddField(
            model_name='asv_inema',
            name='empresa',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='environmental.empresas_consultoria', verbose_name='Empresa Consultoria'),
        ),
        migrations.CreateModel(
            name='Finalidade_APPO',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('description', models.CharField(max_length=255, null=True, verbose_name='Finalidade APPO')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Finalidade APPO',
            },
        ),
        migrations.CreateModel(
            name='APPO_INEMA_Coordenadas',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('numero_poco', models.IntegerField(null=True, verbose_name='Número Poço')),
                ('latitude_gd', models.DecimalField(decimal_places=8, max_digits=10, verbose_name='Latitude GD')),
                ('longitude_gd', models.DecimalField(decimal_places=8, max_digits=10, verbose_name='Longitude GD')),
                ('vazao_m3_dia', models.DecimalField(decimal_places=2, max_digits=10, null=True, verbose_name='Vazão (m3/dia)')),
                ('poco_perfurado', models.BooleanField(blank=True, default=0, null=True, verbose_name='Poço Perfurado')),
                ('data_perfuracao', models.DateField(blank=True, default=None, null=True, verbose_name='Data Perfuração')),
                ('profundidade_poco', models.DecimalField(decimal_places=2, max_digits=10, null=True, verbose_name='Profundidade Poço')),
                ('nivel_estatico', models.DecimalField(decimal_places=2, max_digits=10, null=True, verbose_name='Nível Estático')),
                ('nivel_dinamico', models.DecimalField(decimal_places=2, max_digits=10, null=True, verbose_name='Nível Dinâmico')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('processo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='environmental.appo_inema')),
                ('finalidade', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='environmental.finalidade_appo', verbose_name='Finalidade Ponto')),
            ],
            options={
                'verbose_name_plural': 'Processos APPO - Coordenadas',
            },
        ),
        migrations.CreateModel(
            name='Outorgas_INEMA',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('numero_processo', models.CharField(error_messages={'unique': 'Processo já cadastrado!'}, max_length=100, null=True, unique=True, verbose_name='Número Processo INEMA')),
                ('numero_portaria', models.CharField(max_length=50, null=True, verbose_name='Número Portaria')),
                ('data_publicacao', models.DateField(null=True, verbose_name='Data Publicação')),
                ('data_validade', models.DateField(null=True, verbose_name='Data Validade')),
                ('nome_requerente', models.CharField(max_length=255, null=True, verbose_name='Nome Requerente')),
                ('cpf_cnpj', models.CharField(max_length=40, null=True, verbose_name='CPF/CNPJ')),
                ('nome_propriedade', models.CharField(max_length=255, null=True, verbose_name='Nome Propriedade')),
                ('bacia_hidro', models.CharField(max_length=255, null=True, verbose_name='Bacia Hidrográfica')),
                ('area_ha', models.DecimalField(decimal_places=4, max_digits=15, null=True)),
                ('processo_frasson', models.BooleanField(default=False, null=True, verbose_name='Conduzido Frasson')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('finalidade', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='environmental.finalidade_appo', verbose_name='Finalidade Outorga')),
                ('municipio', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='cadastro.municipios', verbose_name='Município Localização')),
            ],
            options={
                'verbose_name_plural': 'Processos Outorga',
            },
        ),
        migrations.CreateModel(
            name='Outorgas_INEMA_Coordenadas',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('descricao_ponto', models.CharField(blank=True, max_length=100, null=True, verbose_name='Descrição Ponto Outorga')),
                ('latitude_gd', models.DecimalField(blank=True, decimal_places=8, max_digits=10, null=True, verbose_name='Latitude')),
                ('longitude_gd', models.DecimalField(blank=True, decimal_places=8, max_digits=10, null=True, verbose_name='Longitude')),
                ('vazao_m3_dia', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Vazão m3/dia')),
                ('bombeamento_h', models.DecimalField(blank=True, decimal_places=2, max_digits=8, null=True, verbose_name='Horas de Bombeamento')),
                ('vazao_m3_dia_jan', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Vazão m3/dia janeiro')),
                ('vazao_m3_dia_fev', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Vazão m3/dia fevereiro')),
                ('vazao_m3_dia_mar', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Vazão m3/dia março')),
                ('vazao_m3_dia_abr', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Vazão m3/dia abril')),
                ('vazao_m3_dia_mai', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Vazão m3/dia maio')),
                ('vazao_m3_dia_jun', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Vazão m3/dia junho')),
                ('vazao_m3_dia_jul', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Vazão m3/dia julho')),
                ('vazao_m3_dia_ago', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Vazão m3/dia agosto')),
                ('vazao_m3_dia_set', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Vazão m3/dia setembro')),
                ('vazao_m3_dia_out', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Vazão m3/dia outubro')),
                ('vazao_m3_dia_nov', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Vazão m3/dia novembro')),
                ('vazao_m3_dia_dez', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Vazão m3/dia dezembro')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('processo', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='environmental.outorgas_inema')),
            ],
            options={
                'verbose_name_plural': 'Coordenadas processos outorga',
            },
        ),
        migrations.CreateModel(
            name='Prazos_Renovacao',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('dias_para_renov', models.IntegerField(verbose_name='Prazo Renovação (dias)')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('ato_admin', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='environmental.atos_administrativos', verbose_name='Ato Administrativo')),
            ],
            options={
                'verbose_name_plural': 'Prazos Renovação',
            },
        ),
        migrations.CreateModel(
            name='Requerimentos_APPO_INEMA',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('nome_requerente', models.CharField(max_length=255, null=True, verbose_name='Nome Requerente')),
                ('cpf_cnpj', models.CharField(max_length=255, null=True, verbose_name='CPF/CNPJ')),
                ('numero_requerimento', models.CharField(error_messages={'unique': 'Requerimento já cadastrado!'}, max_length=255, null=True, unique=True, verbose_name='Número Requerimento')),
                ('data_requerimento', models.DateField(null=True, verbose_name='Data Requerimento')),
                ('email', models.CharField(max_length=255, null=True, verbose_name='Email')),
                ('numero_processo', models.CharField(error_messages={'unique': 'Processo já cadastrado!'}, max_length=100, null=True, unique=True, verbose_name='Número Processo')),
                ('data_formacao', models.DateField(null=True, verbose_name='Data Formação')),
                ('frasson', models.BooleanField(default=False, verbose_name='Requerido pela Frasson?')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('municipio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='cadastro.municipios', verbose_name='Município Localização')),
            ],
            options={
                'verbose_name_plural': 'requerimentos APPO',
            },
        ),
        migrations.CreateModel(
            name='Requerimentos_APPO_Coordenadas',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('numero_poco', models.IntegerField(null=True, verbose_name='Número Poço')),
                ('latitude_gd', models.DecimalField(decimal_places=8, max_digits=10, verbose_name='Latitude GD')),
                ('longitude_gd', models.DecimalField(decimal_places=8, max_digits=10, verbose_name='Longitude GD')),
                ('vazao_m3_dia', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Expect. Vazão (m3/dia)')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('requerimento', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='environmental.requerimentos_appo_inema')),
            ],
            options={
                'verbose_name_plural': 'Requerimentos APPO - Coordenadas',
            },
        ),
        migrations.CreateModel(
            name='Tipo_Captacao',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('description', models.CharField(max_length=255, null=True, verbose_name='Tipo Captação')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Tipos Captação',
            },
        ),
        migrations.AddField(
            model_name='outorgas_inema',
            name='captacao',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='environmental.tipo_captacao', verbose_name='Tipo Captação'),
        ),
    ]
