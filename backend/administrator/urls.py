from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_administrator_panel, name='index.administrator.panel'),
]
