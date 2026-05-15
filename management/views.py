from rest_framework import viewsets
from .serializers import UserAdminSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.models import CustomUser
from users.permissions import IsAdmin
from core.models import Loja, Equipe, Metrica, Relatorio
from management.serializers import LojaSerializer, EquipeSerializer, MetricaSerializer


class UserViewSet(viewsets.ModelViewSet):
	queryset = CustomUser.objects.all().order_by('id')
	serializer_class = UserAdminSerializer
	permission_classes = [IsAdmin]
	http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']

class LojaViewSet(viewsets.ModelViewSet):
    queryset = Loja.objects.all().order_by('id')
    serializer_class = LojaSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

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
    permission_classes = [IsAuthenticated, IsAdmin]

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
    permission_classes = [IsAuthenticated, IsAdmin]

    def destroy(self, request, *args, **kwargs):
        metrica = self.get_object()
        if Relatorio.objects.filter(metrica=metrica).exists():
            return Response(
                {"detail": "Não é possível excluir porque há atendimentos vinculados a esta métrica. Desative a métrica via campo 'ativo'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)
