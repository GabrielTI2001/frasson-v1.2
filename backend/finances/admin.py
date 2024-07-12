from django.contrib import admin
from .models import Contratos_Ambiental, Cobrancas

@admin.register(Contratos_Ambiental)
class Contratos_ServicosAdmin(admin.ModelAdmin):
    list_display = ('uuid',)

@admin.register(Cobrancas)
class CobrancasAdmin(admin.ModelAdmin):
    list_display = ('uuid',)