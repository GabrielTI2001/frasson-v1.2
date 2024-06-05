from django.shortcuts import render, HttpResponse
from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from .models import Producao_Agricola, Producao_Pecuaria, Produto_Principal_Pecuaria, Unidade_Producao_Pecuaria, Sistema_Producao_Pecuaria
from .serializers import *
from rest_framework.parsers import MultiPartParser, FormParser

class ProdAgricolaView(viewsets.ModelViewSet):
    queryset = Producao_Agricola.objects.all()
    serializer_class = detailProdAgricola
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        gleba = self.request.query_params.get('gleba', None)
        if gleba:
            queryset = queryset.filter(
                Q(gleba_id=int(gleba))
            )
        else:
            if self.action == 'list':
                queryset = queryset.order_by('-created_at')[:20]
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listProdAgricola
        else:
            return self.serializer_class
        

class ProdPecuariaView(viewsets.ModelViewSet):
    queryset = Producao_Pecuaria.objects.all()
    serializer_class = detailProdPecuaria
    parser_classes = (MultiPartParser, FormParser)
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        gleba = self.request.query_params.get('gleba', None)
        if gleba:
            queryset = queryset.filter(
                Q(gleba_id=int(gleba))
            )
        else:
            if self.action == 'list':
                queryset = queryset.order_by('-created_at')[:20]
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listProdPecuaria
        else:
            return self.serializer_class

class UnidadeProducaoView(viewsets.ModelViewSet):
    queryset = Unidade_Producao_Pecuaria.objects.all()
    serializer_class = listUnidadeProducao
    parser_classes = (MultiPartParser, FormParser)
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(description__icontains=search)
            )
        return queryset

class SistemaProducaoView(viewsets.ModelViewSet):
    queryset = Sistema_Producao_Pecuaria.objects.all()
    serializer_class = listSistemaProducao
    parser_classes = (MultiPartParser, FormParser)
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(description__icontains=search)
            )
        return queryset
    
class ProdutoPrincipalView(viewsets.ModelViewSet):
    queryset = Produto_Principal_Pecuaria.objects.all()
    serializer_class = listProdutoPrincipal
    parser_classes = (MultiPartParser, FormParser)
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(description__icontains=search)
            )
        return queryset