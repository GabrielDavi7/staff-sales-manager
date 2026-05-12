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