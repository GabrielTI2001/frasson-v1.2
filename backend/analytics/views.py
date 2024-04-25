from django.shortcuts import render
from django.db.models import Q
from rest_framework import viewsets
from .serializers import ListRegimes, detailRegimes
from pipefy.models import Regimes_Exploracao

class RegimesView(viewsets.ModelViewSet):
    queryset = Regimes_Exploracao.objects.all()
    serializer_class = detailRegimes
    def get_queryset(self):
        queryset = super().get_queryset()
        cliente_term = self.request.query_params.get('cliente', None)   
        instituicao_term = self.request.query_params.get('instituicao', None)  
        if cliente_term and instituicao_term:
            queryset = queryset.filter(quem_explora_id=int(cliente_term), instituicao_id=int(instituicao_term))
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return ListRegimes
        else:
            return self.serializer_class