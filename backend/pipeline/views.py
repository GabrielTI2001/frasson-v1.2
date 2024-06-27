from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from .serializers import serializerPipe, serializerFase, serializerCard_Produtos, listPipe
from .models import Card_Produtos, Fase, Pipe
from .models import Phases_History
from datetime import datetime, timedelta

class PipeView(viewsets.ModelViewSet):
    lookup_field = 'code'
    queryset = Pipe.objects.all()
    serializer_class = serializerPipe
    permission_classes = [permissions.AllowAny]
    def get_serializer_class(self):
        if self.action == 'list':
            return listPipe
        else:
            return self.serializer_class
        
class PipeDataView(viewsets.ModelViewSet):
    lookup_field = 'code'
    queryset = Pipe.objects.all()
    serializer_class = listPipe

class FasesView(viewsets.ModelViewSet):
    queryset = Fase.objects.all()
    serializer_class = serializerFase
    permission_classes = [permissions.AllowAny]

class Card_ProdutosView(viewsets.ModelViewSet):
    queryset = Card_Produtos.objects.all()
    serializer_class = serializerCard_Produtos
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
                historico_fase_anterior = Phases_History.objects.filter(phase=instance.phase, produto_id=instance.pk)
                if historico_fase_anterior.exists():
                    historico_fase_anterior.update(**{'last_time_out':datetime.now(), 'moved_by_id':user})
                else:
                    Phases_History.objects.create(last_time_out=datetime.now(), phase=instance.phase, produto_id=instance.pk, moved_by_id=user)
                
                historico_fase_atual = Phases_History.objects.filter(phase_id=phase_atual, produto_id=instance.pk)
                if historico_fase_atual.exists():
                    historico_fase_atual.update(**{'last_time_in':datetime.now(), 'last_time_out':None, 'moved_by_id':user})
                    historico_fase_atual = historico_fase_atual.first()
                else:
                    historico_fase_atual = Phases_History.objects.create(first_time_in=datetime.now(), last_time_out=None, phase_id=phase_atual, 
                        produto_id=instance.pk, moved_by_id=user)
                
                responsaveis = [r.id for r in historico_fase_atual.phase.responsaveis.all()]
                instance.responsaveis.set(responsaveis)
                if historico_fase_atual.phase.dias_prazo:
                    instance.data_vencimento = datetime.now().date() + timedelta(historico_fase_atual.phase.dias_prazo)
                instance.save()
            serializer.save()
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)