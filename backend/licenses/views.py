from django.shortcuts import render
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.response import Response
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
        
class AnexoView(viewsets.ModelViewSet):
    queryset = Anexos.objects.all().order_by('-created_at')
    serializer_class = serializerAnexos
    def get_queryset(self):
        queryset = super().get_queryset()
        licenca = self.request.query_params.get('licenca', None)   
        if licenca:
            queryset = queryset.filter(Q(licenca_id=int(licenca)))
        return queryset
    def create(self, request, *args, **kwargs):
        response_data = []
        serializer = self.get_serializer(data=request.data)
        files = request.FILES.getlist('file')
        if serializer.is_valid():
            for i in files:
                reg = Anexos.objects.create(
                    licenca_id=request.data.get('licenca') if request.data.get('licenca') else None, 
                    uploaded_by_id=request.data.get('uploaded_by'), 
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