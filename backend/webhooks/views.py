from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from backend.pipefyUtils import getData, criar_registro_db
from . import utilities
from pipefy.models import Instituicoes_Parceiras, Instituicoes_Razao_Social, Operacoes_Contratadas, Grupos_Clientes
from pipefy.models import Card_Produtos, Card_Prospects, Cadastro_Pessoal, Fornecedores_Colaboradores, Imoveis_Rurais, Cadastro_Produtos
from pipefy.models import Itens_Financiados, Cadastro_Prospects, Detalhamento_Servicos, Contratos_Servicos, ContasBancarias_Clientes
from finances.models import Pagamentos_Pipefy, Cobrancas_Pipefy, Categorias_Pagamentos, Caixas_Frasson
import json
from datetime import datetime

@csrf_exempt
def webhooks_pipe_create_card(request, id):
    obj = json.loads(request.body)
    id_record = obj["data"]["card"]["id"] #get new id created
    data = getData(id_record, id)
    criar_registro_db(id, data)
    return JsonResponse({'message': 'Webhook status ok'})

@csrf_exempt
def webhooks_pipe_update_card(request, id):
    obj = json.loads(request.body)
    id_card = int(obj["data"]["card"]["id"])
    id_field_updated = obj["data"]["field"]["id"]
    new_value_updated = obj["data"]["new_value"]
    if id == 301573538:
        utilities.updateCardProdutos(id_card, id_field_updated, new_value_updated)
    elif id == 301573049:
        utilities.updateCardProspects(id_card, id_field_updated, new_value_updated)
    elif id == 302757413:
        utilities.updateCardPagamento(id_card, id_field_updated, new_value_updated)
    elif id == 302821542:
        utilities.updateCardCobrancas(id_card, id_field_updated, new_value_updated)
    return JsonResponse({'message': 'Webhook status ok'})

@csrf_exempt
def webhooks_pipe_move_card(request, id):
    obj = json.loads(request.body)
    id_card = obj["data"]["card"]["id"]
    new_phase_id = obj["data"]["to"]["id"]
    if id == 301573538:
        Card_Produtos.objects.filter(pk=id_card).update(**{'phase_id': new_phase_id})
    elif id == 301573049:
        Card_Prospects.objects.filter(pk=id_card).update(**{'phase_id': new_phase_id})
    elif id == 302757413:
        Pagamentos_Pipefy.objects.filter(pk=id_card).update(**{'phase_id': new_phase_id})
    elif id == 302821542:
        Cobrancas_Pipefy.objects.filter(pk=id_card).update(**{'phase_id': new_phase_id})
    return JsonResponse({'message': 'Webhook status ok'})

@csrf_exempt
def webhooks_pipe_delete_card(request, id):
    obj = json.loads(request.body)
    id_card = obj["data"]["card"]["id"]
    try:
        if id == 301573538:
            card = Card_Produtos.objects.get(pk=id_card).delete()
        elif id == 301573049:
            card = Card_Prospects.objects.get(pk=id_card).delete()
        elif id == 302757413:
            card = Pagamentos_Pipefy.objects.get(pk=id_card).delete()
        elif id == 302821542:
            card = Cobrancas_Pipefy.objects.get(pk=id_card).delete()
        return JsonResponse({'message': 'Object deleted successfully'})
    except ObjectDoesNotExist:
        return JsonResponse({'message': 'Object not found'})
    


@csrf_exempt
def webhooks_database_create_record(request, id):
    obj = json.loads(request.body)
    id_record = obj["data"]["card"]["id"] #get new id created
    data = getData(id_record, id)
    criar_registro_db(id, data)
    return JsonResponse({'message': 'Webhook status ok'})

@csrf_exempt
def webhooks_database_update_record(request, id):
    obj = json.loads(request.body)
    id_card = int(obj["data"]["card"]["id"])
    id_field_updated = obj["data"]["field"]["id"]
    new_value_updated = obj["data"]["new_value"]

    if id == 1136264:
        pipefyMySQLFields = {
            'nome_do_cliente': 'razao_social', 'natureza': 'natureza', 'cpf': 'cpf_cnpj', 'identidade': 'numero_rg',
            'endere_o': 'endereco', 'munic_pio': 'municipio', 'uf': 'uf', 'cep': 'cep', 'data_de_nascimento': 'data_nascimento',
            'contato': 'contato1', 'contato_2': 'contato2', 'e_mail': 'email', 'grupo_1': 'grupo_id', 'profiss_o': 'profissao'
            }
        if id_field_updated in pipefyMySQLFields.keys(): #se o campo atualizado é um campo de interesse
            if id_field_updated in ['grupo_1']: #campos conectores chave estrangeira
                if len(new_value_updated) >= 1:
                    Cadastro_Pessoal.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: int(new_value_updated[0]), 'updated_at': datetime.now()}) 
            else:
                Cadastro_Pessoal.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})
        if id_field_updated == 's_cios':
            Cadastro_Pessoal.objects.get(pk=id_card).socios.set(new_value_updated)
    
    elif id == 1260853:
        pipefyMySQLFields = {
            'nome': 'razao_social', 'cpf_cnpj': 'cpf_cnpj', 'endere_o': 'endereco', 'bairro': 'bairro',
            'munic_pio': 'municipio', 'uf': 'uf', 'cep': 'cep', 'nome_do_representante': 'nome_representante',
            'contato_1': 'contato_01', 'contato_2': 'contato_02', 'e_mail': 'email'}
        if id_field_updated in pipefyMySQLFields.keys(): #se o campo atualizado é um campo de interesse
            Fornecedores_Colaboradores.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})
    
    elif id == 1214186:
        utilities.updateImovelRural(id_card, id_field_updated, new_value_updated)
    
    elif id == 1136266:
        pipefyMySQLFields = {
        'contratante': 'contratante_id', 'membros_do_contrato': 'demais_membros', 'detalhamento_da_s_demanda_s': 'servicos_contratados',
        'produto_frasson': 'produto_id', 'percentual_do_contrato_gc': 'percentual_gc', 'valor_do_contrato': 'valor_gai',
        'data_da_assinatura': 'data_assinatura', 'data_do_vencimento': 'data_vencimento', 'detalhes_da_negocia_o': 'detalhes_negociacao'}
        if id_field_updated in pipefyMySQLFields.keys(): #se o campo atualizado é um campo de interesse
            if id_field_updated in ['contratante', 'produto_frasson']: #campos conectores chave estrangeira
                if len(new_value_updated) >= 1:
                    Contratos_Servicos.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: int(new_value_updated[0]), 'updated_at': datetime.now()}) 
            elif id_field_updated == 'membros_do_contrato':
                if len(new_value_updated) >= 1:
                    Contratos_Servicos.objects.get(pk=id_card).demais_membros.set(new_value_updated)
            elif id_field_updated == 'detalhamento_da_s_demanda_s':
                if len(new_value_updated) >= 1:
                    Contratos_Servicos.objects.get(pk=id_card).servicos_contratados.set(new_value_updated)
            else:
                Contratos_Servicos.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})
    
    elif id == 1137085:
        pipefyMySQLFields = {
            'raz_o_social_da_institui_o': 'razao_social', 'cnpj': 'cnpj', 
            'tipo_de_institui_o': 'tipo_instituicao', 'produto_vinculado': 'produto_vinculado',
            'abreviatura': 'abreviatura'}
        if id_field_updated in pipefyMySQLFields.keys(): #se o campo atualizado é um campo de interesse
            Instituicoes_Razao_Social.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})

    elif id == 1137087:
        pipefyMySQLFields = {'institui_o': 'instituicao_id', 'ag_ncia': 'identificacao'}
        if id_field_updated in pipefyMySQLFields.keys(): #se o campo atualizado é um campo de interesse
            if id_field_updated in ['institui_o']: #campos conectores chave estrangeira
                if len(new_value_updated) >= 1:
                    Instituicoes_Parceiras.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: int(new_value_updated[0]), 'updated_at': datetime.now()}) 
            else:
                Instituicoes_Parceiras.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})
    
    elif id == 1139735:
        pipefyMySQLFields = {
            #campos do database relacionados com as colunas do banco de dados
            'nome': 'beneficiario_id', 'n_da_opera_o': 'numero_operacao', 'item_financiado': 'item_financiado_id', 'valor_da_opera_o': 'valor_operacao',
            'rea_total_beneficiada': 'area_beneficiada', 'institui_o_financeira': 'instituicao_id', 'fonte_do_recurso': 'fonte_recurso', 'im_vel_ies': 'imovel_beneficiado', 
            'data_da_emiss_o_da_c_dula': 'data_emissao_cedula', 'data_do_primeiro_vencimento': 'data_primeiro_vencimento', 'data_para_apresenta_o_de_dec_prod_armazenado': 'data_prod_armazenado', 
            'data_do_vencimento': 'data_vencimento', 'taxa_juros': 'taxa_juros', 'safra': 'safra', 'matr_cula_dos_im_veis': 'matricula_imovel'
        }
        if id_field_updated in pipefyMySQLFields.keys(): #se o campo atualizado é um campo de interesse
            if id_field_updated in ['nome', 'item_financiado', 'institui_o_financeira']: #campos conectores chave estrangeira
                if len(new_value_updated) >= 1:
                    Operacoes_Contratadas.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: int(new_value_updated[0]), 'updated_at': datetime.now()}) 
            else:
                Operacoes_Contratadas.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})
    
    elif id == 302757437:
        pipefyMySQLFields = {'categoria': 'category', 'sub_categoria': 'sub_category', 'classifica_o': 'classification'}
        if id_field_updated in pipefyMySQLFields: #se o campo atualizado é um campo de interesse
            Categorias_Pagamentos.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})
    
    elif id == 301654297:
        pipefyMySQLFields = {'nome_do_grupo': 'nome_grupo'} 
        if id_field_updated in pipefyMySQLFields: #se o campo atualizado é um campo de interesse
            Grupos_Clientes.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})
    
    elif id == 303133100:
        pipefyMySQLFields = {"nome_caixa": "caixa", "sigla_caixa": "sigla", "n_ag_ncia": "numero_agencia", "n_conta": "numero_conta"}
        if id_field_updated in pipefyMySQLFields: #se o campo atualizado é um campo de interesse
            Caixas_Frasson.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})
    
    elif id == 1137034:
        pipefyMySQLFields = {'tipo_de_opera_o': 'item', 'tipo': 'tipo'}
        if id_field_updated in pipefyMySQLFields: #se o campo atualizado é um campo de interesse
            Itens_Financiados.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})
    
    elif id == 301582775:
        pipefyMySQLFields = {'detalhamento': 'detalhamento_servico', 'produto_frasson': 'produto_id'}
        if id_field_updated in pipefyMySQLFields: #se o campo atualizado é um campo de interesse
            if id_field_updated == 'produto_frasson':
                new_value_updated = int(new_value_updated[0])
            Detalhamento_Servicos.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})
    
    elif id == 1139554:
        pipefyMySQLFields = {
            'cliente': 'cliente', 'representante': 'representante', 'contato_1': 'contato_01', 'contato_2': 'contato_02', 
            'outros_contatos': 'outros_contatos', 'e_mail_1': 'email_01', 'e_mail_2': 'email_02', 'outras_observa_es': 'observacoes'
        }
        if id_field_updated in pipefyMySQLFields.keys(): #se o campo atualizado é um campo de interesse
            Cadastro_Prospects.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})
    
    elif id == 302802605:
        pipefyMySQLFields = {
            'nome_ou_raz_o_social':'cliente_id', 'institui_o_financeira':'instituicao_id', 
            'n_ag_ncia': 'agencia', 'n_conta_corrente': 'conta'}
        if id_field_updated in ["nome_ou_raz_o_social", "institui_o_financeira"]:
            new_value_updated = int(obj["data"]["new_value"][0])
        if id_field_updated in pipefyMySQLFields.keys(): #se o campo atualizado é um campo de interesse
            ContasBancarias_Clientes.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})
    
    elif id == 303917094:
        pipefyMySQLFields = {'descri_o_produto':'description', 'sigla_produto': 'acronym'}
        if id_field_updated in pipefyMySQLFields.keys(): #se o campo atualizado é um campo de interesse
            Cadastro_Produtos.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})
    
    return JsonResponse({'message': 'Webhook status ok'})

@csrf_exempt
def webhooks_database_delete_record(request, id):
    obj = json.loads(request.body)
    id_card = obj["data"]["card"]["id"]
    try:
        if id == 1136264:
            record = Cadastro_Pessoal.objects.get(pk=id_card).delete()
        elif id == 1260853:
            record = Fornecedores_Colaboradores.objects.get(pk=id_card).delete()
        elif id == 1214186:
            record = Imoveis_Rurais.objects.get(pk=id_card).delete()
        elif id == 1136266:
            record = Contratos_Servicos.objects.get(pk=id_card).delete()
        elif id == 1137085:
            record = Instituicoes_Razao_Social.objects.get(pk=id_card).delete()
        elif id == 1137087:
            record = Instituicoes_Parceiras.objects.get(pk=id_card).delete()
        elif id == 1139735:
            record = Operacoes_Contratadas.objects.get(pk=id_card).delete()
        elif id == 302757437:
            record = Categorias_Pagamentos.objects.get(pk=id_card).delete()
        elif id == 301654297:
            record = Grupos_Clientes.objects.get(pk=id_card).delete()
        elif id == 303133100:
            record = Caixas_Frasson.objects.get(pk=id_card).delete()
        elif id == 1137034:
            record = Itens_Financiados.objects.get(pk=id_card).delete()
        elif id == 301582775:
            record = Detalhamento_Servicos.objects.get(pk=id_card).delete()
        elif id == 1139554:
            record = Cadastro_Prospects.objects.get(pk=id_card).delete()
        elif id == 302802605:
            record = ContasBancarias_Clientes.objects.get(pk=id_card).delete()
        elif id == 303917094:
            record = Cadastro_Produtos.objects.get(pk=id_card).delete()
        return JsonResponse({'message': 'Object deleted successfully'})
    except ObjectDoesNotExist:
        return JsonResponse({'message': 'Object not found'})