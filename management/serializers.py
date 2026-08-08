from rest_framework import serializers
from core.models import Loja, Equipe
from users.models import CustomUser
from users.serializers import LojaSerializer, EquipeSerializer
from gestao.models import Plano, Cliente


class UserAdminSerializer(serializers.ModelSerializer):
    loja = serializers.PrimaryKeyRelatedField(
        queryset=Loja.objects.all(),
        allow_null=True,
        required=False,
    )
    equipe = serializers.PrimaryKeyRelatedField(
        queryset=Equipe.objects.all(),
        allow_null=True,
        required=False,
    )
    password = serializers.CharField(write_only=True, required=False)
    pin = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'cargo',
            'loja',
            'equipe',
            'is_active',
            'pin',
            'password',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['loja'] = LojaSerializer(instance.loja).data if instance.loja else None
        data['equipe'] = EquipeSerializer(instance.equipe).data if instance.equipe else None
        return data

    def validate_pin(self, value):
        if value in (None, ''):
            return None
        if len(value) != 4 or not value.isdigit():
            raise serializers.ValidationError('PIN deve ter exatamente 4 digitos numericos.')
        return value

    def validate(self, attrs):
        cargo = attrs.get('cargo')
        if self.instance:
            cargo = cargo or self.instance.cargo

        pin = attrs.get('pin')
        if self.instance and pin is None:
            pin = self.instance.pin

        if cargo == 'VENDEDOR' and not pin:
            raise serializers.ValidationError({'pin': 'PIN e obrigatorio para vendedores.'})

        if not self.instance and not attrs.get('password'):
            raise serializers.ValidationError({'password': 'Senha e obrigatoria.'})

        # --- M2: Validacoes de limites do plano ---
        # So validamos na criacao (self.instance e None)
        if not self.instance:
            self._validate_plan_limits(attrs, cargo)

        return attrs

    def _validate_plan_limits(self, attrs, cargo):
        """Valida os limites do plano ao criar usuarios."""
        loja = attrs.get('loja')
        if loja is None:
            return

        cliente = loja.cliente if hasattr(loja, 'cliente') else None
        if cliente is None or cliente.plano is None:
            return

        plano = cliente.plano

        # 2.2: max_admin_cliente
        if cargo == 'ADMIN_CLIENTE':
            admins_existentes = CustomUser.objects.filter(
                cliente=cliente,
                cargo='ADMIN_CLIENTE',
                is_active=True,
            ).count()
            if admins_existentes >= plano.max_admin_cliente:
                raise serializers.ValidationError(
                    f'Este cliente ja possui {admins_existentes} administrador(es). '
                    f'O plano {plano.nome} permite no maximo {plano.max_admin_cliente}.'
                )

        # 2.3: max_vendedores_por_loja
        if cargo == 'VENDEDOR':
            vendedores_loja = CustomUser.objects.filter(
                loja=loja,
                cargo='VENDEDOR',
                is_active=True,
            ).count()
            if vendedores_loja >= plano.max_vendedores_por_loja:
                raise serializers.ValidationError(
                    f'Esta loja ja possui {vendedores_loja} vendedor(es). '
                    f'O plano {plano.nome} permite no maximo {plano.max_vendedores_por_loja} vendedor(es) por loja.'
                )

        # 2.4: max_supervisores_por_loja
        if cargo == 'SUPERVISOR':
            supervisores_loja = CustomUser.objects.filter(
                loja=loja,
                cargo='SUPERVISOR',
                is_active=True,
            ).count()
            if supervisores_loja >= plano.max_supervisores_por_loja:
                raise serializers.ValidationError(
                    f'Esta loja ja possui {supervisores_loja} supervisor(es). '
                    f'O plano {plano.nome} permite no maximo {plano.max_supervisores_por_loja} supervisor(es) por loja.'
                )

        # 2.5: max_dispositivos_por_loja
        if cargo == 'DISPOSITIVO':
            dispositivos_loja = CustomUser.objects.filter(
                loja=loja,
                cargo='DISPOSITIVO',
                is_active=True,
            ).count()
            if dispositivos_loja >= plano.max_dispositivos_por_loja:
                raise serializers.ValidationError(
                    f'Esta loja ja possui {dispositivos_loja} dispositivo(s). '
                    f'O plano {plano.nome} permite no maximo {plano.max_dispositivos_por_loja} dispositivo(s) por loja.'
                )

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()
        return instance

# management/serializers.py
from rest_framework import serializers
from core.models import Loja, Equipe, Metrica
from gestao.models import Cliente


class LojaSerializer(serializers.ModelSerializer):
    cliente = serializers.PrimaryKeyRelatedField(
        queryset=Cliente.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = Loja
        fields = ['id', 'nome', 'cidade', 'ativo', 'cliente']

    def validate(self, attrs):
        # 2.1: max_lojas — validar apenas na criacao
        if self.instance:
            return attrs

        cliente = attrs.get('cliente')
        if not cliente:
            user = self.context['request'].user
            cliente = user.cliente

        if cliente and cliente.plano:
            lojas_ativas = Loja.objects.filter(
                cliente=cliente,
                ativo=True,
            ).count()
            if lojas_ativas >= cliente.plano.max_lojas:
                raise serializers.ValidationError(
                    f'Seu plano ({cliente.plano.nome}) permite no maximo '
                    f'{cliente.plano.max_lojas} loja(s). '
                    f'Voce ja possui {lojas_ativas} loja(s) ativa(s).'
                )

        return attrs


class EquipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipe
        fields = ['id', 'nome', 'loja', 'ativo']

    def validate(self, attrs):
        # 2.6: max_equipes_por_loja — validar apenas na criacao
        if self.instance:
            return attrs

        loja = attrs.get('loja')
        if loja is None:
            return attrs

        cliente = loja.cliente if hasattr(loja, 'cliente') else None
        if cliente is None or cliente.plano is None:
            return attrs

        equipes_ativas = Equipe.objects.filter(
            loja=loja,
            ativo=True,
        ).count()
        if equipes_ativas >= cliente.plano.max_equipes_por_loja:
            raise serializers.ValidationError(
                f'Esta loja ja possui {equipes_ativas} equipe(s) ativa(s). '
                f'O plano {cliente.plano.nome} permite no maximo '
                f'{cliente.plano.max_equipes_por_loja} equipe(s) por loja.'
            )

        return attrs

class MetricaSerializer(serializers.ModelSerializer):
    cliente = serializers.PrimaryKeyRelatedField(
        queryset=Cliente.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )

    class Meta:
        model = Metrica
        fields = ['id', 'nome', 'descricao', 'loja', 'cliente', 'ativo']

    def create(self, validated_data):
        # Auto-preenche cliente a partir da loja ou do usuario
        if not validated_data.get('cliente'):
            loja = validated_data.get('loja')
            if loja and loja.cliente:
                validated_data['cliente'] = loja.cliente
            else:
                user = self.context['request'].user
                if user.cliente:
                    validated_data['cliente'] = user.cliente
        return super().create(validated_data)
