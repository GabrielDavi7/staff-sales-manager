"""Shared, fail-closed scope for the customer API. Staff is never a bypass."""
from django.db.models import Q, F
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

ROLES = ('ADMIN_CLIENTE', 'SUPERVISOR', 'VENDEDOR', 'DISPOSITIVO')


def tenant_allowed(user):
    if not user or not user.is_authenticated or not user.is_active:
        return False
    if user.cargo not in ROLES or not user.cliente_id:
        return False
    cliente = user.cliente
    if not cliente.ativo or (cliente.data_expiracao and cliente.data_expiracao <= timezone.now()):
        return False
    if user.cargo != 'ADMIN_CLIENTE' and not user.loja_id:
        return False
    if user.loja_id and (user.loja.cliente_id != cliente.pk or not user.loja.ativo):
        return False
    if user.equipe_id and (user.equipe.loja_id != user.loja_id or not user.equipe.ativo):
        return False
    return True


def require_tenant(user):
    if not tenant_allowed(user):
        raise PermissionDenied('Usuário sem vínculo válido com uma empresa ativa.')
    return user.cliente


def scoped(queryset, user, field='cliente_id'):
    if not tenant_allowed(user):
        return queryset.none()
    return queryset.filter(**{field: user.cliente_id})


def stores(user):
    from core.models import Loja
    qs = scoped(Loja.objects.all(), user)
    return qs if user.cargo == 'ADMIN_CLIENTE' else qs.filter(pk=user.loja_id)


def sellers(user):
    from users.models import CustomUser
    qs = scoped(CustomUser.objects.filter(cargo='VENDEDOR', is_active=True), user)
    qs = qs.filter(loja__in=stores(user).filter(ativo=True))
    return qs.filter(Q(equipe__isnull=True) | Q(equipe__loja_id=F('loja_id'), equipe__ativo=True))


def reports(user):
    from core.models import Relatorio
    qs = scoped(Relatorio.objects.all(), user)
    if user.cargo == 'ADMIN_CLIENTE':
        return qs
    if user.cargo == 'SUPERVISOR':
        return qs.filter(loja_id=user.loja_id)
    if user.cargo == 'VENDEDOR':
        return qs.filter(vendedor=user)
    return qs.none()
