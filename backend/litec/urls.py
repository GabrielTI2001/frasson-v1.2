from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'agricola', views.ProdAgricolaView)
router.register(r'pecuaria', views.ProdPecuariaView)
router.register(r'sistema-producao', views.SistemaProducaoView)
router.register(r'unidade-producao', views.UnidadeProducaoView)
router.register(r'produto-principal', views.ProdutoPrincipalView)

urlpatterns = [
]
urlpatterns += router.urls