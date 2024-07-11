from django.contrib import admin
from django.urls import path, include
from pipeline import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'pipes', views.PipeView, basename='pipe-detail')
router.register(r'pipe-data', views.PipeDataView, basename='pipe-list')
router.register(r'fases', views.FasesView)
router.register(r'fluxos/gestao-ambiental', views.FluxoAmbientalView)
router.register(r'card-comments', views.CommentView)
router.register(r'card-activities', views.ActivityView)
router.register(r'card-anexos', views.AnexoView)
router.register(r'pvtec', views.PVTECView)
router.register(r'followup/acompanhamentos-gai', views.FollowupGAIView)
router.register(r'followup/atualizacoes-gai', views.AtualizacoesGAIView)

urlpatterns = [
]
urlpatterns += router.urls