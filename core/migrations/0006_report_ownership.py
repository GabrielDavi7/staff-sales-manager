from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


def backfill(apps, schema_editor):
    Report = apps.get_model('core', 'Relatorio')
    for report in Report.objects.select_related('vendedor__loja').iterator():
        user = report.vendedor
        # Ambiguous legacy rows stay unassigned and invisible to the API.
        if user.cliente_id and user.loja_id and user.loja.cliente_id == user.cliente_id:
            Report.objects.filter(pk=report.pk).update(cliente_id=user.cliente_id, loja_id=user.loja_id)


class Migration(migrations.Migration):
    dependencies = [('core', '0005_loja_cliente_metrica_cliente'), ('users', '0005_remove_global_role')]
    operations = [
        migrations.AddField('relatorio', 'cliente', models.ForeignKey('gestao.Cliente', on_delete=django.db.models.deletion.PROTECT, null=True, blank=True, related_name='atendimentos')),
        migrations.AddField('relatorio', 'loja', models.ForeignKey('core.Loja', on_delete=django.db.models.deletion.PROTECT, null=True, blank=True, related_name='atendimentos')),
        migrations.AlterField('relatorio', 'vendedor', models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=django.db.models.deletion.PROTECT, related_name='atendimentos')),
        migrations.RunPython(backfill, migrations.RunPython.noop),
    ]
