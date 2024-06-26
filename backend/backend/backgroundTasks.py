import requests
from backend.settings import TOKEN_API_INFOSIMPLES
from django.db.models import Count
from .frassonUtilities import Frasson
from background_task import background
from farms.models import Imoveis_Rurais
from farms.models import Certificacao_Sigef_Parcelas, Certificacao_Sigef_Parcelas_Limites, Certificacao_Sigef_Parcelas_Vertices
from farms.models import Cadastro_Ambiental_Rural, Cadastro_Ambiental_Rural_Coordenadas, Cadastro_Ambiental_Rural_Restricoes
from time import sleep
from datetime import datetime
import re
from django.db import transaction, OperationalError, connection

def verificar_e_adicionar_tracos(string):
    regex_valido = re.compile(r'^[A-Za-z0-9]{2}-[A-Za-z0-9]{7}-.+$')

    if regex_valido.match(string):
        return string
    
    string_limpa = re.sub(r'-', '', string)
    
    if len(string_limpa) >= 9:
        parte1 = string_limpa[:2]
        parte2 = string_limpa[2:9]
        parte3 = string_limpa[9:]
        return f"{parte1}-{parte2}-{parte3}"
    else:
        return None

@background(schedule=0)
def teste():
    print("teste")
    obj = {'parcelas': [{'parcela_nome': 'Agropecuária Stumm - Parte 1', 'area_ha': 1092.9113, 'cns': '00.820-1', 'matricula': '11486', 'codigo_parcela': 'daa5b3ce-2f60-4199-b5c0-86ef3c9093ac', 'situacao_imovel': 'Imóvel Registrado', 'natureza': 'Particular', 'nome_detentor': 'XXXXXXo Luiz de CastroXXXXXX', 'cpf_cnpj_detentor': '***.572.711**', 'data_entrada': '14/08/2018', 'situacao_parcela': 'Certificada - Com Registro em Cartório Confirmado', 'responsavel_tecnico': 'EDMUNDO NUNES NOVAIS (A4T)', 'documento_rt': 'BA20180123398 - BA', 'mensagem_parcela': '', 'cartorio_registro': 'CARTÓRIO DE REGISTRO GERAL DE IMÓVEIS, REGISTRO DE TÍTULOS E DOCUMENTOS E REGISTRO PESSOA JURÍDICAS', 'municipio_registro': 'Correntina - BA'}], 'daa5b3ce-2f60-4199-b5c0-86ef3c9093ac': {'limites': [{'do_vertice': 'AC9-M-AL23', 'ao_vertice': 'AC9-M-AL22', 'tipo': 'LA1', 'lado': 'EXTERNO', 'azimute': "169°32'", 'comprimento': '1267.69', 'confrontante': 'CNS: 00.820-1 - Mat.:8282 - José dos Reis Santiago e Outros'}, {'do_vertice': 'AC9-M-AL22', 'ao_vertice': 'A4T-M-3325', 'tipo': 'LA1', 'lado': 'EXTERNO', 'azimute': "169°12'", 'comprimento': '108.66', 'confrontante': 'CNS: 00.820-1 - Mat.:8282 - José dos Reis Santiago e Outros'}, {'do_vertice': 'A4T-M-3325', 'ao_vertice': 'AC9-M-AL21', 'tipo': 'LA1', 'lado': 'EXTERNO', 'azimute': "169°14'", 'comprimento': '8199.95', 'confrontante': 'CNS: 00.820-1 - Mat.:8282 - José dos Reis Santiago e Outros'}, {'do_vertice': 'AC9-M-AL21', 'ao_vertice': 'AC9-M-AL01', 'tipo': 'LA1', 'lado': 'EXTERNO', 'azimute': "169°15'", 'comprimento': '20.65', 'confrontante': 'CNS: 00.820-1 - Mat.:8282 - José dos Reis Santiago e Outros'}, {'do_vertice': 'AC9-M-AL01', 'ao_vertice': 'AC9-M-AL37', 'tipo': 'LA1', 'lado': 'EXTERNO', 'azimute': "169°20'", 'comprimento': '1500.73', 'confrontante': 'CNS: 00.820-1 - Mat.:8282 - José dos Reis Santiago e Outros'}, {'do_vertice': 'AC9-M-AL37', 'ao_vertice': 'AC9-M-AL36', 'tipo': 'LA1', 'lado': 'EXTERNO', 'azimute': "168°50'", 'comprimento': '2983.62', 'confrontante': 'CNS: 00.820-1 - Mat.:8282 - José dos Reis Santiago e Outros'}, {'do_vertice': 'AC9-M-AL36', 'ao_vertice': 'AC9-M-AL35', 'tipo': 'LA1', 'lado': 'EXTERNO', 'azimute': "174°28'", 'comprimento': '236.50', 'confrontante': 'CNS: 00.820-1 - Mat.:8282 - José dos Reis Santiago e Outros'}, {'do_vertice': 'AC9-M-AL35', 'ao_vertice': 'A4T-P-3800', 'tipo': 'LN1', 'lado': 'EXTERNO', 'azimute': "301°21'", 'comprimento': '242.70', 'confrontante': 'Rio da Éguas'}, {'do_vertice': 'A4T-P-3800', 'ao_vertice': 'A4T-P-3801', 'tipo': 'LN1', 'lado': 'EXTERNO', 'azimute': "218°33'", 'comprimento': '64.46', 'confrontante': 'Rio da Éguas'}, {'do_vertice': 'A4T-P-3801', 'ao_vertice': 'A4T-P-3802', 'tipo': 'LN1', 'lado': 'EXTERNO', 'azimute': "308°08'", 'comprimento': '122.43', 'confrontante': 'Rio da Éguas'}], 'vertices': [{'codigo': 'AC9-M-AL23', 'longitude': -45.6905725, 'sigma_long': '0.00', 'latitude': -13.41159528, 'sigma_lat': '0.00', 'altitude': '771.25', 'sigma_altitude': '0.01', 'metodo_posicionamento': 'PG1'}, {'codigo': 'AC9-M-AL22', 'longitude': -45.68844639, 'sigma_long': '0.00', 'latitude': -13.42286167, 'sigma_lat': '0.00', 'altitude': '788.57', 'sigma_altitude': '0.01', 'metodo_posicionamento': 'PG1'}, {'codigo': 'A4T-M-3325', 'longitude': -45.68825861, 'sigma_long': '0.01', 'latitude': -13.42382639, 'sigma_lat': '0.00', 'altitude': '789.36', 'sigma_altitude': '0.01', 'metodo_posicionamento': 'PG1'}, {'codigo': 'AC9-M-AL21', 'longitude': -45.67411444, 'sigma_long': '0.00', 'latitude': -13.49663028, 'sigma_lat': '0.00', 'altitude': '788.07', 'sigma_altitude': '0.01', 'metodo_posicionamento': 'PG1'}, {'codigo': 'AC9-M-AL01', 'longitude': -45.67407889, 'sigma_long': '0.00', 'latitude': -13.49681361, 'sigma_lat': '0.00', 'altitude': '788.29', 'sigma_altitude': '0.01', 'metodo_posicionamento': 'PG1'}, {'codigo': 'AC9-M-AL37', 'longitude': -45.67151639, 'sigma_long': '0.02', 'latitude': -13.51014278, 'sigma_lat': '0.03', 'altitude': '792.11', 'sigma_altitude': '0.06', 'metodo_posicionamento': 'PG1'}, {'codigo': 'AC9-M-AL36', 'longitude': -45.66618667, 'sigma_long': '0.00', 'latitude': -13.53659861, 'sigma_lat': '0.00', 'altitude': '730.25', 'sigma_altitude': '0.01', 'metodo_posicionamento': 'PG1'}, {'codigo': 'AC9-M-AL35', 'longitude': -45.66597611, 'sigma_long': '0.00', 'latitude': -13.53872611, 'sigma_lat': '0.00', 'altitude': '727.45', 'sigma_altitude': '0.01', 'metodo_posicionamento': 'PG1'}, {'codigo': 'A4T-P-3800', 'longitude': -45.66789056, 'sigma_long': '0.01', 'latitude': -13.53758472, 'sigma_lat': '0.01', 'altitude': '727.05', 'sigma_altitude': '0.01', 'metodo_posicionamento': 'PG1'}, {'codigo': 'A4T-P-3801', 'longitude': -45.66826167, 'sigma_long': '0.00', 'latitude': -13.53804028, 'sigma_lat': '0.00', 'altitude': '726.54', 'sigma_altitude': '0.01', 'metodo_posicionamento': 'PG1'}]}}
    sleep(10)
    print("teste finalizado")
    return obj

@background(schedule=0)
@transaction.atomic
def InsertParcelasImoveisRurais(id_imovel, ccir):
    cadastrado = Certificacao_Sigef_Parcelas.objects.filter(imovel_id=id_imovel).exists()
    if not cadastrado:
        try:
            print("iniciando")
            connection.close()
            obj = Frasson.getParcelasSIGEFImovelRural(ccir, '030.665.050-90', '339521Dani*')
            connection.connect()
            parcelas = obj['parcelas'] if 'parcelas' in obj else []
            for p in parcelas:
                parcela = Certificacao_Sigef_Parcelas.objects.create(
                    imovel_id = int(id_imovel),
                    nome = p['parcela_nome'],
                    area_ha = p['area_ha'],
                    detentor = p['nome_detentor'],
                    cpf_cnpj_detentor = p['cpf_cnpj_detentor'],
                    cns = p['cns'],
                    codigo_parcela = p['codigo_parcela'],
                    matricula = p['matricula']
                )
                limites = obj[parcela.codigo_parcela]['limites']
                for l in limites:
                    Certificacao_Sigef_Parcelas_Limites.objects.create(
                        parcela = parcela,
                        do_vertice = l['do_vertice'],
                        ao_vertice = l['ao_vertice'],
                        tipo = l['tipo'],
                        lado = l['lado'],
                        azimute = l['azimute'],
                        comprimento = l['comprimento'],
                        confrontante = l['confrontante']
                    )  
                vertices = obj[parcela.codigo_parcela]['vertices']
                for v in vertices:
                    Certificacao_Sigef_Parcelas_Vertices.objects.create(
                        parcela = parcela,
                        codigo = v['codigo'],
                        longitude = v['longitude'],
                        sigma_long = v['sigma_long'],
                        latitude = v['latitude'],
                        sigma_lat = v['sigma_lat'],
                        sigma_altitude = v['sigma_altitude'],
                        metodo_posicionamento = v['metodo_posicionamento']
                    )  
                if len(vertices) > 0:
                    Certificacao_Sigef_Parcelas_Vertices.objects.create(
                        parcela = parcela,
                        codigo = vertices[0]['codigo'],
                        longitude = vertices[0]['longitude'],
                        sigma_long = vertices[0]['sigma_long'],
                        latitude = vertices[0]['latitude'],
                        sigma_lat = vertices[0]['sigma_lat'],
                        sigma_altitude = vertices[0]['sigma_altitude'],
                        metodo_posicionamento = vertices[0]['metodo_posicionamento']
                    )  
            print("finalizado")
        except:
            print(f"failed:")
            return

@background(schedule=0)
def InsertCARImoveisRurais(id_imovel, cod_car):
    print("iniciando2")
    car = verificar_e_adicionar_tracos(cod_car.replace('.',''))
    imovel = Imoveis_Rurais.objects.get(pk=id_imovel)
    cadastrado = Cadastro_Ambiental_Rural.objects.filter(numero_car=car)
    if cadastrado.exists():
        print("vinculando")
        imovel.car = cadastrado.first()
        imovel.save()
    elif car:
        print("teste - não cadastrado")
        connection.close()
        obj = Frasson.getCoordinatesCARImovelRural(car)
        connection.connect()
        if obj["code"] == 200:
            cardb = Cadastro_Ambiental_Rural.objects.create(
                numero_car = obj["numero_car"], area_preservacao_permanente = obj["area_preservacao_permanente"],
                area_uso_restrito = obj["area_uso_restrito"], condicao_cadastro = obj["condicao_cadastro"],
                area_imovel = obj["area_imovel"], modulos_fiscais = obj["modulos_fiscais"],
                endereco_municipio = obj["endereco_municipio"], endereco_latitude = obj["endereco_latitude"],
                endereco_longitude = obj["endereco_longitude"], data_registro = obj["data_registro"],
                data_analise = obj["data_analise"], data_retificacao = obj["data_retificacao"],
                reserva_situacao = obj["reserva_situacao"], reserva_area_averbada = obj["reserva_area_averbada"],
                reserva_area_nao_averbada = obj["reserva_area_nao_averbada"], reserva_legal_proposta = obj["reserva_legal_proposta"],
                reserva_legal_declarada = obj["reserva_legal_declarada"], situacao = obj["situacao"], solo_area_nativa = obj["solo_area_nativa"], 
                solo_area_uso = obj["solo_area_uso"], solo_area_servidao = obj["solo_area_servidao"],
            )
            restricoes = obj["restricoes"]
            for r in restricoes:
                Cadastro_Ambiental_Rural_Restricoes.objects.create(
                    car = cardb,
                    origem = r['origem'],
                    descricao = r['descricao'],
                    data_processamento = datetime.strptime(r['processamento'], '%d/%m/%Y').date() if r['processamento'] else None,
                    area_conflito = r['area_conflito'],
                    percentual = r['percentual']
                )
            coordenadas = obj["coordinates"]
            for c in coordenadas:
                Cadastro_Ambiental_Rural_Coordenadas.objects.create(
                    car = cardb,
                    longitude = c["longitude"],
                    latitude = c["latitude"],
                )
            imovel.car = cardb
            imovel.save()
        
    print("finalizado2")


def ConferirmoveisRurais():
    imoveis = Imoveis_Rurais.objects.filter(codigo_car__isnull=False, car_id__isnull=True)
    # nao_cadastrado_sigef = Imoveis_Rurais.objects.annotate(total_parcelas = Count('certificacao_sigef_parcelas')).filter(
    #     total_parcelas=0, ccir__isnull=False)
    i = 0
    for imovel in imoveis:
        car = verificar_e_adicionar_tracos(imovel.codigo_car.replace('.',''))
        cadastrado = Cadastro_Ambiental_Rural.objects.filter(numero_car=car)
        if cadastrado.exists():
            print(f"{imovel.nome} - vinculando")
            imovel.car = cadastrado.first()
            imovel.save()
        elif car:
            print(f"{car} - {imovel.nome} - NÃO ENCONTRADO")
            connection.close()
            obj = Frasson.getCoordinatesCARImovelRural(imovel.codigo_car)
            connection.connect()
            if obj["code"] == 200:
                print(f"{imovel.nome} - Cadastrando CAR")
                cardb = Cadastro_Ambiental_Rural.objects.create(
                    numero_car = obj["numero_car"], area_preservacao_permanente = obj["area_preservacao_permanente"],
                    area_uso_restrito = obj["area_uso_restrito"], condicao_cadastro = obj["condicao_cadastro"],
                    area_imovel = obj["area_imovel"], modulos_fiscais = obj["modulos_fiscais"],
                    endereco_municipio = obj["endereco_municipio"], 
                    endereco_latitude = obj["endereco_latitude"] if type(obj["endereco_latitude"]) != str else None,
                    endereco_longitude = obj["endereco_longitude"] if type(obj["endereco_longitude"]) != str else None, 
                    data_registro = obj["data_registro"],
                    data_analise = obj["data_analise"], data_retificacao = obj["data_retificacao"],
                    reserva_situacao = obj["reserva_situacao"], reserva_area_averbada = obj["reserva_area_averbada"],
                    reserva_area_nao_averbada = obj["reserva_area_nao_averbada"], reserva_legal_proposta = obj["reserva_legal_proposta"],
                    reserva_legal_declarada = obj["reserva_legal_declarada"], situacao = obj["situacao"], solo_area_nativa = obj["solo_area_nativa"], 
                    solo_area_uso = obj["solo_area_uso"], solo_area_servidao = obj["solo_area_servidao"],
                )
                restricoes = obj["restricoes"]
                for r in restricoes:
                    Cadastro_Ambiental_Rural_Restricoes.objects.create(
                        car = cardb,
                        origem = r['origem'],
                        descricao = r['descricao'],
                        data_processamento = datetime.strptime(r['processamento'], '%d/%m/%Y').date() if r['processamento'] else None,
                        area_conflito = r['area_conflito'],
                        percentual = r['percentual']
                    )
                coordenadas = obj["coordinates"]
                for c in coordenadas:
                    Cadastro_Ambiental_Rural_Coordenadas.objects.create(
                        car = cardb,
                        longitude = c["longitude"],
                        latitude = c["latitude"],
                    )
                imovel.car = cardb
                imovel.save()
        if i == 50:
            break
        i+=1