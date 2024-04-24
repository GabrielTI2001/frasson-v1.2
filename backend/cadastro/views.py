from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Municipios, Maquinas_Equipamentos, Benfeitorias_Fazendas, Pictures_Benfeitorias, Tipo_Benfeitorias, Analise_Solo
from .serializers import selectMunicipio, ListMachinery, ListBenfeitorias, DetailBenfeitorias, ListTipoBenfeitoria, serPictureBenfeitoria
from .serializers import ListAnalisesSolo, detailAnalisesSolo
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
import os


class MunicipioView(viewsets.ModelViewSet):
    queryset = Municipios.objects.all()
    serializer_class = selectMunicipio

    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)   
        if search_term:
            queryset = queryset.filter(nome_municipio__icontains=search_term)
        return queryset

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
                queryset = queryset.filter(type__description__icontains=search_term)
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
        return Response(serializer.data)

class AnalisesSoloView(viewsets.ModelViewSet):
    queryset = Analise_Solo.objects.all()
    serializer_class = detailAnalisesSolo
    lookup_field = 'uuid'
    def get_serializer_class(self):
        if self.action == 'list':
            return ListAnalisesSolo
        else:
            return self.serializer_class