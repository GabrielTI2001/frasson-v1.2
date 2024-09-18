from rest_framework import serializers
from .models import Cadastro_Alongamentos, Produto_Agricola, Tipo_Armazenagem, Tipo_Classificacao
from credit.models import Operacoes_Contratadas

class listOperacoesNext(serializers.ModelSerializer):
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', read_only=True)
    name_item = serializers.CharField(source='item_financiado.item', required=False, read_only=True)
    data_inicio = serializers.DateTimeField(read_only=True)
    data_limite = serializers.DateTimeField(read_only=True)
    dias_ate_limite = serializers.IntegerField(read_only=True)
    class Meta:
        model = Operacoes_Contratadas
        fields = ['id', 'uuid', 'data_limite', 'numero_operacao', 'str_beneficiario', 'name_item', 'data_primeiro_vencimento', 
            'data_prod_armazenado',  'valor_operacao', 'data_inicio', 'dias_ate_limite']

class ListAlongamentos(serializers.ModelSerializer):
    beneficiario = serializers.CharField(source='operacao.beneficiario.razao_social', read_only=True)
    cpf = serializers.CharField(source='operacao.beneficiario.cpf_cnpj', read_only=True)
    instituicao = serializers.CharField(source='operacao.instituicao.instituicao.abreviatura', read_only=True)
    produto = serializers.CharField(source='produto_agricola.description', read_only=True)
    numero_operacao = serializers.CharField(source='operacao.numero_operacao', read_only=True)
    valor_operacao = serializers.DecimalField(source='operacao.valor_operacao', read_only=True, max_digits=15, decimal_places=2)
    str_tipo_armazenagem = serializers.CharField(source='tipo_armazenagem.description', read_only=True)
    
    class Meta:
        model = Cadastro_Alongamentos
        fields = ['id', 'uuid', 'numero_operacao', 'data', 'beneficiario', 'cpf', 'instituicao', 'produto', 'valor_operacao', 
            'valor_total', 'str_tipo_armazenagem']

class detailAlongamentos(serializers.ModelSerializer):
    info_operacao = serializers.SerializerMethodField(read_only=True)
    str_fiel_depositario = serializers.CharField(source='fiel_depositario.razao_social', read_only=True)
    str_testemunha01 = serializers.CharField(source='testemunha01.razao_social', read_only=True)
    str_testemunha02 = serializers.CharField(source='testemunha02.razao_social', read_only=True)
    str_propriedade = serializers.SerializerMethodField(read_only=True)
    str_municipio = serializers.SerializerMethodField(read_only=True)
    str_agencia = serializers.CharField(source='agencia_bancaria.instituicao.razao_social', read_only=True)
    produto = serializers.CharField(source='produto_agricola.description', read_only=True)
    def get_info_operacao(self, obj):
        if obj.operacao:
            return {
                'numero_operacao': obj.operacao.numero_operacao, 'valor_operacao':obj.operacao.valor_operacao, 
                'instituicao':obj.operacao.instituicao.instituicao.abreviatura, 'taxa_juros': obj.operacao.taxa_juros,
                'beneficiario':obj.operacao.beneficiario.razao_social, 'cpf':obj.operacao.beneficiario.cpf_cnpj,
                'imovel':', '.join([i.nome for i in obj.operacao.imoveis_beneficiados.all()]), 
                'matricula':', '.join([i.matricula for i in obj.operacao.imoveis_beneficiados.all()]),
                'safra': obj.operacao.safra, 'primeiro_vencimento':obj.operacao.data_primeiro_vencimento,
                'item': obj.operacao.item_financiado.item if obj.operacao.item_financiado else None,
            }
        else:
            return None
    def get_str_municipio(self, obj):
        if obj.propriedades.all() != []:
            return f"{obj.propriedades.first().municipio.nome_municipio} - {obj.propriedades.first().municipio.sigla_uf}"
        else:
            return None
    def get_str_propriedade(self, obj):
        propriedades = obj.propriedades.all()
        return [{'value':p.id, 'label':p.nome} for p in propriedades]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['str_municipio', 'str_propriedade', 'processo', 'info_operacao', 'str_fiel_depositario', 'produto', 
            'str_testemunha01', 'str_testemunha02']:
                field.required = False
            else:
                field.required = True
    class Meta:
        model = Cadastro_Alongamentos
        fields = '__all__'

class listProdutos(serializers.ModelSerializer):
    class Meta:
        model = Produto_Agricola
        fields = '__all__'

class listTipoArmazenagem(serializers.ModelSerializer):
    class Meta:
        model = Tipo_Armazenagem
        fields = '__all__'

class listTipoClassificacao(serializers.ModelSerializer):
    class Meta:
        model = Tipo_Classificacao
        fields = '__all__'