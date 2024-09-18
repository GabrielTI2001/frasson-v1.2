from rest_framework import serializers
from .models import Processos_Andamento, Acompanhamento_Processos, Status_Acompanhamento
from django.core.exceptions import ObjectDoesNotExist
from pipeline.models import Fluxo_Gestao_Ambiental
from datetime import datetime, date, timedelta
from users.models import Profile

class detailFollowup(serializers.ModelSerializer):
    inema = serializers.SerializerMethodField(read_only=True)
    acompanhamentos = serializers.SerializerMethodField(read_only=True)
    pipefy = serializers.SerializerMethodField(read_only=True)
    def get_inema(self, obj):
        if self.instance:
            processo_inema = obj
            proxima_consulta = Acompanhamento_Processos.objects.filter(processo=processo_inema.id).order_by('-data', '-created_at').first()
            inema = {
                'proxima_consulta': proxima_consulta.proxima_consulta if proxima_consulta else None
            }
            return inema
        else:
            return {}
    def get_acompanhamentos(self, obj):
        acompanhamentos_database = Acompanhamento_Processos.objects.filter(processo_id = obj.id).order_by('-data', '-created_at')
        acompanhamentos = [{
            'id': acomp.id,
            'status': acomp.status.description,
            'updated_at': acomp.updated_at,
            'data': acomp.data.strftime("%d/%m/%Y") if acomp.data else '-',
            'file': acomp.file.name if acomp.file else None,
            'user': acomp.created_by.first_name,
            'user_avatar': '/media/'+Profile.objects.get(user_id = acomp.created_by.id).avatar.name,
            'description': acomp.detalhamento
        } for acomp in acompanhamentos_database]
        return acompanhamentos
    def get_pipefy(self, obj):
        try:
            processo_pipefy = Fluxo_Gestao_Ambiental.objects.get(pk=obj.processo_id)
            pipefy = {
                'id': processo_pipefy.id,
                'beneficiario': processo_pipefy.beneficiario.razao_social,
                'detalhamento': processo_pipefy.detalhamento.detalhamento_servico,
                'instituicao': processo_pipefy.instituicao.instituicao.razao_social,
                'current_phase': processo_pipefy.phase.descricao,
                'code': processo_pipefy.code,
                'created_at': processo_pipefy.created_at.strftime("%d/%m/%Y %H:%M") or '-'
            }
        except ObjectDoesNotExist:
            pipefy = {}
        return pipefy
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name in ['data_requerimento', 'requerimento']:
                    field.required = True
        else:
            for field_name, field in self.fields.items():
                field.required = False   
    class Meta:
        model = Processos_Andamento
        fields = '__all__'

class detailAcompanhamentoProcessos(serializers.ModelSerializer):
    user_avatar = serializers.SerializerMethodField(read_only=True)
    user_name = serializers.SerializerMethodField(read_only=True)
    str_status = serializers.CharField(source='status.description', required=False, read_only=True)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['data', 'status']:
                field.required = True
    def get_user_avatar(self, obj):
        return 'media/'+obj.created_by.profile.avatar.name
    def get_user_name(self, obj):
        return obj.created_by.first_name+' '+obj.created_by.last_name
    class Meta:
        model = Acompanhamento_Processos
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