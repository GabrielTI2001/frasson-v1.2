from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'operacoes-contratadas', views.OperacoesContratadasView)

urlpatterns = [
    path('credit-data', views.creditData, name='credit.data'),
    path('credit/convert-to-xls', views.convert_html_table_to_excel, name='credit.xls'),
]
urlpatterns += router.urls