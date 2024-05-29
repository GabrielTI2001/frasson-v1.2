from rest_framework import serializers
from .models import Lancamentos_Automaticos_Pagamentos, Categorias_Pagamentos, Transferencias_Contas, Caixas_Frasson, Resultados_Financeiros
from .models import Tipo_Receita_Despesa, Reembolso_Cliente, Pagamentos_Pipefy, Cobrancas_Pipefy
from backend.frassonUtilities import Frasson
from backend.pipefyUtils import getTableRecordPipefy
import locale, requests, json
from datetime import date, timedelta
from backend.settings import TOKEN_GOOGLE_MAPS_API, TOKEN_PIPEFY_API, URL_PIFEFY_API

class listPagamentosPipefy(serializers.ModelSerializer):
    str_categoria = serializers.CharField(source='categoria.category', read_only=True)
    str_classificacao = serializers.CharField(source='categoria.classification', read_only=True)
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', read_only=True)
    data = serializers.DateField(read_only=True)
    class Meta:
        model = Pagamentos_Pipefy
        fields = ['id', 'str_beneficiario', 'str_categoria', 'str_classificacao', 'phase_name', 'data', 'valor_pagamento', 'card_url']

class listCobrancasPipefy(serializers.ModelSerializer):
    str_detalhe = serializers.CharField(source='detalhamento.detalhamento_servico', read_only=True)
    str_produto = serializers.CharField(source='detalhamento.produto.description', read_only=True)
    str_cliente = serializers.CharField(source='cliente.razao_social', read_only=True)
    data = serializers.DateField(read_only=True)
    valor = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)
    class Meta:
        model = Cobrancas_Pipefy
        fields = ['id', 'str_cliente', 'str_produto', 'str_detalhe', 'phase_name', 'data', 'valor', 'card_url']

class listCobrancasInvoices(serializers.ModelSerializer):
    str_detalhe = serializers.CharField(source='detalhamento.detalhamento_servico', read_only=True)
    str_produto = serializers.CharField(source='detalhamento.produto.description', read_only=True)
    str_cliente = serializers.CharField(source='cliente.razao_social', read_only=True)
    class Meta:
        model = Cobrancas_Pipefy
        fields = ['id', 'str_cliente', 'str_produto', 'str_detalhe', 'phase_name', 'data_pagamento', 'valor_faturado', 'card_url']

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

class listTipoReceitaDespesa(serializers.ModelSerializer):
    class Meta:
        model = Tipo_Receita_Despesa
        fields = ['id', 'tipo', 'description']

class listCaixas(serializers.ModelSerializer):
    class Meta:
        model = Caixas_Frasson
        fields = ['id', 'caixa', 'sigla']

class listTransfContas(serializers.ModelSerializer):
    str_caixa_origem = serializers.CharField(source='caixa_origem.caixa', read_only=True)
    str_caixa_destino = serializers.CharField(source='caixa_destino.caixa', read_only=True)
    class Meta:
        model = Transferencias_Contas
        fields = ['id', 'data', 'str_caixa_origem', 'str_caixa_destino', 'valor', 'description']

class detailTransfContas(serializers.ModelSerializer):
    str_caixa_origem = serializers.CharField(source='caixa_origem.caixa', read_only=True)
    str_caixa_destino = serializers.CharField(source='caixa_destino.caixa', read_only=True)
    def validate_caixa_destino(self, value):
        origem = self.initial_data.get('caixa_origem')
        if int(origem) == value.id:
            raise serializers.ValidationError("Caixa de Destino deve ser diferente do Caixa de Origem!")
        return value
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['data', 'valor', 'description' ,'caixa_origem', 'caixa_destino']:
                field.required = True
    class Meta:
        model = Transferencias_Contas
        fields = '__all__'

class listMovimentacoes(serializers.ModelSerializer):
    str_tipo = serializers.CharField(source='tipo.description', read_only=True)
    str_caixa = serializers.CharField(source='caixa.caixa', read_only=True)
    valor = serializers.SerializerMethodField(read_only=True)
    def get_valor(self, obj):
        return {'color': 'success' if obj.tipo.tipo == 'R' else 'danger', 'text': locale.format_string('%.2f', obj.valor, True)}
    class Meta:
        model = Resultados_Financeiros
        fields = ['id', 'data', 'str_caixa', 'str_tipo', 'valor', 'description']

class detailMovimentacoes(serializers.ModelSerializer):
    str_tipo = serializers.CharField(source='tipo.description', read_only=True)
    str_caixa = serializers.CharField(source='caixa.caixa', read_only=True)
    str_rd = serializers.CharField(source='tipo.tipo', read_only=True)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['data', 'valor', 'description' ,'caixa', 'tipo']:
                field.required = True
    class Meta:
        model = Resultados_Financeiros
        fields = '__all__'

class listReembolsos(serializers.ModelSerializer):
    str_caixa_destino = serializers.CharField(source='caixa_destino.caixa', read_only=True)
    class Meta:
        model = Reembolso_Cliente
        fields = ['id', 'data', 'str_caixa_destino', 'valor', 'description']

class detailReembolsos(serializers.ModelSerializer):
    str_caixa_destino = serializers.CharField(source='caixa_destino.caixa', read_only=True)
    class Meta:
        model = Reembolso_Cliente
        fields = '__all__'