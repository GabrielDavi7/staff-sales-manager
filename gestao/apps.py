from django.apps import AppConfig
from django import VERSION as DJANGO_VERSION


class GestaoConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gestao'
    verbose_name = 'Gestão de Clientes e Planos'

    def ready(self):
        # Remove this compatibility hook when Django 5.0 is retired.
        if DJANGO_VERSION[:2] == (5, 0):
            from unfold.templatetags import unfold
            from .unfold_compat import flatten_admin_context

            unfold._flatten_context = flatten_admin_context
