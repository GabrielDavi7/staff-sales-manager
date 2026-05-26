from django.urls import reverse
from rest_framework.test import APITestCase, APIClient, APIRequestFactory, force_authenticate
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .permissions import IsAdmin, IsSupervisorOrAdmin, IsVendedor, IsDispositivo

import pytest
from users.models import CustomUser
from core.models import Loja, Equipe  # se necessário para criar usuário completo

from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

from datetime import timedelta
from django.utils import timezone

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


@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user(db):
    # Cria um usuário genérico (pode ser vendedor, admin, etc.)
    return CustomUser.objects.create_user(
        email='teste@example.com',
        username='testeuser',
        first_name='Teste',
        last_name='Silva',
        password='senha123',
        cargo='VENDEDOR'
    )

@pytest.fixture
def auth_token(user):
    token, _ = Token.objects.get_or_create(user=user)
    return token.key

@pytest.fixture
def authenticated_client(api_client, auth_token):
    api_client.credentials(HTTP_AUTHORIZATION=f'Token {auth_token}')
    return api_client


# -------------------------------------------------------------
# Teste 1: Logout com token válido
# -------------------------------------------------------------
@pytest.mark.django_db
def test_logout_com_token_valido(authenticated_client, user, auth_token):
    url = reverse('logout')  # nome definido em users/urls.py como name='logout'
    response = authenticated_client.post(url)

    assert response.status_code == 200
    assert response.json() == {"detail": "Logout realizado com sucesso."}
    
    # Verifica que o token foi deletado do banco
    with pytest.raises(Token.DoesNotExist):
        Token.objects.get(key=auth_token)


# -------------------------------------------------------------
# Teste 2: Acessar endpoint protegido após logout (token deletado)
# -------------------------------------------------------------
@pytest.mark.django_db
def test_token_inutilizado_apos_logout(authenticated_client, user, auth_token):
    # Primeiro faz logout
    logout_url = reverse('logout')
    authenticated_client.post(logout_url)

    # Tenta acessar um endpoint protegido qualquer (ex: /api/user/me/)
    # Assumindo que o endpoint /api/user/me/ já existe (Issue #1)
    # Se não existir, pode testar com qualquer endpoint que use IsAuthenticated.
    # Vou usar o próprio logout (que exige autenticação) como referência.
    response = authenticated_client.post(logout_url)  # token já foi deletado
    
    # O client ainda tem a credencial antiga, mas o token não existe mais
    assert response.status_code == 401
    # Ou, dependendo da implementação do DRF, pode ser 401 Unauthorized
    # O JSON pode ser {"detail": "Invalid token."}


# -------------------------------------------------------------
# Teste 3: Requisição sem token
# -------------------------------------------------------------
@pytest.mark.django_db
def test_logout_sem_token(api_client):
    url = reverse('logout')
    response = api_client.post(url)
    assert response.status_code == 401
    # O DRF retorna {"detail": "Authentication credentials were not provided."}
    assert 'detail' in response.json()


# -------------------------------------------------------------
# Teste 4: Token inválido ou já deletado
# -------------------------------------------------------------
@pytest.mark.django_db
def test_logout_com_token_invalido(api_client):
    # Simula um token que não existe no banco
    api_client.credentials(HTTP_AUTHORIZATION='Token token_inexistente123')
    url = reverse('logout')
    response = api_client.post(url)
    assert response.status_code == 401
    # O DRF retorna o erro traduzido {"detail": "Token inválido."}
    assert response.json()['detail'] == 'Token inválido.'


# -------------------------------------------------------------
# Teste extra: Logout deve aceitar apenas método POST
# -------------------------------------------------------------
@pytest.mark.django_db
def test_logout_apenas_post(authenticated_client):
    url = reverse('logout')
    # GET não deve funcionar
    response_get = authenticated_client.get(url)
    assert response_get.status_code == 405  # Method Not Allowed
    
    # POST funciona (já testado acima)


# -------------------------------------------------------------
# Teste extra: Logout com usuário de cargo DISPOSITIVO também funciona
# -------------------------------------------------------------
@pytest.mark.django_db
def test_logout_com_dispositivo(db):
    dispositivo = CustomUser.objects.create_user(
        email='tablet@loja.com',
        username='tablet01',
        first_name='Tablet',
        last_name='Loja',
        password='123456',
        cargo='DISPOSITIVO'
    )
    token = Token.objects.create(user=dispositivo)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    
    url = reverse('logout')
    response = client.post(url)
    assert response.status_code == 200
    
    # Token deletado
    assert not Token.objects.filter(key=token.key).exists()


class PasswordResetTests(APITestCase):

    def setUp(self):
        # Criação de um usuário ativo para testes
        self.user_ativo = User.objects.create_user(
            username="vendedor1",
            email="vendedor1@joiascentro.com.br",
            password="SenhaSegura123!",
            first_name="Lucas",
            cargo="VENDEDOR",
            is_active=True
        )
        
        # Criação de um usuário inativo para testes de segurança
        self.user_inativo = User.objects.create_user(
            username="ex_funcionario",
            email="inativo@joiascentro.com.br",
            password="SenhaAntiga123!",
            cargo="VENDEDOR",
            is_active=False
        )

        # URLs dos endpoints usando reverse (garante que as rotas estão mapeadas com name)
        self.url_request = reverse('password_reset')
        self.url_confirm = reverse('password_reset_confirm')

    # ==========================================================================
    # TESTES DE SOLICITAÇÃO (POST /api/password-reset/)
    # ==========================================================================

    def test_solicitacao_com_email_valido_e_ativo(self):
        """Usuário ativo solicita reset: retorna 200 e envia 1 e-mail com o link."""
        data = {"email": "vendedor1@joiascentro.com.br"}
        response = self.client.post(self.url_request, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Se o e-mail informado estiver cadastrado", response.data["detail"])
        
        # Verifica se o e-mail foi para a caixa de saída simulada
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["vendedor1@joiascentro.com.br"])
        
        # Garante que o link gerado contém o UID e o Token esperados
        uid = urlsafe_base64_encode(force_bytes(self.user_ativo.pk))
        self.assertIn(uid, mail.outbox[0].body)

    def test_solicitacao_com_email_inexistente(self):
        """E-mail não cadastrado: retorna 200 (mensagem genérica) e NÃO envia e-mail."""
        data = {"email": "fantasma@joiascentro.com.br"}
        response = self.client.post(self.url_request, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Se o e-mail informado estiver cadastrado", response.data["detail"])
        
        # Segurança: Ninguém recebe e-mail e a resposta não entrega que o e-mail não existe
        self.assertEqual(len(mail.outbox), 0)

    def test_solicitacao_com_usuario_inativo(self):
        """Usuário is_active=False solicita reset: retorna 200 mas NÃO envia e-mail."""
        data = {"email": "inativo@joiascentro.com.br"}
        response = self.client.post(self.url_request, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    # ==========================================================================
    # TESTES DE CONFIRMAÇÃO (POST /api/password-reset/confirm/)
    # ==========================================================================

    def test_confirmacao_com_token_e_uid_validos(self):
        """Token e UID corretos alteram a senha e permitem login subsequente."""
        uid = urlsafe_base64_encode(force_bytes(self.user_ativo.pk))
        token = default_token_generator.make_token(self.user_ativo)
        
        data = {
            "uid": uid,
            "token": token,
            "new_password": "NovaSenhaSuperForte2026!"
        }
        response = self.client.post(self.url_confirm, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Senha redefinida com sucesso", response.data["detail"])

        # Verifica se a senha realmente mudou tentando autenticar o usuário
        self.user_ativo.refresh_from_db()
        self.assertTrue(self.user_ativo.check_password("NovaSenhaSuperForte2026!"))

    def test_confirmacao_com_token_invalido(self):
        """Token corrompido ou adulterado retorna erro 400 Bad Request."""
        uid = urlsafe_base64_encode(force_bytes(self.user_ativo.pk))
        
        data = {
            "uid": uid,
            "token": "token-totalmente-invalido-123",
            "new_password": "NovaSenhaSuperForte2026!"
        }
        response = self.client.post(self.url_confirm, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # O DRF encapsula erros de validação gerais em dicionários/listas
        self.assertIn("Link de recuperação inválido ou expirado.", str(response.data))

    def test_confirmacao_com_senha_fraca(self):
        """Senha que viola regras de validação do Django retorna 400."""
        uid = urlsafe_base64_encode(force_bytes(self.user_ativo.pk))
        token = default_token_generator.make_token(self.user_ativo)
        
        data = {
            "uid": uid,
            "token": token,
            "new_password": "123" # Curta demais, fácil demais
        }
        response = self.client.post(self.url_confirm, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ExpiringTokenTests(APITestCase):

    def setUp(self):
        # 1. Cria o usuário de teste
        self.user = User.objects.create_user(
            username="vendedor_teste",
            email="vendedor_teste@joias.com",
            password="SenhaForte123!",
            cargo="VENDEDOR"
        )
        
        # 2. Cria um token inicial para o usuário
        self.token = Token.objects.create(user=self.user)
        
        # 3. Vamos utilizar o endpoint '/api/user/me/' para testar se a autenticação passa ou falha
        # Como esse endpoint exige autenticação (pelo mapeamento do escopo), ele é perfeito para isso.
        self.url_me = reverse('user-me')
        self.url_login = reverse('api_login')

    def test_token_recente_autentica_com_sucesso(self):
        """Um token gerado agora deve autenticar normalmente (retornar 200 OK)."""
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        response = self.client.get(self.url_me)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_token_limite_dentro_do_prazo_autentica(self):
        """Um token com 6 dias e 23 horas ainda deve ser aceito pelo sistema."""
        # Força a alteração da data de criação de forma retroativa usando .update()
        data_retroativa = timezone.now() - timedelta(days=6, hours=23)
        Token.objects.filter(pk=self.token.pk).update(created=data_retroativa)

        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        response = self.client.get(self.url_me)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_token_com_mais_de_sete_dias_retorna_401(self):
        """Um token com exatamente 7 dias ou mais deve ser rejeitado com 401 Unauthorized."""
        data_expirada = timezone.now() - timedelta(days=7, minutes=1)
        Token.objects.filter(pk=self.token.pk).update(created=data_expirada)

        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        response = self.client.get(self.url_me)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Este token expirou", response.data["detail"])

    def test_login_renova_token_existente(self):
        """Fazer login novamente deve deletar o token antigo e gerar um novo ciclo de 7 dias."""
        # 1. Envelhece o token atual para simular que ele estava quase expirando
        data_antiga = timezone.now() - timedelta(days=6)
        Token.objects.filter(pk=self.token.pk).update(created=data_antiga)
        
        # 2. Realiza a requisição de login
        dados_login = {
            "username": "vendedor_teste@joias.com",
            "password": "SenhaForte123!"
        }
        response = self.client.post(self.url_login, dados_login)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 3. Verifica se o token mudou e se a nova data de criação é recente
        novo_token_key = response.data['token']
        self.assertNotEqual(novo_token_key, self.token.key)
        
        token_do_banco = Token.objects.get(key=novo_token_key)
        # A margem de tolerância garante que o teste passe mesmo com milessegundos de diferença
        self.assertAlmostEqual(token_do_banco.created, timezone.now(), delta=timedelta(seconds=5))