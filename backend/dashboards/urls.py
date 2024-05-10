
from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()

urlpatterns = [
    path('credit', views.dashboard_operacoes_contratadas, name='dashboard.credit'),
    path('credit-management', views.dashboard_gestao_credito, name='dashboard.gestao.credit')
]
urlpatterns += router.urls