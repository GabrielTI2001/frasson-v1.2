from django.db import models

class MyAppPermissions(models.Model):
    class Meta:
        managed = False  # No database table creation or deletion operations will be performed for this model.
        permissions = [
            ("ver_menu_operacional", "Ver Menu Operacional"),
            ("ver_menu_credito", "Ver Menu Crédito Rural"),
            ("ver_menu_ambiental", "Ver Menu Ambiental"),
        ]




