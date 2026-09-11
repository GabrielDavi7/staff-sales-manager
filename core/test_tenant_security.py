from datetime import timedelta
from decimal import Decimal
import pytest
from django.utils import timezone
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from gestao.models import Cliente
from core.models import Loja, Equipe, Metrica, Relatorio
from users.models import CustomUser

pytestmark = pytest.mark.django_db


@pytest.fixture
def world():
    result = {}
    for name in ('a', 'b'):
        tenant = Cliente.objects.create(nome=name, slug=name, email_contato=f'{name}@example.com')
        store = Loja.objects.create(nome=name, cidade=name, cliente=tenant)
        team = Equipe.objects.create(nome=name, loja=store)
        metric = Metrica.objects.create(nome=name, cliente=tenant, loja=store)
        users = {}
        for role in ('ADMIN_CLIENTE', 'SUPERVISOR', 'VENDEDOR', 'DISPOSITIVO'):
            users[role] = CustomUser.objects.create_user(username=f'{name}-{role}', email=f'{name}-{role}@example.com', password='test-pass', cargo=role, cliente=tenant, loja=store, equipe=team, pin='1234' if role == 'VENDEDOR' else None)
        report = Relatorio.objects.create(vendedor=users['VENDEDOR'], venda_fechada=True, valor_venda=100)
        result[name] = dict(tenant=tenant, store=store, team=team, metric=metric, users=users, report=report)
    return result


def client_for(user):
    api = APIClient()
    token, _ = Token.objects.get_or_create(user=user)
    api.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
    return api


@pytest.mark.parametrize('role', ['ADMIN_CLIENTE', 'SUPERVISOR', 'VENDEDOR', 'DISPOSITIVO'])
@pytest.mark.parametrize('method', ['get', 'patch', 'put', 'delete'])
def test_foreign_reports_never_accessible(world, role, method):
    api = client_for(world['a']['users'][role])
    r = world['b']['report']
    response = getattr(api, method)(f'/api/core/atendimentos/{r.pk}/', {'venda_fechada': True, 'valor_venda': '999'}, format='json')
    assert response.status_code == 404
    r.refresh_from_db()
    assert r.valor_venda == Decimal('100')


@pytest.mark.parametrize('resource,key', [('usuarios','users'), ('lojas','store'), ('equipes','team'), ('metricas','metric')])
@pytest.mark.parametrize('method', ['get','patch','put'])
def test_foreign_management_objects(world, resource, key, method):
    target = world['b'][key]
    if key == 'users': target = target['VENDEDOR']
    api = client_for(world['a']['users']['ADMIN_CLIENTE'])
    assert getattr(api, method)(f'/api/admin/{resource}/{target.pk}/', {}, format='json').status_code == 404


@pytest.mark.parametrize('role', ['ADMIN_CLIENTE','SUPERVISOR','VENDEDOR','DISPOSITIVO'])
@pytest.mark.parametrize('path', ['loja/', 'exportar-csv/', 'exportar-xlsx/'])
def test_foreign_analytics(world, role, path):
    api = client_for(world['a']['users'][role])
    today = str(timezone.localdate())
    response = api.get('/api/analytics/'+path, {'loja_id': world['b']['store'].pk, 'data_inicio':today, 'data_fim':today})
    assert response.status_code in (403,404)


@pytest.mark.parametrize('role', ['ADMIN', 'ADMIN_CLIENTE', ''])
def test_no_role_promotion(world, role):
    a = world['a']
    api = client_for(a['users']['ADMIN_CLIENTE'])
    seller = a['users']['VENDEDOR']
    assert api.patch(f'/api/admin/usuarios/{seller.pk}/', {'cargo': role}, format='json').status_code == 400
    seller.refresh_from_db()
    assert seller.cargo == 'VENDEDOR'


def test_reject_global_creation_and_protected_flags(world):
    a = world['a']; api = client_for(a['users']['ADMIN_CLIENTE'])
    assert api.post('/api/admin/usuarios/', dict(username='bad', email='bad@example.com', password='pass', cargo='ADMIN', loja=a['store'].pk), format='json').status_code == 400
    for field in ('is_staff','is_superuser','cliente'):
        assert api.patch(f"/api/admin/usuarios/{a['users']['VENDEDOR'].pk}/", {field: world['b']['tenant'].pk if field=='cliente' else True}, format='json').status_code == 400


@pytest.mark.parametrize('resource,payload', [('equipes', 'store'), ('metricas','store'), ('usuarios','store')])
def test_foreign_relations_rejected(world, resource, payload):
    api = client_for(world['a']['users']['ADMIN_CLIENTE'])
    data = {'nome':'Bad', 'loja':world['b'][payload].pk, 'username':'bad','email':'bad@example.com','password':'test','cargo':'VENDEDOR','pin':'1234'}
    assert api.post(f'/api/admin/{resource}/', data, format='json').status_code == 400


def test_reports_creation_and_partial_update(world):
    a,b=world['a'],world['b']; api=client_for(a['users']['VENDEDOR'])
    assert api.post('/api/core/atendimentos/', {'venda_fechada':False, 'metrica':b['metric'].pk}, format='json').status_code == 400
    url=f"/api/core/atendimentos/{a['report'].pk}/"
    assert api.patch(url, {'vendedor':b['users']['VENDEDOR'].pk},format='json').status_code == 400
    assert api.patch(url, {'observacoes':'updated'},format='json').status_code == 200
    assert api.post('/api/core/atendimentos/', {'venda_fechada':False,'metrica':a['metric'].pk},format='json').status_code == 201


@pytest.mark.parametrize('invalid', ['absent','inactive','expired','legacy_global'])
def test_invalid_tenant_login_and_existing_token(world, invalid):
    user=world['a']['users']['ADMIN_CLIENTE']; tenant=world['a']['tenant']
    api=client_for(user)
    if invalid=='absent': CustomUser.objects.filter(pk=user.pk).update(cliente=None,loja=None,equipe=None)
    elif invalid=='legacy_global': CustomUser.objects.filter(pk=user.pk).update(cargo='ADMIN')
    elif invalid=='inactive': Cliente.objects.filter(pk=tenant.pk).update(ativo=False)
    else: Cliente.objects.filter(pk=tenant.pk).update(data_expiracao=timezone.now()-timedelta(days=1))
    assert api.get('/api/admin/usuarios/').status_code == 403
    api.credentials()
    assert api.post('/api/users/login/',{'username':user.email,'password':'test-pass'}).status_code == 403


def test_history_stays_with_original_store(world):
    a=world['a']; user=a['users']['VENDEDOR']; report=a['report']
    other=Loja.objects.create(nome='New',cidade='New',cliente=a['tenant'])
    user.loja=other; user.equipe=None; user.save()
    report.refresh_from_db()
    assert report.loja_id==a['store'].pk
    user.cliente=world['b']['tenant']; user.loja=world['b']['store']
    with pytest.raises(ValidationError): user.save()


def test_customer_staff_cannot_enter_maintenance(world):
    user=world['a']['users']['ADMIN_CLIENTE']
    user.is_staff=True;user.is_superuser=True;user.save()
    api=APIClient();api.force_login(user)
    assert api.get('/admin/').status_code==302


def test_list_scopes_and_legitimate_export(world):
    a=world['a'];api=client_for(a['users']['ADMIN_CLIENTE'])
    for path, key in [('lojas','store'),('metricas','metric'),('atendimentos','report')]:
        response=api.get(f'/api/core/{path}/')
        assert response.status_code==200
        assert [r['id'] for r in response.data['results']]==[a[key].pk]
    today=str(timezone.localdate())
    response=api.get('/api/analytics/exportar-csv/',{'loja_id':a['store'].pk,'data_inicio':today,'data_fim':today})
    assert response.status_code==200


def test_login_ignores_old_invalid_token(world):
    user = world['a']['users']['ADMIN_CLIENTE']
    api = APIClient()
    api.credentials(HTTP_AUTHORIZATION='Token obsolete-token')
    assert api.post('/api/users/login/', {'username':user.email,'password':'test-pass'}).status_code == 200


def test_seed_cannot_delete_existing_tenants(world):
    from django.core.management import call_command, CommandError
    count = Relatorio.objects.count()
    with pytest.raises(CommandError):
        call_command('seed_demo')
    assert Relatorio.objects.count() == count


def test_seed_creates_only_customer_identities():
    from django.core.management import call_command
    from io import StringIO
    call_command('seed_demo', stdout=StringIO())
    assert not CustomUser.objects.filter(cargo='ADMIN').exists()
    assert not CustomUser.objects.filter(is_superuser=True).exists()
    assert not CustomUser.objects.filter(cliente__isnull=True).exists()
    assert not Relatorio.objects.filter(cliente__isnull=True).exists()
