"""
Cria os planos padrão (Free, Basic, Pro, Enterprise) se não existirem.

Uso:
    docker compose -f docker-compose.prod.yml exec backend python manage.py seed_planos
"""
from django.core.management.base import BaseCommand
from gestao.models import Plano

PLANOS_PADRAO = [
    {
        'nome': 'Free',
        'slug': 'free',
        'descricao': 'Plano gratuito para teste.',
        'max_lojas': 1,
        'max_usuarios_total': 5,
        'max_admin_cliente': 1,
        'max_vendedores_por_loja': 3,
        'max_supervisores_por_loja': 1,
        'max_dispositivos_por_loja': 1,
        'max_equipes_por_loja': 2,
        'preco_mensal': 0,
    },
    {
        'nome': 'Basic',
        'slug': 'basic',
        'descricao': 'Ideal para pequenas joalherias.',
        'max_lojas': 3,
        'max_usuarios_total': 20,
        'max_admin_cliente': 1,
        'max_vendedores_por_loja': 5,
        'max_supervisores_por_loja': 1,
        'max_dispositivos_por_loja': 2,
        'max_equipes_por_loja': 3,
        'preco_mensal': 149.00,
    },
    {
        'nome': 'Pro',
        'slug': 'pro',
        'descricao': 'Para redes médias de joalherias.',
        'max_lojas': 10,
        'max_usuarios_total': 80,
        'max_admin_cliente': 1,
        'max_vendedores_por_loja': 10,
        'max_supervisores_por_loja': 2,
        'max_dispositivos_por_loja': 3,
        'max_equipes_por_loja': 5,
        'preco_mensal': 399.00,
    },
    {
        'nome': 'Enterprise',
        'slug': 'enterprise',
        'descricao': 'Grandes redes, acesso ilimitado.',
        'max_lojas': 999,
        'max_usuarios_total': 999,
        'max_admin_cliente': 1,
        'max_vendedores_por_loja': 20,
        'max_supervisores_por_loja': 5,
        'max_dispositivos_por_loja': 5,
        'max_equipes_por_loja': 10,
        'preco_mensal': 899.00,
    },
]


class Command(BaseCommand):
    help = 'Cria os planos padrão (Free, Basic, Pro, Enterprise) se não existirem.'

    def handle(self, *args, **options):
        criados = 0
        for dados in PLANOS_PADRAO:
            _, created = Plano.objects.get_or_create(
                slug=dados['slug'],
                defaults=dados,
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  + {dados["nome"]}'))
                criados += 1
            else:
                self.stdout.write(f'  = {dados["nome"]} (já existia)')

        self.stdout.write(self.style.SUCCESS(
            f'\n{criados} plano(s) criado(s).'
        ))
