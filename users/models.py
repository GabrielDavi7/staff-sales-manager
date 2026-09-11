from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    CARGO_CHOICES = [
        ('ADMIN_CLIENTE', 'Administrador do Cliente'),
        ('SUPERVISOR', 'Supervisor'),
        ('VENDEDOR', 'Vendedor'),
        ('DISPOSITIVO', 'Dispositivo'),
    ]

    # O username aqui servirá como o "ID de Identificação" rápido no tablet
    username = models.CharField(max_length=50, unique=True) 
    email = models.EmailField(unique=True)
    cargo = models.CharField(max_length=15, choices=CARGO_CHOICES, default='VENDEDOR', blank=True)
    cliente = models.ForeignKey(
        'gestao.Cliente',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='usuarios',
    )
    loja = models.ForeignKey('core.Loja', on_delete=models.SET_NULL, null=True, blank=True)
    equipe = models.ForeignKey('core.Equipe', on_delete=models.SET_NULL, null=True, blank=True)
    pin = models.CharField(
        max_length=4,
        blank=True,
        null=True,
        verbose_name='PIN do Vendedor',
        help_text='PIN de 4 dígitos (obrigatório para vendedores)'
    )

    # PIN será obrigatorio apenas para Vendedores, por isso a decisão de deixar null e blank como True. A verificação será feita no Serializer do CRUD para cadastro de usuários
    
    USERNAME_FIELD = 'email' # O Login (e-mail/senha) continua sendo via e-mail
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.username} - {self.first_name}"

    def clean(self):
        super().clean()
        from django.core.exceptions import ValidationError
        if self.pk:
            previous = type(self).objects.filter(pk=self.pk).values('cliente_id').first()
            if previous and previous['cliente_id'] and previous['cliente_id'] != self.cliente_id:
                raise ValidationError({'cliente': 'Não é permitido transferir usuário entre empresas.'})
        if self.loja_id and self.loja.cliente_id != self.cliente_id:
            raise ValidationError({'loja': 'Loja não pertence à empresa do usuário.'})
        if self.equipe_id and self.equipe.loja_id != self.loja_id:
            raise ValidationError({'equipe': 'Equipe não pertence à loja do usuário.'})

    def save(self, *args, **kwargs):
        self.clean()
        return super().save(*args, **kwargs)
