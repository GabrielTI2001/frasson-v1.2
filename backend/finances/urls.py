
from django.contrib import admin
from django.urls import path, include
from . import views
from pipeline.views import CommentView
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'billings', views.PagamentosView)
router.register(r'revenues', views.CobrancasView, basename='cobrancas')
router.register(r'revenues-invoices', views.CobrancasInvoicesView, basename='invoices')
router.register(r'automation/payments', views.AutomPagamentosView)
router.register(r'transfers', views.TransfContasView)
router.register(r'moviments', views.MovimentacoesView)
router.register(r'refunds', views.ReembolsosView)
router.register(r'caixas', views.CaixasView)
router.register(r'category-payments', views.CategoriaPagamentosView)
router.register(r'tipo-receita-despesa', views.ReceitaDespesaView)
router.register(r'contratos-ambiental', views.ContratoAmbientalView)
router.register(r'contratos-pagamentos-ambiental', views.ContratosPagamentosAmbientalView)
router.register(r'contratos-credito', views.ContratoCreditoView)
router.register(r'contratos-pagamentos-credito', views.ContratosPagamentosCreditoView)
router.register(r'activities', views.ActivityView)
router.register(r'anexos', views.AnexoView)
router.register(r'comments', CommentView)

urlpatterns = [
    path('etapas-contrato-ambiental/<int:id>/', views.etapas_contrato_ambiental, name='etapa.ambiental'),
    path('billings-report/', views.pagamentos_pipefy_report_pdf, name='billings.pipefy.report.pdf'),
    path('revenues-report/', views.cobrancas_pipefy_report_pdf, name='cobrancas.pipefy.report.pdf'),
    path('dre/actual/', views.index_dre_consolidado, name='index.dre.consolidado'),
    path('dre/forecast/', views.index_dre_provisionado, name='index.dre.provisionado'),
    path('dre/real/report/', views.dre_consolidado_report, name='dre.consolidado.report'),
    path('accounts/', views.index_saldos_contas, name='index.saldos.contas'),
    path('accounts/<int:id>/', views.movimentacao_conta_bancaria, name='movimentacao.conta.bancaria'),
    path('balances/bank-accounts/pdf', views.pdf_saldos_view, name='pdf.saldos.view'),
    path('contracts-pdf/<uuid:uuid>', views.create_pdf_contrato, name='create.pdf.contrato'),
]
urlpatterns += router.urls