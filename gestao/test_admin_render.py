import pytest
from django.test import Client
from django.urls import reverse
from gestao.models import Cliente, Plano
from users.models import CustomUser


@pytest.mark.django_db
def test_client_add_form_renders_for_maintenance_user():
    user = CustomUser.objects.create_user(
        username='maintenance',
        email='maintenance@example.com',
        password='test-password',
        cargo='',
        is_staff=True,
        is_superuser=True,
    )
    client = Client()
    client.force_login(user)
    tenant = Cliente.objects.create(nome='Empresa', slug='empresa', email_contato='empresa@example.com')
    for name in (
        'gestao_cliente_add',
        'gestao_cliente_changelist',
        'gestao_cliente_change',
        'gestao_cliente_criar_completo',
        'gestao_plano_add',
        'users_customuser_add',
    ):
        args = [tenant.pk] if name == 'gestao_cliente_change' else []
        response = client.get(reverse(f'admin:{name}', args=args))
        assert response.status_code == 200, name
    assert 'email_contato' in client.get(reverse('admin:gestao_cliente_add')).content.decode()


@pytest.mark.django_db
def test_complete_customer_creation_preserves_admin_link_and_rejects_duplicate_username():
    maintenance = CustomUser.objects.create_superuser(
        username='maintenance', email='maintenance@example.com', password='test-password', cargo=''
    )
    plan = Plano.objects.create(nome='Teste', slug='teste')
    browser = Client()
    browser.force_login(maintenance)
    url = reverse('admin:gestao_cliente_criar_completo')
    form = {
        'nome': 'Empresa A', 'slug': 'empresa-a', 'plano': plan.pk,
        'email_contato': 'contato@example.com', 'admin_email': 'admin@example.com',
        'admin_first_name': 'Ana', 'admin_last_name': 'Silva',
        'admin_password': 'test-password',
    }
    assert browser.post(url, form).status_code == 302
    tenant = Cliente.objects.get(slug='empresa-a')
    assert tenant.dono.cliente_id == tenant.pk
    assert tenant.dono.cargo == 'ADMIN'
    assert tenant.dono.check_password('test-password')

    form.update(nome='Empresa B', slug='maintenance', admin_email='outro@example.com')
    response = browser.post(url, form)
    assert response.status_code == 200
    assert b'identificador' in response.content
    assert not Cliente.objects.filter(slug='maintenance').exists()
