from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'currency/commodities', views.CommodityPriceView)
router.register(r'currency/locations', views.LocationView)
router.register(r'currency/produtos', views.ProdutoView)

urlpatterns = [
    path('tools/kml/coordenadas/', views.extract_coordinates_kml, name='extract.coordinates.kml'),
    path('tools/convert/kmlToxlsx', views.convert_html_table_to_excel, name='convert.html.table.excel'),
    path('tools/convert/toxlsbnb', views.convert_html_table_to_excel_bnb, name='convert.html.table.bnb'),
    path('tools/pivot/', views.create_coordinates_pivots, name='create.coordinates.pivots'),
    path('tools/pivot/downloadKML', views.download_kml_file_pivot, name='download.kml.file.pivot'),
    path('tools/LatLong/kml/polygon', views.download_kml_polygon_coordinates, name='download.kml.polygon.coordinates'),
    path('tools/LatLong/kml/point', views.download_kml_point_coordinates, name='download.kml.point.coordinates'),
    path('tools/kml/polygon/', views.kml_transform_polygon, name='kml.transform.polygon'),
    path('tools/kml/polygon/download', views.download_kml_transform_polygon, name='download.kml.transform.polygon'),
]
urlpatterns += router.urls