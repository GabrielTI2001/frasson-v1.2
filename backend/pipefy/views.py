# from django.shortcuts import render, HttpResponse
# from rest_framework import permissions, viewsets, status
# from rest_framework.response import Response
# from django.db.models import Q, Subquery, OuterRef, IntegerField, Case, When, Count, Value, F
# from django.db.models.functions import Coalesce
# from rest_framework.permissions import IsAuthenticated
# import requests, json
# from backend.settings import TOKEN_PIPEFY_API, URL_PIFEFY_API
# from .serializers import *
# from pipeline.models import Card_Cobrancas
# from .models import Card_Produtos, Cadastro_Pessoal, Detalhamento_Servicos, Instituicoes_Parceiras, Contratos_Servicos
# from .models import Operacoes_Contratadas, Instituicoes_Razao_Social, Card_Prospects, Prospect_Monitoramento_Prazos, Contratos_Pagamentos
# from reportlab.platypus import Paragraph, Table, PageTemplate, Frame, BaseDocTemplate, Image, Spacer, TableStyle
# from reportlab.lib.styles import ParagraphStyle
# from io import BytesIO
# from num2words import num2words
# from reportlab.lib.pagesizes import letter
# from reportlab.lib.enums import TA_JUSTIFY, TA_RIGHT, TA_LEFT
# from reportlab.lib.colors import Color
# from django.core.exceptions import ObjectDoesNotExist

# class PessoasView(viewsets.ModelViewSet):
#     queryset = Cadastro_Pessoal.objects.all()
#     serializer_class = detailCadastro_Pessoal
#     permission_classes = [IsAuthenticated]
#     lookup_field = 'uuid'
#     def get_queryset(self):
#         queryset = super().get_queryset()
#         search_term = self.request.query_params.get('search', None)
#         all_term = self.request.query_params.get('all', None)
#         if search_term:
#             queryset = queryset.filter(
#                 Q(razao_social__icontains=search_term) |
#                 Q(cpf_cnpj__icontains=search_term) |
#                 Q(grupo__nome_grupo__icontains=search_term)
#             )
#         elif all_term:
#             queryset = queryset.order_by('-created_at')
#         else:
#             if self.action == 'list':
#                 queryset = queryset.order_by('-created_at')[:10]
#         return queryset
#     def get_serializer_class(self):
#         if self.action == 'list':
#             return listCadastro_Pessoal
#         else:
#             return self.serializer_class

# class Card_ProdutosView(viewsets.ModelViewSet):
#     queryset = Card_Produtos.objects.all()
#     serializer_class = detailCard_Produtos
#     # permission_classes = [IsAuthenticated]
#     def get_queryset(self):
#         queryset = super().get_queryset()
#         benefic_search = self.request.query_params.get('beneficiario', None)
#         search = self.request.query_params.get('search', None)
#         phase = self.request.query_params.get('phase', None)
#         if search:
#             queryset = queryset.filter(
#                 Q(pk__icontains=search) | Q(beneficiario__razao_social__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search) 
#                 | Q(phase_name__icontains=search)
#             )
#         if phase:
#             queryset = queryset.filter(
#                 Q(phase_name__icontains=phase)
#             )
#         if benefic_search:
#             queryset = queryset.filter(
#                 Q(beneficiario__in=[int(benefic_search)])
#             )
#         else:
#             if self.action == 'list':
#                 queryset = queryset.order_by('-created_at')[:20]
#         return queryset
#     def get_serializer_class(self):
#         if self.action == 'list':
#             return listCard_Produtos
#         else:
#             return self.serializer_class

# class Card_ProspectsView(viewsets.ModelViewSet):
#     queryset = Card_Prospects.objects.all()
#     serializer_class = detailCard_Prospects
#     permission_classes = [permissions.AllowAny]
#     def get_queryset(self):
#         queryset = super().get_queryset()
#         search = self.request.query_params.get('search', None)
#         if search:
#             queryset = queryset.filter(
#                 Q(pk__icontains=search) | Q(prospect__cliente__icontains=search) | Q(phase__descricao__icontains=search) | 
#                 Q(responsavel__user__first_name__icontains=search)
#             )
#         else:
#             queryset = queryset.order_by('-created_at')
#         return queryset
#     def get_serializer_class(self):
#         if self.action == 'list':
#             return serializerCard_Prospects
#         else:
#             return self.serializer_class

# class BeneficiariosView(viewsets.ModelViewSet):
#     queryset = Cadastro_Pessoal.objects.all()
#     serializer_class = serializerCadastro_Pessoal
#     permission_classes = [permissions.AllowAny]

# class Detalhamento_ServicosView(viewsets.ModelViewSet):
#     queryset = Detalhamento_Servicos.objects.all()
#     serializer_class = serializerDetalhamento_Servicos
#     permission_classes = [permissions.AllowAny]

# class Instituicoes_ParceirasView(viewsets.ModelViewSet):
#     queryset = Instituicoes_Parceiras.objects.all()
#     serializer_class = serializerInstituicoes_Parceiras
#     permission_classes = [permissions.AllowAny]

# class Instituicoes_RazaosocialView(viewsets.ModelViewSet):
#     queryset = Instituicoes_Razao_Social.objects.all()
#     serializer_class = listInstituicoes_RazaoSocial
#     permission_classes = [permissions.AllowAny]
#     def get_queryset(self):
#         queryset = super().get_queryset()
#         search_term = self.request.query_params.get('search', None)
#         all_term = self.request.query_params.get('all', None)
#         if search_term:
#             queryset = queryset.filter(
#                 Q(razao_social__icontains=search_term)
#             )
#         elif all_term:
#             queryset = queryset.order_by('-created_at')
#         else:
#             queryset = queryset.order_by('-created_at')[:10]
#         return queryset

# class MonitoramentoPrazosView(viewsets.ModelViewSet):
#     queryset = Prospect_Monitoramento_Prazos.objects.all()
#     serializer_class = serMonitoramentoPrazos
#     permission_classes = [permissions.AllowAny]
#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         prospect_id = request.data.get('prospect')
#         if serializer.is_valid():
#             fields_venc = {'START':'prazo_para_encaminhamento', 'CONTATO INICIAL':'prazo_para_o_contato_inicial', 'BACK OFFICE':'prazo_para_o_back_office', 
#                 'ANÁLISE E PROCESSAMENTO':'prazo_para_a_an_lise_e_processamento', 'ANÁLISE TÉCNICA':'prazo_para_a_litec_1', 'PROPOSTA DE VALOR':'prazo_para_a_proposta_de_valor', 
#                 'MINUTA CONTRATO':'prazo_para_a_proposta_de_valor_1', 'ENCERRAMENTO':'prazo_para_encerramento', 'CONCLUÍDO':'prazo_para_encerramento', 'PERDIDO':'prazo_para_encerramento',
#                 'GANHO':'prazo_para_encerramento', 'CANCELADO':'prazo_para_encerramento'}
#             payload = {"query":"{card (id:" + str(prospect_id) + ") {current_phase{name}}}"}
#             response = requests.post(URL_PIFEFY_API, json=payload, headers={"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"})
#             obj = json.loads(response.text)
#             current_phase = obj["data"]["card"]["current_phase"]["name"]
#             field_id = fields_venc[current_phase]
#             newvalue = request.data.get('data_vencimento') + 'T18:00:00Z'
#             payload = {"query":"mutation { updateCard(input: {id:"+str(prospect_id)+", due_date: \""+newvalue+"\"}) {card {title}}}"}
#             response = requests.post(URL_PIFEFY_API, json=payload, headers={"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"})
#             payload = {"query":"mutation { updateCardField(input: {card_id:"+str(prospect_id)+", field_id: \""+field_id+"\", new_value: \""+newvalue+"\"}) {card {title}}}"}
#             response = requests.post(URL_PIFEFY_API, json=payload, headers={"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"})
#             serializer.save()
#             headers = self.get_success_headers(serializer.data)
#             return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# def create_pdf_contrato(request, id):
#     #CRIA ARQUIVO PDF DO ALONGAMENTO
#     left_margin = 60
#     right_margin = 45
#     top_margin = 40
#     bottom_margin = 30
#     font_size_title = 11
#     font_size_body = 10
#     custom_color = Color(13/255, 22/255, 55/255)
#     #color_danger = Color(255/255, 0/255, 0/255)

#     fases_pagamento = {
#         "A": "na assinatura do contrato", 
#         "P": "no protocolo do processo",
#         "E": "no encerramento do processo"
#     }

#     texto_contrato_produto = {
#         "GAI": {"produto_text": f"""Gestão Ambiental e Irrigação:  Análise estratégica, elaboração de projetos técnicos e gerenciamento de processos,
#                     no âmbito da administração pública para obtenção de instrumentos administrativos obrigatórios para empreendimentos agroindustriais.""",
#             "projeto_text": f"""Elaboração de Projeto Técnico para solicitar os seguintes atos administrativos junto ao órgão ambiental competente:"""},
        
#         "GC": {"produto_text": f"""Gestão de Crédito Rural: Análise estratégica, elaboração de projetos técnicos e gerenciamento de processos junto às 
#                instituições financeiras para obtenção de linhas de crédito e financiamento rural essenciais para empreendimentos agropecuários.""",
#             "projeto_text": f"""Elaboração de Projetos Técnicos para solicitar as seguintes linhas de crédito e financiamento junto às instituições financeiras competentes:"""},

#         "TEC": {"produto_text": f"""Tecnologia e Inovação: Desenvolvimento de soluções tecnológicas e análise de dados para o setor agropecuário, focado na criação de 
#             ferramentas inovadoras que otimizem a produtividade e a eficiência dos empreendimentos.""",
#             "projeto_text": """Desenvolvimento e implementação das seguintes soluções tecnológicas inovadoras no setor agropecuário:"""},

#         "AVA": {"produto_text": f"""Análise de Imóveis Rurais e Urbanos: Avaliação estratégica e detalhada de propriedades rurais e urbanas, incluindo aspectos legais, 
#             ambientais e de viabilidade econômica, para auxiliar na tomada de decisões informadas sobre investimentos e uso do solo.""",
#             "projeto_text": """Elaboração de Projeto Técnico para a avaliação detalhada e estratégica dos seguintes serviços:"""}
#     }
    
#     try:
#         contrato = Contratos_Servicos.objects.get(pk=id)
#         numero_contrato = contrato.id
#         natureza = contrato.contratante.natureza
#         cpf_ou_cnpj_str = 'CPF' if natureza == 'PF' else 'CNPJ'
#         cpf_cnpj = contrato.contratante.cpf_cnpj
#         contratante = contrato.contratante.razao_social
#         natureza_juridica = 'pessoa jurídica' if natureza == 'PJ' else 'pessoa física'
#         artigo_contratante = 'A' if contrato.contratante.natureza == 'PJ' else ('A' if contratante.split()[-1].endswith('a') else 'O')
#         servicos_contrato = contrato.servicos_contratados.all()
#         formas_pagamento = Contratos_Pagamentos.objects.filter(contrato=id)
#         produto_contrato = [s['produto__acronym'] for s in contrato.servicos_contratados.all().values('produto__acronym').distinct()][0]

#         if natureza == "PJ":
#             demais_beneficiarios = contrato.demais_membros.all()
#             for membro in demais_beneficiarios:
#                 if membro.natureza == 'PF':
#                     representante_pj = membro.razao_social
#                     cpf_representante = membro.cpf_cnpj
#                     rg_representante = membro.numero_rg
#                     endereco_representante = membro.endereco
#                     municipio_representante = membro.municipio
#                     uf_representante = membro.uf
#                     cep_representante = membro.cep
#                     partes_endereco_representante = [
#                         endereco_representante,
#                         f"{municipio_representante} - {uf_representante}" if municipio_representante and uf_representante else municipio_representante or uf_representante,
#                         f"CEP {cep_representante}" if cep_representante else ''
#                     ]
#                     endereco_completo_representante = ', '.join(filter(None, partes_endereco_representante))
#                     artigo_representante = 'A' if membro.natureza == 'PJ' else ('A' if membro.razao_social.split()[-1].endswith('a') else 'O')
#                     break

#         endereco = contrato.contratante.endereco or None
#         municipio = contrato.contratante.municipio or None
#         uf = contrato.contratante.uf or None
#         cep = contrato.contratante.cep or None

#         partes_endereco = [
#             endereco,
#             f"{municipio} - {uf}" if municipio and uf else municipio or uf,
#             f"CEP {cep}" if cep else ''
#         ]

#         endereco_completo = ', '.join(filter(None, partes_endereco))

#         valor_contrato_ = contrato.valor_gai or 0
#         valor_contrato = locale.format_string('%.2f', valor_contrato_, True) 
#         valor_contrato_str = num2words(valor_contrato_, lang='pt_BR', to='currency')
#         percentual_contrato_gc = contrato.percentual_gc or None
#         data_contrato = contrato.data_assinatura
#         dia_mes = data_contrato.day
#         mes_str = data_contrato.strftime("%B")
#         ano = data_contrato.year

#         buffer = BytesIO()
#         doc = BaseDocTemplate(buffer, pagesize=letter, title=f"Contrato Serviço: {contratante}")

#         # Crie um PageTemplate com as margens especificadas
#         page_template = PageTemplate(id='custom_page', frames=[
#             Frame(
#                 x1=left_margin, y1=bottom_margin,
#                 width=letter[0] - left_margin - right_margin,
#                 height=letter[1] - bottom_margin - top_margin,
#                 leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
#                 id='custom_frame'
#             )
#         ])

#         doc.addPageTemplates([page_template])
#         elements = []

#         # Adicione a imagem ao início do documento
#         image_path = "static/media/various/logo-frasson-app2.png"
#         logo = Image(image_path, width=150, height=40) 
#         elements.append(logo)
#         elements.append(Spacer(width=1, height=15))

#         # Define um estilo personalizado para o título com tamanho de fonte
#         elements.append(Paragraph("<b>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</b>", ParagraphStyle(name='TitleStyle', fontSize=font_size_title, alignment=1, spaceAfter=3, textColor=custom_color)))
#         elements.append(Paragraph(f"<b>N° {numero_contrato}</b>", ParagraphStyle(name='TitleStyle', fontSize=font_size_title, leftIndent=0, alignment=1, spaceAfter=15, textColor=custom_color)))

#         contratante_str = f"""<b>CONTRATANTE:</b> <b>{contratante}</b>, inscrit{artigo_contratante.lower()} no {cpf_ou_cnpj_str} {cpf_cnpj}, com sede no endereço {endereco_completo}"""

#         if natureza == "PJ":
#             contratante_str = f"""{contratante_str}, neste ato representada por seu sócio/proprietário, {representante_pj}, inscrit{artigo_representante.lower()} no CPF {cpf_representante}, RG {rg_representante}, 
#             residente no endereço {endereco_completo_representante}."""
#         else:
#             contratante_str = f"""{contratante_str}."""
        
#         elements.append(Paragraph(contratante_str, 
#         ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=10, textColor=custom_color)))
        
#         elements.append(Paragraph(f"""<b>CONTRATADA: FRASSON PLANEJAMENTO E ASSISTÊNCIA AGROPECUÁRIA LTDA</b>, inscrita no CNPJ 01.396.641/0001-70, com sede na Rua Alvorada, nº 237, 
#             Quadra 28, Lote 10B, Salas 202 e 204, Setor Central, Posse - GO, CEP 73900-562, neste ato representado pelo seu sócio/proprietário, o sr. <b>Daniel Zuchetti Frasson</b>, brasileiro, solteiro, Engenheiro Agrônomo, 
#             inscrito no CPF 030.665.050-90, CREA 1016346662D-GO, residente e domiciliado na Rua José Ribeiro e Silva n° 206, Setor Augusto José Valente II, Posse-GO, CEP 73902-015."""
#         , ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=TA_JUSTIFY, leading=15, spaceAfter=15, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>DA DESCRIÇÃO</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>Cláusula 1ª.</b> A <b>CONTRATADA</b> é a pessoa jurídica que viabiliza, por meio de formulários, instrumentos administrativos e outros instrumentos legais, junto às instituições competentes estaduais, 
#             levantamento das informações necessárias e execução dos procedimentos administrativos necessários para requisição atos administrativos."""
#         , ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))
        
#         elements.append(Paragraph(f"""<b>Cláusula 2ª.</b> {artigo_contratante} <b>CONTRATANTE</b> é a {natureza_juridica} possuidora de propriedades rurais, que necessitam dos atos administrativos ambientais para desenvolvimento de empreendimentos agropecuários."""
#         , ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=20, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>DO OBJETO</b>""", ParagraphStyle(name='DetailStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>Cláusula 3ª.</b> {texto_contrato_produto[produto_contrato]["produto_text"]}"""
#         , ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))
        
#         elements.append(Paragraph(f"""<b>Parágrafo Primeiro:</b> {texto_contrato_produto[produto_contrato]["projeto_text"]}"""
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=5, textColor=custom_color)))

#         for i, servico in enumerate(servicos_contrato):
#             elements.append(Paragraph(f"""<b>{chr(ord('a') + i)})</b> {servico.detalhamento_servico};"""
#             ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=20, alignment=TA_JUSTIFY, leading=15, spaceAfter=0, textColor=custom_color)))

#         elements.append(Spacer(width=1, height=15))

#         #ADD A NEW PAGE
#         #elements.append(PageBreak()) #adiciona uma nova página
#         elements.append(Paragraph(f"""<b>DAS OBRIGAÇÕES DAS PARTES</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))
#         elements.append(Paragraph(f"""<b>D{artigo_contratante} CONTRATANTE</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))
        
#         elements.append(Paragraph(f"""<b>Cláusula 4ª.</b> {artigo_contratante} <b>CONTRATANTE</b> se responsabiliza pela veracidade de todos os documentos, dados e informações prestadas para o preenchimento dos respectivos requerimentos, sob pena de responderem na forma da lei por falsidade ideológica ou documental, 
#             não podendo recair sobre a <b>CONTRATADA</b> nenhuma obrigação pela inconsistência de tais informações e dados."""
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>Cláusula 5ª.</b> {artigo_contratante} <b>CONTRATANTE</b> se compromete a fornecer todo e qualquer documento para a confecção dos requerimentos e formulários necessários ao procedimento de requisição dos serviços previstos neste contrato."""
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>Cláusula 6ª.</b> {artigo_contratante} <b>CONTRATANTE</b> se obriga a permitir visita ao empreendimento, com o fito de verificar as condições de viabilidade dos procedimentos administrativos que serão requisitados, bem como da realização de qualquer serviço técnico de campo necessário. """
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>Cláusula 7ª.</b> {artigo_contratante} <b>CONTRATANTE</b> autoriza a <b>CONTRATADA</b> a obter informações junto às instituições competentes, que sejam necessárias para complementar a documentação requerida no processo."""
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>Cláusula 8ª.</b> Todas as despesas relacionadas às taxas administrativas para protocolo e andamento dos processos ambientais relacionados a essa proposta são de responsabilidade d{artigo_contratante.lower()} <b>CONTRATANTE</b>."""
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>DA CONTRATADA</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>Cláusula 9ª.</b> A <b>CONTRATADA</b> se compromete a efetuar amplo levantamento de dados necessários para o preenchimento dos formulários para elaboração dos projetos e demais instrumentos legais necessários."""
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>Parágrafo Primeiro:</b> A <b>CONTRATADA</b> se compromete a acompanhar todo o processo administrativo, em todas as instâncias necessárias até a emissão da portaria autorizativa final, comprometendo-se a 
#             responder e orientar todas as eventuais notificações e questionamentos técnicos emitidas pelos órgãos ambientais durante o trâmite dos objetos do presente contrato."""
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>Parágrafo Segundo:</b> Todos os equipamentos necessários para elaboração dos projetos e todos os custos relativos aos deslocamentos são de responsabilidade da <b>CONTRATADA</b>."""
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>Parágrafo Terceiro:</b> Toda a equipe envolvida nos serviços é de responsabilidade da <b>CONTRATADA</b>, não gerando qualquer vínculo empregatício com {artigo_contratante.lower()} <b>CONTRATANTE</b>."""
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>Parágrafo Quarto:</b> A <b>CONTRATADA</b> se compromete a manter absoluto sigilo sobre todos os dados, informações científicas, técnicas e materiais obtidos durante sua participação, seja de forma escrita, verbal ou qualquer outra. 
#             É proibido revelar, reproduzir, utilizar ou compartilhar essas informações com terceiros sem a análise prévia d{artigo_contratante.lower()} <b>CONTRATANTE</b> para avaliação da possibilidade de proteção nos órgãos especializados. 
#             A <b>CONTRATADA</b> não deve, sem autorização d{artigo_contratante.lower()} <b>CONTRATANTE</b>, tomar qualquer medida para obter direitos de propriedade intelectual para si ou terceiros relacionados às informações confidenciais acessadas. 
#             Todos os documentos e materiais, incluindo modelos e protótipos resultantes das pesquisas, são de propriedade exclusiva d{artigo_contratante.lower()} <b>CONTRATANTE</b>."""
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

#         #elements.append(PageBreak()) #adiciona uma nova página
#         elements.append(Paragraph(f"""<b>DO VALOR</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))

#         if produto_contrato == "GC": #se o produto for GC deve ser feita de uma forma diferente
#             elements.append(Paragraph(f"""<b>Cláusula 10ª.</b> {artigo_contratante} <b>CONTRATANTE</b> pagará à <b>CONTRATADA</b> o percentual de <b>{percentual_contrato_gc}%</b> sobre as operações de crédito liberadas, 
#                 a serem pagos de forma integral na ocasião da <b>liberação do recurso</b>, mediante emissão de Nota Fiscal."""
#             ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=5, textColor=custom_color)))

#         else:
#             elements.append(Paragraph(f"""<b>Cláusula 10ª.</b> {artigo_contratante} <b>CONTRATANTE</b> pagará à <b>CONTRATADA</b> o valor total de <b>R$ {valor_contrato}</b> ({valor_contrato_str}) a serem pagos da seguinte forma, mediante emissão de Nota Fiscal:"""
#             ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=5, textColor=custom_color)))

#             for i, pagamento in enumerate(formas_pagamento):
#                 elements.append(Paragraph(f"""<b>{chr(ord('a') + i)})</b> {locale.format_string('%.0f', pagamento.percentual, True)}% (R$ {locale.format_string('%.2f', pagamento.valor, True)}) {fases_pagamento[pagamento.etapa]};"""
#                 ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=20, alignment=TA_JUSTIFY, leading=15, spaceAfter=0, textColor=custom_color)))
            
        
#         elements.append(Spacer(width=1, height=10))

#         elements.append(Paragraph(f"""<b>Parágrafo Primeiro:</b> O pagamento será realizado por meio de depósito bancário identificado, na conta bancária:"""
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=5, textColor=custom_color)))
        
#         elements.append(Paragraph(f"""
#             Banco: <b>Banco do Brasil</b> <br/>
#             Agência: <b>0606-8</b> <br/>
#             Conta Corrente: <b>11.180-5</b> <br/>
#             Titularidade: <b>Frasson Planejamento e Assistência Agropecuária LTDA</b> <br/>
#             CNPJ: <b>01.396.641/0001-70</b> <br/>
#             """
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=15, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>DAS PENALIDADES</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>Cláusula 11ª.</b> Sem prejuízo de outras medidas, a <b>CONTRATADA</b> poderá, a seu critério e a qualquer tempo, advertir, suspender ou cancelar, temporária ou definitivamente, o contrato com {artigo_contratante} <b>CONTRATANTE</b> que:"""
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=5, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>a)</b> Deixe de cumprir qualquer dispositivo deste instrumento;<br/>
#             <b>b)</b>	Deixe de respeitar qualquer item de qualquer política da <b>CONTRATADA</b> e/ou da instituição financeira;<br/>
#             <b>c)</b>	Pratique atos fraudulentos ou ofensivos a quem quer que seja;<br/>
#             <b>d)</b>	Preste informações inverídicas;<br/>
#             <b>e)</b>	Deixe de efetuar qualquer pagamento no valor acertado;<br/>"""
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=15, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>DA VALIDADE</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>Cláusula 12ª.</b> O presente contrato será válido durante todo o período de tramitação dos processos administrativos relacionados, a partir da data de sua assinatura até 
#             a decisão final oficializada pelo órgão ambiental competente."""
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))


#         elements.append(Paragraph(f"""<b>DO FORO</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))

#         elements.append(Paragraph(f"""<b>Cláusula 13ª.</b> Fica eleito o Foro da Circunscrição Judiciária de Posse, Estado de Goiás, para dirimir as dúvidas oriundas deste contrato, renunciando as partes, a qualquer outro, por mais privilegiado que seja. E por estarem justos e contratados, 
#             firmam o presente instrumento, em duas vias, de igual teor e forma, para um só efeito, na presença das duas testemunhas abaixo assinadas."""
#         ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=10, textColor=custom_color)))

#         elements.append(Paragraph(f"""Posse - GO, {dia_mes} de {mes_str} de {ano}.""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=TA_RIGHT, spaceAfter=35, textColor=custom_color)))

#         elements.append(Paragraph(f"""________________________________________________________________""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=1, textColor=custom_color)))
#         elements.append(Paragraph(f"""<b>FRASSON PLANEJAMENTO E ASSISTÊNCIA AGROPECUÁRIA LTDA</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=1, textColor=custom_color)))
#         elements.append(Paragraph(f"""<b>01.396.641/0001-70</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=30, textColor=custom_color)))

#         elements.append(Paragraph(f"""_________________________________________________________""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=1, textColor=custom_color)))
#         elements.append(Paragraph(f"""<b>{contratante}</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=1, textColor=custom_color)))
#         elements.append(Paragraph(f"""<b>{cpf_cnpj}</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=30, textColor=custom_color)))

#         #Create a table to place two elements side by side
#         table_data = [
#             [Paragraph(f"________________________________________<br/>Testemunha 01<br/>CPF: ", ParagraphStyle(name='DetailStyle', fontSize=font_size_body, alignment=1, spaceAfter=1, textColor=custom_color)),
#             Paragraph(f"________________________________________<br/>Testemunha 02<br/>CPF: ", ParagraphStyle(name='DetailStyle', fontSize=font_size_body, alignment=1, spaceAfter=1, textColor=custom_color))]
#         ]

#         table = Table(table_data, colWidths=[300, 300])
#         elements.append(table)

#         # Cria o documento PDF
#         doc.build(elements)

#         # Obtém o conteúdo do PDF e fecha o buffer
#         pdf = buffer.getvalue()
#         buffer.close()

#         # Retorna o PDF como uma resposta HTTP
#         file_name = f"GAI_{numero_contrato}_{contratante}"
#         response = HttpResponse(content_type='application/pdf')
#         response['Content-Disposition'] = f'inline; filename="{file_name}.pdf"'
#         response.write(pdf)
#         return response

#     except ObjectDoesNotExist:
#         return HttpResponse(404)