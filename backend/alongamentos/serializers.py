from rest_framework import serializers
from .models import Cadastro_Alongamentos, Produto_Agricola, Tipo_Armazenagem, Tipo_Classificacao

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
        fields = ['id', 'numero_operacao', 'data', 'beneficiario', 'cpf', 'instituicao', 'produto', 'valor_operacao', 
            'valor_total', 'str_tipo_armazenagem']

class detailAlongamentos(serializers.ModelSerializer):
    info_operacao = serializers.SerializerMethodField(read_only=True)
    str_fiel_depositario = serializers.CharField(source='fiel_depositario.razao_social', read_only=True)
    str_testemunha01 = serializers.CharField(source='testemunha01.razao_social', read_only=True)
    str_testemunha02 = serializers.CharField(source='testemunha02.razao_social', read_only=True)
    str_propriedade = serializers.SerializerMethodField(read_only=True)
    str_municipio = serializers.SerializerMethodField(read_only=True)
    produto = serializers.CharField(source='produto_agricola.description', read_only=True)
    def get_info_operacao(self, obj):
        if obj.operacao:
            return {
                'numero_operacao': obj.operacao.numero_operacao, 'valor_operacao':obj.operacao.valor_operacao, 
                'instituicao':obj.operacao.instituicao.instituicao.abreviatura, 'taxa_juros': obj.operacao.taxa_juros,
                'beneficiario':obj.operacao.beneficiario.razao_social, 'cpf':obj.operacao.beneficiario.cpf_cnpj,
                'imovel':obj.operacao.imovel_beneficiado, 'matricula':obj.operacao.matricula_imovel,
                'safra': obj.operacao.safra, 'primeiro_vencimento':obj.operacao.data_primeiro_vencimento,
                'item': obj.operacao.item_financiado.item if obj.operacao.item_financiado else None, 'url': obj.operacao.url_record
            }
        else:
            return None
    def get_str_municipio(self, obj):
        if obj.propriedades.all() != []:
            return f"{obj.propriedades.first().municipio.nome_municipio} - {obj.propriedades.first().municipio.sigla_uf}"
        else:
            return None
    def get_str_propriedade(self, obj):
        propriedades = obj.propriedade.all()
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