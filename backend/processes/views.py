from django.shortcuts import render
from rest_framework import permissions, viewsets, status
from rest_framework.permissions import IsAuthenticated
import requests, json
from rest_framework.response import Response
from django.db.models import Q
from .models import Processos_Andamento, Acompanhamento_Processos, Status_Acompanhamento
from pipefy.models import Card_Produtos
from .serializers import detailFollowup, detailAcompanhamentoProcessos, listStatus
from rest_framework.parsers import MultiPartParser, FormParser
from datetime import date

class FollowupView(viewsets.ModelViewSet):
    queryset = Processos_Andamento.objects.all()
    serializer_class = detailFollowup
    lookup_field = 'processo_id'
    def list(self, request, *args, **kwargs):
        processos = []
        produto_gai = 864795466
        card_type = "Principal"
        phases_produtos = [310429178, 310429179, 310429196]
        search = request.GET.get('search')

        if search: # se existe algum parâmetro de busca, faz a busca
            query_search_andamento = (Q(requerimento=search) | Q(numero_processo=search) | Q(processo_sei=search))
            processo_andamento = Processos_Andamento.objects.filter(query_search_andamento).first()
            if processo_andamento:
                last_status_obj = Acompanhamento_Processos.objects.filter(processo=processo_andamento).order_by('-data', '-created_at').first() or None          
                if last_status_obj != None:
                    data_hoje = date.today()
                    proxima_consulta = last_status_obj.proxima_consulta
                    if proxima_consulta > data_hoje:
                        needed_action = False
                        needed_action_text = "Acompanhamento OK"
                        needed_action_icon = "CheckCircleFill"
                        needed_action_color = "success"
                    else:
                        needed_action = True
                        needed_action_text = "Atualização Necessária"
                        needed_action_icon = "Clock"
                        needed_action_color = "warning"

                else:
                    needed_action = True
                    needed_action_text = "Sem Registro de Status"
                    needed_action_icon = "ExclamationTriangleFill"
                    needed_action_color = "warning"
                
                processos.append({
                    'id': processo_andamento.processo.id,
                    'beneficiario': ', '.join([beneficiario.razao_social for beneficiario in processo_andamento.processo.beneficiario.all()]),
                    'detalhamento': processo_andamento.processo.detalhamento.detalhamento_servico,
                    'instituicao': processo_andamento.processo.instituicao.instituicao.abreviatura,
                    'last_status': last_status_obj.status.description if last_status_obj != None else '-',
                    'needed_action': needed_action,
                    'needed_action_text': needed_action_text,
                    'needed_action_icon': needed_action_icon,
                    'needed_action_color': needed_action_color,
                    'current_phase': processo_andamento.processo.phase_name
                })
            
            else:
                query_search = Q(detalhamento__produto=produto_gai) & Q(card=card_type) & (Q(id__icontains=search) | Q(phase_name__icontains=search) | 
                    Q(beneficiario__razao_social__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search) | Q(instituicao__instituicao__razao_social__icontains=search))
                database_processos = Card_Produtos.objects.filter(query_search).exclude(phase_id__in=[310429136, 310429228])
                
                for processo in database_processos:
                    processo_acompanhamento = Processos_Andamento.objects.filter(processo=processo.id).first() or None
                    last_status_obj = Acompanhamento_Processos.objects.filter(processo__processo=processo.id).order_by('-data', '-created_at').first() or None

                    if processo_acompanhamento != None:

                        if last_status_obj != None:
                            data_hoje = date.today()
                            proxima_consulta = last_status_obj.proxima_consulta
                            if proxima_consulta > data_hoje:
                                needed_action = False
                                needed_action_text = "Acompanhamento OK"
                                needed_action_icon = "CheckCircleFill"
                                needed_action_color = "success"
                            else:
                                needed_action = True
                                needed_action_text = "Atualização Necessária"
                                needed_action_icon = "Clock"
                                needed_action_color = "warning"

                        else:
                            needed_action = True
                            needed_action_text = "Sem Registro de Status"
                            needed_action_icon = "ExclamationTriangleFill"
                            needed_action_color = "warning"

                    else:
                        needed_action = True
                        needed_action_text = "Sem Processo de Acompanhamento"
                        needed_action_icon = "ExclamationCircleFill"
                        needed_action_color = "danger"
                    
                    processos.append({
                        'id': processo.id,
                        'beneficiario': ', '.join([beneficiario.razao_social for beneficiario in processo.beneficiario.all()]),
                        'detalhamento': processo.detalhamento.detalhamento_servico,
                        'instituicao': processo.instituicao.instituicao.abreviatura,
                        'last_status': last_status_obj.status.description if last_status_obj != None else '-',
                        'needed_action': needed_action,
                        'needed_action_text': needed_action_text,
                        'needed_action_icon': needed_action_icon,
                        'needed_action_color': needed_action_color,
                        'current_phase': processo.phase_name
                    })
        
        else:      # caso não exista parâmetro de busca
            query_search = Q(detalhamento__produto=produto_gai) & Q(card=card_type) & Q(phase_id__in=phases_produtos)
            database_processos = Card_Produtos.objects.filter(query_search)

            for processo in database_processos:
                processo_acompanhamento = Processos_Andamento.objects.filter(processo=processo.id).first() or None
                last_status_obj = Acompanhamento_Processos.objects.filter(processo__processo=processo.id).order_by('-data', '-created_at').first() or None
                if processo_acompanhamento != None:
                    if last_status_obj != None:
                        data_hoje = date.today()
                        proxima_consulta = last_status_obj.proxima_consulta
                        if proxima_consulta > data_hoje:
                            needed_action = False
                            needed_action_text = "Acompanhamento OK"
                            needed_action_icon = "bi CheckCircleFill"
                            needed_action_color = "success"
                        else:
                            needed_action = True
                            needed_action_text = "Atualização Necessária"
                            needed_action_icon = "Clock"
                            needed_action_color = "warning"

                    else:
                        needed_action = True
                        needed_action_text = "Sem Registro de Status"
                        needed_action_icon = "ExclamationTriangleFill"
                        needed_action_color = "warning"

                else:
                    needed_action = True
                    needed_action_text = "Sem Processo de Acompanhamento"
                    needed_action_icon = "ExclamationCircleFill"
                    needed_action_color = "danger"
                
                processos.append({
                    'id': processo.id,
                    'beneficiario': ', '.join([beneficiario.razao_social for beneficiario in processo.beneficiario.all()]),
                    'detalhamento': processo.detalhamento.detalhamento_servico,
                    'instituicao': processo.instituicao.instituicao.abreviatura,
                    'last_status': last_status_obj.status.description if last_status_obj != None else '-',
                    'needed_action': needed_action,
                    'needed_action_text': needed_action_text,
                    'needed_action_icon': needed_action_icon,
                    'needed_action_color': needed_action_color,
                    'current_phase': processo.phase_name
                })

        return Response(processos)

class AcompanhamentoView(viewsets.ModelViewSet):
    queryset = Acompanhamento_Processos.objects.all()
    serializer_class = detailAcompanhamentoProcessos
    parser_classes = (MultiPartParser, FormParser)

class StatusView(viewsets.ModelViewSet):
    queryset = Status_Acompanhamento.objects.all()
    serializer_class = listStatus