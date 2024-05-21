from rest_framework import serializers
from .models import Indicadores_Frasson, Metas_Realizados
from backend.frassonUtilities import Frasson
from backend.pipefyUtils import getTableRecordPipefy
import locale, requests, json, math
from datetime import date, timedelta
from backend.settings import TOKEN_GOOGLE_MAPS_API

class listMetas(serializers.ModelSerializer):
    user_avatar = serializers.CharField(source='assignee.profile.avatar.name', read_only=True)
    str_indicator = serializers.CharField(source='indicator.description', read_only=True)
    str_responsavel = serializers.SerializerMethodField(read_only=True)
    def get_str_responsavel(self, obj):
        if obj.assignee:
            return f"{obj.assignee.first_name} {obj.assignee.last_name}"
        else:
            return None
    class Meta:
        model = Metas_Realizados
        fields = ['id', 'uuid', 'str_indicator', 'year', 'user_avatar', 'str_responsavel']

class detailMetas(serializers.ModelSerializer):
    user_avatar = serializers.CharField(source='assignee.profile.avatar.name', read_only=True)
    str_indicator = serializers.CharField(source='indicator.description', read_only=True)
    str_responsavel = serializers.SerializerMethodField(read_only=True)
    def get_str_responsavel(self, obj):
        if obj.assignee:
            return f"{obj.assignee.first_name} {obj.assignee.last_name}"
        else:
            return None  
    class Meta:
        model = Metas_Realizados
        fields = '__all__'