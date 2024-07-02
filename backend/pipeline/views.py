from rest_framework import permissions, viewsets, status
from django.db.models import Q
from rest_framework.response import Response
from .serializers import *
from .models import Fluxo_Gestao_Ambiental, Fase, Pipe, Card_Coments
from .models import Phases_History, Card_Activities
from users.models import User
from datetime import datetime, timedelta, time
from .utils import fields_cardproduto_info

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
    serializer_class = serializerFase
    permission_classes = [permissions.AllowAny]

class FluxoAmbientalView(viewsets.ModelViewSet):
    queryset = Fluxo_Gestao_Ambiental.objects.all()
    serializer_class = serializerFluxoAmbiental
    permission_classes = [permissions.AllowAny]
    lookup_field = 'code'
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
    queryset = Card_Coments.objects.all().order_by('created_at')
    serializer_class = serializerComments
    def get_queryset(self):
        queryset = super().get_queryset()
        fluxogai = self.request.query_params.get('fluxogai', None)   
        if fluxogai:
            queryset = queryset.filter(Q(fluxo_ambiental_id=int(fluxogai)))
        return queryset

class ActivityView(viewsets.ModelViewSet):
    queryset = Card_Activities.objects.all().order_by('-created_at')
    serializer_class = serializerActivities
    def get_queryset(self):
        queryset = super().get_queryset()
        fluxogai = self.request.query_params.get('fluxogai', None)   
        if fluxogai:
            queryset = queryset.filter(Q(fluxo_ambiental_id=int(fluxogai)))
        return queryset