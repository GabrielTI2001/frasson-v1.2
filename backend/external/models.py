from django.db import models

class MyAppPermissions(models.Model):
    class Meta:
        managed = False  # No database table creation or deletion operations will be performed for this model.
        permissions = [
            ("ver_menu_servicos", "Ver Menu Serviços"),
            ("ver_consulta_cnpj", "Ver Consulta CNPJ"),
            ("ver_outorgas_ana", "Ver Outorgas ANA"),
            ("ver_cotacoes", "Ver Cotações"),
        ]

