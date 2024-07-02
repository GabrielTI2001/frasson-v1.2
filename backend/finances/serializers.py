from rest_framework import serializers
from .models import Lancamentos_Automaticos_Pagamentos, Categorias_Pagamentos, Transferencias_Contas, Caixas_Frasson, Resultados_Financeiros
from .models import Tipo_Receita_Despesa, Reembolso_Cliente, Contratos_Ambiental, Contratos_Ambiental_Pagamentos
from pipeline.models import Fluxo_Gestao_Ambiental
from finances.models import Pagamentos, Cobrancas
from backend.frassonUtilities import Frasson
from django.db.models import Q, Sum
import locale, requests, json
from datetime import date, timedelta
from backend.settings import TOKEN_GOOGLE_MAPS_API

class listPagamentosPipefy(serializers.ModelSerializer):
    str_categoria = serializers.CharField(source='categoria.category', read_only=True)
    str_classificacao = serializers.CharField(source='categoria.classification', read_only=True)
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', read_only=True)
    data = serializers.DateField(read_only=True)
    class Meta:
        model = Pagamentos
        fields = ['id', 'str_beneficiario', 'str_categoria', 'str_classificacao', 'phase_name', 'data', 'valor_pagamento', 'card_url']

class listCobrancasPipefy(serializers.ModelSerializer):
    str_detalhe = serializers.CharField(source='detalhamento.detalhamento_servico', read_only=True)
    str_produto = serializers.CharField(source='detalhamento.produto.description', read_only=True)
    str_cliente = serializers.CharField(source='cliente.razao_social', read_only=True)
    data = serializers.DateField(read_only=True)
    valor = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)
    class Meta:
        model = Cobrancas
        fields = ['id', 'str_cliente', 'str_produto', 'str_detalhe', 'phase_name', 'data', 'valor', 'card_url']

class listCobrancasInvoices(serializers.ModelSerializer):
    str_detalhe = serializers.CharField(source='detalhamento.detalhamento_servico', read_only=True)
    str_produto = serializers.CharField(source='detalhamento.produto.description', read_only=True)
    str_cliente = serializers.CharField(source='cliente.razao_social', read_only=True)
    class Meta:
        model = Cobrancas
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
        fields = ['id', 'nome', 'sigla']

class listTransfContas(serializers.ModelSerializer):
    str_caixa_origem = serializers.CharField(source='caixa_origem.nome', read_only=True)
    str_caixa_destino = serializers.CharField(source='caixa_destino.nome', read_only=True)
    class Meta:
        model = Transferencias_Contas
        fields = ['id', 'data', 'str_caixa_origem', 'str_caixa_destino', 'valor', 'description']

class detailTransfContas(serializers.ModelSerializer):
    str_caixa_origem = serializers.CharField(source='caixa_origem.nome', read_only=True)
    str_caixa_destino = serializers.CharField(source='caixa_destino.nome', read_only=True)
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
    str_caixa = serializers.CharField(source='caixa.nome', read_only=True)
    valor = serializers.SerializerMethodField(read_only=True)
    def get_valor(self, obj):
        return {'color': 'success' if obj.tipo.tipo == 'R' else 'danger', 'text': locale.format_string('%.2f', obj.valor, True)}
    class Meta:
        model = Resultados_Financeiros
        fields = ['id', 'data', 'str_caixa', 'str_tipo', 'valor', 'description']

class detailMovimentacoes(serializers.ModelSerializer):
    str_tipo = serializers.CharField(source='tipo.description', read_only=True)
    str_caixa = serializers.CharField(source='caixa.nome', read_only=True)
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
    str_cliente = serializers.CharField(source='cliente.razao_social', read_only=True)
    status = serializers.SerializerMethodField(read_only=True)
    def get_status(self, obj):
        if obj.cobranca == True:
            return {'text': 'Cobrado', 'color': 'success'}
        else:
            return {'text': 'Em Aberto', 'color': 'warning'}
    class Meta:
        model = Reembolso_Cliente
        fields = ['id', 'data', 'str_cliente', 'valor', 'description', 'status']

class detailReembolsos(serializers.ModelSerializer):
    str_cliente = serializers.CharField(source='cliente.razao_social', read_only=True)
    status = serializers.SerializerMethodField(read_only=True)
    def get_status(self, obj):
        if obj.cobranca == True:
            return {'text': 'Cobrado', 'color': 'success'}
        else:
            return {'text': 'Em Aberto', 'color': 'warning'}
    class Meta:
        model = Reembolso_Cliente
        fields = '__all__'

class listContratoAmbiental(serializers.ModelSerializer):
    str_contratante = serializers.CharField(source='contratante.razao_social', read_only=True)
    str_servicos = serializers.SerializerMethodField(read_only=True)
    str_produto = serializers.SerializerMethodField(read_only=True)
    status = serializers.SerializerMethodField(read_only=True)
    total_formas = serializers.DecimalField(read_only=True, max_digits=15, decimal_places=2)

    def get_str_servicos(self, obj):
        return ', '.join([s.detalhamento_servico for s in obj.servicos.all()])

    def get_str_produto(self, obj):
        return ', '.join([s['produto__acronym'] for s in obj.servicos.all().values('produto__acronym').distinct()])

    def get_str_valor(self, obj):
        return locale.format_string('%.2f', obj.valor, True) if obj.valor is not None else '-'

    def get_str_percentual(self, obj):
        return locale.format_string('%.2f', obj.percentual, True) if obj.percentual is not None else '-'

    def get_status(self, obj):
        if obj.total_formas == 0:
            return {'text': '-', 'color': 'secondary'}
        elif obj.status == 'Finalizado':
            return {'text': 'Finalizado', 'color': 'success'}
        else:
            return {'text': 'Em Andamento', 'color': 'warning'}
    
    class Meta:
        model = Contratos_Ambiental
        fields = [
            'id', 'uuid', 'str_contratante', 'str_servicos', 'str_produto', 'valor', 
            'data_assinatura', 'data_vencimento', 'status', 'total_formas'
        ]
        
class detailContratoAmbiental(serializers.ModelSerializer):
    str_contratante = serializers.CharField(source='contratante.razao_social', read_only=True)
    str_cpf = serializers.CharField(source='contratante.cpf_cnpj', read_only=True)
    etapas = serializers.SerializerMethodField(read_only=True)
    str_servicos = serializers.SerializerMethodField(read_only=True)
    str_produtos = serializers.SerializerMethodField(read_only=True)
    list_processos = serializers.SerializerMethodField(read_only=True)
    def get_etapas(self, obj):
        etapas = Contratos_Ambiental_Pagamentos.objects.filter(contrato=obj.id)
        list_etapas = []
        for e in etapas:
            if e.etapa:
                cobrancas = Cobrancas.objects.filter(Q(contrato_ambiental_id=obj.id) & Q(etapa_cobranca=e.get_etapa_display()))
                if len(cobrancas) > 0:
                    etapa_cobranca = cobrancas[0].etapa_cobranca
                    fase = cobrancas[0].phase_id
                else:
                    etapa_cobranca = None
                    fase = None
                list_etapas.append({
                    'id': e.id,
                    'valor': e.valor,
                    'percentual': e.percentual,
                    'etapa': e.get_etapa_display() if e.etapa else '-',
                    'aberta': 'Sim' if etapa_cobranca == e.get_etapa_display() else 'Não',
                    'color': 'success' if etapa_cobranca == e.get_etapa_display() else 'danger',
                    'status': 'Pago' if fase == 317532039 else '-' if fase == None else 'Em Aberto',
                    'color_status': 'success' if fase == 317532039 else 'secondary' if fase == None else 'warning'
                })
            else:
                list_etapas.append({
                    'id': e.id,
                    'valor': e.valor,
                    'percentual': e.percentual,
                    'etapa': '-',
                    'aberta': '-',
                    'color': '',
                    'status': '-',
                    'color_status': '-'
                })    
        return list_etapas 
    def get_str_servicos(self, obj):
        return [{'value':s.id, 'label':s.detalhamento_servico} for s in obj.servicos.all()]
    def get_str_produtos(self, obj):
        return ', '.join([s['produto__description'] for s in obj.servicos.all().values('produto__description').distinct()])
    def get_list_processos(self, obj):
        query_produtos = Fluxo_Gestao_Ambiental.objects.filter(contrato=obj.id)
        produtos = [{
            'id': produto.id,
            'detalhamento': produto.detalhamento.detalhamento_servico,
            'phase': produto.phase.descricao,
            'card': produto.card,
            'url': str(produto.phase.pipe.code)+'/'+str(produto.code),
            'beneficiarios': ', '.join([beneficiario.razao_social for beneficiario in produto.beneficiario.all()])
        }for produto in query_produtos]
        return produtos
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['contratante', 'valor', 'data_vencimento', 'data_assinatura']:
                field.required = True
    class Meta:
        model = Contratos_Ambiental
        fields = '__all__'

class serContratosPagamentosAmbiental(serializers.ModelSerializer): 
    etapa_display = serializers.CharField(source='get_etapa_display', read_only=True)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['etapa', 'percentual', 'valor']:
                field.required = True
    def validate_percentual(self, value):
        percentual = value
        etapa_atual = self.initial_data.get('etapa')
        contrato = self.initial_data.get('contrato')
        if self.instance:
            etapa_anterior = self.instance.etapa
            if etapa_atual:
                total_percentual = Contratos_Ambiental_Pagamentos.objects.filter(contrato_id=int(contrato)).exclude(etapa=etapa_anterior
                    ).aggregate(total=Sum('percentual'))
            else:
                total_percentual = Contratos_Ambiental_Pagamentos.objects.filter(contrato_id=int(contrato)).exclude(etapa=etapa_atual
                    ).aggregate(total=Sum('percentual'))
        else:
            total_percentual = Contratos_Ambiental_Pagamentos.objects.filter(contrato_id=int(contrato)).aggregate(total=Sum('percentual'))
        if (total_percentual['total'] or 0) + percentual > 100.00:
            raise serializers.ValidationError('O total das parcelas ultrapassa 100% do contrato')
        return value
    class Meta:
        model = Contratos_Ambiental_Pagamentos
        fields = '__all__'