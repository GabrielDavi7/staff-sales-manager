"""Formulario para criar Cliente + ADMIN_CLIENTE em um unico passo."""
from django import forms
from django.contrib.admin.widgets import AdminDateWidget
from gestao.models import Cliente, Plano
from users.models import CustomUser


class ClienteCompletoForm(forms.Form):
    """Formulario que combina campos de Cliente e CustomUser (ADMIN_CLIENTE)."""

    # === Campos do Cliente ===
    nome = forms.CharField(max_length=150, label='Nome do Cliente')
    slug = forms.SlugField(max_length=150, label='Slug (URL)', required=False)
    plano = forms.ModelChoiceField(
        queryset=Plano.objects.filter(ativo=True),
        label='Plano',
    )
    email_contato = forms.EmailField(label='E-mail de Contato')
    telefone_contato = forms.CharField(
        max_length=20, required=False, label='Telefone',
    )
    dominio_personalizado = forms.CharField(
        max_length=255, required=False,
        label='Domínio Personalizado (opcional)',
    )

    # === Campos do ADMIN_CLIENTE ===
    admin_email = forms.EmailField(label='E-mail do Administrador')
    admin_first_name = forms.CharField(max_length=150, label='Nome')
    admin_last_name = forms.CharField(max_length=150, label='Sobrenome')
    admin_password = forms.CharField(
        widget=forms.PasswordInput, label='Senha',
        min_length=4,
    )

    def clean_slug(self):
        slug = self.cleaned_data.get('slug')
        if not slug:
            from django.utils.text import slugify
            slug = slugify(self.cleaned_data.get('nome', ''))
        if Cliente.objects.filter(slug=slug).exists():
            raise forms.ValidationError(f'Já existe um cliente com o slug "{slug}".')
        return slug

    def clean_admin_email(self):
        email = self.cleaned_data.get('admin_email')
        if CustomUser.objects.filter(email=email).exists():
            raise forms.ValidationError(f'Já existe um usuário com o e-mail "{email}".')
        return email

    def save(self):
        cliente = Cliente.objects.create(
            nome=self.cleaned_data['nome'],
            slug=self.cleaned_data['slug'],
            plano=self.cleaned_data['plano'],
            email_contato=self.cleaned_data['email_contato'],
            telefone_contato=self.cleaned_data.get('telefone_contato', ''),
            dominio_personalizado=self.cleaned_data.get('dominio_personalizado', '') or None,
            ativo=True,
        )

        admin_user = CustomUser.objects.create_user(
            email=self.cleaned_data['admin_email'],
            username=self.cleaned_data['slug'],
            first_name=self.cleaned_data['admin_first_name'],
            last_name=self.cleaned_data['admin_last_name'],
            password=self.cleaned_data['admin_password'],
            cargo='ADMIN_CLIENTE',
            cliente=cliente,
            is_staff=False,
            is_superuser=False,
        )

        cliente.dono = admin_user
        cliente.save(update_fields=['dono'])

        return cliente, admin_user
