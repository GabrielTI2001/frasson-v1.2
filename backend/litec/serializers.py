from rest_framework import serializers
from .models import Producao_Agricola, Producao_Pecuaria, Sistema_Producao_Pecuaria, Unidade_Producao_Pecuaria, Produto_Principal_Pecuaria
import os
from backend.settings import TOKEN_GOOGLE_MAPS_API
from pykml import parser
from rest_framework.exceptions import ValidationError

class listProdAgricola(serializers.ModelSerializer):
    str_cultura = serializers.CharField(source='cultura.cultura', required=False, read_only=True)
    class Meta:
        model = Producao_Agricola
        fields = ['id', 'str_cultura', 'plantio', 'colheita', 'prod_prevista_kg', 'prod_obtida_kg']

class detailProdAgricola(serializers.ModelSerializer):
    str_cultura = serializers.CharField(source='cultura.cultura', required=False, read_only=True)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['cultura', 'safra', 'variedade', 'plantio', 'colheita']:
                field.required = True
    class Meta:
        model = Producao_Agricola
        fields = '__all__'

class listProdPecuaria(serializers.ModelSerializer):
    str_sistema_producao = serializers.CharField(source='sistema_producao.description', required=False, read_only=True)
    str_produto_principal = serializers.CharField(source='produto_principal.description', required=False, read_only=True)
    str_unidade_producao = serializers.CharField(source='unidade_producao.description', required=False, read_only=True)
    tipo_producao_display = serializers.CharField(source='get_tipo_producao_display', read_only=True)
    class Meta:
        model = Producao_Pecuaria
        fields = ['id', 'ano', 'tipo_producao_display', 'str_sistema_producao', 'str_unidade_producao', 'str_produto_principal', 
            'quantidade']

class detailProdPecuaria(serializers.ModelSerializer):
    str_sistema_producao = serializers.CharField(source='sistema_producao.description', required=False, read_only=True)
    str_produto_principal = serializers.CharField(source='produto_principal.description', required=False, read_only=True)
    str_unidade_producao = serializers.CharField(source='unidade_producao.description', required=False, read_only=True)
    tipo_producao_display = serializers.CharField(source='get_tipo_producao_display', read_only=True)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['sistema_producao', 'unidade_producao', 'produto_principal', 'ano', 'tipo_producao', 'quantidade']:
                field.required = True
    class Meta:
        model = Producao_Pecuaria
        fields = '__all__'

class listSistemaProducao(serializers.ModelSerializer):
    class Meta:
        model = Sistema_Producao_Pecuaria
        fields = ['id', 'description']

class listUnidadeProducao(serializers.ModelSerializer):
    class Meta:
        model = Unidade_Producao_Pecuaria
        fields = ['id', 'description']

class listProdutoPrincipal(serializers.ModelSerializer):
    class Meta:
        model = Produto_Principal_Pecuaria
        fields = ['id', 'description']