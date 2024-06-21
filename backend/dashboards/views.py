from django.shortcuts import render
from django.db.models import Avg, Sum, Count, DecimalField, Case, When, Q
from django.db.models.functions import Coalesce
from django.http import JsonResponse
from datetime import date
import locale, json, statistics, uuid
from django.core import serializers
from credit.models import Operacoes_Contratadas
from environmental.models import APPO_INEMA_Coordenadas, Outorgas_INEMA_Coordenadas
from pipeline.models import Card_Pagamentos, Card_Cobrancas, Card_Produtos, Card_Prospects
from irrigation.models import Cadastro_Pivots
from processes.models import Processos_Andamento
from kpi.models import Indicadores_Frasson, Metas_Realizados

def dashboard_operacoes_contratadas(request):
    #CARREGA A DASHBOARD DE OPERAÇÕES CONTRATADAS (! IMPORTANTE !)
    current_year = int(date.today().year)
    current_month = int(date.today().month)
    search_year = request.GET.get('year')
    search_month = request.GET.get('month')
    metas = {}
    realizado_ano = {}
    realizado_ano_anterior = {}
    tipos_operacao = {}
    bancos = {}
    taxas = {}

    prorrogacao_ids = [609253692, 49052728] #ids dos items financiados que serão desconsiderados na met (prorrogação custeio e investimento)
    
    meses = [{'number': 1, 'abrev': 'JAN', 'name': 'janeiro'},
        {'number': 2, 'abrev': 'FEV', 'name': 'fevereiro'},
        {'number': 3, 'abrev': 'MAR', 'name': 'março'},
        {'number': 4, 'abrev': 'ABR', 'name': 'abril'},
        {'number': 5, 'abrev': 'MAI', 'name': 'maio'},
        {'number': 6, 'abrev': 'JUN', 'name': 'junho'},
        {'number': 7, 'abrev': 'JUL', 'name': 'julho'},
        {'number': 8, 'abrev': 'AGO', 'name': 'agosto'},
        {'number': 9, 'abrev': 'SET', 'name': 'setembro'},
        {'number': 10, 'abrev': 'OUT', 'name': 'outubro'},
        {'number': 11, 'abrev': 'NOV', 'name': 'novembro'},
        {'number': 12, 'abrev': 'DEZ', 'name': 'dezembro'}
    ]

    if search_year and search_month:
        searched_month = int(search_month)
        searched_year = int(search_year)
        past_year = int(search_year) - 1

    else: #se não houver nenhuma busca (carregada pela primeira vez)
        searched_month = current_month
        searched_year = current_year
        past_year = current_year - 1
    
    #busca todos os anos de registros na table de operações
    anos_operacoes = Operacoes_Contratadas.objects.values_list('data_emissao_cedula__year', flat=True).distinct()

    uuid_carteira_credito = Indicadores_Frasson.objects.get(pk=1).uuid #uuid da carteira de crédito

    metas_database = Metas_Realizados.objects.filter(indicator_id=uuid_carteira_credito, year=searched_year) #busca pelo uuid
    bancos_db = Operacoes_Contratadas.objects.filter(data_emissao_cedula__year=searched_year).exclude(item_financiado__in=prorrogacao_ids).values('instituicao__instituicao__abreviatura').annotate(Sum('valor_operacao')).order_by('-valor_operacao__sum')
    bancos_taxas_db = Operacoes_Contratadas.objects.filter(data_emissao_cedula__year=searched_year).exclude(item_financiado__in=prorrogacao_ids).values('instituicao__instituicao__abreviatura').annotate(Avg('taxa_juros')).order_by('-taxa_juros__avg')


    #x = Operacoes_Contratadas.objects.filter(data_emissao_cedula__year=searched_year).values('instituicao__instituicao__abreviatura').annotate(
    #    media_juros=Avg('taxa_juros'), valor_operacao=Sum('valor_operacao'))
    

    realizado_ano_db = Operacoes_Contratadas.objects.filter(data_emissao_cedula__year=searched_year).exclude(item_financiado__in=prorrogacao_ids).values('data_emissao_cedula__month').annotate(total=Sum('valor_operacao')).order_by('data_emissao_cedula__month')
    realizado_ano_anterior_db = Operacoes_Contratadas.objects.filter(data_emissao_cedula__year=past_year).exclude(item_financiado__in=prorrogacao_ids).values('data_emissao_cedula__month').annotate(total=Sum('valor_operacao')).order_by('data_emissao_cedula__month')

    #busca os valores por tipo de operação (investimento, custeio, etc)
    realizado_tipo_operacao = Operacoes_Contratadas.objects.filter(data_emissao_cedula__year=searched_year).exclude(item_financiado__in=prorrogacao_ids).values('item_financiado__tipo').annotate(total=Sum('valor_operacao')).order_by('-total')
    
    taxa_media = Operacoes_Contratadas.objects.filter(data_emissao_cedula__year=searched_year).exclude(item_financiado__in=prorrogacao_ids).aggregate(media=Avg('taxa_juros'))['media'] or 0
    area_total = Operacoes_Contratadas.objects.filter(data_emissao_cedula__year=searched_year).exclude(item_financiado__in=prorrogacao_ids).aggregate(total=Sum('area_beneficiada'))['total'] or 0

    #total operações em andamento (de AD ATÉ FOLLOW UP) (FORMALLIZAÇÃO, COMPROVAÇÃO E ENCERRAMENTO NÃO!)
    produto_gc = 864795372
    card_type = "Principal"
    phases_produtos = [310429134, 310429135, 310429174, 310429173, 310429175, 310429177, 310496731, 310429178, 310429179]
    total_em_aberto = Card_Produtos.objects.filter(card=card_type, detalhamento__produto=produto_gc, phase_id__in=phases_produtos).aggregate(total_aberto=Sum('valor_operacao'))['total_aberto'] or 0

    #cria o objeto com os valores das metas mensais
    for meta in metas_database:
        metas['janeiro'] = float(meta.target_january) if meta.target_january != None else 0
        metas['fevereiro'] = float(meta.target_february) if meta.target_february != None else 0
        metas['março'] = float(meta.target_march) if meta.target_march != None else 0
        metas['abril'] = float(meta.target_april) if meta.target_april != None else 0
        metas['maio'] = float(meta.target_may) if meta.target_may != None else 0
        metas['junho'] = float(meta.target_june) if meta.target_june != None else 0
        metas['julho'] = float(meta.target_july) if meta.target_july != None else 0
        metas['agosto'] = float(meta.target_august) if meta.target_august != None else 0
        metas['setembro'] = float(meta.target_september) if meta.target_september != None else 0
        metas['outubro'] = float(meta.target_october) if meta.target_october != None else 0
        metas['novembro'] = float(meta.target_november) if meta.target_november != None else 0
        metas['dezembro'] = float(meta.target_december) if meta.target_december != None else 0
    
    #cria o objeto com os valores do realizado mensal do ano da busca
    for mes, soma_realizado in zip(meses, realizado_ano_db):
        realizado_ano[mes['name']] = float(soma_realizado['total'])

    #cria o objeto com os valores do realizado mensal ano anterior ao ano da busca
    for mes, soma_realizado in zip(meses, realizado_ano_anterior_db):
        realizado_ano_anterior[mes['name']] = float(soma_realizado['total'])

    #cria o objeto com os valores totais por tipo de operação de crédito
    for tipo in realizado_tipo_operacao:
        tipos_operacao[tipo['item_financiado__tipo']] = round(float(tipo['total']), 2)

    #cria o objeto com os valores de operações por bancos
    for banco in bancos_db:
        bancos[banco['instituicao__instituicao__abreviatura']] = round(float(banco['valor_operacao__sum']), 2)

    #cria o objeto com os valores médios das taxas por bancos
    for taxa in bancos_taxas_db:
        taxas[taxa['instituicao__instituicao__abreviatura']] = round(float(taxa['taxa_juros__avg']), 2)

    total_meta_ano = sum(metas.values())
    total_realizado_ano = sum(realizado_ano.values())

    #soma total projeção
    total_projecao = float(total_realizado_ano) + float(total_em_aberto)

    #soma o valor da meta até o mês pesquisado
    total_meta_ate_mes = sum(list(metas.values())[:searched_month])
    percentual_meta_ate_mes = round(total_meta_ate_mes / total_meta_ano * 100, 1) if total_meta_ano > 0 else 0

    #soma o valor das operações realizadas até o mes pesquisado
    total_realizado_ate_mes = sum(list(realizado_ano.values())[:searched_month])
    percentual_realizado_ate_mes = round(total_realizado_ate_mes / total_meta_ano * 100, 1) if total_meta_ano > 0 else 0
  
    searched_month_name = meses[searched_month - 1]['name']

    total_meta_mes = metas[searched_month_name] if searched_month_name in metas else 0
    total_realizado_mes = realizado_ano[searched_month_name] if searched_month_name in realizado_ano else 0

    percentual_ano = round(total_realizado_ano / total_meta_ano * 100, 1) if total_realizado_ano and total_meta_ano != 0 else 0
    percentual_mes = round(total_realizado_mes / total_meta_mes * 100, 1) if total_realizado_mes and total_meta_mes != 0 else 0

    context = {
        'meta': metas, 
        'realizado': realizado_ano, 
        'meta_ano': locale.currency(total_meta_ano, grouping=True), 
        'realizado_ano': locale.currency(total_realizado_ano, grouping=True),
        'realizado_ultimo_ano': realizado_ano_anterior,
        'percentual_ano': percentual_ano, 
        'percentual_mes': percentual_mes,
        'searched_year_last': past_year,
        'realizado_mes': locale.currency(total_realizado_mes, grouping=True),
        'meta_mes': locale.currency(total_meta_mes, grouping=True),
        'tipos_operacao': tipos_operacao,
        'bancos': bancos,
        'taxas': taxas,
        'anos': list(anos_operacoes),
        'taxa_media_anual': locale.format_string('%.2f', taxa_media, True),
        'area_beneficiada': locale.format_string('%.2f', area_total, True),
        'percentual_realizado_ate_mes': percentual_realizado_ate_mes,
        'total_realizado_ate_mes': locale.currency(total_realizado_ate_mes, grouping=True),
        'percentual_meta_ate_mes': percentual_meta_ate_mes,
        'total_meta_ate_mes': locale.currency(total_meta_ate_mes, grouping=True),
        'total_projecao': locale.currency(total_projecao, grouping=True), 
        'show_projecao': True if searched_year == current_year else False
    }
    return JsonResponse(context)


def dashboard_gestao_credito(request):
    #DASHBOARD ANDAMENTO GESTAO DE CREDITO
    processos_gc = []
    produtos = []
    cards_created_last_year = []
    cards_created_current_year = []
    beneficiarios_operacoes = []
    total_bancos = []
    current_year = date.today().year
    last_year = date.today().year - 1

    meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

    #id das fases de AD a FORMALIZACAO
    phases_produtos = [310429134, 310429135, 310429174, 310429173, 310429175, 310429177, 310496731, 310429178, 310429179]
    produto_gc = 864795372
    card_type = "Principal"

    #total de operações de crédito em aberto (De AP a FOLLOW UP)
    total_operacoes_em_aberto = Card_Produtos.objects.filter(phase_id__in=phases_produtos, card=card_type, detalhamento__produto=produto_gc).aggregate(total=Sum('valor_operacao'))['total'] or 0

    #busca o valor total de operações por fase (AP a FOLLOW UP)
    obj_prod_gc = Card_Produtos.objects.filter(phase_id__in=phases_produtos, card=card_type, detalhamento__produto=produto_gc).values('phase_name', 'phase_id').annotate(total=Coalesce(Sum('valor_operacao'), 0, output_field=DecimalField())).order_by('-total')
    
    #busca a quantidade de cards ativos de cada produto(Exceto nas Fases Cancelado e Concluído)
    obj_produtos = Card_Produtos.objects.exclude(phase_id__in=[310429136, 310429228]).values('detalhamento__produto', 'detalhamento__produto__description').annotate(total=Count('id'))
   
    for obj in obj_prod_gc:
        if obj["total"] > 0:
            processos_gc.append({
                'phase_name': obj["phase_name"],
                'total': float(obj["total"]),
                'phase_id': obj["phase_id"]
            })
    
    for produto in obj_produtos:
        produtos.append({
            produto['detalhamento__produto__description']: produto["total"]
        })

    #busca os cards criados no ano atual (agrupado por mês)
    cards_current_year = Card_Produtos.objects.filter(created_at__year=current_year, card=card_type, detalhamento__produto=produto_gc).values('created_at__month').annotate(total=Count('id')).order_by('created_at__month')
    
    #busca os cards criados no último ano (agrupado por mês)
    cards_last_year = Card_Produtos.objects.filter(created_at__year=last_year, card=card_type, detalhamento__produto=produto_gc).values('created_at__month').annotate(total=Count('id')).order_by('created_at__month') 

    for mes, card in zip(meses, cards_current_year):
        cards_created_current_year.append({
            mes: card['total']
        })

    for mes, card in zip(meses, cards_last_year):
        cards_created_last_year.append({
            mes: card['total']
        })
   
    #busca o total de operações em andamento por grupo beneficiários (top 10)
    total_operacoes_beneficiario = Card_Produtos.objects.filter(phase_id__in=phases_produtos, card=card_type, detalhamento__produto=produto_gc).values('beneficiario__razao_social').annotate(total=Coalesce(Sum('valor_operacao'), 0, output_field=DecimalField())).order_by('-total')[:10]
    
    for beneficiario in total_operacoes_beneficiario:
        if beneficiario['total'] > 0:
            beneficiarios_operacoes.append({beneficiario["beneficiario__razao_social"]: float(beneficiario["total"])})

    #busca o total de operações em andamento por instituição financeira
    total_operacoes_institucoes = Card_Produtos.objects.filter(phase_id__in=phases_produtos, card=card_type, detalhamento__produto=produto_gc).values('instituicao__instituicao__abreviatura').annotate(total=Coalesce(Sum('valor_operacao'), 0, output_field=DecimalField())).order_by('-total')

    for instituicao in total_operacoes_institucoes:
        if instituicao['total'] > 0:
            total_bancos.append({instituicao['instituicao__instituicao__abreviatura']: float(instituicao['total'])})

    context = {
        'processos_gc': processos_gc, 
        'produtos': produtos,
        'cards_current_year': cards_created_current_year,
        'cards_last_year': cards_created_last_year,
        'last_year': last_year,
        'total_beneficiarios': beneficiarios_operacoes,
        'total_bancos': total_bancos,
        'total_operacoes_em_aberto': locale.currency(total_operacoes_em_aberto, grouping=True)
    }
    return JsonResponse(context)

def dashboard_prospects(request):
    #DASHBOARD PROSPECTS
    current_year = date.today().year

    #fases de START a FORMALIZAÇÃO
    prospects_phases = [310425915, 310425916, 310425917, 310426145, 310426175, 310426184, 310426296, 312006210, 310426297]
    prospects = Card_Prospects.objects.filter(phase_id__in=prospects_phases)
    prospects_pv = Card_Prospects.objects.filter(phase_id=310426184)
    total_pv_inicial =  prospects_pv.aggregate(total=Sum('proposta_inicial'))['total'] or 0
    media_pv_inicial = prospects_pv.aggregate(media=Avg('percentual_inicial'))['media'] or 0
    
    #CONTAGEM DE PROSPECTS POR PRODUTO, CLASSIFICAÇÃO E POR FASE
    produtos_db = prospects.values('produto').annotate(count=Count('produto'))
    classificacao_db = prospects.values('classificacao').annotate(count=Count('classificacao'))
    fases_db = prospects.values('phase_name').annotate(count=Count('phase_name')).order_by('-count')  

    produtos = [{
        'produto': prod['produto'],
        'total': prod['count']
    } for prod in produtos_db]

    classificacao = [{
        'classificacao': classif['classificacao'],
        'total': classif['count']
    } for classif in classificacao_db]

    fases = [{
        'fase': fase['phase_name'],
        'total': fase['count']
    } for fase in fases_db]

    context = {
        'qtd_prospects': prospects.count(),
        'qtd_proposta_valor': prospects_pv.count(),
        'valor_proposta_valor': f"R$ {locale.format_string('%.2f', total_pv_inicial, True)}",
        'media_proposta_valor': locale.format_string('%.2f', media_pv_inicial, True),
        'produtos': produtos,
        'classificacao': classificacao,
        'fases': fases,
    }
    return JsonResponse(context)

def dashboard_produtos(request):
    current_year = date.today().year
    type_card = "Principal"
    produto_gc = 864795372
    produto_gai = 864795466
    processos = Card_Produtos.objects.exclude(phase_id__in=[310429136, 310429228]).filter(card=type_card)
    fatu_estimado_total = processos.aggregate(total=Sum('faturamento_estimado'))['total'] or 0
    concluidos_gc = Card_Produtos.objects.filter(phase_id=310429136, card=type_card, detalhamento__produto=produto_gc, created_at__year=current_year).count()
    concluidos_gai = Card_Produtos.objects.filter(phase_id=310429136, card=type_card, detalhamento__produto=produto_gai, created_at__year=current_year).count()

    fatu_estimado_gai = processos.values('phase_name').filter(detalhamento__produto=produto_gai).annotate(total=Sum('faturamento_estimado')).order_by('-total')
    faturamento_estimado_gai = [{
        'fase': fatu['phase_name'],
        'total': float(fatu['total'] or 0),
    } for fatu in fatu_estimado_gai]

    fatu_estimado_gc = processos.values('phase_name').filter(detalhamento__produto=produto_gc).annotate(total=Sum('faturamento_estimado')).order_by('-total')
    faturamento_estimado_gc = [{
        'fase': fatu['phase_name'],
        'total': float(fatu['total'] or 0),
    } for fatu in fatu_estimado_gc]

    total_operacoes_andamento = processos.values('phase_name').filter(detalhamento__produto=produto_gc).annotate(total=Sum('valor_operacao')).order_by('-total')
    operacoes_andamento = [{
        'fase': operacao['phase_name'],
        'total': float(operacao['total'] or 0),
    } for operacao in total_operacoes_andamento]

    context = {
        'qtd_processos': processos.count(),
        'qtd_gestao_ambiental': processos.filter(detalhamento__produto=produto_gai).count(),
        'qtd_gestao_credito': processos.filter(detalhamento__produto=produto_gc).count(),
        'fatu_estimado_total': locale.currency(fatu_estimado_total, grouping=True),
        'faturamento_estimado_gai': faturamento_estimado_gai,
        'faturamento_estimado_gc': faturamento_estimado_gc,
        'concluidos_gc': concluidos_gc,
        'concluidos_gai': concluidos_gai,
        'operacoes_andamento': operacoes_andamento,
    }
    return JsonResponse(context)

def dashboard_gestao_ambiental(request):
    #DASHBOARD GESTÃO AMBIENTAL E IRRIGAÇÃO
    processos = {}
    abertos = []
    abertos_last = []
    faturamento = {}
    produto_gai = 864795466
    card_type = "Principal"
    current_year = date.today().year
    last_year = int(current_year - 1)
    phases_produtos = [310429135, 310429174, 310429173, 310429175, 310429177, 310496731, 310429178, 310429179]
    phases_produtos_fatu_estimado = [310429134, 310429135, 310429174, 310429173, 310429175, 310429177, 310496731, 310429178, 310429179, 310429196]

    processos_instituicoes = Card_Produtos.objects.filter(phase_id__in=phases_produtos, card=card_type, detalhamento__produto=produto_gai).values('instituicao__instituicao__abreviatura').annotate(count=Count('id')).order_by('-count')

    for processo in processos_instituicoes:
        processos[processo['instituicao__instituicao__abreviatura']] = processo['count']

    faturamento_fases = Card_Produtos.objects.filter(phase_id__in=phases_produtos_fatu_estimado, card=card_type, detalhamento__produto=produto_gai).values('phase_name').annotate(total=Sum('faturamento_estimado')).order_by('-total')
    
    for phase in faturamento_fases:
        faturamento[phase['phase_name']] = float(phase['total']) if phase['total'] != None else 0
    
    processos_abertos = Card_Produtos.objects.filter(created_at__year=current_year, phase_id__in=phases_produtos, card=card_type, detalhamento__produto=produto_gai).values('created_at__month').annotate(count=Count('id')).order_by('created_at__month')
    processos_abertos_last = Card_Produtos.objects.filter(created_at__year=last_year, phase_id__in=phases_produtos, card=card_type, detalhamento__produto=produto_gai).values('created_at__month').annotate(count=Count('id')).order_by('created_at__month')

    for processo in processos_abertos:
        abertos.append(processo['count'])

    for processo in processos_abertos_last:
        abertos_last.append(processo['count'])

    qtd_processos = Card_Produtos.objects.filter(phase_id__in=phases_produtos, card=card_type, detalhamento__produto=produto_gai).count()
    qtd_pocos = APPO_INEMA_Coordenadas.objects.all().count()
    qtd_outorgas = Outorgas_INEMA_Coordenadas.objects.all().count()
    qtd_pivots = Cadastro_Pivots.objects.all().count()

    days_processos = Processos_Andamento.objects.filter(processo__card=card_type, processo__detalhamento__produto=produto_gai)
    tempo_dias_requerimento = []
    tempo_dias_formacao = []
    tempo_dias_formacao_aberto = []
    
    for p in days_processos:
        x = (p.data_requerimento - p.processo.created_at.date()).days if p.data_requerimento != None else 0
        y = (p.data_formacao - p.data_requerimento).days if p.data_formacao != None else 0
        z = (p.data_formacao - p.processo.created_at.date()).days if p.data_formacao != None else 0
        tempo_dias_requerimento.append(x) if x > 0 else None
        tempo_dias_formacao.append(y) if y > 0 else None
        tempo_dias_formacao_aberto.append(z) if z > 0 else None

    dias_requerimento = int(statistics.mean(tempo_dias_requerimento)) if len(tempo_dias_requerimento) > 0 else 0
    dias_formacao = int(statistics.mean(tempo_dias_formacao) or 0) if len(tempo_dias_formacao) > 0 else 0
    dias_formacao_aberto = int(statistics.mean(tempo_dias_formacao_aberto) or 0) if len(tempo_dias_formacao_aberto) > 0 else 0

    context = {
        'processos': processos,
        'faturamentos': faturamento,
        'abertos': abertos,
        'abertos_last': abertos_last,
        'qtd_processos': locale.format_string('%.0f', qtd_processos, True),
        'qtd_appo': locale.format_string('%.0f', qtd_pocos, True),
        'qtd_outorgas': locale.format_string('%.0f', qtd_outorgas, True),
        'qtd_pivots': locale.format_string('%.0f', qtd_pivots, True),
        'tempo_dias_requerimento': f"{dias_requerimento} {'dias' if dias_requerimento > 1 else 'dia'}" if dias_requerimento > 0 else '-',
        'tempo_dias_formacao': f"{dias_formacao} {'dias' if dias_formacao > 1 else 'dia'}" if dias_formacao > 0 else '-',
        'tempo_dias_formacao_aberto': f"{dias_formacao_aberto} {'dias' if dias_formacao_aberto > 1 else 'dia'}" if dias_formacao_aberto > 0 else '-'
    }
    return JsonResponse(context)


def pagamentos_pipefy_dashboard(request):
    #DASHBOARD DE PAGAMENTOS
    categorias = {}
    current_year = int(date.today().year)
    current_month = int(date.today().month)
    search_year = request.GET.get('year')
    search_month = request.GET.get('month')

    if search_year and search_month:
        query_search = (Q(data_vencimento__year=search_year) | Q(data_pagamento__year=search_year)) & (Q(data_vencimento__month=search_month) | Q(data_pagamento__month=search_month))
        searched_year = int(search_year)
        searched_month = int(search_month)
    else:
        query_search = (Q(data_vencimento__year=current_year) | Q(data_pagamento__year=current_year)) & (Q(data_vencimento__month=current_month) | Q(data_pagamento__month=current_month))
        searched_year = current_year
        searched_month = current_month

    anos = Card_Pagamentos.objects.values_list('data_vencimento__year', flat=True).distinct()
    meses = [{'number': 1, 'abrev': 'JAN', 'name': 'janeiro'},
        {'number': 2, 'abrev': 'FEV', 'name': 'fevereiro'},
        {'number': 3, 'abrev': 'MAR', 'name': 'março'},
        {'number': 4, 'abrev': 'ABR', 'name': 'abril'},
        {'number': 5, 'abrev': 'MAI', 'name': 'maio'},
        {'number': 6, 'abrev': 'JUN', 'name': 'junho'},
        {'number': 7, 'abrev': 'JUL', 'name': 'julho'},
        {'number': 8, 'abrev': 'AGO', 'name': 'agosto'},
        {'number': 9, 'abrev': 'SET', 'name': 'setembro'},
        {'number': 10, 'abrev': 'OUT', 'name': 'outubro'},
        {'number': 11, 'abrev': 'NOV', 'name': 'novembro'},
        {'number': 12, 'abrev': 'DEZ', 'name': 'dezembro'}
    ]
    #TOTAL DE PAGAMENTOS POR FASE
    query_pagamentos_fases = Card_Pagamentos.objects.filter(query_search).aggregate(
        conferencia=Sum(Case(When(phase_id=317163730, then='valor_pagamento'), default=0, output_field=DecimalField())),
        agendado=Sum(Case(When(phase_id=317163731, then='valor_pagamento'), default=0, output_field=DecimalField())),
        pago=Sum(Case(When(phase_id=317163732, then='valor_pagamento'), default=0, output_field=DecimalField())))
    
    total_conferencia = query_pagamentos_fases.get('conferencia', 0) or 0
    total_agendado = query_pagamentos_fases.get('agendado', 0) or 0
    total_pago = query_pagamentos_fases.get('pago', 0) or 0
    total_pagamentos = total_conferencia + total_agendado + total_pago

    #PERCENTUAL DE PAGAMENTOS POR FASE
    percentual_conferencia = round((total_conferencia / total_pagamentos) * 100, 1) if total_pagamentos != 0 else 0
    percentual_agendado = round((total_agendado / total_pagamentos) * 100, 1) if total_pagamentos != 0 else 0
    percentual_pago = round((total_pago / total_pagamentos) * 100, 1) if total_pagamentos != 0 else 0
 
    #PAGAMENTOS POR CATEGORIA
    pagamentos_categoria = Card_Pagamentos.objects.filter(query_search).values('categoria__category').annotate(total=Sum('valor_pagamento')).order_by('-total')[:10]
    for pagamento in pagamentos_categoria:
        categorias[pagamento['categoria__category']] = pagamento['total']

    context = {
        'conferencia':  locale.currency(total_conferencia, grouping=True),
        'agendado': locale.currency(total_agendado, grouping=True),
        'pago': locale.currency(total_pago, grouping=True),
        'total_pagamentos': locale.currency(total_pagamentos, grouping=True),
        'percentual_conferencia': percentual_conferencia,
        'percentual_agendado': percentual_agendado,
        'percentual_pago': percentual_pago,
        'categorias': categorias,
        # 'meses': meses,
        'anos': list(anos),
        # 'searched_month': searched_month,
        # 'searched_year': searched_year,
        'uuid': uuid.uuid4()
    }
    return JsonResponse(context)


def cobrancas_pipefy_dashboard(request):
    #VISUALIZAR DASHBOARD DE COBRANÇAS
    current_year = int(date.today().year)
    produto_gc = 864795372
    produto_gai = 864795466
    produto_avaliacao = 864795628
    produto_tecnologia = 864795734
    #COBRANÇAS ABERTAS
    query_cobrancas_abertas= Card_Cobrancas.objects.aggregate(
        aguardando=Sum(Case(When(phase_id=317532037, then='saldo_devedor'), default=0, output_field=DecimalField())),
        notificacao=Sum(Case(When(phase_id=317532038, then='saldo_devedor'), default=0, output_field=DecimalField())),
        faturamento=Sum(Case(When(phase_id=318663454, then='saldo_devedor'), default=0, output_field=DecimalField())),
        confirmacao=Sum(Case(When(phase_id=317532040, then='saldo_devedor'), default=0, output_field=DecimalField())))

    total_aguardando_distribuicao = query_cobrancas_abertas.get('aguardando', 0) or 0
    total_notificacao = query_cobrancas_abertas.get('notificacao', 0) or 0
    total_faturamento = query_cobrancas_abertas.get('faturamento', 0) or 0
    total_confirmacao = query_cobrancas_abertas.get('confirmacao', 0) or 0
    total_cobrancas_abertas = total_aguardando_distribuicao + total_notificacao + total_faturamento + total_confirmacao
    #id das fases de cobranças abertas (não pagas - AD, Not, Fatu e Conf)
    id_phases_cobracas_abertas = [317532037, 317532038, 318663454, 317532040]
    #CÁLCULO TOTAL ABERTO POR PRODUTO
    query_aberto_produtos= Card_Cobrancas.objects.filter(phase_id__in=id_phases_cobracas_abertas).aggregate(
        gc=Sum(Case(When(detalhamento__produto=produto_gc, then='saldo_devedor'), default=0, output_field=DecimalField())),
        gai=Sum(Case(When(detalhamento__produto=produto_gai, then='saldo_devedor'), default=0, output_field=DecimalField())),
        ava=Sum(Case(When(detalhamento__produto=produto_avaliacao, then='saldo_devedor'), default=0, output_field=DecimalField())),
        tec=Sum(Case(When(detalhamento__produto=produto_tecnologia, then='saldo_devedor'), default=0, output_field=DecimalField())))

    aberto_gc = query_aberto_produtos.get('gc', 0) or 0
    aberto_gai = query_aberto_produtos.get('gai', 0) or 0
    aberto_avaliacao = query_aberto_produtos.get('ava', 0) or 0
    aberto_tecnologia = query_aberto_produtos.get('tec', 0) or 0

    #CÁLCULO VALOR TOAL FATURADO (CONSOLIDADO) POR PRODUTO - ANO ATUAL
    query_faturamento_consolidado= Card_Cobrancas.objects.filter(phase_id=317532039, data_pagamento__year=current_year).aggregate(
        gc=Sum(Case(When(detalhamento__produto=produto_gc, then='valor_faturado'), default=0, output_field=DecimalField())),
        gai=Sum(Case(When(detalhamento__produto=produto_gai, then='valor_faturado'), default=0, output_field=DecimalField())),
        ava=Sum(Case(When(detalhamento__produto=produto_avaliacao, then='valor_faturado'), default=0, output_field=DecimalField())),
        tec=Sum(Case(When(detalhamento__produto=produto_tecnologia, then='valor_faturado'), default=0, output_field=DecimalField())))

    faturado_gc = query_faturamento_consolidado.get('gc', 0) or 0
    faturado_gai = query_faturamento_consolidado.get('gai', 0) or 0
    faturado_avaliacao = query_faturamento_consolidado.get('ava', 0) or 0
    faturado_tecnologia = query_faturamento_consolidado.get('tec', 0) or 0
    faturado_total = faturado_gc + faturado_gai + faturado_avaliacao + faturado_tecnologia
    #PREVISÃO DE FATURAMENTO ANUAL
    previsao_faturamento = faturado_total + total_cobrancas_abertas
    context = {
        'total_aguardando': locale.currency(total_aguardando_distribuicao, grouping=True),
        'total_notificacao': locale.currency(total_notificacao, grouping=True),
        'total_faturamento': locale.currency(total_faturamento, grouping=True),
        'total_confirmacao': locale.currency(total_confirmacao, grouping=True),
        'percentual_aguardando': round(total_aguardando_distribuicao / total_cobrancas_abertas * 100, 1) if total_cobrancas_abertas > 0 else 0,
        'percentual_notificacao': round(total_notificacao / total_cobrancas_abertas * 100, 1) if total_cobrancas_abertas > 0 else 0,
        'percentual_faturamento': round(total_faturamento / total_cobrancas_abertas * 100, 1) if total_cobrancas_abertas > 0 else 0,
        'percentual_confirmacao': round(total_confirmacao / total_cobrancas_abertas * 100, 1) if total_cobrancas_abertas > 0 else 0,
        'aberto_gc': locale.currency(aberto_gc, grouping=True),
        'percentual_aberto_gc': round(aberto_gc / total_cobrancas_abertas * 100, 1) if total_cobrancas_abertas > 0 else 0,
        'aberto_gai': locale.currency(aberto_gai, grouping=True),
        'percentual_aberto_gai': round(aberto_gai / total_cobrancas_abertas * 100, 1) if total_cobrancas_abertas > 0 else 0,
        'aberto_avaliacao': locale.currency(aberto_avaliacao, grouping=True),
        'percentual_aberto_avaliacao': round(aberto_avaliacao / total_cobrancas_abertas * 100, 1) if total_cobrancas_abertas > 0 else 0,
        'aberto_tecnologia': locale.currency(aberto_tecnologia, grouping=True),
        'percentual_aberto_tecnologia': round(aberto_tecnologia / total_cobrancas_abertas * 100, 1) if total_cobrancas_abertas > 0 else 0,
        'faturado_gc': locale.currency(faturado_gc, grouping=True),
        'faturado_gai': locale.currency(faturado_gai, grouping=True),
        'faturado_avaliacao': locale.currency(faturado_avaliacao, grouping=True),
        'faturado_tecnologia': locale.currency(faturado_tecnologia, grouping=True),
        'faturado_total': locale.currency(faturado_total, grouping=True),
        'aberto_total': locale.currency(total_cobrancas_abertas, grouping=True),
        'percentual_faturado_gc': round(faturado_gc / faturado_total * 100, 1) if faturado_total > 0 else 0,
        'percentual_faturado_gai': round(faturado_gai / faturado_total * 100, 1) if faturado_total > 0 else 0,
        'percentual_faturado_avaliacao': round(faturado_avaliacao / faturado_total * 100, 1) if faturado_total > 0 else 0,
        'percentual_faturado_tecnologia': round(faturado_tecnologia / faturado_total * 100, 1) if faturado_total > 0 else 0,
        'previsao_faturamento_anual': locale.currency(previsao_faturamento, grouping=True)
    }
    return JsonResponse(context)
