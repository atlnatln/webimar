#!/usr/bin/env python3
"""
"Tarla + Zeytinlik" arazi tipi için bağ evi backend test scripti
"""

import requests
import json

API_BASE_URL = "http://127.0.0.1:8000"

def test_tarla_zeytinlik_varsayimsal():
    """Test varsayımsal hesaplama"""
    print("🫒 Test 1: Tarla + Zeytinlik - Varsayımsal Hesaplama")
    
    test_data = {
        "calculationType": "bag-evi",
        "arazi_vasfi": "Tarla + Zeytinlik",
        "tarla_alani": 16000,  # 1.6 hektar
        "zeytinlik_alani": 6000,  # 0.6 hektar  
        "alan_m2": 22000  # Toplam 2.2 hektar
    }
    
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
            
            if data.get("success") and data.get("results", {}).get("izin_durumu") == "izin_verilebilir_varsayimsal":
                print("✅ Test 1 BAŞARILI - Varsayımsal sonuç döndü")
                return True
            else:
                print("❌ Test 1 BAŞARISIZ - Beklenmeyen sonuç")
                return False
        else:
            print(f"❌ Test 1 BAŞARISIZ - HTTP {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test 1 BAŞARISIZ - Exception: {e}")
        return False

def test_tarla_zeytinlik_manuel_kontrol():
    """Test manuel kontrol sonucu"""
    print("\n🫒 Test 2: Tarla + Zeytinlik - Manuel Kontrol")
    
    test_data = {
        "calculationType": "bag-evi", 
        "arazi_vasfi": "Tarla + Zeytinlik",
        "tarla_alani": 16000,
        "zeytinlik_alani": 6000,
        "alan_m2": 22000,
        "manuel_kontrol_sonucu": {
            "tarlaAlani": 16500,  # Güncellenen değerler
            "zeytinlikAlani": 6500,
            "directTransfer": True  # Polygon transfer simüle et
        }
    }
    
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
            
            if data.get("success") and data.get("results", {}).get("izin_durumu") == "izin_verilebilir":
                print("✅ Test 2 BAŞARILI - Manuel kontrol sonucu döndü") 
                return True
            else:
                print("❌ Test 2 BAŞARISIZ - Beklenmeyen sonuç")
                return False
        else:
            print(f"❌ Test 2 BAŞARISIZ - HTTP {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test 2 BAŞARISIZ - Exception: {e}")
        return False

def test_tarla_zeytinlik_yetersiz_alan():
    """Test yetersiz alan durumu"""
    print("\n🫒 Test 3: Tarla + Zeytinlik - Yetersiz Alan")
    
    test_data = {
        "calculationType": "bag-evi",
        "arazi_vasfi": "Tarla + Zeytinlik", 
        "tarla_alani": 10000,  # Yetersiz (min 15000)
        "zeytinlik_alani": 3000,  # Yetersiz (min 5000)
        "alan_m2": 13000  # Yetersiz toplam
    }
    
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
            
            if data.get("success") and data.get("results", {}).get("izin_durumu") == "izin_verilemez":
                print("✅ Test 3 BAŞARILI - İzin verilemez sonucu döndü")
                return True
            else:
                print("❌ Test 3 BAŞARISIZ - Beklenmeyen sonuç")  
                return False
        else:
            print(f"❌ Test 3 BAŞARISIZ - HTTP {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test 3 BAŞARISIZ - Exception: {e}")
        return False

if __name__ == "__main__":
    print("🫒 Tarla + Zeytinlik Backend Test Suite")
    print("=" * 50)
    
    # Testleri çalıştır
    test1_result = test_tarla_zeytinlik_varsayimsal()
    test2_result = test_tarla_zeytinlik_manuel_kontrol()
    test3_result = test_tarla_zeytinlik_yetersiz_alan()
    
    # Sonuçları değerlendir
    print("\n" + "=" * 50)
    print("📊 TEST SONUÇLARI:")
    print(f"Test 1 (Varsayımsal): {'✅ BAŞARILI' if test1_result else '❌ BAŞARISIZ'}")
    print(f"Test 2 (Manuel Kontrol): {'✅ BAŞARILI' if test2_result else '❌ BAŞARISIZ'}")
    print(f"Test 3 (Yetersiz Alan): {'✅ BAŞARILI' if test3_result else '❌ BAŞARISIZ'}")
    
    all_passed = test1_result and test2_result and test3_result
    print(f"\n🎯 GENEL SONUÇ: {'✅ TÜM TESTLER BAŞARILI' if all_passed else '❌ BAZI TESTLER BAŞARISIZ'}")
