#!/usr/bin/env python3
"""
Math.max() Logic Test - Direct API Test
Frontend değişikliklerini test etmek için API'ye doğrudan istek gönderir
"""

import requests
import json

API_BASE_URL = "http://localhost:8000"

def test_math_max_logic():
    """Math.max() logic'i test eder"""
    print("🔬 Math.max() Logic Test - Direct API Test")
    print("=" * 60)
    
    # Test verisi - Tapu'da 200, mevcut'ta 21 ağaç
    test_data = {
        "calculationType": "bag-evi",
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan tarla",
        "tarla_alani": 20000,  # 20 dekar
        "tapu_zeytin_agac_adedi": 200,  # Tapu'da 200 ağaç
        "mevcut_zeytin_agac_adedi": 21,  # Mevcut'ta 21 ağaç
        "zeytin_agac_adedi": 200,  # Frontend Math.max() sonucu elle gönderiyoruz
        "bag_evi_var_mi": False
    }
    
    print("📤 Test Data (Math.max applied):")
    print(json.dumps(test_data, indent=2))
    print()
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/calculations/bag-evi/",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📡 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            success = data.get("success", False)
            izin_durumu = data.get("data", {}).get("izin_durumu", "")
            mesaj = data.get("data", {}).get("mesaj", "")
            
            print(f"✅ API Success: {success}")
            print(f"🏛️ İzin Durumu: {izin_durumu}")
            
            # Yoğunluk analizi
            if "Dekara" in mesaj:
                import re
                yogunluk_match = re.search(r'Dekara (\d+\.?\d*) adet', mesaj)
                if yogunluk_match:
                    yogunluk = float(yogunluk_match.group(1))
                    print(f"🔍 Tespit Edilen Yoğunluk: {yogunluk} ağaç/dekar")
                    
                    if yogunluk >= 10.0:
                        expected_result = "izin_verilemez"
                        print(f"🧮 Beklenen Sonuç: {expected_result} (≥10 ağaç/dekar)")
                    else:
                        expected_result = "izin_verilebilir_varsayimsal"
                        print(f"🧮 Beklenen Sonuç: {expected_result} (<10 ağaç/dekar)")
                    
                    if izin_durumu == expected_result:
                        print("✅ TEST BAŞARILI: Backend doğru sonuç veriyor")
                    else:
                        print("❌ TEST BAŞARISIZ: Backend yanlış sonuç veriyor")
                        print(f"   Beklenen: {expected_result}")
                        print(f"   Gerçek: {izin_durumu}")
            
            return izin_durumu == "izin_verilemez"  # 200 ağaç için beklenen sonuç
            
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

if __name__ == "__main__":
    result = test_math_max_logic()
    print("\n" + "=" * 60)
    if result:
        print("🎉 BACKEND DOĞRU ÇALIŞIYOR: 200 ağaç kullanıldığında izin verilmiyor")
    else:
        print("⚠️ BACKEND SORUNU: 200 ağaç kullanıldığında hâlâ izin veriliyor")
