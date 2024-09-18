from rest_framework import serializers
from .models import *
from pipeline.models import Fluxo_Gestao_Ambiental, Fluxo_Gestao_Credito
from finances.models import Pagamentos, Cobrancas
from backend.frassonUtilities import Frasson
from django.db.models import Q
import locale
from datetime import datetime, timedelta

class listPagamentos(serializers.ModelSerializer):
    str_categoria = serializers.CharField(source='categoria.category', read_only=True)
    str_classificacao = serializers.CharField(source='categoria.get_classification_display', read_only=True)
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', read_only=True)
    str_status = serializers.CharField(source='get_status_display', read_only=True)
    data = serializers.DateField(read_only=True)
    class Meta:
        model = Pagamentos
        fields = ['id', 'uuid', 'str_beneficiario', 'str_categoria', 'str_status', 'str_classificacao', 'data', 'valor_pagamento', 'status']

class detailPagamentos(serializers.ModelSerializer):
    str_categoria = serializers.CharField(source='categoria.category', read_only=True)
    str_classificacao = serializers.CharField(source='categoria.classification', read_only=True)
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', read_only=True)
    str_cpf_cnpj = serializers.CharField(source='beneficiario.cpf_cnpj', read_only=True)
    str_caixa = serializers.CharField(source='caixa.nome', read_only=True)
    str_status = serializers.CharField(source='get_status_display', read_only=True)
    str_created_by = serializers.SerializerMethodField(read_only=True)
    data = serializers.DateField(read_only=True)
    def get_str_created_by(self, obj):
        return obj.created_by.first_name+' '+obj.created_by.last_name
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name in ['beneficiario', 'categoria', 'status', 'data_vencimento', 'valor_pagamento', 'descricao']:
                    field.required = True
        else:
            for field_name, field in self.fields.items():
                field.required = False 
    def validate_status(self, value):
        if self.instance:
            if value == 'PG' and (not self.instance.caixa or not self.instance.data_pagamento):
                raise serializers.ValidationError("Informe a data do pagamento e o caixa de saída")
        return value
    class Meta:
        model = Pagamentos
        fields = '__all__'


class listCobrancas(serializers.ModelSerializer):
    str_detalhe = serializers.SerializerMethodField(read_only=True)
    str_produto = serializers.SerializerMethodField(read_only=True)
    str_cliente = serializers.CharField(source='cliente.razao_social', read_only=True)
    str_status = serializers.CharField(source='get_status_display', read_only=True)
    data = serializers.DateField(read_only=True)
    valor = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)
    def get_str_produto(self, obj):
        if obj.etapa_ambiental:
            return obj.etapa_ambiental.servico.produto.description
        elif obj.etapa_credito:
            return obj.etapa_credito.servico.produto.description
        elif obj.detalhamento:
            return obj.detalhamento.produto.description
        else:
            return None
    def get_str_detalhe(self, obj):
        if obj.etapa_ambiental:
            return obj.etapa_ambiental.servico.detalhamento_servico
        elif obj.etapa_credito:
            return obj.etapa_credito.servico.detalhamento_servico
        elif obj.detalhamento:
            return obj.detalhamento.detalhamento_servico
        else:
            return None
    class Meta:
        model = Cobrancas
        fields = ['id', 'uuid', 'status', 'str_status', 'saldo_devedor', 'str_cliente', 'str_produto', 'str_detalhe', 'data', 'valor']

class detailCobrancas(serializers.ModelSerializer):
    str_detalhe = serializers.SerializerMethodField(read_only=True)
    str_produto = serializers.SerializerMethodField(read_only=True)
    str_etapa = serializers.SerializerMethodField(read_only=True)
    str_cliente = serializers.CharField(source='cliente.razao_social', read_only=True)
    str_caixa = serializers.CharField(source='caixa.nome', read_only=True)
    str_status = serializers.CharField(source='get_status_display', read_only=True)
    str_created_by = serializers.SerializerMethodField(read_only=True)
    data = serializers.DateField(read_only=True)
    valor = serializers.DecimalField(read_only=True, max_digits=10, decimal_places=2)
    def get_str_created_by(self, obj):
        return obj.created_by.first_name+' '+obj.created_by.last_name
    def get_str_produto(self, obj):
        if obj.etapa_ambiental:
            return obj.etapa_ambiental.servico.produto.description
        elif obj.etapa_credito:
            return obj.etapa_credito.servico.produto.description
        elif obj.detalhamento:
            return obj.detalhamento.produto.description
        else:
            return None
    def get_str_detalhe(self, obj):
        if obj.etapa_ambiental:
            return obj.etapa_ambiental.servico.detalhamento_servico
        elif obj.etapa_credito:
            return obj.etapa_credito.servico.detalhamento_servico
        elif obj.detalhamento:
            return obj.detalhamento.detalhamento_servico
        else:
            return None
    def get_str_etapa(self, obj):
        if obj.etapa_ambiental:
            return obj.etapa_ambiental.etapa
        elif obj.etapa_credito:
            return obj.etapa_credito.get_etapa_display()
        else:
            return None
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name in ['cliente', 'saldo_devedor', 'status']:
                    field.required = True
        else:
            for field_name, field in self.fields.items():
                field.required = False 
    def validate_status(self, value):
        if self.instance:
            if value == 'PG' and (not self.instance.caixa or not self.instance.data_pagamento or not self.instance.valor_faturado):
                raise serializers.ValidationError("Informe a data do pagamento, valor faturado e o caixa de entrada")
        return value
    def validate(self, data):
        data_previsao = self.initial_data.get('data_previsao')
        data['data_previsao'] = datetime.now().date() + timedelta(days=7) if not data_previsao else data_previsao
        return data
    class Meta:
        model = Cobrancas
        fields = '__all__'

class listCobrancasInvoices(serializers.ModelSerializer):
    str_detalhe = serializers.CharField(source='etapa_ambiental.servico.detalhamento_servico', read_only=True)
    str_produto = serializers.CharField(source='etapa_ambiental.servico.produto.description', read_only=True)
    str_cliente = serializers.CharField(source='cliente.razao_social', read_only=True)
    class Meta:
        model = Cobrancas
        fields = ['id', 'str_cliente', 'str_produto', 'str_detalhe', 'data_pagamento', 'valor_faturado']

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
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name in ['cliente', 'data', 'valor']:
                    field.required = True
        else:
            for field_name, field in self.fields.items():
                field.required = False
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
            'id', 'uuid', 'code', 'str_contratante', 'str_servicos', 'str_produto', 'valor', 
            'data_assinatura', 'status', 'total_formas',
        ]
        
class detailContratoAmbiental(serializers.ModelSerializer):
    info_contratante = serializers.SerializerMethodField(read_only=True)
    str_cpf = serializers.CharField(source='contratante.cpf_cnpj', read_only=True)
    etapas = serializers.SerializerMethodField(read_only=True)
    list_servicos = serializers.SerializerMethodField(read_only=True)
    str_produtos = serializers.SerializerMethodField(read_only=True)
    str_produto = serializers.SerializerMethodField(read_only=True)
    list_processos = serializers.SerializerMethodField(read_only=True)
    str_created_by = serializers.SerializerMethodField(read_only=True)
    def get_str_produto(self, obj):
        return ', '.join([s['produto__acronym'] for s in obj.servicos.all().values('produto__acronym').distinct()])
    def get_etapas(self, obj):
        etapas = Contratos_Ambiental_Pagamentos.objects.filter(contrato=obj.id)
        list_etapas = []
        for e in etapas:
            cobrancas = Cobrancas.objects.filter(Q(etapa_ambiental__contrato_id=obj.id) & Q(etapa_ambiental__etapa=e.etapa))
            if len(cobrancas) > 0:
                fase = cobrancas[0].status
            else:
                fase = None
            list_etapas.append({
                'id': e.id,
                'valor': e.valor,
                'servico': e.servico.id,
                'servico_str': e.servico.detalhamento_servico,
                'percentual': e.percentual,
                'etapa': e.etapa if e.etapa else '-',
                'status': 'Pago' if fase == 'PG' else 'Sem Cobrança Aberta' if fase == None else 'Cobrança Aberta',
                'color_status': 'success' if fase == 'PG' else 'warning' if fase == None else 'primary'
            })    
        return list_etapas 
    def get_list_servicos(self, obj):
        return [{'value':s.id, 'label':s.detalhamento_servico, 'produto':s.produto.description} for s in obj.servicos.all()]
    def get_info_contratante(self, obj):
        return {'uuid':obj.contratante.uuid, 'value':obj.contratante.id, 'label':obj.contratante.razao_social, 'cpf_cnpj':obj.contratante.cpf_cnpj}
    def get_str_produtos(self, obj):
        return ', '.join([s['produto__description'] for s in obj.servicos.all().values('produto__description').distinct()])
    def get_list_processos(self, obj):
        query_produtos = Fluxo_Gestao_Ambiental.objects.filter(contrato=obj.id)
        produtos = [{
            'uuid': produto.code,
            'detalhamento': produto.detalhamento.detalhamento_servico,
            'phase': produto.phase.descricao,
            'url': str(produto.phase.pipe.code)+'/processo/'+str(produto.code),
            'beneficiarios': produto.beneficiario.razao_social
        }for produto in query_produtos]
        return produtos
    def get_str_created_by(self, obj):
        return obj.created_by.first_name+' '+obj.created_by.last_name
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name in ['contratante', 'valor', 'servicos', 'data_assinatura']:
                    field.required = True
        else:
            for field_name, field in self.fields.items():
                field.required = False
                field.allow_empty = True
    def update(self, instance, validated_data):
        servicos = validated_data.pop('servicos', [])
        instance = super().update(instance, validated_data)
        if servicos and len(servicos) > 0:
            ids = [r.id for r in servicos]
            instance.servicos.set(ids)
        return instance
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
    def validate_etapa(self, value):
        etapa_anterior = self.instance.etapa if self.instance else None
        etapa_atual = self.initial_data.get('etapa')
        contrato = self.initial_data.get('contrato')
        servico = self.initial_data.get('servico')
        if etapa_atual != etapa_anterior:
            if Contratos_Ambiental_Pagamentos.objects.filter(contrato_id=int(contrato), servico_id=int(servico), etapa=etapa_atual).exists():
                raise serializers.ValidationError('Etapa não pode se repetir para um mesmo serviço')
        return value
    class Meta:
        model = Contratos_Ambiental_Pagamentos
        fields = '__all__'

class listContratoCredito(serializers.ModelSerializer):
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
        model = Contratos_Credito
        fields = [
            'id', 'uuid', 'code', 'str_contratante', 'str_servicos', 'str_produto', 'valor', 
            'data_assinatura', 'status', 'total_formas'
        ]

class detailContratoCredito(serializers.ModelSerializer):
    info_contratante = serializers.SerializerMethodField(read_only=True)
    str_cpf = serializers.CharField(source='contratante.cpf_cnpj', read_only=True)
    etapas = serializers.SerializerMethodField(read_only=True)
    list_servicos = serializers.SerializerMethodField(read_only=True)
    str_produtos = serializers.SerializerMethodField(read_only=True)
    str_produto = serializers.SerializerMethodField(read_only=True)
    list_processos = serializers.SerializerMethodField(read_only=True)
    str_created_by = serializers.SerializerMethodField(read_only=True)
    def get_str_produto(self, obj):
        return ', '.join([s['produto__acronym'] for s in obj.servicos.all().values('produto__acronym').distinct()])
    def get_etapas(self, obj):
        etapas = Contratos_Credito_Pagamentos.objects.filter(contrato=obj.id)
        list_etapas = []
        for e in etapas:
            cobrancas = Cobrancas.objects.filter(Q(etapa_credito__contrato_id=obj.id) & Q(etapa_credito__etapa=e.etapa))
            if len(cobrancas) > 0:
                fase = cobrancas[0].status
            else:
                fase = None
            list_etapas.append({
                'id': e.id,
                'valor': e.valor,
                'servico': e.servico.id,
                'servico_str': e.servico.detalhamento_servico,
                'percentual': e.percentual,
                'etapa': e.etapa if e.etapa else '-',
                'status': 'Pago' if fase == 'PG' else 'Sem Cobrança Aberta' if fase == None else 'Cobrança Aberta',
                'color_status': 'success' if fase == 'PG' else 'warning' if fase == None else 'primary'
            })    
        return list_etapas 
    def get_list_servicos(self, obj):
        return [{'value':s.id, 'label':s.detalhamento_servico, 'produto':s.produto.description} for s in obj.servicos.all()]
    def get_info_contratante(self, obj):
        return {'uuid':obj.contratante.uuid, 'value':obj.contratante.id, 'label':obj.contratante.razao_social, 'cpf_cnpj':obj.contratante.cpf_cnpj}
    def get_str_produtos(self, obj):
        return ', '.join([s['produto__description'] for s in obj.servicos.all().values('produto__description').distinct()])
    def get_list_processos(self, obj):
        query_produtos = Fluxo_Gestao_Credito.objects.filter(contrato=obj.id)
        produtos = [{
            'uuid': produto.code,
            'detalhamento': produto.detalhamento.detalhamento_servico,
            'phase': produto.phase.descricao,
            'url': str(produto.phase.pipe.code)+'/processo/'+str(produto.code),
            'beneficiarios': ''
        }for produto in query_produtos]
        return produtos
    def get_str_created_by(self, obj):
        return obj.created_by.first_name+' '+obj.created_by.last_name
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name in ['contratante', 'valor', 'servicos', 'data_assinatura']:
                    field.required = True
        else:
            for field_name, field in self.fields.items():
                field.required = False
                field.allow_empty = True
    def update(self, instance, validated_data):
        servicos = validated_data.pop('servicos', [])
        instance = super().update(instance, validated_data)
        if servicos and len(servicos) > 0:
            ids = [r.id for r in servicos]
            instance.servicos.set(ids)
        return instance
    class Meta:
        model = Contratos_Credito
        fields = '__all__'

class serContratosPagamentosCredito(serializers.ModelSerializer): 
    etapa_display = serializers.CharField(source='get_etapa_display', read_only=True)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['etapa', 'percentual', 'valor']:
                field.required = True
    def validate_etapa(self, value):
        etapa_anterior = self.instance.etapa if self.instance else None
        etapa_atual = self.initial_data.get('etapa')
        contrato = self.initial_data.get('contrato')
        servico = self.initial_data.get('servico')
        if etapa_atual != etapa_anterior:
            if Contratos_Credito_Pagamentos.objects.filter(contrato_id=int(contrato), servico_id=int(servico), etapa=etapa_atual).exists():
                raise serializers.ValidationError('Etapa não pode se repetir para um mesmo serviço')
        return value
    class Meta:
        model = Contratos_Credito_Pagamentos
        fields = '__all__'

class serializerAnexos(serializers.ModelSerializer):
    user = serializers.SerializerMethodField(read_only=True)
    def get_user(self, obj):
        if obj.uploaded_by:
            return {'id':obj.uploaded_by.id, 'name':obj.uploaded_by.first_name+' '+obj.uploaded_by.last_name}
        else:
            return {'id':'', 'name':'-'+' '+'-'}
    class Meta:
        model = Anexos
        fields = '__all__'

class serializerActivities(serializers.ModelSerializer):
    user = serializers.SerializerMethodField(read_only=True)
    def get_user(self, obj):
        if obj.updated_by:
            return {'id':obj.updated_by.id, 'name':obj.updated_by.first_name+' '+obj.updated_by.last_name}
        else:
            return {'id':'', 'name':'-'+' '+'-'}
    class Meta:
        model = Activities
        fields = '__all__'