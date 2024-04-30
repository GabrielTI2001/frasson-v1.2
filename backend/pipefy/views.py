from django.shortcuts import render
from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
import requests, json
from backend.settings import TOKEN_PIPEFY_API, URL_PIFEFY_API
from .serializers import serializerPipe, serializerFase, serializerCard_Produtos, serializerDetalhamento_Servicos, serializerInstituicoes_Parceiras
from .serializers import serializerContratos_Servicos, serializerCadastro_Pessoal, listCadastro_Pessoal, detailCadastro_Pessoal
from .serializers import serOperacoesContratatadas, listInstituicoes_RazaoSocial, serializerCard_Prospects, detailCard_Prospects
from .serializers import serMonitoramentoPrazos
from .models import Card_Produtos, Fase, Pipe, Cadastro_Pessoal, Detalhamento_Servicos, Instituicoes_Parceiras, Contratos_Servicos
from .models import Operacoes_Contratadas, Instituicoes_Razao_Social, Card_Prospects, Prospect_Monitoramento_Prazos

class PessoasView(viewsets.ModelViewSet):
    queryset = Cadastro_Pessoal.objects.all()
    serializer_class = detailCadastro_Pessoal
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        all_term = self.request.query_params.get('all', None)
        if search_term:
            queryset = queryset.filter(
                Q(razao_social__icontains=search_term) |
                Q(cpf_cnpj__icontains=search_term) |
                Q(grupo__nome_grupo__icontains=search_term)
            )
        elif all_term:
            queryset = queryset.order_by('-created_at')
        else:
            if self.action == 'list':
                queryset = queryset.order_by('-created_at')[:10]
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listCadastro_Pessoal
        else:
            return self.serializer_class

class PipeView(viewsets.ModelViewSet):
    queryset = Pipe.objects.all()
    serializer_class = serializerPipe
    permission_classes = [permissions.AllowAny]

class FasesView(viewsets.ModelViewSet):
    queryset = Fase.objects.all()
    serializer_class = serializerFase
    permission_classes = [permissions.AllowAny]

class Card_ProdutosView(viewsets.ModelViewSet):
    queryset = Card_Produtos.objects.all()
    serializer_class = detailCard_Prospects
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        benefic_search = self.request.query_params.get('beneficiario', None)
        
        if benefic_search:
            queryset = queryset.filter(
                Q(beneficiario__in=[int(benefic_search)])
            )
        else:
            if self.action == 'list':
                queryset = queryset.order_by('-created_at')
        return queryset

class Card_ProspectsView(viewsets.ModelViewSet):
    queryset = Card_Prospects.objects.all()
    serializer_class = detailCard_Prospects
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(pk__icontains=search) | Q(prospect__cliente__icontains=search) | Q(phase__descricao__icontains=search) | 
                Q(responsavel__user__first_name__icontains=search)
            )
        else:
            queryset = queryset.order_by('-created_at')
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return serializerCard_Prospects
        else:
            return self.serializer_class

class Card_BeneficiariosView(viewsets.ModelViewSet):
    queryset = Card_Produtos.objects.all()
    serializer_class = serializerCard_Produtos
    permission_classes = [permissions.AllowAny]
    def update_beneficiarios(self, request, pk=None):
        card = self.get_object()
        beneficiarios = request.data.get('beneficiario')
        if beneficiarios is not None:
            card.beneficiario.set(beneficiarios)
        serializer = self.get_serializer(card)
        return Response(serializer.data, status=status.HTTP_200_OK)

class BeneficiariosView(viewsets.ModelViewSet):
    queryset = Cadastro_Pessoal.objects.all()
    serializer_class = serializerCadastro_Pessoal
    permission_classes = [permissions.AllowAny]

class Detalhamento_ServicosView(viewsets.ModelViewSet):
    queryset = Detalhamento_Servicos.objects.all()
    serializer_class = serializerDetalhamento_Servicos
    permission_classes = [permissions.AllowAny]

class Instituicoes_ParceirasView(viewsets.ModelViewSet):
    queryset = Instituicoes_Parceiras.objects.all()
    serializer_class = serializerInstituicoes_Parceiras
    permission_classes = [permissions.AllowAny]

class Instituicoes_RazaosocialView(viewsets.ModelViewSet):
    queryset = Instituicoes_Razao_Social.objects.all()
    serializer_class = listInstituicoes_RazaoSocial
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        all_term = self.request.query_params.get('all', None)
        if search_term:
            queryset = queryset.filter(
                Q(razao_social__icontains=search_term)
            )
        elif all_term:
            queryset = queryset.order_by('-created_at')
        else:
            queryset = queryset.order_by('-created_at')[:10]
        return queryset

class ContratosView(viewsets.ModelViewSet):
    queryset = Contratos_Servicos.objects.all()
    serializer_class = serializerContratos_Servicos
    permission_classes = [permissions.AllowAny]

class MonitoramentoPrazosView(viewsets.ModelViewSet):
    queryset = Prospect_Monitoramento_Prazos.objects.all()
    serializer_class = serMonitoramentoPrazos
    permission_classes = [permissions.AllowAny]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        prospect_id = request.data.get('prospect')
        if serializer.is_valid():
            fields_venc = {'START':'prazo_para_encaminhamento', 'CONTATO INICIAL':'prazo_para_o_contato_inicial', 'BACK OFFICE':'prazo_para_o_back_office', 
                'ANÁLISE E PROCESSAMENTO':'prazo_para_a_an_lise_e_processamento', 'ANÁLISE TÉCNICA':'prazo_para_a_litec_1', 'PROPOSTA DE VALOR':'prazo_para_a_proposta_de_valor', 
                'MINUTA CONTRATO':'prazo_para_a_proposta_de_valor_1', 'ENCERRAMENTO':'prazo_para_encerramento', 'CONCLUÍDO':'prazo_para_encerramento', 'PERDIDO':'prazo_para_encerramento',
                'GANHO':'prazo_para_encerramento', 'CANCELADO':'prazo_para_encerramento'}
            payload = {"query":"{card (id:" + str(prospect_id) + ") {current_phase{name}}}"}
            response = requests.post(URL_PIFEFY_API, json=payload, headers={"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"})
            obj = json.loads(response.text)
            current_phase = obj["data"]["card"]["current_phase"]["name"]
            field_id = fields_venc[current_phase]
            newvalue = request.data.get('data_vencimento') + 'T18:00:00Z'
            payload = {"query":"mutation { updateCard(input: {id:"+str(prospect_id)+", due_date: \""+newvalue+"\"}) {card {title}}}"}
            response = requests.post(URL_PIFEFY_API, json=payload, headers={"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"})
            payload = {"query":"mutation { updateCardField(input: {card_id:"+str(prospect_id)+", field_id: \""+field_id+"\", new_value: \""+newvalue+"\"}) {card {title}}}"}
            response = requests.post(URL_PIFEFY_API, json=payload, headers={"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"})
            serializer.save()
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OperacoesContratadasView(viewsets.ModelViewSet):
    queryset = Operacoes_Contratadas.objects.all()
    serializer_class = serOperacoesContratatadas
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        queryset = super().get_queryset()
        benefic_search = self.request.query_params.get('beneficiario', None)
        
        if benefic_search:
            queryset = queryset.filter(
                Q(beneficiario=int(benefic_search))
            )
        else:
            if self.action == 'list':
                queryset = queryset.order_by('-created_at')

        return queryset