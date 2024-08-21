from finances.models import Reembolso_Cliente, Cobrancas, Pagamentos
from finances.models import Resultados_Financeiros
from django.db.models import Sum, Q, Case, When, DecimalField, F
from backend.frassonUtilities import Frasson
import locale

def calcdre(year):
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

    #FATURAMENTO CONSOLIDADO POR PRODUTO
    query_faturado_total= Cobrancas.objects.filter(data_pagamento__year=year, status='PG').aggregate(
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
    query_fatu_tributacao = Cobrancas.objects.filter(data_pagamento__year=year, status='PG').aggregate(
        faturamento_tributado=Sum(Case(When(~Q(caixa_id=667994628), then='valor_faturado'), default=0, output_field=DecimalField())),
        faturamento_sem_tributacao=Sum(Case(When(caixa_id=667994628, then='valor_faturado'), default=0, output_field=DecimalField())))

    faturamento_tributado = query_fatu_tributacao.get('faturamento_tributado', 0) or 0
    faturamento_sem_tributacao = query_fatu_tributacao.get('faturamento_sem_tributacao', 0) or 0  
    percentual_fatu_tributado = (faturamento_tributado / faturado_total * 100) if faturado_total > 0 else 0
    percentual_fatu_sem_tributacao = (faturamento_sem_tributacao / faturado_total) * 100 if faturado_total > 0 else 0
 
    #IMPOSTOS INDIRETOS (ISS, PIS E COFINS) - VALOR TOTAL E PERCENTUAL
    query_total_impostos_indiretos = Pagamentos.objects.filter(status='PG', data_pagamento__year=year).aggregate(
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
    query_total_despesas = Pagamentos.objects.filter(status='PG', data_pagamento__year=year).aggregate(
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
    query_total_impostos_diretos = Pagamentos.objects.filter(status='PG', data_pagamento__year=year).aggregate(
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
    query_dre_saldos = Pagamentos.objects.filter(status='PG', data_pagamento__year=year).aggregate(
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
    anos = [ano for ano in range(2021, year + 1)] #cria a lista dos anos de busca

    context = {
        'anos': anos,
        'current_year': year,
        'saldo_inicial_ano': locale.currency(saldo_inicial_ano, grouping=True),
        'retiradas_socios': locale.currency(retirada_socios, grouping=True),
        'pagamento_comissao': locale.currency(pagamento_comissao, grouping=True),
        'total_retiradas_comissoes': locale.currency(total_retiradas_comissoes, grouping=True),
        'ativos_imobilizados': locale.currency(ativos_imobilizados, grouping=True),
        'outros_acertos': locale.currency(outros_acertos, grouping=True),
        'saldo_atual': locale.currency(saldo_atual, grouping=True),
        'color_saldo_atual': 'success' if  saldo_atual > 0 else 'danger',
        'saldo_inicio_exercicio': locale.currency(saldo_inicio_exercicio, grouping=True),
        'color_saldo_inicio_exercicio': 'success' if  saldo_inicio_exercicio > 0 else 'danger',
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
        'color_receita_liquida': 'success' if  receita_liquida > 0 else 'danger',
        'total_custos': locale.currency(total_custos, grouping=True),
        'lucro_bruto': locale.currency(lucro_bruto, grouping=True),
        'color_lucro_bruto': 'success' if  lucro_bruto > 0 else 'danger',
        'despesas_operacionais': locale.currency(total_desp_oper, grouping=True),
        'despesas_nao_operacionais': locale.currency(total_desp_nao_oper, grouping=True),
        'total_despesas': locale.currency(total_despesas, grouping=True),
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
        'percentual_csll': f"{locale.format_string('%.1f', percentual_csll, True)}%",
        'total_irpj': locale.currency(total_irpj, grouping=True),
        'percentual_irpj': f"{locale.format_string('%.1f', percentual_irpj, True)}%",
        'total_impostos_diretos': locale.currency(total_impostos_diretos, grouping=True),
        'lucro_liquido': locale.currency(lucro_liquido, grouping=True),
        'color_lucro_liquido': 'success' if  lucro_liquido > 0 else 'danger',
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
    return context

fields_contratogai = {
    'servicos':'Serviços', 'contratante':'Contratante', 'data_assinatura':'Data de Assinatura', 'detalhes': 'Detalhes da Negociação',
    'servicos_etapas': 'Etapas de Pagamento dos Serviços'
}

fields_pagamento = {
    'beneficiario':'Beneficiário', 'descricao':'Descrição', 'detalhamento':'Detalhamento', 'categoria': 'Categoria',
    'status': 'Status', 'valor_pagamento':'Valor do Pagamento', 'data_vencimento':'Data de Vencimento', 'data_pagamento':'Data do Pagamento',
    'caixa':'Caixa de Saída'
}