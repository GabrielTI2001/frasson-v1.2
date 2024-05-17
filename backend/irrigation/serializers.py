from rest_framework import serializers
from .models import Cadastro_Pivots, Fabricantes_Pivots, Fabricantes_Bombas
from backend.frassonUtilities import Frasson
from backend.pipefyUtils import getTableRecordPipefy
import locale, requests, json, math
from datetime import date, timedelta
from backend.settings import TOKEN_GOOGLE_MAPS_API

class listPivots(serializers.ModelSerializer):
    str_proprietario = serializers.CharField(source='proprietario.razao_social', read_only=True)
    str_fabricante = serializers.CharField(source='fabricante_pivot.nome_fabricante', read_only=True)
    str_municipio = serializers.SerializerMethodField(read_only=True)
    def get_str_municipio(self, obj):
        return f"{obj.municipio_localizacao.nome_municipio} - {obj.municipio_localizacao.sigla_uf}"
    class Meta:
        model = Cadastro_Pivots
        fields = ['id', 'uuid', 'str_proprietario', 'propriedade_localizacao', 'identificacao_pivot', 'area_circular_ha', 
                  'lamina_bruta_21_h', 'str_fabricante', 'str_municipio', 'long_center_gd', 'lat_center_gd']


class pointPivots(serializers.ModelSerializer):
    class Meta:
        model = Cadastro_Pivots
        fields = ['id', 'long_center_gd', 'lat_center_gd', 'raio_irrigado_m']
        
class detailPivots(serializers.ModelSerializer):
    str_proprietario = serializers.CharField(source='proprietario.razao_social', read_only=True)
    str_fabricante = serializers.CharField(source='fabricante_pivot.nome_fabricante', read_only=True)
    str_fabricante_bomba = serializers.CharField(source='fabricante_bomba.nome_fabricante', read_only=True)
    str_municipio = serializers.SerializerMethodField(read_only=True)
    token_apimaps = serializers.SerializerMethodField(read_only=True, required=False)
    def get_token_apimaps(self, obj):
        return TOKEN_GOOGLE_MAPS_API
    def get_str_municipio(self, obj):
        return f"{obj.municipio_localizacao.nome_municipio} - {obj.municipio_localizacao.sigla_uf}"
    def validate_file(self, value):
        file = self.initial_data.get('file')
        file_name = file.name.lower()
        if not file_name.endswith('.pdf'):
            raise serializers.ValidationError("Arquivo deve ser em formato PDF!")
        return value
    def save(self, **kwargs):
        instance = super().save(**kwargs)
        area_circular = self.validated_data.get('area_circular_ha')
        lamina_bruta = self.validated_data.get('lamina_bruta_21_h')
        instance.raio_irrigado_m = round(math.sqrt(float(area_circular) * 10000 / math.pi), 2) #calculando o raio irrigado
        instance.vazao_total_m3_h = round(float(area_circular) * 10 * float(lamina_bruta) / 21, 2) #calculando a vazão
        instance.save()
        return instance
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['proprietario', 'propriedade_localizacao', 'municipio_localizacao', 'identificacao_pivot', 'fabricante_pivot', 
            'area_circular_ha', 'lamina_bruta_21_h', 'lat_center_gd', 'long_center_gd', 'fabricante_bomba', 'pot_motor_cv']:
                field.required = True
    class Meta:
        model = Cadastro_Pivots
        fields = '__all__'

class listFabricantesPivots(serializers.ModelSerializer):
    class Meta:
        model = Fabricantes_Pivots
        fields = ['id', 'nome_fabricante']

class listFabricantesBombas(serializers.ModelSerializer):
    class Meta:
        model = Fabricantes_Bombas
        fields = ['id', 'nome_fabricante']