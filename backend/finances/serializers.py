from rest_framework import serializers
from .models import Lancamentos_Automaticos_Pagamentos, Categorias_Pagamentos, Transferencias_Contas
from backend.frassonUtilities import Frasson
from backend.pipefyUtils import getTableRecordPipefy
import locale, requests, json
from datetime import date, timedelta
from backend.settings import TOKEN_GOOGLE_MAPS_API, TOKEN_PIPEFY_API, URL_PIFEFY_API

class listAutomPagamentos(serializers.ModelSerializer):
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', required=False, read_only=True)
    str_categoria = serializers.SerializerMethodField(required=False, read_only=True)
    def get_str_categoria(self, obj):
        if obj.categoria_pagamento:
            return f"{obj.categoria_pagamento.category} - {obj.categoria_pagamento.sub_category}"
        else:           
            return None
    class Meta:
        model = Lancamentos_Automaticos_Pagamentos
        fields = ['uuid', 'str_beneficiario', 'str_categoria', 'descricao', 'valor_pagamento', 'dia_vencimento']
        
class detailAutomPagamentos(serializers.ModelSerializer):
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', read_only=True)
    str_categoria = serializers.SerializerMethodField(read_only=True)
    def get_str_categoria(self, obj):
        if obj.categoria_pagamento:
            return f"{obj.categoria_pagamento.category} - {obj.categoria_pagamento.sub_category}"
        else:           
            return None
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['beneficiario', 'categoria_pagamento', 'descricao' ,'valor_pagamento', 'dia_vencimento']:
                field.required = True
    class Meta:
        model = Lancamentos_Automaticos_Pagamentos
        fields = '__all__'

class listCategoriaPagamentos(serializers.ModelSerializer):
    class Meta:
        model = Categorias_Pagamentos
        fields = ['id', 'category', 'sub_category']

class listTransfContas(serializers.ModelSerializer):
    str_caixa_origem = serializers.CharField(source='caixa_origem.caixa', read_only=True)
    str_caixa_destino = serializers.CharField(source='caixa_destino.caixa', read_only=True)
    class Meta:
        model = Transferencias_Contas
        fields = ['id', 'data', 'str_caixa_origem', 'str_caixa_destino', 'valor', 'description']