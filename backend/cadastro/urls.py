
from django.contrib import admin
from django.urls import path, include
from cadastro import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'municipios', views.MunicipioView)
router.register(r'categorias-cadastro', views.CategoriaCadView)
router.register(r'cartorios', views.CartorioView)
router.register(r'grupos-clientes', views.GrupoClienteView)
router.register(r'machinery', views.MachineryView)
router.register(r'farm-assets', views.BenfeitoriasView)
router.register(r'analysis-soil', views.AnalisesSoloView)
router.register(r'types-farm-assets', views.TipoBenfeitoriaView)
router.register(r'picture-farm-assets', views.PicturesBenfeitoriasView)
router.register(r'feedbacks', views.FeedbackView)
router.register(r'feedbacks-category', views.CategoryFeedbackView)
router.register(r'feedbacks-reply', views.FeedbackReplyView)
router.register(r'pessoal', views.PessoasView)
router.register(r'produtos', views.ProdutosView)
router.register(r'detalhamentos', views.Detalhamento_ServicosView)
router.register(r'instituicoes', views.Instituicoes_ParceirasView)
router.register(r'instituicoes-razaosocial', views.Instituicoes_RazaosocialView)

urlpatterns = [
    path('landing/', views.home, name='home.page'),
    path('cadastros/', views.cadastros, name='cad.page'),
]
urlpatterns += router.urls