from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import generics
from .serializers import UserSerializer, VendedorSerializer
from .models import CustomUser

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

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class VendedorListView(generics.ListAPIView):
    """
    Retorna a lista de vendedores ativos que pertencem à mesma loja do usuário autenticado.
    """
    serializer_class = VendedorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Se o usuário não tem loja (ex: um Admin geral)
        if not user.loja:
            if user.cargo == 'ADMIN':
                return CustomUser.objects.filter(cargo='VENDEDOR', is_active=True).order_by('first_name')
            return CustomUser.objects.none()
            
        # Retorna os Vendedores da mesma loja
        return CustomUser.objects.filter(
            cargo='VENDEDOR', 
            loja=user.loja,
            is_active=True
        ).order_by('first_name')