from rest_framework import serializers
from .models import Commodity_Prices, Localizacao_Cotacao, Commodity_Cotacao

class serCommodity_Prices(serializers.ModelSerializer):
    localizacao = serializers.CharField(source="location.location", read_only=True, required=False)
    str_commodity = serializers.CharField(source="commodity.commodity", read_only=True, required=False)
    class Meta:
        model = Commodity_Prices
        fields = '__all__'

class serLocations(serializers.ModelSerializer):
    class Meta:
        model = Localizacao_Cotacao
        fields = ['id', 'location']

class serProdutos(serializers.ModelSerializer):
    class Meta:
        model = Commodity_Cotacao
        fields = ['id', 'commodity']