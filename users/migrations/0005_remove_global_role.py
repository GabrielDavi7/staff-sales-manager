from django.db import migrations, models


def remove_global_role(apps, schema_editor):
    User = apps.get_model('users', 'CustomUser')
    User.objects.filter(cargo='ADMIN', cliente__isnull=False).update(cargo='ADMIN_CLIENTE')
    User.objects.filter(cargo='ADMIN', cliente__isnull=True).update(cargo='')


class Migration(migrations.Migration):
    dependencies = [('users', '0004_customuser_cliente_alter_customuser_cargo')]
    operations = [
        migrations.RunPython(remove_global_role, migrations.RunPython.noop),
        migrations.AlterField('customuser', 'cargo', models.CharField(blank=True, max_length=15, default='VENDEDOR', choices=[('ADMIN_CLIENTE', 'Administrador do Cliente'), ('SUPERVISOR', 'Supervisor'), ('VENDEDOR', 'Vendedor'), ('DISPOSITIVO', 'Dispositivo')])),
    ]
