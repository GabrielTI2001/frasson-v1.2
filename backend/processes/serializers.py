from rest_framework import serializers
from .models import Processos_Andamento, Acompanhamento_Processos, Status_Acompanhamento
from pipefy.models import Card_Produtos
from datetime import datetime, date
import requests, json, locale
from backend.settings import TOKEN_PIPEFY_API, URL_PIFEFY_API, MEDIA_URL
from users.models import Profile

class detailFollowup(serializers.ModelSerializer):
    inema = serializers.SerializerMethodField(read_only=True)
    acompanhamentos = serializers.SerializerMethodField(read_only=True)
    pipefy = serializers.SerializerMethodField(read_only=True)
    def get_inema(self, obj):
        processo_inema = Processos_Andamento.objects.get(processo_id=obj.processo_id)
        proxima_consulta = Acompanhamento_Processos.objects.filter(processo=processo_inema.id).order_by('-data', '-created_at').first() or None
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
            'proxima_consulta': proxima_consulta.proxima_consulta.strftime("%d/%m/%Y") if proxima_consulta.proxima_consulta != None else '-'
        }
        return inema
    def get_acompanhamentos(self, obj):
        acompanhamentos_database = Acompanhamento_Processos.objects.filter(processo_id = obj.id).order_by('-data', '-created_at')
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
    def get_pipefy(self, obj):
        processo_pipefy = Card_Produtos.objects.get(pk=obj.processo_id)
        pipefy = {
            'id': processo_pipefy.id,
            'beneficiario': ', '.join([beneficiario.razao_social for beneficiario in processo_pipefy.beneficiario.all()]),
            'detalhamento': processo_pipefy.detalhamento.detalhamento_servico,
            'instituicao': processo_pipefy.instituicao.instituicao.razao_social,
            'current_phase': processo_pipefy.phase_name,
            'url': processo_pipefy.card_url,
            'created_at': processo_pipefy.created_at.strftime("%d/%m/%Y %H:%M") or '-'
        }
        return pipefy
    class Meta:
        model = Processos_Andamento
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
        model = Acompanhamento_Processos
        fields = '__all__'

class listStatus(serializers.ModelSerializer):
    class Meta:
        model = Status_Acompanhamento
        fields = '__all__'