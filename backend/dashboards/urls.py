
from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()

urlpatterns = [
    path('ambiental/', views.dashboard_gestao_ambiental, name='dashboard.gestao.ambiental'),
    path('credit/', views.dashboard_operacoes_contratadas, name='dashboard.credit'),
    path('credit-management/', views.dashboard_gestao_credito, name='dashboard.gestao.credit'),
    path('prospects/', views.dashboard_prospects, name='dashboard.prospects'),
    path('products/', views.dashboard_produtos, name='dashboard.products'),
    path('finances/billings/', views.pagamentos_pipefy_dashboard, name='pagamentos.pipefy.dashboard'),
    path('finances/revenues/', views.cobrancas_pipefy_dashboard, name='cobrancas.pipefy.dashboard'),
]
urlpatterns += router.urls