import requests, json, environ
from django.http import JsonResponse
from backend.settings import TOKEN_PIPEFY_API, URL_PIFEFY_API
from webhooks.utilities import criar_registro_db

env = environ.Env()
environ.Env.read_env()

init_data = {
    '301654297':
    {'name': 'Grupos Clientes', 'native_fields':["nome_do_grupo"], 'foreign_fields':[], 'many_fields':[], 'float_fields':[]},

    '1136264':{
      'name': 'Cadastro Pessoal', 
      'native_fields':["nome_do_cliente", "endere_o", "cpf", "munic_pio", "uf", "contato", "contato_2", "natureza", "cep", 
        "identidade", "data_de_nascimento", "e_mail", "profiss_o"],
      'foreign_fields': ["grupo_1"], 'many_fields':["s_cios"], 'float_fields':[]
    },

    '1260853':{
      'name': 'Cad Fornecedor Colaborador', 
      'native_fields':["nome", "cpf_cnpj", "endere_o", "bairro", "cep", "munic_pio", "uf", "nome_do_representante", "contato_1"
        "contato_2", "e_mail"], 'foreign_fields': [], 'many_fields':[], 'float_fields':[]
    },

    '303133100':{
        'name': 'Caixas Financeiro', 'native_fields':["nome_caixa", "sigla_caixa", "n_ag_ncia", "n_conta"],
        'foreign_fields': [], 'many_fields':[], 'float_fields':[]
    },

    '302757437':{
        'name': 'Categorias Pagamentos', 'native_fields':["categoria", "sub_categoria", "classifica_o"],
        'foreign_fields': [], 'many_fields':[], 'float_fields':[]
    },

    '1136266':{
        'name': 'Contratos Serviços', 'native_fields':["produto", "detalhes_da_negocia_o", "data_da_assinatura", "data_do_vencimento"],
        'foreign_fields': ["contratante"], 'many_fields':["membros_do_contrato", "detalhamento_da_s_demanda_s"], 
        'float_fields':["percentual_do_contrato_gc", "valor_do_contrato"]
    },

    '1137034':{
        'name': 'Itens Financiados', 'native_fields':["tipo_de_opera_o", "tipo"], 'foreign_fields': [], 'many_fields':[], 'float_fields':[]
    },

    '301582775':{
        'name': 'Detalhamento Serviços',
        'native_fields':["detalhamento"], 'foreign_fields': ["produto_frasson"], 'many_fields':[], 'float_fields':[]
    },

    '1137085':{
        'name': 'Instituições Razão Social',
        'native_fields':["raz_o_social_da_institui_o", "cnpj", "produto_vinculado", "tipo_de_institui_o"], 
        'foreign_fields': [], 'many_fields':[], 'float_fields':[]
    },
    '1137087':{
        'name': 'Instituições Parceiras',
        'native_fields':["ag_ncia"], 'foreign_fields': ["institui_o"], 'many_fields':[], 'float_fields':[]        
    },
    '1139735':{
        'name': 'Operações Contratadas',
        'native_fields': ["n_da_opera_o", "valor_da_opera_o", "rea_total_beneficiada", "fonte_do_recurso", "im_vel_ies", 
            "data_da_emiss_o_da_c_dula", "data_do_primeiro_vencimento", "data_para_apresenta_o_de_dec_prod_armazenado", 
            "data_do_vencimento", "safra", "taxa_juros"], 
        'foreign_fields': ["nome", "item_financiado", "institui_o_financeira"], 'many_fields':[], 
        'float_fields': ["percentual_do_contrato_gc", "valor_do_contrato"]          
    },
    '1213951':{
        'name': 'Imóveis Rurais',
        'native_fields':["o_qu", "matr_cula", "livro_de_registro", "n_mero_do_registro", "data_do_registro", "munic_pio_do_im_vel",
            "uf", "cep", "nirf", "n_mero_ccir", "registro_car", "roteiro_de_acesso", "localiza_o_da_reserva"], 
        'foreign_fields': ["propriet_rio_do_im_vel"], 'many_fields':[], 
        'float_fields':["rea_total_do_im_vel", "m_dulos_fiscais", "rea_de_app", "rea_de_vegeta_o_nativa", "rea_explorada", 
            "rea_de_reserva_legal"]  
    },
    '1214186':{
        'name': 'Regimes de Exploração', 'native_fields':["regime_de_explora_o", "in_cio", "t_rmino", "atividades_exploradas", "detalhar"], 
        'foreign_fields': ["nome_do_im_vel", "quem_explora", "institui_o_vinculada"], 'many_fields': [], 'float_fields': ["rea_cedida"]
    },
    '1139554':{
        'name': 'Cadastro Prospects',
        'native_fields':["cliente", "representante", "contato_1", "contato_2", "outros_contatos", "e_mail_1", "e_mail_2", "outras_observa_es"],
        'foreign_fields': [], 'many_fields':[], 'float_fields':[]
    },
    '301573538':{
        'name': 'Pipe Produtos',
        'native_fields':["nome_do_grupo"], 'foreign_fields':["contrato_vinculado", "institui_o_vinculada", "detalhamento_demanda_2"], 
        'many_fields':["benefici_rio_s"], 'float_fields':["valor_da_opera_o"]
    },
    '301573049':{
        'name':'Pipe Prospects',
        'native_fields':['produto', 'classifica_o_prospect', 'origem', 'prazo_para_encaminhamento', 'prazo_para_o_contato_inicial', 
            'prazo_para_o_back_office', 'prazo_para_a_an_lise_e_processamento', 'prazo_para_a_litec_1', 'prazo_para_a_proposta_de_valor', 
            'prazo_para_a_proposta_de_valor_1', 'prazo_para_encerramento', 'prazo_para_encerramento', 'prazo_para_encerramento', 
            'prazo_para_encerramento', 'prazo_para_encerramento'], 'foreign_fields':["prospect_2"],
        'many_fields':['respons_vel', 'respons_vel_pelo_contato_incial', 'respons_vel_pelo_back_office','respons_vel_pela_an_lise_t_cnica', 
            'prazo_para_a_litec', 'respons_vel_pela_proposta_de_valor', 'respons_vel_pela_proposta_de_valor_1', 'respons_vel_pelo_encerramento'], 
            'float_fields':["valor_inicial_da_proposta", "valor_aprovado", "percentual_aprovado", "percentual_proposto"]
    },
    '302757413':{
        'name':'Pipe Pagamentos', 'native_fields': ["descri_o", "detalhamento", "data_vencimento", "data_pagamento", ""], 
        'foreign_fields': ["benefici_rio_pagamento","categoria_pagamento","caixa_sa_da"], 'many_fields':[], 'float_fields':["valor_pagamento"]
    },
    '302821542':{
        'name':'Pipe Cobranças',
        'native_fields': ["etapa_cobran_a", "valor_pagamento", "data_pagamento"], 
        'foreign_fields': ["cliente", "contrato", "detalhe_demanda", "faturado_no_caixa"], 'many_fields': [], 
        'float_fields': ["saldo_devedor", "valor_final_faturado", "percentual_contratado", "valor_final_contratado"]
    }
    
}

ids_pipes = [301573538, 301573049, 302757413, 302821542]

def InsertRegistros(id):
    hasNextPage = True
    page = 1
    
    while hasNextPage:
    
        if page == 1:
            if id in ids_pipes:
                payload = {"query":"{cards(pipe_id: "+str(id)+") {pageInfo{endCursor hasNextPage} edges {node {id url current_phase {name id} createdAt fields {native_value float_value array_value field{id}}}}}}"}
            else:
                payload = {"query":"{table_records(table_id:"+str(id)+") {pageInfo{endCursor hasNextPage} edges {node {id created_at url record_fields {native_value array_value float_value field{id}}}}}}"}
        else:
            if id in ids_pipes:
                payload = {"query":"{cards(pipe_id: "+str(id)+", after:\"" + endCursor + "\") {pageInfo{endCursor hasNextPage} edges {node {id url current_phase {name id} createdAt fields {native_value float_value array_value field{id}}}}}}"}
            else:
                payload = {"query": "{table_records(table_id: "+str(id)+", after:\"" + endCursor + "\") {pageInfo{endCursor hasNextPage} edges {node {id created_at url current_phase {name id} record_fields {native_value array_value float_value field{id}}}}}}"}

        headers = {"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"}
        response = requests.post(URL_PIFEFY_API, json=payload, headers=headers)
        obj = json.loads(response.text)
        if id in ids_pipes:
            typereg = "cards"
        else:
            typereg = "table_records"
        endCursor = obj["data"][typereg]["pageInfo"]["endCursor"]
        hasNextPage = obj["data"][typereg]["pageInfo"]["hasNextPage"]
        edges = obj["data"][typereg]["edges"]
        count = 0
        for edge in edges:
            data = {}
            if id in ids_pipes:
                fields = edge["node"]["fields"]
            else:
                fields = edge["node"]["record_fields"]
            data['url'] = edge["node"]["url"]
            data['id'] = edge["node"]["id"]
            data['createdAt'] = edge["node"]["createdAt"] if id in ids_pipes else edge["node"]["created_at"]
            if id in ids_pipes:
                data['current_phase_id'] = edge["node"]["current_phase"]["id"]
                data['current_phase_name'] = edge["node"]["current_phase"]["name"]
            for field in fields:
                field_id = field["field"]["id"]
                if field_id in init_data[str(id)]['native_fields']:
                    data[field_id] = field["native_value"]
                if field_id in init_data[str(id)]['foreign_fields']:
                    data[field_id] = int(field["array_value"][0]) if len(field["array_value"]) > 0 else None
                if field_id in init_data[str(id)]['many_fields']:
                    data[field_id] = [int(indice) for indice in field["array_value"]]
                if field_id in init_data[str(id)]['float_fields']:
                    data[field_id] = field["float_value"]
            criar_registro_db(id, data)
            if count == 19:
                break
            count+=1
        break
        page += 1

def getData(id, id_pipe):
    data = {}
    data["id"] = id
    if id_pipe in ids_pipes:
        payload = {"query":"{card (id:" + str(id) + ") {url current_phase{id name} createdAt fields{native_value float_value array_value field{id}}}}"}
    else:
        payload = {"query":"{table_record (id:" + str(id) + ") {created_at url record_fields{native_value array_value float_value field{id}}}}"}
    headers = {"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"}
    response = requests.post(URL_PIFEFY_API, json=payload, headers=headers)
    obj = json.loads(response.text)
    if id_pipe in ids_pipes:
        data["current_phase_id"] = obj["data"]["card"]["current_phase"]["id"]
        data["current_phase_name"] = obj["data"]["card"]["current_phase"]["name"]
        data["createdAt"] = obj["data"]["card"]["createdAt"]
        fields = obj["data"]["card"]["fields"]
        data["url"] = obj["data"]["card"]["url"]
    else:
        data["createdAt"] = obj["data"]["table_record"]["created_at"]
        fields = obj["data"]["table_record"]["record_fields"]
        data["url"] = obj["data"]["table_record"]["url"]

    for field in fields:
        field_id = field["field"]["id"]
        if field_id in init_data[str(id_pipe)]['native_fields']:
            data[field_id] = field["native_value"]
        if field_id in init_data[str(id_pipe)]['foreign_fields']:
            data[field_id] = int(field["array_value"][0]) if len(field["array_value"]) > 0 else None
        if field_id in init_data[str(id_pipe)]['many_fields']:
            data[field_id] = [int(indice) for indice in field["array_value"]]
        if field_id in init_data[str(id_pipe)]['float_fields']:
            data[field_id] = field["float_value"]
    return data

ids_pipes_databases = [
    301573538,  # FLUXO PRODUTOS FRASSON - ["INSERIDO NA CRIAÇÃO WEBHOOK"]
    301573049,  # FLUXO PROSPECT FRASSON - ["INSERIDO NA CRIAÇÃO WEBHOOK"]
    1136264,    # DATABASE CADASTRO PESSOAL - ["INSERIDO NA CRIAÇÃO WEBHOOK"]
    1260853,    # DATABASE CADASTRO COLABORAORES E FORNECEDORES - ["INSERIDO NA CRIAÇÃO WEBHOOK"]
    1213951,    # DATABASE CADASTRO IMÓVEIS RURAIS - ["INSERIDO NA CRIAÇÃO DO WEBHOOK"]
    1214186,    # DATABASE REGIMES DE EXPLORAÇÃO - ["INSERIDO NA CRIAÇÃO WEBHOOK"]
    1136266,    # DATABASE CONTRATOS PRESTAÇÃO DE SERVIÇOS - ["INSERIDO NA CRIAÇÃO DO WEBHOOK"]
    1137085,    # DATABASE INSTITUIÇÕES RAZÃO SOCIAL - ["INSERIDO NA CRIAÇÃO DO WEBHOOK"]
    1137087,    # DATABASE INSTITUIÇÕES PARCEIRAS - ["INSERIDO NA CRIAÇÃO DO WEBHOOK"]
    1139735,    # DATABASE OPERAÇÕES CONTRATADAS - ["INSERIDO NA CRIAÇÃO DO WEBHOOK"]
    #1153778,    # fluxo avaliação imóveis rurais
    302757437,  # DATABASE CATEGORIAS DE PAGAMENTOS - ["INSERIDO NA CRIAÇÃO DO WEBHOOK"]
    302757413,  # FLUXO PAGAMENTOS NOVO - ["INSERIDO NA CRIAÇÃO DO WEBHOOK"]
    302821542,  # FLUXO COBRANÇAS NOVO - ["INSERIDO NA CRIAÇÃO DO WEBHOOK"]
    301654297,  # DATABASE GRUPO DE CLIENTES - ["INSERIDO NA CRIAÇÃO DO WEBHOOK"]
    303133100,  # DATABASE CAIXAS FINANCEIRO - ["INSERIDO NA CRIAÇÃO DO WEBHOOK"]
    1137034,    # DATABASE ITENS FINANCIADOS - ["INSERIDO NA CRIAÇÃO WEBHOOK"]
    301582775,  # DATABASE DETALHAMENTO SERVIÇOS - ["INSERIDO NA CRIAÇÃO WEBHOOK"]
    1139554,    # DATABASE CADASTRO PROSPECTS - ["INSERIDO NA CRIAÇÃO WEBHOOK"]
    302802605   # DATABASE CONTAS BANCÁRIAS CLIENTES
]

#objeto com os webhooks que serão inseridos/configurados no pipefy
insert_webhooks = [
    # DATABASE CATEGORIAS PAGAMENTOS ["FINALIZADO ADRIANO"]
    {'id': 302757437, 'action': "card.create" , 'url': "pipefy/database/302757437/create_record", 'name': "Create Record Categorias"}, 
    {'id': 302757437, 'action': "card.field_update" , 'url': "pipefy/database/302757437/update_record", 'name': "Update Record Categorias"},
    {'id': 302757437, 'action': "card.delete" , 'url': "pipefy/database/302757437/delete_record", 'name': "Delete Record Categorias"},

    # PIPE COBRANCAS NOVO ["FINALIZADO ADRIANO"]
    {'id': 302821542, 'action': "card.create", 'url': "pipefy/pipe/302821542/create_card", 'name': "Create Card Cobranca"},
    {'id': 302821542, 'action': "card.field_update", 'url': "pipefy/pipe/302821542/update_card", 'name': "Update Card Cobranca"},
    {'id': 302821542, 'action': "card.move", 'url': "pipefy/pipe/302821542/move_card", 'name': "Move Card Pagamentos"},
    {'id': 302821542, 'action': "card.delete", 'url': "pipefy/pipe/302821542/delete_card", 'name': "Delete Card Cobrança"}, 

    # PIPE PAGAMENTOS NOVO ["FINALIZADO ADRIANO"]
    {'id': 302757413, 'action': "card.create" , 'url': "pipefy/pipe/302757413/create_card", 'name': "Create Card Pagamentos"}, 
    {'id': 302757413, 'action': "card.field_update" , 'url': "pipefy/pipe/302757413/update_card", 'name': "Update Card Pagamentos"},
    {'id': 302757413, 'action': "card.move" , 'url': "pipefy/pipe/302757413/move_card", 'name': "Move Card Pagamentos"},
    {'id': 302757413, 'action': "card.delete" , 'url': "pipefy/pipe/302757413/delete_card", 'name': "Delete Card Pagamentos"},

    # DATABASE GRUPO DE CLIENTES ["FINALIZADO ADRIANO"]
    {'id': 301654297, 'action': "card.create" , 'url': "pipefy/database/301654297/create_record", 'name': "Create Record Grupos"}, 
    {'id': 301654297, 'action': "card.field_update" , 'url': "pipefy/database/301654297/update_record", 'name': "Update Record Grupos"},
    {'id': 301654297, 'action': "card.delete" , 'url': "pipefy/database/301654297/delete_record", 'name': "Delete Record Grupos"},

    # DATABASE CAIXAS FINANCEIRO ["FINALIZADO ADRIANO"]
    {'id': 303133100, 'action': "card.create" , 'url': "pipefy/database/303133100/create_record", 'name': "Create Caixa Financeiro"}, 
    {'id': 303133100, 'action': "card.field_update" , 'url': "pipefy/database/303133100/update_record", 'name': "Update Caixa Financeiro"},
    {'id': 303133100, 'action': "card.delete" , 'url': "pipefy/database/303133100/delete_record", 'name': "Delete Caixa Financeiro"},

    # DATABASE CONTRATOS PRESTAÇÃO SERVIÇOS ["FINALIZADO ADRIANO"]
    {'id': 1136266, 'action': "card.create" , 'url': "pipefy/database/1136266/create_record", 'name': "Create Record PrestServicos"}, 
    {'id': 1136266, 'action': "card.field_update" , 'url': "pipefy/database/1136266/update_record", 'name': "Update Record PrestServicos"},
    {'id': 1136266, 'action': "card.delete" , 'url': "pipefy/database/1136266/delete_record", 'name': "Delete Record PrestServicos"},

    # DATABASE ITENS FINANCIADOS ["FINALIZADO ADRIANO"]
    {'id': 1137034, 'action': "card.create" , 'url': "pipefy/database/1137034/create_record", 'name': "Create Record Item Financiado"}, 
    {'id': 1137034, 'action': "card.field_update" , 'url': "pipefy/database/1137034/update_record", 'name': "Update Record Item Financiado"},
    {'id': 1137034, 'action': "card.delete" , 'url': "pipefy/database/1137034/delete_record", 'name': "Delete Record Item Financiado"},

    # DATABASE DETALHAMENTO SERVIÇOS ["FINALIZADO ADRIANO"]
    {'id': 301582775, 'action': "card.create" , 'url': "pipefy/database/301582775/create_record", 'name': "Create Record Detalhe Serviço"}, 
    {'id': 301582775, 'action': "card.field_update" , 'url': "pipefy/database/301582775/update_record", 'name': "Update Record Detalhe Serviço"},
    {'id': 301582775, 'action': "card.delete" , 'url': "pipefy/database/301582775/delete_record", 'name': "Delete Record Detalhe Serviço"},
    
    # DATABASE CADASTRO INSTITUIÇÕES RAZÃO SOCIAL ["FINALIZADO ADRIANO"]
    {'id': 1137085, 'action': "card.create" , 'url': "pipefy/database/1137085/create_record", 'name': "Create Record Inst. Razão Social"}, 
    {'id': 1137085, 'action': "card.field_update" , 'url': "pipefy/database/1137085/update_record", 'name': "Update Record Inst. Razão Social"},
    {'id': 1137085, 'action': "card.delete" , 'url': "pipefy/database/1137085/delete_record", 'name': "Delete Record Inst. Razão Social"},

    # DATABASE CADASTRO INSTITUIÇÕES PARCEIRAS ["FINALIZADO ADRIANO"]
    {'id': 1137087, 'action': "card.create" , 'url': "pipefy/database/1137087/create_record", 'name': "Create Record Inst. Parceiras"}, 
    {'id': 1137087, 'action': "card.field_update" , 'url': "pipefy/database/1137087/update_record", 'name': "Update Record Inst. Parceiras"},
    {'id': 1137087, 'action': "card.delete" , 'url': "pipefy/database/1137087/delete_record", 'name': "Delete Record Inst. Parceiras"},

    # DATABASE OPERAÇÕES CONTRATADAS ["FINALIZADO ADRIANO"]
    {'id': 1139735, 'action': "card.create" , 'url': "pipefy/database/1139735/create_record", 'name': "Create Record Operações"}, 
    {'id': 1139735, 'action': "card.field_update" , 'url': "pipefy/database/1139735/update_record", 'name': "Update Record Operações"},
    {'id': 1139735, 'action': "card.delete" , 'url': "pipefy/database/1139735/delete_record", 'name': "Delete Record Operações"},

    # DATABASE CADASTRO DE IMÓVEIS RURAIS ["FINALIZADO ADRIANO"]
    {'id': 1213951, 'action': "card.create" , 'url': "pipefy/database/1213951/create_record", 'name': "Create Record Imóvel Rural"}, 
    {'id': 1213951, 'action': "card.field_update" , 'url': "pipefy/database/1213951/update_record", 'name': "Update Record Imóvel Rural"},
    {'id': 1213951, 'action': "card.delete" , 'url': "pipefy/database/1213951/delete_record", 'name': "Delete Record Imóvel Rural"},

    # DATABASE REGIMES DE EXPLORAÇÃO ["FINALIZADO ADRIANO"]
    {'id': 1214186, 'action': "card.create" , 'url': "pipefy/database/1214186/create_record", 'name': "Create Record Regime Exploração"}, 
    {'id': 1214186, 'action': "card.field_update" , 'url': "pipefy/database/1214186/update_record", 'name': "Update Record Regime Exploração"},
    {'id': 1214186, 'action': "card.delete" , 'url': "pipefy/database/1214186/delete_record", 'name': "Delete Record Regime Exploração"},

    # DATABASE CADASTRO PESSOAL ["FINALIZADO ADRIANO"]
    {'id': 1136264, 'action': "card.create" , 'url': "pipefy/database/1136264/create_record", 'name': "Create Record Cadastro Pessoal"}, 
    {'id': 1136264, 'action': "card.field_update" , 'url': "pipefy/database/1136264/update_record", 'name': "Update Record Cadastro Pessoal"},
    {'id': 1136264, 'action': "card.delete" , 'url': "pipefy/database/1136264/delete_record", 'name': "Delete Record Cadastro Pessoal"},

    # DATABASE CADASTRO COLABORADOR E FORNECEDORES ["FINALIZADO ADRIANO"]
    {'id': 1260853, 'action': "card.create" , 'url': "pipefy/database/1260853/create_record", 'name': "Create Record Cadastro Pessoal"}, 
    {'id': 1260853, 'action': "card.field_update" , 'url': "pipefy/database/1260853/update_record", 'name': "Update Record Cadastro Pessoal"},
    {'id': 1260853, 'action': "card.delete" , 'url': "pipefy/database/1260853/delete_record", 'name': "Delete Record Cadastro Pessoal"},

    #PIPE PRODUTOS ["FINALIZADO ADRIANO"]
    {'id': 301573538, 'action': "card.create" , 'url': "pipefy/pipe/301573538/create_card", 'name': "Create Card Pagamentos"}, 
    {'id': 301573538, 'action': "card.field_update" , 'url': "pipefy/pipe/301573538/update_card", 'name': "Update Card Pagamentos"},
    {'id': 301573538, 'action': "card.move" , 'url': "pipefy/pipe/301573538/move_card", 'name': "Move Card Pagamentos"},
    {'id': 301573538, 'action': "card.delete" , 'url': "pipefy/pipe/301573538/delete_card", 'name': "Delete Card Pagamentos"},

    #PIPE PROSPECT ["FINALIZADO ADRIANO"]
    {'id': 301573049, 'action': "card.create" , 'url': "pipefy/pipe/301573049/create_card", 'name': "Create Card Prospect"}, 
    {'id': 301573049, 'action': "card.field_update" , 'url': "pipefy/pipe/301573049/update_card", 'name': "Update Card Prospect"},
    {'id': 301573049, 'action': "card.move" , 'url': "pipefy/pipe/301573049/move_card", 'name': "Move Card Prospect"},
    {'id': 301573049, 'action': "card.delete" , 'url': "pipefy/pipe/301573049/delete_card", 'name': "Delete Card Prospect"},

    # DATABASE CADASTRO PROSPECTS ["FINALIZADO ADRIANO"]
    {'id': 1139554, 'action': "card.create" , 'url': "pipefy/database/1139554/create_record", 'name': "Create Record Cad Prospect"}, 
    {'id': 1139554, 'action': "card.field_update" , 'url': "pipefy/database/1139554/update_record", 'name': "Update Cad Prospect"},
    {'id': 1139554, 'action': "card.delete" , 'url': "pipefy/database/1139554/delete_record", 'name': "Delete Record Cad Prospect"},

    # DATABASE CONTAS BANCÁRIAS CLIENTES
    {'id': 302802605, 'action': "card.create" , 'url': "'pipefy/database/302802605/create_record'", 'name': "Create Record Contas Clientes"},
    {'id': 302802605, 'action': "card.field_update" , 'url': "'pipefy/database/302802605/update_record'", 'name': "Update Record Contas Clientes"}, 
    {'id': 302802605, 'action': "card.delete" , 'url': "'pipefy/database/302802605/delete_record'", 'name': "Delete Record Contas Clientes"},

    # DATABASE PRODUTOS FRASSON
    {'id': 303917094, 'action': "card.create" , 'url': "'pipefy/database/303917094/create_record'", 'name': "Create Record Produtos"},
    {'id': 303917094, 'action': "card.field_update" , 'url': "'pipefy/database/303917094/update_record'", 'name': "Update Record Produtos"}, 
    {'id': 303917094, 'action': "card.delete" , 'url': "'pipefy/database/303917094/delete_record'", 'name': "Delete Record Contas Produtos"},
]
