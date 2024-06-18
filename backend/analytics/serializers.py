from rest_framework import serializers
from pipefy.models import Regimes_Exploracao, Imoveis_Rurais, Cadastro_Ambiental_Rural_Coordenadas, Certificacao_Sigef_Parcelas
from pipefy.models import Certificacao_Sigef_Parcelas_Vertices, Cadastro_Ambiental_Rural
from backend.frassonUtilities import Frasson
from backend.pipefyUtils import getTableRecordPipefy
import locale, requests, json
from backend.settings import TOKEN_GOOGLE_MAPS_API, TOKEN_PIPEFY_API, URL_PIFEFY_API

class ListRegimes(serializers.ModelSerializer):
    matricula_imovel = serializers.CharField(source='imovel.matricula_imovel', read_only=True)
    nome_imovel = serializers.CharField(source='imovel.nome_imovel', read_only=True)
    class Meta:
        model = Regimes_Exploracao
        fields = ['id', 'imovel', 'matricula_imovel', 'nome_imovel', 'regime', 'atividades_exploradas', 'data_inicio', 'data_termino',
                  'area_explorada']

class detailRegimes(serializers.ModelSerializer):
    token_apimaps = serializers.SerializerMethodField(read_only=True)
    regime_data = serializers.SerializerMethodField(read_only=True)
    farm_data = serializers.SerializerMethodField(read_only=True)
    def get_token_apimaps(self, obj):
        return TOKEN_GOOGLE_MAPS_API
    def get_regime_data(self, obj):
        data_regime = getTableRecordPipefy(obj.id)
        return data_regime
    def get_farm_data(self, obj):
        data_farm = getTableRecordPipefy(obj.imovel.id)  
        return data_farm
    class Meta:
        model = Regimes_Exploracao
        fields = '__all__'

class listFarms(serializers.ModelSerializer):
    str_proprietario = serializers.CharField(source='proprietario.razao_social', read_only=True)
    class Meta:
        model = Imoveis_Rurais
        fields = ['id', 'matricula_imovel', 'nome_imovel', 'str_proprietario', 'municipio_localizacao', 'area_total']

class detailFarms(serializers.ModelSerializer):
    str_proprietario = serializers.CharField(source='proprietario.razao_social', read_only=True)
    kml = serializers.SerializerMethodField(read_only=True)
    coordenadas_car = serializers.SerializerMethodField(read_only=True)
    parcelas_sigef = serializers.SerializerMethodField(read_only=True)
    token_apimaps = serializers.SerializerMethodField(read_only=True)
    def get_coordenadas_car(self, obj):
        car = Cadastro_Ambiental_Rural_Coordenadas.objects.filter(car__imovel_id=obj.id).count()
        return True if car > 0 else False
    def get_parcelas_sigef(self, obj):
        parcelas = Certificacao_Sigef_Parcelas.objects.filter(imovel_id=obj.id).count()
        return True if parcelas > 0 else False
    def get_kml(self, obj):
        kml = None
        payload = {"query":"{table_record (id:" + str(obj.id) + ") {record_fields{native_value field{id}}}}"}
        headers = {"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"}
        response = requests.post(URL_PIFEFY_API, json=payload, headers=headers)
        obj = json.loads(response.text)
        record_fields = obj["data"]["table_record"]["record_fields"] 
        for field in record_fields:
            field_id = field["field"]["id"]
            if field_id == "kml_da_matr_cula":
                kml = field["native_value"]
        return kml
    def get_token_apimaps(self, obj):
        return TOKEN_GOOGLE_MAPS_API
    class Meta:
        model = Imoveis_Rurais
        fields = '__all__'


class ListCAR(serializers.ModelSerializer):
    coordenadas = serializers.SerializerMethodField(read_only=True)
    def get_coordenadas(self, obj):
        coordenadas = Cadastro_Ambiental_Rural_Coordenadas.objects.filter(car=obj)
        coordenadas_car = [{
            "id": coord.id,
            "lat": float(coord.latitude),
            "lng": float(coord.longitude)
        }for coord in coordenadas]
        return coordenadas_car
    class Meta:
        model = Cadastro_Ambiental_Rural
        fields = ['id', 'coordenadas', 'area_imovel']

class detailCAR(serializers.ModelSerializer):
    str_imovel = serializers.CharField(source='imovel.nome_imovel', read_only=True)
    str_proprietario = serializers.CharField(source='imovel.proprietario.razao_social', read_only=True)
    str_cpf_cnpj = serializers.CharField(source='imovel.proprietario.cpf_cnpj', read_only=True)
    class Meta:
        model = Cadastro_Ambiental_Rural
        fields = '__all__'

class ListSIGEF(serializers.ModelSerializer):
    coordenadas = serializers.SerializerMethodField(read_only=True)
    def get_coordenadas(self, obj):
        coordenadas = Certificacao_Sigef_Parcelas_Vertices.objects.filter(parcela=obj)
        coordenadas_car = [{
            "id": coord.id,
            "lat": float(coord.latitude),
            "lng": float(coord.longitude)
        }for coord in coordenadas]
        return coordenadas_car
    class Meta:
        model = Certificacao_Sigef_Parcelas
        fields = ['id', 'coordenadas']