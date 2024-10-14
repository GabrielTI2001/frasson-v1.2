from django.contrib import admin
from .models import Fluxo

@admin.register(Fluxo)
class FluxoAdmin(admin.ModelAdmin):
    list_display = ('code', 'nome')