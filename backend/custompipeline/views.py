from django.shortcuts import render
from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from .serializers import *
from .models import *

# Create your views here.

class FluxoView(viewsets.ModelViewSet):
    lookup_field = 'code'
    queryset = Fluxo.objects.all()
    serializer_class = serializerFluxo
    permission_classes = [permissions.AllowAny]
    def get_serializer_class(self):
        if self.action == 'list':
            return serializerFluxo
        else:
            return self.serializer_class
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            self.perform_create(serializer)
            Fase.objects.create(fluxo=self.get_object(), descricao="CONCLUÍDO", propriedades={'done':True})
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)