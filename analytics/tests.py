from django.test import TestCase
import pytest
from decimal import Decimal
from django.utils import timezone
from core.models import Loja, Metrica, Relatorio
from users.models import CustomUser
from analytics.services import AnalyticsService
from django.urls import reverse
from rest_framework.test import APIClient

@pytest.mark.django_db
class TestAnalyticsService:
    
    @pytest.fixture
    def setup_data(self):
        loja = Loja.objects.create(nome="Joias Centro", cidade="Montes Claros")
        vendedor = CustomUser.objects.create_user(
            username="vend1", email="v@t.com", password="123", 
            cargo="VENDEDOR", loja=loja
        )
        metrica = Metrica.objects.create(nome="Visita Simples", loja=loja)
        
        # Criando atendimentos
        agora = timezone.now()
        Relatorio.objects.create(
            data_hora=agora, venda_fechada=True, valor_venda=Decimal('150.00'), vendedor=vendedor
        )
        Relatorio.objects.create(
            data_hora=agora, venda_fechada=True, valor_venda=Decimal('350.00'), vendedor=vendedor
        )
        Relatorio.objects.create(
            data_hora=agora, venda_fechada=False, metrica=metrica, vendedor=vendedor
        )
        
        return vendedor

    def test_get_dashboard_data_kpis_corretos(self, setup_data):
        queryset = Relatorio.objects.all()
        dados = AnalyticsService.get_dashboard_data(queryset)
        
        # Valida KPIs
        assert dados['kpis']['total_vendas_valor'] == Decimal('500.00')
        assert dados['kpis']['vendas_concluidas_count'] == 2
        assert dados['kpis']['vendas_nao_concluidas_count'] == 1
        
        # Valida Gráfico
        assert len(dados['grafico_vendas']) > 0
        assert dados['grafico_vendas'][0]['vendas'] == 2 # Duas vendas na mesma hora
        
        # Valida Tabela
        assert len(dados['tabela']) == 3

@pytest.mark.django_db
class TestMeuDesempenhoView:

    @pytest.fixture
    def setup_usuarios(self):
        loja = Loja.objects.create(nome="Joias Centro", cidade="Montes Claros")
        vendedor = CustomUser.objects.create_user(
            username="vend_teste", email="v@teste.com", password="123", 
            cargo="VENDEDOR", loja=loja
        )
        supervisor = CustomUser.objects.create_user(
            username="sup_teste", email="s@teste.com", password="123", 
            cargo="SUPERVISOR", loja=loja
        )
        return vendedor, supervisor

    def test_vendedor_acessa_meu_desempenho(self, setup_usuarios):
        vendedor, _ = setup_usuarios
        client = APIClient()
        client.force_authenticate(user=vendedor)

        url = reverse('meu-desempenho')
        response = client.get(url)

        assert response.status_code == 200
        # Verifica se as chaves esperadas estão no retorno JSON
        assert 'kpis' in response.data
        assert 'grafico_vendas' in response.data
        assert 'tabela' in response.data

    def test_supervisor_nao_acessa_meu_desempenho(self, setup_usuarios):
        _, supervisor = setup_usuarios
        client = APIClient()
        client.force_authenticate(user=supervisor)

        url = reverse('meu-desempenho')
        response = client.get(url)

        # Supervisor não pode acessar a rota individual de desempenho de vendedor
        assert response.status_code == 403

@pytest.mark.django_db
class TestLojaDesempenhoView:

    @pytest.fixture
    def setup_multilojas(self):
        # Criando duas lojas distintas
        loja_a = Loja.objects.create(nome="Joias Centro", cidade="Montes Claros")
        loja_b = Loja.objects.create(nome="Joias Sul", cidade="Belo Horizonte")

        # Staff Loja A
        sup_a = CustomUser.objects.create_user(
            username="sup_a", email="sa@t.com", password="123", cargo="SUPERVISOR", loja=loja_a
        )
        vend_a = CustomUser.objects.create_user(
            username="vend_a", email="va@t.com", password="123", cargo="VENDEDOR", loja=loja_a
        )
        
        # Staff Loja B
        sup_b = CustomUser.objects.create_user(
            username="sup_b", email="sb@t.com", password="123", cargo="SUPERVISOR", loja=loja_b
        )
        vend_b = CustomUser.objects.create_user(
            username="vend_b", email="vb@t.com", password="123", cargo="VENDEDOR", loja=loja_b
        )

        # Populando vendas (Loja A: $500, Loja B: $1000)
        agora = timezone.now()
        Relatorio.objects.create(data_hora=agora, venda_fechada=True, valor_venda=Decimal('200.00'), vendedor=vend_a)
        Relatorio.objects.create(data_hora=agora, venda_fechada=True, valor_venda=Decimal('300.00'), vendedor=vend_a)
        Relatorio.objects.create(data_hora=agora, venda_fechada=True, valor_venda=Decimal('1000.00'), vendedor=vend_b)

        return sup_a, sup_b, vend_a

    def test_supervisor_ve_apenas_sua_loja(self, setup_multilojas):
        sup_a, sup_b, _ = setup_multilojas
        client = APIClient()
        
        # Testa Supervisor da Loja A
        client.force_authenticate(user=sup_a)
        url = reverse('loja-desempenho')
        response = client.get(url)
        
        assert response.status_code == 200
        # A Loja A deve ter exatamente $500 em vendas
        assert response.data['kpis']['total_vendas_valor'] == Decimal('500.00')
        assert len(response.data['ranking_vendedores']) == 1

    def test_vendedor_nao_acessa_loja_desempenho(self, setup_multilojas):
        _, _, vend_a = setup_multilojas
        client = APIClient()
        client.force_authenticate(user=vend_a)
        
        url = reverse('loja-desempenho')
        response = client.get(url)
        
        # Vendedor deve receber um 403 Forbidden
        assert response.status_code == 403

@pytest.mark.django_db
class TestVisaoGeralView:

    @pytest.fixture
    def setup_admin_e_dados(self):
        # Lojas
        loja_a = Loja.objects.create(nome="Joias Centro", cidade="Montes Claros")
        loja_b = Loja.objects.create(nome="Joias Sul", cidade="Belo Horizonte")

        # Usuários
        admin = CustomUser.objects.create_user(
            username="admin_geral", email="admin@t.com", password="123", cargo="ADMIN"
        )
        sup_a = CustomUser.objects.create_user(
            username="sup_a2", email="sa2@t.com", password="123", cargo="SUPERVISOR", loja=loja_a
        )
        vend_a = CustomUser.objects.create_user(
            username="vend_a2", email="va2@t.com", password="123", cargo="VENDEDOR", loja=loja_a
        )
        vend_b = CustomUser.objects.create_user(
            username="vend_b2", email="vb2@t.com", password="123", cargo="VENDEDOR", loja=loja_b
        )

        # Populando vendas (Total Geral: $1500)
        agora = timezone.now()
        Relatorio.objects.create(data_hora=agora, venda_fechada=True, valor_venda=Decimal('500.00'), vendedor=vend_a)
        Relatorio.objects.create(data_hora=agora, venda_fechada=True, valor_venda=Decimal('1000.00'), vendedor=vend_b)

        return admin, sup_a

    def test_admin_acessa_visao_geral(self, setup_admin_e_dados):
        admin, _ = setup_admin_e_dados
        client = APIClient()
        client.force_authenticate(user=admin)
        
        url = reverse('visao-geral')
        response = client.get(url)
        
        assert response.status_code == 200
        # Deve somar os dados de todas as lojas
        assert response.data['kpis']['total_vendas_valor'] == Decimal('1500.00')
        assert len(response.data['comparativo_lojas']) == 2

    def test_supervisor_nao_acessa_visao_geral(self, setup_admin_e_dados):
        _, sup_a = setup_admin_e_dados
        client = APIClient()
        client.force_authenticate(user=sup_a)
        
        url = reverse('visao-geral')
        response = client.get(url)
        
        # Supervisor não tem acesso à visão geral
        assert response.status_code == 403