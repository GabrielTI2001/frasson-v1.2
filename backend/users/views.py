from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Profile
from rest_framework import status
from djoser.views import UserViewSet
from djoser import utils
from djoser.conf import settings
from .models import Allowed_Emails
from django.views import View
from django.http import JsonResponse
from .models import User
from pipeline.models import Pipe
from .serializers import CustomUserCreateSerializer, serializerProfile, ListUsers, serAllowed_Emails
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from djoser.email import ActivationEmail
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import viewsets
from django.db.models import Q
from backend.settings import TOKEN_GOOGLE_MAPS_API

@method_decorator(csrf_exempt, name='dispatch')
class CreateUserView(View):
    @csrf_exempt
    def post(self, request):
        data = json.loads(request.body)
        serializer = CustomUserCreateSerializer(data=data)
        if serializer.is_valid():
            user = User.objects.create_user(**serializer.validated_data)
            activation_email = ActivationEmail(context={'user':user})
            activation_email.send(to=[user.email])
            return JsonResponse({"message": "Usuário criado com sucesso."}, status=status.HTTP_201_CREATED)
        else:
            return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    # permission_classes = [IsAuthenticated]
    serializer_class = serializerProfile
    def get(self, request):
        user = request.user
        if user:
            try:
                profile = Profile.objects.get(user=user)
                # Aqui você pode ajustar os campos que deseja retornar no perfil
                profile_data = {
                    'user_id': profile.user.id,
                    'first_name': profile.user.first_name,
                    'avatar': 'media/'+profile.avatar.name
                    # Adicione outros campos do perfil conforme necessário
                }
                return Response(profile_data)
            except Profile.DoesNotExist:
                return Response({'error': 'Perfil não encontrado'}, status=404)
        else:
            return Response({'error': 'Usuário não autenticado'}, status=401)

class CustomUserViewSet(UserViewSet):
    def perform_create(self, serializer):
        email = serializer.validated_data.get('email')
        if not Allowed_Emails.objects.filter(email=email).exists():
            return Response({"error": "Este e-mail não está autorizado"}, status=status.HTTP_400_BAD_REQUEST)
        super().perform_create(serializer)

class CustomTokenCreateView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            if 'email' in request.data:
                email = request.data['email']
                try:
                    user = User.objects.get(email=email)
                    utils.login_user(self.request, user)
                    user_permissions = user.user_permissions.values_list('codename', flat=True)
                    group_permissions = user.groups.values_list('permissions__codename', flat=True)
                    permissions = list(set(user_permissions) | set(group_permissions))
                    user_data = {
                        'id': user.id,
                        'email': user.email,
                        'is_superuser': user.is_superuser,
                        'permissions': permissions
                    }
                    response.data['user'] = user_data
                except User.DoesNotExist:
                    pass
        return response

def get_api_maps(request):
    if request.method == 'GET':
        return JsonResponse({'token': TOKEN_GOOGLE_MAPS_API})
    
class ListUserView(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = ListUsers
    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get('search', None)
        pipe_term = self.request.query_params.get('pipe', None)
        if search_term:
            queryset = queryset.filter(Q(first_name__icontains=search_term) | Q(last_name__icontains=search_term))
        if pipe_term:
            queryset = Pipe.objects.get(code=int(pipe_term)).pessoas.all()
        return queryset

class AllowedEmailsView(viewsets.ModelViewSet):
    queryset = Allowed_Emails.objects.all()
    serializer_class = serAllowed_Emails
    lookup_field = 'id'