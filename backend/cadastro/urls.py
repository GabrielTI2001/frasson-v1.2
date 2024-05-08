
from django.contrib import admin
from django.urls import path, include
from cadastro import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'municipios', views.MunicipioView)
router.register(r'machinery', views.MachineryView)
router.register(r'farm-assets', views.BenfeitoriasView)
router.register(r'analysis-soil', views.AnalisesSoloView)
router.register(r'analysis-soil-results', views.ResultAnalisesSoloView)
router.register(r'types-farm-assets', views.TipoBenfeitoriaView)
router.register(r'picture-farm-assets', views.PicturesBenfeitoriasView)
router.register(r'agencias-bancarias', views.AgenciasBancariasView)

urlpatterns = []
urlpatterns += router.urls