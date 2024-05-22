from backend.frassonUtilities import TOKEN_PIPEFY_API
from backend.pipefy2 import Pipefy
from .models import Cadastro_Licencas
from pipefy.models import Cadastro_Prospects
from datetime import date, timedelta, datetime
from django.db import models as DM

class BaseSQL(object):
    function = 'DATE_ADD'
    template = '%(function)s(NOW(), interval %(expressions)s + 30 day)'

class DurationAgr(BaseSQL, DM.Aggregate):
    def __init__(self, expression, **extra):
        super(DurationAgr, self).__init__(
            expression,
            output_field=DM.DateTimeField(),
            **extra
        )

class BaseSQLplus(object):
    function = 'DATE_ADD'
    template = '%(function)s(NOW(), interval %(expressions)s + 36 day)'

class DurationAgrplus(BaseSQLplus, DM.Aggregate):
    def __init__(self, expression, **extra):
        super(DurationAgrplus, self).__init__(
            expression,
            output_field=DM.DateTimeField(),
            **extra
        )


def verifica_renovacao_licenca():
    #This functions needs to run every monday at 5am
    pipefy = Pipefy(token=TOKEN_PIPEFY_API) #instance of pipefy object
    date_today = date.today() #this time delta is just for test
    
    licencas = Cadastro_Licencas.objects.filter(data_validade__gte=DurationAgr('dias_renovacao'),
        data_validade__lte=DurationAgrplus('dias_renovacao'))
    
    for licenca in licencas:
        data_renovacao_date = licenca.data_validade - timedelta(days=licenca.dias_renovacao)
        data_renovacao = datetime.strptime(str(data_renovacao_date), '%Y-%m-%d').strftime('%d/%m/%Y')
        data_publicacao = licenca.data_emissao.strftime('%d/%m/%Y')
        data_vencimento = licenca.data_validade.strftime('%d/%m/%Y')
        text_description = (
            f"Renovação de {licenca.tipo_licenca} N° {licenca.numero_licenca}"
            f"publicada em {data_publicacao}. A Portaria vence em {data_vencimento} e o prazo limite para o requerimento de renovação é até {data_renovacao}."
        )

        #busca o id do cliente prospect, se houver. Caso não tenha o cadastro, cria um novo
        cliente = Cadastro_Prospects.objects.filter(cliente=licenca.beneficiario).first() or None
        
        if cliente != None:
            id_prospect = cliente.id
        else: 
            fields_attributes_prospect = [
                {'field_id': 'cliente', 'field_value': licenca.beneficiario.razao_social},
                {'field_id': 'representante', 'field_value': licenca.beneficiario.razao_social},
            ]
            #cria um novo cadastro de Prospect
            create_card = pipefy.createTableRecord(table_id=1139554, fields_attributes=fields_attributes_prospect)
            id_prospect = create_card['id']

        fields_attributes = [
            {'field_id': 'produto', 'field_value': 'Gestão Ambiental e Irrigação'},
            {'field_id': 'classifica_o_prospect', 'field_value': 'Cliente da Carteira'},
            {'field_id': 'origem', 'field_value': 'Business Scale'},
            {'field_id': 'prioridade', 'field_value': 305113859},
            {'field_id': 'prospect_2', 'field_value': id_prospect},
            {'field_id': 'observa_es', 'field_value': text_description},
            {'field_id': 'grau_de_abordagem_para_back_office', 'field_value': 'Baixo'},
        ]

        # cria o card no Fluxo Prospect
        pipefy.createCard(pipe_id=301573049, fields_attributes=fields_attributes)
    return "success"
