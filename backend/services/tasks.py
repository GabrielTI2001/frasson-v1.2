from services.models import Commodity_Prices
from bs4 import BeautifulSoup
import requests
from datetime import datetime, date, timedelta
from django.http import HttpResponse

def update_commodity_prices():
    ids = [
        {'id_site':'516', 'tipo': '368', 'tipo_txt':'comum', 'id_db':4}, 
        {'id_site':'505', 'tipo': '368', 'tipo_txt':'comum', 'id_db':1}, 
        {'id_site':'504', 'tipo': '368', 'tipo_txt':'comum', 'id_db':2}, 
        {'id_site':'488', 'tipo': '376', 'tipo_txt':'Carioca', 'id_db':3}
    ]
    #boi gordo, soja, milho e feijão
    today = date.today()
    data_inicio = date.today() - timedelta(days=6)
    data_inicio = data_inicio.strftime("%d/%m/%Y")
    data_final = today.strftime("%d/%m/%Y")
    
    dados = []

    for id in ids:
        url = f"http://www.seagri.ba.gov.br/cotacao?produto={id['id_site']}&praca=286052&tipo={id['tipo']}&data_inicio={data_inicio}&data_final={data_final}"
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            table = soup.find('table', {'class': 'cotacoes sticky-enabled'})          
            if table:
                rows = table.find_all('tr')
                dados = []
                for row in rows[1:]:
                    data_row = [data.text.strip() for data in row.find_all('td')]
                    valor_cotacao = str(data_row[5])

                    if valor_cotacao.lower() not in ["sem cotação", "sem cotações"]:
                        dados.append({
                            'data': datetime.strptime(str(data_row[0]), "%d/%m/%Y").strftime("%Y-%m-%d"),
                            'produto': id['id_db'],
                            'localizacao': 1,
                            'tipo': id['tipo_txt'],
                            'unidade': 'sc 60 kg',
                            'cotacao': str(data_row[5]).replace('R$', '').replace(',', '.'),
                            'source': 'Seagri BA', 
                            'user': 1
                        })

                print(dados)
                bulk_create_cotacao = [
                Commodity_Prices(
                    date = dado['data'],
                    commodity_id = dado['produto'],
                    location_id = dado['localizacao'],
                    type = dado['tipo'],
                    unit = dado['unidade'],
                    price = dado['cotacao'],
                    source = dado['source'],
                    created_by_id = dado['user']
                ) for dado in dados]
                Commodity_Prices.objects.bulk_create(bulk_create_cotacao) 
            else:
                return HttpResponse('Failed to find the table.')        
    return HttpResponse('processo finalizado')
