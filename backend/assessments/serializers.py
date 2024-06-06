from rest_framework import serializers
from .models import Category_Avaliacao, Questionario, Avaliacao_Colaboradores
from backend.frassonUtilities import Frasson
import locale

class serQuestionarios(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_type_display', read_only=True)
    str_category = serializers.CharField(source='category.description', read_only=True)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['type', 'category', 'text']:
                field.required = True
    class Meta:
        model = Questionario
        fields = '__all__'

class serCategory(serializers.ModelSerializer):
    class Meta:
        model = Category_Avaliacao
        fields = '__all__'

class serAssessment(serializers.ModelSerializer):
    list_colaboradores = serializers.SerializerMethodField(read_only=True)
    def get_list_colaboradores(self, obj):
        return [{
            'value': p.id,
            'label': p.first_name,
        } for p in obj.colaboradores.all()]
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name in ['data_ref', 'colaboradores', 'description']:
                field.required = True
    class Meta:
        model = Avaliacao_Colaboradores
        fields = '__all__'