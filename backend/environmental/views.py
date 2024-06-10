from django.db.models import Q, Subquery
from .models import Processos_Outorga, Processos_Outorga_Coordenadas, Tipo_Captacao, Finalidade_APPO, Processos_APPO
from .models import Aquifero_APPO, Processos_APPO_Coordenadas, Processos_ASV, Empresas_Consultoria
from cadastro.models import Municipios
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse, JsonResponse
import os
from pykml.factory import KML_ElementMaker as KML
from pykml import parser
from lxml import etree
from pyproj import Proj, transform
from pyproj import Transformer
from PyPDF2 import PdfReader
import re
import tempfile
from django.views.decorators.csrf import csrf_exempt

class OutorgaView(viewsets.ModelViewSet):
    queryset = Processos_Outorga.objects.all()
    serializer_class = detailOutorga
    lookup_field = 'uuid'
    # permission_classes = (IsAuthenticated,)
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
    permission_classes = (IsAuthenticated,)
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
    permission_classes = (IsAuthenticated,)
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
    permission_classes = (IsAuthenticated,)
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
    permission_classes = (IsAuthenticated,)
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



class ASVView(viewsets.ModelViewSet):
    queryset = Processos_ASV.objects.all()
    serializer_class = detailASV
    lookup_field = 'uuid'
    # permission_classes = (IsAuthenticated,)
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(requerente__icontains=search) | Q(cpf_cnpj__icontains=search) | Q(municipio__nome_municipio__icontains=search) |
                Q(processo__icontains=search) | Q(empresa__razao_social__icontains=search) | Q(tecnico__icontains=search)
            )
        else:
            if self.action == 'list':
                queryset = queryset.order_by('-created_at')[:20]
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listASV
        else:
            return self.serializer_class

class AreasASVView(viewsets.ModelViewSet):
    queryset = Processos_ASV_Areas.objects.all()
    serializer_class = listAreasASV
    # permission_classes = (IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)
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
                Q(processo__requerente__icontains=search) |
                Q(processo__cpf_cnpj__icontains=search) |
                Q(processo__processo__icontains=search) |
                Q(processo__municipio__nome_municipio__icontains=search)
            )
        # else:
        #     queryset = queryset.filter(
        #         Q(processo__municipio__id__in=municipios_oeste)
        #     )
        return queryset
    
class detailAreaASVView(viewsets.ModelViewSet):
    queryset = Processos_ASV_Areas.objects.all()
    serializer_class = detailAreasASV
    # permission_classes = (IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('processo', None)
        if search_term:
            queryset = queryset.filter(processo_id=search_term)
        return queryset



class RequerimentoAPPOView(viewsets.ModelViewSet):
    queryset = Requerimentos_APPO.objects.all()
    serializer_class = detailRequerimentosAPPO
    lookup_field = 'uuid'
    # permission_classes = (IsAuthenticated,)
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        
        if search_term:
            queryset = queryset.filter(
                Q(nome_requerente__icontains=search_term) | Q(cpf_cnpj__icontains=search_term) |
                Q(numero_processo__icontains=search_term) | Q(numero_requerimento__icontains=search_term) | 
                Q(municipio__nome_municipio__icontains=search_term) | Q(email__icontains=search_term)
            )
        else:
            if self.action == 'list':
                queryset = queryset.order_by('-created_at')
        return queryset.exclude(numero_processo__in=Subquery(Processos_APPO.objects.values('numero_processo')))
    def get_serializer_class(self):
        if self.action == 'list':
            return listRequerimentosAPPO
        else:
            return self.serializer_class

class CoordenadaRequerimentoAPPOView(viewsets.ModelViewSet):
    queryset = Requerimentos_APPO_Coordenadas.objects.all()
    serializer_class = listCoordenadaRequerimentoAPPO
    # permission_classes = (IsAuthenticated,)
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        processo = self.request.query_params.get('processo', None)
        
        if processo:
            queryset = queryset.filter(requerimento_id=processo)
        if search:
            queryset = queryset.filter(
                Q(requerimento__nome_requerente__icontains=search) | Q(requerimento__cpf_cnpj__icontains=search) |
                Q(requerimento__numero_processo__icontains=search) | Q(requerimento__municipio__nome_municipio__icontains=search) |
                Q(requerimento__email__icontains=search) | Q(requerimento__numero_requerimento__icontains=search)
            )
        return queryset.exclude(requerimento__numero_processo__in=Subquery(Processos_APPO.objects.values('numero_processo')))

class detailCoordenadaRequerimentoAPPOView(viewsets.ModelViewSet):
    queryset = Requerimentos_APPO_Coordenadas.objects.all()
    serializer_class = detailCoordenadaRequerimentoAPPO
    # permission_classes = (IsAuthenticated,)
    def get_queryset(self):
        queryset = super().get_queryset()
        processo = self.request.query_params.get('processo', None)
        if processo:
            queryset = queryset.filter(processo_id=processo)
        return queryset


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

class EmpresaView(viewsets.ModelViewSet):
    queryset = Empresas_Consultoria.objects.all()
    serializer_class = listEmpresa
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)   
        if search_term:
            queryset = queryset.filter(razao_social__icontains=search_term)
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



def kml_processo_asv(request, id):
    folders = []
    areas = Processos_ASV_Areas.objects.filter(processo=id)
    file_name = Processos_ASV.objects.get(pk=id).portaria
    for area in areas:
        kml_file = area.file
        kml_file.seek(0)
        root = parser.parse(kml_file).getroot().Document
        coordinates = parse_element_kml(root)

        folders.append({
            "name": area.identificacao_area,
            "area": area.area_total,
            "points": coordinates
        })
        kml_file.close() #close kml file

    # Create a KML document
    doc = KML.kml(
        KML.Document()
    )
    for folder_data in folders:
        folder = KML.Folder(
            KML.name(folder_data["name"])
        )
        # Define coordinates for a Polygon
        coord_str = []
        for coord in folder_data["points"]:
            str_coord = f"{coord['lng']},{coord['lat']}"
            coord_str.append(str_coord)
        coordenadas_poligono = " ".join(coord_str)
        # Create Polygon from coordinates
        polygon_placemark = KML.Placemark(
            KML.name(f"{folder_data['area']} ha"),
            KML.Polygon(
                KML.extrude(0),
                KML.altitudeMode('clampToGround'),
                KML.outerBoundaryIs(
                    KML.LinearRing(
                        KML.coordinates(coordenadas_poligono)
                    )
                )
            )
        )  
        folder.append(polygon_placemark)
        doc.Document.append(folder)
    # Convert to string
    kml_str = etree.tostring(doc, pretty_print=True)
    # Create a response with the KML type
    response = HttpResponse(kml_str, content_type='application/vnd.google-earth.kml+xml')
    # Add a file attachment header
    response['Content-Disposition'] = f'attachment; filename="Portaria {file_name}.kml"'
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

@csrf_exempt
def requerimentos_appo_read_pdf(request):
    initial_data = {}
    if request.method == "POST":
        file = request.FILES.get('file')
        if not file:
            return JsonResponse({'file':'Submeta um Arquivo'}, status=400)
        if not file.name.endswith('.pdf'):
            return JsonResponse({'file':'O arquivo deve ser em formato PDF'}, status=400)
        # Create a temporary file to save the uploaded file
        with tempfile.NamedTemporaryFile(delete=False) as temp:
            for chunk in file.chunks():
                temp.write(chunk)
            temp_path = temp.name
        temp.close()
        # Initialize a file reader object
        with open(temp_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            # Get the total number of pages
            number_of_pages = len(pdf_reader.pages)
            # Initialize a variable to store the text
            text_content = ""
            #Iterate through each page and extract text
            for page_number in range(number_of_pages):
                page = pdf_reader.pages[page_number]
                text_content += page.extract_text()
            #print(text_content)
            coordinates = []
            if "Deseja autorização para perfuração de poço? SIM" in text_content: #se é arquivo pdf com requerimento APPO
                transformer = Transformer.from_crs(
                    {"proj": 'utm', "zone": 23, "south": True, "datum": 'WGS84'},
                    {"proj": 'latlong', "datum": 'WGS84'},
                    always_xy=True
                )
                match_data_solicitacao = re.search(r'Data da Solicitação: (\d+ [a-zA-Z]+ \d+)', text_content)
                if match_data_solicitacao:
                    date_str = match_data_solicitacao.group(1)
                    # Convert to datetime object and then to yyyy-mm-dd format
                    date_obj = datetime.strptime(date_str, '%d %B %Y')
                    formatted_date = datetime.strftime(date_obj, '%Y-%m-%d')
                    initial_data['data_requerimento'] = formatted_date
                
                match_requerimento = re.search(r'\d{4}\.\d{3}\.\d{6}\/INEMA\/REQ', text_content)
                if match_requerimento:
                    numero_requerimento  = match_requerimento.group(0)  # Return the found pattern
                    initial_data['numero_requerimento'] = numero_requerimento

                busca_pessoa_text = text_content[:300]
                if "Pessoa Física" in busca_pessoa_text:
                    match_pessoa_fisica = re.search(r'(?:[A-Z]{2} Cidade:)(.+?)(?:\nNaturalidade Nacionalidade:)', text_content)
                    if match_pessoa_fisica:
                        pessoa_fisica =  match_pessoa_fisica.group(1).strip()
                        initial_data['nome_requerente'] = pessoa_fisica
                    
                    match_cpf = re.search(r'\d{3}\.\d{3}\.\d{3}-\d{2}', text_content)
                    if match_cpf:
                        cpf =  match_cpf.group(0)
                        initial_data['cpf_cnpj'] = cpf

                elif "Razão Social" in busca_pessoa_text:
                    match_pessoa_juridica = re.search(r'Razão Social: ([\d./-]+) (.*?)CNPJ:', text_content, re.DOTALL)
                    if match_pessoa_juridica:
                        pessoa_juridica =  match_pessoa_juridica.group(2)
                        initial_data['nome_requerente'] = pessoa_juridica
                    
                    match_cnpj = re.search(r'Razão Social: ([\d./-]+) (.*?)[\s\n]*CNPJ:', text_content, re.DOTALL)
                    if match_cnpj:
                        cnpj =  match_cnpj.group(1)
                        initial_data['cpf_cnpj'] = cnpj

                start_idx = text_content.find("Dados do Empreendimento")
                email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text_content[start_idx:])
                if email_match:
                    email = email_match.group()  # Return the first email found
                    initial_data['email'] = email

                    if "frasson" in email:
                        initial_data['frasson'] = True
                    else:
                        initial_data['frasson'] = False

                match_municipio = re.search(r'Bairro/Distrito:\s*([\w\s]+)\s*(BA)UF:', text_content[start_idx:])
                if match_municipio:
                    location = match_municipio.group(1).strip()
                    state = match_municipio.group(2)
                    initial_data['municipio'] = 1
                    initial_data['str_municipio'] = 'Posse - GO'
                    # municipio_id = Municipios.objects.get(sigla_uf=state, nome_municipio__icontains=location).id
                    # initial_data['municipio'] = municipio_id

                # Regex to find projection coordinates
                matches_projection = re.findall(r'(\d{7,8}\.\d+)\s+(\d{6}\.\d+)', text_content)
                if matches_projection:
                    for latitude, longitude in matches_projection:
                        transformed_lng, transformed_lat = transformer.transform(float(longitude), float(latitude))
                        coordinates.append({'lat': transformed_lat, 'lng': transformed_lng})
                # Regex to find decimal coordinates
                matches_decimal = re.findall(r'(-?\d{1,3}\.\d+)\s+(-?\d{1,3}\.\d+)', text_content)
                if matches_decimal:
                    for i, (latitude, longitude) in enumerate(matches_decimal):
                        coordinates.append({
                            'ponto': i + 1,
                            'latitude_gd': float(latitude), 
                            'longitude_gd': float(longitude), 
                            'lat_gms': Frasson.convert_dd_to_dms(lat=float(latitude)),
                            'lng_gms': Frasson.convert_dd_to_dms(long=float(longitude))
                        })
                initial_data['coordinates'] = coordinates
    return JsonResponse(initial_data)


def kml_requerimento_appo(request, id):
    # Create a KML document with a Folder
    doc = KML.kml(
        KML.Document(
            KML.Folder(
                KML.name("Coordenadas")
            )
        )
    )

    # Retrieve the Folder element
    folder = doc.Document.Folder

    #get coordinates from database Requerimentos
    requerimento = Requerimentos_APPO.objects.get(pk=id)
    coordenadas = Requerimentos_APPO_Coordenadas.objects.filter(requerimento_id=id)
    nome_requerente = requerimento.nome_requerente.strip().replace(' ', '_')

    #set file name
    file_name = f'Requerimento_{nome_requerente}.kml'

    coordinates = []
    for coord in coordenadas:
        str_coord = f"{coord.longitude_gd}, {coord.latitude_gd}" 
        coordinates.append((str_coord, coord.numero_poco))

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


def kml_mapa_requerimento_appo(request):
    #download do kml dos requerimentos da busca
    folders = []
    search = request.GET.get('search')
    # Create a KML document
    doc = KML.kml(
        KML.Document()
    )

    query_search = (Q(nome_requerente__icontains=search) | Q(cpf_cnpj__icontains=search) | Q(numero_processo__icontains=search) | 
        Q(numero_requerimento__icontains=search) | Q(email__icontains=search) | Q(municipio__nome_municipio__icontains=search))
    requerimentos = Requerimentos_APPO.objects.exclude(numero_processo__in=Subquery(Processos_APPO.objects.values('numero_processo'))).filter(query_search)

    #Creating a list of folders, each with a list of coordinates
    for requerimento in requerimentos:
        coordenadas = Requerimentos_APPO_Coordenadas.objects.exclude(requerimento__numero_processo__in=Subquery(Processos_APPO.objects.values('numero_processo'))).filter(requerimento=requerimento.id)
        points = []
        for coord in coordenadas:
            str_coordenada = str(coord.longitude_gd) + ',' + str(coord.latitude_gd)
            points.append((str_coordenada, coord.numero_poco))
            
        folders.append({
            "name": f"{requerimento.nome_requerente} ({requerimento.numero_requerimento})",
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
    response['Content-Disposition'] = 'attachment; filename="Requerimentos_INEMA.kml"'
    
    return response