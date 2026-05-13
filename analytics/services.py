from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncHour
from django.utils.dateparse import parse_date
from django.utils import timezone
from datetime import datetime, time

class AnalyticsService:
    
    @staticmethod
    def filter_by_date(queryset, data_inicio=None, data_fim=None):
        """
        Filtra o queryset baseado nos parâmetros de data_inicio e data_fim.
        Garante a cobertura do dia inteiro (00:00:00 até 23:59:59) respeitando o timezone.
        """
        if data_inicio:
            inicio = parse_date(data_inicio)
            if inicio:
                inicio_aware = timezone.make_aware(datetime.combine(inicio, time.min))
                queryset = queryset.filter(data_hora__gte=inicio_aware)
        
        if data_fim:
            fim = parse_date(data_fim)
            if fim:
                fim_aware = timezone.make_aware(datetime.combine(fim, time.max))
                queryset = queryset.filter(data_hora__lte=fim_aware)
                
        return queryset
    @staticmethod
    def filter_by_store(queryset, loja_id=None):
        """
        Filtra o queryset pelo ID da loja, se fornecido.
        """
        if loja_id:
            return queryset.filter(vendedor__loja_id=loja_id)
        return queryset

    @staticmethod
    def get_dashboard_data(queryset):
        """
        Recebe um queryset (já filtrado por cargo/loja/data) e retorna o dicionário
        formatado para os componentes do frontend.
        """
        # 1. KPIs para os Cards
        kpis = queryset.aggregate(
            total_vendas_valor=Sum('valor_venda', default=0),
            vendas_concluidas_count=Count('id', filter=Q(venda_fechada=True)),
            vendas_nao_concluidas_count=Count('id', filter=Q(venda_fechada=False))
        )

        # --- NOVO: Cálculo da Taxa de Conversão ---
        total_atendimentos = kpis['vendas_concluidas_count'] + kpis['vendas_nao_concluidas_count']
        
        if total_atendimentos > 0:
            taxa_conversao = (kpis['vendas_concluidas_count'] / total_atendimentos) * 100
        else:
            taxa_conversao = 0.0 # Evita erro de divisão por zero
            
        # Formata a taxa com 2 casas decimais
        taxa_conversao_formatada = round(taxa_conversao, 2)
        # ------------------------------------------

        # 2. Gráfico de Vendas por Horário (contando apenas vendas fechadas)
        grafico_horario = (
            queryset.filter(venda_fechada=True)
            .annotate(hora=TruncHour('data_hora'))
            .values('hora')
            .annotate(vendas=Count('id'))
            .order_by('hora')
        )
        
        # Formatando a saída do gráfico para "HH:00" para facilitar no React
        grafico_formatado = [
            {
                "hora": timezone.localtime(item['hora']).strftime('%H:00') if item['hora'] else "Desconhecido",
                "vendas": item['vendas']
            }
            for item in grafico_horario
        ]

        # 3. Tabela de Detalhes (trazendo os 20 mais recentes)
        tabela_atendimentos = queryset.select_related('vendedor', 'metrica').values(
            'id',
            'data_hora',
            'vendedor__first_name',
            'vendedor__last_name',
            'metrica__nome',
            'venda_fechada',
            'valor_venda',
            'cliente_nome',
            'observacoes'
        ).order_by('-data_hora')[:20]

        return {
            "kpis": kpis,
            "taxa_conversao": taxa_conversao_formatada,
            "grafico_vendas": grafico_formatado,
            "tabela": list(tabela_atendimentos)
        }