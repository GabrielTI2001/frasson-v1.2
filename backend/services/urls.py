from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'currency/commodities', views.CommodityPriceView)
router.register(r'currency/locations', views.LocationView)
router.register(r'currency/produtos', views.ProdutoView)

urlpatterns = [
    path('tools/kml/coordenadas', views.extract_coordinates_kml, name='extract.coordinates.kml'),
    path('tools/convert/kmlToxlsx', views.convert_html_table_to_excel, name='convert.html.table.excel'),
    path('tools/convert/toxlsbnb', views.convert_html_table_to_excel_bnb, name='convert.html.table.bnb'),
]
urlpatterns += router.urls