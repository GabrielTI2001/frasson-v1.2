from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'index', views.LicencasView)
router.register(r'anexos', views.AnexoView)
urlpatterns = []

urlpatterns += router.urls