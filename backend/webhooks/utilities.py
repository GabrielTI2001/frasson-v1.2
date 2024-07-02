from pipeline.models import Fluxo_Gestao_Ambiental, Fluxo_Prospects, Cadastro_Pessoal
from farms.models import Imoveis_Rurais, Regimes_Exploracao
from cadastro.models import Instituicoes_Parceiras, Instituicoes_Razao_Social, Produtos_Frasson
from cadastro.models import Detalhamento_Servicos, Grupos_Clientes, Contas_Bancarias_Clientes
from credit.models import Operacoes_Contratadas, Itens_Financiados
from finances.models import Categorias_Pagamentos, Caixas_Frasson, Contratos_Ambiental, Cobrancas, Pagamentos
from django.core.exceptions import ObjectDoesNotExist
from users.models import Profile
from datetime import datetime

def createCardProdutos(obj):
    current = Fluxo_Gestao_Ambiental.objects.create(
        id = obj["id"],
        card = obj["card"] if "card" in obj else None,
        detalhamento_id = obj["detalhamento_demanda_2"] if "detalhamento_demanda_2" in obj else None,
        instituicao_id = obj["institui_o_vinculada"] if "institui_o_vinculada" in obj else None,
        contrato_id = obj["contrato_vinculado"] if "contrato_vinculado" in obj else None,
        valor_operacao = obj["valor_da_opera_o"] if "valor_da_opera_o" in obj else None,
        phase_id = obj["current_phase_id"],
        phase_name = obj["current_phase_name"],
        card_url = obj["url"],
        created_at = obj["createdAt"][:19],
        updated_at = obj["createdAt"][:19])            
    current.beneficiario.set(obj["benefici_rio_s"] if "benefici_rio_s" in obj else [])

def updateCardProdutos(id_card, id_field_updated, new_value_updated):
    pipefyMySQLFields = { 
        #campos do card relacionados com as colunas do banco de dados (card_field_id: coluna_mysql)
        'card': 'card', 'benefici_rio_s': 'beneficiario', 'detalhamento_demanda_2': 'detalhamento_id', 
        'institui_o_vinculada': 'instituicao_id', 'contrato_vinculado': 'contrato_id', 'valor_da_opera_o': 'valor_operacao', 
        'faturamento_estimado': 'faturamento_estimado'
    }
    if id_field_updated in pipefyMySQLFields.keys(): #se o campo atualizado é um campo de interesse
        if id_field_updated in ['contrato_vinculado', 'institui_o_vinculada', 'detalhamento_demanda_2']: #campos conectores
            if len(new_value_updated) >= 1:
                Fluxo_Gestao_Ambiental.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: int(new_value_updated[0]), 'updated_at': datetime.now()}) 
        elif id_field_updated == 'benefici_rio_s':
            if len(new_value_updated) >= 1:
                card = Fluxo_Gestao_Ambiental.objects.get(pk=id_card)
                card.beneficiario.set(new_value_updated)
                card.save()
        else:
            Fluxo_Gestao_Ambiental.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})

def createCardProspects(obj):
    fields_resps = {'START':'respons_vel', 'CONTATO INICIAL':'respons_vel_pelo_contato_incial', 'BACK OFFICE':'respons_vel_pelo_back_office',
        'ANÁLISE E PROCESSAMENTO':'respons_vel_pela_an_lise_t_cnica', 'ANÁLISE TÉCNICA':'prazo_para_a_litec',
        'PROPOSTA DE VALOR':'respons_vel_pela_proposta_de_valor', 'MINUTA CONTRATO':'respons_vel_pela_proposta_de_valor_1', 
        'ENCERRAMENTO':'respons_vel_pelo_encerramento', 'PERDIDO':'respons_vel_pelo_encerramento', 'GANHO':'respons_vel_pelo_encerramento',
        'CANCELADO':'respons_vel_pelo_encerramento'}
    fields_venc = {'START':'prazo_para_encaminhamento', 'CONTATO INICIAL':'prazo_para_o_contato_inicial', 'BACK OFFICE':'prazo_para_o_back_office', 
        'ANÁLISE E PROCESSAMENTO':'prazo_para_a_an_lise_e_processamento', 'ANÁLISE TÉCNICA':'prazo_para_a_litec_1', 'PROPOSTA DE VALOR':'prazo_para_a_proposta_de_valor', 
        'MINUTA CONTRATO':'prazo_para_a_proposta_de_valor_1', 'ENCERRAMENTO':'prazo_para_encerramento', 'CONCLUÍDO':'prazo_para_encerramento', 
        'PERDIDO':'prazo_para_encerramento','GANHO':'prazo_para_encerramento', 'CANCELADO':'prazo_para_encerramento'}
    current = Fluxo_Prospects.objects.create(
        id = obj["id"],
        prospect_id = obj["prospect_2"] if "prospect_2" in obj else None,
        produto = obj["produto"] if "produto" in obj else None,
        classificacao = obj["classifica_o_prospect"] if "classifica_o_prospect" in obj else None,
        origem = obj["origem"] if "origem" in obj else None,
        proposta_inicial = obj["valor_inicial_da_proposta"] if "valor_inicial_da_proposta" in obj else None,
        proposta_aprovada = obj["valor_aprovado"] if "valor_aprovado" in obj else None,
        percentual_inicial = obj["percentual_proposto"] if "percentual_proposto" in obj else None,
        percentual_aprovado = obj["percentual_aprovado"] if "percentual_aprovado" in obj else None,
        data_vencimento = obj[fields_venc[obj["current_phase_name"]]][:19] if fields_venc[obj["current_phase_name"]] in obj else None,
        phase_id = int(obj["current_phase_id"]), card_url = obj["url"],
        phase_name = obj["current_phase_name"],
        created_at = obj["createdAt"][:19], updated_at = obj["createdAt"][:19])
    listprofiles = Profile.objects.filter(pipefy_id__in=obj[fields_resps[obj["current_phase_name"]]]) if fields_resps[obj["current_phase_name"]] in obj else []
    current.responsavel.set([p.id for p in listprofiles])

def updateCardProspects(id_card, id_field_updated, new_value_updated):
    pipefyMySQLFields = { 
        #campos do card relacionados com as colunas do banco de dados (card_field_id: coluna_mysql)
        'prospect_2': 'prospect_id', 'produto': 'produto', 'classifica_o_prospect': 'classificacao',
        'origem': 'origem', 'valor_inicial_da_proposta': 'proposta_inicial', 'valor_aprovado': 'proposta_aprovada',
        'percentual_proposto': 'percentual_inicial', 'percentual_aprovado': 'percentual_aprovado'
    }
    if id_field_updated in pipefyMySQLFields.keys(): #se o campo atualizado é um campo de interesse
        if id_field_updated in ['prospect_2']: #campos conectores
            if len(new_value_updated) >= 1:
                Fluxo_Prospects.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: int(new_value_updated[0]), 'updated_at': datetime.now()}) 
        else:
            Fluxo_Prospects.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})
    else:
        if id_field_updated in ['prazo_para_encaminhamento', 'prazo_para_a_an_lise_e_processamento', 'prazo_para_o_back_office', 'prazo_para_a_proposta_de_valor'
            'prazo_para_a_proposta_de_valor_1', 'prazo_para_encerramento', 'prazo_para_a_litec_1', 'prazo_para_o_contato_inicial']:
                new_value_updated = new_value_updated[:19]
                Fluxo_Prospects.objects.filter(pk=id_card).update(**{'data_vencimento': new_value_updated, 'updated_at': datetime.now()})
        elif id_field_updated in ['respons_vel','respons_vel_pela_proposta_de_valor_1','respons_vel_pelo_back_office','respons_vel_pela_an_lise_t_cnica',
            'respons_vel_pelo_contato_incial','respons_vel_pela_proposta_de_valor', 'respons_vel_pelo_encerramento', 'prazo_para_a_litec']: 
            resps = []
            for new in new_value_updated:
                try:
                    perfil = Profile.objects.get(pipefy_id=new).id
                    resps.append(perfil)
                except ObjectDoesNotExist:
                    pass
            Fluxo_Prospects.objects.get(pk=id_card).responsavel.set(resps)

def createCardPagamento(card):
    Pagamentos.objects.create(
        id = card["id"],
        beneficiario_id = card["benefici_rio_pagamento"] if "benefici_rio_pagamento" in card else None,
        descricao = card["descri_o"] if "descri_o" in card else None,
        detalhamento = card["detalhamento"] if "detalhamento" in card else None,
        valor_pagamento = card["valor_pagamento"] if "valor_pagamento" in card else None,
        data_vencimento = card["data_vencimento"] if "data_vencimento" in card else None,
        data_pagamento = card["data_pagamento"] if "data_pagamento" in card else None,
        caixa_id = card["caixa_sa_da"] if "caixa_sa_da" in card else None,
        categoria_id = card["categoria_pagamento"] if "categoria_pagamento" in card else None,
        phase_id = card["current_phase_id"], phase_name = card["current_phase_name"], card_url = card["url"],
        created_at = card["createdAt"][:19], updated_at = card["createdAt"][:19])  
    
def updateCardPagamento(id_card, id_field_updated, new_value_updated):
    pipefyMySQLFields = { 
        #campos do card relacionados com as colunas do banco de dados (card_field_id: coluna_mysql)
        'benefici_rio_pagamento': 'beneficiario_id', 'descri_o': 'descricao', 'detalhamento': 'detalhamento', 'categoria_pagamento': 'categoria_id',
        'valor_pagamento': 'valor_pagamento', 'data_vencimento': 'data_vencimento', 'caixa_sa_da': 'caixa_id',  'data_pagamento': 'data_pagamento'
    }
    if id_field_updated in pipefyMySQLFields.keys(): #se o campo atualizado é um campo de interesse
        if id_field_updated in ['benefici_rio_pagamento', 'categoria_pagamento', 'caixa_sa_da']: #campos conectores
            if len(new_value_updated) >= 1:
                Pagamentos.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: int(new_value_updated[0]), 'updated_at': datetime.now()}) 
        else:
            Pagamentos.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})

def createCardCobrancas(card):          
    Cobrancas.objects.create(
        id = card["id"],
        cliente_id = card["cliente"] if "cliente" in card else None,
        contrato_id = card["contrato"] if "contrato" in card else None,
        etapa_cobranca = card["etapa_cobran_a"] if "etapa_cobran_a" in card else None,
        detalhamento_id = card["detalhe_demanda"] if "detalhe_demanda" in card else None,
        valor_operacao = card["valor_final_contratado"] if "valor_final_contratado" in card else None,
        percentual_contratado = card["percentual_contratado"] if "percentual_contratado" in card else None,
        data_previsao = card["valor_pagamento"] if "valor_pagamento" in card else None,
        data_pagamento = card["data_pagamento"] if "data_pagamento" in card else None,
        saldo_devedor = card["saldo_devedor"] if "saldo_devedor" in card else None,
        valor_faturado = card["valor_final_faturado"] if "valor_final_faturado" in card else None,
        caixa_id = card["faturado_no_caixa"] if "faturado_no_caixa" in card else None,
        phase_id = card["current_phase_id"], phase_name = card["current_phase_name"],
        card_url = card["url"],
        created_at = card["createdAt"][:19],
        updated_at = card["createdAt"][:19])

def updateCardCobrancas(id_card, id_field_updated, new_value_updated):
    pipefyMySQLFields = { 
        #campos do card relacionados com as colunas do banco de dados (card_field_id: coluna_mysql)
        'cliente': 'cliente_id', 'contrato': 'contrato_id', 'etapa_cobran_a': 'etapa_cobranca' ,'detalhe_demanda': 'detalhamento_id', 'saldo_devedor':'saldo_devedor',
        'percentual_contratado': 'percentual_contratado', 'valor_final_contratado': 'valor_operacao', 'previs_o_pagamento': 'data_previsao', 
        'valor_final_faturado': 'valor_faturado', 'faturado_no_caixa': 'caixa_id', 'data_pagamento': 'data_pagamento'
    }
    if id_field_updated in pipefyMySQLFields.keys(): #se o campo atualizado é um campo de interesse
        if id_field_updated in ['cliente', 'contrato', 'detalhe_demanda', 'faturado_no_caixa']: #campos conectores
            if len(id_field_updated) >= 1:
                Cobrancas.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: int(new_value_updated[0]), 'updated_at': datetime.now()}) 
        else:
            Cobrancas.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})

def createCadastroPessoal(registro):
    reg = Cadastro_Pessoal.objects.create(
        id = registro['id'],
        razao_social = registro['nome_do_cliente'] if 'nome_do_cliente' in registro else None,
        natureza = registro['natureza'] if 'natureza' in registro else None, cpf_cnpj = registro['cpf'] if 'cpf' in registro else None,
        numero_rg = registro['identidade'] if 'identidade' in registro else None, endereco = registro['endere_o'] if 'endere_o' in registro else None,
        municipio = registro['munic_pio'] if 'munic_pio' in registro else None, 
        uf = registro['uf'] if 'uf' in registro else None, cep = registro['cep'] if 'cep' in registro else None,
        data_nascimento = registro['data_de_nascimento'] if 'data_de_nascimento' in registro else None,
        contato1 = registro['contato'] if 'contato' in registro else None, contato2 = registro['contato_2'] if 'contato_2' in registro else None,
        email = registro['e_mail'] if 'e_mail' in registro else None, record_url = registro['url'],
        grupo_id = registro['grupo_1'] if 'grupo_1' in registro else None, profissao = registro['profiss_o'] if 'profiss_o' in registro else None,
        created_at = registro['createdAt'][:19], updated_at = registro['createdAt'][:19]
    )
    reg.socios.set(registro["s_cios"] if "s_cios" in registro else [])

def createImoveisRurais(imovel):
    Imoveis_Rurais.objects.create(
        id = imovel["id"],
        nome_imovel = imovel["o_qu"] if "o_qu" in imovel.keys() else None,
        matricula_imovel = imovel["matr_cula"] if "matr_cula" in imovel.keys() else None,
        proprietario_id = imovel["propriet_rio_do_im_vel"] if "propriet_rio_do_im_vel" in imovel.keys() else None,
        livro_registro = imovel["livro_de_registro"] if "livro_de_registro" in imovel.keys() else None,
        numero_registro = imovel["n_mero_do_registro"] if "n_mero_do_registro" in imovel.keys() else None,
        data_registro = imovel["data_do_registro"] if "data_do_registro" in imovel.keys() else None,
        municipio_localizacao = imovel["munic_pio_do_im_vel"] if "munic_pio_do_im_vel" in imovel.keys() else None,
        uf_localizacao = imovel["uf"] if "uf" in imovel.keys() else None,
        cep_localizacao = imovel["cep"] if "cep" in imovel.keys() else None,
        titulo_posse = imovel["t_tulo_de_posse_do_im_vel"] if "t_tulo_de_posse_do_im_vel" in imovel.keys() else None,
        nirf = imovel["nirf"] if "nirf" in imovel.keys() else None,
        ccir = imovel["n_mero_ccir"] if "n_mero_ccir" in imovel.keys() else None,
        car = imovel["registro_car"] if "registro_car" in imovel.keys() else None,
        area_total = imovel["rea_total_do_im_vel"] if "rea_total_do_im_vel" in imovel.keys() else None,
        modulos_fiscais = imovel["m_dulos_fiscais"] if "m_dulos_fiscais" in imovel.keys() else None,
        area_reserva = imovel["rea_de_reserva_legal"] if "rea_de_reserva_legal" in imovel.keys() else None,
        localizacao_reserva = imovel["localiza_o_da_reserva"] if "localiza_o_da_reserva" in imovel.keys() else None,               
        area_app = imovel["rea_de_app"] if "rea_de_app" in imovel.keys() else None,
        area_veg_nat = imovel["rea_de_vegeta_o_nativa"] if "rea_de_vegeta_o_nativa" in imovel.keys() else None,
        area_explorada = imovel["rea_explorada"] if "rea_explorada" in imovel.keys() else None,
        roteiro_acesso = imovel["roteiro_de_acesso"] if "roteiro_de_acesso" in imovel.keys() else None,
        url_record = imovel["url"], created_at = imovel["createdAt"][:19], updated_at = imovel["createdAt"][:19])
    
def updateImovelRural(id_card, id_field_updated, new_value_updated):
    pipefyMySQLFields = {
        #campos do database relacionados com as colunas do banco de dados
        'o_qu': 'nome_imovel', 'matr_cula': 'matricula_imovel', 'propriet_rio_do_im_vel': 'proprietario_id', 'livro_de_registro': 'livro_registro',
        'n_mero_do_registro': 'numero_registro', 'data_do_registro': 'data_registro', 'munic_pio_do_im_vel': 'municipio_localizacao', 'uf': 'uf_localizacao',
        'cep': 'cep_localizacao', 't_tulo_de_posse_do_im_vel': 'titulo_posse', 'nirf': 'nirf', 
        'n_mero_ccir': 'ccir', 'registro_car': 'car', 'rea_total_do_im_vel': 'area_total', 'm_dulos_fiscais': 'modulos_fiscais',
        'rea_de_reserva_legal': 'area_reserva', 'localiza_o_da_reserva': 'localizacao_reserva', 'rea_de_app': 'area_app', 'rea_de_vegeta_o_nativa': 'area_veg_nat',
        'rea_explorada': 'area_explorada', 'roteiro_de_acesso': 'roteiro_acesso'}
    if id_field_updated in pipefyMySQLFields.keys(): #se o campo atualizado é um campo de interesse
        if id_field_updated in ['propriet_rio_do_im_vel']: #campos conectores chave estrangeira
            if len(new_value_updated) >= 1:
                Imoveis_Rurais.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: int(new_value_updated[0]), 'updated_at': datetime.now()}) 
        else:
            Imoveis_Rurais.objects.filter(pk=id_card).update(**{pipefyMySQLFields[id_field_updated]: new_value_updated, 'updated_at': datetime.now()})



def createContratosServicos(contrato):
    current = Contratos_Ambiental.objects.create(
        id = contrato["id"],
        contratante_id = contrato["contratante"] if "contratante" in contrato else None,
        detalhes_negociacao = contrato["detalhes_da_negocia_o"] if "detalhes_da_negocia_o" in contrato else None,
        percentual_gc = contrato["percentual_do_contrato_gc"] if "percentual_do_contrato_gc" in contrato else None,
        valor_gai = contrato["valor_do_contrato"] if "valor_do_contrato" in contrato else None,
        data_assinatura = contrato["data_da_assinatura"] if "data_da_assinatura" in contrato else None,
        data_vencimento = contrato["data_do_vencimento"] if "data_do_vencimento" in contrato else None,
        url_record = contrato["url"], created_at = contrato["createdAt"][:19], updated_at = contrato["createdAt"][:19])
    current.demais_membros.set(contrato["membros_do_contrato"] if "membros_do_contrato" in contrato else [])
    current.servicos_contratados.set(contrato["detalhamento_da_s_demanda_s"] if "detalhamento_da_s_demanda_s" in contrato else [])

def createInstituicoesRazaoSocial(registro):
    Instituicoes_Razao_Social.objects.create(
        id = registro["id"],
        razao_social = registro["raz_o_social_da_institui_o"] if "raz_o_social_da_institui_o" in registro else None,
        cnpj = registro["cnpj"] if "cnpj" in registro else None,
        tipo_instituicao = registro["tipo_de_institui_o"] if "tipo_de_institui_o" in registro else None,
        produto_vinculado = registro["produto_vinculado"] if "produto_vinculado" in registro else None,
        created_at = registro["createdAt"][:19], updated_at = registro["createdAt"][:19])

def createInstituicaoParceira(instituicao):
    Instituicoes_Parceiras.objects.create(
        id = instituicao["id"],
        instituicao_id = instituicao["institui_o"] if "institui_o" in instituicao else None,
        identificacao = instituicao["ag_ncia"] if "ag_ncia" in instituicao else None, record_url = instituicao["url"], 
        created_at = instituicao["createdAt"][:19], updated_at = instituicao["createdAt"][:19])
    
def createOperacoesContratadas(operacao):
    Operacoes_Contratadas.objects.create(
        id = operacao["id"],
        beneficiario_id = operacao["nome"] if "nome" in operacao else None,
        numero_operacao = operacao["n_da_opera_o"] if "n_da_opera_o" in operacao else None,
        item_financiado_id = operacao["item_financiado"] if "item_financiado" in operacao else None,
        valor_operacao = operacao["valor_da_opera_o"] if "valor_da_opera_o" in operacao else None,
        area_beneficiada = operacao["rea_total_beneficiada"] if "rea_total_beneficiada" in operacao else None,
        instituicao_id = operacao["institui_o_financeira"] if "institui_o_financeira" in operacao else None,
        fonte_recurso = operacao["fonte_do_recurso"] if "fonte_do_recurso" in operacao else None,
        imovel_beneficiado = operacao["im_vel_ies"] if "im_vel_ies" in operacao else None,
        data_emissao_cedula = operacao["data_da_emiss_o_da_c_dula"] if "data_da_emiss_o_da_c_dula" in operacao else None,
        data_primeiro_vencimento = operacao["data_do_primeiro_vencimento"] if "data_do_primeiro_vencimento" in operacao else None,
        data_prod_armazenado = operacao["data_para_apresenta_o_de_dec_prod_armazenado"] if "data_para_apresenta_o_de_dec_prod_armazenado" in operacao else None,
        data_vencimento = operacao["data_do_vencimento"] if "data_do_vencimento" in operacao else None,
        safra = operacao["safra"] if "safra" in operacao else None, taxa_juros = operacao["taxa_juros"] if "taxa_juros" in operacao else None,
        url_record = operacao["url"], created_at = operacao["createdAt"][:19], updated_at = operacao["createdAt"][:19])    

def createCategoriasPagamentos(categoria):
    Categorias_Pagamentos.objects.create(
        id = categoria["id"],
        category = categoria["categoria"] if "categoria" in categoria else None,
        sub_category = categoria["sub_categoria"] if "sub_categoria" in categoria else None,
        classification = categoria["classifica_o"] if "classifica_o" in categoria else None,
        created_at = categoria["createdAt"][:19], updated_at = categoria["createdAt"][:19])

def createGruposClientes(registro):
    Grupos_Clientes.objects.create(
        id = registro['id'],
        nome_grupo = registro['nome_do_grupo']if 'nome_do_grupo' in registro else None,
        created_at = registro['createdAt'][:19], updated_at = registro['createdAt'][:19])

def createCaixasFinanceiro(caixa):
    Caixas_Frasson.objects.create(
        id = caixa["id"],
        caixa = caixa["nome_caixa"] if "nome_caixa" in caixa else None,
        sigla = caixa["sigla_caixa"] if "sigla_caixa" in caixa else None,
        numero_agencia = caixa["n_ag_ncia"] if "n_ag_ncia" in caixa else None,
        numero_conta = caixa["n_conta"] if "n_conta" in caixa else None,
        created_at = caixa["createdAt"][:19], updated_at = caixa["createdAt"][:19])
    

def createItensFinanciados(item):  
    Itens_Financiados.objects.create(
        id = item["id"],
        item = item["tipo_de_opera_o"] if 'tipo_de_opera_o' in item else None, tipo = item["tipo"] if 'tipo' in item else None,
        created_at = item["createdAt"][:19], updated_at = item["createdAt"][:19])  


def createDetalhamentoServicos(reg):
    Detalhamento_Servicos.objects.create(
        id = reg['id'], produto_id = reg["produto_frasson"] if "produto_frasson" in reg else None,
        detalhamento_servico = reg["detalhamento"] if "detalhamento" in reg else None,
        created_at = reg["createdAt"][:19], updated_at = reg["createdAt"][:19])
    
def createCadastroProspects(prospect):
    flux.objects.create(
        id = prospect["id"],
        cliente = prospect["cliente"] if "cliente" in prospect else None,
        representante = prospect["representante"] if "representante" in prospect else None,
        contato_01 = prospect["contato_1"] if "contato_1" in prospect else None,
        contato_02 = prospect["contato_2"] if "contato_2" in prospect else None,
        outros_contatos = prospect["outros_contatos"] if "outros_contatos" in prospect else None,
        email_01 = prospect["e_mail_1"] if "e_mail_1" in prospect else None,
        email_02 = prospect["e_mail_2"] if "e_mail_2" in prospect else None,
        observacoes = prospect["outras_observa_es"] if "outras_observa_es" in prospect else None,
        created_at = prospect["createdAt"][:19],
        updated_at = prospect["createdAt"][:19])


def createRegimesExploracao(regime):
    Regimes_Exploracao.objects.create(
        id = regime["id"],
        imovel_id = regime["nome_do_im_vel"] if "nome_do_im_vel" in regime.keys() else None,
        quem_explora_id = regime["quem_explora"] if "quem_explora" in regime.keys() else None,
        instituicao_id = regime["institui_o_vinculada"] if "institui_o_vinculada" in regime.keys() else None,
        regime = regime["regime_de_explora_o"] if "regime_de_explora_o" in regime.keys() else None,
        data_inicio = regime["in_cio"] if "in_cio" in regime.keys() else None,
        data_termino = regime["t_rmino"] if "t_rmino" in regime.keys() else None,
        area_explorada = regime["rea_cedida"] if "rea_cedida" in regime.keys() else None,
        atividades_exploradas = regime["atividades_exploradas"] if "atividades_exploradas" in regime.keys() else None,
        detalhamento = regime["detalhar"] if "detalhar" in regime.keys() else None,
        record_url = regime["url"],
        created_at = regime["createdAt"][:19],
        updated_at = regime["createdAt"][:19]
    )

def createContasClientes(contas):
    Contas_Bancarias_Clientes.objects.create(
        id = contas["id"],
        cliente_id = contas["nome_ou_raz_o_social"] if "nome_ou_raz_o_social" in contas else None,
        instituicao_id = contas["institui_o_financeira"] if "institui_o_financeira" in contas else None,
        agencia = contas["n_ag_ncia"] if "n_ag_ncia" in contas else None,
        conta = contas["n_conta_corrente"] if "n_conta_corrente" in contas else None,
        created_at = contas["createdAt"][:19], updated_at = contas["createdAt"][:19]
    )

def createCadastroProdutos(produto):
    Cadastro_Produtos.objects.create(
        id = produto['id'],
        description = produto['descri_o_produto'] if 'descri_o_produto' in produto else None,
        acronym = produto['sigla_produto'] if 'sigla_produto' in produto else None,
        created_at = produto['createdAt'][:19], updated_at = produto['createdAt'][:19]
    )

def criar_registro_db(id, data):
    if id == 301573538:
        createCardProdutos(data)
    elif id == 301573049:
        createCardProspects(data)
    elif id == 302757413:
        createCardPagamento(data)
    elif id == 302821542:
        createCardCobrancas(data)
    elif id == 1136264:
        createCadastroPessoal(data)
    elif id == 1260853:
        createFornColab(data)
    elif id == 1213951:
        createImoveisRurais(data)
    elif id == 1136266:
        createContratosServicos(data)
    elif id == 1137085:
        createInstituicoesRazaoSocial(data)
    elif id == 1137087:
        createInstituicaoParceira(data)
    elif id == 1139735:
        createOperacoesContratadas(data)
    elif id == 302757437:
        createCategoriasPagamentos(data)
    elif id == 301654297:
        createGruposClientes(data)
    elif id == 303133100:
        createCaixasFinanceiro(data)
    elif id == 1137034:
        createItensFinanciados(data)
    elif id == 301582775:
        createDetalhamentoServicos(data)
    elif id == 1139554:
        createCadastroProspects(data)
    elif id == 1214186:
        createRegimesExploracao(data)
    elif id == 302802605:
        createContasClientes(data)
    elif id == 303917094:
        createCadastroProdutos(data)