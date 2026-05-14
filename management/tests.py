from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase, APIClient

from core.models import Loja, Equipe, Metrica, Relatorio
from users.models import CustomUser

import pytest
from django.contrib.auth import get_user_model


class AdminUserCrudTests(APITestCase):
	def setUp(self):
		self.loja = Loja.objects.create(nome='Loja Centro', cidade='Sao Paulo')
		self.equipe = Equipe.objects.create(nome='Equipe A', loja=self.loja)

		self.admin = self._create_user(
			email='admin@example.com',
			username='admin',
			first_name='Admin',
			last_name='User',
			cargo='ADMIN',
			password='admin1234',
		)
		self.supervisor = self._create_user(
			email='supervisor@example.com',
			username='supervisor',
			first_name='Super',
			last_name='Visor',
			cargo='SUPERVISOR',
			password='super1234',
			loja=self.loja,
		)
		self.vendedor = self._create_user(
			email='vendedor@example.com',
			username='vendedor',
			first_name='Venda',
			last_name='Dor',
			cargo='VENDEDOR',
			password='vend1234',
			loja=self.loja,
			equipe=self.equipe,
			pin='1234',
		)
		self.dispositivo = self._create_user(
			email='device@example.com',
			username='device',
			first_name='Device',
			last_name='User',
			cargo='DISPOSITIVO',
			password='device1234',
			loja=self.loja,
		)

		self.admin_token = Token.objects.create(user=self.admin)
		self.supervisor_token = Token.objects.create(user=self.supervisor)
		self.vendedor_token = Token.objects.create(user=self.vendedor)
		self.dispositivo_token = Token.objects.create(user=self.dispositivo)

		self.base_url = '/api/admin/usuarios/'

	def _create_user(self, **kwargs):
		password = kwargs.pop('password', 'default123')
		user = CustomUser(**kwargs)
		user.set_password(password)
		user.save()
		return user

	def _auth_client(self, token):
		client = APIClient()
		client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
		return client

	def test_admin_can_create_vendedor_with_pin(self):
		client = self._auth_client(self.admin_token)
		payload = {
			'email': 'novo.vendedor@example.com',
			'username': 'novo_vendedor',
			'first_name': 'Novo',
			'last_name': 'Vendedor',
			'cargo': 'VENDEDOR',
			'password': 'senha1234',
			'pin': '5678',
			'loja': self.loja.id,
			'equipe': self.equipe.id,
		}

		response = client.post(self.base_url, payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)

	def test_admin_cannot_create_vendedor_without_pin(self):
		client = self._auth_client(self.admin_token)
		payload = {
			'email': 'sem.pin@example.com',
			'username': 'sem_pin',
			'first_name': 'Sem',
			'last_name': 'Pin',
			'cargo': 'VENDEDOR',
			'password': 'senha1234',
			'loja': self.loja.id,
		}

		response = client.post(self.base_url, payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn('pin', response.data)

	def test_admin_can_create_non_vendedor_without_pin(self):
		client = self._auth_client(self.admin_token)
		payload = {
			'email': 'novo.supervisor@example.com',
			'username': 'novo_supervisor',
			'first_name': 'Novo',
			'last_name': 'Supervisor',
			'cargo': 'SUPERVISOR',
			'password': 'senha1234',
			'loja': self.loja.id,
		}

		response = client.post(self.base_url, payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)

	def test_admin_can_list_users_with_is_active(self):
		client = self._auth_client(self.admin_token)
		response = client.get(self.base_url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn('results', response.data)
		self.assertTrue(any('is_active' in item for item in response.data['results']))
		self.assertTrue(any('pin' in item for item in response.data['results']))

	def test_admin_can_update_is_active_and_pin(self):
		client = self._auth_client(self.admin_token)
		url = f"{self.base_url}{self.vendedor.id}/"
		response = client.patch(url, {'is_active': False}, format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.vendedor.refresh_from_db()
		self.assertFalse(self.vendedor.is_active)

		response = client.patch(url, {'pin': '9999'}, format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.vendedor.refresh_from_db()
		self.assertEqual(self.vendedor.pin, '9999')

		response = client.patch(url, {'is_active': True}, format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.vendedor.refresh_from_db()
		self.assertTrue(self.vendedor.is_active)

	def test_delete_not_allowed(self):
		client = self._auth_client(self.admin_token)
		url = f"{self.base_url}{self.vendedor.id}/"
		response = client.delete(url)
		self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

	def test_non_admin_cannot_access_endpoints(self):
		for token in [self.supervisor_token, self.vendedor_token, self.dispositivo_token]:
			client = self._auth_client(token)
			response = client.get(self.base_url)
			self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_inactive_user_cannot_login(self):
		self.vendedor.is_active = False
		self.vendedor.save()

		response = self.client.post(
			'/api/users/login/',
			{'email': self.vendedor.email, 'password': 'vend1234'},
			format='json',
		)
		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

	def test_atendimentos_remain_after_user_deactivation(self):
		metrica = Metrica.objects.create(nome='Sem interesse', loja=self.loja)
		relatorio = Relatorio.objects.create(
			data_hora=timezone.now(),
			venda_fechada=False,
			metrica=metrica,
			vendedor=self.vendedor,
		)

		client = self._auth_client(self.admin_token)
		url = f"{self.base_url}{self.vendedor.id}/"
		response = client.patch(url, {'is_active': False}, format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)

		self.assertTrue(Relatorio.objects.filter(id=relatorio.id).exists())
		relatorio.refresh_from_db()
		self.assertEqual(relatorio.vendedor_id, self.vendedor.id)


User = get_user_model()

@pytest.fixture
def admin_user():
    return User.objects.create_user(
        username='admin',
        email='admin@example.com',
        password='admin123',
        cargo='ADMIN'
    )

@pytest.fixture
def supervisor_user():
    return User.objects.create_user(
        username='supervisor',
        email='sup@example.com',
        password='sup123',
        cargo='SUPERVISOR'
    )

@pytest.fixture
def vendedor_user():
    return User.objects.create_user(
        username='vendedor',
        email='vend@example.com',
        password='vend123',
        cargo='VENDEDOR'
    )

@pytest.fixture
def dispositivo_user():
    return User.objects.create_user(
        username='disp',
        email='disp@example.com',
        password='disp123',
        cargo='DISPOSITIVO'
    )

@pytest.fixture
def loja():
    return Loja.objects.create(nome='Loja Teste', cidade='Cidade Teste', ativo=True)

@pytest.fixture
def equipe(loja):
    return Equipe.objects.create(nome='Equipe Teste', loja=loja, ativo=True)

@pytest.fixture
def metrica(loja):
    return Metrica.objects.create(nome='Métrica Teste', descricao='Desc', loja=loja, ativo=True)

@pytest.fixture
def relatorio(vendedor_user, metrica, loja):
    # Necessário associar o vendedor a uma loja para testar vínculo de loja via atendimento
    vendedor_user.loja = loja
    vendedor_user.save()
    return Relatorio.objects.create(
        data_hora=timezone.now(),
        venda_fechada=False,
        vendedor=vendedor_user,
        metrica=metrica,
        cliente_nome='Cliente Teste'
    )

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
class TestManagementEndpoints:

    # -------------------- Testes de permissão --------------------
    def test_admin_can_list_lojas(self, api_client, admin_user, loja):
        api_client.force_authenticate(user=admin_user)
        response = api_client.get('/api/admin/lojas/')
        assert response.status_code == status.HTTP_200_OK
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        assert any(item['id'] == loja.id for item in results)
        assert results[0]['nome'] == loja.nome

    def test_non_admin_cannot_list_lojas(self, api_client, supervisor_user, vendedor_user, dispositivo_user):
        for user in [supervisor_user, vendedor_user, dispositivo_user]:
            api_client.force_authenticate(user=user)
            response = api_client.get('/api/admin/lojas/')
            assert response.status_code == status.HTTP_403_FORBIDDEN

    # CREATE
    def test_admin_can_create_loja(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        data = {'nome': 'Nova Loja', 'cidade': 'Nova Cidade', 'ativo': True}
        response = api_client.post('/api/admin/lojas/', data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Loja.objects.filter(nome='Nova Loja').exists()

    def test_non_admin_cannot_create_loja(self, api_client, supervisor_user):
        api_client.force_authenticate(user=supervisor_user)
        data = {'nome': 'Nova Loja 2', 'cidade': 'Outra'}
        response = api_client.post('/api/admin/lojas/', data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    # UPDATE (PUT/PATCH)
    def test_admin_can_update_loja(self, api_client, admin_user, loja):
        api_client.force_authenticate(user=admin_user)
        data = {'nome': 'Loja Atualizada', 'cidade': 'Cidade Atualizada', 'ativo': True}
        response = api_client.put(f'/api/admin/lojas/{loja.id}/', data)
        assert response.status_code == status.HTTP_200_OK
        loja.refresh_from_db()
        assert loja.nome == 'Loja Atualizada'

    def test_admin_can_partial_update_loja_soft_delete(self, api_client, admin_user, loja):
        api_client.force_authenticate(user=admin_user)
        response = api_client.patch(f'/api/admin/lojas/{loja.id}/', {'ativo': False})
        assert response.status_code == status.HTTP_200_OK
        loja.refresh_from_db()
        assert loja.ativo is False

    # DELETE condicional
    def test_admin_can_delete_loja_sem_vinculos(self, api_client, admin_user):
        loja = Loja.objects.create(nome='Só Loja', cidade='Sem vínculos', ativo=True)
        api_client.force_authenticate(user=admin_user)
        response = api_client.delete(f'/api/admin/lojas/{loja.id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Loja.objects.filter(id=loja.id).exists()

    def test_admin_cannot_delete_loja_com_usuarios_vinculados(self, api_client, admin_user, loja, vendedor_user):
        vendedor_user.loja = loja
        vendedor_user.save()
        api_client.force_authenticate(user=admin_user)
        response = api_client.delete(f'/api/admin/lojas/{loja.id}/')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'registros vinculados' in response.data['detail'].lower()
        assert Loja.objects.filter(id=loja.id).exists()  # ainda existe

    def test_admin_cannot_delete_loja_com_equipes_vinculadas(self, api_client, admin_user, loja, equipe):
        api_client.force_authenticate(user=admin_user)
        response = api_client.delete(f'/api/admin/lojas/{loja.id}/')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert Loja.objects.filter(id=loja.id).exists()

    def test_admin_cannot_delete_loja_com_metricas_vinculadas(self, api_client, admin_user, loja, metrica):
        api_client.force_authenticate(user=admin_user)
        response = api_client.delete(f'/api/admin/lojas/{loja.id}/')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert Loja.objects.filter(id=loja.id).exists()

    def test_admin_cannot_delete_loja_com_atendimentos_vinculados(self, api_client, admin_user, loja, relatorio):
        # relatório já associa vendedor->loja
        api_client.force_authenticate(user=admin_user)
        response = api_client.delete(f'/api/admin/lojas/{loja.id}/')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert Loja.objects.filter(id=loja.id).exists()

    # -------------------- Testes para Equipe --------------------
    def test_admin_can_create_equipe(self, api_client, admin_user, loja):
        api_client.force_authenticate(user=admin_user)
        data = {'nome': 'Equipe Nova', 'loja': loja.id, 'ativo': True}
        response = api_client.post('/api/admin/equipes/', data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Equipe.objects.filter(nome='Equipe Nova').exists()

    def test_admin_can_delete_equipe_sem_usuarios(self, api_client, admin_user, loja):
        equipe = Equipe.objects.create(nome='Equipe Solta', loja=loja)
        api_client.force_authenticate(user=admin_user)
        response = api_client.delete(f'/api/admin/equipes/{equipe.id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Equipe.objects.filter(id=equipe.id).exists()

    def test_admin_cannot_delete_equipe_com_usuarios(self, api_client, admin_user, equipe, vendedor_user):
        vendedor_user.equipe = equipe
        vendedor_user.save()
        api_client.force_authenticate(user=admin_user)
        response = api_client.delete(f'/api/admin/equipes/{equipe.id}/')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert Equipe.objects.filter(id=equipe.id).exists()

    def test_non_admin_cannot_manage_equipe(self, api_client, supervisor_user, loja):
        api_client.force_authenticate(user=supervisor_user)
        response = api_client.get('/api/admin/equipes/')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    # -------------------- Testes para Métrica --------------------
    def test_admin_can_create_metrica_global(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        data = {'nome': 'Métrica Global', 'descricao': 'Sem loja', 'loja': None, 'ativo': True}
        response = api_client.post('/api/admin/metricas/', data, format='json') #Alt
        assert response.status_code == status.HTTP_201_CREATED
        assert Metrica.objects.filter(nome='Métrica Global', loja__isnull=True).exists()

    def test_admin_can_create_metrica_especifica(self, api_client, admin_user, loja):
        api_client.force_authenticate(user=admin_user)
        data = {'nome': 'Métrica Local', 'loja': loja.id, 'ativo': True}
        response = api_client.post('/api/admin/metricas/', data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Metrica.objects.filter(nome='Métrica Local', loja=loja).exists()

    def test_admin_can_delete_metrica_sem_relatorios(self, api_client, admin_user, loja):
        metrica = Metrica.objects.create(nome='Métrica Teste', loja=loja)
        api_client.force_authenticate(user=admin_user)
        response = api_client.delete(f'/api/admin/metricas/{metrica.id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Metrica.objects.filter(id=metrica.id).exists()

    def test_admin_cannot_delete_metrica_com_relatorios(self, api_client, admin_user, relatorio):
        metrica = relatorio.metrica  # já associada a um relatório
        api_client.force_authenticate(user=admin_user)
        response = api_client.delete(f'/api/admin/metricas/{metrica.id}/')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert Metrica.objects.filter(id=metrica.id).exists()

    def test_non_admin_cannot_manage_metrica(self, api_client, vendedor_user):
        api_client.force_authenticate(user=vendedor_user)
        response = api_client.get('/api/admin/metricas/')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    # Teste extra: PATCH para ativar/desativar funciona
    def test_admin_can_toggle_loja_active(self, api_client, admin_user, loja):
        api_client.force_authenticate(user=admin_user)
        response = api_client.patch(f'/api/admin/lojas/{loja.id}/', {'ativo': False})
        assert response.status_code == 200
        loja.refresh_from_db()
        assert loja.ativo is False
        response = api_client.patch(f'/api/admin/lojas/{loja.id}/', {'ativo': True})
        assert response.status_code == 200
        loja.refresh_from_db()
        assert loja.ativo is True
