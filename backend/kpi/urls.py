from django.urls import path
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'metas', views.MetasView)
router.register(r'indicators', views.IndicatorsView)
urlpatterns = []

urlpatterns += router.urls