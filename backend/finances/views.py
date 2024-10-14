from django.shortcuts import render
from django.http import JsonResponse, FileResponse, HttpResponse
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from .models import Reembolso_Cliente, Resultados_Financeiros, Lancamentos_Automaticos_Pagamentos, Contratos_Ambiental_Pagamentos, Anexos
from pipeline.models import Fluxo_Gestao_Ambiental, Fluxo_Gestao_Credito, Fluxo_Prospects
from .models import Cobrancas, Pagamentos
from cadastro.models import Detalhamento_Servicos
from django.db.models import Sum, Q, Case, When, DecimalField, F, DateField, Subquery, OuterRef, Count, IntegerField, Value
from django.db.models.functions import Coalesce
from backend.frassonUtilities import Frasson
from datetime import date, datetime, timedelta
from collections import defaultdict
import locale, uuid, io, math, json
from .utilities import calcdre
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch, mm
from reportlab.lib.pagesizes import letter, landscape, A4
from reportlab.lib.colors import Color
from rest_framework.response import Response
from reportlab.platypus import Paragraph, Table, PageTemplate, Frame, BaseDocTemplate, Image, Spacer, TableStyle
from reportlab.lib.styles import ParagraphStyle
from io import BytesIO
from num2words import num2words
from reportlab.lib.pagesizes import letter
from reportlab.lib.enums import TA_JUSTIFY, TA_RIGHT, TA_LEFT
from reportlab.lib.colors import Color
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from .utilities import fields_contratogai, fields_pagamento, fields_cobranca

class PagamentosView(viewsets.ModelViewSet):
    queryset = Pagamentos.objects.all()
    serializer_class = detailPagamentos
    lookup_field = 'uuid'
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
                query_search = ((Q(beneficiario__razao_social__icontains=search) | Q(status__icontains=search) | 
                    Q(categoria__category__icontains=search) | Q(categoria__classification__icontains=search)))
                queryset = Pagamentos.objects.filter(query_search).annotate(
                    data=Case(
                        When(status='PG', then=F('data_pagamento')),
                        default=F('data_vencimento'),
                        output_field=DateField()
                    )
                ).filter(data__year=search_year, data__month=search_month).order_by('data')
            else:
                search_year = int(search_year)
                query_search = ((Q(beneficiario__razao_social__icontains=search) | Q(status__icontains=search) | 
                    Q(categoria__category__icontains=search) | Q(categoria__classification__icontains=search)))
                queryset = Pagamentos.objects.filter(query_search).annotate(
                    data=Case(
                        When(status='PG', then=F('data_pagamento')),
                        default=F('data_vencimento'),
                        output_field=DateField()
                    )
                ).filter(data__year=search_year).order_by('data')
        return queryset
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        user = request.data['user'] if 'user' in request.data else None
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            activity = None
            for key in fields_pagamento.keys():
                if key in request.data:
                    activity = Activities.objects.create(pagamento_id=instance.pk, type='ch', campo=fields_pagamento[key], 
                        updated_by_id=user)
            serializer.save()
            headers = self.get_success_headers(serializer.data)
            response_data = serializer.data.copy()
            if activity:
                activity_serializer = serializerActivities(activity)
                response_data.update({'activity':activity_serializer.data if activity else None})
            return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        anos = Pagamentos.objects.values_list('data_vencimento__year', flat=True).distinct()
        response_data = {
            'pagamentos': serializer.data,
            'anos': anos,
        }
        return Response(response_data)
    def get_serializer_class(self):
        if self.action == 'list':
            return listPagamentos
        else:
            return self.serializer_class
        
class CobrancasView(viewsets.ModelViewSet):
    queryset = Cobrancas.objects.all()
    serializer_class = detailCobrancas
    lookup_field = 'uuid'
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', '')
        search_year = self.request.query_params.get('year', None)
        search_month = self.request.query_params.get('month', None)
        search_pago = True if self.request.query_params.get('status', '0') == "1" else False
        phase = self.request.query_params.get('phase', None)
        produto = self.request.query_params.get('produto', None)
        fluxogai = self.request.query_params.get('fluxogai', None)
        
        if search_year:
            search_year = int(search_year)
            if search_month:
                search_month = int(search_month)
                if search_pago:
                    query_search = (Q(status='PG') & 
                        (Q(cliente__razao_social__icontains=search) | Q(status__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))

                else:
                    query_search = (~Q(status='PG') & 
                        (Q(cliente__razao_social__icontains=search) | Q(status__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))
                    
                queryset = Cobrancas.objects.filter(query_search).annotate(
                valor=Case(When(status='PG', then=F('valor_faturado')), default='saldo_devedor', output_field=DecimalField()),
                data=Case(When(status='PG', then=F('data_pagamento')), default='data_previsao')).filter(data__year=search_year, data__month=search_month).order_by('data')
            else:
                if search_pago:
                    query_search = (Q(status='PG') & 
                        (Q(cliente__razao_social__icontains=search) | Q(status__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))
                else:
                    query_search = (~Q(status='PG') &
                        (Q(cliente__razao_social__icontains=search) | Q(status__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))
                queryset = Cobrancas.objects.filter(query_search).annotate(
                valor=Case(When(status='PG', then=F('valor_faturado')), default='saldo_devedor', output_field=DecimalField()),
                data=Case(When(status='PG', then=F('data_pagamento')), default='data_previsao')).filter(data__year=search_year).order_by('data')

        else: #se não houver nenhuma busca (carregada pela primeira vez)
            queryset = Cobrancas.objects.annotate(
            valor=Case(When(status='PG', then=F('valor_faturado')), default='saldo_devedor', output_field=DecimalField()),
            data=Case(When(status='PG', then=F('data_pagamento')), default='data_previsao')).order_by('data')

        if phase:
            queryset = Cobrancas.objects.filter(status='s').annotate(
            valor=Case(When(status='PG', then=F('valor_faturado')), default='saldo_devedor', output_field=DecimalField()),
            data=Case(When(status='PG', then=F('data_pagamento')), default='data_previsao')).order_by('data')

        if produto:
            queryset = Cobrancas.objects.filter(detalhamento__produto_id=int(produto)).annotate(
            valor=Case(When(status='PG', then=F('valor_faturado')), default='saldo_devedor', output_field=DecimalField()),
            data=Case(When(status='PG', then=F('data_pagamento')), default='data_previsao')).order_by('data')
        
        if fluxogai:
            try:
                contrato = Fluxo_Gestao_Ambiental.objects.get(pk=int(fluxogai)).contrato.id
                queryset = Cobrancas.objects.filter(etapa_ambiental__contrato__id=int(contrato)).annotate(
                valor=Case(When(status='PG', then=F('valor_faturado')), default='saldo_devedor', output_field=DecimalField()),
                data=Case(When(status='PG', then=F('data_pagamento')), default='data_previsao')).order_by('-data')
            except ObjectDoesNotExist:
                queryset = []
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
            if self.request.query_params.get('fluxogai', None):
                return detailCobrancas
            if self.request.query_params.get('fluxogc', None):
                return detailCobrancas
            return listCobrancas
        else:
            return self.serializer_class
        
    def create(self, request, *args, **kwargs):
        contrato = request.data.get('contrato')
        servico = request.data.get('servico')
        etapa = request.data.get('etapa')
        data = request.data.copy() 
        erros = {}
        if contrato:
            if not etapa or not servico:
                erros = {'servico':'Esse Campo é obrigatório' if not servico else None, 'etapa':'Esse Campo é obrigatório'if not etapa else None}
            else:
                etapa_instance = Contratos_Ambiental_Pagamentos.objects.filter(contrato=contrato, servico=servico, etapa=etapa).first()
                if etapa_instance:
                    cobranca = Cobrancas.objects.filter(etapa_ambiental=etapa_instance)
                    if not cobranca:
                        data['etapa_ambiental'] = etapa_instance.id
                        data['saldo_devedor'] = etapa_instance.valor
                    else:
                        return Response({'non_fields_errors':'Já existe uma cobrança gerada para essa etapa e serviço'}, 
                            status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({'non_fields_errors':'Não existe essa etapa de pagamento para esse serviço no contrato'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            erros.update(serializer.errors)
            return Response(erros, status=status.HTTP_400_BAD_REQUEST)
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        user = request.data['user'] if 'user' in request.data else None
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            activity = None
            for key in fields_cobranca.keys():
                if key in request.data:
                    activity = Activities.objects.create(cobranca_id=instance.pk, type='ch', campo=fields_cobranca[key], 
                        updated_by_id=user)
            serializer.save()
            headers = self.get_success_headers(serializer.data)
            response_data = serializer.data.copy()
            if activity:
                activity_serializer = serializerActivities(activity)
                response_data.update({'activity':activity_serializer.data if activity else None})
            return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CobrancasInvoicesView(viewsets.ModelViewSet):
    queryset = Cobrancas.objects.all()
    serializer_class = listCobrancasInvoices
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        produto = self.request.query_params.get('produto', None)
        current_year = int(date.today().year)
        if produto:
            queryset = queryset.filter(status='PG', data_pagamento__year=current_year,
                etapa_ambiental__servico__produto_id=produto).order_by('-data_pagamento')
        else:
            queryset = queryset.filter(status='s', data_pagamento__year=current_year).order_by('-data_pagamento')
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
            queryset = queryset.filter(Q(nome__icontains=search) & Q(is_active=True))
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

class ContratoAmbientalView(viewsets.ModelViewSet):
    serializer_class = detailContratoAmbiental
    queryset = Contratos_Ambiental.objects.all()
    lookup_field = 'uuid'
    parser_classes = (MultiPartParser, FormParser)
    def get_serializer_class(self):
        if self.action == 'list':
            return listContratoAmbiental
        else:
            return self.serializer_class
    def list(self, request, *args, **kwargs):
        search = self.request.query_params.get('search', None)
        subquery = Cobrancas.objects.filter(etapa_ambiental__contrato_id=OuterRef('id')).values('etapa_ambiental__contrato_id').annotate(
            num_cobrancas=Count('id')).values('num_cobrancas')[:1]
        subquery2 = Cobrancas.objects.filter(etapa_ambiental__contrato_id=OuterRef('id'), status='PG').values('etapa_ambiental__contrato_id').annotate(
            num_cobrancas=Count('id')).values('num_cobrancas')[:1]
        subquery3 = Contratos_Ambiental_Pagamentos.objects.filter(contrato_id=OuterRef('id')).values('contrato_id').annotate(
            total=Count('id')).values('total')[:1]

        if search:
            query_search = (Q(contratante__razao_social__icontains=search) | Q(servicos__detalhamento_servico__icontains=search))
            queryset = Contratos_Ambiental.objects.filter(query_search).annotate(
                total_cobrancas=Coalesce(Subquery(subquery, output_field=IntegerField()), 0),
                total_pago=Coalesce(Subquery(subquery2, output_field=IntegerField()), 0),
                total_formas=Coalesce(Subquery(subquery3, output_field=IntegerField()), 0),
                status=Case(When((Q(total_cobrancas__gt=0) & Q(total_pago=F('total_pago')) & Q(total_cobrancas=F('total_formas'))),
                    then=Value('Finalizado')), default=Value('Em Andamento'))
            ).distinct().order_by('-created_at')
        else:
            queryset = Contratos_Ambiental.objects.all().annotate(
                total_cobrancas=Coalesce(Subquery(subquery, output_field=IntegerField()), 0),
                total_pago=Coalesce(Subquery(subquery2, output_field=IntegerField()), 0),
                total_formas=Coalesce(Subquery(subquery3, output_field=IntegerField()), 0),
                status=Case(When((Q(total_cobrancas__gt=0) & Q(total_pago=F('total_pago')) & Q(total_cobrancas=F('total_formas'))),
                    then=Value('Finalizado')), default=Value('Em Andamento'))
            ).order_by('-created_at')[:50]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        servicos_etapas = request.POST.getlist('servicos_etapas')
        filtered_servicos_etapas = [item for item in servicos_etapas if json.loads(item).get('dados')]
        if len(filtered_servicos_etapas) < len(request.POST.getlist('servicos')):
            return Response({'non_fields_errors':'Cadastre pelo menos uma etapa de pagamento para cada serviço'}, status=status.HTTP_400_BAD_REQUEST)
        total_percentages = {}
        for s in filtered_servicos_etapas:
            reg = json.loads(s)
            if not reg['valor'] or reg['valor'] == 0:
                return Response({'non_fields_errors': f'Defina o valor total do(s) serviço(s)'}, status=status.HTTP_400_BAD_REQUEST)
            servico = reg['servico']
            total_percentages[servico] = total_percentages.get(servico, 0) + sum(e['percentual'] for e in reg['dados'])
        # Check if total percentage is 100% for each service
        for servico, total in total_percentages.items():
            if total != 100:
                name_serv = Detalhamento_Servicos.objects.get(pk=servico).detalhamento_servico
                return Response({'non_fields_errors': f'O total de percentual para o serviço "{name_serv}" deve ser 100%. Atual: {total}%'},
                                status=status.HTTP_400_BAD_REQUEST)
        if serializer.is_valid():
            with transaction.atomic():
                self.perform_create(serializer)
                for s in servicos_etapas:
                    reg = json.loads(s)
                    for e in reg['dados']:
                        ser = serContratosPagamentosAmbiental(data={'servico':reg["servico"], 'etapa':e['etapa'], 'percentual':e['percentual'],
                            'valor':e['valor'], 'contrato':serializer.data['id']})
                        if ser.is_valid():
                            ser.save()
                        else:
                            transaction.set_rollback(True)
                            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
                files = request.FILES.getlist('file')
                if request.FILES:
                    for i in files:
                        Anexos.objects.create(contrato_ambiental=serializer.instance, uploaded_by_id=request.data['created_by'], file=i)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        servicos_list = list(instance.servicos.all().values_list('id', flat=True))  
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        servicos_etapas = request.POST.getlist('servicos_etapas')
        if servicos_etapas:
            filtered_servicos_etapas = [item for item in servicos_etapas if json.loads(item).get('dados')]
            if len(filtered_servicos_etapas) < len(request.POST.getlist('servicos')):
                return Response({'non_fields_errors':'Cadastre pelo menos uma etapa de pagamento para cada serviço'}, status=status.HTTP_400_BAD_REQUEST)
            total_percentages = {}
            for s in filtered_servicos_etapas:
                reg = json.loads(s)
                servico = reg['servico']
                total_percentages[servico] = total_percentages.get(servico, 0) + sum(e['percentual'] for e in reg['dados'])
            # Check if total percentage is 100% for each service
            for servico, total in total_percentages.items():
                if total != 100:
                    name_serv = Detalhamento_Servicos.objects.get(pk=servico).detalhamento_servico
                    return Response({'non_fields_errors': f'O total de percentual para o serviço "{name_serv}" deve ser 100%. Atual: {total}%'},
                                    status=status.HTTP_400_BAD_REQUEST)
        if serializer.is_valid():
            with transaction.atomic(): #faz as operações no DB serem reversíveis
                contrato = serializer.save()  
                Contratos_Ambiental_Pagamentos.objects.filter(contrato_id=instance.id).exclude(
                    servico_id__in=[int(l) for l in request.POST.getlist('servicos')]).delete() #exlcui etapas de servicos antigos
                for s in servicos_etapas:
                    reg = json.loads(s)
                    if reg['servico'] in servicos_list:
                        Contratos_Ambiental_Pagamentos.objects.filter(contrato_id=instance.id, servico_id=reg['servico']).exclude(
                            etapa__in=[e['etapa'] for e in reg['dados']]).delete()   
                        for e in reg['dados']:
                            search = Contratos_Ambiental_Pagamentos.objects.filter(contrato_id=contrato.id, servico_id=reg['servico'], 
                                etapa=e['etapa'])
                            cobrancas = Cobrancas.objects.filter(etapa_ambiental__etapa=e['etapa'], 
                                etapa_ambiental__servico_id=reg['servico'], etapa_ambiental__contrato_id=contrato.id
                            )
                            if cobrancas.exists():
                                str_servico = cobrancas[0].etapa_ambiental.servico.detalhamento_servico
                                msg = f'Existem cobranças vinculadas a etapas de "{str_servico}". Exclua as cobranças vinculadas para poder alterá-las.'
                                transaction.set_rollback(True)
                                return Response({'non_fields_errors':msg}, 
                                    status=status.HTTP_400_BAD_REQUEST)
                            else:
                                if search.exists():
                                    search.update(**{'percentual': e['percentual'], 'valor': e['valor'],
                                        'contrato_id':contrato.id, 'servico_id':reg['servico'],'etapa':e['etapa']
                                    })
                                else:
                                    Contratos_Ambiental_Pagamentos.objects.create(
                                        contrato_id=contrato.id, servico_id=reg['servico'], etapa=e['etapa'],
                                        percentual= e['percentual'], valor= e['valor'],
                                    )
                    else: 
                        for e in reg['dados']:
                            ser = serContratosPagamentosAmbiental(data={'servico':reg["servico"], 'etapa':e['etapa'], 'percentual':e['percentual'],
                                'valor':e['valor'], 'contrato':contrato.id})
                            if ser.is_valid():
                                ser.save()
                            else:
                                transaction.set_rollback(True)
                                return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
                activity = None
                for key in fields_contratogai.keys():
                    if key in request.POST:
                        activity = Activities.objects.create(contrato_ambiental_id=instance.pk, type='ch', campo=fields_contratogai[key], 
                            updated_by_id=request.data['user'])
                headers = self.get_success_headers(serializer.data)
                response_data = serializer.data.copy()
                if activity:
                    activity_serializer = serializerActivities(activity)
                    response_data.update({'activity':activity_serializer.data if activity else None})
                return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)         
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContratosPagamentosAmbientalView(viewsets.ModelViewSet):
    serializer_class = serContratosPagamentosAmbiental
    queryset = Contratos_Ambiental_Pagamentos.objects.all()

class ContratoCreditoView(viewsets.ModelViewSet):
    serializer_class = detailContratoCredito
    queryset = Contratos_Credito.objects.all()
    lookup_field = 'uuid'
    parser_classes = (MultiPartParser, FormParser)
    def get_serializer_class(self):
        if self.action == 'list':
            return listContratoCredito
        else:
            return self.serializer_class
    def list(self, request, *args, **kwargs):
        search = self.request.query_params.get('search', None)
        subquery = Cobrancas.objects.filter(etapa_ambiental__contrato_id=OuterRef('id')).values('etapa_credito__contrato_id').annotate(
            num_cobrancas=Count('id')).values('num_cobrancas')[:1]
        subquery2 = Cobrancas.objects.filter(etapa_ambiental__contrato_id=OuterRef('id'), status='PG').values('etapa_credito__contrato_id').annotate(
            num_cobrancas=Count('id')).values('num_cobrancas')[:1]
        subquery3 = Contratos_Credito_Pagamentos.objects.filter(contrato_id=OuterRef('id')).values('contrato_id').annotate(
            total=Count('id')).values('total')[:1]
        if search:
            query_search = (Q(contratante__razao_social__icontains=search) | Q(servicos__detalhamento_servico__icontains=search)) 
            queryset = Contratos_Credito.objects.filter(query_search).annotate(
                total_cobrancas=Coalesce(Subquery(subquery, output_field=IntegerField()), 0),
                total_pago=Coalesce(Subquery(subquery2, output_field=IntegerField()), 0),
                total_formas=Coalesce(Subquery(subquery3, output_field=IntegerField()), 0),
                status=Case(When((Q(total_cobrancas__gt=0) & Q(total_pago=F('total_pago')) & Q(total_cobrancas=F('total_formas'))),
                    then=Value('Finalizado')), default=Value('Em Andamento'))
            ).distinct().order_by('-created_at')
        else:
            query_search = Contratos_Credito.objects.all()
            queryset = query_search.annotate(
                total_cobrancas=Coalesce(Subquery(subquery, output_field=IntegerField()), 0),
                total_pago=Coalesce(Subquery(subquery2, output_field=IntegerField()), 0),
                total_formas=Coalesce(Subquery(subquery3, output_field=IntegerField()), 0),
                status=Case(When((Q(total_cobrancas__gt=0) & Q(total_pago=F('total_pago')) & Q(total_cobrancas=F('total_formas'))),
                    then=Value('Finalizado')), default=Value('Em Andamento'))
            ).order_by('-created_at')[:50]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        servicos_etapas = request.POST.getlist('servicos_etapas')
        filtered_servicos_etapas = [item for item in servicos_etapas if json.loads(item).get('dados')]
        if len(filtered_servicos_etapas) < len(request.POST.getlist('servicos')):
            return Response({'non_fields_errors':'Cadastre pelo menos uma etapa de pagamento para cada serviço'}, status=status.HTTP_400_BAD_REQUEST)
        total_percentages = {}
        for s in filtered_servicos_etapas:
            reg = json.loads(s)
            if not reg['valor'] or reg['valor'] == 0:
                return Response({'non_fields_errors': f'Defina o valor total do(s) serviço(s)'}, status=status.HTTP_400_BAD_REQUEST)
            servico = reg['servico']
            total_percentages[servico] = total_percentages.get(servico, 0) + sum(e['percentual'] for e in reg['dados'])
        # Check if total percentage is 100% for each service
        for servico, total in total_percentages.items():
            if total != 100:
                name_serv = Detalhamento_Servicos.objects.get(pk=servico).detalhamento_servico
                return Response({'non_fields_errors': f'O total de percentual para o serviço "{name_serv}" deve ser 100%. Atual: {total}%'},
                    status=status.HTTP_400_BAD_REQUEST)
        if serializer.is_valid():
            with transaction.atomic():
                self.perform_create(serializer)
                for s in servicos_etapas:
                    reg = json.loads(s)
                    for e in reg['dados']:
                        ser = serContratosPagamentosCredito(data={'servico':reg["servico"], 'etapa':e['etapa'], 'percentual':e['percentual'],
                            'valor':e['valor'], 'contrato':int(serializer.data['id'])})
                        if ser.is_valid():
                            ser.save()
                        else:
                            transaction.set_rollback(True)
                            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
                files = request.FILES.getlist('file')
                if request.FILES:
                    for i in files:
                        Anexos.objects.create(contrato_credito=serializer.instance, uploaded_by_id=request.data['created_by'], file=i)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        servicos_list = list(instance.servicos.all().values_list('id', flat=True))  
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        servicos_etapas = request.POST.getlist('servicos_etapas')
        if servicos_etapas:
            filtered_servicos_etapas = [item for item in servicos_etapas if json.loads(item).get('dados')]
            if len(filtered_servicos_etapas) < len(request.POST.getlist('servicos')):
                return Response({'non_fields_errors':'Cadastre pelo menos uma etapa de pagamento para cada serviço'}, status=status.HTTP_400_BAD_REQUEST)
            total_percentages = {}
            for s in filtered_servicos_etapas:
                reg = json.loads(s)
                servico = reg['servico']
                total_percentages[servico] = total_percentages.get(servico, 0) + sum(e['percentual'] for e in reg['dados'])
            # Check if total percentage is 100% for each service
            for servico, total in total_percentages.items():
                if total != 100:
                    name_serv = Detalhamento_Servicos.objects.get(pk=servico).detalhamento_servico
                    return Response({'non_fields_errors': f'O total de percentual para o serviço "{name_serv}" deve ser 100%. Atual: {total}%'},
                                    status=status.HTTP_400_BAD_REQUEST)
        if serializer.is_valid():
            with transaction.atomic(): #faz as operações no DB serem reversíveis
                contrato = serializer.save()  
                Contratos_Credito_Pagamentos.objects.filter(contrato_id=instance.id).exclude(
                    servico_id__in=[int(l) for l in request.POST.getlist('servicos')]).delete() #exlcui etapas de servicos antigos
                for s in servicos_etapas:
                    reg = json.loads(s)
                    if reg['servico'] in servicos_list:
                        Contratos_Credito_Pagamentos.objects.filter(contrato_id=instance.id, servico_id=reg['servico']).exclude(
                            etapa__in=[e['etapa'] for e in reg['dados']]).delete()   
                        for e in reg['dados']:
                            search = Contratos_Credito_Pagamentos.objects.filter(contrato_id=contrato.id, servico_id=reg['servico'], 
                                etapa=e['etapa'])
                            if search.filter(percentual=e['percentual']).exists():
                                pass
                            else:
                                cobrancas = Cobrancas.objects.filter(etapa_credito__etapa=e['etapa'], 
                                    etapa_credito__servico_id=reg['servico'], etapa_credito__contrato_id=contrato.id
                                )
                                if cobrancas.exists():
                                    str_servico = cobrancas[0].etapa_credito.servico.detalhamento_servico
                                    msg = f'Existem cobranças vinculadas a etapas de "{str_servico}". Exclua as cobranças vinculadas para poder alterá-las.'
                                    transaction.set_rollback(True)
                                    return Response({'non_fields_errors':msg}, 
                                        status=status.HTTP_400_BAD_REQUEST)
                                else:
                                    if search.exists():
                                        search.update(**{'percentual': e['percentual'], 'valor': e['valor'],
                                            'contrato_id':contrato.id, 'servico_id':reg['servico'],'etapa':e['etapa']
                                        })
                                    else:
                                        Contratos_Credito_Pagamentos.objects.create(
                                            contrato_id=contrato.id, servico_id=reg['servico'], etapa=e['etapa'],
                                            percentual= e['percentual'], valor= e['valor'],
                                        )
                    else: 
                        for e in reg['dados']:
                            ser = serContratosPagamentosCredito(data={'servico':reg["servico"], 'etapa':e['etapa'], 'percentual':e['percentual'],
                                'valor':e['valor'], 'contrato':contrato.id})
                            if ser.is_valid():
                                ser.save()
                            else:
                                transaction.set_rollback(True)
                                return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
                activity = None
                for key in fields_contratogai.keys():
                    if key in request.POST:
                        activity = Activities.objects.create(contrato_credito_id=instance.pk, type='ch', campo=fields_contratogai[key], 
                            updated_by_id=request.data['user'])
                headers = self.get_success_headers(serializer.data)
                response_data = serializer.data.copy()
                if activity:
                    activity_serializer = serializerActivities(activity)
                    response_data.update({'activity':activity_serializer.data if activity else None})
                return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)         
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContratosPagamentosCreditoView(viewsets.ModelViewSet):
    serializer_class = serContratosPagamentosCredito
    queryset = Contratos_Credito_Pagamentos.objects.all()

class ActivityView(viewsets.ModelViewSet):
    queryset = Activities.objects.all().order_by('-created_at')
    serializer_class = serializerActivities
    def get_queryset(self):
        queryset = super().get_queryset()
        contratogai = self.request.query_params.get('contratogai', None)   
        contratogc = self.request.query_params.get('contratogc', None)   
        pagamento = self.request.query_params.get('pagamento', None) 
        cobranca = self.request.query_params.get('cobranca', None) 
        if contratogai:
            queryset = queryset.filter(Q(contrato_ambiental_id=int(contratogai)))
        if contratogc:
            queryset = queryset.filter(Q(contrato_credito_id=int(contratogc)))
        if pagamento:
            queryset = queryset.filter(Q(pagamento_id=int(pagamento)))
        if cobranca:
            queryset = queryset.filter(Q(cobranca_id=int(cobranca)))
        return queryset

class AnexoView(viewsets.ModelViewSet):
    queryset = Anexos.objects.all().order_by('-created_at')
    serializer_class = serializerAnexos
    def get_queryset(self):
        queryset = super().get_queryset()
        contratogai = self.request.query_params.get('contratogai', None)   
        contratogc = self.request.query_params.get('contratogc', None)  
        if contratogai:
            queryset = queryset.filter(Q(contrato_ambiental_id=int(contratogai)))
        if contratogc:
            queryset = queryset.filter(Q(contrato_credito_id=int(contratogc)))
        return queryset
    def create(self, request, *args, **kwargs):
        response_data = []
        serializer = self.get_serializer(data=request.data)
        files = request.FILES.getlist('file')
        if serializer.is_valid():
            for i in files:
                reg = Anexos.objects.create(
                    contrato_credito_id=request.data.get('contrato_credito') if request.data.get('contrato_credito') else None, 
                    contrato_ambiental_id=request.data.get('contrato_ambiental') if request.data.get('contrato_ambiental') else None, 
                    uploaded_by_id=request.data.get('uploaded_by'), 
                    file=i
                )
                response_data.append({
                    'id': reg.id, 
                    'file': '/media/' + reg.file.name, 
                    'name': reg.name, 
                    'user':{'name':reg.uploaded_by.first_name+' '+reg.uploaded_by.last_name, 'id':reg.uploaded_by.id},
                    'created_at': reg.created_at
                })
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def etapas_contrato_ambiental(request, id):
    etapas = Contratos_Ambiental_Pagamentos.objects.filter(contrato_id=id)
    return JsonResponse([{'name':e.etapa} for e in etapas], safe=False)

def index_dre_consolidado(request):
    #DRE CONSOLIDADO
    produto_gc = 864795372
    produto_gai = 864795466
    produto_avaliacao = 864795628
    produto_tecnologia = 864795734
    class_custo = 'COE'
    class_desp_oper = 'DOP'
    class_desp_nao_oper = 'DNOP'
    class_retirada = 'RS'
    class_comissao = 'PC'
    class_ativos = 'AI'
    class_outros = 'O'

    anos = [ano for ano in range(2021, date.today().year + 1)] #cria a lista dos anos de busca
    search = request.GET.get('year')

    if search: 
        year = int(search)
    else: 
        year = date.today().year
    
    #FATURAMENTO CONSOLIDADO POR PRODUTO
    query_faturado_total= Cobrancas.objects.filter(data_pagamento__year=year, status='').aggregate(
        credito=Sum(Case(When(etapa_credito__servico__produto=produto_gc, then='valor_faturado'), default=0, output_field=DecimalField())),
        ambiental=Sum(Case(When(etapa_ambiental__servico__produto=produto_gai, then='valor_faturado'), default=0, output_field=DecimalField())),
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
    produto_gc = 1
    produto_gai = 2
    produto_avaliacao = 864795628
    produto_tecnologia = 864795734
    class_custo = 'Custo Operacional'
    class_desp_oper = 'Despesa Operacional'
    class_desp_nao_oper = 'Despesa Não Operacional'
    class_investimentos = 'Ativos Imobilizados'
    type_card = 'Principal'

    #FATURAMENTO CONSOLIDADO POR PRODUTO
    query_faturado_total= Cobrancas.objects.filter(data_pagamento__year=year, status='PG').aggregate(
        credito=Sum(Case(When(etapa_ambiental__servico__produto=produto_gc, then='valor_faturado'), default=0, output_field=DecimalField())),
        ambiental=Sum(Case(When(etapa_credito__servico__produto=produto_gai, then='valor_faturado'), default=0, output_field=DecimalField())),
        avaliacao=Sum(Case(When(detalhamento__produto=produto_avaliacao, then='valor_faturado'), default=0, output_field=DecimalField())),
        tecnologia=Sum(Case(When(detalhamento__produto=produto_tecnologia, then='valor_faturado'), default=0, output_field=DecimalField())))

    faturado_gai = query_faturado_total.get('ambiental', 0) or 0
    faturado_gc = query_faturado_total.get('credito', 0) or 0
    faturado_avaliacao = query_faturado_total.get('avaliacao', 0) or 0
    faturado_tecnologia = query_faturado_total.get('tecnologia', 0) or 0
    faturado_total = float(faturado_gai + faturado_gc + faturado_avaliacao + faturado_tecnologia)

    #CÁCULO IMPOSTOS INDIRETOS (ISS, PIS, COFINS) QUE FORAM PAGOS
    query_impostos_indiretos = Pagamentos.objects.filter(status='PG', data_pagamento__year=year).aggregate(
        total_iss=Sum(Case(When(categoria_id=687761062, then='valor_pagamento'), default=0, output_field=DecimalField())),
        total_pis=Sum(Case(When(categoria_id=687760058, then='valor_pagamento'), default=0, output_field=DecimalField())),
        total_cofins=Sum(Case(When(categoria_id=687760600, then='valor_pagamento'), default=0, output_field=DecimalField())))
    
    total_iss = query_impostos_indiretos.get('total_iss', 0) or 0
    total_pis = query_impostos_indiretos.get('total_pis', 0) or 0
    total_cofins = query_impostos_indiretos.get('total_cofins', 0) or 0
    total_impostos_indiretos = float(total_iss + total_pis + total_cofins)

    #TOTAL DE COBRANÇAS ABERTAS POR PRODUTO
    cobrancas_abertas_phases = ['AD', 'NT', 'FT', 'AG'] #fases aguardando distrib., notificação, faturamento e confirmação 
    query_cobrancas_abertas = Cobrancas.objects.filter(status__in=cobrancas_abertas_phases).aggregate(
        total_gc=Sum(Case(When(etapa_credito__servico__produto=produto_gc, then='saldo_devedor'), default=0, output_field=DecimalField())),
        total_gai=Sum(Case(When(etapa_ambiental__servico__produto=produto_gai, then='saldo_devedor'), default=0, output_field=DecimalField())),
        total_avaliacao=Sum(Case(When(detalhamento__produto=produto_avaliacao, then='saldo_devedor'), default=0, output_field=DecimalField())),
        total_tecnologia=Sum(Case(When(detalhamento__produto=produto_tecnologia, then='saldo_devedor'), default=0, output_field=DecimalField())))

    aberto_gc = query_cobrancas_abertas.get('total_gc', 0) or 0
    aberto_gai = query_cobrancas_abertas.get('total_gai', 0) or 0
    aberto_avaliacao = query_cobrancas_abertas.get('total_avaliacao', 0) or 0
    aberto_tecnologia = query_cobrancas_abertas.get('total_tecnologia', 0) or 0
    aberto_total = float(aberto_gc + aberto_gai + aberto_avaliacao + aberto_tecnologia)

    #Valores em PV no Prospect. Calcula o % restante de ano (por enquanto vamos considerar que só é possível realizar o percentual restante do ano)
    total_pv_prospect = Fluxo_Prospects.objects.filter(phase__descricao='PROPOSTA INICIAL', produto=produto_gai).aggregate(total=Sum('proposta_inicial'))['total'] or 0
    days_passed = (date.today() - date(date.today().year, 1, 1)).days
    total_days = 366 if date.today().year % 4 == 0 and (date.today().year % 100 != 0 or date.today().year % 400 == 0) else 365
    percentage_left_year = 1 - (days_passed / total_days)
    total_proposta_valor = float(total_pv_prospect) * percentage_left_year
    percentual_proposta_valor = f"{locale.format_string('%.2f', (percentage_left_year * 100), True)}%"

    #cálculo faturamento estimado conforme operações em andamento (Gestão de Crédito)
    phases_andamento_gc = [310429134, 310429135, 310429174, 310429173, 310429175, 310429177, 310496731, 310429178, 310429179]
    faturamento_provisionado_gc_total = Fluxo_Gestao_Credito.objects.filter(detalhamento__produto=produto_gc, phase_id__in=phases_andamento_gc).aggregate(total=Sum('contrato__valor'))['total'] or 0
    faturamento_provisionado_gc = 0.008 * float(faturamento_provisionado_gc_total) # 0.8% de ticket médio
    
    #calcula o faturamento restante do GAI em operações em andamento
    #AQUI TEM QUE CRIAR UMA ROTINA MAGAIVER PRA CALCULAR O ESTIMADO A RECEBER DO GAI
    phases_ate_protocolo = [310429134, 310429135, 310429174, 310429173, 310429175, 310429177, 310496731, 310429178]
    total_ate_protocolo_gai = Fluxo_Gestao_Ambiental.objects.filter(detalhamento__produto=produto_gai, phase_id__in=phases_ate_protocolo).aggregate(total=Sum('contrato__valor'))['total'] or 0
    total_followup_gai = Fluxo_Gestao_Ambiental.objects.filter(detalhamento__produto=produto_gai, phase=1).aggregate(total=Sum('contrato__valor'))['total'] or 0
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
    query_total_custos_despesas = Pagamentos.objects.filter(status='PG', data_pagamento__year=year).aggregate(
        custos=Sum(Case(When(categoria__classification=class_custo, then='valor_pagamento'), default=0, output_field=DecimalField())),
        despesas_operacionais=Sum(Case(When(categoria__classification=class_desp_oper, then='valor_pagamento'), default=0, output_field=DecimalField())),
        despesas_nao_operacionais=Sum(Case(When(categoria__classification=class_desp_nao_oper, then='valor_pagamento'), default=0, output_field=DecimalField())))

    total_custos = query_total_custos_despesas.get('custos', 0) or 0
    total_despesas_operacionais = query_total_custos_despesas.get('despesas_operacionais', 0) or 0
    total_despesas_nao_operacionais = query_total_custos_despesas.get('despesas_nao_operacionais', 0) or 0
    total_despesas = float(total_despesas_operacionais + total_despesas_nao_operacionais)

    #CÁLCULO ESTIMATIVA DOS CUSTOS RESTANTES
    custos_estimativa = Pagamentos.objects.values('data_pagamento__year', 'data_pagamento__month').filter(
        status__in=['AG', 'AD'], categoria__classification=class_custo).annotate(total=Sum('valor_pagamento')
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
    despesas_estimativa = Pagamentos.objects.values('data_pagamento__year', 'data_pagamento__month').filter(
        status='s', categoria__classification__in=[class_desp_oper, class_desp_nao_oper]).annotate(total=Sum('valor_pagamento')
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
    query_impostos_diretos = Pagamentos.objects.filter(status='PG', data_pagamento__year=year).aggregate(
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
                (Q(beneficiario__razao_social__icontains=search) | Q(status__icontains=search) | Q(categoria__category__icontains=search)))
        pagamentos_pipefy = Pagamentos.objects.filter(query_search).annotate(
            data=Case(When(status='s', then=F('data_pagamento')), default='data_vencimento')).filter(data__year=search_year, data__month=search_month).order_by('data')

    else:
        query_search = ((Q(data_vencimento__year=search_year) | Q(data_pagamento__year=search_year)) & 
            (Q(beneficiario__razao_social__icontains=search) | Q(status__icontains=search) | Q(categoria__category__icontains=search)))
        pagamentos_pipefy = Pagamentos.objects.filter(query_search).annotate(
            data=Case(When(status='s', then=F('data_pagamento')), default='data_vencimento')).filter(data__year=search_year).order_by('data')

    pagamentos = []
    pagamentos_phases = pagamentos_pipefy.values('status').annotate(soma=Sum('valor_pagamento')).order_by('status')
    total_pagamentos = Pagamentos.objects.filter(query_search).aggregate(soma=Sum('valor_pagamento'))

    for pag in pagamentos_phases:
        pagamentos.append({
            'phase': pag['status'],
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
                c.drawString(margin_left + 550, vertical_position, str(pagamentos_pipefy[registro_pagamento].status))
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
            query_search = (Q(status='s') & (Q(data_previsao__year=search_year) | Q(data_pagamento__year=search_year)) & 
                (Q(data_previsao__month=search_month) | Q(data_pagamento__month=search_month)) & 
                    (Q(cliente__razao_social__icontains=search) | Q(status__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))
        else:
            query_search = (~Q(status='s') & (Q(data_previsao__year=search_year) | Q(data_pagamento__year=search_year)) & 
                (Q(data_previsao__month=search_month) | Q(data_pagamento__month=search_month)) & 
                    (Q(cliente__razao_social__icontains=search) | Q(status__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))
        
        cobrancas_pipefy = Cobrancas.objects.filter(query_search).annotate(
            valor=Case(When(status='s', then='valor_faturado'), default='saldo_devedor', output_field=DecimalField()),
            data=Case(When(status='s', then='data_pagamento'), default='data_previsao')).filter(data__year=search_year, data__month=search_month).order_by('data')
    
    else:
        if search_pago:
            query_search = (Q(status='s') & (Q(data_previsao__year=search_year) | Q(data_pagamento__year=search_year)) & 
                (Q(cliente__razao_social__icontains=search) | Q(status__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))
        else:
            query_search = (~Q(status='s') & (Q(data_previsao__year=search_year) | Q(data_pagamento__year=search_year)) & 
                (Q(cliente__razao_social__icontains=search) | Q(status__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search)))
        
        cobrancas_pipefy = Cobrancas.objects.filter(query_search).annotate(
            valor=Case(When(status='s', then='valor_faturado'), default='saldo_devedor', output_field=DecimalField()),
            data=Case(When(status='s', then='data_pagamento'), default='data_previsao')).filter(data__year=search_year).order_by('data')
    
    cobrancas_phases = cobrancas_pipefy.values('status').annotate(
        valor=Sum(Case(When(status='s', then=F('valor_faturado')), default=F('saldo_devedor'), output_field=DecimalField()))).order_by('status')

    total_cobrancas = cobrancas_pipefy.aggregate(
        soma=Sum(Case(When(status='s', then='valor_faturado'), default='saldo_devedor', output_field=DecimalField())))

    cobrancas = [{
        'phase': pag['status'],
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
            c.drawString(margin_left + 280, margin_top, "Detalhamento")
            c.drawString(margin_left + 500, margin_top, "Status")
            c.drawString(margin_left + 640, margin_top, "Valor")
            c.line(margin_left, margin_top - 5, margin_left + 700, margin_top - 5)
        
        c.setFont("Helvetica", 8)

        vertical_position = margin_top - 15
        for j in range(registro_cobranca, registro_cobranca + numero_registros_por_pagina):
            if registro_cobranca < len(cobrancas_pipefy):
                if cobrancas_pipefy[registro_cobranca].etapa_ambiental:
                    detalhe_servico = cobrancas_pipefy[registro_cobranca].etapa_ambiental.servico.detalhamento_servico 
                elif cobrancas_pipefy[registro_cobranca].etapa_credito:
                    detalhe_servico = cobrancas_pipefy[registro_cobranca].etapa_credito.servico.detalhamento_servico 
                elif cobrancas_pipefy[registro_cobranca].detalhamento:
                    detalhe_servico = cobrancas_pipefy[registro_cobranca].detalhamento.detalhamento_servico 
                else:
                    detalhe_servico = '-'
                c.drawString(margin_left, vertical_position, datetime.strptime(str(cobrancas_pipefy[registro_cobranca].data), '%Y-%m-%d').strftime('%d/%m/%Y'))
                c.drawString(margin_left + 60, vertical_position, str(cobrancas_pipefy[registro_cobranca].cliente.razao_social)[:60])
                c.drawString(margin_left + 280, vertical_position, str(detalhe_servico))
                c.drawString(margin_left + 500, vertical_position, str(cobrancas_pipefy[registro_cobranca].get_status_display()))
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
        cobrancas = Cobrancas.objects.filter(caixa=id, status='s', data_pagamento__gte=data_referencia)
        pagamentos = Pagamentos.objects.filter(caixa=id, status='s', data_pagamento__gte=data_referencia)
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

def create_pdf_contrato(request, uuid):
    #CRIA ARQUIVO PDF DO ALONGAMENTO
    left_margin = 60
    right_margin = 45
    top_margin = 40
    bottom_margin = 30
    font_size_title = 11
    font_size_body = 10
    custom_color = Color(13/255, 22/255, 55/255)
    #color_danger = Color(255/255, 0/255, 0/255)

    fases_pagamento = {
        "Assinatura Contrato": "na assinatura do contrato", 
        "P": "no protocolo do processo",
        "E": "no encerramento do processo"
    }

    texto_contrato_produto = {
        "GAI": {"produto_text": f"""Gestão Ambiental e Irrigação:  Análise estratégica, elaboração de projetos técnicos e gerenciamento de processos,
                    no âmbito da administração pública para obtenção de instrumentos administrativos obrigatórios para empreendimentos agroindustriais.""",
            "projeto_text": f"""Elaboração de Projeto Técnico para solicitar os seguintes atos administrativos junto ao órgão ambiental competente:"""},
        
        "GC": {"produto_text": f"""Gestão de Crédito Rural: Análise estratégica, elaboração de projetos técnicos e gerenciamento de processos junto às 
               instituições financeiras para obtenção de linhas de crédito e financiamento rural essenciais para empreendimentos agropecuários.""",
            "projeto_text": f"""Elaboração de Projetos Técnicos para solicitar as seguintes linhas de crédito e financiamento junto às instituições financeiras competentes:"""},

        "TEC": {"produto_text": f"""Tecnologia e Inovação: Desenvolvimento de soluções tecnológicas e análise de dados para o setor agropecuário, focado na criação de 
            ferramentas inovadoras que otimizem a produtividade e a eficiência dos empreendimentos.""",
            "projeto_text": """Desenvolvimento e implementação das seguintes soluções tecnológicas inovadoras no setor agropecuário:"""},

        "AVA": {"produto_text": f"""Análise de Imóveis Rurais e Urbanos: Avaliação estratégica e detalhada de propriedades rurais e urbanas, incluindo aspectos legais, 
            ambientais e de viabilidade econômica, para auxiliar na tomada de decisões informadas sobre investimentos e uso do solo.""",
            "projeto_text": """Elaboração de Projeto Técnico para a avaliação detalhada e estratégica dos seguintes serviços:"""}
    }
    
    try:
        contrato = Contratos_Ambiental.objects.get(uuid=uuid)
        numero_contrato = contrato.id
        natureza = contrato.contratante.natureza
        cpf_ou_cnpj_str = 'CPF' if natureza == 'PF' else 'CNPJ'
        cpf_cnpj = contrato.contratante.cpf_cnpj
        contratante = contrato.contratante.razao_social
        natureza_juridica = 'pessoa jurídica' if natureza == 'PJ' else 'pessoa física'
        artigo_contratante = 'A' if contrato.contratante.natureza == 'PJ' else ('A' if contratante.split()[-1].endswith('a') else 'O')
        servicos_contrato = contrato.servicos.all()
        formas_pagamento = Contratos_Ambiental_Pagamentos.objects.filter(contrato=contrato.id)
        produto_contrato = [s['produto__acronym'] for s in contrato.servicos.all().values('produto__acronym').distinct()][0]

        # if natureza == "PJ":
        #     demais_beneficiarios = contrato.demais_membros.all()
        #     for membro in demais_beneficiarios:
        #         if membro.natureza == 'PF':
        #             representante_pj = membro.razao_social
        #             cpf_representante = membro.cpf_cnpj
        #             rg_representante = membro.numero_rg
        #             endereco_representante = membro.endereco
        #             municipio_representante = membro.municipio
        #             uf_representante = membro.uf
        #             cep_representante = membro.cep
        #             partes_endereco_representante = [
        #                 endereco_representante,
        #                 f"{municipio_representante} - {uf_representante}" if municipio_representante and uf_representante else municipio_representante or uf_representante,
        #                 f"CEP {cep_representante}" if cep_representante else ''
        #             ]
        #             endereco_completo_representante = ', '.join(filter(None, partes_endereco_representante))
        #             artigo_representante = 'A' if membro.natureza == 'PJ' else ('A' if membro.razao_social.split()[-1].endswith('a') else 'O')
        #             break

        endereco = contrato.contratante.logradouro or None
        municipio = contrato.contratante.municipio or None
        uf = contrato.contratante.municipio.sigla_uf or None
        cep = contrato.contratante.cep_logradouro or None

        partes_endereco = [
            endereco,
            f"{municipio} - {uf}" if municipio and uf else municipio or uf,
            f"CEP {cep}" if cep else ''
        ]

        endereco_completo = ', '.join(filter(None, partes_endereco))

        valor_contrato_ = contrato.valor or 0
        valor_contrato = locale.format_string('%.2f', valor_contrato_, True) 
        valor_contrato_str = num2words(valor_contrato_, lang='pt_BR', to='currency')
        percentual_contrato_gc = None
        data_contrato = contrato.data_assinatura
        dia_mes = data_contrato.day
        mes_str = data_contrato.strftime("%B")
        ano = data_contrato.year

        buffer = BytesIO()
        doc = BaseDocTemplate(buffer, pagesize=letter, title=f"Contrato Serviço: {contratante}")

        # Crie um PageTemplate com as margens especificadas
        page_template = PageTemplate(id='custom_page', frames=[
            Frame(
                x1=left_margin, y1=bottom_margin,
                width=letter[0] - left_margin - right_margin,
                height=letter[1] - bottom_margin - top_margin,
                leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
                id='custom_frame'
            )
        ])

        doc.addPageTemplates([page_template])
        elements = []

        # Adicione a imagem ao início do documento
        image_path = "static/media/various/logo-frasson-app2.png"
        logo = Image(image_path, width=150, height=40) 
        elements.append(logo)
        elements.append(Spacer(width=1, height=15))

        # Define um estilo personalizado para o título com tamanho de fonte
        elements.append(Paragraph("<b>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</b>", ParagraphStyle(name='TitleStyle', fontSize=font_size_title, alignment=1, spaceAfter=3, textColor=custom_color)))
        elements.append(Paragraph(f"<b>N° {numero_contrato}</b>", ParagraphStyle(name='TitleStyle', fontSize=font_size_title, leftIndent=0, alignment=1, spaceAfter=15, textColor=custom_color)))

        contratante_str = f"""<b>CONTRATANTE:</b> <b>{contratante}</b>, inscrit{artigo_contratante.lower()} no {cpf_ou_cnpj_str} {cpf_cnpj}, com sede no endereço {endereco_completo}"""

        if natureza == "PJ":
            contratante_str = f"""{contratante_str}, residente no endereço {endereco_completo}."""
        else:
            contratante_str = f"""{contratante_str}."""
        
        elements.append(Paragraph(contratante_str, 
        ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=10, textColor=custom_color)))
        
        elements.append(Paragraph(f"""<b>CONTRATADA: FRASSON PLANEJAMENTO E ASSISTÊNCIA AGROPECUÁRIA LTDA</b>, inscrita no CNPJ 01.396.641/0001-70, com sede na Rua Alvorada, nº 237, 
            Quadra 28, Lote 10B, Salas 202 e 204, Setor Central, Posse - GO, CEP 73900-562, neste ato representado pelo seu sócio/proprietário, o sr. <b>Daniel Zuchetti Frasson</b>, brasileiro, solteiro, Engenheiro Agrônomo, 
            inscrito no CPF 030.665.050-90, CREA 1016346662D-GO, residente e domiciliado na Rua José Ribeiro e Silva n° 206, Setor Augusto José Valente II, Posse-GO, CEP 73902-015."""
        , ParagraphStyle(name='TitleStyle', fontSize=font_size_body, alignment=TA_JUSTIFY, leading=15, spaceAfter=15, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>DA DESCRIÇÃO</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>Cláusula 1ª.</b> A <b>CONTRATADA</b> é a pessoa jurídica que viabiliza, por meio de formulários, instrumentos administrativos e outros instrumentos legais, junto às instituições competentes estaduais, 
            levantamento das informações necessárias e execução dos procedimentos administrativos necessários para requisição atos administrativos."""
        , ParagraphStyle(name='TitleStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))
        
        elements.append(Paragraph(f"""<b>Cláusula 2ª.</b> {artigo_contratante} <b>CONTRATANTE</b> é a {natureza_juridica} possuidora de propriedades rurais, que necessitam dos atos administrativos ambientais para desenvolvimento de empreendimentos agropecuários."""
        , ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=20, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>DO OBJETO</b>""", ParagraphStyle(name='DetailStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>Cláusula 3ª.</b> {texto_contrato_produto[produto_contrato]["produto_text"]}"""
        , ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))
        
        elements.append(Paragraph(f"""<b>Parágrafo Primeiro:</b> {texto_contrato_produto[produto_contrato]["projeto_text"]}"""
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=5, textColor=custom_color)))

        for i, servico in enumerate(servicos_contrato):
            elements.append(Paragraph(f"""<b>{chr(ord('a') + i)})</b> {servico.detalhamento_servico};"""
            ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=20, alignment=TA_JUSTIFY, leading=15, spaceAfter=0, textColor=custom_color)))

        elements.append(Spacer(width=1, height=15))

        #ADD A NEW PAGE
        #elements.append(PageBreak()) #adiciona uma nova página
        elements.append(Paragraph(f"""<b>DAS OBRIGAÇÕES DAS PARTES</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))
        elements.append(Paragraph(f"""<b>D{artigo_contratante} CONTRATANTE</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))
        
        elements.append(Paragraph(f"""<b>Cláusula 4ª.</b> {artigo_contratante} <b>CONTRATANTE</b> se responsabiliza pela veracidade de todos os documentos, dados e informações prestadas para o preenchimento dos respectivos requerimentos, sob pena de responderem na forma da lei por falsidade ideológica ou documental, 
            não podendo recair sobre a <b>CONTRATADA</b> nenhuma obrigação pela inconsistência de tais informações e dados."""
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>Cláusula 5ª.</b> {artigo_contratante} <b>CONTRATANTE</b> se compromete a fornecer todo e qualquer documento para a confecção dos requerimentos e formulários necessários ao procedimento de requisição dos serviços previstos neste contrato."""
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>Cláusula 6ª.</b> {artigo_contratante} <b>CONTRATANTE</b> se obriga a permitir visita ao empreendimento, com o fito de verificar as condições de viabilidade dos procedimentos administrativos que serão requisitados, bem como da realização de qualquer serviço técnico de campo necessário. """
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>Cláusula 7ª.</b> {artigo_contratante} <b>CONTRATANTE</b> autoriza a <b>CONTRATADA</b> a obter informações junto às instituições competentes, que sejam necessárias para complementar a documentação requerida no processo."""
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>Cláusula 8ª.</b> Todas as despesas relacionadas às taxas administrativas para protocolo e andamento dos processos ambientais relacionados a essa proposta são de responsabilidade d{artigo_contratante.lower()} <b>CONTRATANTE</b>."""
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>DA CONTRATADA</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>Cláusula 9ª.</b> A <b>CONTRATADA</b> se compromete a efetuar amplo levantamento de dados necessários para o preenchimento dos formulários para elaboração dos projetos e demais instrumentos legais necessários."""
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>Parágrafo Primeiro:</b> A <b>CONTRATADA</b> se compromete a acompanhar todo o processo administrativo, em todas as instâncias necessárias até a emissão da portaria autorizativa final, comprometendo-se a 
            responder e orientar todas as eventuais notificações e questionamentos técnicos emitidas pelos órgãos ambientais durante o trâmite dos objetos do presente contrato."""
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>Parágrafo Segundo:</b> Todos os equipamentos necessários para elaboração dos projetos e todos os custos relativos aos deslocamentos são de responsabilidade da <b>CONTRATADA</b>."""
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>Parágrafo Terceiro:</b> Toda a equipe envolvida nos serviços é de responsabilidade da <b>CONTRATADA</b>, não gerando qualquer vínculo empregatício com {artigo_contratante.lower()} <b>CONTRATANTE</b>."""
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>Parágrafo Quarto:</b> A <b>CONTRATADA</b> se compromete a manter absoluto sigilo sobre todos os dados, informações científicas, técnicas e materiais obtidos durante sua participação, seja de forma escrita, verbal ou qualquer outra. 
            É proibido revelar, reproduzir, utilizar ou compartilhar essas informações com terceiros sem a análise prévia d{artigo_contratante.lower()} <b>CONTRATANTE</b> para avaliação da possibilidade de proteção nos órgãos especializados. 
            A <b>CONTRATADA</b> não deve, sem autorização d{artigo_contratante.lower()} <b>CONTRATANTE</b>, tomar qualquer medida para obter direitos de propriedade intelectual para si ou terceiros relacionados às informações confidenciais acessadas. 
            Todos os documentos e materiais, incluindo modelos e protótipos resultantes das pesquisas, são de propriedade exclusiva d{artigo_contratante.lower()} <b>CONTRATANTE</b>."""
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

        #elements.append(PageBreak()) #adiciona uma nova página
        elements.append(Paragraph(f"""<b>DO VALOR</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))

        if produto_contrato == "GC": #se o produto for GC deve ser feita de uma forma diferente
            elements.append(Paragraph(f"""<b>Cláusula 10ª.</b> {artigo_contratante} <b>CONTRATANTE</b> pagará à <b>CONTRATADA</b> o percentual de <b>{percentual_contrato_gc}%</b> sobre as operações de crédito liberadas, 
                a serem pagos de forma integral na ocasião da <b>liberação do recurso</b>, mediante emissão de Nota Fiscal."""
            ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=5, textColor=custom_color)))

        else:
            elements.append(Paragraph(f"""<b>Cláusula 10ª.</b> {artigo_contratante} <b>CONTRATANTE</b> pagará à <b>CONTRATADA</b> o valor total de <b>R$ {valor_contrato}</b> ({valor_contrato_str}) a serem pagos da seguinte forma, mediante emissão de Nota Fiscal:"""
            ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=5, textColor=custom_color)))

            for i, pagamento in enumerate(formas_pagamento):
                elements.append(Paragraph(f"""<b>{chr(ord('a') + i)})</b> {locale.format_string('%.0f', pagamento.percentual, True)}% (R$ {locale.format_string('%.2f', pagamento.valor, True)}) no(a) {pagamento.etapa};"""
                ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=20, alignment=TA_JUSTIFY, leading=15, spaceAfter=0, textColor=custom_color)))
            
        
        elements.append(Spacer(width=1, height=10))

        elements.append(Paragraph(f"""<b>Parágrafo Primeiro:</b> O pagamento será realizado por meio de depósito bancário identificado, na conta bancária:"""
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=5, textColor=custom_color)))
        
        elements.append(Paragraph(f"""
            Banco: <b>Banco do Brasil</b> <br/>
            Agência: <b>0606-8</b> <br/>
            Conta Corrente: <b>11.180-5</b> <br/>
            Titularidade: <b>Frasson Planejamento e Assistência Agropecuária LTDA</b> <br/>
            CNPJ: <b>01.396.641/0001-70</b> <br/>
            """
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=15, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>DAS PENALIDADES</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>Cláusula 11ª.</b> Sem prejuízo de outras medidas, a <b>CONTRATADA</b> poderá, a seu critério e a qualquer tempo, advertir, suspender ou cancelar, temporária ou definitivamente, o contrato com {artigo_contratante} <b>CONTRATANTE</b> que:"""
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=5, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>a)</b> Deixe de cumprir qualquer dispositivo deste instrumento;<br/>
            <b>b)</b>	Deixe de respeitar qualquer item de qualquer política da <b>CONTRATADA</b> e/ou da instituição financeira;<br/>
            <b>c)</b>	Pratique atos fraudulentos ou ofensivos a quem quer que seja;<br/>
            <b>d)</b>	Preste informações inverídicas;<br/>
            <b>e)</b>	Deixe de efetuar qualquer pagamento no valor acertado;<br/>"""
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=15, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>DA VALIDADE</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>Cláusula 12ª.</b> O presente contrato será válido durante todo o período de tramitação dos processos administrativos relacionados, a partir da data de sua assinatura até 
            a decisão final oficializada pelo órgão ambiental competente."""
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=12, textColor=custom_color)))


        elements.append(Paragraph(f"""<b>DO FORO</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=5, textColor=custom_color)))

        elements.append(Paragraph(f"""<b>Cláusula 13ª.</b> Fica eleito o Foro da Circunscrição Judiciária de Posse, Estado de Goiás, para dirimir as dúvidas oriundas deste contrato, renunciando as partes, a qualquer outro, por mais privilegiado que seja. E por estarem justos e contratados, 
            firmam o presente instrumento, em duas vias, de igual teor e forma, para um só efeito, na presença das duas testemunhas abaixo assinadas."""
        ,ParagraphStyle(name='DetailStyle', fontSize=font_size_body, leftIndent=0, alignment=TA_JUSTIFY, leading=15, spaceAfter=10, textColor=custom_color)))

        elements.append(Paragraph(f"""Posse - GO, {dia_mes} de {mes_str} de {ano}.""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=TA_RIGHT, spaceAfter=35, textColor=custom_color)))

        elements.append(Paragraph(f"""________________________________________________________________""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=1, textColor=custom_color)))
        elements.append(Paragraph(f"""<b>FRASSON PLANEJAMENTO E ASSISTÊNCIA AGROPECUÁRIA LTDA</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=1, textColor=custom_color)))
        elements.append(Paragraph(f"""<b>01.396.641/0001-70</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=30, textColor=custom_color)))

        elements.append(Paragraph(f"""_________________________________________________________""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=1, textColor=custom_color)))
        elements.append(Paragraph(f"""<b>{contratante}</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=1, textColor=custom_color)))
        elements.append(Paragraph(f"""<b>{cpf_cnpj}</b>""", ParagraphStyle(name='TitleStyle',  fontSize=font_size_body, alignment=1, spaceAfter=30, textColor=custom_color)))

        #Create a table to place two elements side by side
        table_data = [
            [Paragraph(f"________________________________________<br/>Testemunha 01<br/>CPF: ", ParagraphStyle(name='DetailStyle', fontSize=font_size_body, alignment=1, spaceAfter=1, textColor=custom_color)),
            Paragraph(f"________________________________________<br/>Testemunha 02<br/>CPF: ", ParagraphStyle(name='DetailStyle', fontSize=font_size_body, alignment=1, spaceAfter=1, textColor=custom_color))]
        ]

        table = Table(table_data, colWidths=[300, 300])
        elements.append(table)

        # Cria o documento PDF
        doc.build(elements)

        # Obtém o conteúdo do PDF e fecha o buffer
        pdf = buffer.getvalue()
        buffer.close()

        # Retorna o PDF como uma resposta HTTP
        file_name = f"GAI_{numero_contrato}_{contratante}"
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{file_name}.pdf"'
        response.write(pdf)
        return response

    except ObjectDoesNotExist:
        return HttpResponse(404)