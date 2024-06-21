from django.contrib import admin
from .models import Contratos_Servicos

@admin.register(Contratos_Servicos)
class Contratos_ServicosAdmin(admin.ModelAdmin):
    list_display = ('uuid',)