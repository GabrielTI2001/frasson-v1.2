from rest_framework import serializers
from .models import Operacoes_Contratadas, Operacoes_Contratadas_Cedulas, Itens_Financiados, Operacoes_Contratadas_Glebas
from alongamentos.models import Cadastro_Alongamentos
from datetime import datetime
import locale, re
from backend.settings import TOKEN_GOOGLE_MAPS_API
from django.db.models import Q, Sum

class listItemsFinanciados(serializers.ModelSerializer):
    class Meta:
        model = Itens_Financiados
        fields = '__all__'

class listOperacoes(serializers.ModelSerializer):
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', read_only=True)
    name_instituicao = serializers.CharField(source='instituicao.instituicao.razao_social', required=False, read_only=True)
    name_item = serializers.CharField(source='item_financiado.item', required=False, read_only=True)
    class Meta:
        model = Operacoes_Contratadas
        fields = ['id', 'uuid', 'data_emissao_cedula', 'numero_operacao', 'safra', 'str_beneficiario', 'name_instituicao', 'name_item',
            'data_primeiro_vencimento', 'data_vencimento', 'taxa_juros', 'valor_operacao']
        
class detailOperacoes(serializers.ModelSerializer):
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', read_only=True)
    str_instituicao = serializers.CharField(source='instituicao.instituicao.razao_social', read_only=True)
    str_item_financiado = serializers.CharField(source='item_financiado.item', read_only=True)
    cpf_beneficiario = serializers.CharField(source='beneficiario.cpf_cnpj', read_only=True)
    rg_beneficiario = serializers.CharField(source='beneficiario.numero_rg', read_only=True)
    str_created_by = serializers.CharField(source='created_by.first_name', read_only=True)
    alongamento = serializers.SerializerMethodField(read_only=True)
    token_apimaps = serializers.SerializerMethodField(read_only=True, required=False)
    list_imoveis = serializers.SerializerMethodField(read_only=True)
    cedulas = serializers.SerializerMethodField(read_only=True)
    coordenadas = serializers.SerializerMethodField(read_only=True)
    def get_coordenadas(self, obj):
        coordenadas = [{'lat':float(c.latitude_gd), 'lng':float(c.longitude_gd), 'id':c.id} for c in Operacoes_Contratadas_Glebas.objects.filter(operacao=obj)]
        return coordenadas
    def get_list_imoveis(self, obj):
        return [{'id': fazenda.id, 'nome':fazenda.nome+' - '+fazenda.matricula} for fazenda in obj.imoveis_beneficiados.all()]
    def get_alongamento(self, obj):
        operacao = {}
        if obj.instituicao and obj.instituicao.instituicao_id == 47106067 and obj.item_financiado.tipo == "Custeio" and "Feijão" not in obj.item_financiado.item:
            operacao['alongamento_permission'] = True
        else:
            operacao['alongamento_permission'] = True
        #verifica se já possui alongamento registrado
        if Cadastro_Alongamentos.objects.filter(operacao_id=obj.id).exists():
            operacao['along'] = True
            operacao['alongamento_total'] = locale.currency(Cadastro_Alongamentos.objects.get(operacao_id=obj.id).valor_total, grouping=True)
            operacao['alongamento_id'] = Cadastro_Alongamentos.objects.get(operacao_id=obj.id).uuid
        else:
            operacao['along'] = False
        return operacao
    def get_token_apimaps(self, obj):
        return TOKEN_GOOGLE_MAPS_API
    def get_cedulas(self, obj):
        cedulas = Operacoes_Contratadas_Cedulas.objects.filter(operacao=obj)
        return [{'id':doc.id, 'url':"/media/"+doc.file.name, 'name':'Cédula '+str(doc.id)} for doc in cedulas]
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['beneficiario', 'instituicao', 'imoveis_beneficiados', 'item_financiado', 'valor_operacao', 'data_vencimento',
                'data_emissao_cedula']:
                field.required = True
    class Meta:
        model = Operacoes_Contratadas
        fields = '__all__'

class serOperacoesCedulas(serializers.ModelSerializer):
    path = serializers.CharField(source='file.name', read_only=True)
    class Meta:
        model = Operacoes_Contratadas_Cedulas
        fields = '__all__'
