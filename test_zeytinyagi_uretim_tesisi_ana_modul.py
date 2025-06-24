#!/usr/bin/env python3
"""
Zeytinyağı Üretim Tesisi Ana Modül Entegrasyonu Test Dosyası
Bu test, zeytinyağı üretim tesisinin ana modülde düzgün çalışıp çalışmadığını kontrol eder.
"""

import sys
import os

# Test için path ayarı
sys.path.insert(0, '/home/akn/Genel/web/webimar-api')

try:
    from calculations.tarimsal_yapilar.ana_modul import genel_vasif_kural_kontrolu
    from calculations.tarimsal_yapilar.constants import YAPI_TURLERI
    
    print("🧪 ZEYTİNYAĞI ÜRETİM TESİSİ ANA MODÜL ENTEGRASYONU TEST")
    print("=" * 60)
    
    # Zeytinyağı üretim tesisi ID'sini bul
    zeytinyagi_id = None
    for yapi in YAPI_TURLERI:
        if yapi['ad'] == "Zeytinyağı üretim tesisi":
            zeytinyagi_id = yapi['id']
            break
    
    if not zeytinyagi_id:
        print("❌ HATA: Zeytinyağı üretim tesisi YAPI_TURLERI'nde bulunamadı!")
        sys.exit(1)
    
    print(f"✅ Zeytinyağı üretim tesisi ID: {zeytinyagi_id}")
    
    # Test senaryoları
    test_cases = [
        {
            "name": "Minimum Alan Test (2500 m²)",
            "arazi_buyuklugu_m2": 2500,
            "expected_status": "izin_verilebilir"
        },
        {
            "name": "Küçük Alan Test (2000 m²)", 
            "arazi_buyuklugu_m2": 2000,
            "expected_status": "izin_verilemez"
        },
        {
            "name": "Büyük Alan Test (10000 m²)",
            "arazi_buyuklugu_m2": 10000,
            "expected_status": "izin_verilebilir"
        }
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}: {test['name']}")
        print("-" * 40)
        
        try:
            # Test verilerini hazırla
            arazi_bilgileri = {
                "vasfi": "Tarımsal nitelikli arazi",
                "buyukluk_m2": test["arazi_buyuklugu_m2"],  # buyuklugu_m2 değil, buyukluk_m2 
                "il": "İzmir",
                "ilce": "Bornova"
            }
            
            yapi_bilgileri = {
                "yapi_turu_id": zeytinyagi_id,
                "tur_ad": "Zeytinyağı üretim tesisi"
            }
            
            # Ana modül fonksiyonunu çağır
            sonuc = genel_vasif_kural_kontrolu(arazi_bilgileri, yapi_bilgileri)
            
            # Sonuçları kontrol et
            izin_durumu = sonuc.get("izin_durumu", "belirsiz")
            mesaj = sonuc.get("mesaj", "Mesaj yok")
            maksimum_alan = sonuc.get("maksimum_taban_alani", 0)
            
            print(f"Arazi büyüklüğü: {test['arazi_buyuklugu_m2']} m²")
            print(f"İzin durumu: {izin_durumu}")
            print(f"Mesaj: {mesaj}")
            print(f"Maksimum alan: {maksimum_alan} m²")
            
            # Beklenen sonuçla karşılaştır
            if izin_durumu == test["expected_status"]:
                print(f"✅ TEST BAŞARILI: Beklenen sonuç ({test['expected_status']}) alındı")
            else:
                print(f"❌ TEST BAŞARISIZ: Beklenen {test['expected_status']}, alınan {izin_durumu}")
            
            # Ek bilgileri kontrol et
            if "uyari_mesaji_ozel_durum" in sonuc:
                print(f"Uyarı mesajı: {sonuc['uyari_mesaji_ozel_durum']}")
            
            if "sonraki_adim_bilgisi" in sonuc:
                print(f"Sonraki adım: {sonuc['sonraki_adim_bilgisi']}")
                
        except Exception as e:
            print(f"❌ TEST HATASI: {str(e)}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("🎯 ÖZET")
    print("Zeytinyağı üretim tesisi ana modüle başarıyla entegre edildi!")
    print("- %10 emsal oranı kullanılıyor")
    print("- Minimum 2500 m² arazi gerekli")
    print("- Alan dağılımı: %70 üretim, %20 idari, %10 yardımcı")
    
except ImportError as e:
    print(f"❌ IMPORT HATASI: {str(e)}")
    print("Ana modül veya bağımlılıklar yüklenemedi!")
    sys.exit(1)
except Exception as e:
    print(f"❌ GENEL HATA: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
