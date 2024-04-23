from rest_framework import serializers
from .models import Municipios, Maquinas_Equipamentos, Benfeitorias_Fazendas, Tipo_Benfeitorias, Pictures_Benfeitorias

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
