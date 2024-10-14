from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from django.urls import path
from users.views import CustomUserViewSet
from rest_framework.routers import DefaultRouter
from users.views import CustomTokenCreateView, get_api_maps

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('administrator/', include('administrator.urls')),
    path('assessments/', include('assessments.urls')),
    path('credit/', include('credit.urls')),
    path('external/', include('external.urls')),
    path('alongamentos/', include('alongamentos.urls')),
    path('dashboard/', include('dashboards.urls')),
    path('farms/', include('farms.urls')),
    path('finances/', include('finances.urls')),
    path('glebas/', include('glebas.urls')),
    path('kpi/', include('kpi.urls')),
    path('irrigation/', include('irrigation.urls')),
    path('inbox/', include('inbox.urls')),
    path('licenses/', include('licenses.urls')),
    path('litec/', include('litec.urls')),
    path('register/', include('cadastro.urls')),
    path('pipeline/', include('pipeline.urls')),
    path('custom/pipeline/', include('custompipeline.urls')),
    path('processes/', include('processes.urls')),
    path('environmental/', include('environmental.urls')),
    path('services/', include('services.urls')),
    path('users/', include('users.urls')),
    path('api/v1/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path("api/v1/auth/", include('djoser.urls.authtoken')),
    path("api/v1/auth/", include('djoser.urls.jwt')),
    path('api/v1/auth/token/', CustomTokenCreateView.as_view(), name='token_create'),
    path('token/maps/', get_api_maps, name='token_create'),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)