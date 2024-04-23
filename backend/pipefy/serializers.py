from rest_framework import serializers
from .models import Card_Produtos, Fase, Pipe, Detalhamento_Servicos, Contratos_Servicos, Cadastro_Pessoal, Imoveis_Rurais
from .models import Instituicoes_Parceiras, Operacoes_Contratadas, ContasBancarias_Clientes

class serializerCadastro_Pessoal(serializers.ModelSerializer):
    class Meta:
        model = Cadastro_Pessoal
        fields = ['id', 'razao_social', 'cpf_cnpj']

class listCadastro_Pessoal(serializers.ModelSerializer):
    grupo_info = serializers.CharField(source='grupo.nome_grupo', required=False, read_only=True)
    class Meta:
        model = Cadastro_Pessoal
        fields = ['id', 'uuid', 'razao_social', 'natureza', 'cpf_cnpj', 'numero_rg', 'municipio', 'grupo_info']

class detailCadastro_Pessoal(serializers.ModelSerializer):
    grupo_info = serializers.CharField(source='grupo.nome_grupo', required=False, read_only=True)
    contas_bancarias = serializers.SerializerMethodField()
    class Meta:
        model = Cadastro_Pessoal
        fields = '__all__'
    def get_contas_bancarias(self, obj):
        ContasBancarias_Clientes.objects.filter(cliente=obj)
        return [{
            'id': c.id,
            'banco': c.instituicao.instituicao.razao_social,
            'identificacao': c.instituicao.identificacao,
            'agencia': c.agencia,
            'conta': c.conta,
        }for c in ContasBancarias_Clientes.objects.filter(cliente=obj)]
    
class listFarms(serializers.ModelSerializer):
    class Meta:
        model = Imoveis_Rurais
        fields = ['id', 'nome_imovel']

class detailFarms(serializers.ModelSerializer):
    class Meta:
        model = Imoveis_Rurais
        fields = '__all__'

class serializerInstituicoes_Parceiras(serializers.ModelSerializer):
    razao_social = serializers.CharField(source='instituicao.razao_social', required=False, read_only=True)
    class Meta:
        model = Instituicoes_Parceiras
        fields = ['id', 'razao_social', 'identificacao']

class serializerDetalhamento_Servicos(serializers.ModelSerializer):
    class Meta:
        model = Detalhamento_Servicos
        fields = ['id', 'produto', 'detalhamento_servico']

class serializerContratos_Servicos(serializers.ModelSerializer):
    contratante = serializers.CharField(source='contratante.razao_social', required=False, read_only=True)
    class Meta:
        model = Contratos_Servicos
        fields = ['id', 'contratante', 'produto']

class serializerCard_Produtos(serializers.ModelSerializer):
    list_beneficiarios = serializers.SerializerMethodField()
    info_contrato = serializers.SerializerMethodField()
    info_instituicao = serializers.SerializerMethodField()
    info_detalhamento = serializers.SerializerMethodField()
    phase_name = serializers.CharField(source='phase.descricao')
    class Meta:
        model = Card_Produtos
        fields = '__all__'
    def get_info_instituicao(self, obj):
        if obj.instituicao:
            return {
                'id': obj.instituicao.id,
                'razao_social': obj.instituicao.instituicao.razao_social,
                'identificacao': obj.instituicao.identificacao,
            }
        else:
            return None
    def get_list_beneficiarios(self, obj):
        return [{
            'id': ben.id,
            'razao_social': ben.razao_social,
            'cpf_cnpj': ben.cpf_cnpj,
        }for ben in obj.beneficiario.all()]
    
    def get_info_detalhamento(self, obj):
        if obj.detalhamento:
            return {
                'id': obj.detalhamento.id,
                'detalhamento_servico': obj.detalhamento.detalhamento_servico,
                'produto': obj.detalhamento.produto,
            }
        else:
            return None
    def get_info_contrato(self, obj):
        if obj.contrato:
            return {
                'id': obj.contrato.id,
                'contratante': obj.contrato.contratante.razao_social,
                'produto': obj.contrato.produto,
            }
        else:
            return None

class serializerFase(serializers.ModelSerializer):
    card_produtos_set = serializerCard_Produtos(many=True, read_only=True, required=False)
    class Meta:
        model = Fase
        fields = '__all__'

class serializerPipe(serializers.ModelSerializer):
    fase_set = serializerFase(many=True, read_only=True, required=False)
    class Meta:
        model = Pipe
        fields = '__all__'

class serOperacoesContratatadas(serializers.ModelSerializer):
    name_instituicao = serializers.CharField(source='instituicao.razao_social', required=False, read_only=True)
    name_item = serializers.CharField(source='item_financiado.item', required=False, read_only=True)
    class Meta:
        model = Operacoes_Contratadas
        fields = ['id', 'data_emissao_cedula', 'numero_operacao', 'name_instituicao', 'name_item', 'taxa_juros', 'valor_operacao', 'data_vencimento']