from django.contrib import admin
from .models import Fluxo_Gestao_Ambiental, Fase, Pipe, Card_Anexos

@admin.register(Fluxo_Gestao_Ambiental)
class Card_ProdutosAdmin(admin.ModelAdmin):
    list_display = ('uuid',)

@admin.register(Fase)
class FaseAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'descricao',)

@admin.register(Pipe)
class PipeAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'descricao',)

@admin.register(Card_Anexos)
class Card_AnexosAdmin(admin.ModelAdmin):
    list_display = ('uuid',)
