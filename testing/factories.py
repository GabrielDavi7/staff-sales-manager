"""Explicit customer fixtures for the original single-company tests."""
from gestao.models import Cliente
from core.models import Loja, Metrica
from users.models import CustomUser


def tenant():
    return Cliente.objects.get_or_create(slug='test-company', defaults={'nome': 'Test company', 'email_contato': 'company@example.com'})[0]


def create_store(**kwargs):
    kwargs.setdefault('cliente', tenant())
    kwargs.setdefault('cidade', 'Test city')
    return Loja.objects.create(**kwargs)


def create_metric(**kwargs):
    kwargs.setdefault('cliente', kwargs['loja'].cliente if kwargs.get('loja') else tenant())
    return Metrica.objects.create(**kwargs)


def create_user(**kwargs):
    kwargs.setdefault('cliente', kwargs['loja'].cliente if kwargs.get('loja') else tenant())
    if 'loja' not in kwargs and kwargs.get('cargo', 'VENDEDOR') != 'ADMIN_CLIENTE':
        kwargs['loja'] = Loja.objects.get_or_create(nome='Fixture store', cliente=kwargs['cliente'], defaults={'cidade': 'Test city'})[0]
    return CustomUser.objects.create_user(**kwargs)
