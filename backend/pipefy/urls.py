from django.contrib import admin
from django.urls import path, include
from pipefy import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'pessoal', views.PessoasView)
router.register(r'forncolab', views.FornColabView)
router.register(r'detalhamentos', views.Detalhamento_ServicosView)
router.register(r'instituicoes', views.Instituicoes_ParceirasView)
router.register(r'instituicoes-razaosocial', views.Instituicoes_RazaosocialView)
router.register(r'contratos', views.ContratosView)
router.register(r'monitoramento-prazos', views.MonitoramentoPrazosView)
router.register(r'operacoes-contratadas', views.OperacoesContratadasView)
router.register(r'cards/produtos', views.Card_ProdutosView)
router.register(r'cards/prospects', views.Card_ProspectsView)

urlpatterns = [
]
urlpatterns += router.urls