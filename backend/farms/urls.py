
from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'regime', views.RegimesView)
router.register(r'farms', views.FarmsView)
router.register(r'car', views.CARView)
router.register(r'parcelas-sigef', views.SIGEFView)

urlpatterns = [
    path('kml/<uuid:uuid>', views.download_kml_farm, name='farm.kml'),
    path('kml/regime/<uuid:uuid>', views.download_kml_regime, name='regime.kml')
]
urlpatterns += router.urls