from django.contrib import admin
from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import render, redirect
from django.urls import path
from django.contrib import messages
from .models import Plano, Cliente
from .forms import ClienteCompletoForm


@admin.register(Plano)
class PlanoAdmin(admin.ModelAdmin):
    list_display = ['nome', 'slug', 'preco_mensal', 'max_lojas', 'ativo']
    list_filter = ['ativo']
    search_fields = ['nome', 'slug']
    prepopulated_fields = {'slug': ('nome',)}


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ['nome', 'slug', 'plano', 'dono', 'email_contato', 'ativo', 'data_criacao']
    list_filter = ['ativo', 'plano']
    search_fields = ['nome', 'slug', 'email_contato']
    prepopulated_fields = {'slug': ('nome',)}

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'criar-completo/',
                self.admin_site.admin_view(self.criar_completo_view),
                name='gestao_cliente_criar_completo',
            ),
        ]
        return custom_urls + urls

    def criar_completo_view(self, request):
        if request.method == 'POST':
            form = ClienteCompletoForm(request.POST)
            if form.is_valid():
                cliente, admin_user = form.save()
                messages.success(
                    request,
                    f'Cliente "{cliente.nome}" e administrador '
                    f'"{admin_user.email}" criados com sucesso!'
                )
                return redirect('admin:gestao_cliente_changelist')
        else:
            form = ClienteCompletoForm()

        context = {
            **self.admin_site.each_context(request),
            'title': 'Criar Cliente + Administrador',
            'form': form,
            'opts': Cliente._meta,
        }
        return render(request, 'admin/gestao/cliente_completo.html', context)
