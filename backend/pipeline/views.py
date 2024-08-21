from rest_framework import permissions, viewsets, status
from django.db.models import Q
from rest_framework.response import Response
from rest_framework.parsers import FormParser, MultiPartParser
from .serializers import *
from .models import Fluxo_Gestao_Ambiental, Fase, Pipe, Card_Comments
from .models import Phases_History, Card_Activities
from .models import Atualizacoes_Acompanhamento_GAI, Acompanhamento_GAI, Status_Acompanhamento
from users.models import User
from datetime import datetime, timedelta, time
from .utils import fields_cardproduto_info, fields_pvtec, fields_cardprospect_info
import os
from django.db.models import Q
import operator
from functools import reduce
from django.shortcuts import get_object_or_404

class MultipleFieldLookupMixin(object):
    def get_object(self):
        queryset = self.get_queryset()
        queryset = self.filter_queryset(queryset)  
        filter = {}
        for field in self.lookup_fields:
            filter[field] = self.kwargs[field]
        q = reduce(operator.or_, (Q(x) for x in filter.items()))
        return get_object_or_404(queryset, q)

class PipeView(viewsets.ModelViewSet):
    lookup_field = 'code'
    queryset = Pipe.objects.all()
    serializer_class = serializerPipe
    permission_classes = [permissions.AllowAny]
    def get_serializer_class(self):
        if self.action == 'list':
            return serializerPipe
        else:
            return self.serializer_class
        
class PipeDataView(viewsets.ModelViewSet):
    lookup_field = 'code'
    queryset = Pipe.objects.all()
    serializer_class = listPipe
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.query_params.get('user', None)   
        if user:
            if User.objects.get(pk=int(user)).is_superuser:
                pass
            else:
                queryset = queryset.filter(Q(pessoas__id=int(user)))
        return queryset

class FasesView(viewsets.ModelViewSet):
    queryset = Fase.objects.all()
    serializer_class = listFase
    def get_queryset(self):
        queryset = super().get_queryset()
        pipe = self.request.query_params.get('pipe', None)   
        if pipe:
            queryset = queryset.filter(Q(pipe__code=int(pipe)))
        return queryset

class FluxoProspectsView(viewsets.ModelViewSet):
    queryset = Fluxo_Prospects.objects.all()
    serializer_class = serializerFluxoProspects
    permission_classes = [permissions.AllowAny]
    lookup_field = 'code'
    def get_serializer_class(self):
        if self.action == 'list':
            return listFluxoAmbiental
        else:
            return self.serializer_class
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        phase_atual = request.data['phase'] if 'phase' in request.data else None
        user = request.data['user'] if 'user' in request.data else None
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            if phase_atual:
                historico_fase_anterior = Phases_History.objects.filter(phase=instance.phase, fluxo_prospect_id=instance.pk)
                if historico_fase_anterior.exists():
                    historico_fase_anterior.update(**{'last_time_out':datetime.now(), 'moved_by_id':user})
                else:
                    historico_fase_anterior = Phases_History.objects.create(last_time_out=datetime.now(), phase=instance.phase, fluxo_prospect_id=instance.pk, moved_by_id=user)
                
                historico_fase_atual = Phases_History.objects.filter(phase_id=phase_atual, fluxo_prospect_id=instance.pk)
                if historico_fase_atual.exists():
                    historico_fase_atual.update(**{'last_time_in':datetime.now(), 'last_time_out':None, 'moved_by_id':user})
                    historico_fase_atual = historico_fase_atual.first()
                else:
                    historico_fase_atual = Phases_History.objects.create(first_time_in=datetime.now(), last_time_out=None, phase_id=phase_atual, 
                        fluxo_prospect_id=instance.pk, moved_by_id=user)
                
                responsaveis = [r.id for r in historico_fase_atual.phase.responsaveis.all()]
                if len(responsaveis) > 0:
                    instance.responsaveis.set(responsaveis)
                if historico_fase_atual.phase.dias_prazo:
                    data_vencimento = datetime.now().date() + timedelta(days=historico_fase_atual.phase.dias_prazo)
                    data_e_hora_vencimento = datetime.combine(data_vencimento, time(18, 0))
                    instance.data_vencimento = data_e_hora_vencimento
                text = 'de '+instance.phase.descricao+' para '+historico_fase_atual.phase.descricao
                Card_Activities.objects.create(fluxo_prospect_id=instance.pk, type='cf', campo=text, updated_by_id=user)
                instance.save()
            activity = None
            for key in fields_cardprospect_info.keys():
                if key in request.data:
                    activity = Card_Activities.objects.create(fluxo_prospect_id=instance.pk, type='ch', campo=fields_cardproduto_info[key], 
                        updated_by_id=user)
            serializer.save()
            headers = self.get_success_headers(serializer.data)
            response_data = serializer.data.copy()
            if activity:
                activity_serializer = serializerActivities(activity)
                response_data.update({'activity':activity_serializer.data if activity else None})
            return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FluxoAmbientalView(viewsets.ModelViewSet):
    queryset = Fluxo_Gestao_Ambiental.objects.all()
    serializer_class = serializerFluxoAmbiental
    permission_classes = [permissions.AllowAny]
    lookup_field = 'code'
    def get_serializer_class(self):
        if self.action == 'list':
            return listFluxoAmbiental
        else:
            return self.serializer_class
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        phase_atual = request.data['phase'] if 'phase' in request.data else None
        user = request.data['user'] if 'user' in request.data else None
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            if phase_atual:
                historico_fase_anterior = Phases_History.objects.filter(phase=instance.phase, fluxo_ambiental_id=instance.pk)
                if historico_fase_anterior.exists():
                    historico_fase_anterior.update(**{'last_time_out':datetime.now(), 'moved_by_id':user})
                else:
                    historico_fase_anterior = Phases_History.objects.create(last_time_out=datetime.now(), phase=instance.phase, fluxo_ambiental_id=instance.pk, moved_by_id=user)
                
                historico_fase_atual = Phases_History.objects.filter(phase_id=phase_atual, fluxo_ambiental_id=instance.pk)
                if historico_fase_atual.exists():
                    historico_fase_atual.update(**{'last_time_in':datetime.now(), 'last_time_out':None, 'moved_by_id':user})
                    historico_fase_atual = historico_fase_atual.first()
                else:
                    historico_fase_atual = Phases_History.objects.create(first_time_in=datetime.now(), last_time_out=None, phase_id=phase_atual, 
                        fluxo_ambiental_id=instance.pk, moved_by_id=user)
                
                responsaveis = [r.id for r in historico_fase_atual.phase.responsaveis.all()]
                if len(responsaveis ) > 0:
                    instance.responsaveis.set(responsaveis)
                if historico_fase_atual.phase.dias_prazo:
                    data_vencimento = datetime.now().date() + timedelta(days=historico_fase_atual.phase.dias_prazo)
                    data_e_hora_vencimento = datetime.combine(data_vencimento, time(18, 0))
                    instance.data_vencimento = data_e_hora_vencimento
                text = 'de '+instance.phase.descricao+' para '+historico_fase_atual.phase.descricao
                Card_Activities.objects.create(fluxo_ambiental_id=instance.pk, type='cf', campo=text, updated_by_id=user)
                instance.save()
            activity = None
            for key in fields_cardproduto_info.keys():
                if key in request.data:
                    activity = Card_Activities.objects.create(fluxo_ambiental_id=instance.pk, type='ch', campo=fields_cardproduto_info[key], 
                        updated_by_id=user)
            serializer.save()
            headers = self.get_success_headers(serializer.data)
            response_data = serializer.data.copy()
            if activity:
                activity_serializer = serializerActivities(activity)
                response_data.update({'activity':activity_serializer.data if activity else None})
            return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommentView(viewsets.ModelViewSet):
    queryset = Card_Comments.objects.all().order_by('-created_at')
    serializer_class = serializerComments
    def get_queryset(self):
        queryset = super().get_queryset()
        fluxogai = self.request.query_params.get('fluxogai', None)   
        pvtec = self.request.query_params.get('pvtec', None)   
        prospect = self.request.query_params.get('prospect', None) 
        pagamento = self.request.query_params.get('pagamento', None)
        cobranca = self.request.query_params.get('cobranca', None)
        if fluxogai:
            queryset = queryset.filter(Q(fluxo_ambiental_id=int(fluxogai)))
        elif prospect:
            queryset = queryset.filter(Q(fluxo_prospect_id=int(prospect)))
        elif pvtec:
            queryset = queryset.filter(Q(pvtec_id=int(pvtec)))
        elif pagamento:
            queryset = queryset.filter(Q(pagamento_id=int(pagamento)))
        if cobranca:
            queryset = queryset.filter(Q(cobranca_id=int(cobranca)))
        return queryset

class ActivityView(viewsets.ModelViewSet):
    queryset = Card_Activities.objects.all().order_by('-created_at')
    serializer_class = serializerActivities
    def get_queryset(self):
        queryset = super().get_queryset()
        fluxogai = self.request.query_params.get('fluxogai', None)   
        pvtec = self.request.query_params.get('pvtec', None)   
        prospect = self.request.query_params.get('prospect', None) 
        if fluxogai:
            queryset = queryset.filter(Q(fluxo_ambiental_id=int(fluxogai)))
        if prospect:
            queryset = queryset.filter(Q(fluxo_prospect_id=int(prospect)))
        if pvtec:
            queryset = queryset.filter(Q(pvtec_id=int(pvtec)))
        return queryset

class AnexoView(viewsets.ModelViewSet):
    queryset = Card_Anexos.objects.all().order_by('-created_at')
    serializer_class = serializerAnexos
    def get_queryset(self):
        queryset = super().get_queryset()
        fluxogai = self.request.query_params.get('fluxogai', None)   
        prospect = self.request.query_params.get('prospect', None)   
        pvtec = self.request.query_params.get('pvtec', None)  
        is_response = self.request.query_params.get('isresponse', None)  
        if fluxogai:
            queryset = queryset.filter(Q(fluxo_ambiental_id=int(fluxogai)))
        if prospect:
            queryset = queryset.filter(Q(fluxo_prospect_id=int(prospect)))
        if pvtec:
            if is_response:
                queryset = queryset.filter(Q(pvtec_id=int(pvtec)) & Q(pvtec_response=True))
            else:
                queryset = queryset.filter(Q(pvtec_id=int(pvtec)) & Q(pvtec_response=False))
        return queryset
    def create(self, request, *args, **kwargs):
        response_data = []
        serializer = self.get_serializer(data=request.data)
        files = request.FILES.getlist('file')
        if serializer.is_valid():
            for i in files:
                reg = Card_Anexos.objects.create(
                    pvtec_id=request.data.get('pvtec') if request.data.get('pvtec') else None, 
                    fluxo_ambiental_id=request.data.get('fluxo_ambiental') if request.data.get('fluxo_ambiental') else None, 
                    uploaded_by_id=request.data.get('uploaded_by'), 
                    pvtec_response=True if request.data.get('pvtec_response') else False, 
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
        
class PVTECView(viewsets.ModelViewSet):
    queryset = PVTEC.objects.all().order_by('-created_at')
    serializer_class = detailPVTEC
    parser_classes = (MultiPartParser, FormParser)
    lookup_field = 'uuid'
    def get_queryset(self):
        queryset = super().get_queryset()
        fluxogai = self.request.query_params.get('fluxogai', None)   
        search_term = self.request.query_params.get('search', None) 
        responsavel = self.request.query_params.get('resp', None)        
        query = Q()
        if fluxogai:
            query &= Q(fluxo_ambiental_id=int(fluxogai))
        if search_term:
            query &= (Q(atividade__icontains=search_term) | Q(orientacoes__icontains=search_term))
        if responsavel:
            query &= Q(responsaveis__in=[int(responsavel)])
        queryset = queryset.filter(query)
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            if self.request.query_params.get('fluxogai', None):
                return detailPVTEC
            if self.request.query_params.get('fluxogc', None):
                return detailPVTEC
            return listPVTEC
        else:
            return self.serializer_class
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        files = request.FILES.getlist('file')
        if serializer.is_valid():
            self.perform_create(serializer)
            if request.FILES:
                for i in files:
                    Card_Anexos.objects.create(pvtec=serializer.instance, uploaded_by=request.user, file=i)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        user = request.data['user'] if 'user' in request.data else None
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            instance.save()
            activity = None
            if 'status' in request.data:
                if request.data['status'] == 'OK':
                    activity = Card_Activities.objects.create(pvtec_id=instance.pk, type='c', campo='a PVTEC', 
                        updated_by_id=user)
                else:
                    activity = Card_Activities.objects.create(pvtec_id=instance.pk, type='ch', campo='Status', 
                        updated_by_id=user)
            for key in fields_pvtec.keys():
                if key in request.data:
                    activity = Card_Activities.objects.create(pvtec_id=instance.pk, type='ch', campo=fields_pvtec[key], 
                        updated_by_id=user)
            serializer.save()
            headers = self.get_success_headers(serializer.data)
            response_data = serializer.data.copy()
            if activity:
                activity_serializer = serializerActivities(activity)
                response_data.update({'activity':activity_serializer.data if activity else None})
            return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class FollowupGAIView(viewsets.ModelViewSet):
    queryset = Acompanhamento_GAI.objects.all()
    serializer_class = detailFollowup
    lookup_field = 'processo_id'
    def list(self, request, *args, **kwargs):
        processos = []
        produto_gai = 864795466
        phases_produtos = [310429178, 310429179, 310429196]
        search = request.GET.get('search')
        fluxogai = request.GET.get('fluxogai')

        if search: # se existe algum parâmetro de busca, faz a busca
            query_search_andamento = (Q(requerimento=search) | Q(numero_processo=search) | Q(processo_sei=search))
            processo_andamento = Acompanhamento_GAI.objects.filter(query_search_andamento).first()
            if processo_andamento:
                last_status_obj = Atualizacoes_Acompanhamento_GAI.objects.filter(processo=processo_andamento).order_by('-data', '-created_at').first() or None          
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
                query_search = Q(detalhamento__produto=produto_gai) & (Q(id__icontains=search) | Q(phase__descricao__icontains=search) | 
                    Q(beneficiario__razao_social__icontains=search) | Q(detalhamento__detalhamento_servico__icontains=search) | Q(instituicao__instituicao__razao_social__icontains=search))
                database_processos = Fluxo_Gestao_Ambiental.objects.filter(query_search).exclude(phase_id__in=[310429136, 310429228])
                
                for processo in database_processos:
                    processo_acompanhamento = Acompanhamento_GAI.objects.filter(processo=processo.id).first() or None
                    last_status_obj = Atualizacoes_Acompanhamento_GAI.objects.filter(processo__processo=processo.id).order_by('-data', '-created_at').first() or None

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
        
        else:      # caso não exista parâmetro de busca
            if fluxogai:
                query_search = Q(pk=fluxogai)
            else:
                query_search = Q(detalhamento__produto=produto_gai) & Q(phase_id__in=phases_produtos)
            database_processos = Fluxo_Gestao_Ambiental.objects.filter(query_search)

            for processo in database_processos:
                processo_acompanhamento = Acompanhamento_GAI.objects.filter(processo=processo.id).first() or None
                last_status_obj = Atualizacoes_Acompanhamento_GAI.objects.filter(processo__processo=processo.id).order_by('-data', '-created_at').first() or None
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

class AtualizacoesGAIView(viewsets.ModelViewSet):
    queryset = Atualizacoes_Acompanhamento_GAI.objects.all()
    serializer_class = detailAcompanhamentoProcessos
    parser_classes = (MultiPartParser, FormParser)

class StatusView(viewsets.ModelViewSet):
    queryset = Status_Acompanhamento.objects.all()
    serializer_class = listStatus