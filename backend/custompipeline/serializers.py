from rest_framework import serializers
from .models import Card, Fase, Fluxo, Field, Relacao
from .models import Phases_History, Card_Comments, Card_Activities, Card_Anexos
from datetime import datetime

'''
ESTRUTURA JSON CARD:
    {attr_title:str}
ESTRUTURA JSON FIELD
    {main:Boolean, is_title:Boolean}
'''

def calcduration(first_in, last_in, last_to):
    if not last_to:
        last_to = datetime.now()
    if (first_in and last_to < first_in) or (last_in and last_to < last_in):
        last_to = datetime.now()
    result = last_to - first_in if first_in else  last_to - last_in or 0 if last_in else 0
    if first_in and last_in:
        result = last_to - first_in
    return int(result.total_seconds() if result != 0 else 0)

class serializerCard(serializers.ModelSerializer):
    fluxo_code = serializers.IntegerField(source='phase.fluxo.code', read_only=True)
    str_fase = serializers.CharField(source='phase.descricao', read_only=True)
    str_created_by = serializers.SerializerMethodField(read_only=True)
    fases_list = serializers.SerializerMethodField(read_only=True)
    list_responsaveis = serializers.SerializerMethodField(read_only=True)
    history_fases_list = serializers.SerializerMethodField(read_only=True)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            pass
        else:
            for field_name, field in self.fields.items():
                field.required = False
                field.allow_empty = True
    def get_fases_list(self, obj):
        fases_list = [{'id':f.id, 'name':f.descricao} for f in Fase.objects.filter(fluxo_id=obj.phase.fluxo_id)]
        return fases_list
    def get_str_created_by(self, obj):
        return obj.created_by.first_name+' '+obj.created_by.last_name
    def get_list_responsaveis(self, obj):
        responsaveis = obj.responsaveis.all()
        return [{'id':r.id, 'nome':r.first_name+' '+r.last_name, 'avatar':'media/'+r.profile.avatar.name} for r in responsaveis]
    def get_history_fases_list(self, obj):
        list = [
            {'id':f.id, 'last_time_in':f.last_time_in, 'last_time_out':f.last_time_out, 'first_time_in':f.first_time_in,
                'duration':calcduration(f.first_time_in, f.last_time_in, f.last_time_out), 
                'phase_name': f.phase.descricao  
            } 
            for f in Phases_History.objects.filter(fluxo_ambiental_id=obj.id)
        ]
        return list
    def validate_phase(self, value):
        fase_anterior = self.instance.phase if self.instance else None
        if self.instance and (value.id not in [d.id for d in fase_anterior.destinos_permitidos.all()]):
            raise serializers.ValidationError("Não é permitido mover para essa fase")
        return value
    def update(self, instance, validated_data):
        responsaveis_data = validated_data.pop('responsaveis', [])
        instance = super().update(instance, validated_data)
        if responsaveis_data:
            responsaveis_ids = [r.id for r in responsaveis_data]
            instance.responsaveis.set(responsaveis_ids)
        return instance
    class Meta:
        model = Card
        fields = '__all__'
        
class listCard(serializers.ModelSerializer):
    list_responsaveis = serializers.SerializerMethodField(read_only=True)
    str_fase = serializers.CharField(source='phase.descricao', read_only=True)
    def dados(self, obj):
        fields = Field.objects.filter(propriedades__main=True)
        dados_json = obj.dados if obj.dados else {}
        result = {}
        for field in fields:
            if field.tipo == 'CF':
                rels = Relacao.objects.filter(field=field, from_card=obj)
                data = []
                for rel in rels:
                    related_field = Field.objects.filter(fluxo=rel.to_table, propriedades__is_title=True).first()
                    if related_field and str(related_field.id) in rel.to_card.data:
                        data.append(rel.to_card.data[str(field.id)])  
                result[str(field.id)] = ', '.join(data)
            else:
                result[str(field.id)] = dados_json.get(str(field.id))
        return result
    def get_list_responsaveis(self, obj):
        responsaveis = obj.responsaveis.all()
        return [{'id':r.id, 'nome':r.first_name+' '+r.last_name, 'avatar':'media/'+r.profile.avatar.name} for r in responsaveis]
    class Meta:
        model = Card
        fields = ['id', 'uuid', 'code', 'created_at', 'data_vencimento', 'list_responsaveis', 'str_fase']


class serializerFase(serializers.ModelSerializer):
    card_set = listCard(many=True, read_only=True, required=False)
    class Meta:
        model = Fase
        fields = '__all__'

class listFase(serializers.ModelSerializer):
    list_destinos = serializers.SerializerMethodField(read_only=True, required=False)
    list_responsaveis = serializers.SerializerMethodField(read_only=True, required=False)
    def get_list_destinos(self, obj):
        destinos_permitidos = obj.destinos_permitidos.all() if len(obj.destinos_permitidos.all()) > 1 else Fase.objects.filter(fluxo=obj.fluxo_id)
        return [{'id':r.id, 'descricao':r.descricao} for r in destinos_permitidos]
    def get_list_responsaveis(self, obj):
        responsaveis = obj.responsaveis.all()
        return [{'value':r.id, 'label':r.first_name+' '+r.last_name} for r in responsaveis]
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.instance:
            for field_name, field in self.fields.items():
                if field_name in ['fluxo', 'responsaveis', 'descricao']:
                    field.required = True
        else:
            for field_name, field in self.fields.items():
                field.required = False
    class Meta:
        model = Fase
        fields = '__all__'

class serializerFluxo(serializers.ModelSerializer):
    fase_set = serializerFase(many=True, read_only=True, required=False)
    class Meta:
        model = Fluxo
        fields = '__all__'

class listFluxo(serializers.ModelSerializer):
    list_pessoas = serializers.SerializerMethodField(read_only=True)
    list_fases = serializers.SerializerMethodField(read_only=True)
    def get_list_fases(self, obj):
        fases = Fase.objects.filter(fluxo=obj)
        return [{'id':r.id, 'descricao':r.descricao, 'dias_prazo':r.dias_prazo,
            'responsaveis':[{'value':r.id, 'label':r.first_name+' '+r.last_name} for r in r.responsaveis.all()]
        } 
        for r in fases]
    def get_list_pessoas(self, obj):
        responsaveis = obj.pessoas.all()
        return [{'value':r.id, 'label':r.first_name+' '+r.last_name} for r in responsaveis]
    class Meta:
        model = Fluxo
        fields = '__all__'

class serializerComments(serializers.ModelSerializer):
    str_fase = serializers.CharField(source='phase.descricao', read_only=True)
    user = serializers.SerializerMethodField(read_only=True)
    def get_user(self, obj):
        return {'id':obj.created_by.id, 'name':obj.created_by.first_name+' '+obj.created_by.last_name, 'avatar':obj.created_by.profile.avatar.name}
    class Meta:
        model = Card_Comments
        fields = '__all__'

class serializerActivities(serializers.ModelSerializer):
    user = serializers.SerializerMethodField(read_only=True)
    def get_user(self, obj):
        if obj.updated_by:
            return {'id':obj.updated_by.id, 'name':obj.updated_by.first_name+' '+obj.updated_by.last_name}
        else:
            return {'id':'', 'name':'-'+' '+'-'}
    class Meta:
        model = Card_Activities
        fields = '__all__'

class serializerAnexos(serializers.ModelSerializer):
    user = serializers.SerializerMethodField(read_only=True)
    def get_user(self, obj):
        if obj.uploaded_by:
            return {'id':obj.uploaded_by.id, 'name':obj.uploaded_by.first_name+' '+obj.uploaded_by.last_name}
        else:
            return {'id':'', 'name':'-'+' '+'-'}
    def validate_file(self, value):
        if self.initial_data.get('pvtec'):
           pvtec = self.initial_data.get('pvtec')
           if not Card_Anexos.objects.filter(pvtec_id=pvtec, pvtec_response=False).exists():
               raise serializers.ValidationError("Insira pelo menos 1 anexo de solicitação!")
        return value
    class Meta:
        model = Card_Anexos
        fields = '__all__'

