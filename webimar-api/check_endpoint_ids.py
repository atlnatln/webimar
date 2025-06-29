#!/usr/bin/env python3
"""
Views.py dosyasındaki endpoint'lerin ID'lerini kontrol et
"""

import re

def extract_endpoint_ids():
    """Views.py dosyasından endpoint'lerin ID'lerini çıkar"""
    with open('calculations/views.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Function definitions ve docstring'leri bul
    pattern = r'def (calculate_\w+)\(request\):\s*"""([^"]+)"""'
    matches = re.findall(pattern, content, re.MULTILINE | re.DOTALL)
    
    endpoints = {}
    for func_name, docstring in matches:
        # ID'yi docstring'den çıkar
        id_match = re.search(r'\(ID:\s*(\d+)\)', docstring)
        if id_match:
            endpoint_id = int(id_match.group(1))
            endpoints[func_name] = {
                'id': endpoint_id,
                'description': docstring.strip()
            }
        else:
            endpoints[func_name] = {
                'id': None,
                'description': docstring.strip()
            }
    
    return endpoints

def get_constants_ids():
    """Constants.py dosyasından yapı türlerini al"""
    with open('calculations/tarimsal_yapilar/constants.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # YAPI_TURLERI listesini bul
    yapi_turleri_match = re.search(r'YAPI_TURLERI = \[(.*?)\]', content, re.DOTALL)
    if not yapi_turleri_match:
        return {}
    
    yapi_turleri_content = yapi_turleri_match.group(1)
    
    # Her yapı türünü parse et
    pattern = r'\{"id":\s*(\d+),\s*"ad":\s*"([^"]+)"\}'
    matches = re.findall(pattern, yapi_turleri_content)
    
    constants = {}
    for id_str, ad in matches:
        constants[int(id_str)] = ad
    
    return constants

def main():
    print("=== ENDPOINT ID'LERİ KONTROLÜ ===\n")
    
    endpoints = extract_endpoint_ids()
    constants = get_constants_ids()
    
    print(f"Toplam endpoint sayısı: {len(endpoints)}")
    print(f"Toplam constant yapı türü sayısı: {len(constants)}")
    print()
    
    # ID'si olmayan endpoint'ler
    no_id_endpoints = [name for name, info in endpoints.items() if info['id'] is None]
    if no_id_endpoints:
        print("❌ ID'si eksik endpoint'ler:")
        for name in no_id_endpoints:
            print(f"  - {name}")
        print()
    
    # Endpoint'leri ID'ye göre sırala
    sorted_endpoints = sorted([(info['id'], name, info['description']) for name, info in endpoints.items() if info['id'] is not None])
    
    print("=== ENDPOINT'LER VE ID'LER ===")
    missing_ids = []
    duplicate_ids = {}
    
    for endpoint_id, func_name, description in sorted_endpoints:
        if endpoint_id in constants:
            constant_name = constants[endpoint_id]
            print(f"✅ ID {endpoint_id:2d}: {func_name}")
            print(f"    Endpoint: {description.split('(ID:')[0].strip()}")
            print(f"    Constant: {constant_name}")
        else:
            print(f"❌ ID {endpoint_id:2d}: {func_name} - CONSTANT'TA YOK!")
            missing_ids.append(endpoint_id)
        print()
    
    # Kullanılmayan constant ID'ler
    used_ids = set(info['id'] for info in endpoints.values() if info['id'] is not None)
    unused_ids = set(constants.keys()) - used_ids
    
    if unused_ids:
        print("⚠️  Kullanılmayan constant ID'ler:")
        for unused_id in sorted(unused_ids):
            print(f"  - ID {unused_id}: {constants[unused_id]}")
        print()
    
    # Özet
    print("=== ÖZET ===")
    print(f"✅ Toplam endpoint: {len(endpoints)}")
    print(f"✅ ID'si olan endpoint: {len([e for e in endpoints.values() if e['id'] is not None])}")
    print(f"❌ ID'si eksik endpoint: {len(no_id_endpoints)}")
    print(f"❌ Geçersiz ID'li endpoint: {len(missing_ids)}")
    print(f"⚠️  Kullanılmayan constant: {len(unused_ids)}")
    
    if len(endpoints) == 27 and len(no_id_endpoints) == 0 and len(missing_ids) == 0 and len(unused_ids) == 0:
        print("\n🎉 MÜKEMMEL! Tüm endpoint'ler constants ile tam uyumlu!")
    else:
        print("\n⚠️  Temizleme gerekiyor...")

if __name__ == "__main__":
    main()
