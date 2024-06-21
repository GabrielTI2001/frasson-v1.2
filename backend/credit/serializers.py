from rest_framework import serializers
from .models import Operacoes_Contratadas
from alongamentos.models import Cadastro_Alongamentos
from datetime import datetime
import locale, re
from backend.settings import TOKEN_PIPEFY_API, URL_PIFEFY_API, MEDIA_URL, TOKEN_GOOGLE_MAPS_API
from django.db.models import Q, Sum

class listOperacoes(serializers.ModelSerializer):
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', read_only=True)
    name_instituicao = serializers.CharField(source='instituicao.instituicao.razao_social', required=False, read_only=True)
    name_item = serializers.CharField(source='item_financiado.item', required=False, read_only=True)
    class Meta:
        model = Operacoes_Contratadas
        fields = ['id', 'data_emissao_cedula', 'numero_operacao', 'safra', 'str_beneficiario', 'name_instituicao', 'name_item',
            'data_primeiro_vencimento', 'data_vencimento', 'taxa_juros', 'valor_operacao']
        
class detailOperacoes(serializers.ModelSerializer):
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', read_only=True)
    cpf_beneficiario = serializers.CharField(source='beneficiario.cpf_cnpj', read_only=True)
    rg_beneficiario = serializers.CharField(source='beneficiario.numero_rg', read_only=True)
    pipefy = serializers.SerializerMethodField(read_only=True)
    alongamento = serializers.SerializerMethodField(read_only=True)
    token_apimaps = serializers.SerializerMethodField(read_only=True, required=False)
    # def get_pipefy(self, obj):
    #     operacao = {}
    #     payload = {"query":"{table_record(id:" + str(obj.id) + ") {id url created_at created_by{name} record_fields{array_value native_value float_value field{id type}}}}"}
    #     headers = {"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"}
    #     response = requests.post(URL_PIFEFY_API, json=payload, headers=headers)
    #     obj = json.loads(response.text)
    #     operacao['url'] = obj["data"]["table_record"]["url"]
    #     operacao['created_at'] = datetime.strptime(str(obj["data"]["table_record"]["created_at"][:19].replace("T", " ")), '%Y-%m-%d %H:%M:%S').strftime('%d/%m/%Y %H:%M')
    #     operacao['created_by'] = obj["data"]["table_record"]["created_by"]["name"]
    #     record_fields = obj["data"]["table_record"]["record_fields"]
    #     for field in record_fields:
    #         if field["field"]["type"] == "number":
    #             operacao[field["field"]["id"]] = locale.format_string('%.2f', field["float_value"], True) if field["float_value"] != None else '-'

    #         elif field["field"]["type"] == "currency":
    #             operacao[field["field"]["id"]] = locale.currency(field["float_value"], grouping=True) if field["float_value"] != None else '-'

    #         elif field["field"]["type"] == "date":
    #             operacao[field["field"]["id"]] = datetime.strptime(str(field["native_value"]), '%Y-%m-%d').strftime('%d/%m/%Y') if field["native_value"] != None else '-'

    #         elif field["field"]["id"] == "gleba_financiada":
    #             operacao[field["field"]["id"]] = field["native_value"].split(',')
    #             urls = field["native_value"]
    #             list_urls = urls.split(',') #get the file urls and create a list
    #             list_names = re.findall(r'/([^/]+)\.kml', urls) #get the file names and create a list
    #             operacao["kml_files"] = [{'url': x, 'file_name': y} for x, y in zip(list_urls, list_names)]
            
    #         elif field["field"]["id"] == "c_dula_digitalizada":
    #             urls = field["native_value"]
    #             list_urls = urls.split(',') #get the file urls and create a list
    #             list_names = re.findall(r'/([^/]+)\.pdf', urls) #get the file names and create a list
    #             operacao[field["field"]["id"]] = [{'url': x, 'file_name': y} for x, y in zip(list_urls, list_names)]

    #         else:
    #             operacao[field["field"]["id"]] = field["native_value"]
    #     return operacao
    def get_alongamento(self, obj):
        operacao = {}
        if obj.instituicao.instituicao_id == 47106067 and obj.item_financiado.tipo == "Custeio" and "Feijão" not in obj.item_financiado.item:
            operacao['alongamento_permission'] = True
        else:
            operacao['alongamento_permission'] = False

        #verifica se já possui alongamento registrado
        if Cadastro_Alongamentos.objects.filter(operacao_id=obj.id).exists():
            operacao['along'] = True
            operacao['alongamento_total'] = locale.currency(Cadastro_Alongamentos.objects.get(operacao_id=obj.id).valor_total, grouping=True)
            operacao['alongamento_id'] = Cadastro_Alongamentos.objects.get(operacao_id=obj.id).id
        else:
            operacao['along'] = False
        return operacao
    def get_token_apimaps(self, obj):
        return TOKEN_GOOGLE_MAPS_API

    class Meta:
        model = Operacoes_Contratadas
        fields = '__all__'
        