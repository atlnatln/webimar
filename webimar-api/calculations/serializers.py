from rest_framework import serializers
from .models import CalculationHistory

class CalculationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CalculationHistory
        fields = ['id', 'calculation_type', 'parameters', 'result', 'created_at']
