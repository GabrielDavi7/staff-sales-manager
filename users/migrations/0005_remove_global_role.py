from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('users', '0004_customuser_cliente_alter_customuser_cargo')]
    operations = [
        migrations.AlterField('customuser', 'cargo', models.CharField(blank=True, max_length=15, default='VENDEDOR', choices=[('ADMIN', 'Administrador do Cliente'), ('SUPERVISOR', 'Supervisor'), ('VENDEDOR', 'Vendedor'), ('DISPOSITIVO', 'Dispositivo')])),
    ]
