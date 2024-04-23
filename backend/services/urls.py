from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'currency/commodities', views.CommodityPriceView)
router.register(r'currency/locations', views.LocationView)
router.register(r'currency/produtos', views.ProdutoView)

urlpatterns = [
]
urlpatterns += router.urls