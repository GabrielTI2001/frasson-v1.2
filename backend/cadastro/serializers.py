from rest_framework import serializers
from .models import Municipios, Maquinas_Equipamentos, Benfeitorias_Fazendas, Tipo_Benfeitorias, Pictures_Benfeitorias, Analise_Solo
from .models import Agencias_Bancarias
from backend.frassonUtilities import Frasson
import locale
from backend.settings import TOKEN_GOOGLE_MAPS_API

class selectMunicipio(serializers.ModelSerializer):
    class Meta:
        model = Municipios
        fields = ['id', 'nome_municipio', 'sigla_uf']

class ListMachinery(serializers.ModelSerializer):
    class Meta:
        model = Maquinas_Equipamentos
        fields = ['id', 'modelo', 'proprietario', 'fabricante', 'quantidade', 'propriedade', 'ano_fabricacao', 'valor_total']

class ListBenfeitorias(serializers.ModelSerializer):
    name_farm = serializers.CharField(source='farm.nome_imovel', read_only=True)
    name_type = serializers.CharField(source='type.description', read_only=True)
    class Meta:
        model = Benfeitorias_Fazendas
        fields = ['id', 'uuid', 'data_construcao', 'name_type', 'name_farm', 'tamanho', 'valor_estimado']

class DetailBenfeitorias(serializers.ModelSerializer):
    pictures = serializers.SerializerMethodField(required=False, read_only=True)
    str_farm = serializers.CharField(source='farm.nome_imovel', read_only=True)
    str_type = serializers.CharField(source='type.description', read_only=True)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name not in ['pictures', 'str_farm', 'str_type']:
                field.required = True
    def get_pictures(self, obj):
        fotos = Pictures_Benfeitorias.objects.filter(benfeitoria=obj)
        return [{'id':foto.id, 'url':"/media/"+foto.file.name} for foto in fotos]
    class Meta:
        model = Benfeitorias_Fazendas
        fields = '__all__'

class ListTipoBenfeitoria(serializers.ModelSerializer):
    class Meta:
        model = Tipo_Benfeitorias
        fields = '__all__'

class serPictureBenfeitoria(serializers.ModelSerializer):
    class Meta:
        model = Pictures_Benfeitorias
        fields = '__all__'

class ListAnalisesSolo(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    str_cliente = serializers.CharField(source='cliente.razao_social', read_only=True)
    localizacao = serializers.CharField(source='fazenda.nome_imovel', read_only=True)
    def get_status(self, obj):
        status = {
            'text': 'Aguardando Resultado' if obj.calcio_cmolc_dm3 is None else 'Concluída',
            'color': 'warning' if obj.calcio_cmolc_dm3 is None else 'success'
        }
        return status
    class Meta:
        model = Analise_Solo
        fields = ['id', 'uuid', 'data_coleta', 'str_cliente', 'localizacao', 'status']

class detailAnalisesSolo(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    str_cliente = serializers.CharField(source='cliente.razao_social', read_only=True)
    localizacao = serializers.CharField(source='fazenda.nome_imovel', read_only=True)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['fazenda', 'cliente', 'identificacao_amostra', 'profundidade', 'responsavel', 'laboratorio_analise']:
                field.required = True
    def get_status(self, obj):
        status = {
            'text': 'Aguardando Resultado' if obj.calcio_cmolc_dm3 is None else 'Concluída',
            'color': 'warning' if obj.calcio_cmolc_dm3 is None else 'success'
        }
        return status
    def validate_file(self, value):
        if 'file' in self.initial_data:
            file = self.initial_data.get('file')
            file_name = file.name.lower()
            if not file_name.endswith('.pdf'):
                raise serializers.ValidationError("Arquivo deve ser em formato PDF!")     
            return file
        else:
            return None
    class Meta:
        model = Analise_Solo
        fields = '__all__'

class ListAnalisesSolo(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    str_cliente = serializers.CharField(source='cliente.razao_social', read_only=True)
    localizacao = serializers.CharField(source='fazenda.nome_imovel', read_only=True)
    def get_status(self, obj):
        status = {
            'text': 'Aguardando Resultado' if obj.calcio_cmolc_dm3 is None else 'Concluída',
            'color': 'warning' if obj.calcio_cmolc_dm3 is None else 'success'
        }
        return status
    class Meta:
        model = Analise_Solo
        fields = ['id', 'uuid', 'data_coleta', 'str_cliente', 'localizacao', 'status']

class resultsAnalisesSolo(serializers.ModelSerializer):
    other_info = serializers.SerializerMethodField(read_only=True)
    results = serializers.SerializerMethodField(read_only=True)
    creation = serializers.SerializerMethodField(read_only=True)
    str_cliente = serializers.CharField(source='cliente.razao_social', read_only=True)
    localizacao = serializers.CharField(source='fazenda.nome_imovel', read_only=True)
    token_apimaps = serializers.SerializerMethodField(read_only=True, required=False)
    def get_results(self, obj):
        data = {
            'calcio': Frasson.avaliar_nivel_nutriente_solo('calcio', obj.calcio_cmolc_dm3),
            'sodio': locale.format_string('%.2f', obj.sodio, True) if obj.sodio else '-',
            'magnesio': Frasson.avaliar_nivel_nutriente_solo('magnesio', obj.magnesio_cmolc_dm3),
            'aluminio_cmolc_dm3': locale.format_string('%.2f', obj.aluminio_cmolc_dm3, True) if obj.aluminio_cmolc_dm3 else '-',
            'potassio': Frasson.avaliar_nivel_nutriente_solo('potassio', obj.potassio_cmolc_dm3),
            'fosforo': Frasson.avaliar_nivel_nutriente_solo('fosforo', obj.fosforo),
            'fosforo_rem': Frasson.avaliar_nivel_nutriente_solo('fosforo_rem', obj.fosforo_rem),
            'enxofre': Frasson.avaliar_nivel_nutriente_solo('enxofre', obj.enxofre),
            'zinco': Frasson.avaliar_nivel_nutriente_solo('zinco', obj.zinco),
            'cobre': Frasson.avaliar_nivel_nutriente_solo('cobre', obj.cobre),
            'ferro': Frasson.avaliar_nivel_nutriente_solo('ferro', obj.ferro),
            'manganes': Frasson.avaliar_nivel_nutriente_solo('manganes', obj.manganes),
            'boro': Frasson.avaliar_nivel_nutriente_solo('boro', obj.boro),
            'h_mais_al': locale.format_string('%.2f', obj.h_mais_al, True) if obj.h_mais_al else '-',
            'mat_org': Frasson.avaliar_nivel_nutriente_solo('materia_organica', obj.mat_org_dag_dm3),
            'ph_cacl2': Frasson.avaliar_nivel_nutriente_solo('pH_CaCl', obj.ph_cacl2),
            'ph_h2O': Frasson.avaliar_nivel_nutriente_solo('pH_H2O', obj.ph_h2O),
            'argila_percentual': locale.format_string('%.2f', obj.argila_percentual, True) if obj.argila_percentual else '-',
            'silte_percentual': locale.format_string('%.2f', obj.silte_percentual, True) if obj.silte_percentual else '-',
            'areia_percentual': locale.format_string('%.2f', obj.areia_percentual, True) if obj.areia_percentual else '-',
        }
        return data
    def get_other_info(self, obj):
        niveis_embrapa = {
            'rel_ca_mg': {'min': 2, 'max': 5},
            'rel_ca_K': {'min': 15, 'max': 20},
            'rel_mg_k': {'min': 3, 'max': 5},
            'pH_H2O': {'min': 6, 'max': 6.5},
            'pH_CaCl': {'min': 5.5, 'max': 6.0},
        }
        if obj.magnesio_cmolc_dm3 != None and obj.calcio_cmolc_dm3 != None and obj.potassio_cmolc_dm3 != None and obj.h_mais_al != None:
            soma_bases = obj.calcio_cmolc_dm3 + obj.magnesio_cmolc_dm3 + obj.potassio_cmolc_dm3
            capacidade_troca_cations = soma_bases + obj.h_mais_al
            saturacao_bases = (soma_bases/capacidade_troca_cations) * 100
            calagem = ((70 - saturacao_bases)/100) *  capacidade_troca_cations if saturacao_bases < 70 else 0
            calculos = {
                'soma_bases': locale.format_string('%.2f', soma_bases, True),
                'capacidade_troca_cations': locale.format_string('%.2f', capacidade_troca_cations, True),
                'saturacao_bases': locale.format_string('%.2f', saturacao_bases, True),
                'rel_calcio_magnesio': {
                    'value': locale.format_string('%.2f', obj.calcio_cmolc_dm3/obj.magnesio_cmolc_dm3, True),
                    'level': 'BAIXO' if obj.calcio_cmolc_dm3/obj.magnesio_cmolc_dm3 < niveis_embrapa['rel_ca_mg']['min'] else ('ALTO' if obj.calcio_cmolc_dm3/obj.magnesio_cmolc_dm3 > niveis_embrapa['rel_ca_mg']['max'] else 'IDEAL'),
                    'color': 'warning' if obj.calcio_cmolc_dm3/obj.magnesio_cmolc_dm3 < niveis_embrapa['rel_ca_mg']['min'] else ('primary' if obj.calcio_cmolc_dm3/obj.magnesio_cmolc_dm3 > niveis_embrapa['rel_ca_mg']['max'] else 'success'),
                },
                
                'rel_calcio_potassio': {
                    'value': locale.format_string('%.2f', obj.calcio_cmolc_dm3/obj.potassio_cmolc_dm3, True),
                    'level': 'BAIXO' if obj.calcio_cmolc_dm3/obj.potassio_cmolc_dm3 < niveis_embrapa['rel_ca_K']['min'] else ('ALTO' if obj.calcio_cmolc_dm3/obj.potassio_cmolc_dm3 > niveis_embrapa['rel_ca_K']['max'] else 'IDEAL'),
                    'color': 'warning' if obj.calcio_cmolc_dm3/obj.potassio_cmolc_dm3 < niveis_embrapa['rel_ca_K']['min'] else ('primary' if obj.calcio_cmolc_dm3/obj.potassio_cmolc_dm3 > niveis_embrapa['rel_ca_K']['max'] else 'success'),
                }, 
                'rel_magnesio_potassio': {
                    'value': locale.format_string('%.2f', obj.magnesio_cmolc_dm3/obj.potassio_cmolc_dm3, True),
                    'level': 'BAIXO' if obj.magnesio_cmolc_dm3/obj.potassio_cmolc_dm3 < niveis_embrapa['rel_mg_k']['min'] else ('ALTO' if obj.calcio_cmolc_dm3/obj.potassio_cmolc_dm3 > niveis_embrapa['rel_ca_K']['max'] else 'IDEAL'),
                    'color': 'warning' if obj.magnesio_cmolc_dm3/obj.potassio_cmolc_dm3 < niveis_embrapa['rel_mg_k']['min'] else ('primary' if obj.magnesio_cmolc_dm3/obj.potassio_cmolc_dm3 > niveis_embrapa['rel_mg_k']['max'] else 'success'),
                }, 
                'calagem': locale.format_string('%.2f', calagem, True),
            }
        else:
            calculos = {
                'soma_bases': '-',
                'capacidade_troca_cations': '-',
                'saturacao_bases': '-',
                'calagem': '-',
            }
        return calculos
    def get_creation(self, obj):
        return {'created_at':obj.created_at, 'created_by':f"{obj.created_by.first_name} {obj.created_by.last_name}"}
    def get_token_apimaps(self, obj):
        return TOKEN_GOOGLE_MAPS_API
    class Meta:
        model = Analise_Solo
        fields = ['id', 'uuid', 'latitude_gd', 'longitude_gd', 'data_coleta', 'str_cliente', 'localizacao', 'identificacao_amostra',
        'responsavel', 'laboratorio_analise', 'numero_controle', 'profundidade', 'creation', 'token_apimaps', 'results', 'other_info']

class listAgenciasBancarias(serializers.ModelSerializer):
    class Meta:
        model = Agencias_Bancarias
        fields = ['id', 'descricao_agencia']