from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db.models import Q, Sum
from .models import Relatorio, Metrica, Loja, Equipe
from .serializers import RelatorioSerializer, MetricaSerializer, EquipeInfoSerializer
from users.models import CustomUser
from users.serializers import LojaSerializer

class LojaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Loja.objects.filter(ativo=True).order_by('nome')
    serializer_class = LojaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Loja.objects.filter(ativo=True).order_by('nome')

        if user.cargo == 'ADMIN_CLIENTE' and user.cliente:
            queryset = queryset.filter(cliente=user.cliente)

        return queryset

class MetricaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Fornece apenas leitura para as metricas.
    Filtra por cliente: metricas da loja do usuario OU metricas
    marcadas como 'todas as lojas' (loja__isnull) do mesmo cliente.
    """
    serializer_class = MetricaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Metrica.objects.filter(ativo=True)

        # Filtro base por cliente (isolamento multi-tenant)
        if user.cliente:
            queryset = queryset.filter(cliente=user.cliente)
        else:
            # ADMIN sem cliente vinculado: permite ver metricas
            # de qualquer cliente (comportamento legado seguro)
            pass

        # Metricas da loja do usuario OU metricas "todas as lojas" do cliente
        if user.loja:
            return queryset.filter(
                Q(loja=user.loja) | Q(loja__isnull=True)
            ).order_by('nome')
        else:
            # Usuario sem loja (ex: ADMIN, ADMIN_CLIENTE): 
            # ve metricas de loja especifica OU todas as lojas
            return queryset.order_by('nome')

class RelatorioViewSet(viewsets.ModelViewSet):
    serializer_class = RelatorioSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Em requisições de detalhe, retornamos a base inteira para que o 
        # NotFound(404) não aconteça antes da nossa validação de permissão(403)
        if getattr(self, 'action', None) != 'list':
            return Relatorio.objects.all().order_by('-data_hora', '-id')
            
        if user.cargo == 'DISPOSITIVO':
            return Relatorio.objects.none()
        if user.cargo == 'VENDEDOR':
            return Relatorio.objects.filter(vendedor=user).order_by('-data_hora', '-id')
        if user.cargo == 'SUPERVISOR':
            return Relatorio.objects.filter(vendedor__loja=user.loja).order_by('-data_hora', '-id')
        if user.cargo == 'ADMIN_CLIENTE':
            return Relatorio.objects.filter(
                vendedor__loja__cliente=user.cliente
            ).order_by('-data_hora', '-id')
        if user.cargo == 'ADMIN':
            return Relatorio.objects.all().order_by('-data_hora', '-id')
        return Relatorio.objects.none()
        
    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        
        if user.cargo == 'ADMIN' or user.cargo == 'ADMIN_CLIENTE':
            return obj
        elif user.cargo == 'SUPERVISOR' and obj.vendedor.loja != user.loja:
            raise PermissionDenied("Voce nao tem permissao para acessar este atendimento.")
        elif user.cargo == 'VENDEDOR' and obj.vendedor != user:
            raise PermissionDenied("Voce nao tem permissao para acessar este atendimento.")
        elif user.cargo == 'DISPOSITIVO':
            raise PermissionDenied("Voce nao tem permissao para acessar este atendimento.")
        elif user.cargo == 'ADMIN_CLIENTE':
            if obj.vendedor.loja.cliente != user.cliente:
                raise PermissionDenied("Voce nao tem permissao para acessar este atendimento.")
            
        return obj
    
    def perform_create(self, serializer):
        user = self.request.user
        cargo = user.cargo
        
        if cargo == 'SUPERVISOR':
            raise PermissionDenied("Supervisores não podem registrar atendimentos.")
        
        if cargo == 'VENDEDOR':
            # Vendedor só pode criar para si mesmo
            serializer.save(vendedor=user)
            return
        
        if cargo == 'DISPOSITIVO':
            vendedor_id = self.request.data.get('vendedor')
            if not vendedor_id:
                raise ValidationError({'vendedor': ['Campo vendedor é obrigatório para dispositivo.']})
            
            try:
                vendedor = CustomUser.objects.get(id=vendedor_id, cargo='VENDEDOR')
            except CustomUser.DoesNotExist:
                raise ValidationError({'vendedor': ['Vendedor inválido ou não encontrado.']})
            
            if vendedor.loja != user.loja:
                raise ValidationError({'vendedor': ['Este vendedor não pertence à sua loja.']})
            
            pin_enviado = self.request.data.get('pin')
            if not pin_enviado:
                raise ValidationError({'pin': ['PIN do vendedor é obrigatório.']})
            if vendedor.pin != pin_enviado:
                raise ValidationError({'pin': ['PIN inválido.']})
            
            serializer.save(vendedor=vendedor)
            return
        
        if cargo == 'ADMIN' or cargo == 'ADMIN_CLIENTE':
            vendedor_id = self.request.data.get('vendedor')
            if vendedor_id:
                try:
                    vendedor = CustomUser.objects.get(id=vendedor_id, cargo='VENDEDOR')
                except CustomUser.DoesNotExist:
                    raise ValidationError({'vendedor': ['Vendedor invalido.']})
                serializer.save(vendedor=vendedor)
            else:
                serializer.save(vendedor=user)
            return
        
        raise PermissionDenied("Você não tem permissão para criar atendimentos.")
    
    def perform_update(self, serializer):
        user = self.request.user
        # Utiliza a instância que já foi buscada sem consultar o banco denovo
        instance = serializer.instance 
        
        if user.cargo in ('ADMIN', 'ADMIN_CLIENTE') or (user.cargo == 'VENDEDOR' and instance.vendedor == user):
            serializer.save()
        else:
            raise PermissionDenied("Voce nao tem permissao para editar este atendimento.")
    
    def perform_destroy(self, instance):
        user = self.request.user
        if user.cargo in ('ADMIN', 'ADMIN_CLIENTE') or (user.cargo == 'VENDEDOR' and instance.vendedor == user):
            instance.delete()
        else:
            raise PermissionDenied("Voce nao tem permissao para excluir este atendimento.")

class EquipeInfoViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EquipeInfoSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Equipe.objects.filter(ativo=True)  # apenas equipes ativas

        if user.cargo == 'ADMIN':
            return queryset
        elif user.cargo == 'ADMIN_CLIENTE':
            if user.cliente:
                return queryset.filter(loja__cliente=user.cliente)
            return queryset
        elif user.cargo == 'SUPERVISOR':
            # Supervisor vê apenas a equipe que ele supervisiona (campo user.equipe)
            if user.equipe:
                return Equipe.objects.filter(id=user.equipe.id, ativo=True)
            return Equipe.objects.none()
        elif user.cargo == 'VENDEDOR':
            # Vendedor vê apenas sua própria equipe
            if not user.equipe:
                return Equipe.objects.none()
            return queryset.filter(id=user.equipe.id)
        else:
            # DISPOSITIVO ou outros
            return Equipe.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        # Para cada equipe, anexar o total_vendas (soma dos valor_venda dos relatórios fechados)
        result = []
        for equipe in queryset:
            total = Relatorio.objects.filter(
                vendedor__equipe=equipe,
                venda_fechada=True
            ).aggregate(total=Sum('valor_venda'))['total'] or 0
            serializer = self.get_serializer(equipe)
            data = serializer.data
            data['total_vendas'] = total
            result.append(data)
        return Response(result)
