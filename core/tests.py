import pytest
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient, force_authenticate
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from users.models import CustomUser
from core.models import Loja, Equipe, Metrica, Relatorio
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

class RelatorioViewSetTests(APITestCase):
    
    def setUp(self):
        # Cria lojas e equipes
        self.loja1 = Loja.objects.create(nome="Loja Alpha")
        self.loja2 = Loja.objects.create(nome="Loja Beta")
        self.equipe1 = Equipe.objects.create(nome="Vendas Alpha", loja=self.loja1)
        self.equipe2 = Equipe.objects.create(nome="Vendas Beta", loja=self.loja2)
        
        # Cria métricas (globais e por loja)
        self.metrica_global = Metrica.objects.create(
            nome="Cliente achou caro", 
            descricao="Preço acima do esperado"
        )
        self.metrica_loja1 = Metrica.objects.create(
            nome="Não gostou da cor", 
            descricao="Cor não agradou", 
            loja=self.loja1
        )
        
        # Cria usuários de cada cargo
        self.admin = CustomUser.objects.create_user(
            username='admin', email='admin@ex.com', password='pass',
            cargo='ADMIN', is_active=True
        )
        self.supervisor = CustomUser.objects.create_user(
            username='super', email='super@ex.com', password='pass',
            cargo='SUPERVISOR', loja=self.loja1, is_active=True
        )
        self.vendedor1 = CustomUser.objects.create_user(
            username='vendedor1', email='v1@ex.com', password='pass',
            cargo='VENDEDOR', loja=self.loja1, equipe=self.equipe1, pin='1234', is_active=True
        )
        self.vendedor2 = CustomUser.objects.create_user(
            username='vendedor2', email='v2@ex.com', password='pass',
            cargo='VENDEDOR', loja=self.loja2, equipe=self.equipe2, pin='5678', is_active=True
        )
        self.dispositivo = CustomUser.objects.create_user(
            username='disp', email='disp@ex.com', password='pass',
            cargo='DISPOSITIVO', loja=self.loja1, is_active=True
        )
        
        # URLs
        self.list_url = reverse('atendimento-list')
        
        # Cliente para fazer requisições autenticadas
        self.client = APIClient()
    
    # ---------- Testes de criação (perform_create) ----------
    
    def test_vendedor_cria_atendimento_proprio(self):
        """VENDEDOR cria atendimento para si mesmo (vendedor automático)"""
        self.client.force_authenticate(user=self.vendedor1)
        data = {
            'venda_fechada': True,
            'valor_venda': '150.00',
            'metrica': None
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['vendedor'], self.vendedor1.id)
        self.assertEqual(Relatorio.objects.count(), 1)
        rel = Relatorio.objects.first()
        self.assertEqual(rel.vendedor, self.vendedor1)
        self.assertEqual(rel.valor_venda, Decimal('150.00'))
    
    def test_vendedor_cria_atendimento_com_data_futura_error(self):
        """Bloqueia data futura (validação do serializer)"""
        self.client.force_authenticate(user=self.vendedor1)
        data = {
            'data_hora': timezone.now() + timedelta(days=1),
            'venda_fechada': False,
            'metrica': self.metrica_global.id,
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('data_hora', response.data)
    
    def test_dispositivo_cria_com_vendedor_valido_e_pin_correto(self):
        """DISPOSITIVO cria atendimento para vendedor da mesma loja com PIN válido"""
        self.client.force_authenticate(user=self.dispositivo)
        data = {
            'venda_fechada': False,
            'metrica': self.metrica_global.id,
            'vendedor': self.vendedor1.id,
            'pin': '1234'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['vendedor'], self.vendedor1.id)
    
    def test_dispositivo_cria_com_vendedor_outra_loja_error(self):
        """DISPOSITIVO tenta criar para vendedor de outra loja → erro"""
        self.client.force_authenticate(user=self.dispositivo)
        data = {
            'venda_fechada': False,
            'metrica': self.metrica_global.id,
            'vendedor': self.vendedor2.id,
            'pin': '1234'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('vendedor', response.data)
        self.assertIn('não pertence à sua loja', response.data['vendedor'][0])
    
    def test_dispositivo_cria_com_pin_invalido_error(self):
        """DISPOSITIVO com PIN errado → erro"""
        self.client.force_authenticate(user=self.dispositivo)
        data = {
            'venda_fechada': True,
            'valor_venda': '100',
            'vendedor': self.vendedor1.id,
            'pin': '9999'  # incorreto
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('pin', response.data)
        self.assertIn('PIN inválido', response.data['pin'][0])
    
    def test_dispositivo_sem_pin_error(self):
        """DISPOSITIVO sem enviar PIN → erro"""
        self.client.force_authenticate(user=self.dispositivo)
        data = {
            'venda_fechada': True,
            'valor_venda': '100',
            'vendedor': self.vendedor1.id,
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('pin', response.data)
    
    def test_admin_cria_com_vendedor_explicito(self):
        """ADMIN pode criar atendimento para qualquer vendedor informado"""
        self.client.force_authenticate(user=self.admin)
        data = {
            'venda_fechada': False,
            'metrica': self.metrica_global.id,
            'vendedor': self.vendedor2.id,
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['vendedor'], self.vendedor2.id)
    
    def test_admin_cria_sem_vendedor_usa_proprio(self):
        """ADMIN cria atendimento sem informar vendedor → usa o próprio admin"""
        self.client.force_authenticate(user=self.admin)
        data = {
            'venda_fechada': True,
            'valor_venda': '50.00',
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['vendedor'], self.admin.id)
    
    def test_supervisor_nao_pode_criar(self):
        """SUPERVISOR não pode criar atendimento (403)"""
        self.client.force_authenticate(user=self.supervisor)
        data = {'venda_fechada': False, 'metrica': self.metrica_global.id}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    # ---------- Testes de validação de negócio (venda vs métrica) ----------
    
    def test_venda_fechada_sem_valor_error(self):
        self.client.force_authenticate(user=self.vendedor1)
        data = {'venda_fechada': True, 'valor_venda': None}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('valor_venda', response.data)
    
    def test_venda_fechada_com_valor_negativo_error(self):
        """API: Impede a criação de atendimento com valor de venda negativo via Endpoint"""
        self.client.force_authenticate(user=self.vendedor1)
        data = {
            'venda_fechada': True, 
            'valor_venda': '-150.00'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('valor_venda', response.data)
        self.assertIn('não pode ser negativo', response.data['valor_venda'][0])

    def test_modelo_venda_fechada_valor_negativo_error(self):
        """MODELO: Impede salvar no banco com valor negativo através do clean()"""
        rel = Relatorio(
            vendedor=self.vendedor1,
            venda_fechada=True,
            valor_venda=Decimal('-50.00')
        )
        with self.assertRaises(ValidationError):
            rel.clean()

    def test_venda_nao_fechada_sem_metrica_error(self):
        self.client.force_authenticate(user=self.vendedor1)
        data = {'venda_fechada': False, 'metrica': None}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('metrica', response.data)
    
    def test_venda_fechada_com_metrica_e_limpa_automaticamente(self):
        """Se enviar métrica mesmo com venda fechada, o serializer deve ignorar a métrica"""
        self.client.force_authenticate(user=self.vendedor1)
        data = {
            'venda_fechada': True,
            'valor_venda': '200.00',
            'metrica': self.metrica_global.id  # deveria ser ignorado
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        rel = Relatorio.objects.first()
        self.assertIsNone(rel.metrica)
        self.assertEqual(rel.valor_venda, Decimal('200.00'))
    
    # ---------- Testes de listagem (get_queryset) ----------
    
    def setUp_listagem(self):
        """Cria alguns atendimentos para testar filtros"""
        # Atendimentos vendedor1
        Relatorio.objects.create(vendedor=self.vendedor1, venda_fechada=True, valor_venda=100)
        Relatorio.objects.create(vendedor=self.vendedor1, venda_fechada=False, metrica=self.metrica_global)
        # Atendimentos vendedor2
        Relatorio.objects.create(vendedor=self.vendedor2, venda_fechada=True, valor_venda=200)
        # Atendimento admin (self.admin)
        Relatorio.objects.create(vendedor=self.admin, venda_fechada=False, metrica=self.metrica_loja1)
    
    def test_vendedor_ve_apenas_seus_atendimentos(self):
        self.setUp_listagem()
        self.client.force_authenticate(user=self.vendedor1)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)  # paginado
        ids = [item['vendedor'] for item in response.data['results']]
        self.assertTrue(all(id == self.vendedor1.id for id in ids))
    
    def test_supervisor_ve_atendimentos_da_sua_loja(self):
        self.setUp_listagem()
        self.client.force_authenticate(user=self.supervisor)  # loja1
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Deve ver vendedor1 (loja1) e admin (adm não tem loja, mas admin não aparece? O admin não tem loja, então não? Depende.
        # Para simplificar, admin não tem loja, então não é filtrado. Vendedor2 é loja2, não aparece.
        self.assertEqual(len(response.data['results']), 2)  # dois atendimentos do vendedor1?
        # Na verdade, vendedor1 tem dois, admin tem um (sem loja) – supervisor não vê admin porque admin.loja é None.
        # O filtro é vendedor__loja = supervisor.loja. Admin não tem loja, então não está incluso.
        # Então total = 2.
    
    def test_admin_ve_todos_atendimentos(self):
        self.setUp_listagem()
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 4)  # todos os 4 criados
    
    def test_dispositivo_ve_lista_vazia(self):
        self.setUp_listagem()
        self.client.force_authenticate(user=self.dispositivo)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)
    
    # ---------- Testes de atualização (update) ----------
    
    def test_vendedor_pode_editar_seu_proprio_atendimento(self):
        self.setUp_listagem()
        rel = Relatorio.objects.filter(vendedor=self.vendedor1).first()
        url = reverse('atendimento-detail', args=[rel.id])
        self.client.force_authenticate(user=self.vendedor1)
        data = {'venda_fechada': True, 'valor_venda': '500.00'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rel.refresh_from_db()
        self.assertEqual(rel.valor_venda, Decimal('500.00'))
    
    def test_vendedor_nao_pode_editar_atendimento_de_outro(self):
        self.setUp_listagem()
        rel = Relatorio.objects.filter(vendedor=self.vendedor2).first()
        url = reverse('atendimento-detail', args=[rel.id])
        self.client.force_authenticate(user=self.vendedor1)
        response = self.client.patch(url, {'venda_fechada': False, 'metrica': self.metrica_global.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_pode_editar_qualquer_atendimento(self):
        self.setUp_listagem()
        rel = Relatorio.objects.filter(vendedor=self.vendedor2).first()
        url = reverse('atendimento-detail', args=[rel.id])
        self.client.force_authenticate(user=self.admin)
        data = {'venda_fechada': True, 'valor_venda': '999.99'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rel.refresh_from_db()
        self.assertEqual(rel.valor_venda, Decimal('999.99'))
    
    def test_supervisor_nao_pode_editar(self):
        self.setUp_listagem()
        rel = Relatorio.objects.first()
        url = reverse('atendimento-detail', args=[rel.id])
        self.client.force_authenticate(user=self.supervisor)
        response = self.client.patch(url, {'venda_fechada': True, 'valor_venda': '777'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    # ---------- Testes de exclusão (destroy) ----------
    
    def test_vendedor_pode_deletar_seu_atendimento(self):
        self.setUp_listagem()
        rel = Relatorio.objects.filter(vendedor=self.vendedor1).first()
        url = reverse('atendimento-detail', args=[rel.id])
        self.client.force_authenticate(user=self.vendedor1)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Relatorio.objects.filter(id=rel.id).count(), 0)
    
    def test_vendedor_nao_pode_deletar_atendimento_de_outro(self):
        self.setUp_listagem()
        rel = Relatorio.objects.filter(vendedor=self.vendedor2).first()
        url = reverse('atendimento-detail', args=[rel.id])
        self.client.force_authenticate(user=self.vendedor1)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_pode_deletar_qualquer(self):
        self.setUp_listagem()
        rel = Relatorio.objects.filter(vendedor=self.vendedor2).first()
        url = reverse('atendimento-detail', args=[rel.id])
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_dispositivo_nao_pode_deletar(self):
        self.setUp_listagem()
        rel = Relatorio.objects.first()
        url = reverse('atendimento-detail', args=[rel.id])
        self.client.force_authenticate(user=self.dispositivo)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class MetricaViewSetTests(APITestCase):
    
    def setUp(self):
        self.loja1 = Loja.objects.create(nome="Loja Um")
        self.loja2 = Loja.objects.create(nome="Loja Dois")
        
        self.metrica_global = Metrica.objects.create(nome="Motivo Global", descricao="Global")
        self.metrica_loja1 = Metrica.objects.create(nome="Motivo Loja 1", loja=self.loja1)
        self.metrica_loja2 = Metrica.objects.create(nome="Motivo Loja 2", loja=self.loja2)
        
        self.vendedor_loja1 = CustomUser.objects.create_user(
            username='vend1', email='v1@ex.com', password='pass', cargo='VENDEDOR', loja=self.loja1
        )
        self.vendedor_loja2 = CustomUser.objects.create_user(
            username='vend2', email='v2@ex.com', password='pass', cargo='VENDEDOR', loja=self.loja2
        )
        self.admin = CustomUser.objects.create_user(
            username='admin', email='ad@ex.com', password='pass', cargo='ADMIN'
        )
        
        self.list_url = reverse('metrica-list')
        self.client = APIClient()

    def test_acesso_nao_autenticado(self):
        """Garante que requisições anônimas sejam bloqueadas (401)"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_listagem_vendedor_loja1(self):
        """Vendedor da loja 1 deve ver métricas globais e da sua loja, mas não da loja 2"""
        self.client.force_authenticate(user=self.vendedor_loja1)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Previne erros caso a paginação esteja ligada ou desligada
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertEqual(len(results), 2)
        
        nomes = [m['nome'] for m in results]
        self.assertIn("Motivo Global", nomes)
        self.assertIn("Motivo Loja 1", nomes)
        self.assertNotIn("Motivo Loja 2", nomes)

    def test_listagem_vendedor_loja2(self):
        """Vendedor da loja 2 deve ver métricas globais e da sua loja, mas não da loja 1"""
        self.client.force_authenticate(user=self.vendedor_loja2)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertEqual(len(results), 2)
        
        nomes = [m['nome'] for m in results]
        self.assertIn("Motivo Global", nomes)
        self.assertIn("Motivo Loja 2", nomes)
        self.assertNotIn("Motivo Loja 1", nomes)
        
    def test_listagem_usuario_sem_loja(self):
        """Usuário sem loja vinculada (ex: Admin geral) vê apenas métricas globais"""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['nome'], "Motivo Global")

    def test_metodos_escrita_bloqueados(self):
        """A view é ReadOnly, então POST, PUT, DELETE devem retornar 405 Method Not Allowed"""
        self.client.force_authenticate(user=self.admin)
        
        # Teste POST
        response_post = self.client.post(self.list_url, {"nome": "Nova Metrica"})
        self.assertEqual(response_post.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

User = get_user_model()

@pytest.fixture
def admin():
    return User.objects.create_user(username='admin', email='admin@ex.com', password='pass', cargo='ADMIN')

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def supervisor(loja, equipe):
    return User.objects.create_user(username='sup', email='sup@ex.com', password='pass', cargo='SUPERVISOR', loja=loja, equipe=equipe)

@pytest.fixture
def vendedor(loja, equipe):
    return User.objects.create_user(username='vendedor', email='vend@ex.com', password='pass', cargo='VENDEDOR', loja=loja, equipe=equipe, pin='1234')

@pytest.fixture
def loja():
    return Loja.objects.create(nome='Loja Teste', cidade='Cidade', ativo=True)

@pytest.fixture
def equipe(loja):
    return Equipe.objects.create(nome='Equipe Alpha', loja=loja, ativo=True)

@pytest.fixture
def metrica(loja):
    return Metrica.objects.create(nome='Motivo', loja=loja, ativo=True)

@pytest.fixture
def relatorio_fechado(vendedor, metrica):
    return Relatorio.objects.create(
        data_hora=timezone.now(),
        venda_fechada=True,
        valor_venda=1000.00,
        vendedor=vendedor,
        metrica=None,
        cliente_nome='Cliente'
    )

@pytest.mark.django_db
class TestFiltrosAtivo:

    def test_lojas_ativas_sao_retornadas(self, api_client, admin, loja):
        loja_inativa = Loja.objects.create(nome='Inativa', cidade='X', ativo=False)
        api_client.force_authenticate(admin)
        response = api_client.get('/api/core/lojas/')
        assert response.status_code == 200
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        ids = [l['id'] for l in results]
        assert loja.id in ids
        assert loja_inativa.id not in ids

    def test_metricas_ativas_sao_retornadas(self, api_client, supervisor, loja, metrica):
        metrica_inativa = Metrica.objects.create(nome='Inativa', loja=loja, ativo=False)
        api_client.force_authenticate(supervisor)
        response = api_client.get('/api/core/metricas/')
        assert response.status_code == 200
        results = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        ids = [m['id'] for m in results]
        assert metrica.id in ids
        assert metrica_inativa.id not in ids

@pytest.mark.django_db
class TestEquipeInfoViewSet:

    def test_vendedor_ve_sua_equipe(self, api_client, vendedor, equipe, loja, relatorio_fechado):
        outro = User.objects.create_user(username='outro', email='outro@ex.com', password='pass', cargo='VENDEDOR', loja=loja, equipe=equipe, pin='5678')
        api_client.force_authenticate(vendedor)
        response = api_client.get('/api/core/equipe-info/')
        assert response.status_code == 200
        assert len(response.data) == 1
        data = response.data[0]
        assert data['id'] == equipe.id
        assert data['nome'] == 'Equipe Alpha'
        assert float(data['total_vendas']) == 1000.00
        membros = data['membros']
        assert len(membros) == 2
        ids_membros = [m['id'] for m in membros]
        assert vendedor.id in ids_membros
        assert outro.id in ids_membros

    def test_supervisor_ve_sua_propria_equipe(self, api_client, supervisor, loja, equipe):
        outra_equipe = Equipe.objects.create(nome='Outra', loja=loja, ativo=True)
        equipe_outra_loja = Equipe.objects.create(nome='Fora', loja=Loja.objects.create(nome='Outra Loja'), ativo=True)
        api_client.force_authenticate(supervisor)
        response = api_client.get('/api/core/equipe-info/')
        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]['id'] == equipe.id

    def test_admin_ve_todas_equipes(self, api_client, admin, loja, equipe):
        outra_equipe = Equipe.objects.create(nome='Outra', loja=loja, ativo=True)
        equipe_outra_loja = Equipe.objects.create(nome='Fora', loja=Loja.objects.create(nome='Outra Loja'), ativo=True)
        api_client.force_authenticate(admin)
        response = api_client.get('/api/core/equipe-info/')
        assert response.status_code == 200
        assert len(response.data) == 3

    def test_dispositivo_sem_acesso(self, api_client, loja):
        disp = User.objects.create_user(username='disp', email='disp@ex.com', password='pass', cargo='DISPOSITIVO', loja=loja)
        api_client.force_authenticate(disp)
        response = api_client.get('/api/core/equipe-info/')
        assert response.status_code == 200
        assert response.data == []
