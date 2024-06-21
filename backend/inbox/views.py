# from django.shortcuts import render
# from django.db.models import Q
# from rest_framework import permissions, viewsets
# from .serializers import *
# from .models import *
# from datetime import datetime

# class NotificationView(viewsets.ModelViewSet):
#     queryset = Notifications_Messages.objects.all()
#     serializer_class = listNotifications
#     permission_classes = [permissions.AllowAny]
#     def get_queryset(self):
#         queryset = super().get_queryset()
#         destinatario = self.request.query_params.get('destinatario', None)
#         notread = self.request.query_params.get('notread', None)
#         deleted = self.request.query_params.get('deleted', None)
#         archived = self.request.query_params.get('archived', None)
#         if destinatario and notread:
#             queryset = queryset.filter(Q(recipient_id=destinatario) & Q(read=False))
#             Notifications_Messages.objects.filter(recipient_id=destinatario, read=False).update(       
#                 deleted = False,
#                 deleted_at = None,
#                 starred = False,
#                 starred_at = None,
#                 archived = True,
#                 archived_at = datetime.now(),
#                 read = True
#             )
#         if destinatario and archived:
#             queryset = queryset.filter(Q(recipient_id=destinatario) & Q(archived=True))
#         if destinatario and deleted:
#             queryset = queryset.filter(Q(recipient_id=destinatario) & Q(deleted=True))
#         else:
#             if self.action == 'list':
#                 queryset = queryset.order_by('-created_at')[:10]
#         return queryset