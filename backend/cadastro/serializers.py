from rest_framework import serializers
from .models import Municipios, Maquinas_Equipamentos, Benfeitorias_Fazendas, Tipo_Benfeitorias, Pictures_Benfeitorias, Analise_Solo
from .models import Feedbacks_System, Feedbacks_Category, Feedbacks_Replies, Senhas_Logins, Anexos
from backend.frassonUtilities import Frasson
from rest_framework import serializers
from .models import Detalhamento_Servicos, Cadastro_Pessoal, Produtos_Frasson, Cartorios_Registro, Categoria_Cadastro
from .models import Instituicoes_Parceiras, Contas_Bancarias_Clientes, Instituicoes_Razao_Social, Grupos_Clientes
from finances.models import Contratos_Ambiental
from datetime import datetime
import locale, os
from backend.settings import TOKEN_GOOGLE_MAPS_API

import locale
from backend.settings import TOKEN_GOOGLE_MAPS_API

class listCategoriaCadastro(serializers.ModelSerializer):
    class Meta:
        model = Categoria_Cadastro
        fields = ['id', 'categoria', 'sigla']

class selectMunicipio(serializers.ModelSerializer):
    class Meta:
        model = Municipios
        fields = ['id', 'nome_municipio', 'sigla_uf']

class listCartorio(serializers.ModelSerializer):
    str_municipio = serializers.SerializerMethodField(read_only=True)
    def get_str_municipio(self, obj):
        return obj.municipio.nome_municipio + ' - ' + obj.municipio.sigla_uf
    class Meta:
        model = Cartorios_Registro
        fields = ['id', 'uuid', 'razao_social', 'cnpj', 'logradouro', 'str_municipio', 'atendente']

class detailCartorio(serializers.ModelSerializer):
    str_municipio = serializers.SerializerMethodField(read_only=True)
    def get_str_municipio(self, obj):
        return obj.municipio.nome_municipio + ' - ' + obj.municipio.sigla_uf
    def validate_cnpj(self, value):
        if not Frasson.valida_cpf_cnpj(value):
            raise serializers.ValidationError("CNPJ Inválido!")
        return value
    def validate_cep_logradouro(self, value):
        if not Frasson.valida_cep(value):
            raise serializers.ValidationError("CEP Inválido!")
        return value
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['razao_social', 'municipio', 'cnpj', 'logradouro', 'cep_logradouro']:
                field.required = True
    class Meta:
        model = Cartorios_Registro
        fields = '__all__'

class listGrupoCliente(serializers.ModelSerializer):
    class Meta:
        model = Grupos_Clientes
        fields = ['id', 'uuid', 'nome_grupo']

class ListMachinery(serializers.ModelSerializer):
    class Meta:
        model = Maquinas_Equipamentos
        fields = ['id', 'modelo', 'proprietario', 'fabricante', 'quantidade', 'propriedade', 'ano_fabricacao', 'valor_total']

class ListBenfeitorias(serializers.ModelSerializer):
    name_farm = serializers.CharField(source='farm.nome', read_only=True)
    name_type = serializers.CharField(source='type.description', read_only=True)
    class Meta:
        model = Benfeitorias_Fazendas
        fields = ['id', 'uuid', 'data_construcao', 'name_type', 'name_farm', 'tamanho', 'valor_estimado']

class DetailBenfeitorias(serializers.ModelSerializer):
    pictures = serializers.SerializerMethodField(required=False, read_only=True)
    str_farm = serializers.CharField(source='farm.nome', read_only=True)
    str_created_by = serializers.SerializerMethodField(read_only=True)
    str_type = serializers.CharField(source='type.description', read_only=True)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name not in ['pictures', 'str_farm', 'str_type']:
                    field.required = True
        else:
            for field_name, field in self.fields.items():
                field.required = False
    def get_pictures(self, obj):
        fotos = Pictures_Benfeitorias.objects.filter(benfeitoria=obj)
        return [{'id':foto.id, 'url':"/media/"+foto.file.name} for foto in fotos]
    def get_str_created_by(self, obj):
        return obj.created_by.first_name+' '+obj.created_by.last_name
    class Meta:
        model = Benfeitorias_Fazendas
        fields = '__all__'

class ListTipoBenfeitoria(serializers.ModelSerializer):
    class Meta:
        model = Tipo_Benfeitorias
        fields = '__all__'

class serPictureBenfeitoria(serializers.ModelSerializer):
    class Meta:
        model = Pictures_Benfeitorias
        fields = '__all__'

class ListAnalisesSolo(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    str_cliente = serializers.CharField(source='cliente.razao_social', read_only=True)
    localizacao = serializers.CharField(source='fazenda.nome', read_only=True)
    def get_status(self, obj):
        status = {
            'text': 'Aguardando Resultado' if obj.calcio_cmolc_dm3 is None else 'Concluída',
            'color': 'warning' if obj.calcio_cmolc_dm3 is None else 'success'
        }
        return status
    class Meta:
        model = Analise_Solo
        fields = ['id', 'uuid', 'data_coleta', 'str_cliente', 'localizacao', 'status']

class resultsAnalisesSolo(serializers.ModelSerializer):
    other_info = serializers.SerializerMethodField(read_only=True)
    results = serializers.SerializerMethodField(read_only=True)
    creation = serializers.SerializerMethodField(read_only=True)
    str_cliente = serializers.CharField(source='cliente.razao_social', read_only=True)
    localizacao = serializers.CharField(source='fazenda.nome', read_only=True)
    token_apimaps = serializers.SerializerMethodField(read_only=True, required=False)
    status = serializers.SerializerMethodField(read_only=True)
    def get_status(self, obj):
        status = {
            'text': 'Aguardando Resultado' if obj.calcio_cmolc_dm3 is None else 'Concluída',
            'color': 'warning' if obj.calcio_cmolc_dm3 is None else 'success'
        }
        return status
    def get_results(self, obj):
        data = {
            'calcio_cmolc_dm3': Frasson.avaliar_nivel_nutriente_solo('calcio', obj.calcio_cmolc_dm3),
            'sodio': obj.sodio,
            'magnesio_cmolc_dm3': Frasson.avaliar_nivel_nutriente_solo('magnesio', obj.magnesio_cmolc_dm3),
            'aluminio_cmolc_dm3': Frasson.avaliar_nivel_nutriente_solo('magnesio', obj.aluminio_cmolc_dm3 ),
            'potassio_cmolc_dm3': Frasson.avaliar_nivel_nutriente_solo('potassio', obj.potassio_cmolc_dm3),
            'fosforo': Frasson.avaliar_nivel_nutriente_solo('fosforo', obj.fosforo),
            'fosforo_rem': Frasson.avaliar_nivel_nutriente_solo('fosforo_rem', obj.fosforo_rem),
            'enxofre': Frasson.avaliar_nivel_nutriente_solo('enxofre', obj.enxofre),
            'zinco': Frasson.avaliar_nivel_nutriente_solo('zinco', obj.zinco),
            'cobre': Frasson.avaliar_nivel_nutriente_solo('cobre', obj.cobre),
            'ferro': Frasson.avaliar_nivel_nutriente_solo('ferro', obj.ferro),
            'manganes': Frasson.avaliar_nivel_nutriente_solo('manganes', obj.manganes),
            'boro': Frasson.avaliar_nivel_nutriente_solo('boro', obj.boro),
            'h_mais_al': obj.h_mais_al,
            'mat_org_dag_dm3': Frasson.avaliar_nivel_nutriente_solo('materia_organica', obj.mat_org_dag_dm3),
            'ph_cacl2': Frasson.avaliar_nivel_nutriente_solo('pH_CaCl', obj.ph_cacl2),
            'ph_h2O': Frasson.avaliar_nivel_nutriente_solo('pH_H2O', obj.ph_h2O),
            'argila_percentual': obj.argila_percentual,
            'silte_percentual': obj.silte_percentual,
            'areia_percentual': obj.areia_percentual
        }
        return data
    def get_other_info(self, obj):
        niveis_embrapa = {
            'rel_ca_mg': {'min': 2, 'max': 5},
            'rel_ca_K': {'min': 15, 'max': 20},
            'rel_mg_k': {'min': 3, 'max': 5},
            'pH_H2O': {'min': 6, 'max': 6.5},
            'pH_CaCl': {'min': 5.5, 'max': 6.0},
        }
        if obj.magnesio_cmolc_dm3 != None and obj.calcio_cmolc_dm3 != None and obj.potassio_cmolc_dm3 != None:
            soma_bases = obj.calcio_cmolc_dm3 + obj.magnesio_cmolc_dm3 + obj.potassio_cmolc_dm3
            capacidade_troca_cations = soma_bases + obj.h_mais_al if obj.h_mais_al != None else None
            saturacao_bases = (soma_bases/capacidade_troca_cations) * 100 if obj.h_mais_al != None else None
            calagem = (((70 - saturacao_bases or 0)/100) *  capacidade_troca_cations if  saturacao_bases < 70 else 0) if saturacao_bases else None
            calculos = {
                'soma_bases': locale.format_string('%.2f', soma_bases, True),
                'capacidade_troca_cations': locale.format_string('%.2f', capacidade_troca_cations, True) if capacidade_troca_cations else '-',
                'saturacao_bases': locale.format_string('%.2f', saturacao_bases, True) if saturacao_bases else '-',
                'rel_calcio_magnesio': {
                    'value': locale.format_string('%.2f', obj.calcio_cmolc_dm3/obj.magnesio_cmolc_dm3, True),
                    'level': 'BAIXO' if obj.calcio_cmolc_dm3/obj.magnesio_cmolc_dm3 < niveis_embrapa['rel_ca_mg']['min'] else ('ALTO' if obj.calcio_cmolc_dm3/obj.magnesio_cmolc_dm3 > niveis_embrapa['rel_ca_mg']['max'] else 'IDEAL'),
                    'color': 'warning' if obj.calcio_cmolc_dm3/obj.magnesio_cmolc_dm3 < niveis_embrapa['rel_ca_mg']['min'] else ('primary' if obj.calcio_cmolc_dm3/obj.magnesio_cmolc_dm3 > niveis_embrapa['rel_ca_mg']['max'] else 'success'),
                },
                
                'rel_calcio_potassio': {
                    'value': locale.format_string('%.2f', obj.calcio_cmolc_dm3/obj.potassio_cmolc_dm3, True),
                    'level': 'BAIXO' if obj.calcio_cmolc_dm3/obj.potassio_cmolc_dm3 < niveis_embrapa['rel_ca_K']['min'] else ('ALTO' if obj.calcio_cmolc_dm3/obj.potassio_cmolc_dm3 > niveis_embrapa['rel_ca_K']['max'] else 'IDEAL'),
                    'color': 'warning' if obj.calcio_cmolc_dm3/obj.potassio_cmolc_dm3 < niveis_embrapa['rel_ca_K']['min'] else ('primary' if obj.calcio_cmolc_dm3/obj.potassio_cmolc_dm3 > niveis_embrapa['rel_ca_K']['max'] else 'success'),
                }, 
                'rel_magnesio_potassio': {
                    'value': locale.format_string('%.2f', obj.magnesio_cmolc_dm3/obj.potassio_cmolc_dm3, True),
                    'level': 'BAIXO' if obj.magnesio_cmolc_dm3/obj.potassio_cmolc_dm3 < niveis_embrapa['rel_mg_k']['min'] else ('ALTO' if obj.calcio_cmolc_dm3/obj.potassio_cmolc_dm3 > niveis_embrapa['rel_ca_K']['max'] else 'IDEAL'),
                    'color': 'warning' if obj.magnesio_cmolc_dm3/obj.potassio_cmolc_dm3 < niveis_embrapa['rel_mg_k']['min'] else ('primary' if obj.magnesio_cmolc_dm3/obj.potassio_cmolc_dm3 > niveis_embrapa['rel_mg_k']['max'] else 'success'),
                }, 
                'calagem': locale.format_string('%.2f', calagem, True) if calagem else '-',
            }
        else:
            calculos = {
                'soma_bases': '-',
                'capacidade_troca_cations': '-',
                'saturacao_bases': '-',
                'calagem': '-',
            }
        return calculos
    def get_creation(self, obj):
        return {'created_at':obj.created_at, 'created_by':f"{obj.created_by.first_name} {obj.created_by.last_name}"}
    def get_token_apimaps(self, obj):
        return TOKEN_GOOGLE_MAPS_API
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name in ['fazenda', 'cliente', 'identificacao_amostra', 'profundidade', 'responsavel', 'laboratorio_analise']:
                    field.required = True
        else:
            for field_name, field in self.fields.items():
                field.required = False
    def validate_file(self, value):
        if 'file' in self.initial_data:
            file = self.initial_data.get('file')
            file_name = file.name.lower()
            if not file_name.endswith('.pdf'):
                raise serializers.ValidationError("Arquivo deve ser em formato PDF!")     
            return file
        else:
            return None
    class Meta:
        model = Analise_Solo
        fields = '__all__'

class ListFeedbacks(serializers.ModelSerializer):
    str_category = serializers.CharField(source='category.description', read_only=True)
    str_user = serializers.CharField(source='user.first_name', read_only=True)
    user_avatar = serializers.SerializerMethodField(read_only=True)
    replys = serializers.SerializerMethodField()
    def get_user_avatar(self, obj):
        return '/media/'+obj.user.profile.avatar.name
    def get_replys(self, obj):
        return [{
            'id': r.id,
            'text': r.text,
            'created_at': r.created_at
        }for r in Feedbacks_Replies.objects.filter(feedback=obj)]
    class Meta:
        model = Feedbacks_System
        fields = '__all__'

class detailFeedbacks(serializers.ModelSerializer):
    str_user = serializers.CharField(source='user.first_name', read_only=True)
    user_avatar = serializers.SerializerMethodField(read_only=True)
    replys = serializers.SerializerMethodField()
    def get_user_avatar(self, obj):
        return '/media/'+obj.user.profile.avatar.name
    def get_replys(self, obj):
        return [{
            'id': r.id,
            'text': r.text,
            'created_at': r.created_at
        }for r in Feedbacks_Replies.objects.filter(feedback=obj)]
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['category', 'description']:
                field.required = True
    class Meta:
        model = Feedbacks_System
        fields = '__all__'


class ListFeedbacksCategory(serializers.ModelSerializer):
    class Meta:
        model = Feedbacks_Category
        fields = '__all__'

class FeedbackReply(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['text']:
                field.required = True
    class Meta:
        model = Feedbacks_Replies
        fields = '__all__'
    

class SenhasLoginsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Senhas_Logins
        fields = '__all__'

class listCadastro_Pessoal(serializers.ModelSerializer):
    grupo_info = serializers.CharField(source='grupo.nome_grupo', required=False, read_only=True)
    natureza = serializers.CharField(source='get_natureza_display', read_only=True)
    str_municipio = serializers.SerializerMethodField(read_only=True)
    def get_str_municipio(self, obj):
        return obj.municipio.nome_municipio + ' - ' + obj.municipio.sigla_uf
    class Meta:
        model = Cadastro_Pessoal
        fields = ['id', 'uuid', 'razao_social', 'natureza', 'cpf_cnpj', 'numero_rg', 'str_municipio', 'grupo_info']

class detailCadastro_Pessoal(serializers.ModelSerializer):
    grupo_info = serializers.CharField(source='grupo.nome_grupo', required=False, read_only=True)
    contas_bancarias = serializers.SerializerMethodField(read_only=True)
    str_natureza = serializers.CharField(source='get_natureza_display', read_only=True)
    str_categoria = serializers.CharField(source='categoria.categoria', read_only=True)
    str_municipio = serializers.SerializerMethodField(read_only=True)
    str_created_by = serializers.SerializerMethodField(read_only=True)
    def get_str_created_by(self, obj):
        return obj.created_by.first_name+' '+obj.created_by.last_name
    def get_str_municipio(self, obj):
        return obj.municipio.nome_municipio + ' - ' + obj.municipio.sigla_uf
    def get_contas_bancarias(self, obj):
        return [{
            'id': c.id,
            'banco': c.instituicao.instituicao.razao_social,
            'identificacao': c.instituicao.identificacao,
            'agencia': c.agencia,
            'conta': c.conta,
        }for c in Contas_Bancarias_Clientes.objects.filter(cliente=obj)]
     
    def validate_cpf_cnpj(self, value):
        if not Frasson.valida_cpf_cnpj(value):
            raise serializers.ValidationError("CPF ou CNPJ Inválido!")
        return value
    def validate_cep_logradouro(self, value):
        if not Frasson.valida_cep(value):
            raise serializers.ValidationError("CEP Inválido!")
        return value
    def validate_avatar(self, value):
        if 'avatar' in self.initial_data:
            file = self.initial_data.get('avatar')
            ext = os.path.splitext(file.name)[1]
            valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
            if not ext.lower() in valid_extensions:
                raise serializers.ValidationError("Arquivo deve ser uma Imagem!")     
            if file and value != 'default-avatar.jpg':
                os.remove(self.instance.avatar.path)
            return file
        else:
            return None
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name in ['razao_social', 'municipio', 'cpf_cnpj', 'logradouro', 'cep_logradouro', 'categoria']:
                    field.required = True
        else:
            for field_name, field in self.fields.items():
                field.required = False
    class Meta:
        model = Cadastro_Pessoal
        fields = '__all__'

class serializerInstituicoes_Parceiras(serializers.ModelSerializer):
    razao_social = serializers.CharField(source='instituicao.razao_social', required=False, read_only=True)
    class Meta:
        model = Instituicoes_Parceiras
        fields = ['id', 'razao_social', 'identificacao', 'instituicao']

class listInstituicoes_RazaoSocial(serializers.ModelSerializer):
    class Meta:
        model = Instituicoes_Razao_Social
        fields = ['id', 'razao_social', 'cnpj']  

class serializer_Cad_Produtos(serializers.ModelSerializer):
    class Meta:
        model = Produtos_Frasson
        fields = ['id', 'description', 'acronym']

class serializerDetalhamento_Servicos(serializers.ModelSerializer):
    str_produto = serializers.CharField(source='produto.acronym', required=False, read_only=True)
    class Meta:
        model = Detalhamento_Servicos
        fields = ['id', 'str_produto', 'detalhamento_servico']

class serializerContratos_Servicos(serializers.ModelSerializer):
    str_contratante = serializers.CharField(source='contratante.razao_social', required=False, read_only=True)
    class Meta:
        model = Contratos_Ambiental
        fields = ['id', 'str_contratante', 'produto']

class serializerAnexos(serializers.ModelSerializer):
    user = serializers.SerializerMethodField(read_only=True)
    def get_user(self, obj):
        if obj.uploaded_by:
            return {'id':obj.uploaded_by.id, 'name':obj.uploaded_by.first_name+' '+obj.uploaded_by.last_name}
        else:
            return {'id':'', 'name':'-'+' '+'-'}
    class Meta:
        model = Anexos
        fields = '__all__'