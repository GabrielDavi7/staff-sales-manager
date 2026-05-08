from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser

# 1. Formulário customizado absoluto (substitui o UserCreationForm padrão)
class CustomUserCreationForm(forms.ModelForm):
    """
    Criamos nosso próprio formulário herdando de ModelForm.
    Isso evita que o Django esconda os campos e nos permite renderizar a Senha
    exatamente onde queremos na tela de criação.
    """
    password = forms.CharField(
        label='Senha', 
        widget=forms.PasswordInput,
        help_text='Senha para login completo no sistema web.'
    )

    class Meta:
        model = CustomUser
        # TUDO que queremos preencher na tela de criação precisa estar listado aqui (menos a senha, que já definimos acima)
        fields = ('email', 'username', 'first_name', 'last_name', 'cargo', 'loja', 'equipe', 'pin')

    def clean_password(self):
        # Valida se a senha atende aos requisitos de segurança do Django
        password = self.cleaned_data.get('password')
        validate_password(password)
        return password

    def save(self, commit=True):
        # Interceptamos o salvamento para aplicar o hash criptografado na senha
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        if commit:
            user.save()
        return user

# 2. Formulário customizado para a tela de EDIÇÃO
class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = '__all__'

# 3. O Admin atualizado
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    
    list_display = ['email', 'username', 'first_name', 'last_name', 'cargo', 'is_active']
    
    # Tela de Edição (quando o usuário já existe e você clica nele)
    fieldsets = UserAdmin.fieldsets + (
        ('Informações Adicionais', {'fields': ('cargo', 'loja', 'equipe', 'pin')}),
    )
    
    # Tela de Criação - Tudo na mesma tela com os campos definidos claramente!
    add_fieldsets = (
        ('Informações de Acesso', {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password'), # A Senha do sistema web
        }),
        ('Dados Pessoais', {
            'classes': ('wide',),
            'fields': ('first_name', 'last_name', 'cargo'),
        }),
        ('Vínculos e Permissões (Opcionais)', {
            'classes': ('wide',),
            'fields': ('loja', 'equipe', 'pin'), # O PIN rápido do Vendedor
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)