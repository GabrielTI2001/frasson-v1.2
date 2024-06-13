
from django.contrib import admin
from django.urls import path, include
from analytics import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'regime', views.RegimesView)
router.register(r'farms', views.FarmsView)
router.register(r'car', views.CARView)

urlpatterns = [
    path('credit-data', views.creditData, name='credit.data'),
    path('credit/convert-to-xls', views.convert_html_table_to_excel, name='credit.xls'),
]
urlpatterns += router.urls