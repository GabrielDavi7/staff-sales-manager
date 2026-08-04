"""
Configura o tenant padrão: cria um Cliente e associa todas as lojas e
usuários existentes a ele via UPDATE em massa.

Uso:
    docker compose -f docker-compose.prod.yml exec backend python manage.py m1_setup_tenant
    docker compose -f docker-compose.prod.yml exec backend python manage.py m1_setup_tenant --nome "Joias Oliveira" --slug "joias-oliveira"

O que faz:
    1. Verifica se já existe um Cliente — se sim, aborta (idempotente).
    2. Cria um Cliente (sem plano, para configurar depois, ou com o plano informado).
    3. Atualiza TODAS as lojas: SET cliente_id = <cliente_default>.
    4. Atualiza TODOS os usuários: SET cliente_id = <cliente_default>.
    5. Reporta quantos registros foram atualizados.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from gestao.models import Plano, Cliente
from core.models import Loja
from users.models import CustomUser


class Command(BaseCommand):
    help = 'Setup inicial multi-tenant: cria cliente padrão e backfill de registros existentes.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--nome',
            default='Cliente Padrão',
            help='Nome do cliente padrão (default: "Cliente Padrão").',
        )
        parser.add_argument(
            '--slug',
            default='default',
            help='Slug do cliente padrão (default: "default").',
        )
        parser.add_argument(
            '--email',
            default='admin@exemplo.com',
            help='Email de contato do cliente padrão.',
        )
        parser.add_argument(
            '--plano',
            default=None,
            help='Slug do plano (opcional). Ex: free, basic, pro, enterprise.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Apenas simula, sem escrever no banco.',
        )

    def handle(self, *args, **options):
        nome = options['nome']
        slug = options['slug']
        email = options['email']
        plano_slug = options['plano']
        dry_run = options['dry_run']

        # 1. Resolver plano (opcional)
        plano = None
        if plano_slug:
            try:
                plano = Plano.objects.get(slug=plano_slug)
            except Plano.DoesNotExist:
                self.stderr.write(
                    f'Erro: Plano "{plano_slug}" não encontrado. '
                    f'Execute "python manage.py seed_planos" primeiro '
                    f'ou deixe --plano vazio para criar sem plano.'
                )
                return

        # 2. Idempotência — não recriar se já existir
        if Cliente.objects.filter(slug=slug).exists():
            self.stdout.write(
                self.style.WARNING(
                    f'Cliente com slug "{slug}" já existe. Nada a fazer.'
                )
            )
            return

        # 3. Contar o que será afetado
        lojas_count = Loja.objects.count()
        usuarios_count = CustomUser.objects.count()

        plano_label = plano.nome if plano else '(sem plano — configurar depois)'
        self.stdout.write(f'Plano: {plano_label}')
        self.stdout.write(f'Lojas encontradas:  {lojas_count}')
        self.stdout.write(f'Usuários encontrados: {usuarios_count}')

        if dry_run:
            self.stdout.write(
                self.style.WARNING('[DRY RUN] Nenhuma alteração foi feita.')
            )
            return

        # 4. Executar em uma única transação
        with transaction.atomic():
            cliente = Cliente.objects.create(
                nome=nome,
                slug=slug,
                plano=plano,
                email_contato=email,
                ativo=True,
            )
            self.stdout.write(
                f'Cliente "{cliente.nome}" criado (id={cliente.id}).'
            )

            # 5. Backfill em massa (UPDATE, não loop Python)
            lojas_updated = Loja.objects.all().update(cliente=cliente)
            usuarios_updated = CustomUser.objects.all().update(cliente=cliente)

        self.stdout.write(self.style.SUCCESS(
            f'Backfill concluído: {lojas_updated} loja(s), '
            f'{usuarios_updated} usuário(s) associados ao cliente '
            f'"{cliente.nome}".'
        ))
