from django.shortcuts import render, HttpResponse
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from .models import Cadastro_Pivots, Fabricantes_Bombas, Fabricantes_Pivots
from backend.frassonUtilities import Frasson
from pykml.factory import KML_ElementMaker as KML
from lxml import etree
import time

class PivotsView(viewsets.ModelViewSet):
    queryset = Cadastro_Pivots.objects.all()
    serializer_class = detailPivots
    # permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)   
        if search:
            queryset = queryset.filter(
                Q(proprietario__razao_social__icontains=search) | 
                Q(propriedade_localizacao__icontains=search) | 
                Q(municipio_localizacao__nome_municipio__icontains=search)
            )
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listPivots
        else:
            return self.serializer_class
        
class PivotsPointsView(viewsets.ModelViewSet):
    queryset = Cadastro_Pivots.objects.all()
    serializer_class = detailPivots
    # permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)   
        if search:
            queryset = queryset.filter(
                Q(proprietario__razao_social__icontains=search) | 
                Q(propriedade_localizacao__icontains=search) | 
                Q(municipio_localizacao__nome_municipio__icontains=search)
            )
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return pointPivots
        else:
            return self.serializer_class


class FabricantesPivotsView(viewsets.ModelViewSet):
    queryset = Fabricantes_Pivots.objects.all()
    serializer_class = listFabricantesPivots
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)   
        if search:
            queryset = queryset.filter(
                Q(nome_fabricante__icontains=search)
            )
        return queryset

class FabricantesBombasView(viewsets.ModelViewSet):
    queryset = Fabricantes_Bombas.objects.all()
    serializer_class = listFabricantesBombas
    # permission_classes = [IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)   
        if search:
            queryset = queryset.filter(
                Q(nome_fabricante__icontains=search)
            )
        return queryset
    

def cadasto_pivot_kml(request, id):
    #BAIXAR KML DE PIVOT
    try:
        pivot = Cadastro_Pivots.objects.get(pk=id)
        long_central = float(pivot.long_center_gd)
        lat_central = float(pivot.lat_center_gd)
        raio = float(pivot.raio_irrigado_m)
        pontos = Frasson.createLatLongPointsPivot(lat_central, long_central, raio, 90)
        time_now = int(time.time()) #for the file name
        file_name = f"pivot_{time_now}.kml"

        polygon_coordinates = []
        for coord in pontos:
            str_coordenada = f"{coord['lng']},{coord['lat']}"
            polygon_coordinates.append(str_coordenada)

        first_coordinate = f"{pontos[0]['lng']},{pontos[0]['lat']}" #first coordinate
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
    except ObjectDoesNotExist:
        return HttpResponse(status=404)