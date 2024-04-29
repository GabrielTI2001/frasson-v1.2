from django.shortcuts import render
from django.db.models import Q
from rest_framework import viewsets
from .serializers import ListRegimes, detailRegimes, listFarms, detailFarms
from pipefy.models import Regimes_Exploracao, Imoveis_Rurais

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

class FarmsView(viewsets.ModelViewSet):
    queryset = Imoveis_Rurais.objects.all()
    serializer_class = detailFarms
    # permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        all_term = self.request.query_params.get('all', None)
        if search_term:
            queryset = queryset.filter(
                Q(nome_imovel__icontains=search_term)
            )
        elif all_term:
            queryset = queryset.order_by('-created_at')
        else:
            if self.action == 'list':
                queryset = queryset.order_by('-created_at')[:10]
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listFarms
        else:
            return self.serializer_class
