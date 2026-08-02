from django.db import models
from django.conf import settings


class Plano(models.Model):
    """Define os limites e preço de cada plano contratado."""
    nome = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    descricao = models.TextField(default='', blank=True)
    max_lojas = models.IntegerField(default=1)
    max_usuarios_total = models.IntegerField(default=5)
    max_admin_cliente = models.IntegerField(default=1)
    max_vendedores_por_loja = models.IntegerField(default=5)
    max_supervisores_por_loja = models.IntegerField(default=1)
    max_dispositivos_por_loja = models.IntegerField(default=2)
    max_equipes_por_loja = models.IntegerField(default=3)
    preco_mensal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    ativo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Plano'
        verbose_name_plural = 'Planos'
        ordering = ['preco_mensal']

    def __str__(self):
        return self.nome


class Cliente(models.Model):
    """
    Representa uma empresa/pessoa que contratou o sistema.
    Cada Cliente pertence a um Plano e pode ter múltiplas Lojas.
    """
    nome = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    plano = models.ForeignKey(
        Plano,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='clientes',
    )
    dono = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='clientes_geridos',
    )
    email_contato = models.EmailField()
    telefone_contato = models.CharField(max_length=20, default='', blank=True)
    dominio_personalizado = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True,
    )
    ativo = models.BooleanField(default=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_expiracao = models.DateTimeField(null=True, blank=True)
    observacoes = models.TextField(default='', blank=True)

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['nome']

    def __str__(self):
        return f'{self.nome} ({self.plano.nome})'
