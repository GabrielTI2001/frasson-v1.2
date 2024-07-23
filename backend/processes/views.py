from django.shortcuts import render
from rest_framework import permissions, viewsets, status
from rest_framework.permissions import IsAuthenticated
import locale
from rest_framework.response import Response
from django.db.models import Q
from .models import Processos_Andamento, Acompanhamento_Processos, Status_Acompanhamento
from pipeline.models import Fluxo_Gestao_Ambiental
from .serializers import detailFollowup, detailAcompanhamentoProcessos, listStatus
from rest_framework.parsers import MultiPartParser, FormParser
from datetime import date, datetime
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from users.models import Profile

class FollowupView(viewsets.ModelViewSet):
    queryset = Processos_Andamento.objects.all()
    serializer_class = detailFollowup
    lookup_field = 'pk'
    def list(self, request, *args, **kwargs):
        processos = []
        produto_gai = 2
        card_type = "Principal"
        phases_produtos = [65, 66, 64]
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
                    'beneficiario': processo_andamento.processo.beneficiario.razao_social,
                    'detalhamento': processo_andamento.processo.detalhamento.detalhamento_servico,
                    'instituicao': processo_andamento.processo.instituicao.instituicao.abreviatura,
                    'last_status': last_status_obj.status.description if last_status_obj != None else '-',
                    'needed_action': needed_action,
                    'needed_action_text': needed_action_text,
                    'needed_action_icon': needed_action_icon,
                    'needed_action_color': needed_action_color,
                    'current_phase': processo_andamento.processo.phase.descricao
                })
            
            else:
                query_search = Q(detalhamento__produto=produto_gai) & (Q(id__icontains=search) | Q(phase__descricao__icontains=search) | 
                    Q(beneficiario__razao_social__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search) | Q(instituicao__instituicao__razao_social__icontains=search))
                database_processos = Fluxo_Gestao_Ambiental.objects.filter(query_search).exclude(phase_id__in=[1, 2])
                
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
                        'beneficiario': processo.beneficiario.razao_social,
                        'detalhamento': processo.detalhamento.detalhamento_servico,
                        'instituicao': processo.instituicao.instituicao.abreviatura,
                        'last_status': last_status_obj.status.description if last_status_obj != None else '-',
                        'needed_action': needed_action,
                        'needed_action_text': needed_action_text,
                        'needed_action_icon': needed_action_icon,
                        'needed_action_color': needed_action_color,
                        'current_phase': processo.phase.descricao
                    })
        
        else:      # caso não exista parâmetro de busca
            query_search = Q(detalhamento__produto=produto_gai) & Q(phase_id__in=phases_produtos)
            database_processos = Fluxo_Gestao_Ambiental.objects.filter(query_search)

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
                    'beneficiario': processo.beneficiario.razao_social,
                    'detalhamento': processo.detalhamento.detalhamento_servico,
                    'instituicao': processo.instituicao.instituicao.abreviatura,
                    'last_status': last_status_obj.status.description if last_status_obj != None else '-',
                    'needed_action': needed_action,
                    'needed_action_text': needed_action_text,
                    'needed_action_icon': needed_action_icon,
                    'needed_action_color': needed_action_color,
                    'current_phase': processo.phase.descricao
                })

        return Response(processos)
    def retrieve(self, request, *args, **kwargs):
        # Obtendo o ID do processo a partir das kwargs
        id = kwargs.get('pk')

        # Tentando obter o objeto Fluxo_Gestao_Ambiental
        processo_pipefy = get_object_or_404(Fluxo_Gestao_Ambiental, pk=id)
        
        # Construindo o dicionário pipefy
        pipefy = {
            'id': processo_pipefy.id,
            'beneficiario': processo_pipefy.beneficiario.razao_social,
            'detalhamento': processo_pipefy.detalhamento.detalhamento_servico,
            'instituicao': processo_pipefy.instituicao.instituicao.razao_social,
            'current_phase': processo_pipefy.phase.descricao,
            'created_at': processo_pipefy.created_at or '-'
        }

        # Tentando obter o objeto Processos_Andamento
        processo_inema = Processos_Andamento.objects.filter(processo_id=id).first()
        if processo_inema:
            proxima_consulta = Acompanhamento_Processos.objects.filter(processo=processo_inema.id).order_by('-data', '-created_at').first()
            acompanhamentos_database = Acompanhamento_Processos.objects.filter(processo_id=processo_inema.id).order_by('-data', '-created_at')
        else:
            proxima_consulta = None
            acompanhamentos_database = []

        data_formacao = processo_inema.data_formacao or None if processo_inema else None
        dias_formado = date.today() - data_formacao if processo_inema and data_formacao else '-'
        num_dias_formado = dias_formado.days if data_formacao is not None else '-'
        data_formacao_str = f"{datetime.strptime(str(data_formacao), '%Y-%m-%d').strftime('%d/%m/%Y')} (há {num_dias_formado}{' dias' if num_dias_formado > 1 else ' dia'})" if data_formacao is not None else '-'

        if processo_inema != None:
            inema = {
                'id': processo_inema.id,
                'requerimento': processo_inema.requerimento,
                'data_requerimento': processo_inema.data_requerimento,
                'data_enquadramento': processo_inema.data_enquadramento,
                'data_validacao': processo_inema.data_validacao,
                'valor_boleto': processo_inema.valor_boleto,
                'vencimento_boleto': processo_inema.vencimento_boleto,
                'data_formacao': processo_inema.data_formacao,
                'processo_inema': processo_inema.numero_processo,
                'processo_sei': processo_inema.processo_sei,
                'proxima_consulta': proxima_consulta.proxima_consulta
            }
        else:
            inema = {}

        acompanhamentos = []
        for acomp in acompanhamentos_database:
            acompanhamentos.append({
                'id': acomp.id,
                'status': acomp.status.description,
                'updated_at': acomp.updated_at,
                'data': acomp.data.strftime("%d/%m/%Y") if acomp.data else '-',
                'file': acomp.file.name if acomp.file else None,
                'user': acomp.user.first_name,
                'user_avatar': Profile.objects.get(user_id=acomp.user.id).avatar.name,
                'description': acomp.detalhamento
            })
        
        response_data = {
            'pipefy': pipefy, 
            'inema': inema, 
            'acompanhamentos': acompanhamentos
        }

        return Response(response_data)
class AcompanhamentoView(viewsets.ModelViewSet):
    queryset = Acompanhamento_Processos.objects.all()
    serializer_class = detailAcompanhamentoProcessos
    parser_classes = (MultiPartParser, FormParser)

class StatusView(viewsets.ModelViewSet):
    queryset = Status_Acompanhamento.objects.all()
    serializer_class = listStatus