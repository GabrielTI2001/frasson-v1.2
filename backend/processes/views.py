from django.shortcuts import render
from rest_framework import permissions, viewsets, status
from rest_framework.permissions import IsAuthenticated
import requests, json
from rest_framework.response import Response
from django.db.models import Q
from .models import Processos_Andamento
# Create your views here.

# class FollowupView(viewsets.ModelViewSet):
#     queryset = Cadastro_Pessoal.objects.all()
#     serializer_class = detailCadastro_Pessoal
#     permission_classes = [IsAuthenticated]
#     lookup_field = 'uuid'
#     def get_queryset(self):
#         queryset = super().get_queryset()
#         search_term = self.request.query_params.get('search', None)
#         all_term = self.request.query_params.get('all', None)
#         if search_term:
#             queryset = queryset.filter(
#                 Q(razao_social__icontains=search_term) |
#                 Q(cpf_cnpj__icontains=search_term) |
#                 Q(grupo__nome_grupo__icontains=search_term)
#             )
#         elif all_term:
#             queryset = queryset.order_by('-created_at')
#         else:
#             if self.action == 'list':
#                 queryset = queryset.order_by('-created_at')[:10]
#         return queryset
#     def get_serializer_class(self):
#         if self.action == 'list':
#             return listCadastro_Pessoal
#         else:
#             return self.serializer_class