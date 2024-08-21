from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'users', views.ListUserView)
router.register(r'allowed-emails', views.AllowedEmailsView)
router.register(r'profile', views.UserProfileView)

urlpatterns = [
    path('create/', views.CreateUserView.as_view(), name='create_user'),
]

urlpatterns += router.urls