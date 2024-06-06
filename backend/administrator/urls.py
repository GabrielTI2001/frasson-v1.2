from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_administrator_panel, name='index.administrator.panel'),
    path('tests/', views.index_administrator_tests, name='index.administrator.tests'),
    path('tests/database/1136264/', views.test_cadpessoal, name='tests.database.cadpessoal'),
    path('tests/pipe/301573538/', views.test_pipeprodutos, name='tests.pipe.produtos'),
    path('tests/pipe/301573049/', views.test_pipeprospects, name='tests.pipe.prospect'),
    path('tests/pipe/302821542/', views.test_pipecobrancas, name='tests.pipe.cobrancas'),
    path('tests/pipe/302757413/', views.test_pipepagamentos, name='tests.pipe.pagamentos'),
    path('tests/database/1213951/', views.test_cadimoveisrurais, name='tests.database.imorurais'),
    path('tests/database/1139735/', views.test_cadopercontratadas, name='tests.database.opcontratadas'),
    path('tests/database/1260853/', views.test_cadcolabforn, name='tests.database.colabforn'),
    path('tests/database/1136266/', views.test_contr_servicos, name='tests.database.contr_servicos'),
]
