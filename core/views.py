from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db.models import Q
from .models import Relatorio
from .serializers import RelatorioSerializer
from users.models import CustomUser

class RelatorioViewSet(viewsets.ModelViewSet):
    serializer_class = RelatorioSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Em requisições de detalhe, retornamos a base inteira para que o 
        # NotFound(404) não aconteça antes da nossa validação de permissão(403)
        if getattr(self, 'action', None) != 'list':
            return Relatorio.objects.all()
            
        if user.cargo == 'DISPOSITIVO':
            return Relatorio.objects.none()
        if user.cargo == 'VENDEDOR':
            return Relatorio.objects.filter(vendedor=user)
        if user.cargo == 'SUPERVISOR':
            return Relatorio.objects.filter(vendedor__loja=user.loja)
        if user.cargo == 'ADMIN':
            return Relatorio.objects.all()
        return Relatorio.objects.none()
        
    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        
        if user.cargo == 'ADMIN':
            return obj
        elif user.cargo == 'SUPERVISOR' and obj.vendedor.loja != user.loja:
            raise PermissionDenied("Você não tem permissão para acessar este atendimento.")
        elif user.cargo == 'VENDEDOR' and obj.vendedor != user:
            raise PermissionDenied("Você não tem permissão para acessar este atendimento.")
        elif user.cargo == 'DISPOSITIVO':
            raise PermissionDenied("Você não tem permissão para acessar este atendimento.")
            
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
        
        if cargo == 'ADMIN':
            vendedor_id = self.request.data.get('vendedor')
            if vendedor_id:
                try:
                    vendedor = CustomUser.objects.get(id=vendedor_id, cargo='VENDEDOR')
                except CustomUser.DoesNotExist:
                    raise ValidationError({'vendedor': ['Vendedor inválido.']})
                serializer.save(vendedor=vendedor)
            else:
                serializer.save(vendedor=user)
            return
        
        raise PermissionDenied("Você não tem permissão para criar atendimentos.")
    
    def perform_update(self, serializer):
        user = self.request.user
        # Utiliza a instância que já foi buscada sem consultar o banco denovo
        instance = serializer.instance 
        
        if user.cargo == 'ADMIN' or (user.cargo == 'VENDEDOR' and instance.vendedor == user):
            serializer.save()
        else:
            raise PermissionDenied("Você não tem permissão para editar este atendimento.")
    
    def perform_destroy(self, instance):
        user = self.request.user
        if user.cargo == 'ADMIN' or (user.cargo == 'VENDEDOR' and instance.vendedor == user):
            instance.delete()
        else:
            raise PermissionDenied("Você não tem permissão para excluir este atendimento.")
