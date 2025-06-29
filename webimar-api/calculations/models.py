from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.

class CalculationHistory(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='calculation_histories')
    calculation_type = models.CharField(max_length=100)
    parameters = models.JSONField()
    result = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.calculation_type} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
