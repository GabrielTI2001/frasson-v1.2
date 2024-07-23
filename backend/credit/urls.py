from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'operacoes-contratadas', views.OperacoesContratadasView)
router.register(r'operacoes-cedulas', views.OperacoesCedulasView)
router.register(r'itens-financiados', views.ItensFinanciadosView)

urlpatterns = [
    path('credit-data', views.creditData, name='credit.data'),
    path('convert-to-xls', views.convert_html_table_to_excel, name='credit.xls'),
    path('kml/operacoes/<uuid:uuid>', views.download_kml_operacao, name='operacao.kml'),
]
urlpatterns += router.urls