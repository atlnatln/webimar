#!/usr/bin/env python3
"""
Test: ... Adetli Zeytin Ağacı bulunan tarla - Dekara 10+ ağaç testi
Bu test dekara 10 ve üzeri ağaç varsa reddedilme kontrolünü yapar
"""

import requests
import json

API_BASE_URL = "http://localhost:8000"

def test_api_response(test_name, test_data):
    """API çağrısını test et ve sonucu kontrol et"""
    print(f"\n🧪 {test_name}")
    print(f"📤 Test Data: {json.dumps(test_data, indent=2, ensure_ascii=False)}")
    
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
            
            # Sonucu kontrol et
            success = data.get("success", False)
            izin_durumu = data.get("results", {}).get("izin_durumu", "")
            ana_mesaj = data.get("results", {}).get("ana_mesaj", "")
            
            print(f"✅ Success: {success}")
            print(f"🏛️ İzin Durumu: {izin_durumu}")
            print(f"📝 Ana Mesaj: {ana_mesaj[:200]}..." if len(ana_mesaj) > 200 else f"📝 Ana Mesaj: {ana_mesaj}")
            
            return success, izin_durumu, ana_mesaj
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Error: {response.text}")
            return False, "", ""
        
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False, "", ""

def test_adetli_zeytin_10plus():
    """Test dekara 10+ ağaç senaryoları"""
    
    print("🚀 ... Adetli Zeytin Ağacı bulunan tarla - Dekara 10+ Ağaç Testi Başlıyor")
    print("=" * 80)
    
    # Test 1: Başarılı durum - Dekara 9.5 ağaç (< 10)
    test_data_1 = {
        "calculationType": "bag-evi",
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan tarla",
        "tarla_alani": 25000,  # 25 dekar
        "tapu_zeytin_agac_adedi": 200,  # Tapu senedindeki sayı
        "mevcut_zeytin_agac_adedi": 237,  # 237/25 = 9.48 ağaç/dekar (< 10 ✅)
        "bag_evi_var_mi": False
    }
    
    success_1, izin_1, mesaj_1 = test_api_response("Test 1: Başarılı - Dekara 9.5 ağaç", test_data_1)
    
    # Test 2: Reddedilen durum - Dekara 10 ağaç (= 10)
    test_data_2 = {
        "calculationType": "bag-evi",
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan tarla",
        "tarla_alani": 20000,  # 20 dekar
        "tapu_zeytin_agac_adedi": 180,  # Tapu senedindeki sayı
        "mevcut_zeytin_agac_adedi": 200,  # 200/20 = 10 ağaç/dekar (= 10 ❌)
        "bag_evi_var_mi": False
    }
    
    success_2, izin_2, mesaj_2 = test_api_response("Test 2: Reddedilen - Dekara 10 ağaç", test_data_2)
    
    # Test 3: Reddedilen durum - Dekara 12.5 ağaç (> 10)
    test_data_3 = {
        "calculationType": "bag-evi",
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan tarla",
        "tarla_alani": 24000,  # 24 dekar
        "tapu_zeytin_agac_adedi": 250,  # Tapu senedindeki sayı
        "mevcut_zeytin_agac_adedi": 300,  # 300/24 = 12.5 ağaç/dekar (> 10 ❌)
        "bag_evi_var_mi": False
    }
    
    success_3, izin_3, mesaj_3 = test_api_response("Test 3: Reddedilen - Dekara 12.5 ağaç", test_data_3)
    
    # Test 4: Sınır durumu - Dekara 9.9 ağaç (< 10)
    test_data_4 = {
        "calculationType": "bag-evi",
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan tarla",
        "tarla_alani": 30000,  # 30 dekar
        "tapu_zeytin_agac_adedi": 280,  # Tapu senedindeki sayı
        "mevcut_zeytin_agac_adedi": 297,  # 297/30 = 9.9 ağaç/dekar (< 10 ✅)
        "bag_evi_var_mi": False
    }
    
    success_4, izin_4, mesaj_4 = test_api_response("Test 4: Başarılı - Dekara 9.9 ağaç", test_data_4)
    
    # Sonuçları değerlendir
    print("\n" + "=" * 80)
    print("📊 TEST SONUÇLARI:")
    print("=" * 80)
    
    test_results = [
        ("Test 1 (9.5 ağaç/dekar)", success_1, izin_1 == "izin_verilebilir_varsayimsal", "Başarılı olmalı"),
        ("Test 2 (10 ağaç/dekar)", success_2, izin_2 == "izin_verilemez", "Reddedilmeli"),
        ("Test 3 (12.5 ağaç/dekar)", success_3, izin_3 == "izin_verilemez", "Reddedilmeli"),
        ("Test 4 (9.9 ağaç/dekar)", success_4, izin_4 == "izin_verilebilir_varsayimsal", "Başarılı olmalı")
    ]
    
    passed_tests = 0
    for test_name, success, expected_result, description in test_results:
        status = "✅ GEÇTI" if success and expected_result else "❌ BAŞARISIZ"
        print(f"{test_name}: {status} ({description})")
        if success and expected_result:
            passed_tests += 1
    
    print(f"\n🎯 TOPLAM SONUÇ: {passed_tests}/4 test geçti")
    
    if passed_tests == 4:
        print("🎉 TÜM TESTLER BAŞARILI! Dekara 10+ ağaç kontrolü çalışıyor.")
    else:
        print("⚠️ Bazı testler başarısız. Lütfen backend kontrollerini gözden geçirin.")

if __name__ == "__main__":
    test_adetli_zeytin_10plus()
