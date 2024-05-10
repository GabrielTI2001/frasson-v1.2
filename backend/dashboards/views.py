from django.shortcuts import render
from django.db.models import Avg, Sum, Count, DecimalField
from django.db.models.functions import Coalesce
from django.http import JsonResponse
from datetime import date
import locale, json
from django.core import serializers
from pipefy.models import Operacoes_Contratadas, Card_Produtos
from kpi.models import Indicadores_Frasson, Metas_Realizados

# Create your views here.

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
        'current_year': current_year,
        'last_year': last_year,
        'total_beneficiarios': beneficiarios_operacoes,
        'total_bancos': total_bancos,
        'total_operacoes_em_aberto': locale.currency(total_operacoes_em_aberto, grouping=True)
    }

    return JsonResponse(context)