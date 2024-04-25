from django.contrib import admin
from django.urls import path, include
from pipefy import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'pessoal', views.PessoasView)
router.register(r'farms', views.FarmsView)
router.register(r'fases', views.FasesView)
router.register(r'pipes/produtos', views.PipeView)
router.register(r'fases', views.FasesView)
router.register(r'beneficiarios', views.BeneficiariosView)
router.register(r'detalhamentos', views.Detalhamento_ServicosView)
router.register(r'instituicoes', views.Instituicoes_ParceirasView)
router.register(r'instituicoes-razaosocial', views.Instituicoes_RazaosocialView)
router.register(r'contratos', views.ContratosView)
router.register(r'operacoes-contratadas', views.OperacoesContratadasView)
router.register(r'cards/produtos', views.Card_ProdutosView)

urlpatterns = [
    path('cards/<int:pk>/update_beneficiarios/', views.Card_BeneficiariosView.as_view({'put': 'update_beneficiarios'}), name='update_beneficiarios'),
]
urlpatterns += router.urls