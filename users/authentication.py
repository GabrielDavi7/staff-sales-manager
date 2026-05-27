from datetime import timedelta
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

class ExpiringTokenAuthentication(TokenAuthentication):
    """
    Classe de autenticação baseada em Token que expira após 7 dias.
    Se o token tiver mais de 7 dias desde sua criação, a requisição é recusada.
    """

    def authenticate_credentials(self, key):
        # 1. Utiliza o método da classe pai (TokenAuthentication) para buscar o token no banco
        # Se o token não existir ou o usuário estiver inativo, o DRF já lança as exceções nativas.
        user, token = super().authenticate_credentials(key)

        # 2. Calcula a idade do token
        # timezone.now() é ciente de fuso horário (timezone-aware), assim como token.created
        tempo_atual = timezone.now()
        tempo_expiracao = token.created + timedelta(days=7)

        # 3. Verifica se o token já expirou
        if tempo_atual > tempo_expiracao:
            # Lança AuthenticationFailed, que o DRF converte automaticamente em HTTP 401 Unauthorized
            raise AuthenticationFailed("Este token expirou. Por favor, faça login novamente.")

        # Opcional (Sliding Expiration): Se quisesse renovar o token a cada requisição válida,
        # bastaria fazer: token.created = tempo_atual; token.save(). 
        # Como a issue pede expiração rígida de 7 dias a partir do login, mantemos apenas o retorno.

        return user, token