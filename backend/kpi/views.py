from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from .models import Metas_Realizados

class MetasView(viewsets.ModelViewSet):
    queryset = Metas_Realizados.objects.all()
    serializer_class = detailMetas
    # permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.query_params.get('user', None)   
        if user:
            queryset = queryset.filter(
                Q(assignee_id=int(user))
            )
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listMetas
        else:
            return self.serializer_class

class IndicatorsView(viewsets.ModelViewSet):
    queryset = Indicadores_Frasson.objects.all()
    serializer_class = listIndicators
    # permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)   
        if search:
            queryset = queryset.filter(
                Q(description__icontains=search) & Q(is_active=True)
            )
        return queryset
    def get_serializer_class(self):
        if self.action == 'list':
            return listIndicators
        else:
            return self.serializer_class