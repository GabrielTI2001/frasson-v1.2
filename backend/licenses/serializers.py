from rest_framework import serializers
from .models import Cadastro_Licencas
from backend.frassonUtilities import Frasson
from backend.pipefyUtils import getTableRecordPipefy
import locale, requests, json
from datetime import date, timedelta
from backend.settings import TOKEN_GOOGLE_MAPS_API, TOKEN_PIPEFY_API, URL_PIFEFY_API

class listLicenses(serializers.ModelSerializer):
    status = serializers.SerializerMethodField(required=False, read_only=True)
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', required=False, read_only=True)
    cpf_cnpj = serializers.CharField(source='beneficiario.cpf_cnpj', required=False, read_only=True)
    str_instituicao = serializers.CharField(source='instituicao.abreviatura', required=False, read_only=True)
    str_tipo_licenca = serializers.CharField(source='tipo_licenca.detalhamento_servico', required=False, read_only=True)
    list_propriedades = serializers.SerializerMethodField(required=False, read_only=True)
    def get_status(self, obj):
        if obj.data_validade:
            return {
                'color': 'danger' if obj.data_validade < date.today() else 'success', 
                'text': 'Vencida' if obj.data_validade < date.today() else 'Vigente'
            }
        else:           
            return {
                'color': 'dark', 
                'text': '-'
            }
    def get_list_propriedades(self, obj):
        if obj.propriedades:
            return ', '.join([f"{r.nome}" for r in obj.propriedades.all()])
        else:
            return '-'
    class Meta:
        model = Cadastro_Licencas
        fields = ['uuid', 'str_beneficiario', 'cpf_cnpj', 'str_instituicao', 'str_tipo_licenca', 'list_propriedades', 
            'data_emissao', 'data_validade', 'status']
        
class detailLicenses(serializers.ModelSerializer):
    status = serializers.SerializerMethodField(required=False, read_only=True)
    status_renovacao = serializers.SerializerMethodField(required=False, read_only=True)
    data_renovacao = serializers.SerializerMethodField(required=False, read_only=True)
    list_propriedades = serializers.SerializerMethodField(required=False, read_only=True)
    info_user = serializers.SerializerMethodField(read_only=True, required=False)
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', required=False, read_only=True)
    cpf_cnpj = serializers.CharField(source='beneficiario.cpf_cnpj', required=False, read_only=True)
    str_instituicao = serializers.CharField(source='instituicao.razao_social', required=False, read_only=True)
    str_tipo_licenca = serializers.CharField(source='tipo_licenca.detalhamento_servico', required=False, read_only=True)
    def get_info_user(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'first_name': obj.created_by.first_name,
                'last_name': obj.created_by.last_name,
            }
        else:
            return None
    def get_status(self, obj):
        if obj.data_validade:
            return {
                'color': 'danger' if obj.data_validade < date.today() else 'success', 
                'text': 'Vencida' if obj.data_validade < date.today() else 'Vigente'
            }
        else:           
            return {
                'color': 'dark', 
                'text': '-'
            }
    def get_list_propriedades(self, obj):
        if obj.propriedades:
            farms = [{'value':r.id, 'label':r.nome} for r in obj.propriedades.all()]
            return farms
    def get_data_renovacao(self, obj):
        data_renovacao = obj.data_validade - timedelta(days=obj.dias_renovacao)
        return data_renovacao
    def get_status_renovacao(self, obj):
        data_renovacao = obj.data_validade - timedelta(days=obj.dias_renovacao)
        return {'text': 'No Prazo', 'color': 'success'} if data_renovacao> date.today() else {'text': 'Expirado', 'color': 'warning'}
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['beneficiario', 'instituicao', 'propriedades', 'tipo_licenca', 'data_emissao', 'data_validade', 'dias_renovacao']:
                field.required = True
    class Meta:
        model = Cadastro_Licencas
        fields = '__all__'