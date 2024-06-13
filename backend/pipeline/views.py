from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from .serializers import serializerPipe, serializerFase, serializerCard_Produtos, serializerDetalhamento_Servicos
from .serializers import serializerInstituicoes_Parceiras, serializerContratos_Servicos, serializerCadastro_Pessoal
from .models import Card_Produtos, Fase, Pipe, Cadastro_Pessoal, Detalhamento_Servicos, Instituicoes_Parceiras, Contratos_Servicos

class PipeView(viewsets.ModelViewSet):
    queryset = Pipe.objects.all()
    serializer_class = serializerPipe
    permission_classes = [permissions.AllowAny]

class FasesView(viewsets.ModelViewSet):
    queryset = Fase.objects.all().order_by('-done')
    serializer_class = serializerFase
    permission_classes = [permissions.AllowAny]

class Card_ProdutosView(viewsets.ModelViewSet):
    queryset = Card_Produtos.objects.all()
    serializer_class = serializerCard_Produtos
    permission_classes = [permissions.AllowAny]
    lookup_field = 'uuid'

class Card_BeneficiariosView(viewsets.ModelViewSet):
    queryset = Card_Produtos.objects.all()
    serializer_class = serializerCard_Produtos
    permission_classes = [permissions.AllowAny]

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

class ContratosView(viewsets.ModelViewSet):
    queryset = Contratos_Servicos.objects.all()
    serializer_class = serializerContratos_Servicos
    permission_classes = [permissions.AllowAny]