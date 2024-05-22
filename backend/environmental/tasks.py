from backend.frassonUtilities import TOKEN_PIPEFY_API
from backend.pipefy2 import Pipefy
from .models import Prazos_Renovacao, Processos_Outorga, Processos_APPO
from pipefy.models import Cadastro_Prospects
from datetime import date, timedelta, datetime
from django.db.models import Count

def verifica_renovacao_outorga():
    #This function needs to run every monday at 5am
    pipefy = Pipefy(token=TOKEN_PIPEFY_API) #instance of pipefy object
    dias_antes_renovacao = Prazos_Renovacao.objects.get(pk=2).dias_para_renov # id = 2 for Outorga
    date_today = date.today() #this time delta is just for test
    limit_date_down = date_today + timedelta(days=dias_antes_renovacao + 30) # Data limite inferior.
    limit_date_up = date_today + timedelta(days=dias_antes_renovacao + 36) # Data limite superior (6 dias de diferença)
    processos = Processos_Outorga.objects.filter(data_validade__gte=limit_date_down, data_validade__lte=limit_date_up, processo_frasson=True).annotate(qtd_pocos=Count('processos_outorga_coordenadas'))
    
    for processo in processos:
        data_renovacao_date = processo.data_validade - timedelta(days=dias_antes_renovacao)
        data_renovacao = datetime.strptime(str(data_renovacao_date), '%Y-%m-%d').strftime('%d/%m/%Y')
        nome_requerente = processo.nome_requerente
        numero_portaria = processo.numero_portaria
        data_publicacao = processo.data_publicacao.strftime('%d/%m/%Y')
        data_vencimento = processo.data_validade.strftime('%d/%m/%Y')
        fazenda = processo.nome_propriedade
        municipio = f"{processo.municipio.nome_municipio} - {processo.municipio.sigla_uf}"
        qtd_pocos = processo.qtd_pocos #vem da query principal

        text_description = (
            f"Renovação de Outorga ({qtd_pocos} {'poços' if qtd_pocos > 1 else 'poço'}) da {fazenda} em {municipio}, referente a Portaria {numero_portaria}, "
            f"publicada em {data_publicacao}. A Portaria vence em {data_vencimento} e o prazo limite para o requerimento de renovação é até {data_renovacao}."
        )

        #busca o id do cliente prospect, se houver. Caso não tenha o cadastro, cria um novo
        cliente = Cadastro_Prospects.objects.filter(cliente__icontains=nome_requerente).first() or None
        
        if cliente != None:
            id_prospect = cliente.id
        else: 
            fields_attributes_prospect = [
                {'field_id': 'cliente', 'field_value': nome_requerente},
                {'field_id': 'representante', 'field_value': nome_requerente},
            ]

            #cria um novo cadastro de Prospect
            create_card = pipefy.createTableRecord(table_id=1139554, fields_attributes=fields_attributes_prospect)
            id_prospect = create_card['id']
            #id_prospect = 16521
        fields_attributes = [
            {'field_id': 'produto', 'field_value': 'Gestão Ambiental e Irrigação'},
            {'field_id': 'classifica_o_prospect', 'field_value': 'Cliente da Carteira'},
            {'field_id': 'origem', 'field_value': 'Business Scale'},
            {'field_id': 'prioridade', 'field_value': 305113859},
            {'field_id': 'prospect_2', 'field_value': id_prospect},
            {'field_id': 'observa_es', 'field_value': text_description},
            {'field_id': 'grau_de_abordagem_para_back_office', 'field_value': 'Baixo'},
        ]

        #cria o card no Fluxo Prospect
        pipefy.createCard(pipe_id=301573049, fields_attributes=fields_attributes)
    return "success"


def verifica_renovacao_appo():
    #This functions needs to run every monday at 5am
    pipefy = Pipefy(token=TOKEN_PIPEFY_API) #instance of pipefy object
    dias_antes_renovacao = Prazos_Renovacao.objects.get(pk=1).dias_para_renov # id = 1 for APPO
    date_today = date.today() #this time delta is just for test
    limit_date_down = date_today + timedelta(days=dias_antes_renovacao + 30) # Data limite inferior.
    limit_date_up = date_today + timedelta(days=dias_antes_renovacao + 36) # Data limite superior (6 dias de diferença)
    processos = Processos_APPO.objects.filter(processo_frasson=True, data_vencimento__gte=limit_date_down, data_vencimento__lte=limit_date_up).annotate(qtd_pocos=Count('processos_appo_coordenadas'))
    
    for processo in processos:
        data_renovacao_date = processo.data_vencimento - timedelta(days=dias_antes_renovacao)
        data_renovacao = datetime.strptime(str(data_renovacao_date), '%Y-%m-%d').strftime('%d/%m/%Y')
        nome_requerente = processo.nome_requerente
        numero_processo = processo.numero_processo
        data_documento = processo.data_documento.strftime('%d/%m/%Y')
        data_vencimento = processo.data_vencimento.strftime('%d/%m/%Y')
        fazenda = processo.nome_fazenda
        municipio = f"{processo.municipio.nome_municipio} - {processo.municipio.sigla_uf}"
        qtd_pocos = processo.qtd_pocos #vem da query principal

        text_description = (
            f"Renovação de APPO ({qtd_pocos} {'poços' if qtd_pocos > 1 else 'poço'}) da {fazenda} em {municipio}, referente ao processo {numero_processo} "
            f"publicada em {data_documento}. A APPO vence em {data_vencimento} e o prazo limite para o requerimento de renovação é até {data_renovacao}."
        )

        #busca o id do cliente prospect, se houver. Caso não tenha o cadastro, cria um novo
        cliente = Cadastro_Prospects.objects.filter(cliente__icontains=nome_requerente[10:]).first() or None
        if cliente != None:
            id_prospect = cliente.id
        else: 
            fields_attributes_prospect = [
                {'field_id': 'cliente', 'field_value': nome_requerente},
                {'field_id': 'representante', 'field_value': nome_requerente},
            ]

            #cria um novo cadastro de Prospect
            create_card = pipefy.createTableRecord(table_id=1139554, fields_attributes=fields_attributes_prospect)
            id_prospect = create_card['id']
            #id_prospect = 16521

        fields_attributes = [
            {'field_id': 'produto', 'field_value': 'Gestão Ambiental e Irrigação'},
            {'field_id': 'classifica_o_prospect', 'field_value': 'Cliente da Carteira'},
            {'field_id': 'origem', 'field_value': 'Business Scale'},
            {'field_id': 'prioridade', 'field_value': 305113859},
            {'field_id': 'prospect_2', 'field_value': id_prospect},
            {'field_id': 'observa_es', 'field_value': text_description},
            {'field_id': 'grau_de_abordagem_para_back_office', 'field_value': 'Baixo'},
        ]

        ##cria o card no Fluxo Prospect
        pipefy.createCard(pipe_id=301573049, fields_attributes=fields_attributes)
    return "success"