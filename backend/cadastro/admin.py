from django.contrib import admin
from .models import Produtos_Frasson, Detalhamento_Servicos, Cadastro_Pessoal, Categoria_Cadastro
from .models import Instituicoes_Razao_Social, Instituicoes_Parceiras, Tipo_Instituicao

@admin.register(Produtos_Frasson)
class Produtos_FrassonAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'description',)

@admin.register(Detalhamento_Servicos)
class Detalhamento_ServicosAdmin(admin.ModelAdmin):
    list_display = ('uuid',)

@admin.register(Cadastro_Pessoal)
class Cadastro_PessoalAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'razao_social',)

@admin.register(Categoria_Cadastro)
class Categoria_CadastroAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'categoria',)

@admin.register(Tipo_Instituicao)
class Tipo_InstituicaoAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'descricao')

@admin.register(Instituicoes_Razao_Social)
class Instituicoes_Razao_SocialAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'tipo', 'razao_social', 'cnpj')

@admin.register(Instituicoes_Parceiras)
class Instituicoes_ParceirasAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'instituicao', 'identificacao')