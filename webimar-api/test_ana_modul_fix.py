#!/usr/bin/env python
import os
import sys
import django

# Django ayarlarını yükle
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webimar_api.settings')
django.setup()

from calculations.tarimsal_yapilar.ana_modul import genel_vasif_kural_kontrolu
import json

print("=== Ana Modül Fix Testi ===")
print()

# Test verisi - standart arazi bilgileri
arazi_bilgileri = {
    "buyukluk_m2": 2000,
    "ana_vasif": "Tarla"
}

# Test 1: Arıcılık tesisleri
print("TEST 1: Arıcılık tesisleri")
print("-" * 40)
test_yapi_bilgileri_1 = {
    "tur_ad": "Arıcılık tesisleri",
    "kovan_sayisi": 50
}

try:
    result = genel_vasif_kural_kontrolu(arazi_bilgileri, test_yapi_bilgileri_1)
    print("✓ Test başarılı!")
    print(f"İzin Durumu: {result['izin_durumu']}")
    print(f"Mesaj: {result['mesaj']}")
    print(f"Maks. Taban Alanı: {result.get('maksimum_taban_alani', 'N/A')}")
except Exception as e:
    print(f"✗ Test hata: {e}")

print()

# Test 2: Su depolama ve pompaj sistemi
print("TEST 2: Su depolama ve pompaj sistemi")
print("-" * 40)
test_yapi_bilgileri_2 = {
    "tur_ad": "Su depolama ve pompaj sistemi",
    "depo_hacmi_m3": 100
}

try:
    result = genel_vasif_kural_kontrolu(arazi_bilgileri, test_yapi_bilgileri_2)
    print("✓ Test başarılı!")
    print(f"İzin Durumu: {result['izin_durumu']}")
    print(f"Mesaj: {result['mesaj']}")
    print(f"Maks. Taban Alanı: {result.get('maksimum_taban_alani', 'N/A')}")
except Exception as e:
    print(f"✗ Test hata: {e}")

print()

# Test 3: Soğuk hava deposu (kontrol)
print("TEST 3: Soğuk hava deposu (kontrol)")
print("-" * 40)
test_yapi_bilgileri_3 = {
    "tur_ad": "Soğuk hava deposu"
}

try:
    result = genel_vasif_kural_kontrolu(arazi_bilgileri, test_yapi_bilgileri_3)
    print("✓ Test başarılı!")
    print(f"İzin Durumu: {result['izin_durumu']}")
    print(f"Mesaj: {result['mesaj']}")
    print(f"Maks. Taban Alanı: {result.get('maksimum_taban_alani', 'N/A')}")
except Exception as e:
    print(f"✗ Test hata: {e}")

print()

# Test 4: Tarımsal amaçlı depo (kontrol)
print("TEST 4: Tarımsal amaçlı depo (kontrol)")
print("-" * 40)
test_yapi_bilgileri_4 = {
    "tur_ad": "Tarımsal amaçlı depo"
}

try:
    result = genel_vasif_kural_kontrolu(arazi_bilgileri, test_yapi_bilgileri_4)
    print("✓ Test başarılı!")
    print(f"İzin Durumu: {result['izin_durumu']}")
    print(f"Mesaj: {result['mesaj']}")
    print(f"Maks. Taban Alanı: {result.get('maksimum_taban_alani', 'N/A')}")
except Exception as e:
    print(f"✗ Test hata: {e}")

print()
print("=== Test Tamamlandı ===")
