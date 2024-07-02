from django.contrib import admin
from .models import Contratos_Ambiental

@admin.register(Contratos_Ambiental)
class Contratos_ServicosAdmin(admin.ModelAdmin):
    list_display = ('uuid',)