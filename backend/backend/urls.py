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
    path('external/', include('external.urls')),
    path('alongamentos/', include('alongamentos.urls')),
    path('analytics/', include('analytics.urls')),
    path('dashboard/', include('dashboards.urls')),
    path('kpi/', include('kpi.urls')),
    path('irrigation/', include('irrigation.urls')),
    path('licenses/', include('licenses.urls')),
    path('register/', include('cadastro.urls')),
    path('pipefy/', include('pipefy.urls')),
    path('processes/', include('processes.urls')),
    path('environmental/', include('environmental.urls')),
    path('services/', include('services.urls')),
    path('users/', include('users.urls')),
    path('webhooks/', include('webhooks.urls')),
    path('api/v1/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path("api/v1/auth/", include('djoser.urls.authtoken')),
    path("api/v1/auth/", include('djoser.urls.jwt')),
    path('api/v1/auth/token/', CustomTokenCreateView.as_view(), name='token_create'),
    path('token/maps/', get_api_maps, name='token_create'),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)