from django.urls import path
from . import views

urlpatterns = [

    # path('', views.index_webhoooks, name='index.webhooks'),
    # path('new', views.new_webhook, name='new.webhook'),
    # path('delete/<int:id>', views.delete_webhook, name='delete.webhook'),

    #PIPES
    path('pipefy/pipe/<int:id>/create_card', views.webhooks_pipe_create_card),
    path('pipefy/pipe/<int:id>/update_card', views.webhooks_pipe_update_card),
    path('pipefy/pipe/<int:id>/move_card', views.webhooks_pipe_move_card),
    path('pipefy/pipe/<int:id>/delete_card', views.webhooks_pipe_delete_card),

    #DATABASES
    path('pipefy/database/<int:id>/create_record', views.webhooks_database_create_record),
    path('pipefy/database/<int:id>/update_record', views.webhooks_database_update_record),
    path('pipefy/database/<int:id>/delete_record', views.webhooks_database_delete_record),

]