# Generated by Django 5.0 on 2024-07-01 10:45

import cadastro.models
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
            name='MyAppPermissions',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
            options={
                'permissions': [('ver_feedbacks_users', 'Ver Feedbacks Users'), ('ver_cadastros_gerais', 'Ver Cadastros Gerais')],
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Benfeitorias_Fazendas',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('tamanho', models.DecimalField(decimal_places=2, max_digits=15, null=True, verbose_name='Tamanho (m²)')),
                ('valor_estimado', models.DecimalField(decimal_places=2, max_digits=15, null=True, verbose_name='Valor Estimado (R$)')),
                ('data_construcao', models.DateField(verbose_name='Data Construção')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Cadastro_Pessoal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('natureza', models.CharField(choices=[('PF', 'Pessoa Física'), ('PJ', 'Pessoa Jurídica')], max_length=2, null=True, verbose_name='Natureza Jurídica')),
                ('razao_social', models.CharField(max_length=255, null=True, verbose_name='Nome ou Razão Social')),
                ('fantasia', models.CharField(max_length=255, null=True, verbose_name='Nome Fantasia')),
                ('cpf_cnpj', models.CharField(max_length=30, null=True, verbose_name='CPF ou CNPJ')),
                ('numero_rg', models.CharField(max_length=50, null=True, verbose_name='Número RG')),
                ('cep_logradouro', models.CharField(max_length=30, null=True, verbose_name='CEP Logradouro')),
                ('logradouro', models.CharField(max_length=255, null=True, verbose_name='Logradouro')),
                ('data_nascimento', models.DateField(null=True, verbose_name='Data Nascimento')),
                ('contato1', models.CharField(max_length=100, null=True, verbose_name='Contato 01')),
                ('contato2', models.CharField(max_length=100, null=True, verbose_name='Contato 02')),
                ('email1', models.CharField(max_length=100, null=True, verbose_name='Email 01')),
                ('email2', models.CharField(max_length=100, null=True, verbose_name='Email 02')),
                ('avatar', models.FileField(default='avatars/clients/default-avatar.jpg', upload_to='avatars/clients')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Cadastro Pessoal',
            },
        ),
        migrations.CreateModel(
            name='Cartorios_Registro',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('razao_social', models.CharField(max_length=255, null=True, verbose_name='Nome do Cartório')),
                ('cnpj', models.CharField(max_length=50, null=True, verbose_name='CNPJ do Cartório')),
                ('cep_logradouro', models.CharField(max_length=30, null=True, verbose_name='CEP Logradouro')),
                ('logradouro', models.CharField(max_length=255, null=True, verbose_name='Logradouro')),
                ('atendente', models.CharField(max_length=255, null=True, verbose_name='Nome Atendente')),
                ('contato_01', models.CharField(max_length=50, null=True, verbose_name='Contato')),
                ('contato_02', models.CharField(max_length=50, null=True, verbose_name='Contato')),
                ('email', models.CharField(max_length=50, null=True, verbose_name='Email')),
                ('observacoes', models.TextField(null=True, verbose_name='Observações')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Cadastro Cartórios',
            },
        ),
        migrations.CreateModel(
            name='Categoria_Cadastro',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('categoria', models.CharField(max_length=255, verbose_name='Categoria')),
                ('sigla', models.CharField(max_length=30, verbose_name='Sigla')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Grupos Clientes',
            },
        ),
        migrations.CreateModel(
            name='Contas_Bancarias_Clientes',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('agencia', models.CharField(max_length=20, null=True)),
                ('conta', models.CharField(max_length=20, null=True)),
                ('gerente', models.CharField(max_length=255, null=True)),
                ('contato', models.CharField(max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Contas Bancárias Clientes',
            },
        ),
        migrations.CreateModel(
            name='Culturas_Agricolas',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('cultura', models.CharField(max_length=255, null=True, verbose_name='Cultura Agrícola')),
                ('nome_cientifico', models.CharField(blank=True, max_length=150, null=True, verbose_name='Nome Científico')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Culturas Agrícolas',
            },
        ),
        migrations.CreateModel(
            name='Detalhamento_Servicos',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('detalhamento_servico', models.CharField(max_length=255, null=True)),
                ('acronym', models.CharField(blank=True, max_length=10, null=True, verbose_name='Sigla')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Detalhamento Serviços',
            },
        ),
        migrations.CreateModel(
            name='Empresas_Frasson',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('razao_social', models.CharField(blank=True, max_length=255, null=True, verbose_name='Razão Social')),
                ('fantasia', models.CharField(blank=True, max_length=255, null=True, verbose_name='Nome Fantasia')),
                ('cnpj', models.CharField(blank=True, max_length=15, null=True, verbose_name='CNPJ')),
                ('endereco', models.CharField(blank=True, max_length=255, null=True, verbose_name='Endereço')),
                ('cep', models.CharField(blank=True, max_length=15, null=True, verbose_name='CEP')),
                ('email', models.CharField(max_length=50, null=True, verbose_name='Email')),
                ('telefone', models.CharField(max_length=50, null=True, verbose_name='Telefone')),
                ('data_abertura', models.DateField(null=True, verbose_name='Data Abertura')),
                ('observacoes', models.TextField(null=True, verbose_name='Observações')),
                ('logo', models.FileField(null=True, upload_to='logos/empresas', verbose_name='Logo')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Feedbacks_Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('description', models.CharField(max_length=150, verbose_name='Descrição Categoria')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Categorias Feedbacks',
            },
        ),
        migrations.CreateModel(
            name='Feedbacks_Replies',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('text', models.TextField(null=True, verbose_name='Texto de Resposta')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Respostas Feedback',
            },
        ),
        migrations.CreateModel(
            name='Feedbacks_System',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('description', models.TextField(null=True, verbose_name='Detalhamento Feedback')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Feedbacks Sistema',
            },
        ),
        migrations.CreateModel(
            name='Fotos_Maquinas_Equipamentos',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('description', models.CharField(max_length=255, null=True, verbose_name='Descrição')),
                ('file', models.FileField(null=True, upload_to='maquinas', verbose_name='Foto')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Fotos - Máquinas e Equipamentos',
            },
        ),
        migrations.CreateModel(
            name='Grupos_Clientes',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('nome_grupo', models.CharField(max_length=255, verbose_name='Nome Grupo')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Grupos Clientes',
            },
        ),
        migrations.CreateModel(
            name='Instituicoes_Parceiras',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('identificacao', models.CharField(max_length=255, null=True, verbose_name='Identificação da Instituição')),
                ('numero_agencia', models.CharField(default=None, max_length=30, null=True, verbose_name='Número Agência')),
                ('cep_logradouro', models.CharField(max_length=30, null=True, verbose_name='CEP Logradouro')),
                ('logradouro', models.CharField(max_length=255, null=True, verbose_name='Logradouro')),
                ('telefone_agencia', models.CharField(blank=True, default=None, max_length=50, null=True, verbose_name='Telefone Contato Agência')),
                ('email_agencia', models.CharField(blank=True, default=None, max_length=100, null=True, verbose_name='E-mail Contato Agência')),
                ('gerente_agencia', models.CharField(blank=True, default=None, max_length=255, null=True, verbose_name='Nome Gerente Agência')),
                ('email_gerente', models.CharField(blank=True, default=None, max_length=100, null=True, verbose_name='E-mail Gerente Agência')),
                ('telefone_gerente', models.CharField(blank=True, default=None, max_length=50, null=True, verbose_name='Telefone Gerente Agência')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Instituições Parceiras Frasson',
            },
        ),
        migrations.CreateModel(
            name='Instituicoes_Razao_Social',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('razao_social', models.CharField(max_length=255, null=True, verbose_name='Razão Social')),
                ('cnpj', models.CharField(max_length=255, null=True, unique=True, verbose_name='CNPJ')),
                ('abreviatura', models.CharField(max_length=100, null=True, verbose_name='Abreviatura')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Instituições Razão Social',
            },
        ),
        migrations.CreateModel(
            name='Maquinas_Equipamentos',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('quantidade', models.IntegerField(default=1, null=True, verbose_name='Quantidade')),
                ('ano_fabricacao', models.IntegerField(null=True, verbose_name='Ano Fabricação')),
                ('fabricante', models.CharField(max_length=255, null=True, verbose_name='Fabricante')),
                ('modelo', models.CharField(max_length=255, null=True, verbose_name='Modelo da Máquina ou Equipamento')),
                ('valor_total', models.DecimalField(decimal_places=2, max_digits=15, null=True, verbose_name='Valor Total da Máquina ou Equipamento')),
                ('situacao', models.CharField(max_length=1, null=True, verbose_name='Situação')),
                ('cor', models.CharField(max_length=50, null=True, verbose_name='Cor da Máquina ou Equipamento')),
                ('serie_chassi', models.CharField(max_length=255, null=True, verbose_name='N° Chassi ou Série')),
                ('potencia_capacidade', models.CharField(max_length=255, null=True, verbose_name='Potência ou Capacidade')),
                ('propriedade', models.CharField(max_length=255, null=True, verbose_name='Imóvel Rural')),
                ('estado_conservacao', models.CharField(max_length=50, null=True, verbose_name='Estado Conservação')),
                ('participacao', models.DecimalField(decimal_places=2, max_digits=6, null=True, verbose_name='Percentual Participação')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Máquinas e Equipamentos',
            },
        ),
        migrations.CreateModel(
            name='Municipios',
            fields=[
                ('id', models.BigIntegerField(primary_key=True, serialize=False, verbose_name='Código Município')),
                ('cod_uf', models.IntegerField(verbose_name='Código UF')),
                ('sigla_uf', models.CharField(max_length=2, null=True, verbose_name='Sigla UF')),
                ('nome_uf', models.CharField(max_length=255, null=True, verbose_name='Nome UF')),
                ('nome_municipio', models.CharField(max_length=255, null=True, verbose_name='Nome Município')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Municípios',
            },
        ),
        migrations.CreateModel(
            name='Pictures_Benfeitorias',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('file', models.FileField(null=True, upload_to=cadastro.models.upload_to_picture_benfeitoria, verbose_name='Fotos')),
                ('upload_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Produtos_Frasson',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('description', models.CharField(blank=True, max_length=255, null=True, verbose_name='Descrição')),
                ('acronym', models.CharField(blank=True, max_length=10, null=True, verbose_name='Sigla')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Cadastro Produtos',
            },
        ),
        migrations.CreateModel(
            name='Senhas_Logins',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('usuario_cpf', models.CharField(max_length=255, null=True, verbose_name='Usuário ou CPF')),
                ('email', models.CharField(max_length=255, null=True, verbose_name='Email')),
                ('senha', models.CharField(max_length=20, null=True, verbose_name='Senha')),
                ('observacoes', models.TextField(null=True, verbose_name='Observações')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Senhas e Logins Clientes',
            },
        ),
        migrations.CreateModel(
            name='Tipo_Benfeitorias',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('description', models.CharField(max_length=255, null=True, verbose_name='Descrição')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Tipo_Instituicao',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('descricao', models.CharField(max_length=150, null=True, verbose_name='Descricao do Tipo')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Tipos Instituição',
            },
        ),
        migrations.CreateModel(
            name='Tipo_Maquina_Equipamento',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('description', models.CharField(max_length=255, null=True, verbose_name='Descrição Tipo')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Tipo Máquina ou Equipamento',
            },
        ),
        migrations.CreateModel(
            name='Welcome_Messages',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('message', models.CharField(max_length=255, null=True, verbose_name='Mensagem')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Welcome Messages',
            },
        ),
        migrations.CreateModel(
            name='Analise_Solo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('data_coleta', models.DateField(verbose_name='Data Coleta')),
                ('identificacao_amostra', models.CharField(max_length=255, null=True, verbose_name='Identificação Amostra')),
                ('profundidade', models.DecimalField(decimal_places=2, max_digits=15, null=True, verbose_name='Profundidade (cm)')),
                ('numero_controle', models.CharField(blank=True, max_length=255, null=True, verbose_name='Número da amostra')),
                ('latitude_gd', models.DecimalField(decimal_places=12, max_digits=15, verbose_name='Latitude (GD)')),
                ('longitude_gd', models.DecimalField(decimal_places=12, max_digits=15, verbose_name='Longitude (GD)')),
                ('responsavel', models.CharField(max_length=255, null=True, verbose_name='Responsável pela coleta')),
                ('laboratorio_analise', models.CharField(max_length=255, null=True, verbose_name='Laboratório da análise')),
                ('calcio_cmolc_dm3', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Cálcio')),
                ('magnesio_cmolc_dm3', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Magnésio')),
                ('aluminio_cmolc_dm3', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Alumínio')),
                ('potassio_cmolc_dm3', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Potássio')),
                ('fosforo', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Fósforo')),
                ('fosforo_rem', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Fósforo rem')),
                ('enxofre', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Enxofre')),
                ('zinco', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Zinco')),
                ('boro', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Boro')),
                ('cobre', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Cobre')),
                ('ferro', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Ferro')),
                ('manganes', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Manganês')),
                ('ph_h2O', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Ph em Água')),
                ('ph_cacl2', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='')),
                ('h_mais_al', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='')),
                ('sodio', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='')),
                ('mat_org_dag_dm3', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Matéria Orgânica (dag/dm3)')),
                ('argila_percentual', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Argila (%)')),
                ('silte_percentual', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Silte (%)')),
                ('areia_percentual', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True, verbose_name='Areia (%)')),
                ('file', models.FileField(blank=True, null=True, upload_to=cadastro.models.upload_to_analise, verbose_name='Arquivo em PDF')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
