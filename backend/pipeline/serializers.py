from rest_framework import serializers
from .models import Card_Produtos, Fase, Pipe, Detalhamento_Servicos, Contratos_Servicos, Cadastro_Pessoal
from .models import Instituicoes_Parceiras

class serializerCadastro_Pessoal(serializers.ModelSerializer):
    class Meta:
        model = Cadastro_Pessoal
        fields = ['id', 'razao_social', 'cpf_cnpj']

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
    str_fase = serializers.CharField(source='phase.descricao', read_only=True)
    fases_list = serializers.SerializerMethodField(read_only=True)
    info_contrato = serializers.SerializerMethodField(read_only=True)
    list_beneficiario = serializers.SerializerMethodField(read_only=True)
    info_instituicao = serializers.SerializerMethodField(read_only=True)
    info_detalhamento = serializers.SerializerMethodField(read_only=True)
    list_responsaveis = serializers.SerializerMethodField(read_only=True)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name in ['card', 'beneficiario', 'contrato', 'instituicao', 'detalhamento']:
                    field.required = True
        else:
            for field_name, field in self.fields.items():
                field.required = False
    def get_fases_list(self, obj):
        fases_list = [{'id':f.id, 'name':f.descricao} for f in Fase.objects.filter(pipe_id=obj.phase.pipe.id)]
        return fases_list
    def get_list_beneficiario(self, obj):
        beneficiarios = obj.beneficiario.all()
        return [{'id':b.id, 'razao_social':b.razao_social, 'cpf_cnpj':b.cpf_cnpj} for b in beneficiarios]
    def get_list_responsaveis(self, obj):
        responsaveis = obj.responsaveis.all()
        return [{'id':r.id, 'nome':r.first_name+' '+r.last_name, 'avatar':'media/'+r.profile.avatar.name} for r in responsaveis]
    def get_info_instituicao(self, obj):
        if obj.instituicao:
            return {
                'id': obj.instituicao.id,
                'razao_social': obj.instituicao.instituicao.razao_social,
                'identificacao': obj.instituicao.identificacao,
            }
        else:
            return None
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
    class Meta:
        model = Card_Produtos
        fields = '__all__'
        
class listCard_Produtos(serializers.ModelSerializer):
    str_detalhamento = serializers.CharField(source='detalhamento.detalhamento_servico', read_only=True)
    str_beneficiario = serializers.SerializerMethodField(read_only=True)
    list_responsaveis = serializers.SerializerMethodField(read_only=True)
    def get_str_beneficiario(self, obj):
        beneficiarios = obj.beneficiario.all()
        return beneficiarios[0].razao_social if len(beneficiarios) > 0 else '-'
    def get_list_responsaveis(self, obj):
        responsaveis = obj.responsaveis.all()
        return [{'id':r.id, 'nome':r.first_name+' '+r.last_name, 'avatar':'media/'+r.profile.avatar.name} for r in responsaveis]
    class Meta:
        model = Card_Produtos
        fields = ['id', 'uuid', 'code', 'str_detalhamento', 'str_beneficiario', 'card', 'prioridade', 'created_at', 'data_vencimento', 'list_responsaveis']


class serializerFase(serializers.ModelSerializer):
    card_produtos_set = listCard_Produtos(many=True, read_only=True, required=False)
    def validate_done(self, value):
        done = self.initial_data.get('done')
        count_done = Fase.objects.filter(pipe_id=self.initial_data.get('pipe'), done=True).count()
        if done == True and count_done > 0:
            raise serializers.ValidationError("Já existe uma Fase de Conclusão para esse Pipe")
        return value
    class Meta:
        model = Fase
        fields = '__all__'

class serializerPipe(serializers.ModelSerializer):
    fase_set = serializerFase(many=True, read_only=True, required=False)
    class Meta:
        model = Pipe
        fields = '__all__'