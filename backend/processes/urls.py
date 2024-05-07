from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'followup', views.FollowupView)
router.register(r'acompanhamentos', views.AcompanhamentoView)
router.register(r'status-acompanhamento', views.StatusView)

urlpatterns = []
urlpatterns += router.urls