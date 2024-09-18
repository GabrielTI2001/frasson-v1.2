
from django.contrib import admin
from django.urls import path, include
from alongamentos import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'done', views.AlongamentosView)
router.register(r'next', views.AlongamentosNextView)
router.register(r'produtos-agricolas', views.ProdutoView)
router.register(r'tipo-armazenagem', views.TipoArmazenagemView)
router.register(r'tipo-classificacao', views.TipoClassificacaoView)

urlpatterns = [
    path('', views.index, name='index.alongamento'),
    path('pdf/<uuid:uuid>', views.create_pdf_alongamento, name='pdf.alongamento'),
    path('pdf/download/<uuid:uuid>/1', views.download_pdf_page_01, name='download.pages.alongamento'),
    path('pdf/download/<uuid:uuid>/2', views.download_pdf_page_02, name='download.pages.alongamento.2'),
    path('pdf/download/<uuid:uuid>/3', views.download_pdf_page_03, name='download.pages.alongamento.3')
]
urlpatterns += router.urls