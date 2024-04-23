from django.db import models
from django.conf import settings
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils.translation import gettext_lazy as _

class MyAppPermissions(models.Model):
    class Meta:
        managed = False 
        permissions = [
            ("ver_menu_operacional", "Ver Menu Operacional"),
            ("ver_menu_credito", "Ver Menu Crédito Rural"),
            ("ver_menu_ambiental", "Ver Menu Ambiental"),
        ]

class Allowed_Emails(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    email = models.CharField(max_length=150, null=True, unique=True, verbose_name='Email', error_messages={'unique': 'E-Mail já está autorizado!'})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        verbose_name_plural = 'Allowed Emails'
    def __str__(self):
        return self.email
    
from .managers import CustomUserManager
class User(AbstractBaseUser, PermissionsMixin):
    first_name = models.CharField(_("First Name"), max_length=100)
    last_name = models.CharField(_("Last Name"), max_length=100)
    email = models.EmailField(_("Email Address"), max_length=254, unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    date_joined =  models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = CustomUserManager()

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")

    def __str__(self):
        return self.email
    
    @property
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    pipefy_id = models.BigIntegerField(null=True, verbose_name='Id do Usuário no Pipefy')
    job_function = models.CharField(max_length=255, null=True, verbose_name='Cargo ou Função')
    cpf =  models.CharField(max_length=255, null=True, verbose_name='CPF')
    bio = models.TextField(default=None, null=True, verbose_name='Biografia')
    birthday = models.DateField(null=True, verbose_name='Data Nascimento')
    contato_celular =  models.CharField(max_length=255, null=True, verbose_name='Contato Celular')
    avatar = models.FileField(default='avatars/users/default-avatar.jpg', upload_to='avatars/users')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'User Profile'
    def __str__(self):
        return self.user.first_name

