from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'operacoes-contratadas', views.OperacoesContratadasView)

urlpatterns = [
]
urlpatterns += router.urls