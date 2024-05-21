from django.db.models import Q, Sum, Case, When, DecimalField
import requests, json, environ, math
from django.http import JsonResponse, HttpResponse
from backend.settings import TOKEN_PIPEFY_API, URL_PIFEFY_API
from environmental.models import Processos_Outorga_Coordenadas, Processos_APPO_Coordenadas
from finances.models import Saldos_Iniciais, Cobrancas_Pipefy, Reembolso_Cliente, Resultados_Financeiros, Pagamentos_Pipefy
from .pipefyUtils import InsertRegistros, ids_pipes_databases, insert_webhooks, init_data
from pygc import great_circle
import numpy as np
from pyproj import Transformer

env = environ.Env()
environ.Env.read_env()

class Frasson(object):
    def insertAllOnDatabase():
        for id in init_data.keys():
            InsertRegistros(int(id))

    def verificaCoordenadaCadastro(latitude, longitude, type):
        """Função que verifica se a coordenada informada na outorga já está cadastrada (Novo registro). Retorna True se existe coordenada próxima."""
        tolerancia = 0.0001
        if type == 'appo':
            model = Processos_APPO_Coordenadas
        else:
            model = Processos_Outorga_Coordenadas
        coordenadas_proximas = model.objects.filter(
            Q(latitude_gd__range=(float(latitude) - tolerancia, float(latitude) + tolerancia)) &
            Q(longitude_gd__range=(float(longitude) - tolerancia, float(longitude) + tolerancia)))
        
        return coordenadas_proximas.exists()

    def verificaCoordenadaEdicao(latitude, longitude, id, type):
        """Função que verifica se a coordenada informada na outorga já está cadastrada (Edição de registro). Retorna True se existe coordenada próxima."""
        #coordenada atual do registro
        if type == 'appo':
            model = Processos_APPO_Coordenadas
            tolerancia = 0.0001
        else:
            model = Processos_Outorga_Coordenadas
            tolerancia = 0.0001

        coord = model.objects.get(pk=id)
        coordenadas_proximas = model.objects.filter(
            Q(latitude_gd__range=(float(latitude) - tolerancia, float(latitude) + tolerancia)) &
            Q(longitude_gd__range=(float(longitude) - tolerancia, float(longitude) + tolerancia)))
        
        if latitude == coord.latitude_gd and longitude == coord.longitude_gd:
            #só vai fazer o exclude se a nova coordenada for igual ao registro atual (nesse caso, pode atualizar)
            coordenadas_proximas = coordenadas_proximas.exclude(latitude_gd=latitude, longitude_gd=longitude) 

        return coordenadas_proximas.exists()
    
    def avaliar_nivel_nutriente_solo(nutriente, valor):
        """Função para avaliar o nível o nutriente no solo, conforme embrapa"""
        niveis = {
            'calcio': {'min': 2, 'max': 5},
            'magnesio': {'min': 0.5, 'max': 1.5},
            'potassio': {'min': 60, 'max': 180},
            'fosforo': {'min': 10, 'max': 30},
            'fosforo_rem': {'min': 40, 'max': 80},
            'enxofre': {'min': 10, 'max': 20},
            'materia_organica': {'min': 1.5, 'max': 3.0},
            'zinco': {'min': 2, 'max': 4},
            'boro': {'min': 0.4, 'max': 0.8},
            'cobre': {'min': 1.2, 'max': 2.4},
            'ferro': {'min': 40, 'max': 80},
            'manganes': {'min': 20, 'max': 40},
            'rel_ca_mg': {'min': 2, 'max': 5},
            'rel_ca_K': {'min': 15, 'max': 20},
            'rel_mg_k': {'min': 3, 'max': 5},
            'pH_H2O': {'min': 6, 'max': 6.5},
            'pH_CaCl': {'min': 5.5, 'max': 6.0},
        }
        
        if valor is None:
            {'value': '-', 'level': '-', 'color': '-'}
        elif valor < niveis[nutriente]['min']:
            return {'value': valor, 'level': 'BAIXO', 'color': 'warning'}
        elif valor > niveis[nutriente]['max']:
            return {'value': valor, 'level': 'ALTO', 'color': 'primary'}
        else:
            return {'value': valor, 'level': 'IDEAL', 'color': 'success'}
        
    def convert_dd_to_dms(lat=None, long=None):
        """Converts Latitude and Longitude from decimal degrees to degrees, minutes and seconds."""
        str_result = ""

        if lat != None:
            lat_graus = abs(math.trunc(lat))
            lat_min = math.trunc((abs(lat) - abs(math.trunc(lat))) * 60)
            lat_sec = "{:.2f}".format(round((((abs(lat) - abs(math.trunc(lat))) * 60) - math.trunc(lat_min)) * 60, 2))
            lat_direction = 'N' if lat >= 0 else 'S'
            str_result += f'''{lat_graus}°{lat_min}'{lat_sec}"{lat_direction} '''
        
        if long != None:
            lng_graus = abs(math.trunc(long))
            lng_min = math.trunc((abs(long) - abs(math.trunc(long))) * 60)
            lng_sec = "{:.2f}".format(round((((abs(long) - abs(math.trunc(long))) * 60) - math.trunc(lng_min)) * 60, 2))
            lng_direction = 'E' if long >= 0 else 'W'
            str_result += f'''{lng_graus}°{lng_min}'{lng_sec}"{lng_direction} '''
        
        return str_result
    
    def createLatLongPointsPivot(lat, lng, radius, quant):
        """Função que cria vários pontos em torno de uma coordenada, conforme distância do raio"""
        coordinates = []
        offset_degrees = 360 / quant
        for i in np.arange(0, 360, offset_degrees):
            new_point = great_circle(distance=radius, azimuth=i, latitude=lat, longitude=lng)
            coordinates.append({'lat': new_point['latitude'], 'lng': new_point['longitude']})
        return coordinates
    
    def convert_decimal_degrees_to_utm(lat, lon):
        """Convert from Decimal Degrees to UTM"""
        # Calculate the UTM zone from longitude
        zone = int((lon + 180) // 6) + 1
        # Determine if the point is in the Northern or Southern Hemisphere
        south = lat < 0
        # Create a Transformer
        transformer = Transformer.from_crs(
            f"+proj=latlong +datum=WGS84",
            f"+proj=utm +zone={zone} +datum=WGS84 {'+south' if south else ''}",
            always_xy=True
        )
        # Transform the point to UTM
        easting, northing = transformer.transform(lon, lat)
        # Return the UTM coordinates
        return {
            'lng': round(easting, 2),
            'lat': round(northing, 2)
        }

    def getElevationGoogleMapsAPI(locations):
        """Função que retorna altitude em metros de uma determinada coordenada geográfica"""
        locations_str = "|".join([f"{lat},{lng}" for lat, lng in locations])
        url = f'https://maps.googleapis.com/maps/api/elevation/json?locations={locations_str}&key=AIzaSyAa8GzPJUNm1Sz79Jf4FjS727zeSOBo1L0' #utilizando f strings
        headers = {"Content-Type": "application/json"}
        response = requests.request("GET", url, headers=headers)
        obj = json.loads(response.text) 
        elevation = obj["results"]
        return elevation
    
    def saldoInicialAno(year):
        """Função que retorna o saldo inicial do ano de busca"""
        years = list(range(2020, year)) #cria uma lista de anos, iniciando em 2021 até o ano de busca

        #CALCULA SOMÁTORIO DO SALDO INICIAL
        saldos = Saldos_Iniciais.objects.select_related('caixa').values('caixa__caixa', 'valor')
        saldos_iniciais = {saldo['caixa__caixa']: float(saldo['valor']) for saldo in saldos}
        total_saldo_inicial = sum(saldos_iniciais.values())

        #TOTAL COBRANÇAS E PAGAMENTOS
        cobrancas = Cobrancas_Pipefy.objects.filter(phase_id=317532039, data_pagamento__year__in=years).aggregate(total=Sum('valor_faturado'))['total'] or 0
        pagamentos = Pagamentos_Pipefy.objects.filter(phase_id=317163732, data_pagamento__year__in=years).aggregate(total=Sum('valor_pagamento'))['total'] or 0
        
        #TOTAL RESULTADOS FINANCEIROS
        query_resultados_financeiros = Resultados_Financeiros.objects.filter(data__year__in=years).aggregate(
            total_receitas_mov=Sum(Case(When(tipo__tipo='R', then='valor'), default=0, output_field=DecimalField())),
            total_despesas_mov=Sum(Case(When(tipo__tipo='D', then='valor'), default=0, output_field=DecimalField())))
        
        receitas_mov = query_resultados_financeiros.get('total_receitas_mov', 0) or 0
        despesas_mov = query_resultados_financeiros.get('total_despesas_mov', 0) or 0
        
        #TOTAL REEMBOLSOS
        reembolsos = Reembolso_Cliente.objects.filter(data__year__in=years).aggregate(total=Sum('valor'))['total'] or 0
        
        #CALCULA O SALDO INICIAL DO ANO
        saldo_inicial_ano = float(total_saldo_inicial) + float(cobrancas) - float(pagamentos) + float(receitas_mov) - float(despesas_mov) + float(reembolsos)

        return round(saldo_inicial_ano, 2)


    

# GESTÃO DE WEBHOOKS
def create_webhook_pipefy(id, action, url, name):
        main_url = "https://"+env('WEBHOST')+"/api/webhooks/"
        payload = {"query":"mutation {createWebhook(input: {actions: [\"" + action + "\"], name: \"" + name + "\", pipe_id: \"" + str(id) + "\", url: \"" + main_url +  url + "\"}) {webhook {id actions url}}}"}
        headers = {"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"}
        response = requests.post(URL_PIFEFY_API, json=payload, headers=headers)
        obj = json.loads(response.text)
        return JsonResponse(obj)

def delete_webhook_pipefy(id):
        payload = {"query": "mutation {deleteWebhook(input: {id: " + str(id) + "}) {clientMutationId success}}"}
        headers = {"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"}
        response = requests.post(URL_PIFEFY_API, json=payload, headers=headers)
        obj = json.loads(response.text)
        return JsonResponse(obj)

def webhooks_frasson_web_app():
        webhooks_delete_ids = []
        payload = {"query":"{pipes(ids:" + str(ids_pipes_databases) + "){webhooks{id actions url email headers}}}"}
        headers = {"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"}
        response = requests.post(URL_PIFEFY_API, json=payload, headers=headers)
        obj = json.loads(response.text)
        qtdPipes = len(obj["data"]["pipes"]) 
        for i in range(qtdPipes):
            qtdWebhooks = len(obj["data"]["pipes"][i]["webhooks"])
            for j in range(qtdWebhooks):
                webhooks_delete_ids.append(obj["data"]["pipes"][i]["webhooks"][j]["id"])

        # DELETA OS WEBHOOKS EXISTENTES
        for id_delete in webhooks_delete_ids:
            delete_webhook_pipefy(id_delete)

        # CRIA OS WEBHOOKS
        for webhook in insert_webhooks:
            create_webhook_pipefy(webhook['id'], webhook['action'], webhook['url'], webhook['name'])
        return JsonResponse(obj)