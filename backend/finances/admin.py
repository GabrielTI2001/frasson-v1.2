from django.contrib import admin
from .models import Contratos_Ambiental, Contratos_Credito, Cobrancas

@admin.register(Contratos_Ambiental)
class Contratos_ServicosAdmin(admin.ModelAdmin):
    list_display = ('uuid',)

@admin.register(Contratos_Credito)
class Contratos_CreditoAdmin(admin.ModelAdmin):
    list_display = ('uuid',)

@admin.register(Cobrancas)
class CobrancasAdmin(admin.ModelAdmin):
    list_display = ('uuid',)