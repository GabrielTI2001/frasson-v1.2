from django.db.models import Q
import requests, json, environ
from django.http import JsonResponse, HttpResponse
from backend.settings import TOKEN_PIPEFY_API, URL_PIFEFY_API
from environmental.models import Processos_Outorga_Coordenadas, Processos_APPO_Coordenadas
from .pipefyUtils import InsertRegistros, ids_pipes_databases, insert_webhooks, init_data

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