from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q, Sum
from .models import Metrica, Equipe
from .serializers import RelatorioSerializer, MetricaSerializer, EquipeInfoSerializer
from users.serializers import LojaSerializer
from users.permissions import IsTenantUser
from users.tenant import scoped, stores, reports
from analytics.services import AnalyticsService 

class LojaViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LojaSerializer
    permission_classes = [IsTenantUser]

    def get_queryset(self):
        return stores(self.request.user).filter(ativo=True).order_by('nome')

class MetricaViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MetricaSerializer
    permission_classes = [IsTenantUser]

    def get_queryset(self):
        user = self.request.user
        return scoped(Metrica.objects.filter(ativo=True), user).filter(
            Q(loja__isnull=True) | Q(loja__in=stores(user))
        ).order_by('nome')

class RelatorioViewSet(viewsets.ModelViewSet):
    serializer_class = RelatorioSerializer
    permission_classes = [IsTenantUser]

    def get_queryset(self):
        return reports(self.request.user).order_by('-data_hora', '-id')

    def create(self, request, *args, **kwargs):
        if request.user.cargo == 'SUPERVISOR':
            raise PermissionDenied('Supervisores não podem registrar atendimentos.')
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        if self.request.user.cargo == 'SUPERVISOR':
            raise PermissionDenied('Supervisores não podem registrar atendimentos.')
        serializer.save()

    def perform_update(self, serializer):
        if self.request.user.cargo not in ('ADMIN', 'VENDEDOR'):
            raise PermissionDenied('Sem permissão para editar atendimento.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.cargo not in ('ADMIN', 'VENDEDOR'):
            raise PermissionDenied('Sem permissão para excluir atendimento.')
        instance.delete()

    # --- NOVO ENDPOINT DE PERFORMANCE ---
    @action(detail=False, methods=['get'], url_path='performance')
    def performance_vendedor(self, request):
        vendedor_id = request.query_params.get('vendedor_id')
        data_inicio = request.query_params.get('data_inicio')
        data_fim = request.query_params.get('data_fim')

        if not vendedor_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'vendedor_id': 'O ID do vendedor é obrigatório.'})

        queryset = self.get_queryset().filter(vendedor_id=vendedor_id)
        queryset = AnalyticsService.filter_by_date(queryset, data_inicio, data_fim)
        dados_processados = AnalyticsService.get_user_performance_data(queryset)

        return Response(dados_processados)


class EquipeInfoViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsTenantUser]
    serializer_class = EquipeInfoSerializer

    def get_queryset(self):
        user = self.request.user
        qs = scoped(Equipe.objects.filter(ativo=True), user, 'loja__cliente_id')
        if user.cargo == 'ADMIN':
            return qs
        if user.cargo in ('SUPERVISOR', 'VENDEDOR'):
            return qs.filter(pk=user.equipe_id, loja_id=user.loja_id)
        return qs.none()

    def list(self, request, *args, **kwargs):
        result = []
        for equipe in self.get_queryset():
            data = self.get_serializer(equipe).data
            data['total_vendas'] = reports(request.user).filter(vendedor__equipe=equipe, venda_fechada=True).aggregate(total=Sum('valor_venda'))['total'] or 0
            result.append(data)
        return Response(result)