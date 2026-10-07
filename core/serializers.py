from rest_framework import serializers
from .models import Relatorio, Metrica, Equipe
from users.models import CustomUser
from django.utils import timezone
from datetime import datetime, timedelta

class MetricaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metrica
        fields = ['id', 'nome', 'descricao', 'loja']
        read_only_fields = ['id']

class RelatorioSerializer(serializers.ModelSerializer):
    pin = serializers.CharField(
        write_only=True,
        required=False,
        max_length=4,
        help_text='PIN do vendedor (obrigatório quando o usuário for DISPOSITIVO)'
    )
    
    class Meta:
        model = Relatorio
        fields = [
            'id',
            'data_hora',
            'venda_fechada',
            'valor_venda',
            'vendedor',
            'metrica',
            'pin',
            'cliente_nome', 
            'observacoes'
        ]
        read_only_fields = ['id']  # 'data_hora' não é mais read_only
        # Tornar vendedor opcional na requisição (será definido pela view)
        extra_kwargs = {
            'vendedor': {'required': False}
        }
    
    def validate_data_hora(self, value):
        """Garante que a data seja o dia atual (permite qualquer horário)"""
        # Usa timezone.localtime() para garantir a extração da data no fuso local configurado (TIME_ZONE)
        hoje = timezone.localtime(timezone.now()).date()
        
        # Garante que a data recebida pelo DRF também seja lida no fuso horário local correto
        if timezone.is_aware(value):
            data_recebida = timezone.localtime(value).date()
        else:
            data_recebida = value.date()
            
        if data_recebida != hoje:
            raise serializers.ValidationError(
                f"A data do atendimento deve ser o dia atual ({hoje})."
            )
        return value
    
    def validate(self, data):
        from users.tenant import require_tenant, sellers
        user = self.context['request'].user
        require_tenant(user)
        pin = data.pop('pin', None)
        if self.instance:
            vendedor = self.instance.vendedor
            if 'vendedor' in data and data['vendedor'].pk != vendedor.pk:
                raise serializers.ValidationError({'vendedor': 'O vendedor do atendimento não pode ser alterado.'})
            loja_id = self.instance.loja_id
        else:
            vendedor = data.get('vendedor')
            if user.cargo == 'VENDEDOR':
                if vendedor and vendedor.pk != user.pk:
                    raise serializers.ValidationError({'vendedor': 'Só é permitido registrar para si mesmo.'})
                vendedor = user
            if not vendedor or not sellers(user).filter(pk=vendedor.pk).exists():
                raise serializers.ValidationError({'vendedor': 'Vendedor não autorizado.'})
            if user.cargo == 'DISPOSITIVO' and (not pin or pin != vendedor.pin):
                raise serializers.ValidationError({'pin': 'PIN inválido.'})
            data['vendedor'] = vendedor
            loja_id = vendedor.loja_id
        metrica = data.get('metrica', getattr(self.instance, 'metrica', None))
        if metrica and (metrica.cliente_id != user.cliente_id or metrica.loja_id not in (None, loja_id)):
            raise serializers.ValidationError({'metrica': 'Métrica não autorizada para esta loja.'})
        if 'metrica' in data and metrica and not metrica.ativo:
            raise serializers.ValidationError({'metrica': 'Métrica inativa.'})
        fechada = data.get('venda_fechada', getattr(self.instance, 'venda_fechada', False))
        valor = data.get('valor_venda', getattr(self.instance, 'valor_venda', None))
        if fechada:
            if valor is None or valor <= 0:
                raise serializers.ValidationError({'valor_venda': 'Informe um valor de venda positivo.'})
            data['metrica'] = None
        else:
            if not metrica:
                raise serializers.ValidationError({'metrica': 'Informe o motivo da não venda.'})
            data['valor_venda'] = None
        return data

    def validate_pin(self, value):
        if value and not value.isdigit():
            raise serializers.ValidationError('PIN deve conter apenas dígitos numéricos.')
        if value and len(value) != 4:
            raise serializers.ValidationError('PIN deve ter exatamente 4 dígitos.')
        return value

    def create(self, validated_data):
        validated_data.pop('pin', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('pin', None)
        return super().update(instance, validated_data)


class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'username']

class EquipeInfoSerializer(serializers.ModelSerializer):
    loja_nome = serializers.CharField(source='loja.nome', read_only=True)
    membros = UserSimpleSerializer(source='get_vendedores', many=True, read_only=True)  # método no modelo
    total_vendas = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = Equipe
        fields = ['id', 'nome', 'loja_id', 'loja_nome', 'membros', 'total_vendas']
