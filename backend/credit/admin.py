from django.contrib import admin
from .models import Operacoes_Contratadas

@admin.register(Operacoes_Contratadas)
class Operacoes_ContratadasAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'beneficiario')