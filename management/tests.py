from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase, APIClient

from core.models import Loja, Equipe, Metrica, Relatorio
from users.models import CustomUser


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
