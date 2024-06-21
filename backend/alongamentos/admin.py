from django.contrib import admin
from .models import Cadastro_Alongamentos, Tipo_Armazenagem, Tipo_Classificacao, Produto_Agricola

@admin.register(Produto_Agricola)
class Produto_AgricolaAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'description', 'cultura')

@admin.register(Cadastro_Alongamentos)
class Cadastro_AlongamentosAdmin(admin.ModelAdmin):
    list_display = ('data', 'operacao')

@admin.register(Tipo_Armazenagem)
class Tipo_ArmazenagemAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'description')

@admin.register(Tipo_Classificacao)
class Tipo_ClassificacaoAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'description')