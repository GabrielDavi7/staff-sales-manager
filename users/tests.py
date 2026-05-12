from django.urls import reverse
from rest_framework.test import APITestCase, APIClient, APIRequestFactory, force_authenticate
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .permissions import IsAdmin, IsSupervisorOrAdmin, IsVendedor, IsDispositivo

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