from django.shortcuts import render
from .serializers import serCommodity_Prices, serLocations, serProdutos
from rest_framework import viewsets
from .models import Commodity_Prices, Localizacao_Cotacao, Commodity_Cotacao
from django.db.models import Q
from django.db.models import Avg, StdDev, Min, Max
from rest_framework.response import Response

# Create your views here.
class CommodityPriceView(viewsets.ModelViewSet):
    queryset = Commodity_Prices.objects.all()
    serializer_class = serCommodity_Prices
    def get_queryset(self):
        queryset = super().get_queryset()
        produto = self.request.query_params.get('produto', None)   
        local = self.request.query_params.get('local', None)  
        inicio = self.request.query_params.get('inicio', None) 
        final = self.request.query_params.get('final', None) 

        if produto and local and inicio and final:
            queryset = queryset.filter(Q(Q(commodity_id=int(produto)) & Q(location_id=int(local))
                & Q(date__gte=inicio) & Q(date__lte=final)))
        else:
            queryset = queryset[:10]
        return queryset
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Calcular a média e o desvio padrão
        media = queryset.aggregate(media=Avg('price'))['media']
        desvio_padrao = queryset.aggregate(desvio_padrao=StdDev('price'))['desvio_padrao']
        minimo = queryset.aggregate(media=Min('price'))['media']
        maximo = queryset.aggregate(desvio_padrao=Max('price'))['desvio_padrao']

        # Serialize os dados
        serializer = self.get_serializer(queryset, many=True)
        
        # Inclua a média e o desvio padrão na resposta
        data = {}
        data['list'] = serializer.data
        data['media'] = media
        data['desvio_padrao'] = desvio_padrao
        data['minimo'] = minimo
        data['maximo'] = maximo

        return Response(data)

class LocationView(viewsets.ModelViewSet):
    queryset = Localizacao_Cotacao.objects.all()
    serializer_class = serLocations

class ProdutoView(viewsets.ModelViewSet):
    queryset = Commodity_Cotacao.objects.all()
    serializer_class = serProdutos