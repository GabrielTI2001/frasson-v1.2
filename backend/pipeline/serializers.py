from rest_framework import serializers
from .models import Fluxo_Gestao_Ambiental, Fase, Pipe, PVTEC, Acompanhamento_GAI, Atualizacoes_Acompanhamento_GAI
from .models import Phases_History, Card_Comments, Card_Activities, Card_Anexos, Status_Acompanhamento
from datetime import datetime
from datetime import datetime, date, timedelta
import locale
from users.models import Profile

def calcduration(first_in, last_in, last_to):
    if not last_to:
        last_to = datetime.now()
    if (first_in and last_to < first_in) or (last_in and last_to < last_in):
        last_to = datetime.now()
    result = last_to - first_in if first_in else last_to - last_in or 0
    if first_in and last_in:
        result = last_to - first_in
    return int(result.total_seconds())

class serializerFluxoAmbiental(serializers.ModelSerializer):
    pipe_code = serializers.IntegerField(source='phase.pipe.code', read_only=True)
    str_fase = serializers.CharField(source='phase.descricao', read_only=True)
    str_created_by = serializers.SerializerMethodField(read_only=True)
    fases_list = serializers.SerializerMethodField(read_only=True)
    info_contrato = serializers.SerializerMethodField(read_only=True)
    list_beneficiario = serializers.SerializerMethodField(read_only=True)
    info_instituicao = serializers.SerializerMethodField(read_only=True)
    info_detalhamento = serializers.SerializerMethodField(read_only=True)
    list_beneficiario = serializers.SerializerMethodField(read_only=True)
    list_responsaveis = serializers.SerializerMethodField(read_only=True)
    history_fases_list = serializers.SerializerMethodField(read_only=True)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name in ['card', 'beneficiario', 'contrato', 'instituicao', 'detalhamento']:
                    field.required = True
                else:
                    field.required = False
        else:
            for field_name, field in self.fields.items():
                field.required = False
    def get_fases_list(self, obj):
        fases_list = [{'id':f.id, 'name':f.descricao} for f in Fase.objects.filter(pipe_id=obj.phase.pipe_id)]
        return fases_list
    def get_str_created_by(self, obj):
        return obj.created_by.first_name+' '+obj.created_by.last_name
    def get_list_beneficiario(self, obj):
        b = obj.beneficiario
        return [{'id':obj.beneficiario.id, 'uuid':obj.beneficiario.uuid, 'razao_social':b.razao_social, 'cpf_cnpj':b.cpf_cnpj}]
    def get_list_responsaveis(self, obj):
        responsaveis = obj.responsaveis.all()
        return [{'id':r.id, 'nome':r.first_name+' '+r.last_name, 'avatar':'media/'+r.profile.avatar.name} for r in responsaveis]
    def get_info_instituicao(self, obj):
        if obj.instituicao:
            return {
                'id': obj.instituicao.id,
                'uuid':obj.instituicao.uuid,
                'razao_social': obj.instituicao.instituicao.razao_social,
                'identificacao': obj.instituicao.identificacao,
            }
        else:
            return None
    def get_info_detalhamento(self, obj):
        if obj.detalhamento:
            return {
                'id': obj.detalhamento.id,
                'uuid': obj.detalhamento.uuid,
                'detalhamento_servico': obj.detalhamento.detalhamento_servico,
                'produto': obj.detalhamento.produto.description,
            }
        else:
            return None
    def get_info_contrato(self, obj):
        if obj.contrato:
            return {
                'id': obj.contrato.id,
                'uuid': obj.contrato.uuid,
                'contratante': obj.contrato.contratante.razao_social if obj.contrato.contratante else '-',
                'produto': ', '.join([s.produto.description for s in obj.contrato.servicos.all().distinct()]),
            }
        else:
            return None
    def get_history_fases_list(self, obj):
        list = [
            {'id':f.id, 'last_time_in':f.last_time_in, 'last_time_out':f.last_time_out, 'first_time_in':f.first_time_in,
                'duration':calcduration(f.first_time_in, f.last_time_in, f.last_time_out), 
                'phase_name': f.phase.descricao  
            } 
            for f in Phases_History.objects.filter(fluxo_ambiental_id=obj.id)
        ]
        return list
    def validate_phase(self, value):
        fase_anterior = self.instance.phase
        if (value.id not in [d.id for d in fase_anterior.destinos_permitidos.all()]):
            raise serializers.ValidationError("Não é permitido mover para essa fase")
        return value
    def update(self, instance, validated_data):
        responsaveis_data = validated_data.pop('responsaveis', [])
        instance = super().update(instance, validated_data)
        if responsaveis_data:
            responsaveis_ids = [r.id for r in responsaveis_data]
            instance.responsaveis.set(responsaveis_ids)
        return instance
    class Meta:
        model = Fluxo_Gestao_Ambiental
        fields = '__all__'
        
class listFluxoAmbiental(serializers.ModelSerializer):
    str_detalhamento = serializers.CharField(source='detalhamento.detalhamento_servico', read_only=True)
    str_instituicao = serializers.CharField(source='instituicao.instituicao.razao_social', read_only=True)
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', read_only=True)
    list_responsaveis = serializers.SerializerMethodField(read_only=True)
    str_fase = serializers.CharField(source='phase.descricao', read_only=True)
    def get_list_responsaveis(self, obj):
        responsaveis = obj.responsaveis.all()
        return [{'id':r.id, 'nome':r.first_name+' '+r.last_name, 'avatar':'media/'+r.profile.avatar.name} for r in responsaveis]
    class Meta:
        model = Fluxo_Gestao_Ambiental
        fields = ['id', 'uuid', 'code', 'str_detalhamento', 'str_beneficiario', 'prioridade', 'created_at', 'data_vencimento', 'list_responsaveis', 
            'str_instituicao', 'str_fase']


class serializerFase(serializers.ModelSerializer):
    fluxo_gestao_ambiental_set = listFluxoAmbiental(many=True, read_only=True, required=False)
    def validate_done(self, value):
        done = self.initial_data.get('done')
        count_done = Fase.objects.filter(pipe_id=self.initial_data.get('pipe'), done=True).count()
        if done == True and count_done > 0:
            raise serializers.ValidationError("Já existe uma Fase de Conclusão para esse Pipe")
        return value
    class Meta:
        model = Fase
        fields = '__all__'

class listFase(serializers.ModelSerializer):
    list_destinos = serializers.SerializerMethodField(read_only=True, required=False)
    def get_list_destinos(self, obj):
        destinos_permitidos = obj.destinos_permitidos.all()
        return [{'id':r.id, 'descricao':r.descricao} for r in destinos_permitidos]
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name in ['pipe', 'responsaveis', 'descricao']:
                    field.required = True
        else:
            for field_name, field in self.fields.items():
                field.required = False
    class Meta:
        model = Fase
        fields = '__all__'

class serializerPipe(serializers.ModelSerializer):
    fase_set = serializerFase(many=True, read_only=True, required=False)
    class Meta:
        model = Pipe
        fields = '__all__'

class listPipe(serializers.ModelSerializer):
    list_pessoas = serializers.SerializerMethodField(read_only=True)
    def get_list_pessoas(self, obj):
        responsaveis = obj.pessoas.all()
        return [{'value':r.id, 'label':r.first_name+' '+r.last_name} for r in responsaveis]
    class Meta:
        model = Pipe
        fields = '__all__'

class serializerComments(serializers.ModelSerializer):
    str_fase = serializers.CharField(source='phase.descricao', read_only=True)
    user = serializers.SerializerMethodField(read_only=True)
    def get_user(self, obj):
        return {'id':obj.created_by.id, 'name':obj.created_by.first_name+' '+obj.created_by.last_name, 'avatar':obj.created_by.profile.avatar.name}
    class Meta:
        model = Card_Comments
        fields = '__all__'

class serializerActivities(serializers.ModelSerializer):
    user = serializers.SerializerMethodField(read_only=True)
    def get_user(self, obj):
        if obj.updated_by:
            return {'id':obj.updated_by.id, 'name':obj.updated_by.first_name+' '+obj.updated_by.last_name}
        else:
            return {'id':'', 'name':'-'+' '+'-'}
    class Meta:
        model = Card_Activities
        fields = '__all__'

class serializerAnexos(serializers.ModelSerializer):
    user = serializers.SerializerMethodField(read_only=True)
    def get_user(self, obj):
        if obj.uploaded_by:
            return {'id':obj.uploaded_by.id, 'name':obj.uploaded_by.first_name+' '+obj.uploaded_by.last_name}
        else:
            return {'id':'', 'name':'-'+' '+'-'}
    def validate_file(self, value):
        if self.initial_data.get('pvtec'):
           pvtec = self.initial_data.get('pvtec')
           if not Card_Anexos.objects.filter(pvtec_id=pvtec, pvtec_response=False).exists():
               raise serializers.ValidationError("Insira pelo menos 1 anexo de solicitação!")
        return value
    class Meta:
        model = Card_Anexos
        fields = '__all__'

class detailPVTEC(serializers.ModelSerializer):
    user = serializers.SerializerMethodField(read_only=True)
    list_responsaveis = serializers.SerializerMethodField(read_only=True)
    str_cliente = serializers.SerializerMethodField(read_only=True)
    info_detalhamento = serializers.SerializerMethodField(read_only=True)
    atividade_display = serializers.CharField(source='get_atividade_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    str_created_by = serializers.SerializerMethodField(read_only=True)
    def get_list_responsaveis(self, obj):
        responsaveis = obj.responsaveis.all()
        return [{'id':r.id, 'nome':r.first_name+' '+r.last_name, 'avatar':'media/'+r.profile.avatar.name} for r in responsaveis]
    def get_str_cliente(self, obj):
        if obj.fluxo_ambiental:
            return obj.fluxo_ambiental.beneficiario.razao_social
        if obj.fluxo_credito:
            return obj.fluxo_ambiental.beneficiarios.all()[0].razao_social
    def get_info_detalhamento(self, obj):
        if obj.fluxo_ambiental:
            return {'detalhamento':obj.fluxo_ambiental.detalhamento.detalhamento_servico, 
                'produto': obj.fluxo_ambiental.detalhamento.produto.description}
        if obj.fluxo_credito:
            return {'detalhamento':obj.fluxo_credito.detalhamento.detalhamento_servico,
                    'produto': obj.fluxo_credito.detalhamento.produto.description}
    def get_user(self, obj):
        if obj.created_by:
            return {'id':obj.created_by.id, 'name':obj.created_by.first_name+' '+obj.created_by.last_name}
        else:
            return {'id':'', 'name':'-'+' '+'-'}
    def get_str_created_by(self, obj):
        return obj.created_by.first_name+' '+obj.created_by.last_name
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name in ['orientacoes', 'status', 'atividade', 'responsaveis']:
                    field.required = True
        else:
            for field_name, field in self.fields.items():
                field.required = False
                field.allow_empty = True
    def update(self, instance, validated_data):
        responsaveis_data = validated_data.pop('responsaveis', [])
        instance = super().update(instance, validated_data)
        if responsaveis_data:
            responsaveis_ids = [r.id for r in responsaveis_data]
            instance.responsaveis.set(responsaveis_ids)
        return instance
    class Meta:
        model = PVTEC
        fields = '__all__'

class listPVTEC(serializers.ModelSerializer):
    str_produto = serializers.SerializerMethodField(read_only=True)
    str_responsaveis = serializers.SerializerMethodField(read_only=True)
    str_cliente = serializers.SerializerMethodField(read_only=True)
    str_detalhamento = serializers.SerializerMethodField(read_only=True)
    atividade_display = serializers.CharField(source='get_atividade_display', read_only=True)
    info_status = serializers.SerializerMethodField(read_only=True)
    def get_str_responsaveis(self, obj):
        responsaveis = obj.responsaveis.all()
        return ', '.join([r.first_name+' '+r.last_name for r in responsaveis])
    def get_str_cliente(self, obj):
        if obj.fluxo_ambiental:
            return obj.fluxo_ambiental.beneficiario.razao_social
        if obj.fluxo_credito:
            return obj.fluxo_ambiental.beneficiarios.all()[0].razao_social
    def get_str_detalhamento(self, obj):
        if obj.fluxo_ambiental:
            return obj.fluxo_ambiental.detalhamento.detalhamento_servico
        if obj.fluxo_credito:
            return obj.fluxo_ambiental.detalhamento.detalhamento_servico
    def get_str_produto(self, obj):
        if obj.fluxo_ambiental:
            return obj.fluxo_ambiental.detalhamento.produto.description
        if obj.fluxo_credito:
            return obj.fluxo_ambiental.detalhamento.produto.description
    def get_info_status(self, obj):
        if obj.status:
            return {'color': 'warning' if obj.status == 'EA' else 'success', 'text': obj.get_status_display()}
    class Meta:
        model = PVTEC
        fields = ['uuid', 'str_produto', 'str_cliente', 'str_detalhamento', 'str_responsaveis', 'atividade_display', 'info_status', 'status']

class detailFollowup(serializers.ModelSerializer):
    inema = serializers.SerializerMethodField(read_only=True)
    acompanhamentos = serializers.SerializerMethodField(read_only=True)
    fluxo_gai = serializers.SerializerMethodField(read_only=True)
    def get_inema(self, obj):
        processo_inema = Acompanhamento_GAI.objects.get(processo_id=obj.processo_id)
        proxima_consulta = Atualizacoes_Acompanhamento_GAI.objects.filter(processo=processo_inema.id).order_by('-data', '-created_at').first() or None
        data_formacao = processo_inema.data_formacao or None
        dias_formado = date.today() - data_formacao if data_formacao is not None else '-'
        num_dias_formado = dias_formado.days if data_formacao is not None else '-'
        data_formacao_str = f"{datetime.strptime(str(data_formacao), '%Y-%m-%d').strftime('%d/%m/%Y')} (há {num_dias_formado}{' dias' if num_dias_formado > 1 else ' dia'})" if data_formacao is not None else '-'
        inema = {
            'id': processo_inema.id,
            'requerimento': processo_inema.requerimento,
            'data_requerimento': datetime.strptime(str(processo_inema.data_requerimento), '%Y-%m-%d').strftime("%d/%m/%Y"),
            'data_enquadramento': datetime.strptime(str(processo_inema.data_enquadramento), '%Y-%m-%d').strftime("%d/%m/%Y") if processo_inema.data_enquadramento != None else '-',
            'data_validacao': datetime.strptime(str(processo_inema.data_validacao), '%Y-%m-%d').strftime("%d/%m/%Y") if processo_inema.data_validacao != None else '-',
            'valor_boleto': locale.format_string('%.0f', processo_inema.valor_boleto, True) if processo_inema.valor_boleto != None else '-',
            'vencimento_boleto': datetime.strptime(str(processo_inema.vencimento_boleto), '%Y-%m-%d').strftime("%d/%m/%Y") if processo_inema.vencimento_boleto != None else '-',
            'data_formacao': data_formacao_str,
            'processo_inema': processo_inema.numero_processo if processo_inema.numero_processo != None else '-',
            'processo_sei': processo_inema.processo_sei if processo_inema.processo_sei != None else '-',
            'proxima_consulta': proxima_consulta.proxima_consulta.strftime("%d/%m/%Y") if proxima_consulta != None else '-'
        }
        return inema
    def get_acompanhamentos(self, obj):
        acompanhamentos_database = Atualizacoes_Acompanhamento_GAI.objects.filter(processo_id = obj.id).order_by('-data', '-created_at')
        acompanhamentos = [{
            'id': acomp.id,
            'status': acomp.status.description,
            'updated_at': acomp.updated_at,
            'data': acomp.data.strftime("%d/%m/%Y") if acomp.data else '-',
            'file': acomp.file.name if acomp.file else None,
            'user': acomp.user.first_name,
            'user_avatar': '/media/'+Profile.objects.get(user_id = acomp.user.id).avatar.name,
            'description': acomp.detalhamento
        } for acomp in acompanhamentos_database]
        return acompanhamentos
    def get_fluxo_gai(self, obj):
        card_gai = Fluxo_Gestao_Ambiental.objects.get(pk=obj.processo_id)
        pipefy = {
            'id': card_gai.id,
            'beneficiario': card_gai.beneficiario.razao_social,
            'detalhamento': card_gai.detalhamento.detalhamento_servico,
            'instituicao': card_gai.instituicao.instituicao.razao_social,
            'current_phase': card_gai.phase.descricao,
            'created_at': card_gai.created_at
        }
        return pipefy
    class Meta:
        model = Acompanhamento_GAI
        fields = '__all__'

class detailAcompanhamentoProcessos(serializers.ModelSerializer):
    user_avatar = serializers.SerializerMethodField(read_only=True)
    str_status = serializers.CharField(source='status.description', required=False, read_only=True)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['data', 'status']:
                field.required = True
    def get_user_avatar(self, obj):
        return '/media/'+obj.user.profile.avatar.name
    class Meta:
        model = Atualizacoes_Acompanhamento_GAI
        fields = '__all__'
    def save(self, **kwargs):
        instance = super().save(**kwargs)
        update_date = self.validated_data.get('data')
        if update_date:
            dias_proxima_consulta = 15
            proxima_consulta = update_date + timedelta(days=dias_proxima_consulta)
            instance.proxima_consulta = proxima_consulta
            instance.save()
        return instance

class listStatus(serializers.ModelSerializer):
    class Meta:
        model = Status_Acompanhamento
        fields = '__all__'