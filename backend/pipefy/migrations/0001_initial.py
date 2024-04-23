# Generated by Django 5.0 on 2024-04-23 08:08

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0004_myapppermissions'),
    ]

    operations = [
        migrations.CreateModel(
            name='Cadastro_Produtos',
            fields=[
                ('id', models.BigIntegerField(primary_key=True, serialize=False)),
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
            name='Cadastro_Prospects',
            fields=[
                ('id', models.BigIntegerField(primary_key=True, serialize=False)),
                ('cliente', models.CharField(max_length=255, null=True, verbose_name='Nome do Potencial Cliente')),
                ('representante', models.CharField(max_length=255, null=True, verbose_name='Nome do representante')),
                ('contato_01', models.CharField(max_length=255, null=True, verbose_name='Contato')),
                ('contato_02', models.CharField(max_length=255, null=True, verbose_name='Contato')),
                ('outros_contatos', models.TextField(null=True, verbose_name='Outros contatos')),
                ('email_01', models.CharField(max_length=255, null=True, verbose_name='Email')),
                ('email_02', models.CharField(max_length=255, null=True, verbose_name='Email')),
                ('observacoes', models.TextField(null=True, verbose_name='Outras observações ou detalhes')),
                ('created_at', models.DateTimeField(null=True)),
                ('updated_at', models.DateTimeField(null=True)),
            ],
            options={
                'verbose_name_plural': 'Cadastro de Prospects',
            },
        ),
        migrations.CreateModel(
            name='Fase',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('descricao', models.CharField(max_length=255, verbose_name='Nome Fase')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Fases',
            },
        ),
        migrations.CreateModel(
            name='Fornecedores_Colaboradores',
            fields=[
                ('id', models.BigIntegerField(primary_key=True, serialize=False)),
                ('razao_social', models.CharField(max_length=255, null=True)),
                ('cpf_cnpj', models.CharField(max_length=255, null=True)),
                ('endereco', models.CharField(max_length=255, null=True)),
                ('bairro', models.CharField(max_length=255, null=True)),
                ('municipio', models.CharField(max_length=255, null=True)),
                ('uf', models.CharField(max_length=255, null=True)),
                ('cep', models.CharField(max_length=255, null=True)),
                ('nome_representante', models.CharField(max_length=255, null=True)),
                ('contato_01', models.CharField(max_length=255, null=True)),
                ('contato_02', models.CharField(max_length=255, null=True)),
                ('email', models.CharField(max_length=255, null=True)),
                ('record_url', models.CharField(max_length=255, null=True)),
                ('created_at', models.DateTimeField(null=True)),
                ('updated_at', models.DateTimeField(null=True)),
            ],
            options={
                'verbose_name_plural': 'Cadastro Fornedores e Colaboradores',
            },
        ),
        migrations.CreateModel(
            name='Grupos_Clientes',
            fields=[
                ('id', models.BigIntegerField(primary_key=True, serialize=False)),
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
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('identificacao', models.CharField(max_length=255, null=True)),
                ('record_url', models.CharField(max_length=255, null=True)),
                ('created_at', models.DateTimeField(null=True)),
                ('updated_at', models.DateTimeField(null=True)),
            ],
            options={
                'verbose_name_plural': 'Instituições Parceiras Frasson',
            },
        ),
        migrations.CreateModel(
            name='Instituicoes_Razao_Social',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('razao_social', models.CharField(max_length=255, null=True, verbose_name='Razão Social')),
                ('cnpj', models.CharField(max_length=255, null=True, verbose_name='CNPJ')),
                ('tipo_instituicao', models.CharField(max_length=255, null=True, verbose_name='Tipo Instituição')),
                ('produto_vinculado', models.CharField(max_length=255, null=True, verbose_name='Produto Vinculado')),
                ('abreviatura', models.CharField(max_length=255, null=True, verbose_name='Abreviatura')),
                ('created_at', models.DateTimeField(null=True)),
                ('updated_at', models.DateTimeField(null=True)),
            ],
            options={
                'verbose_name_plural': 'Instituições Razão Social',
            },
        ),
        migrations.CreateModel(
            name='Itens_Financiados',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item', models.CharField(max_length=255, null=True, verbose_name='Item Financiado')),
                ('tipo', models.CharField(max_length=255, null=True, verbose_name='Tipo Item Financiado')),
                ('created_at', models.DateTimeField(null=True)),
                ('updated_at', models.DateTimeField(null=True)),
            ],
            options={
                'verbose_name_plural': 'Cadastro de Itens Financiados',
            },
        ),
        migrations.CreateModel(
            name='Pipe',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('descricao', models.CharField(max_length=255, verbose_name='Descricao  Pipe')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Pipe',
            },
        ),
        migrations.CreateModel(
            name='Cadastro_Pessoal',
            fields=[
                ('id', models.BigIntegerField(primary_key=True, serialize=False)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('razao_social', models.CharField(max_length=255, null=True, verbose_name='Nome ou Razão Social')),
                ('natureza', models.CharField(max_length=10, null=True, verbose_name='Natureza Jurídica')),
                ('cpf_cnpj', models.CharField(max_length=30, null=True, verbose_name='CPF ou CNPJ')),
                ('numero_rg', models.CharField(max_length=50, null=True, verbose_name='Número RG')),
                ('endereco', models.CharField(max_length=255, null=True, verbose_name='Endereço')),
                ('municipio', models.CharField(max_length=255, null=True, verbose_name='Município')),
                ('uf', models.CharField(max_length=30, null=True, verbose_name='UF')),
                ('cep', models.CharField(max_length=30, null=True, verbose_name='CEP')),
                ('data_nascimento', models.DateField(null=True, verbose_name='Data Nascimento')),
                ('contato1', models.CharField(max_length=100, null=True, verbose_name='Contato 01')),
                ('contato2', models.CharField(max_length=100, null=True, verbose_name='Contato 02')),
                ('email', models.CharField(max_length=100, null=True, verbose_name='Email')),
                ('profissao', models.CharField(max_length=255, null=True, verbose_name='Profissão')),
                ('record_url', models.CharField(max_length=255, null=True, verbose_name='URL do Registro')),
                ('created_at', models.DateTimeField(null=True)),
                ('updated_at', models.DateTimeField(null=True)),
                ('socios', models.ManyToManyField(blank=True, to='pipefy.cadastro_pessoal')),
                ('grupo', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.grupos_clientes', verbose_name='Id do Grupo')),
            ],
            options={
                'verbose_name_plural': 'Cadastro Pessoal',
            },
        ),
        migrations.CreateModel(
            name='Cadastro_Pessoal_Info',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('avatar', models.FileField(default='avatars/default-avatar.jpg', upload_to='avatars')),
                ('description', models.TextField(null=True, verbose_name='Descrição')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('cadastro', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to='pipefy.cadastro_pessoal', verbose_name='Cadastro Pessoal')),
            ],
            options={
                'verbose_name_plural': 'Cad. Pessoal Informações Adicionais',
            },
        ),
        migrations.CreateModel(
            name='Detalhamento_Servicos',
            fields=[
                ('id', models.BigIntegerField(primary_key=True, serialize=False)),
                ('detalhamento_servico', models.CharField(max_length=255, null=True)),
                ('created_at', models.DateTimeField(null=True)),
                ('updated_at', models.DateTimeField(null=True)),
                ('produto', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.cadastro_produtos')),
            ],
            options={
                'verbose_name_plural': 'Detalhamento Serviços',
            },
        ),
        migrations.CreateModel(
            name='Contratos_Servicos',
            fields=[
                ('id', models.BigIntegerField(primary_key=True, serialize=False)),
                ('detalhes_negociacao', models.TextField(null=True, verbose_name='Detalhe Negociação')),
                ('percentual_gc', models.FloatField(null=True, verbose_name='Percentual GC')),
                ('valor_gai', models.DecimalField(decimal_places=2, max_digits=15, null=True)),
                ('data_assinatura', models.DateField(null=True, verbose_name='Data Assinatura')),
                ('data_vencimento', models.DateField(null=True, verbose_name='Data Vencimento')),
                ('url_record', models.CharField(max_length=255, null=True, verbose_name='URL do registro')),
                ('created_at', models.DateTimeField(null=True)),
                ('updated_at', models.DateTimeField(null=True)),
                ('contratante', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.cadastro_pessoal', verbose_name='Contratante')),
                ('demais_membros', models.ManyToManyField(blank=True, related_name='demais_membros', to='pipefy.cadastro_pessoal')),
                ('servicos_contratados', models.ManyToManyField(blank=True, to='pipefy.detalhamento_servicos')),
            ],
            options={
                'verbose_name_plural': 'Contratos Serviços',
            },
        ),
        migrations.CreateModel(
            name='Card_Prospects',
            fields=[
                ('id', models.BigIntegerField(primary_key=True, serialize=False)),
                ('produto', models.CharField(max_length=255, null=True, verbose_name='Produto de Interesse')),
                ('classificacao', models.CharField(max_length=255, null=True, verbose_name='Classificação do Prospect')),
                ('origem', models.CharField(max_length=255, null=True, verbose_name='Origem do Prospect')),
                ('proposta_inicial', models.DecimalField(decimal_places=2, max_digits=15, null=True, verbose_name='Proposta Inicial')),
                ('proposta_aprovada', models.DecimalField(decimal_places=2, max_digits=15, null=True, verbose_name='Proposta Aprovada')),
                ('percentual_inicial', models.DecimalField(decimal_places=2, max_digits=15, null=True, verbose_name='Percentual Inicial')),
                ('percentual_aprovado', models.DecimalField(decimal_places=2, max_digits=15, null=True, verbose_name='Percentual Aprovado')),
                ('data_vencimento', models.DateTimeField(null=True, verbose_name='Data de Vencimento')),
                ('card_url', models.CharField(max_length=255, null=True)),
                ('created_at', models.DateTimeField(null=True)),
                ('updated_at', models.DateTimeField(null=True)),
                ('prospect', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.cadastro_prospects', verbose_name='Cadastro Prospect')),
                ('responsavel', models.ManyToManyField(to='users.profile', verbose_name='Responsáveis')),
                ('phase', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='pipefy.fase', verbose_name='Fase')),
            ],
            options={
                'verbose_name_plural': 'Prospects Frasson',
            },
        ),
        migrations.CreateModel(
            name='Imoveis_Rurais',
            fields=[
                ('id', models.BigIntegerField(primary_key=True, serialize=False)),
                ('nome_imovel', models.CharField(max_length=255, null=True, verbose_name='Nome Imóvel')),
                ('matricula_imovel', models.CharField(max_length=100, null=True, verbose_name='Matrícula Imóvel')),
                ('livro_registro', models.CharField(max_length=150, null=True, verbose_name='Livro Registro')),
                ('numero_registro', models.CharField(max_length=150, null=True, verbose_name='Número Registro')),
                ('data_registro', models.DateField(null=True, verbose_name='Data Registro')),
                ('municipio_localizacao', models.CharField(max_length=255, null=True, verbose_name='Município Localização')),
                ('uf_localizacao', models.CharField(max_length=50, null=True, verbose_name='UF Localização')),
                ('cep_localizacao', models.CharField(max_length=50, null=True, verbose_name='CEP Localização')),
                ('titulo_posse', models.CharField(max_length=255, null=True, verbose_name='Título de Posse')),
                ('nirf', models.CharField(max_length=255, null=True, verbose_name='Número NIRF')),
                ('ccir', models.CharField(max_length=255, null=True, verbose_name='Número CCIR')),
                ('car', models.CharField(max_length=255, null=True, verbose_name='Registro CAR')),
                ('area_total', models.DecimalField(decimal_places=4, max_digits=15, null=True, verbose_name='Área Total')),
                ('modulos_fiscais', models.DecimalField(decimal_places=4, max_digits=15, null=True, verbose_name='Módulos Fiscais')),
                ('area_reserva', models.DecimalField(decimal_places=4, max_digits=15, null=True, verbose_name='Área de Reserva Legal')),
                ('localizacao_reserva', models.CharField(max_length=255, null=True, verbose_name='Localização da Reserva Legal')),
                ('area_app', models.DecimalField(decimal_places=4, max_digits=15, null=True, verbose_name='Área de APP')),
                ('area_veg_nat', models.DecimalField(decimal_places=4, max_digits=15, null=True, verbose_name='Área de Vegetação Nativa')),
                ('area_explorada', models.DecimalField(decimal_places=4, max_digits=15, null=True, verbose_name='Área Explorada')),
                ('roteiro_acesso', models.TextField(null=True, verbose_name='Roteiro de Acesso')),
                ('url_record', models.CharField(max_length=255, null=True)),
                ('created_at', models.DateTimeField(null=True)),
                ('updated_at', models.DateTimeField(null=True)),
                ('proprietario', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.cadastro_pessoal', verbose_name='Nome Proprietário')),
            ],
            options={
                'verbose_name_plural': 'Imóveis Rurais',
            },
        ),
        migrations.CreateModel(
            name='ContasBancarias_Clientes',
            fields=[
                ('id', models.BigIntegerField(primary_key=True, serialize=False)),
                ('agencia', models.CharField(max_length=20, null=True)),
                ('conta', models.CharField(max_length=20, null=True)),
                ('created_at', models.DateTimeField(null=True)),
                ('updated_at', models.DateTimeField(null=True)),
                ('cliente', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.cadastro_pessoal')),
                ('instituicao', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.instituicoes_parceiras')),
            ],
            options={
                'verbose_name_plural': 'Contas Bancárias Clientes',
            },
        ),
        migrations.CreateModel(
            name='Card_Produtos',
            fields=[
                ('id', models.BigIntegerField(primary_key=True, serialize=False)),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('card', models.CharField(max_length=255, null=True, verbose_name='Tipo Card')),
                ('valor_operacao', models.DecimalField(decimal_places=2, max_digits=15, null=True, verbose_name='Valor da Operação')),
                ('faturamento_estimado', models.DecimalField(decimal_places=2, max_digits=15, null=True, verbose_name='Faturamento Estimado')),
                ('card_url', models.CharField(max_length=255, null=True, verbose_name='URL do Card')),
                ('created_at', models.DateTimeField(null=True)),
                ('updated_at', models.DateTimeField(null=True)),
                ('beneficiario', models.ManyToManyField(to='pipefy.cadastro_pessoal', verbose_name='Nome Beneficiário')),
                ('contrato', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.contratos_servicos', verbose_name='Contrato Serviço')),
                ('detalhamento', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.detalhamento_servicos', verbose_name='Detalhamento Serviço')),
                ('phase', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='pipefy.fase', verbose_name='Fase')),
                ('instituicao', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.instituicoes_parceiras', verbose_name='Instituição Parceira')),
            ],
            options={
                'verbose_name_plural': 'Produtos Frasson',
            },
        ),
        migrations.AddField(
            model_name='instituicoes_parceiras',
            name='instituicao',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.instituicoes_razao_social'),
        ),
        migrations.CreateModel(
            name='Operacoes_Contratadas',
            fields=[
                ('id', models.BigIntegerField(primary_key=True, serialize=False)),
                ('numero_operacao', models.CharField(max_length=255, null=True, verbose_name='Número da Operação')),
                ('valor_operacao', models.DecimalField(decimal_places=2, max_digits=15, null=True, verbose_name='Valor da Operação')),
                ('area_beneficiada', models.DecimalField(decimal_places=2, max_digits=15, null=True, verbose_name='Área Total Beneficiada')),
                ('fonte_recurso', models.CharField(max_length=255, null=True, verbose_name='Fonte do Recurso')),
                ('imovel_beneficiado', models.CharField(max_length=255, null=True, verbose_name='Imóvel Beneficiado')),
                ('matricula_imovel', models.CharField(max_length=255, null=True, verbose_name='Matrícula Imóvel')),
                ('data_emissao_cedula', models.DateField(null=True, verbose_name='Data Emissão Cédula')),
                ('data_primeiro_vencimento', models.DateField(null=True, verbose_name='Data Primeiro Vencimento')),
                ('data_prod_armazenado', models.DateField(null=True, verbose_name='Data Prod. Armazenado')),
                ('data_vencimento', models.DateField(null=True, verbose_name='Data Vencimento')),
                ('taxa_juros', models.DecimalField(decimal_places=4, max_digits=10, null=True, verbose_name='Taxa Juros')),
                ('safra', models.CharField(max_length=50, null=True, verbose_name='Safra')),
                ('url_record', models.CharField(max_length=255, null=True, verbose_name='URL do registro')),
                ('created_at', models.DateTimeField(null=True)),
                ('updated_at', models.DateTimeField(null=True)),
                ('beneficiario', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.cadastro_pessoal', verbose_name='Beneficiário')),
                ('instituicao', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.instituicoes_parceiras', verbose_name='Instituição Parceira')),
                ('item_financiado', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.itens_financiados', verbose_name='Item Financiado')),
            ],
            options={
                'verbose_name_plural': 'Operações Contratadas',
            },
        ),
        migrations.AddField(
            model_name='fase',
            name='pipe',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pipefy.pipe'),
        ),
        migrations.CreateModel(
            name='Regimes_Exploracao',
            fields=[
                ('id', models.BigIntegerField(primary_key=True, serialize=False)),
                ('regime', models.CharField(max_length=255, null=True, verbose_name='Regime de Exploração')),
                ('data_inicio', models.DateField(null=True, verbose_name='Data de Início')),
                ('data_termino', models.DateField(null=True, verbose_name='Data de Término')),
                ('area_explorada', models.DecimalField(decimal_places=2, max_digits=15, null=True, verbose_name='Área Total Explorada')),
                ('atividades_exploradas', models.CharField(max_length=255, null=True, verbose_name='Atividades Exploradas')),
                ('detalhamento', models.TextField(null=True, verbose_name='Detalhamento Regime Exploração')),
                ('record_url', models.CharField(max_length=255, null=True)),
                ('created_at', models.DateTimeField(null=True)),
                ('updated_at', models.DateTimeField(null=True)),
                ('imovel', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.imoveis_rurais', verbose_name='Imóvel Rural')),
                ('instituicao', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.instituicoes_razao_social', verbose_name='Instituição')),
                ('quem_explora', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='pipefy.cadastro_pessoal', verbose_name='Quem Explora')),
            ],
            options={
                'verbose_name_plural': 'Regimes Exploração',
            },
        ),
    ]
