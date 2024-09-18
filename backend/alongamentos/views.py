from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from django.db.models import Q, F, ExpressionWrapper, DateField, IntegerField
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets
from .serializers import *
from .models import Cadastro_Alongamentos, Produto_Agricola, Tipo_Classificacao, Tipo_Armazenagem
from credit.models import Operacoes_Contratadas, Itens_Financiados
from cadastro.models import Instituicoes_Parceiras
import locale
from num2words import num2words
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import Paragraph, Table, PageTemplate, Frame, BaseDocTemplate
from reportlab.platypus.flowables import PageBreak
from io import BytesIO
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.colors import Color
from datetime import date, datetime, timedelta
locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8')

def get_query_filtered():
    itens_along = Itens_Financiados.objects.filter(
    tipo='Custeio', item__in=['Soja', 'Soja Irrigada', 'Milho', 'Milho Irrigado', 'Trigo']).values_list('id', flat=True)
    id_banco = Instituicoes_Parceiras.objects.filter(instituicao__razao_social='Banco do Brasil S/A').first().id
    date_today = date.today()
    
    queryset = Operacoes_Contratadas.objects.filter(
        data_prod_armazenado__isnull=False,  # Filtra registros com 'data_prod_armazenado' não nula
        data_primeiro_vencimento__isnull=False,  # Filtra registros com 'data_primeiro_vencimento' não nula
        item_financiado__in=itens_along, # Filtra somente os items financiados de interesse
        instituicao__instituicao=id_banco, # Filta somente operações do Banco do Brasil
    ).exclude(
        Q(cadastro_alongamentos__isnull=False) |  # Exclui se a operação estiver em Operacoes_Credito
        Q(alongamentos_cancelados__isnull=False)  # Exclui se a operação estiver em Alongamentos_Cancelados
    ).annotate(
        data_inicio=ExpressionWrapper(
        F('data_prod_armazenado') - timedelta(days=15), # 15 dias antes da data do prod. armazenado
        output_field=DateField()
    ),
        data_limite=ExpressionWrapper(
        F('data_primeiro_vencimento') - timedelta(days=15), # 15 dias antes do primeiro vencimento
        output_field=DateField()
    ),
        dias_ate_limite=ExpressionWrapper(
        (F('data_limite') - date_today) / timedelta(days=1), # Dividindo para ter o valor em dias
        output_field=IntegerField()
    )
    ).filter(
        #data_inicio__lte=date_today,   # Filtrar operações com 'data_limite' menor ou igual à current date
        data_limite__gte=date_today,    # Filtrar operações com 'data_limite' maior ou igual à current date
        dias_ate_limite__lte=100        # Filtrar os registros que estejam a uma quant. determinada de dias até a data limite
    ).select_related(
        'beneficiario',
        'instituicao',
        'item_financiado').order_by('data_limite')
    return queryset

def index(request):
    total_along = Cadastro_Alongamentos.objects.select_related('operacao', 'testemunha01', 'testemunha02').all().count()
    total_next = get_query_filtered().count()
    context = {
        'total_along': total_along,
        'total_next': total_next,
    }
    return JsonResponse(context)

class AlongamentosView(viewsets.ModelViewSet):
    queryset = Cadastro_Alongamentos.objects.all()
    serializer_class = detailAlongamentos
    lookup_field = 'uuid'
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)   
        if search:
            queryset = queryset.filter(Q(operacao__beneficiario__razao_social__icontains=search) |
                Q(operacao__numero_operacao__icontains=search))
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return ListAlongamentos
        else:
            return self.serializer_class

class AlongamentosNextView(viewsets.ModelViewSet):
    queryset = get_query_filtered()
    serializer_class = listOperacoesNext
    lookup_field = 'uuid'
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)   
        if search:
            queryset = queryset.filter(Q(beneficiario__razao_social__icontains=search) |
                Q(numero_operacao__icontains=search))
        return queryset

def create_pdf_alongamento(request, uuid):
    #CRIA ARQUIVO PDF DO ALONGAMENTO
    left_margin = 40
    right_margin = 40
    top_margin = 30
    bottom_margin = 30
    font_size_title = 12
    font_size_body = 10
    custom_color = Color(12/255, 23/255, 56/255) 
    
    try:
        alongamento = Cadastro_Alongamentos.objects.get(uuid=uuid)
        beneficiario = alongamento.operacao.beneficiario.razao_social
        cpf = alongamento.operacao.beneficiario.cpf_cnpj
        qtd_penhor_kg = locale.format_string('%.0f', alongamento.quant_penhor_kg, True) if alongamento.quant_penhor_kg != None else ''
        cep = alongamento.agencia_bancaria.cep_logradouro
        data_along = alongamento.data.strftime("%d de %B de %Y") 
        mun_agencia = f"{alongamento.agencia_bancaria.municipio.nome_municipio} - {alongamento.agencia_bancaria.municipio.sigla_uf}"
        mun_propriedade = f"{alongamento.propriedades.first().municipio.nome_municipio} - {alongamento.propriedades.first().municipio.sigla_uf}" if alongamento.propriedades.all() != [] else ''
        fiel_depositario_nome = alongamento.fiel_depositario.razao_social
        fiel_depositario_cpf = alongamento.fiel_depositario.cpf_cnpj
        numero_agencia = alongamento.agencia_bancaria.numero_agencia
        numero_operacao = alongamento.operacao.numero_operacao
        vencimento = alongamento.operacao.data_vencimento.strftime('%d/%m/%Y')
        produto_agricola = alongamento.produto_agricola
        qtd_penhor_tons = locale.format_string('%.2f', alongamento.quant_penhor_tons, True) if alongamento.quant_penhor_tons != None else ''
        qtd_sacas_60_kg = locale.format_string('%.0f', alongamento.quant_sacas_60_kg, True) if alongamento.quant_sacas_60_kg != None else ''
        qtd_silos_3000_kg = locale.format_string('%.2f', alongamento.quant_sacas_60_kg / 3000, True) if alongamento.quant_sacas_60_kg != None else ''
        capacidade_estatica_scs = locale.format_string('%.0f', alongamento.capacidade_estatica_sacas_60_kg, True) if alongamento.capacidade_estatica_sacas_60_kg != None else ''
        capacidade_estatica_kg = locale.format_string('%.0f', alongamento.capacidade_estatica_sacas_60_kg * 60, True) if alongamento.capacidade_estatica_sacas_60_kg != None else ''
        safra = alongamento.operacao.safra
        test_01_nome = alongamento.testemunha01.razao_social
        test_01_cpf = alongamento.testemunha01.cpf_cnpj
        test_02_nome = alongamento.testemunha02.razao_social
        test_02_cpf = alongamento.testemunha02.cpf_cnpj
        tipo_armazenagem = alongamento.tipo_armazenagem.description
        capacidade_estatica_str = f"{qtd_silos_3000_kg} Silos Bag com capacidade de 3.000 sacas" if alongamento.tipo_armazenagem_id == 1 else f"{capacidade_estatica_scs} scs / {capacidade_estatica_kg} kg"
        tipo_classificacao = alongamento.tipo_classificacao.description
        valor_operacao = locale.currency(alongamento.operacao.valor_operacao, grouping=True) if alongamento.operacao.valor_operacao != None else ''
        valor_operacao_str = num2words(alongamento.operacao.valor_operacao, lang='pt_BR', to='currency')
        valor_total_along = locale.currency(alongamento.valor_total, grouping=True)
        valor_total_along_str = num2words(alongamento.valor_total, lang='pt_BR', to='currency')        
        lista_propriedades = [propriedade.nome for propriedade in alongamento.propriedades.all()]
        lista_matriculas = [propriedade.matricula for propriedade in alongamento.propriedades.all()]
        fazendas_matriculas = [f"{nome} (Mat. {matricula})" for nome, matricula in zip(lista_propriedades, lista_matriculas)]
        fazendas_matriculas_str = ', '.join(fazendas_matriculas)
        fazendas_str = ', '.join([fazenda for fazenda in lista_propriedades])
        matriculas_str = ', '.join([matricula for matricula in lista_matriculas])

        buffer = BytesIO()
        doc = BaseDocTemplate(buffer, pagesize=letter, title=f"Alongamento: {alongamento.operacao.beneficiario.razao_social}")

        # Crie um PageTemplate com as margens especificadas
        page_template = PageTemplate(id='custom_page', frames=[
            Frame(
                x1=left_margin, y1=bottom_margin,
                width=letter[0] - left_margin - right_margin,
                height=letter[1] - bottom_margin - top_margin,
                leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
                id='custom_frame'
            )
        ])

        doc.addPageTemplates([page_template])
        elements = []

        # Define um estilo personalizado para o título com tamanho de fonte
        elements.append(Paragraph("<b>DECLARAÇÃO DE DEPÓSITO DE PRODUÇÃO FINANCIADA</b>", ParagraphStyle(name='TitleStyle', fontSize=font_size_title, alignment=1, spaceAfter=20, textColor=custom_color)))
        
        elements.append(Paragraph(f"""
            Posse - GO, {data_along}<br/>
            Ao Banco do Brasil S/A <br/>
            Agência: {mun_agencia} ({numero_agencia})<br/>
            {mun_agencia}, CEP: {cep}""", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=0, leading=15, spaceAfter=12, textColor=custom_color)))
        
        elements.append(Paragraph("Prezados Senhores, ", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=0, spaceAfter=8, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Declaro(amos), para os fins a que se destinam, que a produção por mim (nós) financiada por meio da operação abaixo
            mencionada, encontra-se depositada no armazém abaixo identificado, em perfeito estado. Neste ato, assumo(imos)
            responsabilidade solidária, juntamente com o depositário abaixo assinado por sua guarda e conservação""", 
            ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=13, leftIndent=0, alignment=TA_JUSTIFY, spaceAfter=10, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Operação nº: {numero_operacao} <br/>
            Descrição do(s) Produto(s) Financiado(s)/Armazenado(s): """, 
            ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=0, leading=15, spaceAfter=3, textColor=custom_color)))
        
        elements.append(Paragraph(f"""
            • Produto(s)/Tipo: {produto_agricola} / {tipo_classificacao}<br/>
            • Quantidade(s): {qtd_penhor_kg} kg <br/>
            • Volume(s): {qtd_sacas_60_kg} scs <br/>
            • Safra (Período Agrícola): {safra} <br/>""", 
            ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=15, alignment=0, leading=15, spaceAfter=5, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Características e Localização do Armazém:""", 
            ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=0, leading=13, spaceAfter=3, textColor=custom_color)))
        
        elements.append(Paragraph(f"""
            • Tipo de Armazém: {tipo_armazenagem} <br/>
            • Nome do Proprietário: {fiel_depositario_nome} <br/>
            • Endereço: {fazendas_matriculas_str} <br/>
            • Município (UF): {mun_propriedade}""", 
            ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=15, alignment=0, leading=13, spaceAfter=12, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Declaro(amos) ainda que as quantidades informadas estão avaliadas em {valor_total_along} ({valor_total_along_str}), e que toda a quantidade entregue para
            depósito será destinada à liquidação das dívidas garantidas com a referida produção (operações de custeio), de minha
            (nossa) responsabilidade. Fica desde já entendido que todas as despesas advindas da armazenagem correm às minhas
            (nossas) custas, estando ciente(s) de que a produção se encontra apenhada e que só poderá ser comercializada e/ou
            retirada, no todo ou em parte, com autorização escrita do Banco do Brasil S/A podendo a Instituição, a qualquer tempo,
            independentemente de minha (nossa) anuência, exigir a entrega dos bens, sob as penas da Lei (Art. 652 do Código Civil).""", 
            ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=13, leftIndent=0, alignment=TA_JUSTIFY, spaceAfter=10, textColor=custom_color)))

        elements.append(Paragraph("Atenciosamente, ", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=15, leftIndent=0, alignment=0, spaceAfter=10, textColor=custom_color)))

        elements.append(Paragraph(f"""
            ____________________________________________<br/>
            Mutuário(a): {beneficiario}<br/>
            CPF: {cpf}""", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=15, leftIndent=0, alignment=1, spaceAfter=15, textColor=custom_color)))

        elements.append(Paragraph("FIEL(IS) DEPOSITÁRIO(S):, ", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=0, spaceAfter=8, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Assino esta declaração, na qualidade de fiel depositário(a) dos bens depositados no
            armazém de minha propriedade, retro descrito(s) e caracterizado(s), obrigando-me sob as penas da lei, a guardá-los e
            custodiá-los, juntamente com o emitente, bem como entregá-los a outro depositário se em qualquer tempo
            for exigido pelo Banco do Brasil S/A, ou ao próprio BANCO, logo que este o exigir, podendo este também a
            qualquer tempo, independentemente de nova autorização ou prévio consentimento, entrar no armazém de
            localização, enquanto não liquidada a dívida, para vistoriar esses bens.""", ParagraphStyle(name='ParagrafoStyle', fontSize=font_size_body, leading=13, leftIndent=0, alignment=TA_JUSTIFY, spaceAfter=20, textColor=custom_color)))

        elements.append(Paragraph(f"""
            _____________________________________________<br/>
            Fiel Depositário(a): {fiel_depositario_nome}<br/>
            CPF: {fiel_depositario_cpf}""", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=15, leftIndent=0, alignment=1, spaceAfter=8, textColor=custom_color)))


        #ADD A NEW PAGE
        elements.append(PageBreak())
        elements.append(Paragraph("<b>DECLARAÇÃO DE PRODUTO ARMAZENADO À ORDEM DO BANCO</b>", ParagraphStyle(name='TitleStyle', fontSize=font_size_title, alignment=1, spaceAfter=20, textColor=custom_color)))
        
        elements.append(Paragraph(f"""
            Posse - GO, {data_along}<br/>
            Ao Banco do Brasil S/A <br/>
            Agência: {mun_agencia} ({numero_agencia})<br/>
            {mun_agencia}, CEP: {cep}""", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=0, leading=15, spaceAfter=12, textColor=custom_color)))
        
        elements.append(Paragraph("Prezados Senhores, ", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=0, spaceAfter=8, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Declaro que a mercadoria abaixo especificada se encontra depositada à ordem do Banco do Brasil S/A, para a guarda e
            conservação, em perfeito estado, no armazém de minha propriedade, aqui indicado, o qual apresenta as condições
            necessárias para os fins pretendidos""", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=13, leftIndent=0, alignment=TA_JUSTIFY, spaceAfter=10, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Operação nº: {numero_operacao} <br/>
            Descrição do(s) Produto(s) Financiado(s)/Armazenado(s): """, ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=0, leading=15, spaceAfter=3, textColor=custom_color)))
        
        elements.append(Paragraph(f"""
            • Produto(s)/Tipo: {produto_agricola} / {tipo_classificacao} <br/>
            • Quantidade(s): {qtd_penhor_kg} kg <br/>
            • Volume(s): {qtd_sacas_60_kg} scs <br/>
            • Safra (Período Agrícola): {safra} <br/>""", 
            ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=15, alignment=0, leading=15, spaceAfter=5, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Características e Localização do Armazém de Depósito:""", 
            ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=0, leading=13, spaceAfter=3, textColor=custom_color)))
        
        elements.append(Paragraph(f"""
            • Tipo de Armazém: {tipo_armazenagem} <br/>
            • Nome do Proprietário: {fiel_depositario_nome} <br/>
            • Nome do(s) Imóvel(s): {fazendas_str} <br/>
            • Matrícula(s) CRI: {matriculas_str} <br/>
            • Município (UF): {mun_propriedade} <br/>
            • Capacidade Estática (kg): {capacidade_estatica_str}.""", 
            ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=15, alignment=0, leading=14, spaceAfter=12, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Declaro também que a quantidade da mercadoria armazenada está avaliada em {valor_total_along} ({valor_total_along_str}), sendo suficiente para liquidação da(s)
            seguinte(s) dívida(s), lastreada(s) com o(s) produto(s) declarado(s): Operação nº {numero_operacao} no valor de {valor_operacao}
            ({valor_operacao_str}), referente ao custeio de {produto_agricola}, com vencimento em {vencimento}. Fica, desde já, entendido que todas as despesas advindas da armazenagem correm às minhas
            custas e que sou responsável pela guarda e conservação do produto armazenado como fiel depositário, sendo que a
            produção apenhada só poderá ser retirada no todo ou em parte, do citado armazém, com autorização escrita do Banco do
            Brasil S/A, podendo este, a qualquer tempo, independentemente da minha anuência, exigir a entrega dos bens, sob as
            penas da Lei (Artigo 652 do Código Civil), bem como, independentemente de nova autorização ou prévio consentimento,
            entrar no armazém de localização, enquanto não liquidada a dívida, para vistoriar esses bens""", 
            ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=13, leftIndent=0, alignment=TA_JUSTIFY, spaceAfter=15, textColor=custom_color)))

        elements.append(Paragraph("Atenciosamente, ", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=15, leftIndent=0, alignment=0, spaceAfter=15, textColor=custom_color)))

        elements.append(Paragraph(f"""
            __________________________________________<br/>
            Mutuário(a): {beneficiario}<br/>
            CPF: {cpf}""", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=15, leftIndent=0, alignment=1, spaceAfter=20, textColor=custom_color)))

        elements.append(Paragraph("Testemunhas:", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=0, spaceAfter=25 , textColor=custom_color)))

        # Create a table to place two elements side by side
        table_data = [
            [Paragraph(f"________________________________________<br/>{test_01_nome}<br/>CPF: {test_01_cpf}", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=1, spaceAfter=8, textColor=custom_color)),
            Paragraph(f"________________________________________<br/>{test_02_nome}<br/>CPF: {test_02_cpf}", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=1, spaceAfter=8, textColor=custom_color))]
        ]

        table = Table(table_data, colWidths=[300, 300])
        elements.append(table)

        if tipo_armazenagem == "Silo Bag":
            #SE FOR ARMAZENAGEM POR SILO BAG
            elements.append(PageBreak())
            elements.append(Paragraph(f"""
                <b>DECLARAÇÃO SOBRE CONDIÇÕES TÉCNICAS PARA UTILIZAÇÃO DE SILOS BAG PARA ARMAZENAGEM DE {str(produto_agricola).upper()}</b>""", 
                ParagraphStyle(name='TitleStyle', fontSize=font_size_title, alignment=1, spaceAfter=20, textColor=custom_color)))
            elements.append(Paragraph(f"""
                Posse - GO, {data_along}<br/>
                Ao Banco do Brasil S/A <br/>
                Agência: {mun_agencia} ({numero_agencia})<br/>
                {mun_agencia}, CEP: {cep} <br/>
                {beneficiario}""", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=0, leading=15, spaceAfter=12, textColor=custom_color)))
        
            elements.append(Paragraph("Prezados Senhores, ", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=0, spaceAfter=8, textColor=custom_color)))

            elements.append(Paragraph(f"""
                Declaramos, para os devidos fins, que são observadas as condições técnicas abaixo relacionadas para armazenagem de
                {qtd_penhor_tons} toneladas de {produto_agricola} em silos tipo bag, os quais constituem garantia de operação(ões) de Custeio Agrícola Alongado:""", 
                ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=13, leftIndent=0, alignment=TA_JUSTIFY, spaceAfter=15, textColor=custom_color)))


            elements.append(Paragraph(f"""
                a) prazo máximo de armazenagem de 06 (seis) meses; <br/>
                b) respeitadas as recomendações técnicas do produto definidas pelo fabricante; <br/>
                c) material do (s) silo (s) bag atende (m) à condição tríplice capa de polietileno (branco e preto) com no mínimo 250 micras de espessura; <br/>
                d) local de armazenamento plano, limpo, sem risco de enxurradas e isolado com tela para evitar a ação de roedores e outros animais; <br/>
                e) distância entre bolsas: acima de 1,5 metro; <br/>
                f) umidade máxima do grão: 14%; <br/>
                g) experiência do produtor e existência de todo maquinário necessário para efetuar o monitoramento e garantir a guarda do produto sob condições de conservação até a sua comercialização""", 
                ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=18  , leftIndent=0, alignment=TA_JUSTIFY, spaceAfter=40, textColor=custom_color)))

            elements.append(Paragraph(f"""
                ______________________________________________________________________________<br/>
                FRASSON PLANEJAMENTO E ASSISTENCIA AGROPECUARIA LTDA CREA BA 19314<br/>
                Daniel Zuchetti Frasson – RNP 1016346662D-GO <br/>
                Responsável Técnico""", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=15, leftIndent=0, alignment=1, spaceAfter=100, textColor=custom_color)))

            elements.append(Paragraph(f"""
                _____________________________________<br/>
                {beneficiario}<br/>
                CPF: {cpf}""", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=15, leftIndent=0, alignment=1, spaceAfter=20, textColor=custom_color)))

        # Cria o documento PDF
        doc.build(elements)

        # Obtém o conteúdo do PDF e fecha o buffer
        pdf = buffer.getvalue()
        buffer.close()

        # Retorna o PDF como uma resposta HTTP
        file_name = f"{beneficiario} {numero_operacao}"
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{file_name}.pdf"'
        response.write(pdf)
        return response

    except ObjectDoesNotExist:
        return HttpResponse()

def download_pdf_page_01(request, uuid):
    #CRIA ARQUIVO PDF DO ALONGAMENTO
    left_margin = 40
    right_margin = 40
    top_margin = 30
    bottom_margin = 30
    font_size_title = 12
    font_size_body = 10
    custom_color = Color(12/255, 23/255, 56/255) 
    
    try:
        alongamento = Cadastro_Alongamentos.objects.get(uuid=uuid)
        beneficiario = alongamento.operacao.beneficiario.razao_social
        cpf = alongamento.operacao.beneficiario.cpf_cnpj
        qtd_penhor_kg = locale.format_string('%.0f', alongamento.quant_penhor_kg, True) if alongamento.quant_penhor_kg != None else ''
        cep = alongamento.agencia_bancaria.cep_logradouro
        data_along = alongamento.data.strftime("%d de %B de %Y") 
        mun_agencia = f"{alongamento.agencia_bancaria.municipio.nome_municipio} - {alongamento.agencia_bancaria.municipio.sigla_uf}"
        mun_propriedade = f"{alongamento.propriedades.first().municipio.nome_municipio} - {alongamento.propriedades.first().municipio.sigla_uf}" if alongamento.propriedades.all() != [] else ''
        fiel_depositario_nome = alongamento.fiel_depositario.razao_social
        fiel_depositario_cpf = alongamento.fiel_depositario.cpf_cnpj
        numero_agencia = alongamento.agencia_bancaria.numero_agencia
        numero_operacao = alongamento.operacao.numero_operacao
        produto_agricola = alongamento.produto_agricola
        qtd_sacas_60_kg = locale.format_string('%.0f', alongamento.quant_sacas_60_kg, True) if alongamento.quant_sacas_60_kg != None else ''
        safra = alongamento.operacao.safra
        tipo_armazenagem = alongamento.tipo_armazenagem.description
        tipo_classificacao = alongamento.tipo_classificacao.description
        valor_total_along = locale.currency(alongamento.valor_total, grouping=True)
        valor_total_along_str = num2words(alongamento.valor_total, lang='pt_BR', to='currency')        
        lista_propriedades = [propriedade.nome for propriedade in alongamento.propriedades.all()]
        lista_matriculas = [propriedade.matricula for propriedade in alongamento.propriedades.all()]
        fazendas_matriculas = [f"{nome} (Mat. {matricula})" for nome, matricula in zip(lista_propriedades, lista_matriculas)]
        fazendas_matriculas_str = ', '.join(fazendas_matriculas)

        buffer = BytesIO()
        doc = BaseDocTemplate(buffer, pagesize=letter, title=f"Alongamento: {alongamento.operacao.beneficiario.razao_social}")

        # Crie um PageTemplate com as margens especificadas
        page_template = PageTemplate(id='custom_page', frames=[
            Frame(
                x1=left_margin, y1=bottom_margin,
                width=letter[0] - left_margin - right_margin,
                height=letter[1] - bottom_margin - top_margin,
                leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
                id='custom_frame'
            )
        ])

        doc.addPageTemplates([page_template])
        elements = []

        # Define um estilo personalizado para o título com tamanho de fonte
        elements.append(Paragraph("<b>DECLARAÇÃO DE DEPÓSITO DE PRODUÇÃO FINANCIADA</b>", ParagraphStyle(name='TitleStyle', fontSize=font_size_title, alignment=1, spaceAfter=20, textColor=custom_color)))
        
        elements.append(Paragraph(f"""
            Posse - GO, {data_along}<br/>
            Ao Banco do Brasil S/A <br/>
            Agência: {mun_agencia} ({numero_agencia})<br/>
            {mun_agencia}, CEP: {cep}""", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=0, leading=15, spaceAfter=12, textColor=custom_color)))
        
        elements.append(Paragraph("Prezados Senhores, ", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=0, spaceAfter=8, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Declaro(amos), para os fins a que se destinam, que a produção por mim (nós) financiada por meio da operação abaixo
            mencionada, encontra-se depositada no armazém abaixo identificado, em perfeito estado. Neste ato, assumo(imos)
            responsabilidade solidária, juntamente com o depositário abaixo assinado por sua guarda e conservação""", 
            ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=13, leftIndent=0, alignment=TA_JUSTIFY, spaceAfter=10, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Operação nº: {numero_operacao} <br/>
            Descrição do(s) Produto(s) Financiado(s)/Armazenado(s): """, 
            ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=0, leading=15, spaceAfter=3, textColor=custom_color)))
        
        elements.append(Paragraph(f"""
            • Produto(s)/Tipo: {produto_agricola} / {tipo_classificacao}<br/>
            • Quantidade(s): {qtd_penhor_kg} kg <br/>
            • Volume(s): {qtd_sacas_60_kg} scs <br/>
            • Safra (Período Agrícola): {safra} <br/>""", 
            ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=15, alignment=0, leading=15, spaceAfter=5, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Características e Localização do Armazém:""", 
            ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=0, leading=13, spaceAfter=3, textColor=custom_color)))
        
        elements.append(Paragraph(f"""
            • Tipo de Armazém: {tipo_armazenagem} <br/>
            • Nome do Proprietário: {fiel_depositario_nome} <br/>
            • Endereço: {fazendas_matriculas_str} <br/>
            • Município (UF): {mun_propriedade}""", 
            ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=15, alignment=0, leading=13, spaceAfter=12, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Declaro(amos) ainda que as quantidades informadas estão avaliadas em {valor_total_along} ({valor_total_along_str}), e que toda a quantidade entregue para
            depósito será destinada à liquidação das dívidas garantidas com a referida produção (operações de custeio), de minha
            (nossa) responsabilidade. Fica desde já entendido que todas as despesas advindas da armazenagem correm às minhas
            (nossas) custas, estando ciente (s) de que a produção se encontra apenhada e que só poderá ser comercializada e/ou
            retirada, no todo ou em parte, com autorização escrita do Banco do Brasil S/A podendo a Instituição, a qualquer tempo,
            independentemente de minha (nossa) anuência, exigir a entrega dos bens, sob as penas da Lei (Art. 652 do Código Civil).""", 
            ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=13, leftIndent=0, alignment=TA_JUSTIFY, spaceAfter=10, textColor=custom_color)))

        elements.append(Paragraph("Atenciosamente, ", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=10, leftIndent=0, alignment=0, spaceAfter=10, textColor=custom_color)))

        elements.append(Paragraph(f"""
            ____________________________________________<br/>
            Mutuário(a): {beneficiario}<br/>
            CPF: {cpf}""", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=15, leftIndent=0, alignment=1, spaceAfter=15, textColor=custom_color)))

        elements.append(Paragraph("FIEL(IS) DEPOSITÁRIO(S):, ", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=0, spaceAfter=8, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Assino esta declaração, na qualidade de fiel depositário(a) dos bens depositados no
            armazém de minha propriedade, retro descrito(s) e caracterizado(s), obrigando-me sob as penas da lei, a guardá-los e
            custodiá-los, juntamente com o emitente, bem como entregá-los a outro depositário se em qualquer tempo
            for exigido pelo Banco do Brasil S/A, ou ao próprio BANCO, logo que este o exigir, podendo este também a
            qualquer tempo, independentemente de nova autorização ou prévio consentimento, entrar no armazém de
            localização, enquanto não liquidada a dívida, para vistoriar esses bens.""", ParagraphStyle(name='ParagrafoStyle', fontSize=font_size_body, leading=13, leftIndent=0, alignment=TA_JUSTIFY, spaceAfter=20, textColor=custom_color)))

        elements.append(Paragraph(f"""
            _____________________________________________<br/>
            Fiel Depositário(a): {fiel_depositario_nome}<br/>
            CPF: {fiel_depositario_cpf}""", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=15, leftIndent=0, alignment=1, spaceAfter=8, textColor=custom_color)))
        
        # Cria o documento PDF
        doc.build(elements)

        # Obtém o conteúdo do PDF e fecha o buffer
        pdf = buffer.getvalue()
        buffer.close()

        # Retorna o PDF como uma resposta HTTP
        file_name = f"{beneficiario} {numero_operacao} - Page 01"
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{file_name}.pdf"'
        response.write(pdf)
        return response

    except ObjectDoesNotExist:
        return HttpResponse(404)
    
def download_pdf_page_02(request, uuid):
    #CRIA ARQUIVO PDF DO ALONGAMENTO
    left_margin = 40
    right_margin = 40
    top_margin = 30
    bottom_margin = 30
    font_size_title = 12
    font_size_body = 10
    custom_color = Color(12/255, 23/255, 56/255) 
    
    try:
        alongamento = Cadastro_Alongamentos.objects.get(uuid=uuid)
        beneficiario = alongamento.operacao.beneficiario.razao_social
        cpf = alongamento.operacao.beneficiario.cpf_cnpj
        qtd_penhor_kg = locale.format_string('%.0f', alongamento.quant_penhor_kg, True) if alongamento.quant_penhor_kg != None else ''
        cep = alongamento.agencia_bancaria.cep_logradouro
        data_along = alongamento.data.strftime("%d de %B de %Y") 
        mun_agencia = f"{alongamento.agencia_bancaria.municipio.nome_municipio} - {alongamento.agencia_bancaria.municipio.sigla_uf}"
        mun_propriedade = f"{alongamento.propriedades.first().municipio.nome_municipio} - {alongamento.propriedades.first().municipio.sigla_uf}" if alongamento.propriedades.all() != [] else ''
        fiel_depositario_nome = alongamento.fiel_depositario.razao_social
        fiel_depositario_cpf = alongamento.fiel_depositario.cpf_cnpj
        numero_agencia = alongamento.agencia_bancaria.numero_agencia
        numero_operacao = alongamento.operacao.numero_operacao
        vencimento = alongamento.operacao.data_vencimento.strftime('%d/%m/%Y')
        produto_agricola = alongamento.produto_agricola
        qtd_penhor_tons = locale.format_string('%.2f', alongamento.quant_penhor_tons, True) if alongamento.quant_penhor_tons != None else ''
        qtd_sacas_60_kg = locale.format_string('%.0f', alongamento.quant_sacas_60_kg, True) if alongamento.quant_sacas_60_kg != None else ''
        qtd_silos_3000_kg = locale.format_string('%.2f', alongamento.quant_sacas_60_kg / 3000, True) if alongamento.quant_sacas_60_kg != None else ''
        capacidade_estatica_scs = locale.format_string('%.0f', alongamento.capacidade_estatica_sacas_60_kg, True) if alongamento.capacidade_estatica_sacas_60_kg != None else ''
        capacidade_estatica_kg = locale.format_string('%.0f', alongamento.capacidade_estatica_sacas_60_kg * 60, True) if alongamento.capacidade_estatica_sacas_60_kg != None else ''
        safra = alongamento.operacao.safra
        test_01_nome = alongamento.testemunha01.razao_social
        test_01_cpf = alongamento.testemunha01.cpf_cnpj
        test_02_nome = alongamento.testemunha02.razao_social
        test_02_cpf = alongamento.testemunha02.cpf_cnpj
        tipo_armazenagem = alongamento.tipo_armazenagem.description
        capacidade_estatica_str = f"{qtd_silos_3000_kg} Silos Bag com capacidade de 3.000 sacas" if alongamento.tipo_armazenagem_id == 1 else f"{capacidade_estatica_scs} scs / {capacidade_estatica_kg} kg"
        tipo_classificacao = alongamento.tipo_classificacao.description
        valor_operacao = locale.currency(alongamento.operacao.valor_operacao, grouping=True) if alongamento.operacao.valor_operacao != None else ''
        valor_operacao_str = num2words(alongamento.operacao.valor_operacao, lang='pt_BR', to='currency')
        valor_total_along = locale.currency(alongamento.valor_total, grouping=True)
        valor_total_along_str = num2words(alongamento.valor_total, lang='pt_BR', to='currency')        
        lista_propriedades = [propriedade.nome for propriedade in alongamento.propriedades.all()]
        lista_matriculas = [propriedade.matricula for propriedade in alongamento.propriedades.all()]
        fazendas_matriculas = [f"{nome} (Mat. {matricula})" for nome, matricula in zip(lista_propriedades, lista_matriculas)]
        fazendas_str = ', '.join([fazenda for fazenda in lista_propriedades])
        matriculas_str = ', '.join([matricula for matricula in lista_matriculas])

        buffer = BytesIO()
        doc = BaseDocTemplate(buffer, pagesize=letter, title=f"Alongamento: {alongamento.operacao.beneficiario.razao_social}")

        # Crie um PageTemplate com as margens especificadas
        page_template = PageTemplate(id='custom_page', frames=[
            Frame(
                x1=left_margin, y1=bottom_margin,
                width=letter[0] - left_margin - right_margin,
                height=letter[1] - bottom_margin - top_margin,
                leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
                id='custom_frame'
            )
        ])

        doc.addPageTemplates([page_template])
        elements = []

        #ADD A NEW PAGE
        elements.append(Paragraph("<b>DECLARAÇÃO DE PRODUTO ARMAZENADO À ORDEM DO BANCO</b>", ParagraphStyle(name='TitleStyle', fontSize=font_size_title, alignment=1, spaceAfter=20, textColor=custom_color)))
        
        elements.append(Paragraph(f"""
            Posse - GO, {data_along}<br/>
            Ao Banco do Brasil S/A <br/>
            Agência: {mun_agencia} ({numero_agencia})<br/>
            {mun_agencia}, CEP: {cep}""", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=0, leading=15, spaceAfter=12, textColor=custom_color)))
        
        elements.append(Paragraph("Prezados Senhores, ", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=0, spaceAfter=8, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Declaro que a mercadoria abaixo especificada se encontra depositada à ordem do Banco do Brasil S/A, para a guarda e
            conservação, em perfeito estado, no armazém de minha propriedade, aqui indicado, o qual apresenta as condições
            necessárias para os fins pretendidos""", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=13, leftIndent=0, alignment=TA_JUSTIFY, spaceAfter=10, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Operação nº: {numero_operacao} <br/>
            Descrição do(s) Produto(s) Financiado(s)/Armazenado(s): """, ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=0, leading=15, spaceAfter=3, textColor=custom_color)))
        
        elements.append(Paragraph(f"""
            • Produto(s)/Tipo: {produto_agricola} / {tipo_classificacao} <br/>
            • Quantidade(s): {qtd_penhor_kg} kg <br/>
            • Volume(s): {qtd_sacas_60_kg} scs <br/>
            • Safra (Período Agrícola): {safra} <br/>""", 
            ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=15, alignment=0, leading=15, spaceAfter=5, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Características e Localização do Armazém de Depósito:""", 
            ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=0, leading=13, spaceAfter=3, textColor=custom_color)))
        
        elements.append(Paragraph(f"""
            • Tipo de Armazém: {tipo_armazenagem} <br/>
            • Nome do Proprietário: {fiel_depositario_nome} <br/>
            • Nome do(s) Imóvel(s): {fazendas_str} <br/>
            • Matrícula(s) CRI: {matriculas_str} <br/>
            • Município (UF): {mun_propriedade} <br/>
            • Capacidade Estática (kg): {capacidade_estatica_str}.""", 
            ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=15, alignment=0, leading=14, spaceAfter=12, textColor=custom_color)))

        elements.append(Paragraph(f"""
            Declaro também que a quantidade da mercadoria armazenada está avaliada em {valor_total_along} ({valor_total_along_str}), sendo suficiente para liquidação da(s)
            seguinte(s) dívida(s), lastreada(s) com o(s) produto(s) declarado(s): Operação nº {numero_operacao} no valor de {valor_operacao}
            ({valor_operacao_str}), referente ao custeio de {produto_agricola}, com vencimento em {vencimento}. Fica, desde já, entendido que todas as despesas advindas da armazenagem correm às minhas
            custas e que sou responsável pela guarda e conservação do produto armazenado como fiel depositário, sendo que a
            produção apenhada só poderá ser retirada no todo ou em parte, do citado armazém, com autorização escrita do Banco do
            Brasil S/A, podendo este, a qualquer tempo, independentemente da minha anuência, exigir a entrega dos bens, sob as
            penas da Lei (Artigo 652 do Código Civil), bem como, independentemente de nova autorização ou prévio consentimento,
            entrar no armazém de localização, enquanto não liquidada a dívida, para vistoriar esses bens""", 
            ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=13, leftIndent=0, alignment=TA_JUSTIFY, spaceAfter=15, textColor=custom_color)))

        elements.append(Paragraph("Atenciosamente, ", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=15, leftIndent=0, alignment=0, spaceAfter=15, textColor=custom_color)))

        elements.append(Paragraph(f"""
            __________________________________________<br/>
            Mutuário(a): {beneficiario}<br/>
            CPF: {cpf}""", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=15, leftIndent=0, alignment=1, spaceAfter=20, textColor=custom_color)))

        elements.append(Paragraph("Testemunhas:", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=0, spaceAfter=25 , textColor=custom_color)))

        # Create a table to place two elements side by side
        table_data = [
            [Paragraph(f"________________________________________<br/>{test_01_nome}<br/>CPF: {test_01_cpf}", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=1, spaceAfter=8, textColor=custom_color)),
            Paragraph(f"________________________________________<br/>{test_02_nome}<br/>CPF: {test_02_cpf}", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=1, spaceAfter=8, textColor=custom_color))]
        ]

        table = Table(table_data, colWidths=[300, 300])
        elements.append(table)

        # Cria o documento PDF
        doc.build(elements)

        # Obtém o conteúdo do PDF e fecha o buffer
        pdf = buffer.getvalue()
        buffer.close()

        # Retorna o PDF como uma resposta HTTP
        file_name = f"{beneficiario} {numero_operacao} - Page 02"
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{file_name}.pdf"'
        response.write(pdf)
        return response

    except ObjectDoesNotExist:
        return HttpResponse(404)

def download_pdf_page_03(request, uuid):
    #CRIA ARQUIVO PDF DO ALONGAMENTO
    left_margin = 40
    right_margin = 40
    top_margin = 30
    bottom_margin = 30
    font_size_title = 12
    font_size_body = 10
    custom_color = Color(12/255, 23/255, 56/255) 
    
    try:
        alongamento = Cadastro_Alongamentos.objects.get(uuid=uuid)
        beneficiario = alongamento.operacao.beneficiario.razao_social
        cpf = alongamento.operacao.beneficiario.cpf_cnpj
        cep = alongamento.agencia_bancaria.cep_logradouro
        data_along = alongamento.data.strftime("%d de %B de %Y") if data_along else ''
        mun_agencia = f"{alongamento.agencia_bancaria.municipio.nome_municipio} - {alongamento.agencia_bancaria.municipio.sigla_uf}"
        numero_agencia = alongamento.agencia_bancaria.numero_agencia
        numero_operacao = alongamento.operacao.numero_operacao
        produto_agricola = alongamento.produto_agricola
        qtd_penhor_tons = locale.format_string('%.2f', alongamento.quant_penhor_tons, True) if alongamento.quant_penhor_tons != None else ''
        tipo_armazenagem = alongamento.tipo_armazenagem.description

        if tipo_armazenagem == "Silo Bag":
            buffer = BytesIO()
            doc = BaseDocTemplate(buffer, pagesize=letter, title=f"Alongamento: {alongamento.operacao.beneficiario.razao_social}")

            # Crie um PageTemplate com as margens especificadas
            page_template = PageTemplate(id='custom_page', frames=[
                Frame(
                    x1=left_margin, y1=bottom_margin,
                    width=letter[0] - left_margin - right_margin,
                    height=letter[1] - bottom_margin - top_margin,
                    leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
                    id='custom_frame'
                )
            ])

            doc.addPageTemplates([page_template])
            elements = []

            #SE FOR ARMAZENAGEM POR SILO BAG
            elements.append(Paragraph(f"""
                <b>DECLARAÇÃO SOBRE CONDIÇÕES TÉCNICAS PARA UTILIZAÇÃO DE SILOS BAG PARA ARMAZENAGEM DE {str(produto_agricola).upper()}</b>""", 
                ParagraphStyle(name='TitleStyle', fontSize=font_size_title, alignment=1, spaceAfter=20, textColor=custom_color)))
            elements.append(Paragraph(f"""
                Posse - GO, {data_along}<br/>
                Ao Banco do Brasil S/A <br/>
                Agência: {mun_agencia} ({numero_agencia})<br/>
                {mun_agencia}, CEP: {cep} <br/>
                {beneficiario}""", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=0, leading=15, spaceAfter=12, textColor=custom_color)))
        
            elements.append(Paragraph("Prezados Senhores, ", ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=0, spaceAfter=8, textColor=custom_color)))

            elements.append(Paragraph(f"""
                Declaramos, para os devidos fins, que são observadas as condições técnicas abaixo relacionadas para armazenagem de
                {qtd_penhor_tons} toneladas de {produto_agricola} em silos tipo bag, os quais constituem garantia de operação(ões) de Custeio Agrícola Alongado:""", 
                ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=13, leftIndent=0, alignment=TA_JUSTIFY, spaceAfter=15, textColor=custom_color)))


            elements.append(Paragraph(f"""
                a) prazo máximo de armazenagem de 06 (seis) meses; <br/>
                b) respeitadas as recomendações técnicas do produto definidas pelo fabricante; <br/>
                c) material do (s) silo (s) bag atende (m) à condição tríplice capa de polietileno (branco e preto) com no mínimo 250 micras de espessura; <br/>
                d) local de armazenamento plano, limpo, sem risco de enxurradas e isolado com tela para evitar a ação de roedores e outros animais; <br/>
                e) distância entre bolsas: acima de 1,5 metro; <br/>
                f) umidade máxima do grão: 14%; <br/>
                g) experiência do produtor e existência de todo maquinário necessário para efetuar o monitoramento e garantir a guarda do produto sob condições de conservação até a sua comercialização""", 
                ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=18  , leftIndent=0, alignment=TA_JUSTIFY, spaceAfter=40, textColor=custom_color)))

            elements.append(Paragraph(f"""
                ______________________________________________________________________________<br/>
                FRASSON PLANEJAMENTO E ASSISTENCIA AGROPECUARIA LTDA CREA BA 19314<br/>
                Daniel Zuchetti Frasson – RNP 1016346662D-GO <br/>
                Responsável Técnico""", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=15, leftIndent=0, alignment=1, spaceAfter=100, textColor=custom_color)))

            elements.append(Paragraph(f"""
                _____________________________________<br/>
                {beneficiario}<br/>
                CPF: {cpf}""", ParagraphStyle(name='ParagrafoStyle',  fontSize=font_size_body, leading=15, leftIndent=0, alignment=1, spaceAfter=20, textColor=custom_color)))


            # Cria o documento PDF
            doc.build(elements)

            # Obtém o conteúdo do PDF e fecha o buffer
            pdf = buffer.getvalue()
            buffer.close()

            # Retorna o PDF como uma resposta HTTP
            file_name = f"{beneficiario} {numero_operacao} - Page 03"
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{file_name}.pdf"'
            response.write(pdf)
            return response
        else:
            return HttpResponse(404)
    except ObjectDoesNotExist:
        return None
    
class ProdutoView(viewsets.ModelViewSet):
    queryset = Produto_Agricola.objects.all()
    serializer_class = listProdutos

class TipoArmazenagemView(viewsets.ModelViewSet):
    queryset = Tipo_Armazenagem.objects.all()
    serializer_class = listTipoArmazenagem

class TipoClassificacaoView(viewsets.ModelViewSet):
    queryset = Tipo_Classificacao.objects.all()
    serializer_class = listTipoClassificacao