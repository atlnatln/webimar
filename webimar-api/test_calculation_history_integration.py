from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from calculations.models import CalculationHistory

class CalculationHistoryIntegrationTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = get_user_model().objects.create_user(username='testuser', password='testpass123')

    def test_calculation_creates_history(self):
        # Login ve token alma
        response = self.client.post('/api/token/', {'username': 'testuser', 'password': 'testpass123'}, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        access = response.json().get('access')
        self.assertIsNotNone(access)
        # Hara hesaplaması yap
        self.client.defaults['HTTP_AUTHORIZATION'] = f'Bearer {access}'
        calc_data = {'alan_m2': 1000, 'emsal_orani': 0.2}
        response = self.client.post('/api/calculations/hara/', calc_data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        # Geçmiş sorgula
        response = self.client.get('/api/calculations/history/')
        self.assertEqual(response.status_code, 200)
        data = response.json().get('data')
        self.assertTrue(data, 'CalculationHistory kaydı oluşmadı!')
        self.assertEqual(CalculationHistory.objects.count(), 1)
