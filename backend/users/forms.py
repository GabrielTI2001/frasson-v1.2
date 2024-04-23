from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from .models import User, Allowed_Emails
from django.core.exceptions import ValidationError

class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ["email", "first_name", "last_name"]
        error_class = "error"

class CustomUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = User
        fields = ["email", "first_name", "last_name"]
        error_class = "error"