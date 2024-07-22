from django.db.models import Q, Sum, Case, When, DecimalField
import requests, json, environ, math, locale, re
from django.http import JsonResponse, HttpResponse
from django.core.exceptions import ObjectDoesNotExist
from backend.settings import TOKEN_PIPEFY_API, URL_PIFEFY_API, TOKEN_API_INFOSIMPLES
from environmental.models import Outorgas_INEMA_Coordenadas, APPO_INEMA_Coordenadas
from administrator.models import RequestsAPI
from finances.models import Reembolso_Cliente, Resultados_Financeiros, Transferencias_Contas, Caixas_Frasson, Cobrancas, Pagamentos
from .pipefyUtils import InsertRegistros, ids_pipes_databases, insert_webhooks, init_data
from pygc import great_circle
import numpy as np
from pyproj import Transformer
from datetime import datetime
from django.db import transaction, IntegrityError, connection

env = environ.Env()
environ.Env.read_env()

class Frasson(object):
    def insertAllOnDatabase():
        for id in init_data.keys():
            InsertRegistros(int(id))
    
    def valida_cpf_cnpj(value):
        cpf_pattern = re.compile(r'(^[0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}$)')
        cnpj_pattern = re.compile(r'(^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}\-[0-9]{2}$)')
        return cpf_pattern.match(value) or cnpj_pattern.match(value)
        
    def valida_cep(value): 
        pattern = re.compile(r'(^\d{5}-\d{3})$')
        return pattern.match(value)
            
    
    # def createNotificationMessageUsers(str_title, str_subject, str_text, str_icon, str_icon_color, int_recipient, int_sender=1):
    #     """Cria mensagens no centro de notificações"""
    #     Notifications_Messages.objects.create(
    #         title = str_title, 
    #         subject = str_subject, 
    #         text = str_text,
    #         icon = str_icon,
    #         icon_color = str_icon_color,
    #         recipient_id = int_recipient,
    #         sender_id = int_sender
    #     )

    #     return JsonResponse({'msg': 'ok'})


    def verificaCoordenadaCadastro(latitude, longitude, type):
        """Função que verifica se a coordenada informada na outorga já está cadastrada (Novo registro). Retorna True se existe coordenada próxima."""
        tolerancia = 0.0001
        if type == 'appo':
            model = APPO_INEMA_Coordenadas
        else:
            model = Outorgas_INEMA_Coordenadas
        coordenadas_proximas = model.objects.filter(
            Q(latitude_gd__range=(float(latitude) - tolerancia, float(latitude) + tolerancia)) &
            Q(longitude_gd__range=(float(longitude) - tolerancia, float(longitude) + tolerancia)))
        
        return coordenadas_proximas.exists()

    def verificaCoordenadaEdicao(latitude, longitude, id, type):
        """Função que verifica se a coordenada informada na outorga já está cadastrada (Edição de registro). Retorna True se existe coordenada próxima."""
        #coordenada atual do registro
        if type == 'appo':
            model = APPO_INEMA_Coordenadas
            tolerancia = 0.0001
        else:
            model = Outorgas_INEMA_Coordenadas
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

    
    def convert_dms_to_dd(dms):
        """Converte uma string DMS para graus decimais com formatos específicos, tratando direções e sinais."""
        # Limpa espaços extras e substitui vírgula por ponto para uniformidade
        dms_cleaned = dms.replace(',', '.').replace(' ', '')
        
        # Expressão regular para extrair partes da coordenada e direção, se presente
        dms_pattern = re.compile(r'(-?\d+)°(\d+)[\'](\d+\.\d+)(?:"([NSWE])?)')
        match = dms_pattern.match(dms_cleaned)
        
        if match: # se o formato
            degrees, minutes, seconds, direction = match.groups()
            
            # Convertendo de DMS para grau decimal
            degrees = float(degrees)
            minutes = float(minutes)
            seconds = float(seconds)
            
            # Calcular o valor decimal
            decimal = abs(degrees) + (minutes / 60) + (seconds / 3600)
            
            # Aplicar negatividade baseada na direção
            if direction == 'S' or direction == 'W' or degrees < 0:
                decimal = -abs(decimal)

            return round(decimal, 8)
        
        else:
            return "Formato DMS inválido!"
    
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
        saldos = Caixas_Frasson.objects.all().values('nome', 'saldo_inicial')
        saldos_iniciais = {saldo['nome']: float(saldo['saldo_inicial'] or 0) for saldo in saldos}
        total_saldo_inicial = sum(saldos_iniciais.values())

        #TOTAL COBRANÇAS E PAGAMENTOS
        cobrancas = Cobrancas.objects.filter(status='PG', data_pagamento__year__in=years).aggregate(total=Sum('valor_faturado'))['total'] or 0
        pagamentos = Pagamentos.objects.filter(status='PG', data_pagamento__year__in=years).aggregate(total=Sum('valor_pagamento'))['total'] or 0
        
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

    def saldosAtuaisContasBancarias():
        """Função que retorna os saldos das contas bancárias e os valores em aberto das Cobranças e Pagamentos"""
        saldos_iniciais = {}
        
        caixas = [
            {'id': 1, 'caixa': 'Caixa A', 'name': 'banco_a'}, 
            {'id': 667993245, 'caixa': 'Banco do Brasil', 'name': 'banco_brasil'}, 
            {'id': 667993332, 'caixa': 'Caixa Econômica Federal', 'name': 'caixa_economica'}, 
            {'id': 667993459, 'caixa': 'Santander', 'name': 'banco_santander'}, 
            {'id': 667994503, 'caixa': 'Sicredi', 'name': 'banco_sicredi'}, 
            {'id': 667994628, 'caixa': 'Dinheiro', 'name': 'dinheiro'}, 
            {'id': 667994767, 'caixa': 'Grupo Frasson', 'name': 'grupo_frasson'}, 
            {'id': 667994860, 'caixa': 'Sicoob', 'name': 'banco_sicoob'}, 
            {'id': 667994970, 'caixa': 'Aplicação Banco do Brasil', 'name': 'aplicacao_bb'}, 
            {'id': 667995029, 'caixa': 'Aplicação XP Investimentos', 'name': 'aplicacao_xp'}
        ]

        #BUSCA OS SALDOS INICIAIS DOS CAIXAS
        for caixa in caixas:
            try:
                obj_saldo = Caixas_Frasson.objects.get(id=caixa['id'])
            except ObjectDoesNotExist:
                obj_saldo = None

            saldos_iniciais[caixa['name']] = round(float(obj_saldo.saldo_inicial or 0), 2) if obj_saldo != None else 0

        # SOMA VALORES REEMBOLSO POR CAIXA
        # reembolsos = {}
        # reembolsos_db = Reembolso_Cliente.objects.values('caixa_destino').annotate(total=Sum('valor'))
        # for caixa in caixas:
        #     for reembolso in reembolsos_db:
        #         if caixa['id'] in reembolso.values():
        #             reembolsos[caixa['name']] = round(float(reembolso['total']), 2)
        #             break
            
        #     if not caixa['name'] in reembolsos:
        #         reembolsos[caixa['name']] = 0
        
        # TOTAL RECEITAS FINANCEIRAS
        receitas_financeiras = {}
        rnop_db = Resultados_Financeiros.objects.filter(tipo__tipo='R').values('caixa').annotate(total=Sum('valor'))
        for caixa in caixas:
            for rnop in rnop_db:
                if caixa['id'] in rnop.values():
                    receitas_financeiras[caixa['name']] = round(float(rnop['total']), 2)
                    break
            
            if not caixa['name'] in receitas_financeiras:
                receitas_financeiras[caixa['name']] = 0

        # TOTAL DESPESAS FINANCEIRAS
        despesas_financeiras = {}
        dnop_db = Resultados_Financeiros.objects.filter(tipo__tipo='D').values('caixa').annotate(total=Sum('valor'))
        for caixa in caixas:
            for dnop in dnop_db:
                if caixa['id'] in dnop.values():
                    despesas_financeiras[caixa['name']] = round(float(dnop['total']), 2)
                    break
            
            if not caixa['name'] in despesas_financeiras:
                despesas_financeiras[caixa['name']] = 0

        # SOMA VALORES ENTRADAS DE TRANSFERENCIA POR CAIXA
        entradas_transferencias = {}
        entradas_db = Transferencias_Contas.objects.values('caixa_destino').annotate(total=Sum('valor'))
        for caixa in caixas:
            for transf in entradas_db:
                if caixa['id'] in transf.values():
                    entradas_transferencias[caixa['name']] = round(float(transf['total']), 2)
                    break
            
            if not caixa['name'] in entradas_transferencias:
                entradas_transferencias[caixa['name']] = 0

        # SOMA VALORES SAÍDAS DE TRANSFERENCIAS POR CAIXA
        saidas_transferencias = {}
        saidas_db = Transferencias_Contas.objects.values('caixa_origem').annotate(total=Sum('valor'))
        for caixa in caixas:
            for transf in saidas_db:
                if caixa['id'] in transf.values():
                    saidas_transferencias[caixa['name']] = round(float(transf['total']), 2)
                    break
                    
            if not caixa['name'] in saidas_transferencias:
                saidas_transferencias[caixa['name']] = 0

        #TOTAL PAGAMENTOS POR CAIXA (PAGOS)
        pagamentos = {}
        pagamentos_db = Pagamentos.objects.filter(status='e').values('caixa').annotate(total=Sum('valor_pagamento'))
        for caixa in caixas:
            for pagamento in pagamentos_db:
                if caixa['id'] in pagamento.values():
                    pagamentos[caixa['name']] = round(float(pagamento['total']), 2)
                    break
                    
            if not caixa['name'] in pagamentos:
                pagamentos[caixa['name']] = 0
        
        #TOTAL COBRANÇAS POR CAIXA (PAGOS)
        cobrancas = {}
        cobrancas_db = Cobrancas.objects.filter(status='e').values('caixa').annotate(total=Sum('valor_faturado'))
        for caixa in caixas:
            for pagamento in cobrancas_db:
                if caixa['id'] in pagamento.values():
                    cobrancas[caixa['name']] = round(float(pagamento['total']), 2)
                    break
                    
            if not caixa['name'] in cobrancas:
                cobrancas[caixa['name']] = 0

        #CALCULA O SALDO DE CADA CONTA E INCLUI NO OBJETO 'Saldos'
        saldos = {}
        colors = {}
        valor_total = 0
        for caixa in caixas:
            saldo = round(saldos_iniciais[caixa['name']] + (cobrancas[caixa['name']] - pagamentos[caixa['name']]) + (entradas_transferencias[caixa['name']] - saidas_transferencias[caixa['name']]) + (receitas_financeiras[caixa['name']] - despesas_financeiras[caixa['name']]), 2)
            valor_total = valor_total + saldo
            saldos[caixa['name']] = locale.currency(saldo, grouping=True)
            colors[caixa['name']] = 'primary' if saldo >= 0 else 'danger'

        #FATURAMENTO CONSOLIDADO POR PRODUTO
        query_cobrancas_abertas= Cobrancas.objects.aggregate(
            aguardando=Sum(Case(When(status='e', then='saldo_devedor'), default=0, output_field=DecimalField())),
            notificacao=Sum(Case(When(status='e', then='saldo_devedor'), default=0, output_field=DecimalField())),
            faturamento=Sum(Case(When(status='e', then='saldo_devedor'), default=0, output_field=DecimalField())),
            confirmacao=Sum(Case(When(status='e', then='saldo_devedor'), default=0, output_field=DecimalField())))

        total_aguardando = query_cobrancas_abertas.get('aguardando', 0) or 0
        total_notificacao = query_cobrancas_abertas.get('notificacao', 0) or 0
        total_faturamento = query_cobrancas_abertas.get('faturamento', 0) or 0
        total_confirmacao = query_cobrancas_abertas.get('confirmacao', 0) or 0
        total_aberto_cobrancas = float(total_aguardando + total_notificacao + total_faturamento + total_confirmacao)

        #PAGAMENTOS ABERTOS POR FASE (CONFERÊNCIA E AGENDADO)
        query_pagamentos_abertos= Pagamentos.objects.aggregate(
            conferencia=Sum(Case(When(status='e', then='valor_pagamento'), default=0, output_field=DecimalField())),
            agendado=Sum(Case(When(status='e', then='valor_pagamento'), default=0, output_field=DecimalField())))

        aberto_conferencia = query_pagamentos_abertos.get('conferencia', 0) or 0
        aberto_agendado = query_pagamentos_abertos.get('agendado', 0) or 0
        total_aberto_pagamentos = float(aberto_conferencia + aberto_agendado)

        #calcula a previsão de saldo
        previsao_saldo = float(valor_total + total_aberto_cobrancas + total_aberto_pagamentos)

        obj = {
            'saldos': saldos,
            'colors': colors,
            'saldo_total': locale.currency(valor_total, grouping=True),
            'aberto_aguardando': locale.currency(total_aguardando, grouping=True),
            'aberto_notificacao': locale.currency(total_notificacao, grouping=True),
            'aberto_faturamento': locale.currency(total_faturamento, grouping=True),
            'aberto_confirmacao': locale.currency(total_confirmacao, grouping=True),
            'total_aberto_cobrancas': locale.currency(total_aberto_cobrancas, grouping=True),
            'total_aberto_pagamentos': locale.currency(total_aberto_pagamentos, grouping=True),
            'aberto_conferencia': locale.currency(aberto_conferencia, grouping=True),
            'aberto_agendado': locale.currency(aberto_agendado, grouping=True),
            'previsao_saldo': locale.currency(previsao_saldo, grouping=True),
        }

        return obj
    
    @transaction.atomic
    def getParcelasSIGEFImovelRural(codigo_imovel, login_cpf, login_senha):
        """"Função que retorna as parcelas de imóvel rural no SIGEF a partir do CCIR"""
        main_url = "https://api.infosimples.com/api/v2/consultas/incra/sigef"      
        connection.close()  
        response_parcelas = requests.get(url=f"{main_url}/parcelas", params={"codigo_imovel": codigo_imovel, "login_cpf": login_cpf, "login_senha": login_senha, "token": TOKEN_API_INFOSIMPLES, "timeout": 300})
        obj_parcelas = response_parcelas.json()
        connection.connect()  
        data = {}
        RequestsAPI.objects.create(
            type='SP', cod_resposta=obj_parcelas["code"], url=f"{main_url}/parcelas", codigo=codigo_imovel, api_id=1,
            text_resposta=obj_parcelas["code_message"], valor_cobrado=obj_parcelas["header"]["price"], 
            hora_requisicao=obj_parcelas["header"]["requested_at"][:19], 
            tempo_decorrido_ms=obj_parcelas["header"]["elapsed_time_in_milliseconds"]
        )

        if obj_parcelas["code"] == 200 and obj_parcelas["data_count"] > 0:
            parcelas_obj = obj_parcelas["data"][0]["parcelas"]
            parcelas = [{
                'parcela_nome': parcela["nome"],
                'area_ha': parcela["area_ha"],
                'cns': parcela["cns"],
                'matricula': parcela["matricula"],
                'codigo_parcela': parcela["codigo_parcela"]
            }for parcela in parcelas_obj]
            
            for parcela in parcelas:
                connection.close()
                response = requests.get(url=f"{main_url}/detalhes-parcela", params={"codigo_parcela": parcela["codigo_parcela"], "login_cpf": login_cpf, "login_senha": login_senha, "token": TOKEN_API_INFOSIMPLES, "timeout": 300})
                obj = response.json()
                connection.connect()
                RequestsAPI.objects.create(
                    type='SV', cod_resposta=obj["code"], url=f"{main_url}/detalhes-parcela", codigo=parcela["codigo_parcela"], 
                    text_resposta=obj["code_message"], valor_cobrado=obj["header"]["price"], api_id=1,
                    hora_requisicao=obj["header"]["requested_at"][:19],
                    tempo_decorrido_ms=obj_parcelas["header"]["elapsed_time_in_milliseconds"]
                )

                if obj["code"] == 200 and obj["data_count"] > 0:
                    limites_obj = obj["data"][0]["limites"] #lista
                    vertices_obj = obj["data"][0]["vertices"] #lista
                    parcela["situacao_imovel"] = obj["data"][0]["area_georreferenciada"]["situacao"]
                    parcela["natureza"] = obj["data"][0]["area_georreferenciada"]["natureza"]
                    parcela["nome_detentor"] = obj["data"][0]["identificacao_detentor"][0]["nome"]
                    parcela["cpf_cnpj_detentor"] = obj["data"][0]["identificacao_detentor"][0]["cpf_cnpj"]
                    parcela["data_entrada"] = obj["data"][0]["informacoes_parcela"]["data_entrada"]
                    parcela["situacao_parcela"] = obj["data"][0]["informacoes_parcela"]["situacao"]
                    parcela["responsavel_tecnico"] = obj["data"][0]["informacoes_parcela"]["responsavel_tecnico"]
                    parcela["documento_rt"] = obj["data"][0]["informacoes_parcela"]["documento_rt"]
                    parcela["mensagem_parcela"] = obj["data"][0]["informacoes_parcela"]["mensagem"]
                    parcela["cartorio_registro"] = obj["data"][0]["registro"]["cartorio"]
                    parcela["municipio_registro"] = obj["data"][0]["registro"]["municipio_uf"]

                    limites = [{
                        "do_vertice": limite["do_vertice"],
                        "ao_vertice": limite["ao_vertice"],
                        "tipo": limite["tipo"],
                        "lado": limite["lado"],
                        "azimute": limite["azimute"],
                        "comprimento": str(limite["comprimento"]).replace(",", "."),
                        "confrontante": limite["confrontante"],
                    }for limite in limites_obj]                    

                    vertices = [{
                        "codigo": vertice["codigo"],
                        "longitude": Frasson.convert_dms_to_dd(vertice["logitude"]),
                        "sigma_long": str(vertice["sigma_long"]).replace(",", "."),
                        "latitude": Frasson.convert_dms_to_dd(vertice["latitude"]),
                        "sigma_lat": str(vertice["sigma_lat"]).replace(",", "."),
                        "altitude": str(vertice["altitude"]).replace(",", "."),
                        "sigma_altitude": str(vertice["sigma_altitude"]).replace(",", "."),
                        "metodo_posicionamento": vertice["metodo_posicionamento"]
                    }for vertice in vertices_obj]
                    
                    data["parcelas"] = parcelas
                    data[parcela["codigo_parcela"]] = {"limites": limites, "vertices": vertices}
        return data

    def getCoordinatesCARImovelRural(car):
        """Função que retorna as coordenadas do shape CAR do imóvel rural"""
        car_corr = re.sub(r'[-.]', '', car) #corrige o formato do CAR
        data = {}
        url = "https://api.infosimples.com/api/v2/consultas/car/demonstrativo"  
        connection.close() 
        response = requests.get(url, params={"car": car_corr,"token": TOKEN_API_INFOSIMPLES, "timeout": 600})
        obj = response.json()
        connection.connect()
        RequestsAPI.objects.create(
            type='CI', cod_resposta=obj["code"], url=url, codigo=car_corr, api_id=2,
            text_resposta=obj["code_message"], valor_cobrado=obj["header"]["price"], 
            hora_requisicao=obj["header"]["requested_at"][:19], tempo_decorrido_ms=obj["header"]["elapsed_time_in_milliseconds"]
        )    
        if obj["code"] == 200 and obj["data_count"] > 0:
            data["code"] = obj["code"]
            data["area_preservacao_permanente"] = obj["data"][0]["area_preservacao_permanente"]
            data["area_uso_restrito"] = obj["data"][0]["area_uso_restrito"]
            data["numero_car"] = obj["data"][0]["car"]
            data["condicao_cadastro"] = obj["data"][0]["condicao_cadastro"]
            data["area_imovel"] = obj["data"][0]["imovel"]["area"]
            data["numero_car"] = obj["data"][0]["car"]
            data["modulos_fiscais"] = obj["data"][0]["imovel"]["modulos_fiscais"]
            data["endereco_municipio"] = f'{obj["data"][0]["imovel"]["endereco_municipio"]} - {obj["data"][0]["imovel"]["endereco_uf"]}' 
            data["endereco_latitude"] = Frasson.convert_dms_to_dd(obj["data"][0]["imovel"]["endereco_latitude"])
            data["endereco_longitude"] = Frasson.convert_dms_to_dd(obj["data"][0]["imovel"]["endereco_longitude"])
            data["data_registro"] = datetime.strptime(obj["data"][0]["imovel"]["registro_data"], '%d/%m/%Y').date()
            data["data_analise"] = datetime.strptime(obj["data"][0]["imovel"]["analise_data"], '%d/%m/%Y').date() if obj["data"][0]["imovel"]["analise_data"] else None
            data["data_retificacao"] = datetime.strptime(obj["data"][0]["imovel"]["retificacao_data"], '%d/%m/%Y').date() if obj["data"][0]["imovel"]["retificacao_data"] else None
            data["reserva_situacao"] = obj["data"][0]["reserva"]["situacao"]
            data["reserva_area_averbada"] = obj["data"][0]["reserva"]["area_averbada"]
            data["reserva_area_nao_averbada"] = obj["data"][0]["reserva"]["area_nao_averbada"]
            data["reserva_legal_proposta"] = obj["data"][0]["reserva"]["area_legal_proposta"]
            data["reserva_legal_declarada"] = obj["data"][0]["reserva"]["area_legal_declarada"]
            data["situacao"] = obj["data"][0]["situacao"]
            data["solo_area_nativa"] = obj["data"][0]["solo"]["area_nativa"]
            data["solo_area_uso"] = obj["data"][0]["solo"]["area_uso"]
            data["solo_area_servidao"] = obj["data"][0]["solo"]["area_servidao_administrativa"]
            data["restricoes"] = obj["data"][0]["restricoes"]

            url = "https://api.infosimples.com/api/v2/consultas/car/imovel"   
            connection.close()
            response = requests.get(url, params={"car": car,"token": TOKEN_API_INFOSIMPLES, "timeout": 600})
            obj2 = response.json()
            connection.connect()
            RequestsAPI.objects.create(
                type='CC', cod_resposta=obj["code"], url=url, codigo=car_corr, api_id=2,
                text_resposta=obj["code_message"], valor_cobrado=obj["header"]["price"], 
                hora_requisicao=obj["header"]["requested_at"][:19], tempo_decorrido_ms=obj["header"]["elapsed_time_in_milliseconds"]
            )
            data["coordinates"] = [{'latitude': coord[1], 'longitude': coord[0]} for coord in obj2["data"][0]["coordenadas"]]
        else:
            data["code"] = obj["code"]
            data["message"] = obj["code_message"]

        return data


    

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