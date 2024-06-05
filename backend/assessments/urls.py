
from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
urlpatterns = [
    path('my/', views.my_assessments, name='assessments.my'),
    path('quiz/<uuid:uuid>', views.quiz, name='assessments.quiz'),
    path('index/', views.index_assessments, name='assessments.index'),
    path('results/<uuid:uuid>', views.assessments_results, name='assessments.results'),
]
urlpatterns += router.urls