from django.contrib import admin
from .models import Produtos_Frasson, Detalhamento_Servicos, Cadastro_Pessoal

@admin.register(Produtos_Frasson)
class Produtos_FrassonAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'description',)

@admin.register(Detalhamento_Servicos)
class Detalhamento_ServicosAdmin(admin.ModelAdmin):
    list_display = ('uuid',)

@admin.register(Cadastro_Pessoal)
class Cadastro_PessoalAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'razao_social',)
