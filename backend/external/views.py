from django.shortcuts import render
from django.http import JsonResponse
import json, requests, re, locale
from datetime import datetime

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

def consulta_cnpj(request):
    search = request.GET.get('search')
    context = {}
    atividades_secundarias = []
    quadro_societario = []

    if search: #se existe uma busca por cnpj
        cnpj = re.sub('\D', '', search) #converte a string em apenas números
        url = f'https://receitaws.com.br/v1/cnpj/{cnpj}' #utilizando f strings
        headers = {"Content-Type": "application/json"}
        response = requests.request("GET", url, headers=headers)  

        if response.status_code == 200: #evita o erro de mais de 3 requisições por minuto!
            obj = json.loads(response.text)

            if obj["status"] == "OK":

                for atividade in obj["atividades_secundarias"]:
                    atividades_secundarias.append({
                        'codigo': atividade['code'],
                        'atividade': atividade['text']
                    })

                for socio in obj["qsa"]:
                    quadro_societario.append({
                        'nome': socio['nome'] if 'nome' in socio else '',
                        'qualificacao': socio['qual'] if 'qual' in socio else '',
                        'pais_origem': socio['pais_origem'] if 'pais_origem' in socio else '',
                        'nome_rep_legal': socio['nome_rep_legal'] if 'nome_rep_legal' in socio else '',
                        'qual_rep_legal': socio['qual_rep_legal'] if 'qual_rep_legal' in socio else '',
                    })

                context['atividade_principal_codigo'] = obj["atividade_principal"][0]["code"]
                context['atividade_principal_texto'] = obj["atividade_principal"][0]["text"]
                context['nome'] = obj["nome"]
                context['fantasia'] = obj["fantasia"]
                context['data_situacao'] = obj["data_situacao"]
                context['complemento'] = obj["complemento"]
                context['tipo'] = obj["tipo"]
                context['telefone'] = obj["telefone"]
                context['email'] = obj["email"]
                context['situacao'] = obj["situacao"]
                context['cep'] = obj["cep"]
                context['municipio'] = f'{obj["municipio"]} - {obj["uf"]}'
                context['porte'] = obj["porte"]
                context['abertura'] = obj["abertura"]
                context['natureza_juridica'] = obj["natureza_juridica"]
                context['cnpj'] = obj["cnpj"]
                context['capital_social'] = obj["capital_social"]
                context['socios'] = quadro_societario
                context['atividades'] = atividades_secundarias
                context['endereco'] = f'{obj["logradouro"]}, N° {obj["numero"]}, Bairro {obj["bairro"]}'
                context['ultima_atualizacao'] = datetime.strptime(str(obj["ultima_atualizacao"].replace("Z", "").replace("T", " ")), '%Y-%m-%d %H:%M:%S.%f').strftime("%d/%m/%Y %H:%M:%S")
            
            else:
                context['msg'] = obj["message"]
                return JsonResponse(context, status=400)
        else:
            context['msg'] = "Somente 3 requisições por minuto. Aguarde e tente novamente..."

    return JsonResponse(context)


def cotacoes_exchange(request):
    #COTAÇÕES DE MOEDAS
    context = {}

    urls = {
        'usd': 'https://economia.awesomeapi.com.br/USD-BRL/1000',
        'eur': 'https://economia.awesomeapi.com.br/EUR-BRL/1000',
        'btc': 'https://economia.awesomeapi.com.br/BTC-BRL/1000'
    }

    for url in urls:
        headers = {"Content-Type": "application/json"}
        response = requests.request("GET", urls[url], headers=headers)
        obj = json.loads(response.text)
        dados_cotacao = []
        dados_hora = []

        current_bid = locale.format_string('%.3f', float(obj[0]["bid"]), True)
        current_varBid = float(obj[0]["varBid"])
        current_pctChange = float(obj[0]["pctChange"])
        color = 'danger' if current_pctChange < 0 else 'success'
        arrow = 'down' if current_pctChange < 0 else 'up'
        updated_at = datetime.strptime(str(obj[0]["create_date"]), '%Y-%m-%d %H:%M:%S').strftime('%d/%m/%Y %H:%M:%S')

        for cotacao in obj:
            bid = float(cotacao["bid"])
            timestamp = int(cotacao["timestamp"])
            data_hora = datetime.fromtimestamp(timestamp)
            hora = datetime.strptime(str(data_hora), '%Y-%m-%d %H:%M:%S').strftime('%H:%M')
            dados_cotacao.append(bid)
            dados_hora.append(hora)

        dados_cotacao.reverse()
        dados_hora.reverse()  

        context[url] = {'dados_cotacao': dados_cotacao, 'dados_hora': dados_hora, 'bid': current_bid, 'varBid': locale.format_string('%.3f', abs(current_varBid), True), 'pctChange': abs(current_pctChange), 'color': color, 'arrow': arrow, 'updated_at': updated_at}
    
    return JsonResponse(context)