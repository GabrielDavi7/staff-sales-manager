from django.db import models
from django.utils import timezone
from django.conf import settings
from django.core.exceptions import ValidationError

class Loja(models.Model):
    nome = models.CharField(max_length=100)
    cidade = models.CharField(max_length=100)
    ativo = models.BooleanField(default=True, verbose_name='Ativo')
    cliente = models.ForeignKey(
        'gestao.Cliente',
        on_delete=models.CASCADE,
        related_name='lojas',
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"{self.nome} - {self.cidade}"

class Equipe(models.Model):
    nome = models.CharField(max_length=100)
    loja = models.ForeignKey(Loja, on_delete=models.CASCADE, related_name='equipes')
    ativo = models.BooleanField(default=True, verbose_name='Ativo')

    def __str__(self):
        return f"{self.nome} ({self.loja.nome})"

    def get_vendedores(self):
        return self.customuser_set.filter(cargo='VENDEDOR', is_active=True)


class Metrica(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    loja = models.ForeignKey(Loja, on_delete=models.CASCADE, related_name='metricas', null=True, blank=True)
    ativo = models.BooleanField(default=True, verbose_name='Ativo')

    def __str__(self):
        return self.nome

class Relatorio(models.Model):
    # Mudamos para permitir que o usuário escolha a hora, mas sugerimos a atual
    data_hora = models.DateTimeField(default=timezone.now) 
    venda_fechada = models.BooleanField(default=False)
    valor_venda = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    vendedor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='atendimentos')
    metrica = models.ForeignKey('Metrica', on_delete=models.PROTECT, related_name='registros', null=True, blank=True)
    cliente_nome = models.CharField(max_length=255, blank=True, null=True)
    observacoes = models.TextField(blank=True, null=True)

    def clean(self):
        # Regra: Se a venda foi fechada, o valor é obrigatório
        if self.venda_fechada:
            if not self.valor_venda:
                raise ValidationError({
                    'valor_venda': 'O valor da venda é obrigatório quando a venda é marcada como fechada.'
                })
            elif self.valor_venda < 0:
                raise ValidationError({
                    'valor_venda': 'O valor da venda não pode ser negativo.'
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