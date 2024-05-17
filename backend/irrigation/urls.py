from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'pivots', views.PivotsView)
router.register(r'pivots-points', views.PivotsPointsView)
router.register(r'fabricantes-pivots', views.FabricantesPivotsView)
router.register(r'fabricantes-bombas', views.FabricantesBombasView)
urlpatterns = [
    path('pivot/kml/<int:id>', views.cadasto_pivot_kml, name='cadastro.pivot.kml'),
]

urlpatterns += router.urls