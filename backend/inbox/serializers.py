from rest_framework import serializers
from .models import Notifications_Messages
from backend.settings import MEDIA_URL

class listNotifications(serializers.ModelSerializer):
    str_recipient = serializers.SerializerMethodField(read_only=True)
    def get_str_recipient(self, obj):
        return obj.recipient.first_name+' '+obj.recipient.last_name
    avatar = serializers.SerializerMethodField(read_only=True)
    def get_avatar(self, obj):
        path = MEDIA_URL+obj.recipient.profile.avatar.name
        return path
    class Meta:
        model = Notifications_Messages
        fields = ['id', 'subject', 'text', 'recipient', 'avatar', 'created_at', 'archived_at', 'deleted_at', 'str_recipient']

        