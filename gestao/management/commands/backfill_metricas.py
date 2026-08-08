"""
Preenche o campo `cliente` nas metricas existentes.

Logica:
    - Metrica com loja vinculada: herda cliente da loja (metrica.loja.cliente)
    - Metrica sem loja (antiga "global"): atribui ao Cliente Padrao (default)

Uso:
    docker compose exec backend python manage.py backfill_metricas
    docker compose exec backend python manage.py backfill_metricas --cliente-slug joias-oliveira
    docker compose exec backend python manage.py backfill_metricas --dry-run
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from core.models import Metrica
from gestao.models import Cliente


class Command(BaseCommand):
    help = 'Backfill: preenche metrica.cliente para metricas existentes.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--cliente-slug',
            default='default',
            help='Slug do cliente padrao para metricas sem loja (default: "default").',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Apenas simula, sem escrever no banco.',
        )

    def handle(self, *args, **options):
        cliente_slug = options['cliente_slug']
        dry_run = options['dry_run']

        # Resolve o cliente padrao para metricas sem loja
        try:
            cliente_padrao = Cliente.objects.get(slug=cliente_slug)
        except Cliente.DoesNotExist:
            self.stderr.write(
                f'Erro: Cliente com slug "{cliente_slug}" nao encontrado. '
                f'Execute "python manage.py m1_setup_tenant" primeiro '
                f'ou informe um slug valido com --cliente-slug.'
            )
            return

        # Metricas com loja: herdam cliente da loja
        com_loja = Metrica.objects.filter(
            cliente__isnull=True,
            loja__isnull=False,
        ).select_related('loja__cliente')

        # Metricas sem loja (antigas globais): vao para o cliente padrao
        sem_loja = Metrica.objects.filter(
            cliente__isnull=True,
            loja__isnull=True,
        )

        total = com_loja.count() + sem_loja.count()
        self.stdout.write(f'Metricas a processar: {total}')
        self.stdout.write(f'  Com loja vinculada: {com_loja.count()}')
        self.stdout.write(f'  Sem loja (globais → "{cliente_padrao.nome}"): {sem_loja.count()}')

        if total == 0:
            self.stdout.write(self.style.SUCCESS('Nada a fazer — todas as metricas ja tem cliente.'))
            return

        if dry_run:
            self.stdout.write(self.style.WARNING('[DRY RUN] Nenhuma alteracao foi feita.'))
            return

        atualizadas = 0
        puladas = 0

        with transaction.atomic():
            # 1. Metricas com loja
            for metrica in com_loja:
                loja_cliente = metrica.loja.cliente
                if loja_cliente:
                    metrica.cliente = loja_cliente
                    metrica.save(update_fields=['cliente'])
                    atualizadas += 1
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'  ⚠ Metrica #{metrica.id} "{metrica.nome}": '
                            f'loja "{metrica.loja.nome}" nao tem cliente. '
                            f'Atribuindo ao cliente padrao.'
                        )
                    )
                    metrica.cliente = cliente_padrao
                    metrica.save(update_fields=['cliente'])
                    atualizadas += 1

            # 2. Metricas sem loja (globais)
            for metrica in sem_loja:
                metrica.cliente = cliente_padrao
                metrica.save(update_fields=['cliente'])
                atualizadas += 1

        self.stdout.write(self.style.SUCCESS(
            f'Backfill concluido: {atualizadas} metrica(s) atualizada(s), '
            f'{puladas} pulada(s).'
        ))
