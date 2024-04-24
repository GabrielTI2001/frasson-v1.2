from rest_framework import serializers
from .models import Municipios, Maquinas_Equipamentos, Benfeitorias_Fazendas, Tipo_Benfeitorias, Pictures_Benfeitorias, Analise_Solo

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
    class Meta:
        model = Benfeitorias_Fazendas
        fields = ['id', 'uuid', 'data_construcao', 'type', 'name_farm', 'tamanho', 'valor_estimado']

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