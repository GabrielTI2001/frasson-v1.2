from rest_framework import serializers
from pipefy.models import Regimes_Exploracao, Imoveis_Rurais
from .models import Operacoes_Credito, Produto_Agricola
from backend.frassonUtilities import Frasson
from backend.pipefyUtils import getTableRecordPipefy
import locale, requests, json
from backend.settings import TOKEN_GOOGLE_MAPS_API, TOKEN_PIPEFY_API, URL_PIFEFY_API

class ListAlongamentos(serializers.ModelSerializer):
    beneficiario = serializers.CharField(source='operacao.beneficiario.razao_social', read_only=True)
    cpf = serializers.CharField(source='operacao.beneficiario.cpf_cnpj', read_only=True)
    instituicao = serializers.CharField(source='operacao.instituicao.instituicao.abreviatura', read_only=True)
    produto = serializers.CharField(source='produto_agricola.description', read_only=True)
    numero_operacao = serializers.CharField(source='operacao.numero_operacao', read_only=True)
    valor_operacao = serializers.DecimalField(source='operacao.valor_operacao', read_only=True, max_digits=15, decimal_places=2)
    str_tipo_armazenagem = serializers.CharField(source='tipo_armazenagem.description', read_only=True)
    
    class Meta:
        model = Operacoes_Credito
        fields = ['id', 'numero_operacao', 'data', 'beneficiario', 'cpf', 'instituicao', 'produto', 'valor_operacao', 
            'valor_total', 'str_tipo_armazenagem']

class detailAlongamentos(serializers.ModelSerializer):
    class Meta:
        model = Operacoes_Credito
        fields = '__all__'

class listProdutos(serializers.ModelSerializer):
    class Meta:
        model = Produto_Agricola
        fields = '__all__'