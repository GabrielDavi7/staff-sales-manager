from django.contrib import admin
from .models import Loja, Equipe, Metrica, Relatorio


@admin.register(Loja)
class LojaAdmin(admin.ModelAdmin):
    list_display = ['id', 'nome', 'cidade', 'cliente', 'ativo']
    list_filter = ['ativo', 'cliente']
    search_fields = ['nome', 'cidade']


@admin.register(Equipe)
class EquipeAdmin(admin.ModelAdmin):
    list_display = ['id', 'nome', 'loja', 'ativo']
    list_filter = ['ativo', 'loja']
    search_fields = ['nome']


@admin.register(Metrica)
class MetricaAdmin(admin.ModelAdmin):
    list_display = ['id', 'nome', 'cliente', 'loja', 'ativo']
    list_filter = ['ativo', 'cliente']
    search_fields = ['nome']


@admin.register(Relatorio)
class RelatorioAdmin(admin.ModelAdmin):
    list_display = ['id', 'data_hora', 'vendedor', 'venda_fechada', 'valor_venda', 'metrica']
    list_filter = ['venda_fechada', 'data_hora']
    search_fields = ['vendedor__username', 'cliente_nome']
    date_hierarchy = 'data_hora'