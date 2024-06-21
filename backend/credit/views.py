from django.shortcuts import render, HttpResponse
from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
import requests, json
from backend.settings import TOKEN_PIPEFY_API, URL_PIFEFY_API
from .serializers import *
from .models import Operacoes_Contratadas

class OperacoesContratadasView(viewsets.ModelViewSet):
    queryset = Operacoes_Contratadas.objects.all()
    serializer_class = detailOperacoes
    # permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None) 
        search_year = self.request.query_params.get('year', None)   
        search_month = self.request.query_params.get('month', None)  
        search_bank = self.request.query_params.get('bank', None)  
        query = Q()
        if search_year:
            query &= Q(data_emissao_cedula__year=search_year)
            if search_month:
                query &= Q(data_emissao_cedula__month=search_month)
        if search_bank:
            query &= Q(instituicao__instituicao_id=search_bank)      
        if search:
            query &= Q(beneficiario__razao_social__icontains=search)
        queryset = queryset.filter(query).order_by('beneficiario__razao_social', 'data_emissao_cedula')
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return listOperacoes
        else:
            return self.serializer_class