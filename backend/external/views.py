from django.shortcuts import render
from django.http import JsonResponse
import json, requests

def index_outorgas_ana(request):
    context = {}
    search = request.GET.get('search')
    if search:
        searchUpper = search.upper()
        query = f"where=NOME_DO_REQUERENTE LIKE '%{searchUpper}%' OR MUNICIPIO LIKE'%{searchUpper}%' OR NOME_EMPREENDIMENTO LIKE '%{searchUpper}%' OR NUMERO_PROCESSO LIKE '%{searchUpper}%'"
        outFields = 'INT_CD,NOME_DO_REQUERENTE,NUMERO_PROCESSO,NOME_EMPREENDIMENTO,CATEGORIA,RESOLUCAO,DATA_DE_PUBLICACAO,DATA_DE_VENCIMENTO'
        url = f'https://www.snirh.gov.br/arcgis/rest/services/SRE/OutorgasDireitodeUso/FeatureServer/0/query?{query}&outFields={outFields}&outSR=4326&f=json'
        headers = {"Content-Type": "application/json"}
        response = requests.request("GET", url, headers=headers)
        obj = json.loads(response.text)
        qtd_outorgas = len(obj["features"])
        str_outorgas = (str(qtd_outorgas) + (' processos encontrados' if qtd_outorgas > 1 else ' processo encontrado')) if qtd_outorgas > 0 else 'Nenhum processo encontrado'
        outorgas = [{
            'codigo': feature["attributes"]["INT_CD"],
            'requerente': feature["attributes"]["NOME_DO_REQUERENTE"] or '-',
            'processo': feature["attributes"]["NUMERO_PROCESSO"] or '-',
            'empreendimento': feature["attributes"]["NOME_EMPREENDIMENTO"] or '-',
            'categoria': feature["attributes"]["CATEGORIA"] or '-',
            'resolucao': feature["attributes"]["RESOLUCAO"] or '-',
            'publicacao': feature["attributes"]["DATA_DE_PUBLICACAO"] or '-',
            'vencimento': feature["attributes"]["DATA_DE_VENCIMENTO"] or '-'
        } for feature in obj["features"]]
        context = {
            'outorgas': outorgas, 
            'str_outorgas': str_outorgas
        }
    else:
        context = {
            'outorgas': [], 
            'str_outorgas': 'Nenhuma pesquisa realizada...'
        }
    return JsonResponse(context)