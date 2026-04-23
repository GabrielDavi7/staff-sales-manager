from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class Loja(models.Model):
    nome = models.CharField(max_length=100)
    cidade = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.nome} - {self.cidade}"

class Equipe(models.Model):
    nome = models.CharField(max_length=100)
    loja = models.ForeignKey(Loja, on_delete=models.CASCADE, related_name='equipes')

    def __str__(self):
        return f"{self.nome} ({self.loja.nome})"

class CustomUser(AbstractUser):
    CARGO_CHOICES = [
        ('ADMIN', 'Administrador'),
        ('SUPERVISOR', 'Supervisor'),
        ('VENDEDOR', 'Vendedor'),
    ]

    # O username aqui servirá como o "ID de Identificação" rápido no tablet
    username = models.CharField(max_length=50, unique=True) 
    email = models.EmailField(unique=True)
    cargo = models.CharField(max_length=15, choices=CARGO_CHOICES, default='VENDEDOR')
    loja = models.ForeignKey('Loja', on_delete=models.SET_NULL, null=True, blank=True)
    equipe = models.ForeignKey('Equipe', on_delete=models.SET_NULL, null=True, blank=True)

    USERNAME_FIELD = 'email' # O Login (e-mail/senha) continua sendo via e-mail
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.username} - {self.first_name}"

class Metrica(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    loja = models.ForeignKey(Loja, on_delete=models.CASCADE, related_name='metricas', null=True, blank=True)

    def __str__(self):
        return self.nome

class Relatorio(models.Model):
    # Mudamos para permitir que o usuário escolha a hora, mas sugerimos a atual
    data_hora = models.DateTimeField(default=timezone.now) 
    venda_fechada = models.BooleanField(default=False)
    valor_venda = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    vendedor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='atendimentos')
    metrica = models.ForeignKey('Metrica', on_delete=models.PROTECT, related_name='registros', null=True, blank=True)

    def clean(self):
        # Regra: Se a venda foi fechada, o valor é obrigatório
        if self.venda_fechada and not self.valor_venda:
            raise ValidationError({
                'valor_venda': 'O valor da venda é obrigatório quando a venda é marcada como fechada.'
            })
        
        # Regra: Se a venda NÃO foi fechada, a métrica (motivo) é obrigatória
        if not self.venda_fechada and not self.metrica:
            raise ValidationError({
                'metrica': 'É necessário informar o motivo (métrica) para atendimentos não concretizados.'
            })

    def save(self, *args, **kwargs):
        self.full_clean() # Garante que o clean() seja chamado antes de salvar
        return super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Relatório de Atendimento"
        verbose_name_plural = "Relatórios de Atendimentos"