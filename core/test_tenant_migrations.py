import pytest
from django.db import connection
from django.db.migrations.executor import MigrationExecutor


@pytest.mark.django_db(transaction=True)
def test_migration_preserves_ids_and_assigns_only_unambiguous_history():
    before = [('core', '0005_loja_cliente_metrica_cliente'), ('users', '0004_customuser_cliente_alter_customuser_cargo')]
    executor = MigrationExecutor(connection)
    latest = executor.loader.graph.leaf_nodes()
    try:
        executor.migrate(before)
        apps = executor.loader.project_state(before).apps
        Tenant = apps.get_model('gestao', 'Cliente')
        Store = apps.get_model('core', 'Loja')
        User = apps.get_model('users', 'CustomUser')
        Report = apps.get_model('core', 'Relatorio')
        tenant = Tenant.objects.create(nome='Migration', slug='migration', email_contato='migration@example.com')
        store = Store.objects.create(nome='Store', cidade='City', cliente=tenant)
        admin = User.objects.create(username='legacy-admin', email='legacy@example.com', cargo='ADMIN', cliente=tenant)
        root = User.objects.create(username='root', email='root@example.com', cargo='ADMIN', is_staff=True, is_superuser=True)
        seller = User.objects.create(username='seller', email='seller@example.com', cargo='VENDEDOR', cliente=tenant, loja=store)
        report = Report.objects.create(vendedor=seller, venda_fechada=True, valor_venda=123)
        ambiguous = Report.objects.create(vendedor=root, venda_fechada=True, valor_venda=10)
        executor = MigrationExecutor(connection)
        executor.migrate(latest)
        apps = executor.loader.project_state(latest).apps
        User = apps.get_model('users', 'CustomUser'); Report = apps.get_model('core', 'Relatorio')
        assert User.objects.get(pk=admin.pk).cargo == 'ADMIN_CLIENTE'
        assert User.objects.get(pk=root.pk).cargo == ''
        assert User.objects.get(pk=root.pk).is_superuser
        saved = Report.objects.get(pk=report.pk)
        assert (saved.cliente_id, saved.loja_id, saved.vendedor_id, saved.valor_venda) == (tenant.pk, store.pk, seller.pk, 123)
        assert Report.objects.get(pk=ambiguous.pk).cliente_id is None
    finally:
        MigrationExecutor(connection).migrate(latest)
