
from django.contrib import admin
from django.urls import path, include
from alongamentos import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'index', views.AlongamentosView)
router.register(r'produtos-agricolas', views.ProdutoView)

urlpatterns = [
    path('pdf/<int:id>', views.create_pdf_alongamento, name='pdf.alongamento'),
    path('pdf/download/<int:id>/1', views.download_pdf_page_01, name='download.pages.alongamento'),
    path('pdf/download/<int:id>/2', views.download_pdf_page_02, name='download.pages.alongamento.2'),
    path('pdf/download/<int:id>/3', views.download_pdf_page_03, name='download.pages.alongamento.3')
]
urlpatterns += router.urls