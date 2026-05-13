from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.models import Relatorio
from .services import AnalyticsService
from django.db.models import Count, Sum
from users.permissions import IsVendedor, IsSupervisorOrAdmin, IsAdmin

class MeuDesempenhoView(APIView):
    """
    Retorna o desempenho individual do vendedor logado.
    """
    permission_classes = [IsAuthenticated, IsVendedor]

    def get(self, request):
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')

        queryset = Relatorio.objects.filter(vendedor=request.user)

        queryset_filtrado = AnalyticsService.filter_by_date(
            queryset=queryset, 
            data_inicio=data_inicio, 
            data_fim=data_fim
        )

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

        if not request.user.loja:
            return Response(
                {"detail": "Usuário não possui uma loja vinculada para visualizar o dashboard."}, 
                status=400
            )

        queryset = Relatorio.objects.filter(vendedor__loja=request.user.loja)

        queryset_filtrado = AnalyticsService.filter_by_date(
            queryset=queryset, 
            data_inicio=data_inicio, 
            data_fim=data_fim
        )

        dados_dashboard = AnalyticsService.get_dashboard_data(queryset_filtrado)

        ranking = (
            queryset_filtrado.filter(venda_fechada=True)
            .values('vendedor__first_name', 'vendedor__last_name')
            .annotate(
                total_vendas=Count('id'),
                valor_total=Sum('valor_venda')
            )
            .order_by('-valor_total')
        )
        
        dados_dashboard['ranking_vendedores'] = list(ranking)
        return Response(dados_dashboard)

class VisaoGeralView(APIView):
    """
    Retorna o desempenho global do sistema com comparativo entre lojas (apenas Admin).
    Pode ser filtrado por uma loja específica via query_params.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')
        # Captura o ID da loja enviado pelo React
        loja_id = request.query_params.get('loja_id')

        # Escopo global inicial
        queryset = Relatorio.objects.all()

        # SE houver loja_id, filtramos o queryset ANTES de mandar para o Service
        if loja_id:
            queryset = queryset.filter(vendedor__loja_id=loja_id)

        # Filtro de datas via Service
        queryset_filtrado = AnalyticsService.filter_by_date(
            queryset=queryset, 
            data_inicio=data_inicio, 
            data_fim=data_fim
        )

        # Gera os dados base (KPIs, Gráficos, Tabela) já filtrados
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