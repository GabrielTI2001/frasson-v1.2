from django.shortcuts import render
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth.models import User
from users.models import Profile
from administrator.models import Testes
from pipefy.models import Cadastro_Pessoal, Card_Produtos, Imoveis_Rurais, Operacoes_Contratadas
from pipefy.models import Fornecedores_Colaboradores, Pipe, Contratos_Servicos, Card_Prospects
from finances.models import Cobrancas_Pipefy, Pagamentos_Pipefy
from datetime import datetime
from backend.settings import TOKEN_PIPEFY_API, URL_PIFEFY_API
import requests, json
from django.core.exceptions import ObjectDoesNotExist
from decimal import Decimal
from django.db.models import Subquery, OuterRef
from django.http import JsonResponse
from backend.pipefyUtils import ids_pipes

def call_api(id, page, endCursor):
    if page == 1:        
        if id in ids_pipes:
            payload = {"query":"{cards(pipe_id: "+str(id)+") {pageInfo{endCursor hasNextPage} edges {node {id url due_date current_phase {name id} createdAt fields {native_value float_value array_value field{id}}}}}}"}
        else:
            payload = {"query":"{table_records(table_id: "+str(id)+") {pageInfo{endCursor hasNextPage} edges {node {id created_at url due_date record_fields {native_value array_value field{id}}}}}}"}
    else:
        if id in ids_pipes:
            payload = {"query":"{cards(pipe_id: "+str(id)+", after:\"" + endCursor + "\") {pageInfo{endCursor hasNextPage} edges {node {id url current_phase {name id} createdAt fields {native_value float_value array_value field{id}}}}}}"}
        else:
            payload = {"query": "{table_records(table_id: "+str(id)+", after:\"" + endCursor + "\") {pageInfo{endCursor hasNextPage} edges {node {id created_at url record_fields {native_value array_value field{id}}}}}}"}
    headers = {"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"}
    response = requests.post(URL_PIFEFY_API, json=payload, headers=headers)
    obj = json.loads(response.text)
    return obj

@login_required
@permission_required('administrator.ver_administrator', raise_exception=True)
def index_administrator_panel(request):
    users_count = User.objects.all().count()
    context = {
        'users_count': users_count,
    }

    return JsonResponse(context)

@login_required
@permission_required('administrator.ver_administrator', raise_exception=True)
def index_administrator_tests(request):
    subquery = Testes.objects.filter(pipe_id=OuterRef('id')).order_by('-updated_at').values('updated_at')[:1]
    cadastro_pipes_queryset = Pipe.objects.annotate(last_test_updated_at=Subquery(subquery))
    pipes = [
     {
        'nome': p.name, 
        'last_test': p.last_test_updated_at.strftime("%d/%m/%Y %H:%M:%S")if p.last_test_updated_at != None else "-",
        'url': '/administrator/tests/'+('pipe/' if p.type == 'P' else 'database/') + str(p.id)
     } for p in cadastro_pipes_queryset]
    context = {
        'pipes': pipes,
    }
    return JsonResponse(context)


# @login_required
# @permission_required('administrator.ver_administrator', raise_exception=True)
def test_cadpessoal(request):
    correspond = {'nome_do_cliente':'razao_social', 'endere_o':'endereco', 'cpf':'cpf_cnpj',
                  'munic_pio':'municipio', 'uf':'uf', 'contato':'contato1', 'contato_2':'contato2',
                  'natureza':'natureza', 'cep':'cep', 'identidade':'numero_rg',
                  'data_de_nascimento':'data_nascimento', 'e_mail':'email', 'profiss_o':'profissao',
                  'grupo_1':'grupo_id'}
    hasNextPage = True
    page = 1
    missing = []
    desatualizados = []
    endCursor = None
    regssql = Cadastro_Pessoal.objects.all()

    while hasNextPage:     
        obj = call_api(1136264, page, endCursor)
        print(obj)
        endCursor = obj["data"]["table_records"]["pageInfo"]["endCursor"]
        hasNextPage = obj["data"]["table_records"]["pageInfo"]["hasNextPage"]
        edges = obj["data"]["table_records"]["edges"]
        qtd = len(obj["data"]["table_records"]["edges"]) 
        for edge in edges:
            fields = edge["node"]["record_fields"]
            url = edge["node"]["url"]
            id_card = edge["node"]["id"]
            createdAt = edge["node"]["created_at"]
            qtdnobd = regssql.filter(id=id_card)
            if len(qtdnobd) == 0:
                missing.append(id_card)
            else:
                currentreg = regssql.values().get(id=id_card)
                recordsql = regssql.get(id=id_card)
                socios = recordsql.socios.all()
                for field in fields:
                    field_id = field["field"]["id"]
                    if field_id == 'grupo_1':
                        valor = field["array_value"]
                        if len(valor) > 0:                 
                            valor = field["array_value"][0]
                        else:
                            valor = None
                    elif field_id == 's_cios':
                        valor = [int(v) for v in field['array_value']]
                        ids_socios = [c.id for c in socios]
                        if len(valor) > 0:
                            if(set(valor) != set(ids_socios)):
                                # recordsql.socios.set(valor)
                                desatualizados.append({'id':id_card,'campo':field_id})
                    else:
                        valor = field["native_value"]
                    if field_id in correspond:
                        current_value = str(currentreg[correspond[field_id]]) if currentreg[correspond[field_id]] is not None else None
                        if valor != current_value:
                            desatualizados.append({'id':id_card,'campo':field_id})
        #     break
        # break
        page += 1
    
    try:
        pipe = Testes.objects.get(pipe=1136264)
        pipe.updated_at = datetime.now()
        pipe.save()
    except ObjectDoesNotExist:
        Testes.objects.create(
            pipe_id = 1136264
        )
    response_data = {
        'missings': missing,
        'wrongs': desatualizados,
        'title': 'Teste Database Cadastro Pessoal'
    }

    return JsonResponse(response_data)


# @login_required
# @permission_required('administrator.ver_administrator', raise_exception=True)
def test_pipeprodutos(request):
    correspond = {'card':'card', 'detalhamento_demanda_2':'detalhamento_id', 
        'institui_o_vinculada':'instituicao_id', 
        'contrato_vinculado':'contrato_id', 'valor_da_opera_o':'valor_operacao',
        'current_phase_id':'phase_id', 'current_phase_name':'phase_name',
        }
    hasNextPage = True
    endCursor = None
    page = 1
    missing = []
    desatualizados = []
    regssql = Card_Produtos.objects.all()
 
    while hasNextPage:    
        obj = call_api(301573538, page, endCursor)
        endCursor = obj["data"]["cards"]["pageInfo"]["endCursor"]
        hasNextPage = obj["data"]["cards"]["pageInfo"]["hasNextPage"]
        edges = obj["data"]["cards"]["edges"]

        for edge in edges:
            id_card = edge["node"]["id"]
            url = edge["node"]["url"]
            createdAt = edge["node"]["createdAt"]
            current_phase_id = int(edge["node"]["current_phase"]["id"])
            current_phase_name = edge["node"]["current_phase"]["name"]
            card_fields = edge["node"]["fields"]
            qtdnobd = regssql.filter(id=id_card)
            if len(qtdnobd) == 0:
                missing.append(id_card)
            else:
                cardsql = regssql.get(id=id_card)
                current_cardsql = regssql.values().get(id=id_card)
                beneficiarios = cardsql.beneficiario.values('id').all()
                if current_phase_id != current_cardsql['phase_id']:
                    desatualizados.append({'id':id_card,'campo':'phase_id'})
                if current_phase_name != current_cardsql['phase_name']:
                    desatualizados.append({'id':id_card,'campo':'phase_name'})

                for field in card_fields:
                    field_id = field["field"]["id"]
                    if field["field"]["id"] in ['contrato_vinculado', 'institui_o_vinculada', 'detalhamento_demanda_2']:
                        valor = int(field["array_value"][0]) if len(field["array_value"]) > 0 else None
                    elif field["field"]["id"] == 'benefici_rio_s':
                        valor = [int(b) for b in field["array_value"]]
                        ids_bens = [b["id"] for b in beneficiarios]
                        if len(valor) > 0:
                            if(set(valor) != set(ids_bens)):
                                desatualizados.append({'id':id_card,'campo':field_id})
                        else:
                            current_value = beneficiarios if len(beneficiarios) > 0 else None
                            if None != current_value:
                                desatualizados.append({'id':id_card,'campo':field_id})
                    elif field["field"]["id"] in ['valor_da_opera_o']:
                        valor = field["float_value"]
                        valor = round(Decimal(valor), 2)
                    else:
                        valor = field["native_value"]
                    if field_id in correspond: 
                        current_value = current_cardsql[correspond[field_id]] if current_cardsql[correspond[field_id]] is not None else None
                        if valor != current_value:
                            desatualizados.append({'id':id_card,'campo':field_id})
        # break        
        page += 1
    
    try:
        pipe = Testes.objects.get(pipe=301573538)
        pipe.updated_at = datetime.now()
        pipe.save()
    except ObjectDoesNotExist:
        Testes.objects.create(
            pipe_id = 301573538
        )
   
    response_data = {
        'missings': missing,
        'wrongs': desatualizados,
        'title': 'Teste Pipes Produtos'
    }

    return JsonResponse(response_data)


# @login_required
# @permission_required('administrator.ver_administrator', raise_exception=True)
def test_pipecobrancas(request):
    correspond = {'cliente':'cliente_id', 'contrato':'contrato_id', 'etapa_cobran_a':'etapa_cobranca',
        'detalhe_demanda':'detalhamento_id', 'valor_final_contratado':'valor_operacao', 
        'percentual_contratado':'percentual_contratado', 'data_pagamento':'data_pagamento',
        'saldo_devedor':'saldo_devedor', 'valor_final_faturado':'valor_faturado',
        'faturado_no_caixa':'caixa_id', 'current_phase_id': 'phase_id',
        'current_phase_name':'phase_name',
    }
    hasNextPage = True
    endCursor = None
    page = 1
    missing = []
    desatualizados = []
    regssql = Cobrancas_Pipefy.objects.all()
    while hasNextPage:    
        obj = call_api(302821542, page, endCursor)
        endCursor = obj["data"]["cards"]["pageInfo"]["endCursor"]
        hasNextPage = obj["data"]["cards"]["pageInfo"]["hasNextPage"]
        edges = obj["data"]["cards"]["edges"]

        for edge in edges:
            id_card = edge["node"]["id"]
            url = edge["node"]["url"]
            createdAt = edge["node"]["createdAt"]
            current_phase_id = int(edge["node"]["current_phase"]["id"])
            current_phase_name = edge["node"]["current_phase"]["name"]
            card_fields = edge["node"]["fields"]
            qtdnobd = regssql.filter(id=id_card)
            if len(qtdnobd) == 0:
                missing.append(id_card)
            else:
                current_cardsql = regssql.values().get(id=id_card)
                if current_phase_id != current_cardsql['phase_id']:
                    desatualizados.append({'id':id_card,'campo':'phase_id'})
                if current_phase_name != current_cardsql['phase_name']:
                    desatualizados.append({'id':id_card,'campo':'phase_name'})

                for field in card_fields:
                    field_id = field["field"]["id"]
                    if field["field"]["id"] in ['cliente', 'contrato', 'detalhe_demanda', 'faturado_no_caixa']:
                        valor = int(field["array_value"][0]) if len(field["array_value"]) > 0 else None
                    elif field["field"]["id"] in ['saldo_devedor', 'valor_final_faturado', 'percentual_contratado', 'valor_final_contratado']:
                        valor = field["float_value"]
                        valor = round(Decimal(valor), 2) if valor != None else None
                    elif field["field"]["id"] in ['data_pagamento']:
                        valor = datetime.strptime(field["native_value"].split(" ")[0], '%Y-%m-%d').date()
                    else:
                        valor = field["native_value"]
                    if field_id in correspond: 
                        current_value = current_cardsql[correspond[field_id]] if current_cardsql[correspond[field_id]] is not None else None
                        if valor != current_value:
                            desatualizados.append({'id':id_card,'campo':field_id})
        #     break
        # if page == 3:
        #     break
        page += 1

    try:
        pipe = Testes.objects.get(pipe=302821542)
        pipe.updated_at = datetime.now()
        pipe.save()
    except ObjectDoesNotExist:
        Testes.objects.create(
            pipe_id = 302821542
        ) 

    response_data = {
        'missings': missing,
        'wrongs': desatualizados,
        'title': 'Teste Pipe Cobranças'
    }
    return JsonResponse(response_data)


# @login_required
# @permission_required('administrator.ver_administrator', raise_exception=True)
def test_pipepagamentos(request):
    correspond = { 'benefici_rio_pagamento':'beneficiario_id', 'descri_o':'descricao',
        'detalhamento':'detalhamento', 'valor_pagamento':'valor_pagamento', 
        'data_vencimento':'data_vencimento', 'data_pagamento':'data_pagamento', 
        'caixa_sa_da':'caixa_id', 'categoria_pagamento':'categoria_id', 
        'current_phase_id': 'phase_id', 'current_phase_name':'phase_name'
    }
    hasNextPage = True
    endCursor = None
    page = 1
    missing = []
    desatualizados = []
    regssql = Pagamentos_Pipefy.objects.all()
    while hasNextPage:    
        obj = call_api(302757413, page, endCursor)
        endCursor = obj["data"]["cards"]["pageInfo"]["endCursor"]
        hasNextPage = obj["data"]["cards"]["pageInfo"]["hasNextPage"]
        edges = obj["data"]["cards"]["edges"]

        for edge in edges:
            id_card = edge["node"]["id"]
            url = edge["node"]["url"]
            createdAt = edge["node"]["createdAt"]
            current_phase_id = int(edge["node"]["current_phase"]["id"])
            current_phase_name = edge["node"]["current_phase"]["name"]
            card_fields = edge["node"]["fields"]
            qtdnobd = regssql.filter(id=id_card)
            if len(qtdnobd) == 0:
                missing.append(id_card)
            else:
                current_cardsql = regssql.values().get(id=id_card)
                if current_phase_id != current_cardsql['phase_id']:
                    desatualizados.append({'id':id_card,'campo':'phase_id'})
                if current_phase_name != current_cardsql['phase_name']:
                    desatualizados.append({'id':id_card,'campo':'phase_name'})

                for field in card_fields:
                    field_id = field["field"]["id"]
                    if field["field"]["id"] in ['benefici_rio_pagamento', 'categoria_pagamento', 'caixa_sa_da']:
                        valor = int(field["array_value"][0]) if len(field["array_value"]) > 0 else None
                    elif field["field"]["id"] in ['valor_pagamento']:
                        valor = field["float_value"]
                        valor = round(Decimal(valor), 2) if valor != None else None
                    elif field["field"]["id"] in ['data_pagamento', 'data_vencimento']:
                        valor = datetime.strptime(field["native_value"].split(" ")[0], '%Y-%m-%d').date()
                    else:
                        valor = field["native_value"]
                    if field_id in correspond: 
                        current_value = current_cardsql[correspond[field_id]] if current_cardsql[correspond[field_id]] is not None else None
                        if valor != current_value:
                            desatualizados.append({'id':id_card,'campo':field_id})
        #     break
        # if page == 2:
        #     break
        page += 1
   
    try:
        pipe = Testes.objects.get(pipe=302757413)
        pipe.updated_at = datetime.now()
        pipe.save()
    except ObjectDoesNotExist:
        Testes.objects.create(
            pipe_id = 302757413
        ) 
   
    response_data = {
        'missings': missing,
        'wrongs': desatualizados,
        'title': 'Teste Pipe Pagamentos'
    }
    return JsonResponse(response_data)

# @login_required
# @permission_required('administrator.ver_administrator', raise_exception=True)
def test_cadimoveisrurais(request):
    correspond = {'o_qu':'nome_imovel', 'matr_cula':'matricula_imovel', 'propriet_rio_do_im_vel':'proprietario_id',
        'livro_de_registro':'livro_registro', 'n_mero_do_registro':'numero_registro', 'uf':'uf_localizacao',
        'data_do_registro':'data_registro','munic_pio_do_im_vel':'municipio_localizacao',
        'cep':'cep_localizacao', 't_tulo_de_posse_do_im_vel':'titulo_posse', 'nirf':'nirf', 'n_mero_ccir':'ccir',
        'registro_car':'car', 'rea_total_do_im_vel':'area_total', 'm_dulos_fiscais':'modulos_fiscais',
        'rea_de_reserva_legal':'area_reserva', 'localiza_o_da_reserva':'localizacao_reserva', 'rea_de_app':'area_app',
        'rea_de_vegeta_o_nativa':'area_veg_nat', 'rea_explorada':'area_explorada', 'roteiro_de_acesso':'roteiro_acesso'
    }
    hasNextPage = True
    endCursor = None
    page = 1
    missing = []
    desatualizados = []
    regssql = Imoveis_Rurais.objects.values().all()

    while hasNextPage:     
        obj = call_api(1213951, page, endCursor)
        endCursor = obj["data"]["table_records"]["pageInfo"]["endCursor"]
        hasNextPage = obj["data"]["table_records"]["pageInfo"]["hasNextPage"]
        edges = obj["data"]["table_records"]["edges"]
        for edge in edges:
            record_fields = edge["node"]["record_fields"]
            url = edge["node"]["url"]
            id_card = edge["node"]["id"]
            createdAt = edge["node"]["created_at"]
            qtdnobd = regssql.filter(id=id_card)
            if len(qtdnobd) == 0:
                missing.append(id_card)
            else:
                currentreg = regssql.get(id=id_card)
                for field in record_fields:
                    field_id = field["field"]["id"] 
                    if field_id == 'propriet_rio_do_im_vel':
                        valor = field["array_value"]
                        if valor != None and len(valor) > 0:                 
                            valor = field["array_value"][0]
                        else:
                            valor = None
                    elif field_id in['rea_total_do_im_vel', 'm_dulos_fiscais', 'rea_de_app', 'rea_de_vegeta_o_nativa', 'rea_explorada', 'rea_de_reserva_legal']:
                        valor = field["native_value"]
                        valor = round(Decimal(valor), 4) if valor != None else None
                        valor = str(valor) if valor != None else None
                    else:
                        valor = field["native_value"]
                    if field_id in correspond:
                        current_value = str(currentreg[correspond[field_id]]) if currentreg[correspond[field_id]] is not None else None
                        if valor != current_value:
                            # print(f"{valor} {type(valor)} {current_value} {type(current_value)}")
                            desatualizados.append({'id':id_card,'campo':field_id})
            # break
        # if page == 2:
        #     break
        page += 1
    try:
        pipe = Testes.objects.get(pipe=1213951)
        pipe.updated_at = datetime.now()
        pipe.save()
    except ObjectDoesNotExist:
        Testes.objects.create(
            pipe_id = 1213951
        )   
    response_data = {
        'missings': missing,
        'wrongs': desatualizados,
        'title': 'Teste Database Imóveis Rurais'
    }
    return JsonResponse(response_data)


# @login_required
# @permission_required('administrator.ver_administrator', raise_exception=True)
def test_cadopercontratadas(request):
    correspond = {'nome':'beneficiario_id', 'n_da_opera_o':'numero_operacao', 'fonte_do_recurso':'fonte_recurso',
        'item_financiado':'item_financiado_id', 'valor_da_opera_o':'valor_operacao', 'safra':'safra',
        'rea_total_beneficiada':'area_beneficiada', 'institui_o_financeira':'instituicao_id',
        'im_vel_ies':'imovel_beneficiado', 'data_da_emiss_o_da_c_dula':'data_emissao_cedula',
        'data_do_primeiro_vencimento':'data_primeiro_vencimento', 'data_do_vencimento':'data_vencimento',
        'data_para_apresenta_o_de_dec_prod_armazenado':'data_prod_armazenado', 'taxa_juros':'taxa_juros'
    }
    hasNextPage = True
    endCursor = None
    page = 1
    missing = []
    desatualizados = []
    regssql = Operacoes_Contratadas.objects.values().all()

    while hasNextPage:     
        obj = call_api(1139735, page, endCursor)
        endCursor = obj["data"]["table_records"]["pageInfo"]["endCursor"]
        hasNextPage = obj["data"]["table_records"]["pageInfo"]["hasNextPage"]
        edges = obj["data"]["table_records"]["edges"]
        for edge in edges:
            record_fields = edge["node"]["record_fields"]
            url = edge["node"]["url"]
            id_card = edge["node"]["id"]
            createdAt = edge["node"]["created_at"]
            qtdnobd = regssql.filter(id=id_card)
            if len(qtdnobd) == 0:
                missing.append(id_card)
            else:
                currentreg = regssql.get(id=id_card)
                for field in record_fields:
                    field_id = field["field"]["id"] 
                    if field_id in ['nome', 'item_financiado', 'institui_o_financeira']:
                        valor = field["array_value"][0] if field["array_value"] != None else None
                    elif field_id in['percentual_do_contrato_gc', 'valor_do_contrato',]:
                        valor = field["float_value"]
                        valor = round(Decimal(valor), 4) if valor != None else None
                    elif field_id in ['rea_total_beneficiada', 'taxa_juros', 'valor_da_opera_o']:
                        valor = field["native_value"]
                        if field_id == 'taxa_juros':
                            valor = round(Decimal(valor), 4) if valor != None else None
                        else:
                            valor = round(Decimal(valor), 2) if valor != None else None
                        valor = str(valor) if valor != None else None
                    else:
                        valor = field["native_value"]
                    if field_id in correspond:
                        current_value = str(currentreg[correspond[field_id]]) if currentreg[correspond[field_id]] is not None else None
                        if valor != current_value:
                            desatualizados.append({'id':id_card,'campo':field_id})
            # break
        # if page == 2:
        page += 1
    try:
        pipe = Testes.objects.get(pipe=1139735)
        pipe.updated_at = datetime.now()
        pipe.save()
    except ObjectDoesNotExist:
        Testes.objects.create(
            pipe_id = 1139735
        )
    response_data = {
        'missings': missing,
        'wrongs': desatualizados,
        'title': 'Teste Database Operações Contratadas'
    }
    return JsonResponse(response_data)


# @login_required
# @permission_required('administrator.ver_administrator', raise_exception=True)
def test_cadcolabforn(request):
    correspond = {'nome':'razao_social', 'cpf_cnpj':'cpf_cnpj', 'endere_o':'endereco', 
        'bairro':'bairro', 'cep':'cep', 'munic_pio':'municipio', 'uf':'uf', 'contato_1':'contato_01',
        'nome_do_representante':'nome_representante', 'contato_2':'contato_02', 'e_mail':'email'
    }
    hasNextPage = True
    endCursor = None
    page = 1
    missing = []
    desatualizados = []
    regssql = Fornecedores_Colaboradores.objects.values().all()

    while hasNextPage:     
        obj = call_api(1260853, page, endCursor)
        endCursor = obj["data"]["table_records"]["pageInfo"]["endCursor"]
        hasNextPage = obj["data"]["table_records"]["pageInfo"]["hasNextPage"]
        edges = obj["data"]["table_records"]["edges"]
        for edge in edges:
            record_fields = edge["node"]["record_fields"]
            url = edge["node"]["url"]
            id_card = edge["node"]["id"]
            createdAt = edge["node"]["created_at"]
            qtdnobd = regssql.filter(id=id_card)
            if len(qtdnobd) == 0:
                missing.append(id_card)
            else:
                currentreg = regssql.get(id=id_card)
                for field in record_fields:
                    field_id = field["field"]["id"] 
                    valor = field["native_value"]
                    if field_id in correspond:
                        current_value = str(currentreg[correspond[field_id]]) if currentreg[correspond[field_id]] is not None else None
                        if valor != current_value:
                            # print(f"{valor} {type(valor)} {current_value} {type(current_value)}")
                            desatualizados.append({'id':id_card,'campo':field_id})
            # break
        # break
        page += 1
    try:
        pipe = Testes.objects.get(pipe=1260853)
        pipe.updated_at = datetime.now()
        pipe.save()
    except ObjectDoesNotExist:
        Testes.objects.create(
            pipe_id = 1260853
        )
    response_data = {
        'missings': missing,
        'wrongs': desatualizados,
        'title': 'Teste Database Colaboradores e Fornecedores'
    }

    return JsonResponse(response_data)


# @login_required
# @permission_required('administrator.ver_administrator', raise_exception=True)
def test_contr_servicos(request):
    correspond = {'contratante':'contratante_id', 'produto':'produto','detalhes_da_negocia_o':'detalhes_negociacao',
        'percentual_do_contrato_gc':'percentual_gc', 'valor_do_contrato':'valor_gai', 
        'data_da_assinatura':'data_assinatura', 'data_do_vencimento':'data_vencimento'
    }
    hasNextPage = True
    endCursor = None
    page = 1
    missing = []
    desatualizados = []
    regssql = Contratos_Servicos.objects.all()

    while hasNextPage:     
        obj = call_api(1136266, page, endCursor)
        endCursor = obj["data"]["table_records"]["pageInfo"]["endCursor"]
        hasNextPage = obj["data"]["table_records"]["pageInfo"]["hasNextPage"]
        edges = obj["data"]["table_records"]["edges"]
        qtd = len(obj["data"]["table_records"]["edges"]) 
        for edge in edges:
            fields = edge["node"]["record_fields"]
            url = edge["node"]["url"]
            id_card = edge["node"]["id"]
            createdAt = edge["node"]["created_at"]
            qtdnobd = regssql.filter(id=id_card)
            if len(qtdnobd) == 0:
                missing.append(id_card)
            else:
                currentreg = regssql.values().get(id=id_card)
                recordsql = regssql.get(id=id_card)
                for field in fields:
                    field_id = field["field"]["id"]
                    if field_id == 'contratante':
                        valor = int(field["array_value"][0]) if field["array_value"] is not None or field["array_value"] != [] else None
                    elif field_id == 'membros_do_contrato':
                        valor = [int(v) for v in field['array_value']]
                        ids_membros = [m.id for m in recordsql.demais_membros.all()]
                        if len(valor) > 0:
                            if(set(valor) != set(ids_membros)):
                                # recordsql.demais_membros.set(valor)
                                desatualizados.append({'id':id_card,'campo':field_id})
                    elif field_id == 'detalhamento_da_s_demanda_s':
                        valor = [int(v) for v in field['array_value']]
                        ids_servicos = [s.id for s in recordsql.servicos_contratados.all()]
                        if len(valor) > 0:
                            if(set(valor) != set(ids_servicos)):
                                # recordsql.servicos_contratados.set(valor)
                                desatualizados.append({'id':id_card,'campo':field_id})
                    elif field_id in ['data_do_vencimento', 'data_da_assinatura']:
                        valor = datetime.strptime(field["native_value"].split(" ")[0], '%Y-%m-%d').date()
                    elif field_id in ['valor_do_contrato', 'percentual_do_contrato_gc']:
                        valor = Decimal(field["native_value"])
                        valor = round(valor, 2) if field_id == 'valor_do_contrato' else float(round(valor, 2))
                    else:
                        valor = field["native_value"]
                    if field_id in correspond:
                        current_value = currentreg[correspond[field_id]] if currentreg[correspond[field_id]] is not None else None
                        if valor != current_value:
                            # print(f"{valor} {type(valor)} {current_value} {type(current_value)}")
                            desatualizados.append({'id':id_card,'campo':field_id})
            # break
        # break
        page += 1
    
    try:
        pipe = Testes.objects.get(pipe=1136266)
        pipe.updated_at = datetime.now()
        pipe.save()
    except ObjectDoesNotExist:
        Testes.objects.create(
            pipe_id = 1136266
        )
    response_data = {
        'missings': missing,
        'wrongs': desatualizados,
        'title': 'Teste Database Cadastro Contrato Prestação de Serviços'
    }

    return JsonResponse(response_data)

# @login_required
# @permission_required('administrator.ver_administrator', raise_exception=True)
def test_pipeprospects(request):
    correspond = {'prospect_2':'prospect_id', 'produto':'produto', 'classifica_o_prospect':'classificacao',
        'origem':'origem', 'valor_inicial_da_proposta':'proposta_inicial', 'valor_aprovado':'proposta_aprovada', 
        'percentual_proposto':'percentual_inicial', 'percentual_aprovado':'percentual_aprovado'
    }
    fields_resps = ['respons_vel', 'respons_vel_pelo_contato_incial', 'respons_vel_pelo_back_office','respons_vel_pela_an_lise_t_cnica', 'prazo_para_a_litec',
        'respons_vel_pela_proposta_de_valor', 'respons_vel_pela_proposta_de_valor_1', 'respons_vel_pelo_encerramento']
    fields_venc = {'START':'prazo_para_encaminhamento', 'CONTATO INICIAL':'prazo_para_o_contato_inicial', 'BACK OFFICE':'prazo_para_o_back_office', 
        'ANÁLISE E PROCESSAMENTO':'prazo_para_a_an_lise_e_processamento', 'ANÁLISE TÉCNICA':'prazo_para_a_litec_1', 'PROPOSTA DE VALOR':'prazo_para_a_proposta_de_valor', 
        'MINUTA CONTRATO':'prazo_para_a_proposta_de_valor_1', 'ENCERRAMENTO':'prazo_para_encerramento', 'CONCLUÍDO':'prazo_para_encerramento', 'PERDIDO':'prazo_para_encerramento',
        'GANHO':'prazo_para_encerramento', 'CANCELADO':'prazo_para_encerramento'}
    index_resp = 0
    hasNextPage = True
    endCursor = None
    page = 1
    missing = []
    desatualizados = []
    regssql = Card_Prospects.objects.all()
 
    while hasNextPage:    
        obj = call_api(301573049, page, endCursor)
        endCursor = obj["data"]["cards"]["pageInfo"]["endCursor"]
        hasNextPage = obj["data"]["cards"]["pageInfo"]["hasNextPage"]
        edges = obj["data"]["cards"]["edges"]

        for edge in edges:
            id_card = edge["node"]["id"]
            url = edge["node"]["url"]
            createdAt = edge["node"]["createdAt"]
            current_phase_id = int(edge["node"]["current_phase"]["id"])
            current_phase_name = edge["node"]["current_phase"]["name"]
            due_date = edge['node']['due_date']
            card_fields = edge["node"]["fields"]
            qtdnobd = regssql.filter(id=id_card)
            if len(qtdnobd) == 0:
                missing.append(id_card)
            else:
                recordsql = regssql.get(id=id_card)
                current_cardsql = regssql.values().get(id=id_card)
                if current_phase_id != current_cardsql['phase_id']:
                    desatualizados.append({'id':id_card,'campo':'phase_id'})
                if current_phase_name != current_cardsql['phase_name']:
                    desatualizados.append({'id':id_card,'campo':'phase_name'})

                for field in card_fields:
                    field_id = field["field"]["id"]
                    if field_id == 'prospect_2':
                        valor = int(field["array_value"][0]) if len(field["array_value"]) > 0 else None
                    elif field_id in fields_resps:
                        valor = [int(v) for v in field['array_value']]
                        index = fields_resps.index(field_id)
                        # print(f"{index} {index_resp} {field_id}")
                        ids_perfis = [p.pipefy_id for p in recordsql.responsavel.all()]
                        if index >= index_resp:
                            if(set(valor) != set(ids_perfis)):
                                # print(valor, " ", ids_perfis)
                                try:
                                    new_perfis = [Profile.objects.get(pipefy_id=v).id for v in valor]
                                    # if field_id == 'respons_vel_pelo_encerramento':
                                        # recordsql.responsavel.set(new_perfis)
                                    desatualizados.append({'id':id_card,'campo':field_id})
                                except ObjectDoesNotExist:
                                    pass
                            if desatualizados and {'id':id_card, 'campo':fields_resps[index_resp]} in desatualizados:
                                desatualizados.remove({'id':id_card, 'campo':fields_resps[index_resp]})
                            index_resp = index
                    elif current_phase_name in fields_venc.keys() and field_id == fields_venc[current_phase_name]:
                        valor = field["native_value"]
                        if datetime.strptime(valor[:19], '%Y-%m-%d %H:%M:%S') != current_cardsql['data_vencimento']:
                                print(f"{datetime.strptime(valor[:19], '%Y-%m-%d %H:%M:%S')} {current_cardsql['data_vencimento']}")
                                print(f"{id_card} {field_id}")
                                # recordsql.data_vencimento = valor[:19]
                                # recordsql.save()
                                desatualizados.append({'id':id_card,'campo':field_id})
                    elif field_id  in ['valor_inicial_da_proposta', 'valor_aprovado', 'percentual_aprovado', 'percentual_proposto']:
                        valor = field["float_value"]
                        valor = round(Decimal(valor), 2)
                    else:
                        valor = field["native_value"]
                    if field_id in correspond: 
                        current_value = current_cardsql[correspond[field_id]] if current_cardsql[correspond[field_id]] is not None else None
                        if valor != current_value:
                            # print(f"{valor} {type(valor)} {current_value} {type(current_value)}")
                            desatualizados.append({'id':id_card,'campo':field_id})
            index_resp = 0
        #     break
        # break
        page += 1
    
    try:
        pipe = Testes.objects.get(pipe=301573049)
        pipe.updated_at = datetime.now()
        pipe.save()
    except ObjectDoesNotExist:
        Testes.objects.create(
            pipe_id = 301573049
        )
   
    response_data = {
        'missings': missing,
        'wrongs': desatualizados,
        'title': 'Teste Pipes Prospects'
    }

    return JsonResponse(response_data)