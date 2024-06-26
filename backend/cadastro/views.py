from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Municipios, Maquinas_Equipamentos, Benfeitorias_Fazendas, Pictures_Benfeitorias, Tipo_Benfeitorias, Analise_Solo
from .models import Feedbacks_Category, Feedbacks_System, Welcome_Messages, Detalhamento_Servicos, Instituicoes_Parceiras, Cartorios_Registro
from pipeline.models import Card_Produtos
from finances.models import Contratos_Servicos_Pagamentos
from .serializers import *
from rest_framework.parsers import MultiPartParser, FormParser
import os
from django.db.models import Q, Subquery, OuterRef, Count, IntegerField
from django.db.models.functions import Coalesce
from datetime import date
from rest_framework import permissions, viewsets, status
from .models import Cadastro_Pessoal, Instituicoes_Razao_Social

def home(request):
    produtos_count = Card_Produtos.objects.all().count()
    welcome_message = Welcome_Messages.objects.order_by("?").values('message').first()
    data_hoje_str = date.today().strftime("%A, %d de %B de %Y")
    context = {
        'produtos_count': produtos_count,
        'message': welcome_message['message'],
        'str_data_hoje': data_hoje_str
    }
    return JsonResponse(context)

class CategoriaCadView(viewsets.ModelViewSet):
    queryset = Categoria_Cadastro.objects.all()
    serializer_class = listCategoriaCadastro
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)   
        if search_term:
            queryset = queryset.filter(categoria__icontains=search_term)
        return queryset

class GrupoClienteView(viewsets.ModelViewSet):
    queryset = Grupos_Clientes.objects.all()
    serializer_class = listGrupoCliente
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)   
        if search_term:
            queryset = queryset.filter(nome_grupo__icontains=search_term)
        return queryset

class MunicipioView(viewsets.ModelViewSet):
    queryset = Municipios.objects.all()
    serializer_class = selectMunicipio

    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)   
        uf_term = self.request.query_params.get('uf', None) 
        if search_term:
            queryset = queryset.filter(nome_municipio__icontains=search_term)
        if uf_term:
            queryset = queryset.filter(nome_municipio__icontains=search_term, sigla_uf=uf_term)
        return queryset

class CartorioView(viewsets.ModelViewSet):
    queryset = Cartorios_Registro.objects.all()
    serializer_class = detailCartorio
    lookup_field = 'uuid'
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)   
        if search_term:
            queryset = queryset.filter(razao_social__icontains=search_term)
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listCartorio
        else:
            return self.serializer_class

class MachineryView(viewsets.ModelViewSet):
    queryset = Maquinas_Equipamentos.objects.all()
    serializer_class = ListMachinery

class TipoBenfeitoriaView(viewsets.ModelViewSet):
    queryset = Tipo_Benfeitorias.objects.all()
    serializer_class = ListTipoBenfeitoria

class BenfeitoriasView(viewsets.ModelViewSet):
    queryset = Benfeitorias_Fazendas.objects.all()
    serializer_class = DetailBenfeitorias
    parser_classes = (MultiPartParser, FormParser)
    # permission_classes = (IsAuthenticated,)
    lookup_field = 'uuid'
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)   
        all_term = self.request.query_params.get('all', None)   
        if self.action == 'list':
            if search_term:
                queryset = queryset.filter(Q(type__description__icontains=search_term) | Q(farm__nome_imovel__icontains=search_term))
            elif all_term:
                queryset = queryset
            else:
                queryset = queryset[:10]
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return ListBenfeitorias
        else:
            return self.serializer_class
        
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        images = request.FILES.getlist('file')
        if serializer.is_valid():
            if not request.FILES:
                return Response({'file': 'Insira pelo menos uma imagem!'}, status=400)
            imgs_validas = 0
            for i in images:
                ext = os.path.splitext(i.name)[1]
                valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
                if not ext.lower() in valid_extensions:
                    return Response({'error': 'O arquivo precisa ser uma imagem!'}, status=400)
                filesize = i.size
                if filesize > 2 * 1024 * 1024:  # 2 MB
                    return Response({'error': 'O tamanho máximo da imagem é 2 MB!'}, status=400)
                imgs_validas += 1
            if imgs_validas == len(images):
                self.perform_create(serializer)
                for i in images:
                    Pictures_Benfeitorias.objects.create(benfeitoria=serializer.instance, upload_by=request.user, file=i)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PicturesBenfeitoriasView(viewsets.ModelViewSet):
    queryset = Pictures_Benfeitorias.objects.all()
    serializer_class = serPictureBenfeitoria
    def create(self, request, *args, **kwargs):
        response_data = []
        serializer = self.get_serializer(data=request.data)
        images = request.FILES.getlist('file')
        if serializer.is_valid():
            imgs_validas = 0
            for i in images:
                ext = os.path.splitext(i.name)[1]
                valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
                if not ext.lower() in valid_extensions:
                    return Response({'error': 'O arquivo precisa ser uma imagem!'}, status=400)
                filesize = i.size
                if filesize > 2 * 1024 * 1024:  # 2 MB
                    return Response({'error': 'O tamanho máximo da imagem é 2 MB!'}, status=400)
                imgs_validas += 1
            if imgs_validas == len(images):
                for i in images:
                    reg = Pictures_Benfeitorias.objects.create(benfeitoria_id=request.data.get('benfeitoria'), upload_by=request.user, file=i)
                    response_data.append({'id':reg.id, 'url':'/media/'+reg.file.name})
                headers = self.get_success_headers(serializer.data)
                return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            ext = os.path.splitext(request.FILES.get('file').name)[1]
            valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
            if not ext.lower() in valid_extensions:
                return Response({'error': 'O arquivo precisa ser uma imagem!'}, status=400)
            filesize = request.FILES.get('file').size
            if filesize > 2 * 1024 * 1024:  # 2 MB
                return Response({'error': 'O tamanho máximo da imagem é 2 MB!'}, status=400)
            else:
                serializer.save()
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AnalisesSoloView(viewsets.ModelViewSet):
    queryset = Analise_Solo.objects.all()
    serializer_class = detailAnalisesSolo
    # permission_classes = (IsAuthenticated,)
    lookup_field = 'uuid'
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)   
        all_term = self.request.query_params.get('all', None)   
        if self.action == 'list':
            if search_term:
                queryset = queryset.filter(Q(fazenda__nome_imovel__icontains=search_term))
            elif all_term:
                queryset = queryset
            else:
                queryset = queryset[:10]
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return ListAnalisesSolo
        else:
            return self.serializer_class
class ResultAnalisesSoloView(viewsets.ModelViewSet):
    queryset = Analise_Solo.objects.all()
    serializer_class = resultsAnalisesSolo
    # permission_classes = (IsAuthenticated,)
    lookup_field = 'uuid'

class CategoryFeedbackView(viewsets.ModelViewSet):
    queryset = Feedbacks_Category.objects.all()
    serializer_class = ListFeedbacksCategory

class FeedbackView(viewsets.ModelViewSet):
    queryset = Feedbacks_System.objects.all()
    serializer_class = detailFeedbacks
    def get_serializer_class(self):
        if self.action == 'list':
            return ListFeedbacks
        else:
            return self.serializer_class

class FeedbackReplyView(viewsets.ModelViewSet):
    queryset = Feedbacks_Replies.objects.all()
    serializer_class = FeedbackReply

class PessoasView(viewsets.ModelViewSet):
    queryset = Cadastro_Pessoal.objects.all()
    serializer_class = detailCadastro_Pessoal
    # permission_classes = [IsAuthenticated]
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
        
class ProdutosView(viewsets.ModelViewSet):
    queryset = Produtos_Frasson.objects.all()
    serializer_class = serializer_Cad_Produtos
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        all_term = self.request.query_params.get('all', None)
        if search_term:
            queryset = queryset.filter(
                Q(description__icontains=search_term)
            )
        elif all_term:
            queryset = queryset.order_by('-created_at')
        else:
            queryset = queryset.order_by('-created_at')[:10]
        return queryset

class Detalhamento_ServicosView(viewsets.ModelViewSet):
    queryset = Detalhamento_Servicos.objects.all()
    serializer_class = serializerDetalhamento_Servicos
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        all_term = self.request.query_params.get('all', None)
        contrato_term = self.request.query_params.get('contrato', None)
        if search_term:
            queryset = queryset.filter(
                Q(detalhamento_servico__icontains=search_term) | Q(produto__description__icontains=search_term)
            )
        if all_term:
            queryset = queryset.order_by('-created_at')
        if contrato_term:
            subquery1 = Contratos_Servicos_Pagamentos.objects.filter(servico_id=OuterRef('id'), contrato_id=contrato_term
                ).values('servico_id').annotate(total=Count('id')).values('total')[:1]
            servicos_contrato = Contratos_Servicos.objects.get(pk=contrato_term).servicos.all()
            queryset = queryset.annotate(
                total_etapas=Coalesce(Subquery(subquery1, output_field=IntegerField()), 0)
            ).filter(id__in=[s.id for s in servicos_contrato], total_etapas__lt=3)
        else:
            queryset = queryset.order_by('-created_at')[:10]
        return queryset

class Instituicoes_ParceirasView(viewsets.ModelViewSet):
    queryset = Instituicoes_Parceiras.objects.all()
    serializer_class = serializerInstituicoes_Parceiras
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        all_term = self.request.query_params.get('all', None)
        if search_term:
            queryset = queryset.filter(
                Q(identificacao__icontains=search_term) | Q(instituicao__razao_social__icontains=search_term)
            )
        elif all_term:
            queryset = queryset.order_by('-created_at')
        else:
            queryset = queryset.order_by('-created_at')[:10]
        return queryset

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