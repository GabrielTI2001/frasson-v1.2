from rest_framework import serializers
from pipefy.models import Regimes_Exploracao
from backend.frassonUtilities import Frasson
import locale
from backend.settings import TOKEN_GOOGLE_MAPS_API

class ListRegimes(serializers.ModelSerializer):
    matricula_imovel = serializers.CharField(source='imovel.matricula_imovel', read_only=True)
    nome_imovel = serializers.CharField(source='imovel.nome_imovel', read_only=True)
    class Meta:
        model = Regimes_Exploracao
        fields = ['id', 'imovel', 'matricula_imovel', 'nome_imovel', 'regime', 'atividades_exploradas', 'data_inicio', 'data_termino',
                  'area_explorada']

