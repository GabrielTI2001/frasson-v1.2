from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'index', views.GlebasView, basename='index')
router.register(r'coordenadas', views.CoordendasGlebasView, basename='coordenadas')

urlpatterns = [
    path('glebas/kml/<int:id>', views.download_kml_gleba, name='gleba.kml'),
]
urlpatterns += router.urls