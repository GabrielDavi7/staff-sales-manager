from django.urls import reverse
from rest_framework.test import APITestCase, APIClient, APIRequestFactory, force_authenticate
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .permissions import IsAdmin, IsSupervisorOrAdmin, IsVendedor, IsDispositivo
from core.models import Loja

User = get_user_model()


# ---------- Views dummy para testar as classes de permissão ----------
class DummyAdminView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request):
        return Response({'status': 'ok'})

class DummySupervisorOrAdminView(APIView):
    permission_classes = [IsSupervisorOrAdmin]
    def get(self, request):
        return Response({'status': 'ok'})

class DummyVendedorView(APIView):
    permission_classes = [IsVendedor]
    def get(self, request):
        return Response({'status': 'ok'})

class DummyDispositivoView(APIView):
    permission_classes = [IsDispositivo]
    def get(self, request):
        return Response({'status': 'ok'})


class UserMeViewTests(APITestCase):
    """Testes para o endpoint /api/users/user/me/"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='vendedor1',
            email='vendedor@exemplo.com',  # email obrigatório
            password='testpass123',
            first_name='João',
            last_name='Silva',
            cargo='VENDEDOR'
        )
        self.token = Token.objects.create(user=self.user)
        self.url = reverse('user-me')

    def test_me_com_token_valido(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.user.id)
        self.assertEqual(response.data['username'], 'vendedor1')
        self.assertEqual(response.data['email'], 'vendedor@exemplo.com')
        self.assertEqual(response.data['first_name'], 'João')
        self.assertEqual(response.data['last_name'], 'Silva')
        self.assertEqual(response.data['cargo'], 'VENDEDOR')
        self.assertNotIn('pin', response.data)
        self.assertNotIn('password', response.data)

    def test_me_sem_token(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_com_token_invalido(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token token_invalido123')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserMeUpdateTests(APITestCase):
    """Testes de atualizacao do endpoint /api/users/user/me/"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='vendedor1',
            email='vendedor@exemplo.com',
            password='testpass123',
            first_name='Joao',
            last_name='Silva',
            cargo='VENDEDOR',
            pin='1234',
        )
        self.token = Token.objects.create(user=self.user)
        self.url = reverse('user-me')

    def _auth(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_put_atualiza_dados_basicos(self):
        self._auth()
        payload = {
            'first_name': 'Maria',
            'last_name': 'Souza',
            'email': 'maria@exemplo.com',
            'pin': '4321',
        }
        response = self.client.put(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Maria')
        self.assertEqual(self.user.last_name, 'Souza')
        self.assertEqual(self.user.email, 'maria@exemplo.com')
        self.assertEqual(self.user.pin, '4321')

    def test_patch_atualiza_parcial(self):
        self._auth()
        payload = {'last_name': 'Lima'}
        response = self.client.patch(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.last_name, 'Lima')

    def test_vendedor_pin_invalido(self):
        self._auth()
        payload = {'pin': '12'}
        response = self.client.patch(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_nao_vendedor_tenta_atualizar_pin(self):
        supervisor = User.objects.create_user(
            username='super',
            email='super@exemplo.com',
            password='testpass123',
            cargo='SUPERVISOR',
        )
        token = Token.objects.create(user=supervisor)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        payload = {'pin': '1234'}
        response = self.client.patch(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_alterar_senha_com_sucesso(self):
        self._auth()
        payload = {
            'current_password': 'testpass123',
            'new_password': 'newpass456',
        }
        response = self.client.patch(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpass456'))

    def test_alterar_senha_com_senha_atual_incorreta(self):
        self._auth()
        payload = {
            'current_password': 'senha_errada',
            'new_password': 'newpass456',
        }
        response = self.client.patch(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_campos_restritos_ignorados(self):
        self._auth()
        payload = {
            'cargo': 'ADMIN',
            'username': 'novo',
            'is_active': False,
            'first_name': 'Pedro',
        }
        response = self.client.patch(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.cargo, 'VENDEDOR')
        self.assertEqual(self.user.username, 'vendedor1')
        self.assertTrue(self.user.is_active)
        self.assertEqual(self.user.first_name, 'Pedro')

    def test_email_unico(self):
        self._auth()
        User.objects.create_user(
            username='outro',
            email='outro@exemplo.com',
            password='testpass123',
        )
        payload = {'email': 'outro@exemplo.com'}
        response = self.client.patch(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_atualizacao_sem_autenticacao(self):
        response = self.client.patch(self.url, {'first_name': 'Ana'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PermissionsTests(APITestCase):
    """Testes unitários para cada classe de permissão usando views dummy"""
    
    def setUp(self):
        self.factory = APIRequestFactory()
        
        # Cria usuários de cada cargo com emails distintos
        self.admin = User.objects.create_user(
            username='admin', email='admin@example.com', password='pass', cargo='ADMIN'
        )
        self.supervisor = User.objects.create_user(
            username='super', email='super@example.com', password='pass', cargo='SUPERVISOR'
        )
        self.vendedor = User.objects.create_user(
            username='vendedor', email='vendedor@example.com', password='pass', cargo='VENDEDOR'
        )
        self.dispositivo = User.objects.create_user(
            username='disp', email='disp@example.com', password='pass', cargo='DISPOSITIVO'
        )
    
    def _test_permission(self, view_class, user, expected_status):
        """Helper: testa se a view permite ou nega acesso ao usuário"""
        request = self.factory.get('/dummy/')
        force_authenticate(request, user=user)
        view = view_class()
        response = view.dispatch(request)
        self.assertEqual(response.status_code, expected_status)
    
    def test_is_admin(self):
        self._test_permission(DummyAdminView, self.admin, status.HTTP_200_OK)
        self._test_permission(DummyAdminView, self.supervisor, status.HTTP_403_FORBIDDEN)
        self._test_permission(DummyAdminView, self.vendedor, status.HTTP_403_FORBIDDEN)
        self._test_permission(DummyAdminView, self.dispositivo, status.HTTP_403_FORBIDDEN)
        # Usuário anônimo (não autenticado)
        request = self.factory.get('/dummy/')
        view = DummyAdminView()
        response = view.dispatch(request)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_is_supervisor_or_admin(self):
        self._test_permission(DummySupervisorOrAdminView, self.admin, status.HTTP_200_OK)
        self._test_permission(DummySupervisorOrAdminView, self.supervisor, status.HTTP_200_OK)
        self._test_permission(DummySupervisorOrAdminView, self.vendedor, status.HTTP_403_FORBIDDEN)
        self._test_permission(DummySupervisorOrAdminView, self.dispositivo, status.HTTP_403_FORBIDDEN)
    
    def test_is_vendedor(self):
        self._test_permission(DummyVendedorView, self.vendedor, status.HTTP_200_OK)
        self._test_permission(DummyVendedorView, self.admin, status.HTTP_403_FORBIDDEN)
        self._test_permission(DummyVendedorView, self.supervisor, status.HTTP_403_FORBIDDEN)
        self._test_permission(DummyVendedorView, self.dispositivo, status.HTTP_403_FORBIDDEN)
    
    def test_is_dispositivo(self):
        self._test_permission(DummyDispositivoView, self.dispositivo, status.HTTP_200_OK)
        self._test_permission(DummyDispositivoView, self.admin, status.HTTP_403_FORBIDDEN)
        self._test_permission(DummyDispositivoView, self.supervisor, status.HTTP_403_FORBIDDEN)
        self._test_permission(DummyDispositivoView, self.vendedor, status.HTTP_403_FORBIDDEN)


class VendedorListViewTests(APITestCase):
    """Testes para o endpoint de listagem de vendedores (/api/users/vendedores/)"""
    
    def setUp(self):
        self.loja1 = Loja.objects.create(nome="Loja 1")
        self.loja2 = Loja.objects.create(nome="Loja 2")
        
        self.admin = User.objects.create_user(
            username='admin_list', email='adminlist@ex.com', password='pass', cargo='ADMIN'
        )
        self.dispositivo_loja1 = User.objects.create_user(
            username='disp_list1', email='displist1@ex.com', password='pass', cargo='DISPOSITIVO', loja=self.loja1
        )
        self.dispositivo_sem_loja = User.objects.create_user(
            username='disp_sem_loja', email='dispsemloja@ex.com', password='pass', cargo='DISPOSITIVO'
        )
        
        # Vendedores Loja 1
        self.vendedor_ativo_l1 = User.objects.create_user(
            username='vend_ativo1', email='va1@ex.com', password='pass', cargo='VENDEDOR', loja=self.loja1, first_name='Ativo', is_active=True
        )
        self.vendedor_inativo_l1 = User.objects.create_user(
            username='vend_inativo1', email='vi1@ex.com', password='pass', cargo='VENDEDOR', loja=self.loja1, first_name='Inativo', is_active=False
        )
        
        # Vendedores Loja 2
        self.vendedor_ativo_l2 = User.objects.create_user(
            username='vend_ativo2', email='va2@ex.com', password='pass', cargo='VENDEDOR', loja=self.loja2, first_name='Ativo2', is_active=True
        )
        
        self.url = reverse('vendedor-list')
        self.client = APIClient()

    def test_acesso_nao_autenticado(self):
        """Deve retornar 401 para usuários não autenticados"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_dispositivo_loja1_ve_apenas_ativos_da_loja1(self):
        """Dispositivo da Loja 1 deve ver apenas vendedores ativos da sua própria loja"""
        self.client.force_authenticate(user=self.dispositivo_loja1)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.vendedor_ativo_l1.id)

    def test_admin_ve_todos_ativos(self):
        """Admin sem loja deve conseguir ver todos os vendedores ativos do sistema"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertEqual(len(results), 2)
        
        ids = [v['id'] for v in results]
        self.assertIn(self.vendedor_ativo_l1.id, ids)
        self.assertIn(self.vendedor_ativo_l2.id, ids)
        self.assertNotIn(self.vendedor_inativo_l1.id, ids)

    def test_dispositivo_sem_loja_retorna_vazio(self):
        """Se um usuário não-admin estiver sem loja vinculada, não deve ver nenhum vendedor"""
        self.client.force_authenticate(user=self.dispositivo_sem_loja)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertEqual(len(results), 0)