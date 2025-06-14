#!/usr/bin/env python3
"""
… Adetli Zeytin Ağacı bulunan tarla - Math.max() kontrolü testi
Frontend değişikliğinin backend'e doğru şekilde yansıyıp yansımadığını test eder
"""

import requests
import json

API_BASE_URL = "http://localhost:8000"

def test_math_max_logic():
    """Math.max() mantığının çalışıp çalışmadığını test eder"""
    print("🔬 Math.max() Logic Test - Frontend → Backend Data Flow")
    print("=" * 70)
    
    # Test case: Tapu 200, Mevcut 21 → 200 kullanılmalı → 10 ağaç/dekar → RED
    test_data = {
        "calculationType": "bag-evi",
        "arazi_vasfi": "… Adetli Zeytin Ağacı bulunan tarla",
        "tarla_alani": 20000,  # 20 dekar
        "tapu_zeytin_agac_adedi": 200,  # Tapu'da 200 ağaç
        "mevcut_zeytin_agac_adedi": 21,  # Mevcut 21 ağaç
        "bag_evi_var_mi": False
    }
    
    print("📤 Test Senaryosu:")
    print(f"   Tarla Alanı: {test_data['tarla_alani']} m² (20 dekar)")
    print(f"   Tapu Ağaç: {test_data['tapu_zeytin_agac_adedi']} adet")
    print(f"   Mevcut Ağaç: {test_data['mevcut_zeytin_agac_adedi']} adet")
    print(f"   Beklenen: Math.max(200, 21) = 200 ağaç kullanılacak")
    print(f"   Beklenen Yoğunluk: 200 ÷ 20 = 10.0 ağaç/dekar")
    print(f"   Beklenen Sonuç: izin_verilemez (10.0 >= 10)")
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
            result_data = data.get("data", {})
            izin_durumu = result_data.get("izin_durumu", "")
            mesaj = result_data.get("mesaj", "")
            
            print(f"✅ API Success: {success}")
            print(f"🏛️ İzin Durumu: {izin_durumu}")
            print()
            
            # Mesajdan ağaç yoğunluğunu çıkar
            if "Dekara" in mesaj and "adet" in mesaj:
                import re
                yogunluk_match = re.search(r'Dekara (\d+\.?\d*) adet', mesaj)
                if yogunluk_match:
                    actual_yogunluk = float(yogunluk_match.group(1))
                    print(f"🔍 Tespit Edilen Yoğunluk: {actual_yogunluk} ağaç/dekar")
                    
                    # Hangi ağaç sayısı kullanıldığını tahmin et
                    kullanilan_agac = actual_yogunluk * 20  # 20 dekar
                    print(f"🧮 Kullanılan Ağaç Sayısı: ~{kullanilan_agac:.0f} adet")
                    
                    if abs(kullanilan_agac - 200) < 5:
                        print("✅ BAŞARILI: 200 ağaç kullanılmış (tapu sayısı)")
                        expected_result = "izin_verilemez"
                    elif abs(kullanilan_agac - 21) < 5:
                        print("❌ HATA: 21 ağaç kullanılmış (mevcut sayısı)")
                        expected_result = "izin_verilebilir_varsayimsal"
                    else:
                        print(f"❓ BILINMEYEN: {kullanilan_agac:.0f} ağaç kullanılmış")
                        expected_result = "unknown"
                    
                    print()
                    print("📊 SONUÇ ANALİZİ:")
                    print(f"   Beklenen: izin_verilemez (200 ağaç kullanılacaksa)")
                    print(f"   Gerçek: {izin_durumu}")
                    
                    if izin_durumu == "izin_verilemez" and abs(kullanilan_agac - 200) < 5:
                        print("🎉 TEST BAŞARILI: Math.max() logic çalışıyor!")
                        return True
                    elif izin_durumu == "izin_verilebilir_varsayimsal" and abs(kullanilan_agac - 21) < 5:
                        print("⚠️ TEST BAŞARISIZ: Hâlâ mevcut ağaç sayısı kullanılıyor")
                        return False
                    else:
                        print("❓ TEST SONUCU BELİRSİZ")
                        return False
            
            print(f"\n📝 Tam Mesaj:\n{mesaj}")
            return False
            
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

if __name__ == "__main__":
    success = test_math_max_logic()
    print("\n" + "=" * 70)
    if success:
        print("🎯 SONUÇ: Math.max() logic başarıyla implement edildi!")
    else:
        print("⚠️ SONUÇ: Math.max() logic henüz çalışmıyor, frontend cache problemi olabilir.")
        print("   Çözüm: Browser cache temizle ve Hard Refresh (Ctrl+Shift+R) yap.")
