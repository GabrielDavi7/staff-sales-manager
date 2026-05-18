from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import generics
from .models import CustomUser
from .serializers import UserSerializer, UserUpdateSerializer, VendedorSerializer
from rest_framework.authentication import TokenAuthentication
from rest_framework import status

class CustomLoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def _filtered_update_data(self, data):
        allowed_fields = {
            'first_name',
            'last_name',
            'email',
            'pin',
            'current_password',
            'new_password',
        }
        return {key: value for key, value in data.items() if key in allowed_fields}

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        filtered_data = self._filtered_update_data(request.data)
        serializer = UserUpdateSerializer(instance=request.user, data=filtered_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        filtered_data = self._filtered_update_data(request.data)
        serializer = UserUpdateSerializer(
            instance=request.user,
            data=filtered_data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class VendedorListView(generics.ListAPIView):
    """
    Retorna a lista de vendedores ativos com base no cargo:
    - ADMIN: Pode ver todos e filtrar por loja_id.
    - SUPERVISOR/VENDEDOR: Vê apenas os vendedores da própria loja.
    """
    serializer_class = VendedorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        loja_id = self.request.query_params.get('loja_id')

        # ADMIN: Vê todos os vendedores, podendo filtrar por loja específica
        if user.cargo == 'ADMIN':
            queryset = CustomUser.objects.filter(cargo='VENDEDOR', is_active=True)

            # Aplica o filtro se o Admin escolheu uma loja no select
            if loja_id:
                queryset = queryset.filter(loja_id=loja_id)

            return queryset.order_by('first_name')

        # SUPERVISOR ou VENDEDOR: Vê apenas os vendedores da mesma loja (sua equipe)
        if user.loja:
            return CustomUser.objects.filter(
                cargo='VENDEDOR',
                loja=user.loja,
                is_active=True,
            ).order_by('first_name')

        # Se não for ADMIN e não tiver loja vinculada, não retorna nada por segurança
        return CustomUser.objects.none()

class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # request.user é o usuário autenticado; request.auth é o objeto Token
        token = request.auth
        if token:
            token.delete()
            return Response({"detail": "Logout realizado com sucesso."}, status=status.HTTP_200_OK)
        return Response({"detail": "Token inválido."}, status=status.HTTP_400_BAD_REQUEST)
