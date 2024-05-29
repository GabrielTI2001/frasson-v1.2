
from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'billings', views.PagamentosView)
router.register(r'revenues', views.CobrancasView)
router.register(r'revenues-invoices', views.CobrancasInvoicesView)
router.register(r'automation/payments', views.AutomPagamentosView)
router.register(r'transfers', views.TransfContasView)
router.register(r'moviments', views.MovimentacoesView)
router.register(r'refunds', views.ReembolsosView)
router.register(r'caixas', views.CaixasView)
router.register(r'category-payments', views.CategoriaPagamentosView)
router.register(r'tipo-receita-despesa', views.ReceitaDespesaView)

urlpatterns = [
    path('billings-report/', views.pagamentos_pipefy_report_pdf, name='billings.pipefy.report.pdf'),
    path('revenues-report/', views.cobrancas_pipefy_report_pdf, name='cobrancas.pipefy.report.pdf'),
    path('dre/actual/', views.index_dre_consolidado, name='index.dre.consolidado'),
    path('dre/forecast/', views.index_dre_provisionado, name='index.dre.provisionado'),
    path('dre/real/report/', views.dre_consolidado_report, name='dre.consolidado.report'),
    path('accounts/', views.index_saldos_contas, name='index.saldos.contas'),
    path('accounts/<int:id>/', views.movimentacao_conta_bancaria, name='movimentacao.conta.bancaria'),
    path('balances/bank-accounts/pdf', views.pdf_saldos_view, name='pdf.saldos.view'),
]
urlpatterns += router.urls