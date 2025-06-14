#!/usr/bin/env python3
"""
"… Adetli Zeytin Ağacı bulunan tarla" arazi tipi kapsamlı test
- Dekara 10+ ağaç kontrolü
- Tarla alanı kontrolü
- Zeytin ağacı sayısı mapping'i
- Frontend-backend entegrasyonu
"""

import requests
import json

API_BASE_URL = "http://localhost:8000"

def test_api_response(test_name, test_data):
    """API response test wrapper"""
    print(f"\n🧪 {test_name}")
    print(f"📤 Test Data: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/calculations/bag-evi/",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📡 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📦 Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            success = data.get("success", False)
            izin_durumu = data.get("data", {}).get("izin_durumu", "")
            mesaj = data.get("data", {}).get("mesaj", "")
            
            print(f"✅ Success: {success}")
            print(f"🏛️ İzin Durumu: {izin_durumu}")
            print(f"📝 Ana Mesaj: {mesaj[:200]}..." if len(mesaj) > 200 else f"📝 Ana Mesaj: {mesaj}")
            
            return success, izin_durumu, mesaj
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Error: {response.text}")
            return False, "", ""
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False, "", ""

def test_comprehensive_features():
    """Kapsamlı özellik testi"""
    print("🚀 … Adetli Zeytin Ağacı bulunan tarla - Kapsamlı Test Başlıyor")
    print("=" * 80)
    
    test_results = []
    
    # Test 1: Başarılı durum - Az ağaç yoğunluğu
    test_data_1 = {
        "calculationType": "bag-evi",
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan tarla",
        "tarla_alani": 25000,  # 25.000 m² (yeterli)
        "tapu_zeytin_agac_adedi": 200,
        "mevcut_zeytin_agac_adedi": 237,  # 9.48 ağaç/dekar (< 10 ✅)
        "bag_evi_var_mi": False
    }
    success, izin_durumu, mesaj = test_api_response("Test 1: Başarılı - Dekara 9.48 ağaç", test_data_1)
    test_results.append({
        "name": "Başarılı durum (9.48 ağaç/dekar)",
        "expected": "izin_verilebilir_varsayimsal",
        "actual": izin_durumu,
        "passed": izin_durumu == "izin_verilebilir_varsayimsal"
    })
    
    # Test 2: Reddedilen - Tam 10 ağaç/dekar
    test_data_2 = {
        "calculationType": "bag-evi",
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan tarla",
        "tarla_alani": 20000,  # 20.000 m² (yeterli)
        "tapu_zeytin_agac_adedi": 180,
        "mevcut_zeytin_agac_adedi": 200,  # 10.0 ağaç/dekar (>= 10 ❌)
        "bag_evi_var_mi": False
    }
    success, izin_durumu, mesaj = test_api_response("Test 2: Reddedilen - Dekara 10.0 ağaç", test_data_2)
    test_results.append({
        "name": "Reddedilen durum (10.0 ağaç/dekar)",
        "expected": "izin_verilemez",
        "actual": izin_durumu,
        "passed": izin_durumu == "izin_verilemez"
    })
    
    # Test 3: Reddedilen - Yüksek ağaç yoğunluğu
    test_data_3 = {
        "calculationType": "bag-evi",
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan tarla",
        "tarla_alani": 24000,  # 24.000 m² (yeterli)
        "tapu_zeytin_agac_adedi": 250,
        "mevcut_zeytin_agac_adedi": 300,  # 12.5 ağaç/dekar (>> 10 ❌)
        "bag_evi_var_mi": False
    }
    success, izin_durumu, mesaj = test_api_response("Test 3: Reddedilen - Dekara 12.5 ağaç", test_data_3)
    test_results.append({
        "name": "Reddedilen durum (12.5 ağaç/dekar)",
        "expected": "izin_verilemez",
        "actual": izin_durumu,
        "passed": izin_durumu == "izin_verilemez"
    })
    
    # Test 4: Sınır değer - 9.9 ağaç/dekar (başarılı olmalı)
    test_data_4 = {
        "calculationType": "bag-evi",
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan tarla",
        "tarla_alani": 30000,  # 30.000 m² (yeterli)
        "tapu_zeytin_agac_adedi": 280,
        "mevcut_zeytin_agac_adedi": 297,  # 9.9 ağaç/dekar (< 10 ✅)
        "bag_evi_var_mi": False
    }
    success, izin_durumu, mesaj = test_api_response("Test 4: Başarılı - Dekara 9.9 ağaç", test_data_4)
    test_results.append({
        "name": "Sınır değer (9.9 ağaç/dekar)",
        "expected": "izin_verilebilir_varsayimsal",
        "actual": izin_durumu,
        "passed": izin_durumu == "izin_verilebilir_varsayimsal"
    })
    
    # Test 5: Yetersiz tarla alanı
    test_data_5 = {
        "calculationType": "bag-evi",
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan tarla",
        "tarla_alani": 15000,  # 15.000 m² (yetersiz < 20.000)
        "tapu_zeytin_agac_adedi": 100,
        "mevcut_zeytin_agac_adedi": 120,  # 8.0 ağaç/dekar (uygun ama alan yetersiz)
        "bag_evi_var_mi": False
    }
    success, izin_durumu, mesaj = test_api_response("Test 5: Reddedilen - Yetersiz tarla alanı", test_data_5)
    test_results.append({
        "name": "Yetersiz tarla alanı (15.000 m²)",
        "expected": "izin_verilemez",
        "actual": izin_durumu,
        "passed": izin_durumu == "izin_verilemez"
    })
    
    # Test 6: Ailenin başka bağ evi var
    test_data_6 = {
        "calculationType": "bag-evi",
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan tarla",
        "tarla_alani": 25000,  # Yeterli alan
        "tapu_zeytin_agac_adedi": 200,
        "mevcut_zeytin_agac_adedi": 200,  # 8.0 ağaç/dekar (uygun)
        "bag_evi_var_mi": True  # Başka bağ evi var ❌
    }
    success, izin_durumu, mesaj = test_api_response("Test 6: Reddedilen - Ailenin başka bağ evi var", test_data_6)
    test_results.append({
        "name": "Ailenin başka bağ evi var",
        "expected": "izin_verilemez",
        "actual": izin_durumu,
        "passed": izin_durumu == "izin_verilemez"
    })
    
    # Sonuçları değerlendirme
    print("\n" + "=" * 80)
    print("📊 TEST SONUÇLARI:")
    print("=" * 80)
    
    passed_tests = 0
    total_tests = len(test_results)
    
    for result in test_results:
        status = "✅ BAŞARILI" if result["passed"] else "❌ BAŞARISIZ"
        print(f"{result['name']}: {status}")
        print(f"   Beklenen: {result['expected']}")
        print(f"   Gerçek: {result['actual']}")
        if result["passed"]:
            passed_tests += 1
        print()
    
    print(f"🎯 TOPLAM SONUÇ: {passed_tests}/{total_tests} test geçti")
    
    if passed_tests == total_tests:
        print("🎉 TÜM TESTLER BAŞARILI! '… Adetli Zeytin Ağacı bulunan tarla' arazi tipi tamamen çalışıyor.")
    else:
        print("⚠️ Bazı testler başarısız. Lütfen backend kontrollerini gözden geçirin.")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    test_comprehensive_features()
