from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'fluxos', views.FluxoView, basename='fluxo-detail')
# router.register(r'pipe-data', views.PipeDataView, basename='pipe-list')
# router.register(r'fases', views.FasesView)
# router.register(r'cards', views.FluxoAmbientalView)
# router.register(r'card-comments', views.CommentView)
# router.register(r'card-activities', views.ActivityView)
# router.register(r'card-anexos', views.AnexoView)

urlpatterns = [
]
urlpatterns += router.urls