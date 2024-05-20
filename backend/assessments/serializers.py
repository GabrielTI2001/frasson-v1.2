from rest_framework import serializers
from .models import Avaliacao_Colaboradores, Notas_Avaliacao, Questionario
from backend.frassonUtilities import Frasson
import locale

class ListAvaliacoes(serializers.ModelSerializer):
    class Meta:
        model = Avaliacao_Colaboradores
        fields = '__all__'