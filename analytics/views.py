from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.models import Relatorio
from .services import AnalyticsService
from django.db.models import Count, Sum

# Ajuste o import abaixo de acordo com o local onde suas permissões estão salvas
from users.permissions import IsVendedor, IsSupervisorOrAdmin, IsAdmin

class MeuDesempenhoView(APIView):
    """
    Retorna o desempenho individual do vendedor logado.
    """
    permission_classes = [IsAuthenticated, IsVendedor]

    def get(self, request):
        # 1. Captura parâmetros de data (se existirem)
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')

        # 2. Filtro base de segurança: SÓ pega os relatórios do usuário atual
        queryset = Relatorio.objects.filter(vendedor=request.user)

        # 3. Aplica o filtro de datas usando o service
        queryset_filtrado = AnalyticsService.filter_by_date(
            queryset=queryset, 
            data_inicio=data_inicio, 
            data_fim=data_fim
        )

        # 4. Gera os dados agregados para os cards, gráfico e tabela
        dados_dashboard = AnalyticsService.get_dashboard_data(queryset_filtrado)

        return Response(dados_dashboard)

class LojaDesempenhoView(APIView):
    """
    Retorna o desempenho consolidado da loja do usuário logado (Supervisor ou Admin).
    """
    permission_classes = [IsAuthenticated, IsSupervisorOrAdmin]

    def get(self, request):
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')

        # Validação de segurança: garantir que o usuário está vinculado a uma loja
        if not request.user.loja:
            return Response(
                {"detail": "Usuário não possui uma loja vinculada para visualizar o dashboard."}, 
                status=400
            )

        # Filtro de segurança: pega relatórios onde o vendedor pertence à loja do request.user
        queryset = Relatorio.objects.filter(vendedor__loja=request.user.loja)

        # Filtro de datas via Service
        queryset_filtrado = AnalyticsService.filter_by_date(
            queryset=queryset, 
            data_inicio=data_inicio, 
            data_fim=data_fim
        )

        # Base de dados (kpis, grafico, tabela)
        dados_dashboard = AnalyticsService.get_dashboard_data(queryset_filtrado)

        # Métrica Extra: Ranking de Vendedores da Loja
        ranking = (
            queryset_filtrado.filter(venda_fechada=True)
            .values('vendedor__first_name', 'vendedor__last_name')
            .annotate(
                total_vendas=Count('id'),
                valor_total=Sum('valor_venda')
            )
            .order_by('-valor_total') # Ordena quem vendeu mais dinheiro primeiro
        )
        
        dados_dashboard['ranking_vendedores'] = list(ranking)

        return Response(dados_dashboard)

class VisaoGeralView(APIView):
    """
    Retorna o desempenho global do sistema com comparativo entre lojas (apenas Admin).
    """
    permission_classes = [IsAuthenticated, IsAdmin] # Importe o IsAdmin do seu users.permissions

    def get(self, request):
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')

        # Escopo global: pega TODOS os relatórios do sistema
        queryset = Relatorio.objects.all()

        # Filtro de datas via Service
        queryset_filtrado = AnalyticsService.filter_by_date(
            queryset=queryset, 
            data_inicio=data_inicio, 
            data_fim=data_fim
        )

        dados_dashboard = AnalyticsService.get_dashboard_data(queryset_filtrado)

        # Métrica Extra: Comparativo entre Lojas
        comparativo = (
            queryset_filtrado.filter(venda_fechada=True)
            .values('vendedor__loja__nome')
            .annotate(
                quantidade_vendas=Count('id'),
                valor_total=Sum('valor_venda')
            )
            .order_by('-valor_total')
        )
        
        # Formatando para evitar chaves nulas caso um admin/vendedor tenha feito venda sem loja vinculada
        comparativo_formatado = [
            {
                "loja": item['vendedor__loja__nome'] or "Sem Loja Vinculada",
                "quantidade_vendas": item['quantidade_vendas'],
                "valor_total": item['valor_total']
            }
            for item in comparativo
        ]

        dados_dashboard['comparativo_lojas'] = comparativo_formatado

        return Response(dados_dashboard)