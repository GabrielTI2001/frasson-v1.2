from django.shortcuts import render, HttpResponse
from django.db.models import Q
from rest_framework.response import Response
from rest_framework import viewsets, status
from .serializers import ListRegimes, detailRegimes, listFarms, detailFarms, ListCAR, detailCAR, ListSIGEF
from farms.models import Imoveis_Rurais, Regimes_Exploracao, Cadastro_Ambiental_Rural, Certificacao_Sigef_Parcelas
from farms.models import Imoveis_Rurais_Coordenadas_Matricula, Regimes_Exploracao_Coordenadas
import os, time
from pykml import parser
from lxml import etree
from services.views import parse_element_kml
from pykml.factory import KML_ElementMaker as KML

class RegimesView(viewsets.ModelViewSet):
    queryset = Regimes_Exploracao.objects.all()
    serializer_class = detailRegimes
    lookup_field = 'uuid'
    def get_queryset(self):
        queryset = super().get_queryset()
        cliente_term = self.request.query_params.get('cliente', None)   
        instituicao_term = self.request.query_params.get('instituicao', None)  
        if cliente_term and instituicao_term:
            queryset = queryset.filter(quem_explora_id=int(cliente_term), instituicao_id=int(instituicao_term))
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return ListRegimes
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
                regime = serializer.save()
                kml.seek(0) 
                root = parser.parse(kml).getroot()
                coordinates_gd = parse_element_kml(root)
                for latlong in coordinates_gd:
                    Regimes_Exploracao_Coordenadas.objects.create(regime_id=regime.id, latitude=latlong['lat'], longitude=latlong['lng'])
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
            regime = serializer.save()
            kml = request.FILES.get('kml')
            if kml:
                ext = os.path.splitext(kml.name)[1]
                valid_extensions = ['.kml']
                if not ext.lower() in valid_extensions:
                    return Response({'kml': 'O arquivo precisa ser em formato KML!'}, status=400)
                kml.seek(0) 
                root = parser.parse(kml).getroot()
                coordinates_gd = parse_element_kml(root)
                Regimes_Exploracao_Coordenadas.objects.filter(regime_id=regime.id).delete()
                for latlong in coordinates_gd:
                    Regimes_Exploracao_Coordenadas.objects.create(regime_id=regime.id, latitude=latlong['lat'], longitude=latlong['lng'])
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class FarmsView(viewsets.ModelViewSet):
    queryset = Imoveis_Rurais.objects.all()
    serializer_class = detailFarms
    # permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        all_term = self.request.query_params.get('all', None)
        if search_term:
            queryset = queryset.filter(
                Q(nome__icontains=search_term) | Q(proprietarios__razao_social__icontains=search_term)
            )
        elif all_term:
            queryset = queryset.order_by('-created_at')
        else:
            if self.action == 'list':
                queryset = queryset.order_by('-created_at')[:10]
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listFarms
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
                farm = serializer.save()
                kml.seek(0) 
                root = parser.parse(kml).getroot()
                coordinates_gd = parse_element_kml(root)
                for latlong in coordinates_gd:
                    Imoveis_Rurais_Coordenadas_Matricula.objects.create(imovel_id=farm.id, latitude_gd=latlong['lat'], longitude_gd=latlong['lng'])
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
            farm = serializer.save()
            kml = request.FILES.get('kml')
            if kml:
                ext = os.path.splitext(kml.name)[1]
                valid_extensions = ['.kml']
                if not ext.lower() in valid_extensions:
                    return Response({'kml': 'O arquivo precisa ser em formato KML!'}, status=400)
                kml.seek(0) 
                root = parser.parse(kml).getroot()
                coordinates_gd = parse_element_kml(root)
                Imoveis_Rurais_Coordenadas_Matricula.objects.filter(imovel_id=farm.id).delete()
                for latlong in coordinates_gd:
                    Imoveis_Rurais_Coordenadas_Matricula.objects.create(imovel_id=farm.id, latitude_gd=latlong['lat'], longitude_gd=latlong['lng'])
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CARView(viewsets.ModelViewSet):
    queryset = Cadastro_Ambiental_Rural.objects.all()
    serializer_class = detailCAR
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)   
        imovel_term = self.request.query_params.get('imovel', None)
        if search_term:
            queryset = queryset.filter(Q(imovel__nome_imovel__icontains=search_term))
        if imovel_term:
            queryset = queryset.filter(Q(imovel__id=imovel_term))
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return ListCAR
        else:
            return self.serializer_class
        
class SIGEFView(viewsets.ModelViewSet):
    queryset = Certificacao_Sigef_Parcelas.objects.all()
    serializer_class = ListSIGEF
    def get_queryset(self):
        queryset = super().get_queryset()
        imovel_term = self.request.query_params.get('imovel', None)
        if imovel_term:
            queryset = queryset.filter(Q(imovel__id=int(imovel_term)))
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return ListSIGEF
        else:
            return self.serializer_class
    

def download_kml_farm(request, uuid):
    time_now = int(time.time()) #for the file name
    file_name = f"imovel_{time_now}.kml"
    data = Imoveis_Rurais_Coordenadas_Matricula.objects.values().filter(imovel__uuid=uuid)

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


def download_kml_regime(request, uuid):
    time_now = int(time.time()) #for the file name
    file_name = f"Regime_{time_now}.kml"
    data = Regimes_Exploracao_Coordenadas.objects.values().filter(regime__uuid=uuid)

    polygon_coordinates = []
    for coord in data:
        str_coordenada = f"{coord['longitude']},{coord['latitude']}"
        polygon_coordinates.append(str_coordenada)

    first_coordinate = f"{data[0]['longitude']},{data[0]['latitude']}" #first coordinate
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