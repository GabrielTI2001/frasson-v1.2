from django.contrib import admin
from django.urls import path, include
from pipeline import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'pipes', views.PipeView)
router.register(r'fases', views.FasesView)
router.register(r'cards/produtos', views.Card_ProdutosView)

urlpatterns = [
]
urlpatterns += router.urls