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

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.template.loader import render_to_string # Opcional, caso queira HTML no futuro
from rest_framework.permissions import AllowAny

from .serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer

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

User = get_user_model()

class PasswordResetRequestView(APIView):
    """
    Endpoint para solicitar a recuperação de senha.
    Recebe o e-mail e envia um link com UID e Token para redefinição.
    """
    permission_classes = [AllowAny] # Aberto ao público

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        # Busca silenciosa: Filtra apenas por usuários ativos
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        
        if user:
            # Geração dos tokens criptográficos nativos do Django
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            
            # Montagem da URL apontando para o Frontend (Vite roda na porta 5173 por padrão)
            # Em produção, essa URL base idealmente viria de uma variável de ambiente.
            reset_url = f"http://localhost:5173/nova-senha/{uid}/{token}"
            
            # Corpo do e-mail em texto puro
            subject = "Recuperação de Senha - Staff Sales Manager"
            message = (
                f"Olá, {user.first_name or user.username}.\n\n"
                f"Recebemos uma solicitação para redefinir a senha da sua conta no Staff Sales Manager.\n"
                f"Para escolher uma nova senha, clique no link abaixo:\n\n"
                f"{reset_url}\n\n"
                f"Se você não realizou essa solicitação, ignore este e-mail. O link é válido por tempo limitado."
            )
            
            # Disparo do e-mail
            send_mail(
                subject=subject,
                message=message,
                from_email=None, # Usa o DEFAULT_FROM_EMAIL do settings
                recipient_list=[user.email],
                fail_silently=False,
            )

        # Resposta genérica de sucesso (independente de ter encontrado o usuário ou não)
        return Response(
            {"detail": "Se o e-mail informado estiver cadastrado e ativo, um link de recuperação será enviado."},
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(APIView):
    """
    Endpoint para confirmação do reset de senha.
    Recebe uid, token e new_password, valida e altera as credenciais do usuário.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # O serializer validou tudo e nos entregou o objeto 'user' mastigado
        user = serializer.validated_data['user']
        new_password = serializer.validated_data['new_password']
        
        # Define a nova senha aplicando o hash seguro (PBKDF2 por padrão no Django)
        user.set_password(new_password)
        user.save()
        
        return Response(
            {"detail": "Senha redefinida com sucesso. Agora você já pode fazer login com as novas credenciais."},
            status=status.HTTP_200_OK
        )


class CustomObtainAuthToken(ObtainAuthToken):
    """
    View de login customizada.
    Garante que se o usuário já tiver um token antigo (expirado ou perto de expirar), 
    ele seja deletado e um novo com a data de criação atualizada seja gerado.
    """
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # 🚨 ESTRATÉGIA DE RENOVAÇÃO DE TOKEN:
        # Busca se o usuário já possui um token gerado anteriormente e o deleta
        Token.objects.filter(user=user).delete()
        
        # Cria um token novinho em folha (com created = timezone.now() automático)
        token = Token.objects.create(user=user)
        
        # Retorna o token + dados do usuário conforme o escopo do projeto
        return Response({
            'token': token.key,
            'user': {
                'id': user.pk,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'cargo': user.cargo,
                'loja': user.loja.id if user.loja else None,
                'equipe': user.equipe.id if user.equipe else None,
            }
        }, status=status.HTTP_200_OK)