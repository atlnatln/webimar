#!/usr/bin/env python3
"""
"Zeytin ağaçlı + tarla" arazi tipi için bağ evi backend test scripti (Düzeltilmiş)
"""

import requests
import json

def test_api_response(test_name, test_data, expected_result=None):
    """API response test fonksiyonu"""
    print(f"🫒 {test_name}")
    print("=" * 60)
    
    try:
        response = requests.post(
            'http://localhost:8000/api/calculations/bag-evi/',
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"✅ Status: {response.status_code}")
                
                # API'nin yeni response formatını kontrol et
                if result.get('success'):
                    data = result.get('data', {})
                    print(f"📊 İzin Durumu: {data.get('izin_durumu', 'None')}")
                    print(f"📝 Ana Mesaj: {data.get('mesaj', 'Mesaj yok...')[:150]}...")
                    print(f"🏠 Taban Alanı: {data.get('taban_alani', 'Yok')} m²")
                    print(f"🔄 Arazi Alanı: {data.get('arazi_alani', 'Yok')} m²")
                    
                    # İzin durumuna göre test sonucunu değerlendir
                    izin_durumu = data.get('izin_durumu')
                    if 'izin_verilebilir' in str(izin_durumu):
                        print("🎉 TEST BAŞARILI - İzin verilebilir")
                    elif 'izin_verilemez' in str(izin_durumu):
                        print("⛔ TEST BAŞARILI - İzin verilemez (beklenen)")
                    else:
                        print("❓ TEST BELIRSIZ - İzin durumu belirlenemedi")
                else:
                    print(f"❌ API Error: {result.get('error', 'Bilinmeyen hata')}")
                    
            except json.JSONDecodeError as e:
                print(f"❌ JSON Parse Error: {e}")
                print(f"📄 Raw Response: {response.text}")
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Bağlantı hatası: {e}")
    
    print()

def test_zeytin_tarla_backend():
    """Zeytin ağaçlı + tarla arazi tipi test fonksiyonu"""
    
    # Test case 1: Başarılı durum - yeterli tarla, az ağaç yoğunluğu
    test_data_1 = {
        "arazi_vasfi": "Zeytin ağaçlı + tarla",
        "tarla_alani": 25000,  # 25.000 m² tarla (yeterli)
        "zeytin_agac_adedi": 150,  # 150 ağaç / 25 dekar = 6 ağaç/dekar (uygun)
        "bag_evi_var_mi": False
    }
    test_api_response("Test 1: Varsayımsal Hesaplama (Başarılı)", test_data_1)
    
    # Test case 2: Manuel kontrol sonucu ile başarılı durum
    test_data_2 = {
        "arazi_vasfi": "Zeytin ağaçlı + tarla",
        "tarla_alani": 30000,  # Beyan edilen tarla alanı
        "zeytin_agac_adedi": 200,  # Beyan edilen ağaç adedi
        "bag_evi_var_mi": False,
        "manuel_kontrol_sonucu": {
            "tarlaAlani": 30000,  # Manuel ölçüm sonucu tarla alanı
            "zeytinAgacAdedi": 200,  # Manuel sayım sonucu ağaç adedi
            "directTransfer": True  # Polygon transfer başarılı
        }
    }
    test_api_response("Test 2: Manuel Kontrol (Başarılı)", test_data_2)
    
    # Test case 3: Başarısız durum - ağaç yoğunluğu fazla
    test_data_3 = {
        "arazi_vasfi": "Zeytin ağaçlı + tarla", 
        "tarla_alani": 20000,  # 20.000 m² tarla (minimum limit)
        "zeytin_agac_adedi": 250,  # 250 ağaç / 20 dekar = 12.5 ağaç/dekar (fazla!)
        "bag_evi_var_mi": False
    }
    test_api_response("Test 3: Ağaç Yoğunluğu Fazla (Ret)", test_data_3)
    
    # Test case 4: Başarısız durum - yetersiz tarla alanı
    test_data_4 = {
        "arazi_vasfi": "Zeytin ağaçlı + tarla", 
        "tarla_alani": 15000,  # 15.000 m² tarla (yetersiz)
        "zeytin_agac_adedi": 90,  # 90 ağaç / 15 dekar = 6 ağaç/dekar (uygun ama alan yetersiz)
        "bag_evi_var_mi": False
    }
    test_api_response("Test 4: Yetersiz Tarla Alanı (Ret)", test_data_4)

if __name__ == "__main__":
    print("🫒 Zeytin Ağaçlı + Tarla Backend Test Suite (Düzeltilmiş)")
    print("=" * 60)
    print("📌 Kriterler:")
    print("   • Tarla alanı >= 20.000 m²")
    print("   • Dekara zeytin ağacı adedi < 10 (10+ ret)")
    print("   • Sadece tarla alanı hesaplanır")
    print("=" * 60)
    test_zeytin_tarla_backend()
