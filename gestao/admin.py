from django.contrib import admin
from .models import Plano, Cliente


@admin.register(Plano)
class PlanoAdmin(admin.ModelAdmin):
    list_display = ['nome', 'slug', 'preco_mensal', 'max_lojas', 'ativo']
    list_filter = ['ativo']
    search_fields = ['nome', 'slug']
    prepopulated_fields = {'slug': ('nome',)}


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ['nome', 'slug', 'plano', 'email_contato', 'ativo', 'data_criacao']
    list_filter = ['ativo', 'plano']
    search_fields = ['nome', 'slug', 'email_contato']
    prepopulated_fields = {'slug': ('nome',)}
