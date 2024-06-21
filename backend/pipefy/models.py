from django.db import models
import uuid
from users.models import Profile, User

class Pipe(models.Model):
    TYPE_CHOICES = (("D", "Database"), ("P", "Pipe"))
    id = models.BigIntegerField(primary_key=True)
    type = models.CharField(max_length=1, choices=TYPE_CHOICES ,null=True, verbose_name='Tipo Pipe')
    name = models.CharField(max_length=255, null=True, blank=True, verbose_name='Nome Pipe')
    description = models.CharField(max_length=255, null=True, blank=True, verbose_name='Descrição')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Cadastro Pipes'
    def __str__(self):
        return self.name

# class Itens_Financiados(models.Model):
#     item = models.CharField(max_length=255, null=True, verbose_name='Item Financiado')
#     tipo = models.CharField(max_length=255, null=True, verbose_name='Tipo Item Financiado')
#     created_at = models.DateTimeField(null=True)
#     updated_at = models.DateTimeField(null=True)
#     class Meta:
#         verbose_name_plural = 'Cadastro de Itens Financiados'
#     def __str__(self):
#         return self.item

# class Grupos_Clientes(models.Model):
#     id = models.BigIntegerField(primary_key=True)
#     uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
#     nome_grupo = models.CharField(max_length=255, null=False, blank=False, verbose_name='Nome Grupo')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     class Meta:
#         verbose_name_plural = 'Grupos Clientes'
#     def __str__(self):
#         return self.nome_grupo

# class Cadastro_Pessoal(models.Model): 
#     id = models.BigIntegerField(primary_key=True)
#     uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
#     razao_social = models.CharField(max_length=255, null=True, verbose_name='Nome ou Razão Social')
#     natureza = models.CharField(max_length=10, null=True, verbose_name='Natureza Jurídica')
#     cpf_cnpj = models.CharField(max_length=30, null=True, verbose_name='CPF ou CNPJ')
#     numero_rg = models.CharField(max_length=50, null=True, verbose_name='Número RG')
#     endereco = models.CharField(max_length=255, null=True, verbose_name='Endereço')
#     municipio = models.CharField(max_length=255, null=True, verbose_name='Município')
#     uf = models.CharField(max_length=30, null=True, verbose_name='UF')
#     cep = models.CharField(max_length=30, null=True, verbose_name='CEP')
#     data_nascimento = models.DateField(null=True, verbose_name='Data Nascimento')
#     contato1 = models.CharField(max_length=100, null=True, verbose_name='Contato 01')
#     contato2 = models.CharField(max_length=100, null=True, verbose_name='Contato 02')
#     email = models.CharField(max_length=100, null=True, verbose_name='Email')
#     grupo = models.ForeignKey(Grupos_Clientes, on_delete=models.SET_NULL, null=True, verbose_name='Id do Grupo')
#     profissao = models.CharField(max_length=255, null=True, verbose_name='Profissão')
#     #avatar = ResizedImageField(size=[128, 128], default='avatars/clients/default-avatar.jpg', upload_to='avatars/clients')
#     record_url = models.CharField(max_length=255, null=True, verbose_name='URL do Registro')
#     created_at = models.DateTimeField(null=True)
#     updated_at = models.DateTimeField(null=True)
#     socios = models.ManyToManyField("self", blank=True, symmetrical=False)
#     class Meta:
#         verbose_name_plural = 'Cadastro Pessoal'
#     def __str__(self):
#         return self.razao_social


# class Cadastro_Produtos(models.Model):
#     id = models.BigIntegerField(primary_key=True)
#     description = models.CharField(max_length=255, null=True, blank=True, verbose_name='Descrição')
#     acronym = models.CharField(max_length=10, null=True, blank=True, verbose_name='Sigla')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     class Meta:
#         verbose_name_plural = 'Cadastro Produtos'
#     def __str__(self):
#         return self.description

# class Detalhamento_Servicos(models.Model):
#     id = models.BigIntegerField(primary_key=True)
#     produto = models.ForeignKey(Cadastro_Produtos, on_delete=models.SET_NULL, null=True)
#     detalhamento_servico = models.CharField(max_length=255, null=True)
#     created_at = models.DateTimeField(null=True)
#     updated_at = models.DateTimeField(null=True)
#     class Meta:
#         verbose_name_plural = 'Detalhamento Serviços'
#     def __str__(self):
#         return self.detalhamento_servico

    
# class Contratos_Servicos(models.Model):
#     id = models.BigIntegerField(primary_key=True)
#     contratante = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Contratante', related_name='pip_contr')
#     demais_membros = models.ManyToManyField(Cadastro_Pessoal, blank=True, related_name="demais_membros")
#     servicos_contratados = models.ManyToManyField(Detalhamento_Servicos, blank=True, related_name='pipe_serv')
#     detalhes_negociacao = models.TextField(null=True, verbose_name='Detalhe Negociação')
#     percentual_gc = models.FloatField(null=True, verbose_name='Percentual GC')
#     valor_gai = models.DecimalField(max_digits=15, decimal_places=2, null=True)
#     data_assinatura = models.DateField(null=True, verbose_name='Data Assinatura')
#     data_vencimento = models.DateField(null=True, verbose_name='Data Vencimento')
#     url_record = models.CharField(max_length=255, null=True, verbose_name='URL do registro')
#     created_at = models.DateTimeField(null=True)
#     updated_at = models.DateTimeField(null=True)
#     class Meta:
#         verbose_name_plural = 'Contratos Serviços'
#     def __str__(self):
#         return self.contratante.razao_social

# class Cadastro_Prospects(models.Model):
#     id = models.BigIntegerField(primary_key=True)
#     cliente = models.CharField(max_length=255, null=True, verbose_name='Nome do Potencial Cliente')
#     representante = models.CharField(max_length=255, null=True, verbose_name='Nome do representante')
#     contato_01 = models.CharField(max_length=255, null=True, verbose_name='Contato')
#     contato_02 = models.CharField(max_length=255, null=True, verbose_name='Contato')
#     outros_contatos = models.TextField(null=True, verbose_name='Outros contatos')
#     email_01 = models.CharField(max_length=255, null=True, verbose_name='Email')
#     email_02 = models.CharField(max_length=255, null=True, verbose_name='Email')
#     observacoes = models.TextField(null=True, verbose_name='Outras observações ou detalhes')
#     created_at = models.DateTimeField(null=True)
#     updated_at = models.DateTimeField(null=True)
#     class Meta:
#         verbose_name_plural = 'Cadastro de Prospects'
#     def __str__(self):
#         return self.cliente

# class Instituicoes_Razao_Social(models.Model): 
#     id = models.BigIntegerField(primary_key=True)
#     uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
#     razao_social = models.CharField(max_length=255, null=True, verbose_name='Razão Social')
#     cnpj = models.CharField(max_length=255, null=True, verbose_name='CNPJ')
#     tipo_instituicao = models.CharField(max_length=255, null=True, verbose_name='Tipo Instituição')
#     produto_vinculado = models.CharField(max_length=255, null=True, verbose_name='Produto Vinculado')
#     abreviatura = models.CharField(max_length=255, null=True, verbose_name='Abreviatura')
#     created_at = models.DateTimeField(null=True)
#     updated_at = models.DateTimeField(null=True)
#     class Meta:
#         verbose_name_plural = 'Instituições Razão Social'
#     def __str__(self):
#         return self.razao_social


# class Instituicoes_Parceiras(models.Model): 
#     id = models.BigIntegerField(primary_key=True)
#     uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
#     instituicao = models.ForeignKey(Instituicoes_Razao_Social, on_delete=models.SET_NULL, null=True)
#     identificacao  = models.CharField(max_length=255, null=True)
#     record_url = models.CharField(max_length=255, null=True) 
#     created_at = models.DateTimeField(null=True)
#     updated_at = models.DateTimeField(null=True)
#     class Meta:
#         verbose_name_plural = 'Instituições Parceiras Frasson'
#     def __str__(self):
#         return self.instituicao.razao_social     
    
# class Card_Produtos(models.Model):
#     id = models.BigIntegerField(primary_key=True)
#     uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
#     card = models.CharField(max_length=255, null=True, verbose_name='Tipo Card')
#     beneficiario = models.ManyToManyField(Cadastro_Pessoal, verbose_name='Nome Beneficiário')
#     detalhamento = models.ForeignKey(Detalhamento_Servicos, on_delete=models.SET_NULL, null=True, verbose_name='Detalhamento Serviço')
#     instituicao = models.ForeignKey(Instituicoes_Parceiras, on_delete=models.SET_NULL, null=True, verbose_name='Instituição Parceira')
#     contrato = models.ForeignKey(Contratos_Servicos, on_delete=models.SET_NULL, null=True, verbose_name='Contrato Serviço')
#     valor_operacao = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor da Operação')
#     faturamento_estimado = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Faturamento Estimado')
#     phase_id = models.BigIntegerField(null=True, verbose_name='Id da Fase Atual')
#     phase_name = models.CharField(max_length=255, null=True, verbose_name='Nome da Fase Atual')
#     card_url = models.CharField(max_length=255, null=True, verbose_name='URL do Card')
#     created_at = models.DateTimeField(null=True)
#     updated_at = models.DateTimeField(null=True)
#     class Meta:
#         verbose_name_plural = 'Produtos Frasson'
#     def __str__(self):
#         return self.detalhamento.detalhamento_servico
    
# class Card_Prospects(models.Model): 
#     id = models.BigIntegerField(primary_key=True)
#     prospect = models.ForeignKey(Cadastro_Prospects, on_delete=models.SET_NULL, null=True, verbose_name='Cadastro Prospect')
#     produto = models.CharField(max_length=255, null=True, verbose_name='Produto de Interesse')
#     classificacao = models.CharField(max_length=255, null=True, verbose_name='Classificação do Prospect')
#     origem = models.CharField(max_length=255, null=True, verbose_name='Origem do Prospect')
#     proposta_inicial = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Proposta Inicial')
#     proposta_aprovada = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Proposta Aprovada')
#     percentual_inicial = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Percentual Inicial')
#     percentual_aprovado = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Percentual Aprovado')
#     data_vencimento = models.DateTimeField(null=True, verbose_name='Data de Vencimento')
#     responsavel = models.ManyToManyField(Profile, verbose_name='Responsáveis')
#     phase_id = models.BigIntegerField(null=True, verbose_name='Id da Fase Atual')
#     phase_name = models.CharField(max_length=255, null=True, verbose_name='Nome da Fase Atual')
#     card_url = models.CharField(max_length=255, null=True)
#     created_at = models.DateTimeField(null=True)
#     updated_at = models.DateTimeField(null=True)
#     class Meta:
#         verbose_name_plural = 'Prospects Frasson'
#     def __str__(self):
#         return self.prospect.cliente

# class Operacoes_Contratadas(models.Model): 
#     id = models.BigIntegerField(primary_key=True)
#     beneficiario = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Beneficiário')
#     numero_operacao = models.CharField(max_length=255, null=True, verbose_name='Número da Operação')
#     item_financiado = models.ForeignKey(Itens_Financiados, on_delete=models.SET_NULL, null=True, verbose_name='Item Financiado')
#     valor_operacao = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor da Operação')
#     area_beneficiada = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Área Total Beneficiada')
#     instituicao = models.ForeignKey(Instituicoes_Parceiras, on_delete=models.SET_NULL, null=True, verbose_name='Instituição Parceira')
#     fonte_recurso = models.CharField(max_length=255, null=True, verbose_name='Fonte do Recurso')
#     imovel_beneficiado = models.CharField(max_length=255, null=True, verbose_name='Imóvel Beneficiado')
#     matricula_imovel = models.CharField(max_length=255, null=True, verbose_name='Matrícula Imóvel')
#     data_emissao_cedula = models.DateField(null=True, verbose_name='Data Emissão Cédula')
#     data_primeiro_vencimento = models.DateField(null=True, verbose_name='Data Primeiro Vencimento')
#     data_prod_armazenado = models.DateField(null=True, verbose_name='Data Prod. Armazenado')
#     data_vencimento = models.DateField(null=True, verbose_name='Data Vencimento')
#     taxa_juros = models.DecimalField(max_digits=10, decimal_places=4, null=True, verbose_name='Taxa Juros')
#     safra = models.CharField(max_length=50, null=True, verbose_name='Safra')
#     url_record = models.CharField(max_length=255, null=True, verbose_name='URL do registro')
#     created_at = models.DateTimeField(null=True)
#     updated_at = models.DateTimeField(null=True)
#     class Meta:
#         verbose_name_plural = 'Operações Contratadas'
#     def __str__(self):
#         return self.beneficiario.razao_social

# class ContasBancarias_Clientes(models.Model):
#     id = models.BigIntegerField(primary_key=True)
#     cliente = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True)
#     instituicao = models.ForeignKey(Instituicoes_Parceiras, on_delete=models.SET_NULL, null=True)
#     agencia = models.CharField(max_length=20, null=True)
#     conta = models.CharField(max_length=20, null=True)
#     created_at = models.DateTimeField(null=True)
#     updated_at = models.DateTimeField(null=True)
#     class Meta:
#         verbose_name_plural = 'Contas Bancárias Clientes'
#     def __str__(self):
#         return self.conta
    
# class Fornecedores_Colaboradores(models.Model): 
#     id = models.BigIntegerField(primary_key=True)
#     razao_social = models.CharField(max_length=255, null=True)
#     cpf_cnpj = models.CharField(max_length=255, null=True)
#     endereco = models.CharField(max_length=255, null=True)
#     bairro = models.CharField(max_length=255, null=True)
#     municipio = models.CharField(max_length=255, null=True)
#     uf = models.CharField(max_length=255, null=True)
#     cep = models.CharField(max_length=255, null=True)
#     nome_representante = models.CharField(max_length=255, null=True)
#     contato_01 = models.CharField(max_length=255, null=True)
#     contato_02 = models.CharField(max_length=255, null=True)
#     email = models.CharField(max_length=255, null=True)
#     record_url = models.CharField(max_length=255, null=True)
#     created_at = models.DateTimeField(null=True)
#     updated_at = models.DateTimeField(null=True)
#     class Meta:
#         verbose_name_plural = 'Cadastro Fornedores e Colaboradores'
#     def __str__(self):
#         return self.razao_social
    
# class Imoveis_Rurais(models.Model):
#     id = models.BigIntegerField(primary_key=True)
#     nome_imovel = models.CharField(max_length=255, null=True, verbose_name='Nome Imóvel')
#     matricula_imovel = models.CharField(max_length=100, null=True, verbose_name='Matrícula Imóvel')
#     proprietario = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Nome Proprietário')
#     livro_registro = models.CharField(max_length=150, null=True, verbose_name='Livro Registro')
#     numero_registro = models.CharField(max_length=150, null=True, verbose_name='Número Registro')
#     data_registro = models.DateField(null=True, verbose_name='Data Registro')
#     municipio_localizacao = models.CharField(max_length=255, null=True, verbose_name='Município Localização')
#     uf_localizacao = models.CharField(max_length=50, null=True, verbose_name='UF Localização')
#     cep_localizacao = models.CharField(max_length=50, null=True, verbose_name='CEP Localização')
#     titulo_posse = models.CharField(max_length=255, null=True, verbose_name='Título de Posse')
#     nirf = models.CharField(max_length=255, null=True, verbose_name='Número NIRF')
#     ccir = models.CharField(max_length=255, null=True, verbose_name='Número CCIR')
#     car = models.CharField(max_length=255, null=True, verbose_name='Registro CAR')
#     area_total = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Área Total')
#     modulos_fiscais = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Módulos Fiscais')
#     area_reserva = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Área de Reserva Legal')
#     localizacao_reserva = models.CharField(max_length=255, null=True, verbose_name='Localização da Reserva Legal')
#     area_app = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Área de APP')
#     area_veg_nat = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Área de Vegetação Nativa')
#     area_explorada = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Área Explorada')
#     roteiro_acesso = models.TextField(null=True, verbose_name='Roteiro de Acesso')
#     url_record = models.CharField(max_length=255, null=True)
#     created_at = models.DateTimeField(null=True)
#     updated_at = models.DateTimeField(null=True)
#     class Meta:
#         verbose_name_plural = 'Imóveis Rurais'
#     def __str__(self):
#         return self.nome_imovel

# class Regimes_Exploracao(models.Model):
#     id = models.BigIntegerField(primary_key=True)
#     imovel = models.ForeignKey(Imoveis_Rurais, on_delete=models.SET_NULL, null=True, verbose_name='Imóvel Rural')
#     quem_explora = models.ForeignKey(Cadastro_Pessoal, on_delete=models.SET_NULL, null=True, verbose_name='Quem Explora')
#     instituicao = models.ForeignKey(Instituicoes_Razao_Social, on_delete=models.SET_NULL, null=True, verbose_name='Instituição')
#     regime = models.CharField(max_length=255, null=True, verbose_name='Regime de Exploração')
#     data_inicio = models.DateField(null=True, verbose_name='Data de Início')
#     data_termino = models.DateField(null=True, verbose_name='Data de Término')
#     area_explorada = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Área Total Explorada')
#     atividades_exploradas = models.CharField(max_length=255, null=True, verbose_name='Atividades Exploradas')
#     detalhamento = models.TextField(null=True, verbose_name='Detalhamento Regime Exploração')
#     record_url = models.CharField(max_length=255, null=True)
#     created_at = models.DateTimeField(null=True)
#     updated_at = models.DateTimeField(null=True)
#     class Meta:
#         verbose_name_plural = 'Regimes Exploração'
#     def __str__(self):
#         return self.imovel.nome_imovel
    
# class Prospect_Monitoramento_Prazos(models.Model):
#     prospect = models.ForeignKey(Card_Prospects, on_delete=models.CASCADE, null=True, verbose_name='Prospect')
#     data_vencimento = models.DateField(null=True, blank=False, verbose_name='Data Vencimento')
#     description = models.TextField(null=True, blank=False, verbose_name='Descrição')
#     created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     class Meta:
#         verbose_name_plural = 'Monitoramento Prazos Prospect'
#     def __str__(self):
#         return self.prospect.prospect

# class Contratos_Pagamentos(models.Model):
#     CHOICES_ETAPAS = (
#         ("A", "Assinatura Contrato"),
#         ("P", "Protocolo"),
#         ("E", "Encerramento")
#     )
#     contrato = models.ForeignKey(Contratos_Servicos, on_delete=models.CASCADE, null=True)
#     etapa = models.CharField(max_length=1, choices=CHOICES_ETAPAS, null=True, verbose_name="Etapa Pagamento")
#     percentual = models.DecimalField(max_digits=8, decimal_places=2, null=True, verbose_name="percentual")
#     valor = models.DecimalField(max_digits=15, decimal_places=2, null=True, verbose_name='Valor')
#     observacoes = models.TextField(null=True, blank=True, verbose_name="Observações")
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     class Meta:
#         verbose_name_plural = 'Contratos - Forma Pagamento'
#     def __str__(self):
#         return self.contrato.contratante.razao_social


# class Cadastro_Ambiental_Rural(models.Model):
#     uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
#     imovel = models.ForeignKey(Imoveis_Rurais, on_delete=models.CASCADE, null=True, verbose_name='Imóvel Rural')
#     numero_car = models.CharField(max_length=150, null=True, blank=True, verbose_name='Número do CAR')
#     area_preservacao_permanente = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Área APP')
#     area_uso_restrito = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Área Uso Restrito')
#     condicao_cadastro = models.CharField(max_length=250, null=True, blank=True, verbose_name='Condição Cadastro')
#     area_imovel = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Área Imóvel')
#     modulos_fiscais = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Módulos Fiscais')
#     endereco_municipio = models.CharField(max_length=250, null=True, blank=True, verbose_name='Endereço Município')
#     endereco_latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Latitude')
#     endereco_longitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Longitude')
#     data_registro = models.DateField(null=True, blank=True, verbose_name='Data Registro')
#     data_analise = models.DateField(null=True, blank=True, verbose_name='Data Análise')
#     data_retificacao = models.DateField(null=True, blank=True, verbose_name='Data Retificação')
#     reserva_situacao = models.CharField(max_length=150, null=True, blank=True, verbose_name='Reserva Situação')
#     reserva_area_averbada = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='RL Área Averbada')
#     reserva_area_nao_averbada = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='RL Área Não Averbada')
#     reserva_legal_proposta = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='RL Proposta')
#     reserva_legal_declarada = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='RL Declarada')
#     situacao = models.CharField(max_length=250, null=True, blank=True, verbose_name='Situação CAR')
#     solo_area_nativa = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Solo - Área Nativa')
#     solo_area_uso = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Solo - Área Uso')
#     solo_area_servidao = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Solo - Área Servidão')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     class Meta:
#         verbose_name_plural = 'Cadastro Ambiental Rural'
#     def __str__(self):
#         return f"{self.imovel.nome_imovel}"
    

# class Cadastro_Ambiental_Rural_Restricoes(models.Model):
#     uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
#     car = models.ForeignKey(Cadastro_Ambiental_Rural, on_delete=models.CASCADE, null=True, verbose_name='Imóvel Rural')
#     origem = models.CharField(max_length=255, null=True, blank=True, verbose_name='Origem da Restrição')
#     descricao = models.TextField(null=True, blank=True, verbose_name='Descrição da Restrição')
#     data_processamento = models.DateField(null=True, blank=True, verbose_name='Data Processamento')
#     area_conflito = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Área de Conflito')
#     percentual = models.DecimalField(max_digits=8, decimal_places=4, null=True, blank=True, verbose_name='Percentual Área Conflito')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     class Meta:
#         verbose_name_plural = 'Restrições no CAR'
#     def __str__(self):
#         return f"{self.car.imovel.nome_imovel}"


# class Cadastro_Ambiental_Rural_Coordenadas(models.Model):
#     uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
#     car = models.ForeignKey(Cadastro_Ambiental_Rural, on_delete=models.CASCADE, null=True, verbose_name='Imóvel Rural')
#     longitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Longitude')
#     latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Latitude')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     class Meta:
#         verbose_name_plural = 'Coordenadas do CAR'
#     def __str__(self):
#         return f"{self.car.imovel.nome_imovel}"


# class Certificacao_Sigef_Parcelas(models.Model):
#     uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
#     imovel = models.ForeignKey(Imoveis_Rurais, on_delete=models.CASCADE, null=True, verbose_name='Imóvel Rural')
#     nome = models.CharField(max_length=255, null=True, blank=True, verbose_name='Nome Imóvel')
#     area_ha = models.DecimalField(max_digits=15, decimal_places=4, null=True, verbose_name='Área Ha')
#     detentor = models.CharField(max_length=255, null=True, blank=True, verbose_name='Detentor')
#     cpf_cnpj_detentor = models.CharField(max_length=50, null=True, blank=True, verbose_name='CPF/CNPJ')
#     cns = models.CharField(max_length=50, null=True, blank=True, verbose_name='CNS')
#     codigo_parcela = models.UUIDField(null=True, blank=True, verbose_name='Código Parcela')
#     matricula = models.CharField(max_length=50, null=True, blank=True, verbose_name='CNS')
#     data_entrada = models.DateField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     class Meta:
#         verbose_name_plural = 'Parcelas Certificações SIGEF'
#     def __str__(self):
#         return f"{self.imovel.nome_imovel} - {self.imovel.matricula_imovel}" if self.imovel.matricula_imovel else self.imovel.nome_imovel


# class Certificacao_Sigef_Parcelas_Limites(models.Model):
#     uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
#     parcela = models.ForeignKey(Certificacao_Sigef_Parcelas, on_delete=models.CASCADE, null=True, verbose_name='Parcela')
#     do_vertice = models.CharField(max_length=100, null=True, blank=True, verbose_name='Do Vértice')
#     ao_vertice = models.CharField(max_length=100, null=True, blank=True, verbose_name='Ao Vértice')
#     tipo = models.CharField(max_length=100, null=True, blank=True, verbose_name='Tipo')
#     lado = models.CharField(max_length=100, null=True, blank=True, verbose_name='Lado')
#     azimute = models.CharField(max_length=100, null=True, blank=True, verbose_name='Azimute')
#     comprimento = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name='Comprimento')
#     confrontante = models.TextField(null=True, blank=True, verbose_name='Confrontante')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     class Meta:
#         verbose_name_plural = 'SIGEF - Limites de Parcelas'
#     def __str__(self):
#         return f"{self.parcela.codigo_parcela}"


# class Certificacao_Sigef_Parcelas_Vertices(models.Model):
#     uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
#     parcela = models.ForeignKey(Certificacao_Sigef_Parcelas, on_delete=models.CASCADE, null=True, verbose_name='Parcela')
#     codigo = models.CharField(max_length=100, null=True, blank=True, verbose_name='Código do Vértice')
#     longitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Longitude')
#     sigma_long = models.DecimalField(max_digits=4, decimal_places=4, null=True, blank=True, verbose_name='Sigma Long')
#     latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, verbose_name='Latitude')
#     sigma_lat = models.DecimalField(max_digits=4, decimal_places=4, null=True, blank=True, verbose_name='Sigma Lat')
#     altitude = models.DecimalField(max_digits=8, decimal_places=4, null=True, blank=True, verbose_name='Altitude')
#     sigma_altitude = models.DecimalField(max_digits=4, decimal_places=4, null=True, blank=True, verbose_name='Sigma Altitude')
#     metodo_posicionamento = models.CharField(max_length=100, null=True, blank=True, verbose_name='Método Posicionamento')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     class Meta:
#         verbose_name_plural = 'SIGEF - Vértices de Parcelas'
#     def __str__(self):
#         return f"{self.parcela.codigo_parcela}"