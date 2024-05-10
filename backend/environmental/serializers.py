from rest_framework import serializers
from .models import Processos_Outorga, Processos_Outorga_Coordenadas, Prazos_Renovacao, Finalidade_APPO, Tipo_Captacao
from .models import Processos_APPO, Processos_APPO_Coordenadas, Aquifero_APPO, Processos_ASV, Processos_ASV_Areas
from backend.settings import TOKEN_GOOGLE_MAPS_API
from datetime import timedelta, date, datetime
from backend.frassonUtilities import Frasson

class serializerOutorga(serializers.ModelSerializer):
    str_tipo_captacao = serializers.CharField(source='captacao.description', required=False, read_only=True)
    qtd_pontos = serializers.SerializerMethodField(required=False, read_only=True)
    status = serializers.SerializerMethodField(required=False, read_only=True)

    def get_qtd_pontos(self, obj):
        qtd = Processos_Outorga_Coordenadas.objects.filter(processo=obj).count()   
        return qtd
    
    def get_status(self, obj):
        if obj.data_validade:
            return {
                'color': 'danger' if obj.data_validade < date.today() else 'success', 
                'text': 'Vencido' if obj.data_validade < date.today() else 'Vigente'
            }
        else:           
            return {
                'color': 'dark', 
                'text': 'Indefinido'
            }
        
    class Meta:
        model = Processos_Outorga
        fields = ['uuid', 'nome_requerente', 'cpf_cnpj', 'str_tipo_captacao',  'numero_processo', 'numero_portaria', 
                  'data_publicacao', 'qtd_pontos', 'status']

class detailOutorga(serializers.ModelSerializer):
    str_tipo_captacao = serializers.CharField(source='captacao.description', required=False, read_only=True)
    str_finalidade = serializers.CharField(source='finalidade.description', required=False, read_only=True)
    qtd_pontos = serializers.SerializerMethodField(read_only=True, required=False)
    info_user = serializers.SerializerMethodField(read_only=True, required=False)
    token_apimaps = serializers.SerializerMethodField(read_only=True, required=False)
    renovacao = serializers.SerializerMethodField(read_only=True, required=False)

    nome_municipio = serializers.SerializerMethodField()

    def get_nome_municipio(self, obj):
        return f"{obj.municipio.nome_municipio} - {obj.municipio.sigla_uf}"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name not in ['str_tipo_captacao', 'str_finalidade', 'qtd_pontos', 'info_user', 'token_apimaps', 'renovacao', 'area_ha']:
                field.required = True

    def get_qtd_pontos(self, obj):
        qtd = Processos_Outorga_Coordenadas.objects.filter(processo=obj).count()   
        return qtd
    
    def get_info_user(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'first_name': obj.created_by.first_name,
                'last_name': obj.created_by.last_name,
            }
        else:
            return None
        
    def get_renovacao(self, obj):
        dias_renovacao = Prazos_Renovacao.objects.get(pk = 1).dias_para_renov
        if obj.data_validade:
            data_ppv = obj.data_validade - timedelta(days=dias_renovacao)
            return {
                'dias': dias_renovacao,
                'data': data_ppv,
            }
        else:
            return None
        
    def get_token_apimaps(self, obj):
        return TOKEN_GOOGLE_MAPS_API
    
    def validate_data_validade(self, value):
        data_publi = self.initial_data.get('data_publicacao')
        data_publi  = datetime.strptime(data_publi, "%Y-%m-%d").date()
        
        if data_publi and value and data_publi > value:
            raise serializers.ValidationError("A Data de Vencimento não pode ser menor que a Data de Publicação.")
        
        return value
    
    class Meta:
        model = Processos_Outorga
        fields = '__all__'

class serializerCoordenadaOutorga(serializers.ModelSerializer):
    status_processo = serializers.SerializerMethodField(required=False, read_only=True)
    def get_status_processo(self, obj):
        if obj.processo:
            return 'Vencido' if obj.processo.data_validade < date.today() else 'Vigente'
        else:           
            return 'Indefinido'
        
    class Meta:
        model = Processos_Outorga_Coordenadas
        fields = ['id', 'latitude_gd', 'longitude_gd', 'status_processo']

class detailCoordenadaOutorga(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['vazao_m3_dia', 'bombeamento_h', 'descricao_ponto']:
                field.required = True

    def validate_latitude_gd(self, value):
        lat = float(self.initial_data.get('latitude_gd'))
        if not (-18.350549 < lat < -8.528614):
            raise serializers.ValidationError('Fora do limite permitido')
        
        return value
    
    def validate_longitude_gd(self, value):
        long = float(self.initial_data.get('longitude_gd'))
        if not (-46.70 < long < -37.330803):
            raise serializers.ValidationError('Fora do limite permitido')
        
        return value
    
    def validate(self, data):
        latitude = data.get('latitude_gd')
        longitude = data.get('longitude_gd')

        if self.instance: # Verifica se é uma edição
            result = Frasson.verificaCoordenadaEdicao(latitude, longitude, self.instance.pk, 'outorga')
            if result:
                raise serializers.ValidationError('A coordenada informada já está cadastrada ou muito próxima de outra já existente nos registros de outorga. Por favor, verifique.')

        else: # Se não é uma edição, é um novo registro
            result = Frasson.verificaCoordenadaCadastro(latitude, longitude, 'outorga')
            if result:
                raise serializers.ValidationError('A coordenada informada já está cadastrada ou muito próxima de outra já existente nos registros de outorga. Por favor, verifique.')

        return data
    
    class Meta:
        model = Processos_Outorga_Coordenadas
        fields = '__all__'

class CoordenadaOutorga(serializers.ModelSerializer):
    outorga = serializers.SerializerMethodField(read_only=True, required=False)

    def get_outorga(self, obj):
        if obj.processo:
            return {
                'uuid': obj.processo.uuid,
                'requerente': obj.processo.nome_requerente,
                'cpf_cnpj': obj.processo.cpf_cnpj,
                'processo': obj.processo.numero_processo,
                'portaria': obj.processo.numero_portaria,
                'nome_fazenda': obj.processo.nome_propriedade,
                'municipio': f"{obj.processo.municipio.nome_municipio} - {obj.processo.municipio.sigla_uf}",
                'bacia': obj.processo.bacia_hidro,
                'captacao': obj.processo.captacao.description,
                'data_validade': obj.processo.data_validade,
                'status': 'Vigente' if obj.processo.data_validade >= date.today() else 'Vencida',
                'finalidade': obj.processo.finalidade.description,
            }
        else:
            return None
        
    class Meta:
        model = Processos_Outorga_Coordenadas
        fields = '__all__'




class listAPPO(serializers.ModelSerializer):
    qtd_pontos = serializers.SerializerMethodField(required=False, read_only=True)
    status = serializers.SerializerMethodField(required=False, read_only=True)
    renovacao = serializers.SerializerMethodField(read_only=True, required=False)
    nome_municipio = serializers.CharField(source='municipio.nome_municipio', required=False, read_only=True)

    def get_qtd_pontos(self, obj):
        qtd = Processos_APPO_Coordenadas.objects.filter(processo=obj).count()   
        return qtd
    
    def get_renovacao(self, obj):
        dias_renovacao = Prazos_Renovacao.objects.get(pk = 1).dias_para_renov
        if obj.data_vencimento:
            data_ppv = obj.data_vencimento - timedelta(days=dias_renovacao)
            return {
                'dias': dias_renovacao,
                'data': data_ppv,
            }
        else:
            return None

    def get_status(self, obj):
        if obj.data_vencimento:
            return {
                'color': 'danger' if obj.data_vencimento <= date.today() else 'success', 
                'text': 'Vencida' if obj.data_vencimento <= date.today() else 'Vigente'
            }
        else:
            return None
        
    class Meta:
        model = Processos_APPO
        fields = ['uuid', 'nome_requerente', 'cpf_cnpj', 'nome_municipio', 'numero_processo', 'qtd_pontos', 'status', 'renovacao', 'data_vencimento']

class detailAPPO(serializers.ModelSerializer):
    str_tipo_aquifero = serializers.CharField(source='aquifero.description', required=False, read_only=True)
    qtd_pontos = serializers.SerializerMethodField(read_only=True, required=False)
    info_user = serializers.SerializerMethodField(read_only=True, required=False)
    token_apimaps = serializers.SerializerMethodField(read_only=True, required=False)
    renovacao = serializers.SerializerMethodField(read_only=True, required=False)
    nome_municipio = serializers.SerializerMethodField()
    file = serializers.FileField(required=False)

    def get_nome_municipio(self, obj):
        return f"{obj.municipio.nome_municipio} - {obj.municipio.sigla_uf}"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name not in ['str_tipo_aquifero', 'qtd_pontos', 'info_user', 'token_apimaps', 'renovacao', 'file']:
                field.required = True

    def get_qtd_pontos(self, obj):
        qtd = Processos_APPO_Coordenadas.objects.filter(processo=obj).count()   
        return qtd
    
    def get_info_user(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'first_name': obj.created_by.first_name,
                'last_name': obj.created_by.last_name,
            }
        else:
            return None
        
    def get_renovacao(self, obj):
        dias_renovacao = Prazos_Renovacao.objects.get(pk = 1).dias_para_renov
        if obj.data_vencimento:
            data_ppv = obj.data_vencimento - timedelta(days=dias_renovacao)
            return {
                'dias': dias_renovacao,
                'data': data_ppv,
            }
        else:
            return None
        
    def get_token_apimaps(self, obj):
        return TOKEN_GOOGLE_MAPS_API
    
    def validate_data_vencimento(self, value):
        data_publi = self.initial_data.get('data_documento')
        data_publi  = datetime.strptime(data_publi, "%Y-%m-%d").date()
        
        if data_publi and value and data_publi > value:
            raise serializers.ValidationError("A Data de Vencimento não pode ser menor que a Data do Documento.")
        
        return value
    
    class Meta:
        model = Processos_APPO
        fields = '__all__'

class listCoordenadaAPPO(serializers.ModelSerializer):
    class Meta:
        model = Processos_APPO_Coordenadas
        fields = ['id', 'latitude_gd', 'longitude_gd']

class detailCoordenadaAPPO(serializers.ModelSerializer):
    str_finalidade = serializers.CharField(source='finalidade.description', required=False, read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['processo', 'numero_poco', 'latitude_gd', 'longitude_gd', 'vazao_m3_dia', 'finalidade']:
                field.required = True
    
    def validate_latitude_gd(self, value):
        lat = float(self.initial_data.get('latitude_gd'))
        if not (-18.350549 < lat < -8.528614):
            raise serializers.ValidationError('Fora do limite permitido')
        
        return value
    
    def validate_longitude_gd(self, value):
        long = float(self.initial_data.get('longitude_gd'))
        if not (-46.70 < long < -37.330803):
            raise serializers.ValidationError('Fora do limite permitido')
        
        return value
    
    def validate(self, data):
        latitude = data.get('latitude_gd')
        longitude = data.get('longitude_gd')

        if self.instance.pk: # Verifica se é uma edição
            result = Frasson.verificaCoordenadaEdicao(latitude, longitude, self.instance.pk, 'appo')
            if result:
                raise serializers.ValidationError('A coordenada informada já está cadastrada ou muito próxima de outra já existente nos registros de outorga. Por favor, verifique.')

        else: # Se não é uma edição, é um novo registro
            result = Frasson.verificaCoordenadaCadastro(latitude, longitude, 'appo')
            if result:
                raise serializers.ValidationError('A coordenada informada já está cadastrada ou muito próxima de outra já existente nos registros de outorga. Por favor, verifique.')

        return data   
    
    class Meta:
        model = Processos_APPO_Coordenadas
        fields = '__all__'

class CoordenadaAPPO(serializers.ModelSerializer):
    str_finalidade = serializers.CharField(source='finalidade.description', required=False, read_only=True)
    appo = serializers.SerializerMethodField(read_only=True, required=False)

    def get_appo(self, obj):
        if obj.processo:
            return {
                'uuid': obj.processo.uuid,
                'requerente': obj.processo.nome_requerente,
                'cpf_cnpj': obj.processo.cpf_cnpj,
                'processo': obj.processo.numero_processo,
                'nome_fazenda': obj.processo.nome_fazenda,
                'municipio': f"{obj.processo.municipio.nome_municipio} - {obj.processo.municipio.sigla_uf}",
                'data_publicacao': datetime.strptime(str(obj.processo.data_documento), '%Y-%m-%d').strftime("%d/%m/%Y"),
                'data_validade': datetime.strptime(str(obj.processo.data_vencimento), '%Y-%m-%d').strftime("%d/%m/%Y"),
                'status': 'Vigente' if obj.processo.data_vencimento >= date.today() else 'Vencida'
            }
        else:
            return None
        
    class Meta:
        model = Processos_APPO_Coordenadas
        fields = '__all__'

class listASV(serializers.ModelSerializer):
    str_empresa = serializers.CharField(source='empresa.razao_social', required=False, read_only=True)
    status = serializers.SerializerMethodField(required=False, read_only=True)
    def get_status(self, obj):
        if obj.data_vencimento:
            return {
                'color': 'danger' if obj.data_vencimento < date.today() else 'success', 
                'text': 'Vencido' if obj.data_vencimento < date.today() else 'Vigente'
            }
        else:           
            return {
                'color': 'dark', 
                'text': '-'
            }
        
    class Meta:
        model = Processos_ASV
        fields = ['uuid', 'requerente', 'cpf_cnpj', 'portaria', 'data_publicacao', 'str_empresa', 'area_total', 'status']


class serializerCaptacao(serializers.ModelSerializer):
        class Meta:
            model = Tipo_Captacao
            fields = ['id', 'description']

class serializerAquifero(serializers.ModelSerializer):
        class Meta:
            model = Aquifero_APPO
            fields = ['id', 'description']

class serializerFinalidade(serializers.ModelSerializer):
        class Meta:
            model = Finalidade_APPO
            fields = ['id', 'description']
