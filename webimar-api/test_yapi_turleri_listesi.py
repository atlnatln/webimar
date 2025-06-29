#!/usr/bin/env python
import os
import sys
import django

# Django ayarlarını yükle
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webimar_api.settings')
django.setup()

from calculations.tarimsal_yapilar.constants import GENEL_YAPI_TURLERI_LISTESI

print("=== GENEL_YAPI_TURLERI_LISTESI Debug ===")
print()

test_yapi_turleri = [
    "Arıcılık tesisleri",
    "Su depolama ve pompaj sistemi", 
    "Soğuk hava deposu",
    "Tarımsal amaçlı depo"
]

print("GENEL_YAPI_TURLERI_LISTESI içeriği:")
for i, yapi in enumerate(GENEL_YAPI_TURLERI_LISTESI, 1):
    print(f"{i:2d}. {yapi}")

print()
print("Test yapı türleri kontrol:")
for yapi in test_yapi_turleri:
    varmi = yapi in GENEL_YAPI_TURLERI_LISTESI
    status = "✅ VAR" if varmi else "❌ YOK"
    print(f"{status}: {yapi}")

print()
print("=== Test Tamamlandı ===")
