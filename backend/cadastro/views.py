from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Municipios, Maquinas_Equipamentos, Benfeitorias_Fazendas, Pictures_Benfeitorias, Tipo_Benfeitorias, Analise_Solo, Anexos
from .models import Feedbacks_Category, Feedbacks_System, Welcome_Messages, Detalhamento_Servicos, Instituicoes_Parceiras, Cartorios_Registro
from pipeline.models import Fluxo_Gestao_Ambiental, Fluxo_Gestao_Credito
from finances.models import Contratos_Ambiental, Contratos_Ambiental_Pagamentos
from .serializers import *
from rest_framework.parsers import MultiPartParser, FormParser
import os
from django.db.models import Q, Subquery, OuterRef, Count, IntegerField
from django.db.models.functions import Coalesce
from datetime import date
from rest_framework import permissions, viewsets, status
from .models import Cadastro_Pessoal, Instituicoes_Razao_Social

def home(request):
    fluxo_gai_count = Fluxo_Gestao_Ambiental.objects.all().count()
    fluxo_gc_count = Fluxo_Gestao_Credito.objects.all().count()
    welcome_message = Welcome_Messages.objects.order_by("?").values('message').first()
    data_hoje_str = date.today().strftime("%A, %d de %B de %Y")
    context = {
        'fluxo_gai_count': fluxo_gai_count,
        'fluxo_gc_count': fluxo_gc_count,
        'message': welcome_message['message'],
        'str_data_hoje': data_hoje_str
    }
    return JsonResponse(context)

def cadastros(request):
    cartorios = Cartorios_Registro.objects.all().count()
    benfeitorias = Benfeitorias_Fazendas.objects.all().count()
    analises_solo = Analise_Solo.objects.all().count()
    pessoal = Cadastro_Pessoal.objects.all().count()
    maquinas = Maquinas_Equipamentos.objects.all().count()
    context = {
        'pessoal': pessoal,
        'cartorios': cartorios,
        'benfeitorias': benfeitorias,
        'analises_solo': analises_solo,
        'maquinas': maquinas,
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
    serializer_class = resultsAnalisesSolo
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
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        files = request.FILES.getlist('file')
        if serializer.is_valid():
            self.perform_create(serializer)
            if request.FILES:
                for i in files:
                    Anexos.objects.create(analise_solo=serializer.instance, uploaded_by=request.user, file=i)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        contrato_gai = self.request.query_params.get('contratogai', None)
        contrato_gc = self.request.query_params.get('contratogc', None)
        produto = self.request.query_params.get('produto', None)
        query = Q()
        if search_term:
            query &= (Q(detalhamento_servico__icontains=search_term) | Q(produto__description__icontains=search_term))
        if produto:
            query &= Q(produto__acronym=produto)
        if contrato_gai:
            servicos_contrato = Contratos_Ambiental.objects.get(pk=contrato_gai).servicos.all()
            query &= (Q(id__in=[s.id for s in servicos_contrato]))
        queryset = queryset.filter(query)
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

class AnexoView(viewsets.ModelViewSet):
    queryset = Anexos.objects.all().order_by('-created_at')
    serializer_class = serializerAnexos
    def get_queryset(self):
        queryset = super().get_queryset()
        analise_solo = self.request.query_params.get('analisesolo', None)   
        if analise_solo:
            queryset = queryset.filter(Q(analise_solo_id=int(analise_solo)))
        return queryset
    def create(self, request, *args, **kwargs):
        response_data = []
        serializer = self.get_serializer(data=request.data)
        files = request.FILES.getlist('file')
        if serializer.is_valid():
            for i in files:
                reg = Anexos.objects.create(
                    analise_solo_id=request.data.get('analise_solo') if request.data.get('analise_solo') else None, 
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