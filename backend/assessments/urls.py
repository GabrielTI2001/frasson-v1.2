
from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
urlpatterns = [
    path('my/', views.my_assessments, name='assessments.my'),
    path('quiz/<uuid:uuid>', views.quiz, name='assessments.quiz'),
]
urlpatterns += router.urls