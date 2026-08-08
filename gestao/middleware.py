"""
Middleware de isolamento multi-cliente.

Responsavel por:
  1. Extrair o cliente a partir do slug na URL (ex: /cris-joias/dashboard)
  2. Detectar cliente por dominio personalizado (request.get_host())
  3. Defesa em profundidade: user.cliente_id (token) vs request.cliente (URL)
  4. Injeta request.cliente para todas as views usarem

Prefixos isentos (nao passam pelo middleware):
  - /api/      — chamadas XHR do frontend
  - /admin/    — Django admin
  - /static/   — arquivos estaticos
  - /media/    — uploads
"""
from django.http import Http404, HttpResponseForbidden
from django.urls import resolve, Resolver404


EXEMPT_PREFIXES = ('/api/', '/admin/', '/static/', '/media/')


class ClienteIsolationMiddleware:
    """Middleware que isola as requisicoes por cliente via slug ou dominio."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path

        # 1. Rotas isentas: API, admin, static, media
        if path.startswith(EXEMPT_PREFIXES):
            return self.get_response(request)

        # 2. Rota raiz — permite passar (frontend faz redirect)
        if path == '/':
            return self.get_response(request)

        # 3. Tenta detectar cliente por dominio personalizado
        cliente = self._get_cliente_por_dominio(request)
        slug = None

        if cliente is None:
            # 4. Extrai slug do primeiro segmento da URL
            slug = self._extrair_slug(path)
            if slug is None:
                # URL sem slug valido (ex: /login sem prefixo)
                # Deixa passar — o frontend/Router que lida
                return self.get_response(request)

            cliente = self._get_cliente_por_slug(slug)
            if cliente is None:
                raise Http404(f'Cliente "{slug}" nao encontrado.')

        # 5. Injeta cliente na request
        request.cliente = cliente

        # 6. Defesa em profundidade: token vs URL
        if hasattr(request, 'user') and request.user.is_authenticated:
            token_cliente_id = getattr(request.user, 'cliente_id', None)
            if token_cliente_id is not None and token_cliente_id != cliente.id:
                return HttpResponseForbidden(
                    'Acesso negado: voce nao pertence a este cliente.'
                )

        return self.get_response(request)

    def _get_cliente_por_dominio(self, request):
        """Busca cliente pelo dominio personalizado configurado."""
        host = request.get_host()
        # Remove porta (ex: localhost:8000 → localhost)
        host = host.split(':')[0]

        from gestao.models import Cliente
        try:
            return Cliente.objects.get(dominio_personalizado__iexact=host, ativo=True)
        except Cliente.DoesNotExist:
            return None

    def _extrair_slug(self, path):
        """Extrai o slug do primeiro segmento da URL. Retorna None se invalido."""
        # Remove barras das pontas e divide
        segments = path.strip('/').split('/')
        if not segments or not segments[0]:
            return None

        candidato = segments[0]

        # Ignora segmentos que claramente nao sao slugs de cliente
        # (rotas conhecidas do frontend sem slug)
        if candidato in ('login', 'favicon.ico', 'robots.txt'):
            return None

        return candidato

    def _get_cliente_por_slug(self, slug):
        """Busca cliente pelo slug."""
        from gestao.models import Cliente
        try:
            return Cliente.objects.get(slug=slug, ativo=True)
        except Cliente.DoesNotExist:
            return None
