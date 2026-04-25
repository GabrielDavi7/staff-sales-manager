from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    CARGO_CHOICES = [
        ('ADMIN', 'Administrador'),
        ('SUPERVISOR', 'Supervisor'),
        ('VENDEDOR', 'Vendedor'),
        ('DISPOSITIVO', 'Dispositivo'),
    ]

    # O username aqui servirá como o "ID de Identificação" rápido no tablet
    username = models.CharField(max_length=50, unique=True) 
    email = models.EmailField(unique=True)
    cargo = models.CharField(max_length=15, choices=CARGO_CHOICES, default='VENDEDOR')
    loja = models.ForeignKey('core.Loja', on_delete=models.SET_NULL, null=True, blank=True)
    equipe = models.ForeignKey('core.Equipe', on_delete=models.SET_NULL, null=True, blank=True)

    USERNAME_FIELD = 'email' # O Login (e-mail/senha) continua sendo via e-mail
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.username} - {self.first_name}"