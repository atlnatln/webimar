#!/usr/bin/env python
import os
import sys
import django

# Django ayarlarını yükle
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webimar_api.settings')
django.setup()

from calculations.tarimsal_yapilar.su_depolama import su_depolama_degerlendir
import json

print("=== Su Depolama Testi ===")

# Test 1: Normal arazi (1000 m²)
test_data_1 = {'alan': 1000}
print(f"Test 1 - Normal arazi: {test_data_1}")
try:
    result = su_depolama_degerlendir(test_data_1)
    print("✓ Test 1 başarılı!")
    print(f"Sonuç: {result['izin_durumu']}")
    print(f"Teknik bina: {result.get('teknik_bina_alani_m2', 0):.1f} m²")
    print(f"Emsal kullanımı: {result.get('emsal_kullanim_orani', 0):.1f}%")
except Exception as e:
    print(f"✗ Test 1 hata: {e}")

print()

# Test 2: Küçük arazi (400 m²) - minimum altında
test_data_2 = {'alan': 400}
print(f"Test 2 - Küçük arazi: {test_data_2}")
try:
    result = su_depolama_degerlendir(test_data_2)
    print("✓ Test 2 başarılı!")
    print(f"Sonuç: {result['izin_durumu']}")
except Exception as e:
    print(f"✗ Test 2 hata: {e}")

print()

# Test 3: Büyük arazi (5000 m²)
test_data_3 = {'alan': 5000}
print(f"Test 3 - Büyük arazi: {test_data_3}")
try:
    result = su_depolama_degerlendir(test_data_3)
    print("✓ Test 3 başarılı!")
    print(f"Sonuç: {result['izin_durumu']}")
    print(f"Maksimum emsal: {result.get('maksimum_emsal_alani_m2', 0):.1f} m²")
    print(f"Kalan emsal hakkı: {result.get('kalan_emsal_hakki_m2', 0):.1f} m²")
except Exception as e:
    print(f"✗ Test 3 hata: {e}")

print("\n=== API Test ===")
# API endpoint testi
import requests

url = 'http://localhost:8000/api/calculations/su-depolama/'
test_data = {'alan': 1000}

try:
    response = requests.post(url, json=test_data, timeout=5)
    print(f"HTTP Status: {response.status_code}")
    if response.status_code == 200:
        api_result = response.json()
        print("✓ API endpoint başarılı!")
        print(f"API Response: {api_result['message']}")
    else:
        print(f"✗ API hata: {response.text}")
except requests.exceptions.RequestException as e:
    print(f"✗ API bağlantı hatası: {e}")

print("\n=== Test Tamamlandı ===")
