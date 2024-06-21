from rest_framework import serializers
from farms.models import Imoveis_Rurais, Regimes_Exploracao, Cadastro_Ambiental_Rural, Certificacao_Sigef_Parcelas, Cadastro_Ambiental_Rural_Coordenadas, Certificacao_Sigef_Parcelas_Vertices
from backend.frassonUtilities import Frasson
import locale, requests, json
from backend.settings import TOKEN_GOOGLE_MAPS_API

class ListRegimes(serializers.ModelSerializer):
    atividade_display = serializers.CharField(source='get_atividades_display', read_only=True)
    matricula_imovel = serializers.CharField(source='imovel.matricula', read_only=True)
    nome_imovel = serializers.CharField(source='imovel.nome', read_only=True)
    class Meta:
        model = Regimes_Exploracao
        fields = ['id', 'imovel', 'matricula_imovel', 'nome_imovel', 'regime', 'data_inicio', 'data_termino',
                  'area', 'atividade_display']

class detailRegimes(serializers.ModelSerializer):
    token_apimaps = serializers.SerializerMethodField(read_only=True)
    def get_token_apimaps(self, obj):
        return TOKEN_GOOGLE_MAPS_API
    class Meta:
        model = Regimes_Exploracao
        fields = '__all__'

class listFarms(serializers.ModelSerializer):
    str_proprietarios = serializers.SerializerMethodField(read_only=True)
    municipio_localizacao = serializers.CharField(source='municipio.nome_municipio', read_only=True)
    def get_str_proprietarios(self, obj):
        return ', '.join([p.razao_social for p in obj.proprietarios.all()])
    def get_municipio_localizacao(self, obj):
        return obj.municipio.nome_municipio + ' - ' + obj.municipio.sigla_uf
    class Meta:
        model = Imoveis_Rurais
        fields = ['id', 'matricula', 'nome', 'str_proprietarios', 'municipio_localizacao', 'area_total']

class detailFarms(serializers.ModelSerializer):
    str_proprietario = serializers.CharField(source='proprietario.razao_social', read_only=True)
    # kml = serializers.SerializerMethodField(read_only=True)
    coordenadas_car = serializers.SerializerMethodField(read_only=True)
    parcelas_sigef = serializers.SerializerMethodField(read_only=True)
    token_apimaps = serializers.SerializerMethodField(read_only=True)
    def get_coordenadas_car(self, obj):
        return True if obj.car else False
    def get_parcelas_sigef(self, obj):
        parcelas = Certificacao_Sigef_Parcelas.objects.filter(imovel_id=obj.id).count()
        return True if parcelas > 0 else False
    # def get_kml(self, obj):
    #     kml = None
    #     payload = {"query":"{table_record (id:" + str(obj.id) + ") {record_fields{native_value field{id}}}}"}
    #     headers = {"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"}
    #     response = requests.post(URL_PIFEFY_API, json=payload, headers=headers)
    #     obj = json.loads(response.text)
    #     record_fields = obj["data"]["table_record"]["record_fields"] 
    #     for field in record_fields:
    #         field_id = field["field"]["id"]
    #         if field_id == "kml_da_matr_cula":
    #             kml = field["native_value"]
    #     return kml
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