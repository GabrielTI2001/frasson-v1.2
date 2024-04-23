from rest_framework import serializers
from .models import Profile, User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer
from django.core.exceptions import ValidationError
from .models import Allowed_Emails

def email_in_allowed_list(email):
    return Allowed_Emails.objects.filter(email=email).exists()

class serializerProfile(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

User = get_user_model()
class CreateUserSerializer(UserCreateSerializer):
    def validate(self, value):
        if not email_in_allowed_list(value):
            raise serializers.ValidationError("Este e-mail não está autorizado")
        return value    
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'password']

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Adicione campos personalizados ao token, se necessário
        token['username'] = user.username
        token['id'] = user.id

        return token
    
class CustomUserCreateSerializer(UserCreateSerializer):
    def validate_email(self, email):
        if not email_in_allowed_list(email):
            raise ValidationError("Email não autorizado")
        return email

    class Meta(UserCreateSerializer.Meta):
        model = User  # Substitua pelo seu modelo de usuário personalizado

class ListUsers(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'is_active', 'last_login']

class serAllowed_Emails(serializers.ModelSerializer):
    class Meta:
        model = Allowed_Emails
        fields = '__all__'