from rest_framework import viewsets
from .serializers import UserAdminSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.models import CustomUser
from users.permissions import IsAdmin, IsAdminOrAdminCliente
from core.models import Loja, Equipe, Metrica, Relatorio
from management.serializers import LojaSerializer, EquipeSerializer, MetricaSerializer


class UserViewSet(viewsets.ModelViewSet):
	queryset = CustomUser.objects.all().order_by('id')
	serializer_class = UserAdminSerializer
	permission_classes = [IsAdminOrAdminCliente]
	http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']

	def get_queryset(self):
		user = self.request.user
		queryset = CustomUser.objects.all().order_by('id')

		# ADMIN_CLIENTE: ve apenas usuarios do seu cliente
		if user.cargo == 'ADMIN_CLIENTE' and user.cliente:
			queryset = queryset.filter(cliente=user.cliente)
		# ADMIN: ve tudo

		return queryset

	def perform_create(self, serializer):
		user = self.request.user
		# ADMIN_CLIENTE: forca o cliente do usuario
		if user.cargo == 'ADMIN_CLIENTE' and user.cliente:
			serializer.save(cliente=user.cliente)
		else:
			serializer.save()

class LojaViewSet(viewsets.ModelViewSet):
    queryset = Loja.objects.all().order_by('id')
    serializer_class = LojaSerializer
    permission_classes = [IsAuthenticated, IsAdminOrAdminCliente]

    def get_queryset(self):
        user = self.request.user
        queryset = Loja.objects.all().order_by('id')

        if user.cargo == 'ADMIN_CLIENTE' and user.cliente:
            queryset = queryset.filter(cliente=user.cliente)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if user.cargo == 'ADMIN_CLIENTE' and user.cliente:
            serializer.save(cliente=user.cliente)
        else:
            serializer.save()

    def destroy(self, request, *args, **kwargs):
        loja = self.get_object()
        # Verifica vínculos
        if (CustomUser.objects.filter(loja=loja).exists() or
            Equipe.objects.filter(loja=loja).exists() or
            Metrica.objects.filter(loja=loja).exists() or
            Relatorio.objects.filter(vendedor__loja=loja).exists()):  # atendimentos da loja
            return Response(
                {"detail": "Não é possível excluir porque há registros vinculados (usuários, equipes, métricas ou atendimentos). Desative a loja via campo 'ativo'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

class EquipeViewSet(viewsets.ModelViewSet):
    queryset = Equipe.objects.all().order_by('id')
    serializer_class = EquipeSerializer
    permission_classes = [IsAuthenticated, IsAdminOrAdminCliente]

    def get_queryset(self):
        user = self.request.user
        queryset = Equipe.objects.all().order_by('id')

        if user.cargo == 'ADMIN_CLIENTE' and user.cliente:
            queryset = queryset.filter(loja__cliente=user.cliente)

        return queryset

    def destroy(self, request, *args, **kwargs):
        equipe = self.get_object()
        if CustomUser.objects.filter(equipe=equipe).exists():
            return Response(
                {"detail": "Não é possível excluir porque há usuários vinculados a esta equipe. Desative a equipe via campo 'ativo'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

class MetricaViewSet(viewsets.ModelViewSet):
    queryset = Metrica.objects.all().order_by('id')
    serializer_class = MetricaSerializer
    permission_classes = [IsAuthenticated, IsAdminOrAdminCliente]

    def get_queryset(self):
        user = self.request.user
        queryset = Metrica.objects.all().order_by('id')

        # ADMIN_CLIENTE: ve apenas metricas do seu cliente
        if user.cargo == 'ADMIN_CLIENTE' and user.cliente:
            queryset = queryset.filter(cliente=user.cliente)
        # ADMIN: ve tudo (sem filtro adicional)

        return queryset

    def perform_create(self, serializer):
        # Garante que o cliente seja preenchido se nao veio no payload
        loja = serializer.validated_data.get('loja')
        cliente = serializer.validated_data.get('cliente')
        if not cliente and loja and loja.cliente:
            serializer.save(cliente=loja.cliente)
        elif not cliente:
            user = self.request.user
            serializer.save(cliente=user.cliente)
        else:
            serializer.save()

    def destroy(self, request, *args, **kwargs):
        metrica = self.get_object()
        if Relatorio.objects.filter(metrica=metrica).exists():
            return Response(
                {"detail": "Não é possível excluir porque há atendimentos vinculados a esta métrica. Desative a métrica via campo 'ativo'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)
