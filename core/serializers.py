from rest_framework import serializers
from .models import Relatorio, Metrica
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
        """
        Validações de negócio:
        - Se venda_fechada=True → valor_venda obrigatório, metrica deve ser None.
        - Se venda_fechada=False → metrica obrigatória, valor_venda deve ser None.
        """
        data.pop('pin', None)
        venda_fechada = data.get('venda_fechada')
        valor_venda = data.get('valor_venda')
        metrica = data.get('metrica')
        
        if venda_fechada:
            if not valor_venda:
                raise serializers.ValidationError({
                    'valor_venda': 'O valor da venda é obrigatório quando a venda é fechada.'
                })
            if metrica:
                data['metrica'] = None
        else:
            if not metrica:
                raise serializers.ValidationError({
                    'metrica': 'É necessário informar o motivo (métrica) para atendimentos não concretizados.'
                })
            if valor_venda:
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
