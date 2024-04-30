from rest_framework import serializers
from .models import Card_Produtos, Fase, Pipe, Detalhamento_Servicos, Contratos_Servicos, Cadastro_Pessoal, Card_Prospects
from .models import Instituicoes_Parceiras, Operacoes_Contratadas, ContasBancarias_Clientes, Instituicoes_Razao_Social, Prospect_Monitoramento_Prazos
from datetime import datetime
import requests, json
from backend.settings import TOKEN_PIPEFY_API, URL_PIFEFY_API, MEDIA_URL
from users.models import Profile

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

class serializerInstituicoes_Parceiras(serializers.ModelSerializer):
    razao_social = serializers.CharField(source='instituicao.razao_social', required=False, read_only=True)
    class Meta:
        model = Instituicoes_Parceiras
        fields = ['id', 'razao_social', 'identificacao']

class listInstituicoes_RazaoSocial(serializers.ModelSerializer):
    class Meta:
        model = Instituicoes_Razao_Social
        fields = ['id', 'razao_social', 'cnpj']  

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
        
class serializerCard_Prospects(serializers.ModelSerializer):
    phase_name = serializers.CharField(source='phase.descricao', read_only=True)
    str_prospect = serializers.CharField(source='prospect.cliente', read_only=True)
    status = serializers.SerializerMethodField(read_only=True)
    responsaveis_list = serializers.SerializerMethodField(read_only=True)
    def get_status(self, obj):
        data_prazo = obj.data_vencimento
        status = {'text': 'Atrasado', 'color':'warning' } if data_prazo and datetime.now() > data_prazo else {'text': 'No Prazo', 'color':'success'}
        return status
    def get_responsaveis_list(self, obj):
        respons = obj.responsavel.all()
        responsaveis = f"{respons[0].user.first_name} {respons[0].user.last_name}" if len(respons) == 1 else '-' if len(respons) == 0 else ', '.join([f"{r.user.first_name} {r.user.last_name}" for r in respons])
        return responsaveis
    class Meta:
        model = Card_Prospects
        fields = '__all__'

class detailCard_Prospects(serializers.ModelSerializer):
    phase_name = serializers.CharField(source='phase.descricao', read_only=True)
    str_prospect = serializers.CharField(source='prospect.cliente', read_only=True)
    monitoramentos = serializers.SerializerMethodField(read_only=True)
    pipefy = serializers.SerializerMethodField(read_only=True)
    def get_monitoramentos(self, obj):
        monitoramentos_prazo = Prospect_Monitoramento_Prazos.objects.filter(prospect_id=obj.id)
        monitoramentoslist = [{'id':m.id, 'data_vencimento': m.data_vencimento.strftime("%d/%m/%Y"), 'description': m.description,
            'avatar': MEDIA_URL+m.created_by.profile.avatar.name, 'user': m.created_by.first_name} for m in monitoramentos_prazo]
        return monitoramentoslist
    def get_pipefy(self, obj):
        payload = {"query":"{card (id:" + str(obj.id) + ") {age createdAt url due_date createdBy{name avatarUrl} current_phase{name} comments{created_at author{name avatarUrl} text} assignees{name avatarUrl} due_date}}"}
        headers = {"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"}
        response = requests.post(URL_PIFEFY_API, json=payload, headers=headers)
        obj = json.loads(response.text)
        data_objeto = datetime.strptime(obj["data"]["card"]["due_date"], "%Y-%m-%dT%H:%M:%S%z") if obj["data"]["card"]["due_date"] else '-'
        data_formatada = data_objeto.strftime("%d/%m/%Y %H:%M")
        return {'due_date': data_formatada, 'color_date': 'danger' if datetime.strptime(obj["data"]["card"]["due_date"][:19], "%Y-%m-%dT%H:%M:%S") < datetime.now() else 'success',
            'responsavel': obj["data"]["card"]["assignees"]}     
    class Meta:
        model = Card_Prospects
        fields = '__all__'

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
        fields = ['id', 'data_emissao_cedula', 'numero_operacao', 'name_instituicao', 'name_item', 'taxa_juros', 'valor_operacao', 
            'data_vencimento']

class serMonitoramentoPrazos(serializers.ModelSerializer): 
    # avatar = serializers.CharField(source='created_by.profile.avatar.name', read_only=True)
    avatar = serializers.SerializerMethodField(read_only=True)
    def get_avatar(self, obj):
        path = MEDIA_URL+obj.created_by.profile.avatar.name
        return path
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['data_vencimento', 'prospect', 'description', 'created_by']:
                field.required = True
    class Meta:
        model = Prospect_Monitoramento_Prazos
        fields = '__all__'