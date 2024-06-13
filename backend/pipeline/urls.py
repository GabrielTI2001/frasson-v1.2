from django.contrib import admin
from django.urls import path, include
from pipeline import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'pipes', views.PipeView)
router.register(r'fases', views.FasesView)
router.register(r'beneficiarios', views.BeneficiariosView)
router.register(r'detalhamentos', views.Detalhamento_ServicosView)
router.register(r'instituicoes', views.Instituicoes_ParceirasView)
router.register(r'contratos', views.ContratosView)
router.register(r'cards/produtos', views.Card_ProdutosView)

urlpatterns = [
    path('cards/<int:pk>/update_beneficiarios/', views.Card_BeneficiariosView.as_view({'put': 'update_beneficiarios'}), name='update_beneficiarios'),
]
urlpatterns += router.urls