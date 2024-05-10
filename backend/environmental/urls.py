from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'inema/captacao', views.CaptacaoView)
router.register(r'inema/aquifero', views.AquiferoView)
router.register(r'inema/finalidade', views.FinalidadeView)
router.register(r'inema/outorgas', views.OutorgaView)
router.register(r'inema/outorga/coordenadas', views.CoordenadaOutorgaView)
router.register(r'inema/outorga/coordenadas-detail', views.detailCoordenadaOutorgaView)
router.register(r'inema/appos', views.APPOView)
router.register(r'inema/appo/coordenadas', views.CoordenadaAPPOView)
router.register(r'inema/appo/coordenadas-detail', views.detailCoordenadaAPPOView)
router.register(r'inema/asvs', views.OutorgaView)

urlpatterns = [
    path('inema/appo/kml/<int:id>', views.kml_processo_appo, name='kml.processo.appo'),
    path('inema/outorga/kml/<int:id>', views.kml_processo_outorga, name='kml.processo.outorga'),
    path('inema/outorga/map/kml/', views.kml_dashboard_processos_outorga, name='kml.outorga'),
    path('inema/appo/map/kml/', views.kml_dashboard_processos_appo, name='kml.appo'),
]
urlpatterns += router.urls