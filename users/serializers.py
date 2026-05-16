from rest_framework import serializers
from core.models import Loja, Equipe
from .models import CustomUser

class LojaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loja
        fields = ['id', 'nome']  # só id e nome, cidade não é necessário aqui

class EquipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipe
        fields = ['id', 'nome']

class UserSerializer(serializers.ModelSerializer):
    loja = LojaSerializer(read_only=True)
    equipe = EquipeSerializer(read_only=True)

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
        ]


class VendedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'username', 'equipe']


class UserUpdateSerializer(serializers.ModelSerializer):
    current_password = serializers.CharField(write_only=True, required=False, allow_blank=False)
    new_password = serializers.CharField(write_only=True, required=False, allow_blank=False)
    pin = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = [
            'first_name',
            'last_name',
            'email',
            'pin',
            'current_password',
            'new_password',
        ]

    def validate_email(self, value):
        user = self.instance
        if user and value != user.email:
            if CustomUser.objects.filter(email=value).exclude(id=user.id).exists():
                raise serializers.ValidationError('Este e-mail ja esta em uso.')
        return value

    def validate_pin(self, value):
        if value in (None, ''):
            return None
        if len(value) != 4 or not value.isdigit():
            raise serializers.ValidationError('PIN deve ter exatamente 4 digitos numericos.')
        return value

    def validate(self, attrs):
        user = self.instance
        if not user:
            return attrs

        pin = attrs.get('pin', None)
        if pin is not None and user.cargo != 'VENDEDOR':
            raise serializers.ValidationError({'pin': 'Somente vendedores podem atualizar o PIN.'})

        if user.cargo == 'VENDEDOR':
            pin_effective = pin if 'pin' in attrs else user.pin
            if not pin_effective:
                raise serializers.ValidationError({'pin': 'PIN e obrigatorio para vendedores.'})

        new_password = attrs.get('new_password')
        current_password = attrs.get('current_password')
        if new_password:
            if not current_password:
                raise serializers.ValidationError({'current_password': 'Senha atual e obrigatoria.'})
            if not user.check_password(current_password):
                raise serializers.ValidationError({'current_password': 'Senha atual incorreta.'})

        return attrs

    def update(self, instance, validated_data):
        validated_data.pop('current_password', None)
        new_password = validated_data.pop('new_password', None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        if new_password:
            instance.set_password(new_password)

        instance.save()
        return instance
