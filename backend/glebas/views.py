from django.shortcuts import render, HttpResponse
from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
import requests, json, time
from .serializers import *
from .models import Cadastro_Glebas, Cadastro_Glebas_Coordenadas
from cadastro.models import Culturas_Agricolas
from rest_framework.parsers import MultiPartParser, FormParser
from pykml.factory import KML_ElementMaker as KML
from pykml import parser
from lxml import etree
from services.views import parse_element_kml

class GlebasView(viewsets.ModelViewSet):
    queryset = Cadastro_Glebas.objects.all()
    serializer_class = detailGleba
    parser_classes = (MultiPartParser, FormParser)
    # permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        all_term = self.request.query_params.get('all', None)
        if search_term:
            queryset = queryset.filter(
                Q(cliente__razao_social__icontains=search_term) |
                Q(propriedades__nome__icontains=search_term) |
                Q(propriedades__municipio__nome_municipio__icontains=search_term) |
                Q(gleba__icontains=search_term)
            )
        elif all_term:
            queryset = queryset.order_by('-created_at')
        else:
            if self.action == 'list':
                queryset = queryset.order_by('-created_at')[:10]
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listGlebas
        else:
            return self.serializer_class
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        kml = request.FILES.get('kml')
        if serializer.is_valid():
            if kml:
                ext = os.path.splitext(kml.name)[1]
                valid_extensions = ['.kml']
                if not ext.lower() in valid_extensions:
                    return Response({'kml': 'O arquivo precisa ser em formato KML!'}, status=400)
                gleba = serializer.save()
                kml.seek(0) 
                root = parser.parse(kml).getroot()
                coordinates_gd = parse_element_kml(root)
                for latlong in coordinates_gd:
                    Cadastro_Glebas_Coordenadas.objects.create(gleba_id=gleba.id, latitude_gd=latlong['lat'], longitude_gd=latlong['lng'])
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                return Response({'kml': 'Submeta um Arquivo!'}, status=400)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            gleba = serializer.save()
            kml = request.FILES.get('kml')
            if kml:
                ext = os.path.splitext(kml.name)[1]
                valid_extensions = ['.kml']
                if not ext.lower() in valid_extensions:
                    return Response({'kml': 'O arquivo precisa ser em formato KML!'}, status=400)
                kml.seek(0) 
                root = parser.parse(kml).getroot()
                coordinates_gd = parse_element_kml(root)
                Cadastro_Glebas_Coordenadas.objects.filter(gleba_id=gleba.id).delete()
                for latlong in coordinates_gd:
                    Cadastro_Glebas_Coordenadas.objects.create(gleba_id=gleba.id, latitude_gd=latlong['lat'], longitude_gd=latlong['lng'])
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class CoordendasGlebasView(viewsets.ModelViewSet):
    queryset = Cadastro_Glebas.objects.all()
    serializer_class = detailGlebasCoordenadas
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        all_term = self.request.query_params.get('all', None)
        if search_term:
            queryset = queryset.filter(
                Q(cliente__razao_social__icontains=search_term) |
                Q(propriedade__nome_imovel__icontains=search_term) |
                Q(municipio__nome_municipio__icontains=search_term) |
                Q(gleba__icontains=search_term)
            )
        elif all_term:
            queryset = queryset.order_by('-created_at')
        else:
            if self.action == 'list':
                queryset = queryset.order_by('-created_at')[:10]
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return GlebasCoordenadas
        else:
            return self.serializer_class

class CulturasView(viewsets.ModelViewSet):
    queryset = Culturas_Agricolas.objects.all()
    serializer_class = listCulturas
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        if search_term:
            queryset = queryset.filter(
                Q(cultura__icontains=search_term)
            )
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listCulturas
        else:
            return self.serializer_class

def download_kml_gleba(request, id):
    time_now = int(time.time()) #for the file name
    file_name = f"gleba_{time_now}.kml"
    data = Cadastro_Glebas_Coordenadas.objects.values().filter(gleba_id=id)

    polygon_coordinates = []
    for coord in data:
        str_coordenada = f"{coord['longitude_gd']},{coord['latitude_gd']}"
        polygon_coordinates.append(str_coordenada)

    first_coordinate = f"{data[0]['longitude_gd']},{data[0]['latitude_gd']}" #first coordinate
    polygon_coordinates.append(first_coordinate)  #add again the first coordinate to close the polygon

    # Create a Polygon Style
    polygon_style = KML.Style(
        KML.id("polygon_style"),
        KML.PolyStyle(
            KML.color('00ffffff'),  # Fully transparent
            KML.fill(0),  # 0 means no fill
        ),
        KML.LineStyle(
            KML.color('ff00ff00'),  # Green outline
            KML.width(2),  # You can also set the line width
        )
    )

    # Create a KML Document with a Polygon and Style
    kml_doc = KML.kml(
        KML.Document(
            polygon_style,  # Add the Style to the Document
            KML.Folder(
                KML.name("Polygon"),
                KML.Placemark(
                    KML.name("Polygon"),
                    KML.styleUrl("#polygon_style"),  # Refer to the polygon_style by id
                    KML.Polygon(
                        KML.outerBoundaryIs(
                            KML.LinearRing(
                                KML.coordinates(" ".join(polygon_coordinates))
                            )
                        )
                    )
                )
            )
        )
    )
    # Convert KML document to string
    kml_str = etree.tostring(kml_doc, pretty_print=True)
    # Create a response with the KML type
    response = HttpResponse(kml_str, content_type='application/vnd.google-earth.kml+xml')
    # Add a file attachment header
    response['Content-Disposition'] = f'attachment; filename="{file_name}"'
    return response
    