from rest_framework import serializers
from farms.models import Imoveis_Rurais, Regimes_Exploracao, Cadastro_Ambiental_Rural, Certificacao_Sigef_Parcelas
from farms.models import Regimes_Exploracao_Coordenadas
from farms.models import Cadastro_Ambiental_Rural_Coordenadas, Certificacao_Sigef_Parcelas_Vertices, Imoveis_Rurais_Coordenadas_Matricula
from datetime import datetime
from backend.settings import TOKEN_GOOGLE_MAPS_API

class ListRegimes(serializers.ModelSerializer):
    atividade_display = serializers.CharField(source='get_atividades_display', read_only=True)
    str_regime = serializers.CharField(source='get_regime_display', read_only=True)
    matricula_imovel = serializers.CharField(source='imovel.matricula', read_only=True)
    nome_imovel = serializers.CharField(source='imovel.nome', read_only=True)
    class Meta:
        model = Regimes_Exploracao
        fields = ['id', 'uuid', 'imovel', 'matricula_imovel', 'nome_imovel', 'str_regime', 'data_inicio', 'data_termino',
                  'area', 'atividade_display']

class detailRegimes(serializers.ModelSerializer):
    str_atividade = serializers.CharField(source='get_atividades_display', read_only=True)
    str_regime = serializers.CharField(source='get_regime_display', read_only=True)
    str_quem_explora = serializers.CharField(source='quem_explora.razao_social', read_only=True)
    str_instituicao = serializers.CharField(source='instituicao.razao_social', read_only=True)
    token_apimaps = serializers.SerializerMethodField(read_only=True)
    farm_data = serializers.SerializerMethodField(read_only=True)
    coordenadas = serializers.SerializerMethodField(read_only=True)
    str_created_by = serializers.SerializerMethodField(read_only=True)
    def get_str_created_by(self, obj):
        return obj.created_by.first_name+' '+obj.created_by.last_name
    def get_coordenadas(self, obj):
        coordenadas = [{'lat':float(c.latitude), 'lng':float(c.longitude), 'id':c.id} for c in Regimes_Exploracao_Coordenadas.objects.filter(regime=obj)]
        return coordenadas
    def get_farm_data(self, obj):
        if obj.imovel:
            return {'uuid':obj.imovel.uuid, 'nome':obj.imovel.nome, 'matricula':obj.imovel.matricula, 'area_total': obj.imovel.area_total, 
                'area_explorada': obj.imovel.area_explorada, 'area_rl':obj.imovel.area_reserva, 'area_app':obj.imovel.area_app,
                'proprietarios': ', '.join([p.razao_social for p in obj.imovel.proprietarios.all()]), 'area_veg_nat':obj.imovel.area_veg_nat,
                'codigo_imovel': obj.imovel.codigo_imovel, 'codigo_car': obj.imovel.codigo_car, 'modulos_fiscais': obj.imovel.modulos_fiscais
            }
    def get_token_apimaps(self, obj):
        return TOKEN_GOOGLE_MAPS_API
    def validate_instrumento_cessao(self, value):
        file = self.initial_data.get('instrumento_cessao')
        file_name = file.name.lower()
        if not file_name.endswith('.pdf'):
            raise serializers.ValidationError("Arquivo deve ser em formato PDF!")
        return value
    def validate_data_termino(self, value):
        data_inicio = self.initial_data.get('data_inicio')
        data_inicio  = datetime.strptime(data_inicio, "%Y-%m-%d").date()
        if (data_inicio and value) and (data_inicio > value):
            raise serializers.ValidationError("A Data de Término não pode ser menor que a Data de Início.")
        return value
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name in ['regime', 'data_inicio', 'instituicao', 'imovel', 'quem_explora', 'atividades', 'area']:
                    field.required = True
        else:
            for field_name, field in self.fields.items():
                field.required = False
            
    class Meta:
        model = Regimes_Exploracao
        fields = '__all__'

class listFarms(serializers.ModelSerializer):
    str_proprietarios = serializers.SerializerMethodField(read_only=True)
    municipio_localizacao = serializers.SerializerMethodField(read_only=True)
    def get_str_proprietarios(self, obj):
        return ', '.join([p.razao_social for p in obj.proprietarios.all()])
    def get_municipio_localizacao(self, obj):
        return obj.municipio.nome_municipio + ' - ' + obj.municipio.sigla_uf
    class Meta:
        model = Imoveis_Rurais
        fields = ['id', 'uuid', 'matricula', 'nome', 'str_proprietarios', 'municipio_localizacao', 'area_total']

class detailFarms(serializers.ModelSerializer):
    str_proprietarios = serializers.SerializerMethodField(read_only=True)
    str_localizacao_reserva = serializers.CharField(source='get_localizacao_reserva_display', read_only=True)
    str_cartorio = serializers.CharField(source='cartorio_registro.razao_social', read_only=True)
    municipio_localizacao = serializers.SerializerMethodField(read_only=True)
    coordenadas_matricula = serializers.SerializerMethodField(read_only=True)
    coordenadas_car = serializers.SerializerMethodField(read_only=True)
    parcelas_sigef = serializers.SerializerMethodField(read_only=True)
    token_apimaps = serializers.SerializerMethodField(read_only=True)
    str_created_by = serializers.SerializerMethodField(read_only=True)
    def get_str_created_by(self, obj):
        return obj.created_by.first_name+' '+obj.created_by.last_name
    def get_str_proprietarios(self, obj):
        return [{'id':p.id, 'razao_social':p.razao_social} for p in obj.proprietarios.all()]
    def get_municipio_localizacao(self, obj):
        return obj.municipio.nome_municipio + ' - ' + obj.municipio.sigla_uf
    def get_coordenadas_matricula(self, obj):
        coordenadas = [{'lat':float(c.latitude_gd), 'lng':float(c.longitude_gd), 'id':c.id} for c in Imoveis_Rurais_Coordenadas_Matricula.objects.filter(imovel=obj)]
        return coordenadas
    def get_coordenadas_car(self, obj):
        return True if obj.car else False
    def get_parcelas_sigef(self, obj):
        parcelas = Certificacao_Sigef_Parcelas.objects.filter(imovel_id=obj.id).count()
        return True if parcelas > 0 else False
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name in ['nome', 'matricula', 'municipio', 'proprietarios', 'endereco', 'codigo_car', 'area_total']:
                    field.required = True
                else:
                    field.required = False
        else:
            for field_name, field in self.fields.items():
                field.required = False
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