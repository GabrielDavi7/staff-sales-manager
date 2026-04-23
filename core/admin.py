from django.contrib import admin
from .models import Loja, Equipe, CustomUser, Metrica, Relatorio

admin.site.register(Loja)
admin.site.register(Equipe)
admin.site.register(CustomUser)
admin.site.register(Metrica)
admin.site.register(Relatorio)