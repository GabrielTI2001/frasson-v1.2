from django.shortcuts import render
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from .models import Cadastro_Licencas
import locale
locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8')

class LicencasView(viewsets.ModelViewSet):
    queryset = Cadastro_Licencas.objects.all()
    serializer_class = detailLicenses
    # permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)   
        if search:
            queryset = queryset.filter(Q(beneficiario__razao_social__icontains=search) |
                Q(beneficiario__cpf_cnpj__icontains=search) | Q(numero_processo__icontains=search) | 
                Q(detalhe_licenca__icontains=search) | Q(instituicao__razao_social__icontains=search)
            )
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listLicenses
        else:
            return self.serializer_class
