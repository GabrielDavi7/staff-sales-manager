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

    def save(self, *args, **kwargs):
        if self.pk:
            old = type(self).objects.get(pk=self.pk)
            if old.cliente_id and old.cliente_id != self.cliente_id:
                raise ValidationError({'cliente': 'Não é permitido transferir loja entre empresas.'})
        return super().save(*args, **kwargs)

class Equipe(models.Model):
    nome = models.CharField(max_length=100)
    loja = models.ForeignKey(Loja, on_delete=models.CASCADE, related_name='equipes')
    ativo = models.BooleanField(default=True, verbose_name='Ativo')

    def __str__(self):
        return f"{self.nome} ({self.loja.nome})"

    def get_vendedores(self):
        return self.customuser_set.filter(cargo='VENDEDOR', is_active=True, loja_id=self.loja_id, cliente_id=self.loja.cliente_id)

    def save(self, *args, **kwargs):
        if self.pk and type(self).objects.get(pk=self.pk).loja_id != self.loja_id:
            raise ValidationError({'loja': 'Não é permitido transferir equipe entre lojas.'})
        return super().save(*args, **kwargs)


class Metrica(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    loja = models.ForeignKey(Loja, on_delete=models.CASCADE, related_name='metricas', null=True, blank=True)
    cliente = models.ForeignKey(
        'gestao.Cliente',
        on_delete=models.CASCADE,
        related_name='metricas',
        null=True,
        blank=True,
    )
    ativo = models.BooleanField(default=True, verbose_name='Ativo')

    def __str__(self):
        return self.nome

    def save(self, *args, **kwargs):
        if self.loja_id and self.loja.cliente_id != self.cliente_id:
            raise ValidationError({'loja': 'Loja não pertence à empresa da métrica.'})
        if self.pk:
            old = type(self).objects.get(pk=self.pk)
            if old.cliente_id and (old.cliente_id, old.loja_id) != (self.cliente_id, self.loja_id):
                raise ValidationError('Não é permitido transferir métrica entre empresas/lojas.')
        return super().save(*args, **kwargs)

class Relatorio(models.Model):
    cliente = models.ForeignKey('gestao.Cliente', on_delete=models.PROTECT, null=True, blank=True, related_name='atendimentos')
    loja = models.ForeignKey(Loja, on_delete=models.PROTECT, null=True, blank=True, related_name='atendimentos')
    # Mudamos para permitir que o usuário escolha a hora, mas sugerimos a atual
    data_hora = models.DateTimeField(default=timezone.now) 
    venda_fechada = models.BooleanField(default=False)
    valor_venda = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    vendedor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='atendimentos')
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
        if not self.pk:
            if not self.cliente_id:
                self.cliente_id = self.vendedor.cliente_id
            if not self.loja_id:
                self.loja_id = self.vendedor.loja_id
            if not self.cliente_id or not self.loja_id or self.loja.cliente_id != self.cliente_id or self.vendedor.cliente_id != self.cliente_id:
                raise ValidationError('Atendimento exige empresa e loja coerentes com o vendedor.')
        else:
            old = type(self).objects.get(pk=self.pk)
            if (old.cliente_id, old.loja_id, old.vendedor_id) != (self.cliente_id, self.loja_id, self.vendedor_id):
                raise ValidationError('Não é permitido transferir o histórico do atendimento.')
        if self.metrica_id and (self.metrica.cliente_id != self.cliente_id or self.metrica.loja_id not in (None, self.loja_id)):
            raise ValidationError({'metrica': 'Métrica não pertence à empresa/loja do atendimento.'})
        self.full_clean() # Garante que o clean() seja chamado antes de salvar
        return super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Relatório de Atendimento"
        verbose_name_plural = "Relatórios de Atendimentos"
