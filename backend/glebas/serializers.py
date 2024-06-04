from rest_framework import serializers
from .models import Glebas_Areas, Glebas_Coordenadas
from datetime import datetime
import requests, json, locale, re, os
from backend.settings import TOKEN_PIPEFY_API, URL_PIFEFY_API, MEDIA_URL, TOKEN_GOOGLE_MAPS_API
from users.models import Profile
from pykml import parser
from rest_framework.exceptions import ValidationError

def parse_element_kml(element):
    coordinates = []
    for child in element.getchildren():
        if hasattr(child, 'Polygon'):
            #get only first child of tag polygon
            coords = str(child[0].Polygon.outerBoundaryIs.LinearRing.coordinates).strip().split()
            for coord in coords:
                coordinates.append({'lat': coord.split(",")[1], 'lng': coord.split(",")[0]})
            break
        else:
            # Recursively handle complex elements like Placemark or Folder
            coordinates.extend(parse_element_kml(child))

    return coordinates

class listGlebas(serializers.ModelSerializer):
    str_cliente = serializers.CharField(source='cliente.razao_social', required=False, read_only=True)
    list_propriedades = serializers.SerializerMethodField(read_only=True)
    str_municipio = serializers.SerializerMethodField(read_only=True)
    def get_list_propriedades(self, obj):
        return ', '.join([fazenda.nome_imovel for fazenda in obj.propriedade.all()])
    
    def get_str_municipio(self, obj):
        return f"{obj.municipio.nome_municipio} - {obj.municipio.sigla_uf}" if obj.municipio else '-'

    class Meta:
        model = Glebas_Areas
        fields = ['id', 'str_cliente', 'list_propriedades', 'gleba', 'str_municipio', 'area']

class detailGleba(serializers.ModelSerializer):
    str_cliente = serializers.CharField(source='cliente.razao_social', required=False, read_only=True)
    list_propriedades = serializers.SerializerMethodField(read_only=True)
    str_municipio = serializers.SerializerMethodField(read_only=True)

    def get_list_propriedades(self, obj):
        return [{
            'value': p.id,
            'label': p.nome_imovel,
        } for p in obj.propriedade.all()]
    
    def get_str_municipio(self, obj):
        return f"{obj.municipio.nome_municipio} - {obj.municipio.sigla_uf}" if obj.municipio else ''
    
    def save(self, **kwargs):
        instance = super().save(**kwargs)
        request = self.context.get('request')
        if request and request.FILES:
            kml_file = request.FILES.get('kml')
            if kml_file:
                kml_file.seek(0)
                root = parser.parse(kml_file).getroot().Document
                coordinates = parse_element_kml(root)
                gleba_instance = Glebas_Areas.objects.get(id=instance.id)
                glebas_coordenadas_list = [
                    Glebas_Coordenadas(
                        gleba=gleba_instance,
                        latitude_gd=coordinate['lat'],
                        longitude_gd=coordinate['lng']
                    )
                    for coordinate in coordinates
                ]
                Glebas_Coordenadas.objects.bulk_create(glebas_coordenadas_list)
        return instance
    
    def validate(self, data):
        request = self.context.get('request')
        if request and request.FILES:
            kml_file = request.FILES.get('kml')
            if kml_file:
                file_extension = os.path.splitext(kml_file.name)[1]
                if file_extension.lower() != '.kml':
                    raise ValidationError("O arquivo deve ser em formato KML!")
        return data
    class Meta:
        model = Glebas_Areas
        fields = '__all__'
        
class GlebasCoordenadas(serializers.ModelSerializer):
    coordenadas = serializers.SerializerMethodField(read_only=True)
    def get_coordenadas(self, obj):
        query = Glebas_Coordenadas.objects.filter(gleba=obj)
        return [{'id':q.id, 'lat':q.latitude_gd, 'lng':q.longitude_gd } for q in query]
    class Meta:
        model = Glebas_Areas
        fields = ['id', 'coordenadas']