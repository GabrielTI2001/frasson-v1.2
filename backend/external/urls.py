
from django.contrib import admin
from django.urls import path, include
from external import views
from rest_framework import routers

# router = routers.DefaultRouter()

urlpatterns = [
    path('ana/outorgas/', views.index_outorgas_ana, name='index.outorgas.ana'),
    path('cnpj/', views.consulta_cnpj, name='consulta.cnpj'),
    path('currency/exchange', views.cotacoes_exchange, name='cotacoes.exchange'),
]
# urlpatterns += router.urls