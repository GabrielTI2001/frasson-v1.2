from django.shortcuts import render, HttpResponse
from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
import requests, json, time
from backend.settings import TOKEN_PIPEFY_API, URL_PIFEFY_API
from .serializers import *
from .models import Glebas_Areas, Culturas_Agricolas
from rest_framework.parsers import MultiPartParser, FormParser
from pykml.factory import KML_ElementMaker as KML
from pykml import parser
from lxml import etree

class GlebasView(viewsets.ModelViewSet):
    queryset = Glebas_Areas.objects.all()
    serializer_class = detailGleba
    parser_classes = (MultiPartParser, FormParser)
    # permission_classes = [IsAuthenticated]
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
            return listGlebas
        else:
            return self.serializer_class
        

class CoordendasGlebasView(viewsets.ModelViewSet):
    queryset = Glebas_Areas.objects.all()
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
    parser_classes = (MultiPartParser, FormParser)
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
    data = Glebas_Coordenadas.objects.values().filter(gleba_id=id)

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
    