from rest_framework import serializers
from core.models import Loja, Equipe
from .models import CustomUser

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str

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


User = get_user_model()

class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer apenas para receber e validar o formato do e-mail de solicitação.
    A checagem de existência será feita na View de forma silenciosa por segurança.
    """
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer para confirmar o reset de senha. 
    Valida o uid, o token e a complexidade da nova senha.
    """
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True, 
        write_only=True, 
        style={'input_type': 'password'}
    )

    def validate_new_password(self, value):
        # Utiliza as validações nativas do Django configuradas no settings.py
        # Passamos o objeto do usuário opcionalmente se conseguirmos decodificá-lo antes,
        # mas como validação de complexidade genérica, rodar apenas o validate_password basta.
        try:
            validate_password(value)
        except Exception as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        uid = attrs.get('uid')
        token = attrs.get('token')

        # 1. Tentar decodificar o UID e buscar o usuário correspondente
        try:
            uid_decoded = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid_decoded)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"detail": "Link de recuperação inválido ou expirado."})

        # 2. Verificar se o token é válido para este usuário específico
        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError({"detail": "Link de recuperação inválido ou expirado."})

        # Salva o usuário encontrado no contexto dos atributos validados para uso na View
        attrs['user'] = user
        return attrs