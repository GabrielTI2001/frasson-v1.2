from django.db.models import Q
from .models import Processos_Outorga, Processos_Outorga_Coordenadas, Tipo_Captacao, Finalidade_APPO, Processos_APPO
from .models import Aquifero_APPO, Processos_APPO_Coordenadas
from .serializers import serializerOutorga, detailOutorga, detailCoordenadaOutorga, serializerCoordenadaOutorga, serializerCaptacao, serializerFinalidade
from .serializers import detailCoordenadaOutorga, CoordenadaOutorga, listAPPO, serializerAquifero, detailAPPO, listCoordenadaAPPO, detailCoordenadaAPPO, CoordenadaAPPO
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
import os
from pykml.factory import KML_ElementMaker as KML
from pykml import parser
from lxml import etree


class OutorgaView(viewsets.ModelViewSet):
    queryset = Processos_Outorga.objects.all()
    serializer_class = detailOutorga
    lookup_field = 'uuid'
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        
        if search_term:
            queryset = queryset.filter(
                Q(nome_requerente__icontains=search_term) |
                Q(cpf_cnpj__icontains=search_term) |
                Q(numero_processo__icontains=search_term) |
                Q(numero_portaria__icontains=search_term) |
                Q(municipio__nome_municipio__icontains=search_term)
            )
        else:
            if self.action == 'list':
                queryset = queryset.order_by('-created_at')[:10]

        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return serializerOutorga
        else:
            return self.serializer_class
        
class CoordenadaOutorgaView(viewsets.ModelViewSet):
    queryset = Processos_Outorga_Coordenadas.objects.all()
    serializer_class = serializerCoordenadaOutorga
    # permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        municipios_oeste = [2908101, 2917359, 2909307, 2928901, 2919553, 2903201, 2926202, 2911105, 2901403, 2907400, 2909703, 2902500, 2930907, 2928109,
        2909109,  2910776, 2907103, 2930154, 2929057, 2930758, 2928208]
        queryset = super().get_queryset()
        processo = self.request.query_params.get('processo', None)
        search = self.request.query_params.get('search', None)

        if processo:
            queryset = queryset.filter(processo_id=processo)
        elif search:
            queryset = queryset.filter(
                Q(processo__nome_requerente__icontains=search) |
                Q(processo__cpf_cnpj__icontains=search) |
                Q(processo__numero_processo__icontains=search) |
                Q(processo__municipio__nome_municipio__icontains=search)
            )
        else:
            queryset = queryset.filter(
                Q(processo__municipio__id__in=municipios_oeste)
            )
        return queryset

class detailCoordenadaOutorgaView(viewsets.ModelViewSet):
    queryset = Processos_Outorga_Coordenadas.objects.all()
    serializer_class = detailCoordenadaOutorga
    # permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('processo', None)
        if search_term:
            queryset = queryset.filter(processo_id=search_term)
        return queryset
    
    def get_serializer_class(self):
        if self.request.query_params.get('infooutorga', None):
            return CoordenadaOutorga
        else:
            return self.serializer_class




class APPOView(viewsets.ModelViewSet):
    queryset = Processos_APPO.objects.all()
    serializer_class = detailAPPO #Esse serializer dá mais informações
    lookup_field = 'uuid'
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        
        if search_term:
            queryset = queryset.filter(
                Q(nome_requerente__icontains=search_term) |
                Q(cpf_cnpj__icontains=search_term) |
                Q(numero_processo__icontains=search_term) |
                Q(municipio__nome_municipio__icontains=search_term)
            )
        else:
            if self.action == 'list':
                queryset = queryset.order_by('-created_at')[:10]

        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return listAPPO
        else:
            return self.serializer_class
        
    def perform_update(self, serializer):
        instance = serializer.instance
        arquivo_antigo = instance.file if hasattr(instance, 'file') else None
        super().perform_update(serializer)
        arquivo_novo = instance.file if hasattr(instance, 'file') else None
        
        # Verificando se o arquivo mudou
        if arquivo_antigo and arquivo_novo and arquivo_antigo != arquivo_novo:
            if os.path.isfile(arquivo_antigo.path):
                os.remove(arquivo_antigo.path)

#Lista as coordenadas, mas com pouca informação
class CoordenadaAPPOView(viewsets.ModelViewSet):
    queryset = Processos_APPO_Coordenadas.objects.all()
    serializer_class = listCoordenadaAPPO
    # permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super().get_queryset()
        processo = self.request.query_params.get('processo', None)
        search = self.request.query_params.get('search', None)

        if processo:
            queryset = queryset.filter(processo_id=processo)
        if search:
            queryset = queryset.filter(
                Q(processo__nome_requerente__icontains=search) |
                Q(processo__cpf_cnpj__icontains=search) |
                Q(processo__numero_processo__icontains=search) |
                Q(processo__municipio__nome_municipio__icontains=search)
            )
        return queryset

class detailCoordenadaAPPOView(viewsets.ModelViewSet):
    queryset = Processos_APPO_Coordenadas.objects.all()
    serializer_class = detailCoordenadaAPPO
    # permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('processo', None)
        if search_term:
            queryset = queryset.filter(processo_id=search_term)
        return queryset
    
    def get_serializer_class(self):
        if self.request.query_params.get('infoappo', None):
            return CoordenadaAPPO
        else:
            return self.serializer_class



class CaptacaoView(viewsets.ModelViewSet):
    queryset = Tipo_Captacao.objects.all()
    serializer_class = serializerCaptacao

class AquiferoView(viewsets.ModelViewSet):
    queryset = Aquifero_APPO.objects.all()
    serializer_class = serializerAquifero

class FinalidadeView(viewsets.ModelViewSet):
    queryset = Finalidade_APPO.objects.all()
    serializer_class = serializerFinalidade

    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)   
        if search_term:
            queryset = queryset.filter(description__icontains=search_term)
        return queryset

def kml_processo_appo(request, id):
    # Create a KML document with a Folder
    if request.method == 'GET':
        doc = KML.kml(
            KML.Document(
                KML.Folder(
                    KML.name("Coordenadas")
                )
            )
        )

        # Retrieve the Folder element
        folder = doc.Document.Folder

        #get coordinates from database Processos Outorga
        processo = Processos_APPO.objects.get(pk=id)
        coordenadas = Processos_APPO_Coordenadas.objects.filter(processo_id=id)
        nome_requerente = processo.nome_requerente.strip().replace(' ', '_')

        #set file name
        file_name = f'APPO_{nome_requerente}.kml'

        coordinates = []
        for coord in coordenadas:
            str_coordenada = str(coord.longitude_gd) + ',' + str(coord.latitude_gd) 
            coordinates.append((str_coordenada, coord.numero_poco))

        # Add a Placemark for each coordinate
        for coordinate, name in coordinates:
            placemark = KML.Placemark(
                KML.name(name),
                KML.Point(
                    KML.coordinates(coordinate)
                )
            )
            folder.append(placemark)

        # Convert to string
        kml_str = etree.tostring(doc, pretty_print=True)

        # Create a response with the KML type
        response = HttpResponse(kml_str, content_type='application/vnd.google-earth.kml+xml')

        # Add a file attachment header
        response['Content-Disposition'] = f'attachment; filename="{file_name}"'

    return response

def kml_processo_outorga(request, id):
    # Create a KML document with a Folder
    doc = KML.kml(
        KML.Document(
            KML.Folder(
                KML.name("Coordenadas")
            )
        )
    )

    folder = doc.Document.Folder

    processo = Processos_Outorga.objects.get(pk=id)
    coordenadas = Processos_Outorga_Coordenadas.objects.filter(processo_id=id)
    nome_requerente = processo.nome_requerente.strip().replace(' ', '_')

    file_name = f'Outorga_{nome_requerente}.kml'

    coordinates = []
    for coord in coordenadas:
        str_coord = f"{coord.longitude_gd},{coord.latitude_gd}" 
        coordinates.append((str_coord, coord.descricao_ponto))

    for coordinate, name in coordinates:
        placemark = KML.Placemark(
            KML.name(name),
            KML.Point(
                KML.coordinates(coordinate)
            )
        )
        folder.append(placemark)

    kml_str = etree.tostring(doc, pretty_print=True)
    response = HttpResponse(kml_str, content_type='application/vnd.google-earth.kml+xml')
    response['Content-Disposition'] = f'attachment; filename="{file_name}"'

    return response

def kml_dashboard_processos_appo(request):
    #cria o arquivo kml dos processos de appo pesquisados
    folders = []
    search = request.GET.get('search')

    # Create a KML document
    doc = KML.kml(
        KML.Document()
    )

    query_search = (Q(nome_requerente__icontains=search) | Q(cpf_cnpj__icontains=search) | Q(numero_processo__icontains=search) | Q(municipio__nome_municipio__icontains=search))
    processos = Processos_APPO.objects.filter(query_search)

    #Creating a list of folders, each with a list of coordinates
    for processo in processos:
        coordenadas = Processos_APPO_Coordenadas.objects.filter(processo_id=processo.id)
        points = []
        for coord in coordenadas:
            str_coordenada = str(coord.longitude_gd) + ',' + str(coord.latitude_gd)
            points.append((str_coordenada, coord.numero_poco))
            
        folders.append({
            "name": str(processo.nome_requerente) + ' (' + processo.numero_processo + ')',
            "points": points 
        })   

    # Create a Folder for each item in the list
    for folder_data in folders:
        folder = KML.Folder(
            KML.name(folder_data["name"])
        )

        # Add a Placemark for each point in the folder
        for coordinate, name in folder_data["points"]:
            placemark = KML.Placemark(
                KML.name(name),
                KML.Point(
                    KML.coordinates(coordinate)
                )
            )
            folder.append(placemark)

        # Add the Folder to the Document
        doc.Document.append(folder)

    # Convert to string
    kml_str = etree.tostring(doc, pretty_print=True)

    # Create a response with the KML type
    response = HttpResponse(kml_str, content_type='application/vnd.google-earth.kml+xml')

    # Add a file attachment header
    response['Content-Disposition'] = 'attachment; filename="Processos_APPO_INEMA.kml"'
    
    return response

def kml_dashboard_processos_outorga(request):
    folders = []
    search = request.GET.get('search')

    # Create a KML document
    doc = KML.kml(
        KML.Document()
    )

    query_search = (Q(nome_requerente__icontains=search) | Q(cpf_cnpj__icontains=search) | Q(numero_processo__icontains=search) | Q(municipio__nome_municipio__icontains=search))
    processos = Processos_Outorga.objects.filter(query_search)

    #Creating a list of folders, each with a list of coordinates
    for processo in processos:
        coordenadas = Processos_Outorga_Coordenadas.objects.filter(processo_id=processo.id)
        points = []
        for coord in coordenadas:
            str_coordenada = f"{coord.longitude_gd},{coord.latitude_gd}"
            points.append((str_coordenada, coord.descricao_ponto))
            
        folders.append({
            "name": f"{processo.nome_requerente} (Portaria {processo.numero_portaria})",
            "points": points
        })   

    # Create a Folder for each item in the list
    for folder_data in folders:
        folder = KML.Folder(
            KML.name(folder_data["name"])
        )

        # Add a Placemark for each point in the folder
        for coordinate, name in folder_data["points"]:
            placemark = KML.Placemark(
                KML.name(name),
                KML.Point(
                    KML.coordinates(coordinate)
                )
            )
            folder.append(placemark)

        # Add the Folder to the Document
        doc.Document.append(folder)

    # Convert to string
    kml_str = etree.tostring(doc, pretty_print=True)

    # Create a response with the KML type
    response = HttpResponse(kml_str, content_type='application/vnd.google-earth.kml+xml')

    # Add a file attachment header
    response['Content-Disposition'] = 'attachment; filename="Processos_Outorga_INEMA.kml"'
    
    return response