from django.contrib import admin
from .models import Atos_Administrativos, Prazos_Renovacao

# Register your models here.

@admin.register(Atos_Administrativos)
class AtosAdministrativosAdmin(admin.ModelAdmin):
    list_display = ('description', 'sigla', 'created_at', 'updated_at')

@admin.register(Prazos_Renovacao)
class PrazosRenovacaoAdmin(admin.ModelAdmin):
    list_display = ('ato_admin', 'dias_para_renov')