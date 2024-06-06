from rest_framework import serializers
from .models import Card_Produtos, Pipe, Detalhamento_Servicos, Contratos_Servicos, Cadastro_Pessoal, Card_Prospects, Fornecedores_Colaboradores
from .models import Instituicoes_Parceiras, Operacoes_Contratadas, ContasBancarias_Clientes, Instituicoes_Razao_Social, Prospect_Monitoramento_Prazos
from alongamentos.models import Operacoes_Credito
from finances.models import Cobrancas_Pipefy
from .models import Contratos_Pagamentos
from datetime import datetime
import requests, json, locale, re
from backend.settings import TOKEN_PIPEFY_API, URL_PIFEFY_API, MEDIA_URL, TOKEN_GOOGLE_MAPS_API
from users.models import Profile
from django.db.models import Q, Sum

class serializerCadastro_Pessoal(serializers.ModelSerializer):
    class Meta:
        model = Cadastro_Pessoal
        fields = ['id', 'razao_social', 'cpf_cnpj']

class listCadastro_Pessoal(serializers.ModelSerializer):
    grupo_info = serializers.CharField(source='grupo.nome_grupo', required=False, read_only=True)
    class Meta:
        model = Cadastro_Pessoal
        fields = ['id', 'uuid', 'razao_social', 'natureza', 'cpf_cnpj', 'numero_rg', 'municipio', 'grupo_info']

class detailCadastro_Pessoal(serializers.ModelSerializer):
    grupo_info = serializers.CharField(source='grupo.nome_grupo', required=False, read_only=True)
    contas_bancarias = serializers.SerializerMethodField()
    class Meta:
        model = Cadastro_Pessoal
        fields = '__all__'
    def get_contas_bancarias(self, obj):
        return [{
            'id': c.id,
            'banco': c.instituicao.instituicao.razao_social,
            'identificacao': c.instituicao.identificacao,
            'agencia': c.agencia,
            'conta': c.conta,
        }for c in ContasBancarias_Clientes.objects.filter(cliente=obj)]

class serializerInstituicoes_Parceiras(serializers.ModelSerializer):
    razao_social = serializers.CharField(source='instituicao.razao_social', required=False, read_only=True)
    class Meta:
        model = Instituicoes_Parceiras
        fields = ['id', 'razao_social', 'identificacao']

class listInstituicoes_RazaoSocial(serializers.ModelSerializer):
    class Meta:
        model = Instituicoes_Razao_Social
        fields = ['id', 'razao_social', 'cnpj']  

class serializerDetalhamento_Servicos(serializers.ModelSerializer):
    class Meta:
        model = Detalhamento_Servicos
        fields = ['id', 'produto', 'detalhamento_servico']

class serializerContratos_Servicos(serializers.ModelSerializer):
    contratante = serializers.CharField(source='contratante.razao_social', required=False, read_only=True)
    class Meta:
        model = Contratos_Servicos
        fields = ['id', 'contratante', 'produto']

class detailCard_Produtos(serializers.ModelSerializer):
    history_phases = serializers.SerializerMethodField(read_only=True)
    data_pipefy = serializers.SerializerMethodField(read_only=True)
    detalhe = serializers.CharField(source='detalhamento.detalhamento_servico', read_only=True)
    produto = serializers.CharField(source='detalhamento.produto', read_only=True)
    str_instituicao = serializers.CharField(source='instituicao.instituicao.razao_social', read_only=True)
    list_beneficiarios = serializers.SerializerMethodField(read_only=True)
    comments = serializers.SerializerMethodField(read_only=True)
    assignees = serializers.SerializerMethodField(read_only=True)
    cardComments = None
    cardAssignees = None
    phasesHistory = None
    def get_data_pipefy(self, obj):
        payload = {"query":"{card (id:" + str(obj.id) + ") {age createdAt url createdBy{name avatarUrl} current_phase{name} phases_history{phase{name} duration lastTimeIn lastTimeOut} comments{created_at author{name avatarUrl} text} assignees{name avatarUrl} due_date}}"}
        headers = {"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"}
        response = requests.post(URL_PIFEFY_API, json=payload, headers=headers)
        obj = json.loads(response.text)
        created_at = datetime.strptime(str(obj["data"]["card"]["createdAt"])[:19].replace('T', ' '), '%Y-%m-%d %H:%M:%S').strftime("%d/%m/%Y às %H:%M")
        created_by = obj["data"]["card"]["createdBy"]["name"]
        due_date_str = datetime.strptime(str(obj["data"]["card"]["due_date"])[:19].replace('T', ' '), '%Y-%m-%d %H:%M:%S').strftime("%d/%m/%Y %H:%M")
        due_date = datetime.strptime(str(obj["data"]["card"]["due_date"])[:19].replace('T', ' '), '%Y-%m-%d %H:%M:%S')
        card_vencido = True if due_date < datetime.now() else False
        self.cardComments = obj["data"]["card"]["comments"]
        self.cardAssignees = obj["data"]["card"]["assignees"]
        self.phasesHistory = obj["data"]["card"]["phases_history"]
        age_card = round(int(obj["data"]["card"]["age"])/86400)   
        return {'created_by':created_by, 'created_at':created_at, 'age_card':age_card, 'card_vencido':card_vencido, 'due_date':due_date_str}
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance:  # Verifica se existe uma instância
            self.get_data_pipefy(self.instance)
    def get_history_phases(self, obj):
        history_phases = []
        for phase in self.phasesHistory:
            lastTimeOut = phase["lastTimeOut"]
            if lastTimeOut == None:
                lastTimeOut_corr = '-'
            else:
                lastTimeOut_corr = datetime.strptime(str(phase["lastTimeOut"])[:19].replace('T', ' '), '%Y-%m-%d %H:%M:%S').strftime("%d/%m/%Y %H:%M")
            if phase["phase"]["name"] != 'Start form':
                history_phases.append({
                    'name': phase["phase"]["name"],
                    'days': int(phase["duration"]/86400),
                    'lastTimeIn': datetime.strptime(str(phase["lastTimeIn"])[:19].replace('T', ' '), '%Y-%m-%d %H:%M:%S').strftime("%d/%m/%Y %H:%M"),
                    'lastTimeOut': lastTimeOut_corr
                })
        return history_phases
    def get_comments(self, obj):
        comments = [{
            'author': comment["author"]["name"],
            'avatarUrl':comment["author"]["avatarUrl"],
            'text': comment["text"],
            'created_at': datetime.strptime(str(comment["created_at"])[:19].replace('T', ' '), '%Y-%m-%d %H:%M:%S').strftime("%d/%m/%Y %H:%M")
        } for comment in self.cardComments]
        return comments
    def get_assignees(self, obj):
        assignees = [{
            'name':assignee["name"],
            'avatarUrl': assignee["avatarUrl"]
        } for assignee in self.cardAssignees]
        return assignees
    def get_list_beneficiarios(self, obj):
        beneficiarios = obj.beneficiario.all()
        string = f"{beneficiarios[0].razao_social}" if len(beneficiarios) == 1 else '-' if len(beneficiarios) == 0 else ', '.join([f"{r.razao_social}" for r in beneficiarios])
        return string
    class Meta:
        model = Card_Produtos
        fields = '__all__'
        
class listCard_Produtos(serializers.ModelSerializer):
    list_beneficiarios = serializers.SerializerMethodField(read_only=True)
    detalhe = serializers.CharField(source='detalhamento.detalhamento_servico', read_only=True)
    str_instituicao = serializers.CharField(source='instituicao.instituicao.razao_social', read_only=True)
    def get_list_beneficiarios(self, obj):
        beneficiarios = obj.beneficiario.all()
        string = f"{beneficiarios[0].razao_social}" if len(beneficiarios) == 1 else '-' if len(beneficiarios) == 0 else ', '.join([f"{r.razao_social}" for r in beneficiarios])
        return string
    class Meta:
        model = Card_Produtos
        fields = ['id', 'list_beneficiarios', 'str_instituicao', 'detalhe', 'phase_name']
        
class serializerCard_Prospects(serializers.ModelSerializer):
    str_prospect = serializers.CharField(source='prospect.cliente', read_only=True)
    status = serializers.SerializerMethodField(read_only=True)
    responsaveis_list = serializers.SerializerMethodField(read_only=True)
    def get_status(self, obj):
        data_prazo = obj.data_vencimento
        status = {'text': 'Atrasado', 'color':'warning' } if data_prazo and datetime.now() > data_prazo else {'text': 'No Prazo', 'color':'success'}
        return status
    def get_responsaveis_list(self, obj):
        respons = obj.responsavel.all()
        responsaveis = f"{respons[0].user.first_name} {respons[0].user.last_name}" if len(respons) == 1 else '-' if len(respons) == 0 else ', '.join([f"{r.user.first_name} {r.user.last_name}" for r in respons])
        return responsaveis
    class Meta:
        model = Card_Prospects
        fields = '__all__'

class detailCard_Prospects(serializers.ModelSerializer):
    str_prospect = serializers.CharField(source='prospect.cliente', read_only=True)
    monitoramentos = serializers.SerializerMethodField(read_only=True)
    pipefy = serializers.SerializerMethodField(read_only=True)
    def get_monitoramentos(self, obj):
        monitoramentos_prazo = Prospect_Monitoramento_Prazos.objects.filter(prospect_id=obj.id)
        monitoramentoslist = [{'id':m.id, 'data_vencimento': m.data_vencimento.strftime("%d/%m/%Y"), 'description': m.description,
            'avatar': MEDIA_URL+m.created_by.profile.avatar.name, 'user': m.created_by.first_name} for m in monitoramentos_prazo]
        return monitoramentoslist
    def get_pipefy(self, obj):
        payload = {"query":"{card (id:" + str(obj.id) + ") {age createdAt url due_date createdBy{name avatarUrl} current_phase{name} comments{created_at author{name avatarUrl} text} assignees{name avatarUrl} due_date}}"}
        headers = {"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"}
        response = requests.post(URL_PIFEFY_API, json=payload, headers=headers)
        obj = json.loads(response.text)
        data_objeto = datetime.strptime(obj["data"]["card"]["due_date"], "%Y-%m-%dT%H:%M:%S%z") if obj["data"]["card"]["due_date"] else '-'
        data_formatada = data_objeto.strftime("%d/%m/%Y %H:%M")
        return {'due_date': data_formatada, 'color_date': 'danger' if datetime.strptime(obj["data"]["card"]["due_date"][:19], "%Y-%m-%dT%H:%M:%S") < datetime.now() else 'success',
            'responsavel': obj["data"]["card"]["assignees"]}     
    class Meta:
        model = Card_Prospects
        fields = '__all__'
        


class listOperacoes(serializers.ModelSerializer):
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', read_only=True)
    name_instituicao = serializers.CharField(source='instituicao.instituicao.razao_social', required=False, read_only=True)
    name_item = serializers.CharField(source='item_financiado.item', required=False, read_only=True)
    class Meta:
        model = Operacoes_Contratadas
        fields = ['id', 'data_emissao_cedula', 'numero_operacao', 'safra', 'str_beneficiario', 'name_instituicao', 'name_item',
            'data_primeiro_vencimento', 'data_vencimento', 'taxa_juros', 'valor_operacao']
        
class detailOperacoes(serializers.ModelSerializer):
    str_beneficiario = serializers.CharField(source='beneficiario.razao_social', read_only=True)
    cpf_beneficiario = serializers.CharField(source='beneficiario.cpf_cnpj', read_only=True)
    rg_beneficiario = serializers.CharField(source='beneficiario.numero_rg', read_only=True)
    pipefy = serializers.SerializerMethodField(read_only=True)
    alongamento = serializers.SerializerMethodField(read_only=True)
    token_apimaps = serializers.SerializerMethodField(read_only=True, required=False)
    def get_pipefy(self, obj):
        operacao = {}
        payload = {"query":"{table_record(id:" + str(obj.id) + ") {id url created_at created_by{name} record_fields{array_value native_value float_value field{id type}}}}"}
        headers = {"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"}
        response = requests.post(URL_PIFEFY_API, json=payload, headers=headers)
        obj = json.loads(response.text)
        operacao['url'] = obj["data"]["table_record"]["url"]
        operacao['created_at'] = datetime.strptime(str(obj["data"]["table_record"]["created_at"][:19].replace("T", " ")), '%Y-%m-%d %H:%M:%S').strftime('%d/%m/%Y %H:%M')
        operacao['created_by'] = obj["data"]["table_record"]["created_by"]["name"]
        record_fields = obj["data"]["table_record"]["record_fields"]
        for field in record_fields:
            if field["field"]["type"] == "number":
                operacao[field["field"]["id"]] = locale.format_string('%.2f', field["float_value"], True) if field["float_value"] != None else '-'

            elif field["field"]["type"] == "currency":
                operacao[field["field"]["id"]] = locale.currency(field["float_value"], grouping=True) if field["float_value"] != None else '-'

            elif field["field"]["type"] == "date":
                operacao[field["field"]["id"]] = datetime.strptime(str(field["native_value"]), '%Y-%m-%d').strftime('%d/%m/%Y') if field["native_value"] != None else '-'

            elif field["field"]["id"] == "gleba_financiada":
                operacao[field["field"]["id"]] = field["native_value"].split(',')
                urls = field["native_value"]
                list_urls = urls.split(',') #get the file urls and create a list
                list_names = re.findall(r'/([^/]+)\.kml', urls) #get the file names and create a list
                operacao["kml_files"] = [{'url': x, 'file_name': y} for x, y in zip(list_urls, list_names)]
            
            elif field["field"]["id"] == "c_dula_digitalizada":
                urls = field["native_value"]
                list_urls = urls.split(',') #get the file urls and create a list
                list_names = re.findall(r'/([^/]+)\.pdf', urls) #get the file names and create a list
                operacao[field["field"]["id"]] = [{'url': x, 'file_name': y} for x, y in zip(list_urls, list_names)]

            else:
                operacao[field["field"]["id"]] = field["native_value"]
        return operacao
    def get_alongamento(self, obj):
        operacao = {}
        if obj.instituicao.instituicao_id == 47106067 and obj.item_financiado.tipo == "Custeio" and "Feijão" not in obj.item_financiado.item:
            operacao['alongamento_permission'] = True
        else:
            operacao['alongamento_permission'] = False

        #verifica se já possui alongamento registrado
        if Operacoes_Credito.objects.filter(operacao_id=obj.id).exists():
            operacao['along'] = True
            operacao['alongamento_total'] = locale.currency(Operacoes_Credito.objects.get(operacao_id=obj.id).valor_total, grouping=True)
            operacao['alongamento_id'] = Operacoes_Credito.objects.get(operacao_id=obj.id).id
        else:
            operacao['along'] = False
        return operacao
    def get_token_apimaps(self, obj):
        return TOKEN_GOOGLE_MAPS_API

    class Meta:
        model = Operacoes_Contratadas
        fields = '__all__'
        

class serMonitoramentoPrazos(serializers.ModelSerializer): 
    avatar = serializers.SerializerMethodField(read_only=True)
    def get_avatar(self, obj):
        path = MEDIA_URL+obj.created_by.profile.avatar.name
        return path
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['data_vencimento', 'prospect', 'description', 'created_by']:
                field.required = True
    class Meta:
        model = Prospect_Monitoramento_Prazos
        fields = '__all__'

class listFornColab(serializers.ModelSerializer):
    class Meta:
        model = Fornecedores_Colaboradores
        fields = ['id', 'razao_social', 'cpf_cnpj']

class listContratoServicos(serializers.ModelSerializer):
    str_contratante = serializers.CharField(source='contratante.razao_social', read_only=True)
    str_servicos = serializers.SerializerMethodField(read_only=True)
    str_produto = serializers.SerializerMethodField(read_only=True)
    status = serializers.SerializerMethodField(read_only=True)
    total_formas = serializers.DecimalField(read_only=True, max_digits=15, decimal_places=2)

    class Meta:
        model = Contratos_Servicos
        fields = [
            'id', 'str_contratante', 'str_servicos', 'str_produto', 'valor_gai', 
            'percentual_gc', 'data_assinatura', 'data_vencimento', 'status', 'total_formas'
        ]

    def get_str_servicos(self, obj):
        return ', '.join([s.detalhamento_servico for s in obj.servicos_contratados.all()])

    def get_str_produto(self, obj):
        return ', '.join([s['produto__acronym'] for s in obj.servicos_contratados.all().values('produto__acronym').distinct()])

    def get_str_valor_gai(self, obj):
        return locale.format_string('%.2f', obj.valor_gai, True) if obj.valor_gai is not None else '-'

    def get_str_percentual_gc(self, obj):
        return locale.format_string('%.2f', obj.percentual_gc, True) if obj.percentual_gc is not None else '-'

    def get_status(self, obj):
        if obj.total_formas == 0:
            return {'text': '-', 'color': 'secondary'}
        elif obj.status == 'Finalizado':
            return {'text': 'Finalizado', 'color': 'success'}
        else:
            return {'text': 'Em Andamento', 'color': 'warning'}
        
class detailContratoServicos(serializers.ModelSerializer):
    str_contratante = serializers.CharField(source='contratante.razao_social', read_only=True)
    str_cpf = serializers.CharField(source='contratante.cpf_cnpj', read_only=True)
    etapas = serializers.SerializerMethodField(read_only=True)
    str_servicos = serializers.SerializerMethodField(read_only=True)
    str_produtos = serializers.SerializerMethodField(read_only=True)
    list_processos = serializers.SerializerMethodField(read_only=True)
    pdf_contrato = serializers.SerializerMethodField(read_only=True)
    def get_etapas(self, obj):
        etapas = Contratos_Pagamentos.objects.filter(contrato=obj.id)
        list_etapas = []
        for e in etapas:
            if e.etapa:
                cobrancas = Cobrancas_Pipefy.objects.filter(Q(contrato=obj.id) & Q(etapa_cobranca=e.get_etapa_display()))
                if len(cobrancas) > 0:
                    etapa_cobranca = cobrancas[0].etapa_cobranca
                    fase = cobrancas[0].phase_id
                else:
                    etapa_cobranca = None
                    fase = None
                list_etapas.append({
                    'id': e.id,
                    'valor': e.valor,
                    'percentual': e.percentual,
                    'etapa': e.get_etapa_display() if e.etapa else '-',
                    'aberta': 'Sim' if etapa_cobranca == e.get_etapa_display() else 'Não',
                    'color': 'success' if etapa_cobranca == e.get_etapa_display() else 'danger',
                    'status': 'Pago' if fase == 317532039 else '-' if fase == None else 'Em Aberto',
                    'color_status': 'success' if fase == 317532039 else 'secondary' if fase == None else 'warning'
                })
            else:
                list_etapas.append({
                    'id': e.id,
                    'valor': e.valor,
                    'percentual': e.percentual,
                    'etapa': '-',
                    'aberta': '-',
                    'color': '',
                    'status': '-',
                    'color_status': '-'
                })    
        return list_etapas 
    def get_str_servicos(self, obj):
        return ', '.join([c.detalhamento_servico for c in obj.servicos_contratados.all()])
    def get_str_produtos(self, obj):
        return ', '.join([s['produto__description'] for s in obj.servicos_contratados.all().values('produto__description').distinct()])
    def get_list_processos(self, obj):
        query_produtos = Card_Produtos.objects.filter(contrato=obj.id)
        produtos = [{
            'id': produto.id,
            'detalhamento': produto.detalhamento.detalhamento_servico,
            'phase': produto.phase_name,
            'card': produto.card,
            'url': produto.card_url,
            'beneficiarios': ', '.join([beneficiario.razao_social for beneficiario in produto.beneficiario.all()])
        }for produto in query_produtos]
        return produtos
    def get_pdf_contrato(self, obj):
        payload = {"query":"{card (id:" + str(obj.id) + ") {fields{field{id} native_value}}}"}
        response = requests.post(URL_PIFEFY_API, json=payload, headers={"Authorization": TOKEN_PIPEFY_API, "Content-Type": "application/json"})
        obj = json.loads(response.text)
        fields = obj["data"]["card"]["fields"]
        for field in fields:
            if field["field"]["id"] == "contrato_assinado":
                url_pdf_contrato = field["native_value"]
                break
            else:
                url_pdf_contrato = None
        return url_pdf_contrato
    class Meta:
        model = Contratos_Servicos
        fields = '__all__'

class serContratosPagamentos(serializers.ModelSerializer): 
    etapa_display = serializers.CharField(source='get_etapa_display', read_only=True)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['etapa', 'percentual', 'valor']:
                field.required = True
    def validate_percentual(self, value):
        percentual = value
        etapa_atual = self.initial_data.get('etapa')
        contrato = self.initial_data.get('contrato')
        if self.instance:
            etapa_anterior = self.instance.etapa
            if etapa_atual:
                total_percentual = Contratos_Pagamentos.objects.filter(contrato_id=int(contrato)).exclude(etapa=etapa_anterior
                    ).aggregate(total=Sum('percentual'))
            else:
                total_percentual = Contratos_Pagamentos.objects.filter(contrato_id=int(contrato)).exclude(etapa=etapa_atual
                    ).aggregate(total=Sum('percentual'))
        else:
            total_percentual = Contratos_Pagamentos.objects.filter(contrato_id=int(contrato)).aggregate(total=Sum('percentual'))
        if (total_percentual['total'] or 0) + percentual > 100.00:
            raise serializers.ValidationError('O total das parcelas ultrapassa 100% do contrato')
        return value
    class Meta:
        model = Contratos_Pagamentos
        fields = '__all__'