#!/usr/bin/env python3
"""
Test script for "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf" backend
"""
import requests
import json

API_URL = "http://127.0.0.1:8000/api/calculations/bag-evi/"

def test_api_response(test_name, test_data):
    """Test API response with given data"""
    print(f"\n{'='*60}")
    print(f"🧪 {test_name}")
    print(f"{'='*60}")
    
    try:
        print(f"📤 REQUEST DATA:")
        print(json.dumps(test_data, indent=2, ensure_ascii=False))
        
        response = requests.post(API_URL, json=test_data)
        print(f"\n📊 HTTP STATUS: {response.status_code}")
        
        response_data = response.json()
        print(f"\n📥 RESPONSE DATA:")
        print(json.dumps(response_data, indent=2, ensure_ascii=False))
        
        if response.status_code == 200 and response_data.get('success'):
            print(f"\n✅ {test_name} - BAŞARILI")
            
            data = response_data.get('data', {})
            alan_m2 = data.get('alan_m2', 0)
            izin_durumu = data.get('izin_durumu', '')
            mesaj = data.get('mesaj', '')
            
            print(f"🏠 Alan: {alan_m2:,} m²")
            print(f"🎯 İzin: {izin_durumu}")
            print(f"📝 Mesaj: {mesaj[:200]}...")
            
        else:
            print(f"\n❌ {test_name} - BAŞARISIZ")
            print(f"🚨 Hata: {response_data}")
            
    except Exception as e:
        print(f"\n💥 {test_name} - EXCEPTION")
        print(f"🚨 Hata: {str(e)}")

def test_adetli_zeytin_dikili_backend():
    """… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf arazi tipi test fonksiyonu"""
    
    # Test case 1: Başarılı durum - yeterli dikili alan, az ağaç yoğunluğu
    test_data_1 = {
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf",
        "dikili_alani": 8000,  # 8.000 m² dikili alan (yeterli)
        "alan_m2": 8000,  # Dikili alanla aynı
        "tapu_zeytin_agac_adedi": 50,  # 50 ağaç / 8 dekar = 6.25 ağaç/dekar (uygun)
        "mevcut_zeytin_agac_adedi": 45,  # 45 ağaç (Math.max ile 50 kullanılacak)
        "zeytin_agac_adedi": 50,  # Backend için
        "bag_evi_var_mi": False
    }
    test_api_response("Test 1: Başarılı Durum (Dikili+Ağaç)", test_data_1)
    
    # Test case 2: Başarısız durum - yetersiz dikili alan
    test_data_2 = {
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf",
        "dikili_alani": 3000,  # 3.000 m² dikili alan (yetersiz < 5000)
        "alan_m2": 3000,
        "tapu_zeytin_agac_adedi": 20,  # 20 ağaç / 3 dekar = 6.67 ağaç/dekar (uygun ama alan yetersiz)
        "mevcut_zeytin_agac_adedi": 20,
        "zeytin_agac_adedi": 20,
        "bag_evi_var_mi": False
    }
    test_api_response("Test 2: Yetersiz Dikili Alan (Ret)", test_data_2)
    
    # Test case 3: Başarısız durum - yüksek ağaç yoğunluğu
    test_data_3 = {
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf",
        "dikili_alani": 6000,  # 6.000 m² dikili alan (yeterli)
        "alan_m2": 6000,
        "tapu_zeytin_agac_adedi": 70,  # 70 ağaç / 6 dekar = 11.67 ağaç/dekar (>= 10 ❌)
        "mevcut_zeytin_agac_adedi": 65,  # 65 ağaç (Math.max ile 70 kullanılacak)
        "zeytin_agac_adedi": 70,
        "bag_evi_var_mi": False
    }
    test_api_response("Test 3: Yüksek Ağaç Yoğunluğu (Ret)", test_data_3)
    
    # Test case 4: Başarılı durum - Math.max() test (mevcut > tapu)
    test_data_4 = {
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf",
        "dikili_alani": 10000,  # 10.000 m² dikili alan (yeterli)
        "alan_m2": 10000,
        "tapu_zeytin_agac_adedi": 60,  # Tapu'da 60 ağaç
        "mevcut_zeytin_agac_adedi": 80,  # Mevcut 80 ağaç (bu kullanılacak)
        "zeytin_agac_adedi": 80,  # 80 ağaç / 10 dekar = 8 ağaç/dekar (uygun)
        "bag_evi_var_mi": False
    }
    test_api_response("Test 4: Math.max() Test (Mevcut>Tapu)", test_data_4)

if __name__ == "__main__":
    print("🚀 '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf' Backend Test")
    print("=" * 80)
    test_adetli_zeytin_dikili_backend()
    print("\n🏁 Test tamamlandı!")
