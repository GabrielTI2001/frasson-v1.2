from django.core.asgi import get_asgi_application
import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
import pipeline.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projectname.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack((
            URLRouter(
                pipeline.routing.websocket_urlpatterns
            )
        ))
    )
})