from rest_framework import serializers
from core.models import Loja, Equipe
from users.models import CustomUser
from users.serializers import LojaSerializer, EquipeSerializer


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

        return attrs

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
