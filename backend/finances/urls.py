
from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()

urlpatterns = [
    path('dre/actual/', views.index_dre_consolidado, name='index.dre.consolidado'),
    path('dre/forecast/', views.index_dre_provisionado, name='index.dre.provisionado'),
]
urlpatterns += router.urls