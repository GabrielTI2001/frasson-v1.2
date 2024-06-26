from rest_framework import serializers
from .models import Cadastro_Glebas, Cadastro_Glebas_Coordenadas
from cadastro.models import Culturas_Agricolas
import os
from backend.settings import TOKEN_GOOGLE_MAPS_API
from pykml import parser
from rest_framework.exceptions import ValidationError

class listGlebas(serializers.ModelSerializer):
    str_cliente = serializers.CharField(source='cliente.razao_social', required=False, read_only=True)
    list_propriedades = serializers.SerializerMethodField(read_only=True)
    str_municipio = serializers.SerializerMethodField(read_only=True)
    def get_list_propriedades(self, obj):
        return ', '.join([fazenda.nome+' - '+fazenda.matricula for fazenda in obj.propriedades.all()])
    
    def get_str_municipio(self, obj):
        return f"{obj.propriedades.all()[0].municipio.nome_municipio} - {obj.propriedades.all()[0].municipio.sigla_uf}"

    class Meta:
        model = Cadastro_Glebas
        fields = ['id', 'uuid', 'str_cliente', 'list_propriedades', 'gleba', 'str_municipio', 'area']

class detailGleba(serializers.ModelSerializer):
    str_cliente = serializers.CharField(source='cliente.razao_social', required=False, read_only=True)
    list_propriedades = serializers.SerializerMethodField(read_only=True)
    str_municipio = serializers.SerializerMethodField(read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name not in ['str_cliente', 'str_municipio', 'list_propriedades', 'descricao']:
                field.required = True

    def get_list_propriedades(self, obj):
        return [{
            'value': p.id,
            'label': p.nome+' - '+p.matricula,
        } for p in obj.propriedades.all()]
    
    def get_str_municipio(self, obj):
        return f"{obj.propriedades.all()[0].municipio.nome_municipio} - {obj.propriedades.all()[0].municipio.sigla_uf}"
    
    class Meta:
        model = Cadastro_Glebas
        fields = '__all__'

class GlebasCoordenadas(serializers.ModelSerializer):
    coordenadas = serializers.SerializerMethodField(read_only=True)
    def get_coordenadas(self, obj):
        query = Cadastro_Glebas_Coordenadas.objects.filter(gleba=obj)
        return [{'id':q.id, 'lat':q.latitude_gd, 'lng':q.longitude_gd } for q in query]
    class Meta:
        model = Cadastro_Glebas
        fields = ['id', 'coordenadas']

class detailGlebasCoordenadas(serializers.ModelSerializer):
    coordenadas = serializers.SerializerMethodField(read_only=True)
    str_cliente = serializers.CharField(source='cliente.razao_social', required=False, read_only=True)
    list_propriedades = serializers.SerializerMethodField(read_only=True)
    str_municipio = serializers.SerializerMethodField(read_only=True)
    token_apimaps = serializers.SerializerMethodField(read_only=True, required=False)
    
    def get_list_propriedades(self, obj):
        return ', '.join([fazenda.nome for fazenda in obj.propriedades.all()])
    def get_str_municipio(self, obj):
        return f"{obj.propriedades.all()[0].municipio.nome_municipio} - {obj.propriedades.all()[0].municipio.sigla_uf}"
    def get_coordenadas(self, obj):
        query = Cadastro_Glebas_Coordenadas.objects.filter(gleba=obj)
        return [{'id':q.id, 'lat':q.latitude_gd, 'lng':q.longitude_gd } for q in query]
    def get_token_apimaps(self, obj):
        return TOKEN_GOOGLE_MAPS_API
    
    class Meta:
        model = Cadastro_Glebas
        fields = '__all__'

class listCulturas(serializers.ModelSerializer):
    class Meta:
        model = Culturas_Agricolas
        fields = ['id', 'cultura']