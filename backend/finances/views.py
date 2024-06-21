from django.shortcuts import render
from django.http import JsonResponse, FileResponse
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from .models import Reembolso_Cliente, Resultados_Financeiros, Lancamentos_Automaticos_Pagamentos, Contratos_Servicos_Pagamentos
from pipeline.models import Card_Pagamentos, Card_Cobrancas, Card_Produtos, Card_Prospects
from django.db.models import Sum, Q, Case, When, DecimalField, F, DateField, Subquery, OuterRef, Count, IntegerField, Value
from django.db.models.functions import Coalesce
from backend.frassonUtilities import Frasson
from datetime import date, datetime
from collections import defaultdict
import locale, uuid, io, math
from .utilities import calcdre
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch, mm
from reportlab.lib.pagesizes import letter, landscape, A4
from reportlab.lib.colors import Color
from rest_framework.response import Response

class PagamentosView(viewsets.ModelViewSet):
    queryset = Card_Pagamentos.objects.all()
    serializer_class = listPagamentosPipefy
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', '')
        search_year = self.request.query_params.get('year', None)
        search_month = self.request.query_params.get('month', None)
        if search_year:
            search_year = int(search_year)
            if search_month:
                search_month = int(search_month)
                query_search = ((Q(data_vencimento__year=search_year) | Q(data_pagamento__year=search_year)) &
                                (Q(data_vencimento__month=search_month) | Q(data_pagamento__month=search_month)) &
                                (Q(beneficiario__razao_social__icontains=search) | Q(phase_name__icontains=search) | Q(categoria__category__icontains=search) | Q(categoria__classification__icontains=search)))
                queryset = Card_Pagamentos.objects.filter(query_search).annotate(
                    data=Case(
                        When(phase_id=317163732, then=F('data_pagamento')),
                        default=F('data_vencimento'),
                        output_field=DateField()
                    )
                ).filter(data__year=search_year, data__month=search_month).order_by('data')
            else:
                search_year = int(search_year)
                query_search = ((Q(data_vencimento__year=search_year) | Q(data_pagamento__year=search_year)) &
                                (Q(beneficiario__razao_social__icontains=search) | Q(phase_name__icontains=search) | 
                                    Q(categoria__category__icontains=search) | Q(categoria__classification__icontains=search)
                                ))
                queryset = Card_Pagamentos.objects.filter(query_search).annotate(
                    data=Case(
                        When(phase_id=317163732, then=F('data_pagamento')),
                        default=F('data_vencimento'),
                        output_field=DateField()
                    )
                ).filter(data__year=search_year).order_by('data')
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        anos = Card_Pagamentos.objects.values_list('data_vencimento__year', flat=True).distinct()
        response_data = {
            'pagamentos': serializer.data,
            'anos': anos,
        }
        return Response(response_data)
    def get_serializer_class(self):
        if self.action == 'list':
            return listPagamentosPipefy
        else:
            return self.serializer_class
        
class CobrancasView(viewsets.ModelViewSet):
    queryset = Card_Cobrancas.objects.all()
    serializer_class = listCobrancasPipefy
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', '')
        search_year = self.request.query_params.get('year', None)
        search_month = self.request.query_params.get('month', None)
        search_pago = True if self.request.query_params.get('status', '0') == "1" else False
        phase = self.request.query_params.get('phase', None)
        produto = self.request.query_params.get('produto', None)
        
        if search_year:
            search_year = int(search_year)
            if search_month:
                search_month = int(search_month)
                if search_pago:
                    query_search = (Q(phase_id=317532039) & (Q(data_pagamento__year=search_year) | Q(data_previsao__year=search_year)) & 
                        (Q(data_pagamento__month=search_month) | Q(data_previsao__month=search_month)) & 
                            (Q(cliente__razao_social__icontains=search) | Q(phase_name__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))

                else:
                    query_search = (~Q(phase_id=317532039) & (Q(data_pagamento__year=search_year) | Q(data_previsao__year=search_year)) & 
                        (Q(data_pagamento__month=search_month) | Q(data_previsao__month=search_month)) & 
                            (Q(cliente__razao_social__icontains=search) | Q(phase_name__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))
                    
                queryset = Card_Cobrancas.objects.filter(query_search).annotate(
                valor=Case(When(phase_id=317532039, then=F('valor_faturado')), default='saldo_devedor', output_field=DecimalField()),
                data=Case(When(phase_id=317532039, then=F('data_pagamento')), default='data_previsao')).filter(data__year=search_year, data__month=search_month).order_by('data')
            
            else:
                if search_pago:
                    query_search = (Q(phase_id=317532039) & (Q(data_pagamento__year=search_year) | Q(data_previsao__year=search_year)) & 
                        (Q(cliente__razao_social__icontains=search) | Q(phase_name__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))
                else:
                    query_search = (~Q(phase_id=317532039) & (Q(data_pagamento__year=search_year) | Q(data_previsao__year=search_year)) & 
                        (Q(cliente__razao_social__icontains=search) | Q(phase_name__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))
                queryset = Card_Cobrancas.objects.filter(query_search).annotate(
                valor=Case(When(phase_id=317532039, then=F('valor_faturado')), default='saldo_devedor', output_field=DecimalField()),
                data=Case(When(phase_id=317532039, then=F('data_pagamento')), default='data_previsao')).filter(data__year=search_year).order_by('data')

        else: #se não houver nenhuma busca (carregada pela primeira vez)
            queryset = Card_Cobrancas.objects.filter(phase_id__in=[317532037, 317532038, 318663454, 317532040]).annotate(
            valor=Case(When(phase_id=317532039, then=F('valor_faturado')), default='saldo_devedor', output_field=DecimalField()),
            data=Case(When(phase_id=317532039, then=F('data_pagamento')), default='data_previsao')).order_by('data')

        if phase:
            queryset = Card_Cobrancas.objects.filter(phase_id=int(phase)).annotate(
            valor=Case(When(phase_id=317532039, then=F('valor_faturado')), default='saldo_devedor', output_field=DecimalField()),
            data=Case(When(phase_id=317532039, then=F('data_pagamento')), default='data_previsao')).order_by('data')

        if produto:
            queryset = Card_Cobrancas.objects.filter(detalhamento__produto_id=int(produto)).annotate(
            valor=Case(When(phase_id=317532039, then=F('valor_faturado')), default='saldo_devedor', output_field=DecimalField()),
            data=Case(When(phase_id=317532039, then=F('data_pagamento')), default='data_previsao')).order_by('data')
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        anos = [ano for ano in range(2021, date.today().year + 1)]
        response_data = {
            'cobrancas': serializer.data,
            'anos': anos,
        }
        return Response(response_data)
    def get_serializer_class(self):
        if self.action == 'list':
            return listCobrancasPipefy
        else:
            return self.serializer_class

class CobrancasInvoicesView(viewsets.ModelViewSet):
    queryset = Card_Cobrancas.objects.all()
    serializer_class = listCobrancasInvoices
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        produto = self.request.query_params.get('produto', None)
        current_year = int(date.today().year)
        if produto:
            queryset = queryset.filter(phase_id=317532039, data_pagamento__year=current_year,
                detalhamento__produto_id=produto).order_by('-data_pagamento')
        else:
            queryset = queryset.filter(phase_id=317532039, data_pagamento__year=current_year).order_by('-data_pagamento')
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listCobrancasInvoices
        else:
            return self.serializer_class


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
        
class CaixasView(viewsets.ModelViewSet):
    queryset = Caixas_Frasson.objects.all()
    serializer_class = listCaixas
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)   
        if search:
            queryset = queryset.filter(Q(caixa__icontains=search) | Q(is_active=True))
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listCaixas
        else:
            return self.serializer_class

class ReceitaDespesaView(viewsets.ModelViewSet):
    queryset = Tipo_Receita_Despesa.objects.all()
    serializer_class = listTipoReceitaDespesa
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)   
        if search:
            queryset = queryset.filter(Q(description__icontains=search))
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listTipoReceitaDespesa
        else:
            return self.serializer_class

class TransfContasView(viewsets.ModelViewSet):
    queryset = Transferencias_Contas.objects.all()
    serializer_class = detailTransfContas
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)   
        if search:
            queryset = queryset.filter(Q(description__icontains=search) | Q(caixa_destino__caixa__icontains=search) |
                Q(caixa_origem__caixa__icontains=search)
            )
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listTransfContas
        else:
            return self.serializer_class

class MovimentacoesView(viewsets.ModelViewSet):
    queryset = Resultados_Financeiros.objects.all()
    serializer_class = detailMovimentacoes
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)    
        if search:
            queryset = queryset.filter(Q(description__icontains=search) | Q(caixa__caixa__icontains=search) | 
                Q(tipo__description__icontains=search))
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listMovimentacoes
        else:
            return self.serializer_class
        
class ReembolsosView(viewsets.ModelViewSet):
    queryset = Reembolso_Cliente.objects.all()
    serializer_class = detailReembolsos
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)    
        if search:
            queryset = queryset.filter(Q(description__icontains=search) | Q(caixa__caixa__icontains=search))
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listReembolsos
        else:
            return self.serializer_class

class ContratoServicosView(viewsets.ModelViewSet):
    serializer_class = detailContratoServicos
    queryset = Contratos_Servicos.objects.all()
    def get_serializer_class(self):
        if self.action == 'list':
            return listContratoServicos
        else:
            return self.serializer_class
    def list(self, request, *args, **kwargs):
        search = self.request.query_params.get('search', None)
        subquery = Card_Cobrancas.objects.filter(contrato_id=OuterRef('id')).values('contrato_id').annotate(
            num_cobrancas=Count('id')).values('num_cobrancas')[:1]
        subquery2 = Card_Cobrancas.objects.filter(contrato_id=OuterRef('id'), phase_id=317532039).values('contrato_id').annotate(
            num_cobrancas=Count('id')).values('num_cobrancas')[:1]
        subquery3 = Contratos_Servicos_Pagamentos.objects.filter(contrato_id=OuterRef('id')).values('contrato_id').annotate(
            total=Count('id')).values('total')[:1]

        if search:
            query_search = (Q(contratante__razao_social__icontains=search) | Q(servicos_contratados__detalhamento_servico__icontains=search))
            queryset = Contratos_Servicos.objects.filter(query_search).annotate(
                total_cobrancas=Coalesce(Subquery(subquery, output_field=IntegerField()), 0),
                total_pago=Coalesce(Subquery(subquery2, output_field=IntegerField()), 0),
                total_formas=Coalesce(Subquery(subquery3, output_field=IntegerField()), 0),
                status=Case(When((Q(total_cobrancas__gt=0) & Q(total_pago=F('total_cobrancas')) & Q(total_cobrancas=F('total_formas'))),
                                 then=Value('Finalizado')), default=Value('Em Andamento'))
            ).distinct().order_by('-created_at')
        else:
            queryset = Contratos_Servicos.objects.all().annotate(
                total_cobrancas=Coalesce(Subquery(subquery, output_field=IntegerField()), 0),
                total_pago=Coalesce(Subquery(subquery2, output_field=IntegerField()), 0),
                total_formas=Coalesce(Subquery(subquery3, output_field=IntegerField()), 0),
                status=Case(When((Q(total_cobrancas__gt=0) & Q(total_pago=F('total_cobrancas')) & Q(total_cobrancas=F('total_formas'))),
                                 then=Value('Finalizado')), default=Value('Em Andamento'))
            ).order_by('-created_at')[:50]
        serializer = self.get_serializer(queryset, many=True)
        response_data = {
            'cadastros': serializer.data,
        }
        return Response(serializer.data)

class ContratosPagamentosView(viewsets.ModelViewSet):
    serializer_class = serContratosPagamentos
    queryset = Contratos_Servicos_Pagamentos.objects.all()

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
    query_faturado_total= Card_Cobrancas.objects.filter(data_pagamento__year=year, phase_id=317532039).aggregate(
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
    query_fatu_tributacao = Card_Cobrancas.objects.filter(data_pagamento__year=year, phase_id=317532039).aggregate(
        faturamento_tributado=Sum(Case(When(~Q(caixa_id=667994628), then='valor_faturado'), default=0, output_field=DecimalField())),
        faturamento_sem_tributacao=Sum(Case(When(caixa_id=667994628, then='valor_faturado'), default=0, output_field=DecimalField())))

    faturamento_tributado = query_fatu_tributacao.get('faturamento_tributado', 0) or 0
    faturamento_sem_tributacao = query_fatu_tributacao.get('faturamento_sem_tributacao', 0) or 0  
    percentual_fatu_tributado = (faturamento_tributado / faturado_total * 100) if faturado_total > 0 else 0
    percentual_fatu_sem_tributacao = (faturamento_sem_tributacao / faturado_total) * 100 if faturado_total > 0 else 0
 
    #IMPOSTOS INDIRETOS (ISS, PIS E COFINS) - VALOR TOTAL E PERCENTUAL
    query_total_impostos_indiretos = Card_Pagamentos.objects.filter(phase_id=317163732, data_pagamento__year=year).aggregate(
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
    query_total_despesas = Card_Pagamentos.objects.filter(phase_id=317163732, data_pagamento__year=year).aggregate(
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
    query_total_impostos_diretos = Card_Pagamentos.objects.filter(phase_id=317163732, data_pagamento__year=year).aggregate(
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
    query_dre_saldos = Card_Pagamentos.objects.filter(phase_id=317163732, data_pagamento__year=year).aggregate(
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
    query_faturado_total= Card_Cobrancas.objects.filter(data_pagamento__year=year, phase_id=317532039).aggregate(
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
    query_impostos_indiretos = Card_Pagamentos.objects.filter(phase_id=317163732, data_pagamento__year=year).aggregate(
        total_iss=Sum(Case(When(categoria_id=687761062, then='valor_pagamento'), default=0, output_field=DecimalField())),
        total_pis=Sum(Case(When(categoria_id=687760058, then='valor_pagamento'), default=0, output_field=DecimalField())),
        total_cofins=Sum(Case(When(categoria_id=687760600, then='valor_pagamento'), default=0, output_field=DecimalField())))
    
    total_iss = query_impostos_indiretos.get('total_iss', 0) or 0
    total_pis = query_impostos_indiretos.get('total_pis', 0) or 0
    total_cofins = query_impostos_indiretos.get('total_cofins', 0) or 0
    total_impostos_indiretos = float(total_iss + total_pis + total_cofins)

    #TOTAL DE COBRANÇAS ABERTAS POR PRODUTO
    cobrancas_abertas_phases = [317532037, 317532038, 318663454, 317532040] #fases aguardando distrib., notificação, faturamento e confirmação 
    query_cobrancas_abertas = Card_Cobrancas.objects.filter(phase_id__in=cobrancas_abertas_phases).aggregate(
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
    query_total_custos_despesas = Card_Pagamentos.objects.filter(phase_id=317163732, data_pagamento__year=year).aggregate(
        custos=Sum(Case(When(categoria__classification=class_custo, then='valor_pagamento'), default=0, output_field=DecimalField())),
        despesas_operacionais=Sum(Case(When(categoria__classification=class_desp_oper, then='valor_pagamento'), default=0, output_field=DecimalField())),
        despesas_nao_operacionais=Sum(Case(When(categoria__classification=class_desp_nao_oper, then='valor_pagamento'), default=0, output_field=DecimalField())))

    total_custos = query_total_custos_despesas.get('custos', 0) or 0
    total_despesas_operacionais = query_total_custos_despesas.get('despesas_operacionais', 0) or 0
    total_despesas_nao_operacionais = query_total_custos_despesas.get('despesas_nao_operacionais', 0) or 0
    total_despesas = float(total_despesas_operacionais + total_despesas_nao_operacionais)

    #CÁLCULO ESTIMATIVA DOS CUSTOS RESTANTES
    custos_estimativa = Card_Pagamentos.objects.values('data_pagamento__year', 'data_pagamento__month').filter(
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
    despesas_estimativa = Card_Pagamentos.objects.values('data_pagamento__year', 'data_pagamento__month').filter(
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
    query_impostos_diretos = Card_Pagamentos.objects.filter(phase_id=317163732, data_pagamento__year=year).aggregate(
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


def index_saldos_contas(request):
    #FUNÇÃO QUE CALCULA TODOS OS SALDOS DAS CONTAS
    saldos = Frasson.saldosAtuaisContasBancarias()
    return JsonResponse(saldos)


def dre_consolidado_report(request):
    search = request.GET.get('search')
    if search: 
        year = int(search)
    else: 
        year = date.today().year
    date_today = date.today().strftime('%d/%m/%Y')
    data_hoje = date.today().strftime('%d/%m/%Y')
    dados = calcdre(year)
    margin_top = 780
    margin_left = 50

    atribs = ['faturado_total','total_impostos_indiretos', 'total_iss', 'percentual_iss', 'total_pis', 'percentual_pis', 'total_cofins', 'percentual_cofins', 'receita_liquida', 'total_custos', 'lucro_bruto', 'total_despesas', 'despesas_operacionais', 'despesas_nao_operacionais',
    'lucro_operacional', 'resultado_financeiro', 'receitas_financeiras', 'despesas_financeiras','ebitda', 'total_impostos_diretos', 'total_csll', 'percentual_csll', 'total_irpj', 'percentual_irpj', 'lucro_liquido',  'margem_liquida', 'margem_bruta',
    'total_impostos',]

    titles = ['Receita Sobre Serviços','Impostos Sobre Serviços (Indiretos)', 'Total ISS', 'percentual_iss', 'Total PIS', 'percentual_pis', 'Total COFINS', 'percentual_cofins', 'Receita Líquida', 'Custo Operacional Total', 'Lucro Bruto', 'Total de Despesas', 'Despesas Operacionais', 
    'Despesas Não-Operacionais', 'Lucro Operacional', 'Resultado Operacional', 'Receitas Financeiras', 'Despesas Financeiras','EBITDA', 'Total Impostos Diretos', 'Total CSLL', 'percentual_csll', 'Total IRPJ', 'percentual_irpj', 'Lucro Líquido',  'Margem Líquida', 'Margem Bruta', 
    'Total Impostos' ]

    atribs2 = [
        ['margem_liquida', 'Margem Líquida'], ['margem_bruta', 'Margem Bruta'],
        ['faturamento_tributado','Faturamento Tributado'], ['faturamento_sem_tributacao','Faturamento Sem Tributação'],
        ['percentual_impostos_tributado','Imposto Sobre Faturamento Tributado'], ['percentual_impostos_total','Imposto Sobre Faturamento Total'],
    ]

    img_logo = 'static/media/various/logo-frasson-app2.png'

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(210*mm,300*mm))
    c.setTitle(f"Relatório DRE Consolidado {year}")
    c.drawImage(img_logo, margin_left, 780, 70, 70, preserveAspectRatio=True)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(200, 810, f"RELATÓRIO DRE CONSOLIDADO")
    c.setFont("Helvetica", 10)
    c.drawString(500, 810, date_today)
    c.setFont("Helvetica-Bold", 10)
    vertical_position = margin_top
    horizontal_position = margin_left
    c.drawString(horizontal_position, vertical_position, "Descrição")
    c.drawString(horizontal_position + 200, vertical_position, "Valor")
    c.drawString(horizontal_position + 340, vertical_position, "Percentual")
    vertical_position = margin_top - 20
    for i in range (len(atribs)):
        if i in [2,4,6,12,13,16,17,20,22]:
            c.setFont("Helvetica", 10)
            c.drawString(horizontal_position, vertical_position, f"{titles[i]}")
            c.drawString(horizontal_position + 200, vertical_position, f"{dados[atribs[i]]}")
            vertical_position-= 17
        elif i in[3,5,7,21,23]:
            c.drawString(horizontal_position + 340, vertical_position+18, f"{dados[atribs[i]]}")
        else:
            c.setFont("Helvetica-Bold", 10)
            c.line(horizontal_position, vertical_position + 12, margin_left + 500, vertical_position + 12)
            c.drawString(horizontal_position, vertical_position, f"{titles[i]}")
            c.drawString(horizontal_position + 200, vertical_position, f"{dados[atribs[i]]}")
            vertical_position-= 17
    vertical_position -= 100
    for i in range(len(atribs2)):      
        c.setFont("Helvetica-Bold", 10)
        c.drawString(horizontal_position, vertical_position, f"{atribs2[i][1]}")
        c.setFont("Helvetica", 10)
        c.drawString(horizontal_position + 220, vertical_position, f"{dados[atribs2[i][0]]}")
        c.line(horizontal_position, vertical_position + 12, margin_left + 300, vertical_position + 12)
        vertical_position-= 17
    c.showPage()
    c.save()
    buf.seek(0)
    file_name = f"DRE_Consolidado_{data_hoje}.PDF"
    return FileResponse(buf, as_attachment=False, filename=file_name)


def pagamentos_pipefy_report_pdf(request):
    date_today = date.today().strftime('%d/%m/%Y')
    if request.method == "GET":
        search_year = request.GET.get('year') or date.today().year
        search_month = request.GET.get('month') or date.today().month
        search = request.GET.get('search') or ''  
    else:
        search_year = date.today().year
        search_month = date.today().month
        search = ''
    
    if search_month:
        query_search = ((Q(data_vencimento__year=search_year) | Q(data_pagamento__year=search_year)) &
            (Q(data_vencimento__month=search_month) | Q(data_pagamento__month=search_month)) & 
                (Q(beneficiario__razao_social__icontains=search) | Q(phase_name__icontains=search) | Q(categoria__category__icontains=search)))
        pagamentos_pipefy = Card_Pagamentos.objects.filter(query_search).annotate(
            data=Case(When(phase_id=317163732, then=F('data_pagamento')), default='data_vencimento')).filter(data__year=search_year, data__month=search_month).order_by('data')

    else:
        query_search = ((Q(data_vencimento__year=search_year) | Q(data_pagamento__year=search_year)) & 
            (Q(beneficiario__razao_social__icontains=search) | Q(phase_name__icontains=search) | Q(categoria__category__icontains=search)))
        pagamentos_pipefy = Card_Pagamentos.objects.filter(query_search).annotate(
            data=Case(When(phase_id=317163732, then=F('data_pagamento')), default='data_vencimento')).filter(data__year=search_year).order_by('data')

    pagamentos = []
    pagamentos_phases = pagamentos_pipefy.values('phase_name').annotate(soma=Sum('valor_pagamento')).order_by('phase_name')
    total_pagamentos = Card_Pagamentos.objects.filter(query_search).aggregate(soma=Sum('valor_pagamento'))

    for pag in pagamentos_phases:
        pagamentos.append({
            'phase': pag['phase_name'],
            'total': pag['soma']
        })

    pagamentos.append({'phase': 'TOTAL', 'total': total_pagamentos['soma'] if total_pagamentos['soma'] != None else 0})
    
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=landscape(letter))
    c.setTitle(f"Payments Report - {date_today}")
    
    date_today = date.today().strftime('%d/%m/%Y')
    img_logo = 'static/media/various/logo-frasson.png'

    margin_top = 550
    margin_bottom = 100
    margin_left = 50
    margin_right = 792 - margin_left
    numero_registros_por_pagina = 30

    qtd_pages = math.ceil(len(pagamentos_pipefy) / numero_registros_por_pagina) #arredonda pra cima quando float
    qtd_pagamentos = pagamentos_pipefy.count()

    y = qtd_pagamentos / numero_registros_por_pagina
    
    if (y % 1) > .80 or (y % 1) == 0: #estabelece 0.8 da quantidade de registros que ocuparão a página o limite para caber o resumo final na mesma página.
        qtd_pages += 1 #caso o s registros forem até quase o final da página, adiciona uma nova página no documento.

    registro_pagamento = 0
    for i in range(qtd_pages):
        c.setFillColor(Color(12/255, 23/255, 56/255)) #RGB color must be between 0 and 1
        c.drawImage(img_logo, margin_left - 10, 280, 90, preserveAspectRatio=True)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(320, 580, f"RELATÓRIO DE PAGAMENTOS")
        c.setFont("Helvetica", 8)
        c.drawString(710, 580, date_today)
        if i == 0:
            c.setFont("Helvetica-Bold", 9)
            c.drawString(margin_left, margin_top, "Data")
            c.drawString(margin_left + 60, margin_top, "Beneficiário")
            c.drawString(margin_left + 350, margin_top, "Categoria")
            c.drawString(margin_left + 550, margin_top, "Fase")
            c.drawString(margin_left + 640, margin_top, "Valor")
            c.line(margin_left, margin_top - 5, margin_left + 700, margin_top - 5)
        c.setFont("Helvetica", 8)

        vertical_position = margin_top - 15
        for j in range(registro_pagamento, registro_pagamento + numero_registros_por_pagina):
            if registro_pagamento < len(pagamentos_pipefy):
                c.drawString(margin_left, vertical_position, datetime.strptime(str(pagamentos_pipefy[registro_pagamento].data), '%Y-%m-%d').strftime('%d/%m/%Y'))
                c.drawString(margin_left + 60, vertical_position, str(pagamentos_pipefy[registro_pagamento].beneficiario.razao_social)[:60])
                c.drawString(margin_left + 350, vertical_position, str(pagamentos_pipefy[registro_pagamento].categoria.category))
                c.drawString(margin_left + 550, vertical_position, str(pagamentos_pipefy[registro_pagamento].phase_name))
                c.drawString(margin_left + 640, vertical_position, locale.currency(pagamentos_pipefy[registro_pagamento].valor_pagamento, grouping=True))
                c.line(margin_left, vertical_position - 5, margin_left + 700, vertical_position - 5)
            else:
                break
            
            registro_pagamento+=1
            vertical_position-=15

        c.drawString(50, 50, "#documentointerno")
        c.drawString(700, 50, f"Página {i + 1} de {qtd_pages}")

        if (i + 1) == qtd_pages:
    
            x = vertical_position - 20
            c.setFont("Helvetica-Bold", 8)
            c.drawString(margin_left, x, "TOTAL POR FASE") 
            for p in pagamentos:
                c.setFont("Helvetica", 8)
                c.drawString(margin_left, x - 15, p['phase'])
                c.drawString(margin_left + 80, x - 15, locale.currency(p['total'], grouping=True))
                x-=15
        else:
            c.showPage()
    c.save()
    buf.seek(0)
    file_name = f"payments_report_{uuid.uuid4()}.pdf"
    #return pdf file (to download file, set as_attachement = True)
    return FileResponse(buf, as_attachment=False, filename=file_name)

def cobrancas_pipefy_report_pdf(request):
    #GERA PDF DO REPORT COBRANÇAS
    date_today = date.today().strftime('%d/%m/%Y')
    search_year = request.GET.get('year')
    search_month = request.GET.get('month')
    search = request.GET.get('search')
    search_pago = True if request.GET.get('status') == "1" else False

    if search_month:
        if search_pago:
            query_search = (Q(phase_id=317532039) & (Q(data_previsao__year=search_year) | Q(data_pagamento__year=search_year)) & 
                (Q(data_previsao__month=search_month) | Q(data_pagamento__month=search_month)) & 
                    (Q(cliente__razao_social__icontains=search) | Q(phase_name__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))
        else:
            query_search = (~Q(phase_id=317532039) & (Q(data_previsao__year=search_year) | Q(data_pagamento__year=search_year)) & 
                (Q(data_previsao__month=search_month) | Q(data_pagamento__month=search_month)) & 
                    (Q(cliente__razao_social__icontains=search) | Q(phase_name__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))
        
        cobrancas_pipefy = Card_Cobrancas.objects.filter(query_search).annotate(
            valor=Case(When(phase_id=317532039, then='valor_faturado'), default='saldo_devedor', output_field=DecimalField()),
            data=Case(When(phase_id=317532039, then='data_pagamento'), default='data_previsao')).filter(data__year=search_year, data__month=search_month).order_by('data')
    
    else:
        if search_pago:
            query_search = (Q(phase_id=317532039) & (Q(data_previsao__year=search_year) | Q(data_pagamento__year=search_year)) & 
                (Q(cliente__razao_social__icontains=search) | Q(phase_name__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))
        else:
            query_search = (~Q(phase_id=317532039) & (Q(data_previsao__year=search_year) | Q(data_pagamento__year=search_year)) & 
                (Q(cliente__razao_social__icontains=search) | Q(phase_name__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))
        
        cobrancas_pipefy = Card_Cobrancas.objects.filter(query_search).annotate(
            valor=Case(When(phase_id=317532039, then='valor_faturado'), default='saldo_devedor', output_field=DecimalField()),
            data=Case(When(phase_id=317532039, then='data_pagamento'), default='data_previsao')).filter(data__year=search_year).order_by('data')
    
    cobrancas_phases = cobrancas_pipefy.values('phase_name').annotate(
        valor=Sum(Case(When(phase_id=317532039, then=F('valor_faturado')), default=F('saldo_devedor'), output_field=DecimalField()))).order_by('phase_name')

    total_cobrancas = cobrancas_pipefy.aggregate(
        soma=Sum(Case(When(phase_id=317532039, then='valor_faturado'), default='saldo_devedor', output_field=DecimalField())))

    cobrancas = [{
        'phase': pag['phase_name'],
        'total': pag['valor']
    }for pag in cobrancas_phases]

    cobrancas.append({'phase': 'TOTAL', 'total': total_cobrancas['soma'] if total_cobrancas['soma'] != None else 0})

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=landscape(letter))
    c.setTitle(f"Revenues Report - {date_today}")
    
    date_today = date.today().strftime('%d/%m/%Y')
    img_logo = 'static/media/various/logo-frasson.png'

    margin_top = 550
    margin_bottom = 100
    margin_left = 50
    margin_right = 792 - margin_left
    numero_registros_por_pagina = 30

    qtd_pages = math.ceil(len(cobrancas_pipefy) / numero_registros_por_pagina) #arredonda pra cima quando float
    qtd_cobrancas = cobrancas_pipefy.count()

    y = qtd_cobrancas / numero_registros_por_pagina
    
    if (y % 1) > .80 or (y % 1) == 0: #estabelece 0.8 da quantidade de registros que ocuparão a página o limite para caber o resumo final na mesma página.
        qtd_pages += 1 #caso o s registros forem até quase o final da página, adiciona uma nova página no documento.

    registro_cobranca = 0
    
    for i in range(qtd_pages):
        c.setFillColor(Color(12/255, 23/255, 56/255)) #RGB color must be between 0 and 1
        c.drawImage(img_logo, margin_left - 10, 280, 90, preserveAspectRatio=True)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(320, 580, f"RELATÓRIO DE COBRANÇAS")
        c.setFont("Helvetica", 8)
        c.drawString(710, 580, date_today)

        if i == 0:
            c.setFont("Helvetica-Bold", 9)
            c.drawString(margin_left, margin_top, "Data")
            c.drawString(margin_left + 60, margin_top, "Cliente")
            c.drawString(margin_left + 350, margin_top, "Detalhamento")
            c.drawString(margin_left + 550, margin_top, "Status")
            c.drawString(margin_left + 640, margin_top, "Valor")
            c.line(margin_left, margin_top - 5, margin_left + 700, margin_top - 5)
        
        c.setFont("Helvetica", 8)

        vertical_position = margin_top - 15
        for j in range(registro_cobranca, registro_cobranca + numero_registros_por_pagina):
            if registro_cobranca < len(cobrancas_pipefy):
                c.drawString(margin_left, vertical_position, datetime.strptime(str(cobrancas_pipefy[registro_cobranca].data), '%Y-%m-%d').strftime('%d/%m/%Y'))
                c.drawString(margin_left + 60, vertical_position, str(cobrancas_pipefy[registro_cobranca].cliente.razao_social)[:60])
                c.drawString(margin_left + 350, vertical_position, str(cobrancas_pipefy[registro_cobranca].detalhamento.detalhamento_servico))
                c.drawString(margin_left + 550, vertical_position, str(cobrancas_pipefy[registro_cobranca].phase_name))
                c.drawString(margin_left + 640, vertical_position, locale.currency(cobrancas_pipefy[registro_cobranca].valor, grouping=True))
                c.line(margin_left, vertical_position - 5, margin_left + 700, vertical_position - 5)
            else:
                break
            
            registro_cobranca+=1
            vertical_position-=15

        c.drawString(50, 50, "#documentointerno")
        c.drawString(700, 50, f"Página {i + 1} de {qtd_pages}")

        if (i + 1) == qtd_pages:
    
            x = vertical_position - 20
            c.setFont("Helvetica-Bold", 8)
            c.drawString(margin_left, x, "TOTAL POR FASE") 
            for p in cobrancas:
                c.setFont("Helvetica", 8)
                c.drawString(margin_left, x - 15, p['phase'])
                c.drawString(margin_left + 80, x - 15, locale.currency(p['total'] or 0, grouping=True))
                x-=15

        else:
            c.showPage()

    c.save()
    buf.seek(0)
    file_name = f"revenues_report_{uuid.uuid4()}.pdf"

    #return pdf file (to download file, set as_attachement = True)
    return FileResponse(buf, as_attachment=False, filename=file_name)


def movimentacao_conta_bancaria(request, id):
    movimentacoes = []
    quantidade_dias = 120
    try:
        caixa_nome = Caixas_Frasson.objects.get(pk=id).caixa
        data_referencia = date.today() - timedelta(days=quantidade_dias)
        cobrancas = Card_Cobrancas.objects.filter(caixa=id, phase_id=317532039, data_pagamento__gte=data_referencia)
        pagamentos = Card_Pagamentos.objects.filter(caixa=id, phase_id=317163732, data_pagamento__gte=data_referencia)
        reembolsos = Reembolso_Cliente.objects.filter(caixa_destino=id, data__gte=data_referencia)
        resultados = Resultados_Financeiros.objects.filter(caixa=id, data__gte=data_referencia)
        transf_entrada_caixa = Transferencias_Contas.objects.filter(caixa_destino=id, data__gte=data_referencia)
        transf_saida_caixa = Transferencias_Contas.objects.filter(caixa_origem=id, data__gte=data_referencia)

        for cobranca in cobrancas:
            movimentacoes.append({
                'data': datetime.strptime(str(cobranca.data_pagamento), '%Y-%m-%d').strftime('%d/%m/%Y'),
                'descricao': f'Cobrança - {cobranca.detalhamento.produto}',
                'detalhe': cobranca.cliente.razao_social,
                'valor': locale.format_string('%.2f', cobranca.valor_faturado, True),
                'color': 'success'
            })

        for pagamento in pagamentos:
            movimentacoes.append({
                'data': datetime.strptime(str(pagamento.data_pagamento), '%Y-%m-%d').strftime('%d/%m/%Y'),
                'descricao': f'Pagamentos - {pagamento.categoria.category}',
                'detalhe': pagamento.beneficiario.razao_social,
                'valor': locale.format_string('%.2f', pagamento.valor_pagamento, True),
                'color': 'danger'
            })

        for reembolso in reembolsos:
            movimentacoes.append({
                'data': datetime.strptime(str(reembolso.data), '%Y-%m-%d').strftime('%d/%m/%Y'),
                'descricao': 'Reembolso',
                'detalhe': reembolso.description,
                'valor': locale.format_string('%.2f', reembolso.valor, True),
                'color': 'success'
            })

        for resultado in resultados:
            movimentacoes.append({
                'data': datetime.strptime(str(resultado.data), '%Y-%m-%d').strftime('%d/%m/%Y'),
                'descricao': f'Movimentação Financeira - {resultado.tipo.description}',
                'detalhe': resultado.description,
                'valor': locale.format_string('%.2f', resultado.valor, True),
                'color': 'success' if resultado.tipo.tipo == 'R' else 'danger'
            })    

        for transferencia in transf_entrada_caixa:
            movimentacoes.append({
                'data': datetime.strptime(str(transferencia.data), '%Y-%m-%d').strftime('%d/%m/%Y'),
                'descricao': 'Transferência Recebida',
                'detalhe': transferencia.description,
                'valor': locale.format_string('%.2f', transferencia.valor, True),
                'color': 'success'
            })
        
        for transferencia in transf_saida_caixa:
            movimentacoes.append({
                'data': datetime.strptime(str(transferencia.data), '%Y-%m-%d').strftime('%d/%m/%Y'),
                'descricao': 'Transferência Enviada',
                'detalhe': transferencia.description,
                'valor': locale.format_string('%.2f', transferencia.valor, True),
                'color': 'danger'
            })

        # Sort the list by the 'data' key
        sorted_movimentacoes = sorted(movimentacoes, key=lambda x: datetime.strptime(x['data'], '%d/%m/%Y'), reverse=True)

        context = {
            'nome_caixa': caixa_nome,
            'movimentacoes': sorted_movimentacoes,
        }
    except ObjectDoesNotExist:
        context = {
            'nome_caixa': 'Não existe',
            'movimentacoes': [],
        }
    return JsonResponse(context)


def pdf_saldos_view(request):
    #create bytestrem buffer and canvas
    from reportlab.lib.units import mm
    date_today = date.today().strftime('%d/%m/%Y')

    def coord(x, y, height, unit=1):
        x, y = x * unit, height -  y * unit
        return x, y

    width, height = letter

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)

    #buscando os saldos pela função
    obj = Frasson.saldosAtuaisContasBancarias()
    saldos = obj['saldos']

    c.setFont("Helvetica", 12)
    img = 'static/media/various/logo-frasson.png'
    c.drawImage(img, 42, 450, 110, preserveAspectRatio=True)
    c.drawString(*coord(75, 15, height, mm), "SALDO DAS CONTAS BANCÁRIAS")
    c.setFont("Helvetica-Bold", 11)
    c.setFont("Helvetica", 10)
    c.drawString(*coord(180, 15, height, mm), date_today)
    
    x = 0
    y = 15

    c.setFont("Helvetica", 11)
    c.drawString(*coord(x + 19, y + 15, height, mm), "SALDOS ATUAIS")

    c.drawString(*coord(x + 19, y + 25, height, mm), "Banco do Brasil: ")
    c.drawString(*coord(x + 65, y + 25, height, mm), saldos['banco_brasil'])

    c.drawString(*coord(x + 19, y + 32, height, mm), "Caixa Econômica: ")
    c.drawString(*coord(x + 65, y + 32, height, mm), saldos['caixa_economica'])

    c.drawString(*coord(x + 19, y + 39, height, mm), "Santander: ")
    c.drawString(*coord(x + 65, y + 39, height, mm), saldos['banco_santander'])

    c.drawString(*coord(x + 19, y + 46, height, mm), "Sicredi: ")
    c.drawString(*coord(x + 65, y + 46, height, mm), saldos['banco_sicredi'])

    c.drawString(*coord(x + 19, y + 53, height, mm), "Dinheiro: ")
    c.drawString(*coord(x + 65, y + 53, height, mm), saldos['dinheiro'])

    c.drawString(*coord(x + 19, y + 60, height, mm), "Grupo Frasson: ")
    c.drawString(*coord(x + 65, y + 60, height, mm), saldos['grupo_frasson'])

    c.drawString(*coord(x + 19, y + 67, height, mm), "Sicoob: ")
    c.drawString(*coord(x + 65, y + 67, height, mm), saldos['banco_sicoob'])

    c.drawString(*coord(x + 19, y + 74, height, mm), "Aplicação BB: ")
    c.drawString(*coord(x + 65, y + 74, height, mm), saldos['aplicacao_bb'])

    c.drawString(*coord(x + 19, y + 81, height, mm), "Aplicação xp: ")
    c.drawString(*coord(x + 65, y + 81, height, mm), saldos['aplicacao_xp'])

    c.drawString(*coord(x + 19, y + 88, height, mm), "SALDO TOTAL: ")
    c.drawString(*coord(x + 65, y + 88, height, mm), obj['saldo_total'])

    c.drawString(*coord(x + 19, y + 105, height, mm), "COBRANÇAS ABERTAS")

    c.drawString(*coord(x + 19, y + 115, height, mm), "Aguardando Dist.")
    c.drawString(*coord(x + 65, y + 115, height, mm), obj['aberto_aguardando'])

    c.drawString(*coord(x + 19, y + 122, height, mm), "Notificação")
    c.drawString(*coord(x + 65, y + 122, height, mm), obj['aberto_notificacao'])

    c.drawString(*coord(x + 19, y + 129, height, mm), "Faturamento")
    c.drawString(*coord(x + 65, y + 129, height, mm), obj['aberto_faturamento'])

    c.drawString(*coord(x + 19, y + 136, height, mm), "Confirmação")
    c.drawString(*coord(x + 65, y + 136, height, mm), obj['aberto_confirmacao'])

    c.drawString(*coord(x + 19, y + 143, height, mm), "TOTAL COBRANÇAS")
    c.drawString(*coord(x + 65, y + 143, height, mm), obj['total_aberto_cobrancas'])

    c.drawString(*coord(x + 19, y + 160, height, mm), "PAGAMENTOS ABERTOS")

    c.drawString(*coord(x + 19, y + 170, height, mm), "Conferência")
    c.drawString(*coord(x + 65, y + 170, height, mm), obj['aberto_conferencia'])
    
    c.drawString(*coord(x + 19, y + 177, height, mm), "Agendado")
    c.drawString(*coord(x + 65, y + 177, height, mm), obj['aberto_agendado'])
    c.drawString(*coord(x + 19, y + 184, height, mm), "TOTAL PAGAMENTOS")
    c.drawString(*coord(x + 65, y + 184, height, mm), obj['total_aberto_pagamentos'])
    c.setFont("Helvetica-Bold", 12)
    c.drawString(*coord(x + 19, y + 208, height, mm), "PREVISÃO SALDO")
    c.drawString(*coord(x + 19, y + 215, height, mm), obj['previsao_saldo'])

    #footer
    c.setFont("Helvetica", 11)
    c.drawString(*coord(x + 140, y + 250, height, mm), "#documento interno frasson")

    #finishing up
    c.setTitle("Bank Accounts Frasson")
    c.showPage()
    c.save()
    buf.seek(0)
   
    file_name = f'saldos_contas_{date.today().day}_{date.today().month}_{date.today().year}.pdf'

    #return pdf file (to download file, set as_attachement = True)
    return FileResponse(buf, as_attachment=False, filename=file_name)