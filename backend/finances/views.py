from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from .models import Cobrancas_Pipefy, Pagamentos_Pipefy, Reembolso_Cliente, Resultados_Financeiros, Lancamentos_Automaticos_Pagamentos
from pipefy.models import Card_Produtos, Card_Prospects
from django.db.models import Sum, Q, Case, When, DecimalField
from backend.frassonUtilities import Frasson
from datetime import date
from collections import defaultdict
import locale, uuid

class AutomPagamentosView(viewsets.ModelViewSet):
    queryset = Lancamentos_Automaticos_Pagamentos.objects.all()
    serializer_class = detailAutomPagamentos
    # permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)   
        if search:
            queryset = queryset.filter(Q(beneficiario__razao_social__icontains=search) | Q(categoria_pagamento__category__icontains=search) | 
                Q(descricao__icontains=search)
            )
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listAutomPagamentos
        else:
            return self.serializer_class
        
class CategoriaPagamentosView(viewsets.ModelViewSet):
    queryset = Categorias_Pagamentos.objects.all()
    serializer_class = listCategoriaPagamentos
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)   
        if search:
            queryset = queryset.filter(Q(category__icontains=search) | Q(sub_category__icontains=search))
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listCategoriaPagamentos
        else:
            return self.serializer_class


def index_dre_consolidado(request):
    #DRE CONSOLIDADO
    produto_gc = 864795372
    produto_gai = 864795466
    produto_avaliacao = 864795628
    produto_tecnologia = 864795734
    class_custo = 'Custo Operacional'
    class_desp_oper = 'Despesa Operacional'
    class_desp_nao_oper = 'Despesa Não Operacional'
    class_retirada = 'Retirada de Sócio'
    class_comissao = 'Pagamento Comissão'
    class_ativos = 'Ativos Imobilizados'
    class_outros = 'Outros'

    anos = [ano for ano in range(2021, date.today().year + 1)] #cria a lista dos anos de busca
    search = request.GET.get('search')

    if search: 
        year = int(search)
    else: 
        year = date.today().year
    
    #FATURAMENTO CONSOLIDADO POR PRODUTO
    query_faturado_total= Cobrancas_Pipefy.objects.filter(data_pagamento__year=year, phase_id=317532039).aggregate(
        credito=Sum(Case(When(detalhamento__produto=produto_gc, then='valor_faturado'), default=0, output_field=DecimalField())),
        ambiental=Sum(Case(When(detalhamento__produto=produto_gai, then='valor_faturado'), default=0, output_field=DecimalField())),
        avaliacao=Sum(Case(When(detalhamento__produto=produto_avaliacao, then='valor_faturado'), default=0, output_field=DecimalField())),
        tecnologia=Sum(Case(When(detalhamento__produto=produto_tecnologia, then='valor_faturado'), default=0, output_field=DecimalField())))

    faturado_gai = query_faturado_total.get('ambiental', 0) or 0
    faturado_gc = query_faturado_total.get('credito', 0) or 0
    faturado_avaliacao = query_faturado_total.get('avaliacao', 0) or 0
    faturado_tecnologia = query_faturado_total.get('tecnologia', 0) or 0
    faturado_total = faturado_gai + faturado_gc + faturado_avaliacao + faturado_tecnologia

    #PERCENTUAL DO TOTAL FATURADO POR PRODUTO
    percentual_faturado_gai = (faturado_gai / faturado_total * 100) if faturado_total > 0 else 0
    percentual_faturado_gc = (faturado_gc / faturado_total * 100) if faturado_total > 0 else 0
    percentual_faturado_avaliacao = (faturado_avaliacao / faturado_total * 100) if faturado_total > 0 else 0
    percentual_faturado_tecnologia = (faturado_tecnologia / faturado_total * 100) if faturado_total > 0 else 0

    #FATURAMENTO TRIBUTADO E SEM TRIBUTAÇÃO
    query_fatu_tributacao = Cobrancas_Pipefy.objects.filter(data_pagamento__year=year, phase_id=317532039).aggregate(
        faturamento_tributado=Sum(Case(When(~Q(caixa_id=667994628), then='valor_faturado'), default=0, output_field=DecimalField())),
        faturamento_sem_tributacao=Sum(Case(When(caixa_id=667994628, then='valor_faturado'), default=0, output_field=DecimalField())))

    faturamento_tributado = query_fatu_tributacao.get('faturamento_tributado', 0) or 0
    faturamento_sem_tributacao = query_fatu_tributacao.get('faturamento_sem_tributacao', 0) or 0  
    percentual_fatu_tributado = (faturamento_tributado / faturado_total * 100) if faturado_total > 0 else 0
    percentual_fatu_sem_tributacao = (faturamento_sem_tributacao / faturado_total) * 100 if faturado_total > 0 else 0
 
    #IMPOSTOS INDIRETOS (ISS, PIS E COFINS) - VALOR TOTAL E PERCENTUAL
    query_total_impostos_indiretos = Pagamentos_Pipefy.objects.filter(phase_id=317163732, data_pagamento__year=year).aggregate(
        total_iss=Sum(Case(When(categoria_id=687761062, then='valor_pagamento'), default=0, output_field=DecimalField())),
        total_pis=Sum(Case(When(categoria_id=687760058, then='valor_pagamento'), default=0, output_field=DecimalField())),
        total_cofins=Sum(Case(When(categoria_id=687760600, then='valor_pagamento'), default=0, output_field=DecimalField())))

    total_iss = query_total_impostos_indiretos.get('total_iss', 0) or 0
    total_pis = query_total_impostos_indiretos.get('total_pis', 0) or 0
    total_cofins = query_total_impostos_indiretos.get('total_cofins', 0) or 0
    total_impostos_indiretos = total_iss + total_pis + total_cofins
    percentual_iss = (total_iss / total_impostos_indiretos * 100) if total_impostos_indiretos > 0 else 0
    percentual_pis = (total_pis / total_impostos_indiretos * 100) if total_impostos_indiretos > 0 else 0
    percentual_cofins = (total_cofins / total_impostos_indiretos * 100) if total_impostos_indiretos > 0 else 0

    #CÁLCULO DA RECEITA LÍQUIDA
    receita_liquida = faturado_total - total_impostos_indiretos
 
    #TOTAL CUSTOS, DESPESAS OPERACIONAIS E DESPESAS NÃO OPERACIONAIS
    query_total_despesas = Pagamentos_Pipefy.objects.filter(phase_id=317163732, data_pagamento__year=year).aggregate(
        total_custos=Sum(Case(When(categoria__classification=class_custo, then='valor_pagamento'), default=0, output_field=DecimalField())),
        total_desp_oper=Sum(Case(When(categoria__classification=class_desp_oper, then='valor_pagamento'), default=0, output_field=DecimalField())),
        total_desp_nao_oper=Sum(Case(When(categoria__classification=class_desp_nao_oper, then='valor_pagamento'), default=0, output_field=DecimalField())))

    total_custos = query_total_despesas.get('total_custos', 0) or 0
    total_desp_oper = query_total_despesas.get('total_desp_oper', 0) or 0
    total_desp_nao_oper = query_total_despesas.get('total_desp_nao_oper', 0) or 0
    total_despesas = total_desp_oper + total_desp_nao_oper

    #CÁLCULO LUCRO BRUTO
    lucro_bruto = receita_liquida - total_custos

    #CÁLCULO LUCRO OPERACIONAL
    lucro_operacional = lucro_bruto - total_despesas

    #RESULTADO FINANCEIRO E REEMBOLSOS CLIENTES
    query_resultado_financeiro = Resultados_Financeiros.objects.filter(data__year=year).aggregate(
        despesas_financeiras=Sum(Case(When(tipo__tipo='D', then='valor'), default=0, output_field=DecimalField())),
        receitas_financeiras=Sum(Case(When(tipo__tipo='R', then='valor'), default=0, output_field=DecimalField())))
    
    despesas_financeiras = query_resultado_financeiro.get('despesas_financeiras', 0) or 0
    receitas_financeiras = query_resultado_financeiro.get('receitas_financeiras', 0) or 0
    reembolsos_clientes = Reembolso_Cliente.objects.filter(data__year=year).aggregate(total=Sum('valor'))['total'] or 0    
    resultado_financeiro = receitas_financeiras - despesas_financeiras + reembolsos_clientes

    #CÁLCULO EBITDA
    ebitda = lucro_operacional + resultado_financeiro

    #CÁLCULO IMPOSTOS DIRETOS (CSLL E IRPJ)
    query_total_impostos_diretos = Pagamentos_Pipefy.objects.filter(phase_id=317163732, data_pagamento__year=year).aggregate(
        total_csll=Sum(Case(When(categoria_id=687761501, then='valor_pagamento'), default=0, output_field=DecimalField())),
        total_irpj=Sum(Case(When(categoria_id=687761676, then='valor_pagamento'), default=0, output_field=DecimalField())))

    total_csll = query_total_impostos_diretos.get('total_csll', 0) or 0
    total_irpj = query_total_impostos_diretos.get('total_irpj', 0) or 0
    total_impostos_diretos = total_csll + total_irpj
    percentual_csll = (total_csll / total_impostos_diretos * 100) if total_impostos_diretos > 0 else 0
    percentual_irpj = (total_irpj / total_impostos_diretos * 100) if total_impostos_diretos > 0 else 0

    #CÁLCULO LUCRO LÍQUIDO
    lucro_liquido = ebitda - total_impostos_diretos

    #CÁLCULOS MARGEM
    margem_liquida = (lucro_liquido / faturado_total * 100) if faturado_total > 0 else 0
    margem_bruta = (lucro_bruto / faturado_total * 100) if faturado_total > 0 else 0

    #CÁLCULO PERCENTUAL IMPOSTOS DIRETOS E INDIRETOS
    total_impostos = total_impostos_diretos + total_impostos_indiretos
    percentual_impostos_tributado = (total_impostos / faturamento_tributado * 100) if faturamento_tributado > 0 else 0
    percentual_impostos_total = (total_impostos / faturado_total * 100) if faturado_total > 0 else 0

    #CALCULA SALDOS CONSIDERANDO RETIRADAS DE SÓCIO, PAG. COMISSÃO, ATIVOS IMOB. E OUTROS ACERTOS
    query_dre_saldos = Pagamentos_Pipefy.objects.filter(phase_id=317163732, data_pagamento__year=year).aggregate(
        retirada_socios=Sum(Case(When(categoria__classification=class_retirada, then='valor_pagamento'), default=0, output_field=DecimalField())),
        pagamento_comissao=Sum(Case(When(categoria__classification=class_comissao, then='valor_pagamento'), default=0, output_field=DecimalField())),
        ativos_imobilizados=Sum(Case(When(categoria__classification=class_ativos, then='valor_pagamento'), default=0,  output_field=DecimalField())),
        outros_acertos=Sum(Case(When(categoria__classification=class_outros, then='valor_pagamento'), default=0, output_field=DecimalField())))
    
    retirada_socios = query_dre_saldos.get('retirada_socios', 0) or 0
    pagamento_comissao = query_dre_saldos.get('pagamento_comissao', 0) or 0
    ativos_imobilizados = query_dre_saldos.get('ativos_imobilizados', 0) or 0
    outros_acertos = query_dre_saldos.get('outros_acertos', 0) or 0
    total_retiradas_comissoes = retirada_socios + pagamento_comissao
    saldo_inicial_ano = Frasson.saldoInicialAno(year=year)
    saldo_inicio_exercicio = round(float(saldo_inicial_ano) - float(total_retiradas_comissoes) - float(ativos_imobilizados) - float(outros_acertos), 2)
    saldo_atual = float(saldo_inicio_exercicio) + float(lucro_liquido)

    context = {
        'uuid': uuid.uuid4(),
        'anos': anos,
        'current_year': year,
        'saldo_inicial_ano': locale.currency(saldo_inicial_ano, grouping=True),
        'retiradas_socios': locale.currency(retirada_socios, grouping=True),
        'pagamento_comissao': locale.currency(pagamento_comissao, grouping=True),
        'total_retiradas_comissoes': locale.currency(total_retiradas_comissoes, grouping=True),
        'ativos_imobilizados': locale.currency(ativos_imobilizados, grouping=True),
        'outros_acertos': locale.currency(outros_acertos, grouping=True),
        'saldo_atual': locale.currency(saldo_atual, grouping=True),
        'saldo_inicio_exercicio': locale.currency(saldo_inicio_exercicio, grouping=True),
        'faturado_gai': locale.currency(faturado_gai, grouping=True),
        'percentual_faturado_gai': f"{locale.format_string('%.1f', percentual_faturado_gai, True)}%",
        'faturado_gc': locale.currency(faturado_gc, grouping=True),
        'percentual_faturado_gc': f"{locale.format_string('%.1f', percentual_faturado_gc, True)}%",
        'faturado_avaliacao': locale.currency(faturado_avaliacao, grouping=True),
        'percentual_faturado_avaliacao': f"{locale.format_string('%.1f', percentual_faturado_avaliacao, True)}%",
        'faturado_tecnologia': locale.currency(faturado_tecnologia, grouping=True),
        'percentual_faturado_tecnologia': f"{locale.format_string('%.1f', percentual_faturado_tecnologia, True)}%",
        'faturado_total': locale.currency(faturado_total, grouping=True),
        'total_iss': locale.currency(total_iss, grouping=True),
        'percentual_iss': f"{locale.format_string('%.1f', percentual_iss, True)}%",
        'total_pis': locale.currency(total_pis, grouping=True),
        'percentual_pis': f"{locale.format_string('%.1f', percentual_pis, True)}%",
        'total_cofins': locale.currency(total_cofins, grouping=True),
        'percentual_cofins': f"{locale.format_string('%.1f', percentual_cofins, True)}%",
        'total_impostos_indiretos': locale.currency(total_impostos_indiretos, grouping=True),
        'receita_liquida': locale.currency(receita_liquida, grouping=True),
        'total_custos': locale.currency(total_custos, grouping=True),
        'lucro_bruto': locale.currency(lucro_bruto, grouping=True),
        'despesas_operacionais': locale.currency(total_desp_oper, grouping=True),
        'despesas_nao_operacionais': locale.currency(total_desp_nao_oper, grouping=True),
        'total_despesas': locale.currency(total_despesas, grouping=True),
        'despesas_financeiras': locale.currency(despesas_financeiras, grouping=True),
        'receitas_financeiras': locale.currency(receitas_financeiras, grouping=True),
        'resultado_financeiro': locale.currency(resultado_financeiro, grouping=True),
        'lucro_operacional': locale.currency(lucro_operacional, grouping=True),
        'reembolso_clientes': locale.currency(reembolsos_clientes, grouping=True),
        'ebitda': locale.currency(ebitda, grouping=True),
        'total_csll': locale.currency(total_csll, grouping=True),
        'percentual_csll': f"{locale.format_string('%.1f', percentual_csll, True)}%",
        'total_irpj': locale.currency(total_irpj, grouping=True),
        'percentual_irpj': f"{locale.format_string('%.1f', percentual_irpj, True)}%",
        'total_impostos_diretos': locale.currency(total_impostos_diretos, grouping=True),
        'lucro_liquido': locale.currency(lucro_liquido, grouping=True),
        'margem_liquida': f"{locale.format_string('%.1f', margem_liquida, True)}%",
        'margem_bruta': f"{locale.format_string('%.1f', margem_bruta, True)}%",
        'total_impostos': locale.currency(total_impostos, grouping=True),
        'percentual_impostos_tributado': f"{locale.format_string('%.1f', percentual_impostos_tributado, True)}%",
        'percentual_impostos_total' : f"{locale.format_string('%.1f', percentual_impostos_total, True)}%",
        'faturamento_sem_tributacao': locale.currency(faturamento_sem_tributacao, grouping=True),
        'percentual_fatu_sem_tributacao': f"{locale.format_string('%.1f', percentual_fatu_sem_tributacao, True)}%",
        'faturamento_tributado': locale.currency(faturamento_tributado, grouping=True),
        'percentual_fatu_tributado': f"{locale.format_string('%.1f', percentual_fatu_tributado, True)}%",
    }
    return JsonResponse(context)


def index_dre_provisionado(request):
    #DRE PROVISIONADO
    year = date.today().year
    produto_gc = 864795372
    produto_gai = 864795466
    produto_avaliacao = 864795628
    produto_tecnologia = 864795734
    class_custo = 'Custo Operacional'
    class_desp_oper = 'Despesa Operacional'
    class_desp_nao_oper = 'Despesa Não Operacional'
    class_investimentos = 'Ativos Imobilizados'
    type_card = 'Principal'

    #FATURAMENTO CONSOLIDADO POR PRODUTO
    query_faturado_total= Cobrancas_Pipefy.objects.filter(data_pagamento__year=year, phase_id=317532039).aggregate(
        credito=Sum(Case(When(detalhamento__produto=produto_gc, then='valor_faturado'), default=0, output_field=DecimalField())),
        ambiental=Sum(Case(When(detalhamento__produto=produto_gai, then='valor_faturado'), default=0, output_field=DecimalField())),
        avaliacao=Sum(Case(When(detalhamento__produto=produto_avaliacao, then='valor_faturado'), default=0, output_field=DecimalField())),
        tecnologia=Sum(Case(When(detalhamento__produto=produto_tecnologia, then='valor_faturado'), default=0, output_field=DecimalField())))

    faturado_gai = query_faturado_total.get('ambiental', 0) or 0
    faturado_gc = query_faturado_total.get('credito', 0) or 0
    faturado_avaliacao = query_faturado_total.get('avaliacao', 0) or 0
    faturado_tecnologia = query_faturado_total.get('tecnologia', 0) or 0
    faturado_total = float(faturado_gai + faturado_gc + faturado_avaliacao + faturado_tecnologia)

    #CÁCULO IMPOSTOS INDIRETOS (ISS, PIS, COFINS) QUE FORAM PAGOS
    query_impostos_indiretos = Pagamentos_Pipefy.objects.filter(phase_id=317163732, data_pagamento__year=year).aggregate(
        total_iss=Sum(Case(When(categoria_id=687761062, then='valor_pagamento'), default=0, output_field=DecimalField())),
        total_pis=Sum(Case(When(categoria_id=687760058, then='valor_pagamento'), default=0, output_field=DecimalField())),
        total_cofins=Sum(Case(When(categoria_id=687760600, then='valor_pagamento'), default=0, output_field=DecimalField())))
    
    total_iss = query_impostos_indiretos.get('total_iss', 0) or 0
    total_pis = query_impostos_indiretos.get('total_pis', 0) or 0
    total_cofins = query_impostos_indiretos.get('total_cofins', 0) or 0
    total_impostos_indiretos = float(total_iss + total_pis + total_cofins)

    #TOTAL DE COBRANÇAS ABERTAS POR PRODUTO
    cobrancas_abertas_phases = [317532037, 317532038, 318663454, 317532040] #fases aguardando distrib., notificação, faturamento e confirmação 
    query_cobrancas_abertas = Cobrancas_Pipefy.objects.filter(phase_id__in=cobrancas_abertas_phases).aggregate(
        total_gc=Sum(Case(When(detalhamento__produto=produto_gc, then='saldo_devedor'), default=0, output_field=DecimalField())),
        total_gai=Sum(Case(When(detalhamento__produto=produto_gai, then='saldo_devedor'), default=0, output_field=DecimalField())),
        total_avaliacao=Sum(Case(When(detalhamento__produto=produto_avaliacao, then='saldo_devedor'), default=0, output_field=DecimalField())),
        total_tecnologia=Sum(Case(When(detalhamento__produto=produto_tecnologia, then='saldo_devedor'), default=0, output_field=DecimalField())))

    aberto_gc = query_cobrancas_abertas.get('total_gc', 0) or 0
    aberto_gai = query_cobrancas_abertas.get('total_gai', 0) or 0
    aberto_avaliacao = query_cobrancas_abertas.get('total_avaliacao', 0) or 0
    aberto_tecnologia = query_cobrancas_abertas.get('total_tecnologia', 0) or 0
    aberto_total = float(aberto_gc + aberto_gai + aberto_avaliacao + aberto_tecnologia)

    #Valores em PV no Prospect. Calcula o % restante de ano (por enquanto vamos considerar que só é possível realizar o percentual restante do ano)
    total_pv_prospect = Card_Prospects.objects.filter(phase_id=310426184, produto=produto_gai).aggregate(total=Sum('proposta_inicial'))['total'] or 0
    days_passed = (date.today() - date(date.today().year, 1, 1)).days
    total_days = 366 if date.today().year % 4 == 0 and (date.today().year % 100 != 0 or date.today().year % 400 == 0) else 365
    percentage_left_year = 1 - (days_passed / total_days)
    total_proposta_valor = float(total_pv_prospect) * percentage_left_year
    percentual_proposta_valor = f"{locale.format_string('%.2f', (percentage_left_year * 100), True)}%"

    #cálculo faturamento estimado conforme operações em andamento (Gestão de Crédito)
    phases_andamento_gc = [310429134, 310429135, 310429174, 310429173, 310429175, 310429177, 310496731, 310429178, 310429179]
    faturamento_provisionado_gc_total = Card_Produtos.objects.filter(card=type_card, detalhamento__produto=produto_gc, phase_id__in=phases_andamento_gc).aggregate(total=Sum('valor_operacao'))['total'] or 0
    faturamento_provisionado_gc = 0.008 * float(faturamento_provisionado_gc_total) # 0.8% de ticket médio
    
    #calcula o faturamento restante do GAI em operações em andamento
    #AQUI TEM QUE CRIAR UMA ROTINA MAGAIVER PRA CALCULAR O ESTIMADO A RECEBER DO GAI
    phases_ate_protocolo = [310429134, 310429135, 310429174, 310429173, 310429175, 310429177, 310496731, 310429178]
    total_ate_protocolo_gai = Card_Produtos.objects.filter(card=type_card, detalhamento__produto=produto_gai, phase_id__in=phases_ate_protocolo).aggregate(total=Sum('faturamento_estimado'))['total'] or 0
    total_followup_gai = Card_Produtos.objects.filter(card=type_card, detalhamento__produto=produto_gai, phase_id=310429179).aggregate(total=Sum('faturamento_estimado'))['total'] or 0
    faturamento_provisionado_gai = (0.8 * float(total_ate_protocolo_gai)) + (0.2 * float(total_followup_gai))

    #RECEITA TOTAL PROVISIONADA (proposta de valor + operações de crédito em andamento + faturamento GAI am andamento)
    receita_provisionada = total_proposta_valor + faturamento_provisionado_gc + faturamento_provisionado_gai

    #faturamento futuro a ser considerado para estimativa dos impostos indiretos
    faturamento_provisionado_estimado = aberto_total + receita_provisionada

    #estimativa impostos indiretos (ISS, PIS, COFINS) para o valor total em aberto
    aliquota_pis = 0.0065   #(0,65%)
    aliquota_cofins = 0.03  #(3,00%)
    aliquota_iss = 0.03     #(3,00%)
    total_previsao_impostos_indiretos = (aliquota_pis * faturamento_provisionado_estimado) + (aliquota_cofins * faturamento_provisionado_estimado) + (aliquota_iss * faturamento_provisionado_estimado)
    
    #CÁLCULO RECEITA LÍQUIDA (fatu total + fatu estimado - impostos indiretos - previsao impostos indiretos)
    receita_liquida = float(faturado_total + faturamento_provisionado_estimado - total_impostos_indiretos - total_previsao_impostos_indiretos)
   
    #TOTAL CUSTOS E DESPESAS
    query_total_custos_despesas = Pagamentos_Pipefy.objects.filter(phase_id=317163732, data_pagamento__year=year).aggregate(
        custos=Sum(Case(When(categoria__classification=class_custo, then='valor_pagamento'), default=0, output_field=DecimalField())),
        despesas_operacionais=Sum(Case(When(categoria__classification=class_desp_oper, then='valor_pagamento'), default=0, output_field=DecimalField())),
        despesas_nao_operacionais=Sum(Case(When(categoria__classification=class_desp_nao_oper, then='valor_pagamento'), default=0, output_field=DecimalField())))

    total_custos = query_total_custos_despesas.get('custos', 0) or 0
    total_despesas_operacionais = query_total_custos_despesas.get('despesas_operacionais', 0) or 0
    total_despesas_nao_operacionais = query_total_custos_despesas.get('despesas_nao_operacionais', 0) or 0
    total_despesas = float(total_despesas_operacionais + total_despesas_nao_operacionais)

    #CÁLCULO ESTIMATIVA DOS CUSTOS RESTANTES
    custos_estimativa = Pagamentos_Pipefy.objects.values('data_pagamento__year', 'data_pagamento__month').filter(
        phase_id=317163732, categoria__classification=class_custo).annotate(total=Sum('valor_pagamento')
        ).order_by('data_pagamento__year', 'data_pagamento__month')
    custos_mensais = defaultdict(list)

    for entry in custos_estimativa:
        mes = entry['data_pagamento__month']
        total = entry['total']
        custos_mensais[mes].append(total)

    total_custos_estimativa = round(sum(sum(values)/len(values) for key, values in custos_mensais.items() if key > date.today().month), 2)
  
    #CÁLCULO LUCRO BRUTO (receita líquida - custo serviço prestado - custo estimado restante)
    lucro_bruto = receita_liquida - float(total_custos) - float(total_custos_estimativa)

    #CÁLCULO ESTIMATIVA DESPESAS RESTANTES
    despesas_estimativa = Pagamentos_Pipefy.objects.values('data_pagamento__year', 'data_pagamento__month').filter(
        phase_id=317163732, categoria__classification__in=[class_desp_oper, class_desp_nao_oper]).annotate(total=Sum('valor_pagamento')
        ).order_by('data_pagamento__year', 'data_pagamento__month')
    despesas_mensais = defaultdict(list)

    for entry in despesas_estimativa:
        mes = entry['data_pagamento__month']
        total = entry['total']
        despesas_mensais[mes].append(total)

    total_despesas_estimativa = float(round(sum(sum(values)/len(values) for key, values in despesas_mensais.items() if key > date.today().month), 2))

    #CÁLCULO DO LUCRO OPERACIONAL
    lucro_operacional = float(lucro_bruto - total_despesas - total_despesas_estimativa)
    
    #CÁLCULO DO RESULTADO FINANCEIRO (Resultado das receitas e despesas das movimentações financeiras, além dos reembolsos de clientes)
    query_despesas_financeiras = Resultados_Financeiros.objects.filter(data__year=year).aggregate(
        despesas=Sum(Case(When(tipo__tipo='D', then='valor'), default=0, output_field=DecimalField())),
        receitas=Sum(Case(When(tipo__tipo='R', then='valor'), default=0, output_field=DecimalField())))

    despesas_financeiras = query_despesas_financeiras.get('despesas', 0) or 0
    receitas_financeiras = query_despesas_financeiras.get('receitas', 0) or 0
    reembolsos_clientes = Reembolso_Cliente.objects.filter(data__year=year).aggregate(total=Sum('valor'))['total'] or 0
    resultado_financeiro = float(receitas_financeiras - despesas_financeiras + reembolsos_clientes)
    
    #CÁLCULO DO LUCRO ANTES DOS IMPOSTOS DIRETOS (EBITDA)
    ebitda = lucro_operacional + resultado_financeiro 

    #CÁLCULO IMPOSTOS DIRETOS (CSLL e IRPJ) PAGOS
    query_impostos_diretos = Pagamentos_Pipefy.objects.filter(phase_id=317163732, data_pagamento__year=year).aggregate(
        csll=Sum(Case(When(categoria_id=687761501, then='valor_pagamento'), default=0, output_field=DecimalField())),
        irpj=Sum(Case(When(categoria_id=687761676, then='valor_pagamento'), default=0, output_field=DecimalField())))
    
    total_csll = query_impostos_diretos.get('csll', 0) or 0
    total_irpj = query_impostos_diretos.get('irpj', 0) or 0    
    total_impostos_diretos = float(total_csll + total_irpj)

    #RECEITA BRUTA ESTIMADA TOTAL
    receita_bruta_estimada_total = faturado_total + faturamento_provisionado_estimado + resultado_financeiro

    #VALOR TOTAL E PERCENTUAL DA PREVISÃO IMPOSTOS
    previsao_impostos_total = total_impostos_indiretos + total_previsao_impostos_indiretos + total_impostos_diretos #falta prever impostos diretos
    percentual_previsao_impostos_total = (previsao_impostos_total / receita_bruta_estimada_total * 100) if receita_bruta_estimada_total > 0 else 0

    #CÁLCULO DO LUCRO LÍQUIDO
    lucro_liquido = float(ebitda - total_impostos_diretos)

    #CÁLCULOS DAS MARGENS
    margem_liquida = (lucro_liquido / receita_bruta_estimada_total * 100) if receita_bruta_estimada_total > 0 else 0
    margem_bruta = (lucro_bruto / receita_bruta_estimada_total * 100) if receita_bruta_estimada_total > 0 else 0
    margem_ebitda = (ebitda / receita_liquida * 100) if receita_liquida > 0 else 0 

    context = {
        'current_year': year,
        'faturado_gc': locale.currency(faturado_gc, grouping=True),
        'faturado_gai': locale.currency(faturado_gai, grouping=True),
        'faturado_avaliacao': locale.currency(faturado_avaliacao, grouping=True),
        'faturado_tecnologia': locale.currency(faturado_tecnologia, grouping=True),
        'faturado_total': locale.currency(faturado_total, grouping=True),
        'total_iss': locale.currency(total_iss, grouping=True),
        'total_pis': locale.currency(total_pis, grouping=True),
        'total_cofins': locale.currency(total_cofins, grouping=True),
        'total_impostos_indiretos': locale.currency(total_impostos_indiretos, grouping=True),
        'aberto_gc': locale.currency(aberto_gc, grouping=True),
        'aberto_gai': locale.currency(aberto_gai, grouping=True),
        'aberto_avaliacao': locale.currency(aberto_avaliacao, grouping=True),
        'aberto_tecnologia': locale.currency(aberto_tecnologia, grouping=True),
        'aberto_total': locale.currency(aberto_total, grouping=True),
        'total_pv_prospect': locale.currency(total_proposta_valor, grouping=True),
        'percentual_proposta_valor': percentual_proposta_valor,
        'faturamento_provisionado_gc': locale.currency(faturamento_provisionado_gc, grouping=True),
        'faturamento_provisionado_gai': locale.currency(faturamento_provisionado_gai, grouping=True),
        'receita_provisionada': locale.currency(receita_provisionada, grouping=True),
        'total_previsao_impostos_indiretos': locale.currency(total_previsao_impostos_indiretos, grouping=True),
        'previsao_impostos_total': locale.currency(previsao_impostos_total, grouping=True),
        'percentual_previsao_impostos_total' : f"{locale.format_string('%.1f', percentual_previsao_impostos_total, True)}%",
        'receita_liquida': locale.currency(receita_liquida, grouping=True),
        'color_receita_liquida': 'success' if  receita_liquida > 0 else 'danger',
        'total_custos': locale.currency(total_custos, grouping=True),
        'total_custos_estimativa': locale.currency(total_custos_estimativa, grouping=True),
        'lucro_bruto': locale.currency(lucro_bruto, grouping=True),
        'color_lucro_bruto': 'success' if  lucro_bruto > 0 else 'danger',
        'despesas_operacionais': locale.currency(total_despesas_operacionais, grouping=True),
        'despesas_nao_operacionais': locale.currency(total_despesas_nao_operacionais, grouping=True),
        'total_despesas': locale.currency(total_despesas, grouping=True),
        'total_despesas_estimativa': locale.currency(total_despesas_estimativa, grouping=True),
        'despesas_financeiras': locale.currency(despesas_financeiras, grouping=True),
        'receitas_financeiras': locale.currency(receitas_financeiras, grouping=True),
        'resultado_financeiro': locale.currency(resultado_financeiro, grouping=True),
        'color_resultado_financeiro': 'success' if resultado_financeiro > 0 else 'danger',
        'lucro_operacional': locale.currency(lucro_operacional, grouping=True),
        'color_lucro_operacional': 'success' if  lucro_operacional > 0 else 'danger',
        'reembolso_clientes': locale.currency(reembolsos_clientes, grouping=True),
        'ebitda': locale.currency(ebitda, grouping=True),
        'color_ebitda': 'success' if  ebitda > 0 else 'danger',
        'total_csll': locale.currency(total_csll, grouping=True),
        'total_irpj': locale.currency(total_irpj, grouping=True),
        'total_impostos_diretos': locale.currency(total_impostos_diretos, grouping=True),
        'lucro_liquido': locale.currency(lucro_liquido, grouping=True),
        'color_lucro_liquido': 'success' if  lucro_liquido > 0 else 'danger',
        'receita_bruta_estimada_total': locale.currency(receita_bruta_estimada_total, grouping=True),
        'margem_liquida': f"{locale.format_string('%.1f', margem_liquida, True)}%",
        'margem_bruta': f"{locale.format_string('%.1f', margem_bruta, True)}%",
        'margem_ebitda': f"{locale.format_string('%.1f', margem_ebitda, True)}%"
    }

    return JsonResponse(context)