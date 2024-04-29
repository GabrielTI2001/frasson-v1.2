
from django.contrib import admin
from django.urls import path, include
from analytics import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'regime', views.RegimesView)
router.register(r'farms', views.FarmsView)

urlpatterns = [

]
urlpatterns += router.urls