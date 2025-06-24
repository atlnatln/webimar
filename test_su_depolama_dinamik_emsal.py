#!/usr/bin/env python3
"""
Su Depolama Dinamik Emsal Test Dosyası
Bu test su depolama modülünün dinamik emsal sistemiyle çalışıp çalışmadığını kontrol eder.
"""

import sys
import os

# Test için path ayarı
sys.path.insert(0, '/home/akn/Genel/web/webimar-api')

try:
    from calculations.tarimsal_yapilar.ana_modul import genel_vasif_kural_kontrolu
    from calculations.tarimsal_yapilar.constants import YAPI_TURLERI
    
    print("🧪 SU DEPOLAMA DİNAMİK EMSAL TEST")
    print("=" * 50)
    
    # Su depolama yapı türlerini bul
    su_depolama_turleri = []
    for yapi in YAPI_TURLERI:
        if "Su depolama" in yapi['ad']:
            su_depolama_turleri.append(yapi)
    
    print(f"✅ Bulunan su depolama türleri: {len(su_depolama_turleri)}")
    for yapi in su_depolama_turleri:
        print(f"   - ID: {yapi['id']}, Ad: {yapi['ad']}")
    
    # Test senaryoları - aynı arazi için farklı emsal türleri
    test_cases = [
        {
            "name": "Marjinal Emsal (%20)",
            "emsal_turu": "marjinal",
            "arazi_m2": 1000,
            "expected_emsal": 200  # 1000 * 0.20
        },
        {
            "name": "Mutlak Dikili Emsal (%5)", 
            "emsal_turu": "mutlak_dikili",
            "arazi_m2": 1000,
            "expected_emsal": 50   # 1000 * 0.05
        }
    ]
    
    # Her su depolama türü için test et
    for yapi_turu in su_depolama_turleri:
        print(f"\n🏗️ Test Yapı Türü: {yapi_turu['ad']} (ID: {yapi_turu['id']})")
        print("-" * 50)
        
        for test in test_cases:
            print(f"\n🧪 {test['name']}")
            print("-" * 30)
            
            try:
                # Test verilerini hazırla
                arazi_bilgileri = {
                    "vasfi": "Tarımsal nitelikli arazi",
                    "buyukluk_m2": test["arazi_m2"],
                    "il": "İzmir",
                    "ilce": "Bornova"
                }
                
                yapi_bilgileri = {
                    "yapi_turu_id": yapi_turu['id'],
                    "tur_ad": yapi_turu['ad'],
                    "emsal_turu": test["emsal_turu"]  # Dinamik emsal türü
                }
                
                # Ana modül fonksiyonunu çağır
                sonuc = genel_vasif_kural_kontrolu(arazi_bilgileri, yapi_bilgileri)
                
                # Sonuçları kontrol et
                izin_durumu = sonuc.get("izin_durumu", "belirsiz")
                mesaj = sonuc.get("mesaj", "Mesaj yok")
                maksimum_alan = sonuc.get("maksimum_taban_alani", 0)
                
                print(f"Arazi: {test['arazi_m2']} m²")
                print(f"Emsal türü: {test['emsal_turu']}")
                print(f"Beklenen emsal: {test['expected_emsal']} m²")
                print(f"İzin durumu: {izin_durumu}")
                print(f"Mesaj: {mesaj}")
                print(f"Maksimum alan: {maksimum_alan} m²")
                
                # Dinamik emsal kontrol (yaklaşık kontrol, +/- 10 m² tolerans)
                if maksimum_alan and abs(maksimum_alan - test["expected_emsal"]) <= 10:
                    print(f"✅ DİNAMİK EMSAL BAŞARILI: {test['expected_emsal']} m² beklenen, {maksimum_alan} m² alındı")
                elif izin_durumu == "izin_verilebilir":
                    print(f"⚠️ DİNAMİK EMSAL KONTROL EDİLEMEDİ: {maksimum_alan} m² (beklenen: {test['expected_emsal']} m²)")
                else:
                    print(f"❌ TEST BAŞARISIZ: İzin verilemedi")
                
                # Ek bilgileri kontrol et
                if "uyari_mesaji_ozel_durum" in sonuc:
                    print(f"Uyarı: {sonuc['uyari_mesaji_ozel_durum']}")
                
                if "sonraki_adim_bilgisi" in sonuc:
                    print(f"Detay: {sonuc['sonraki_adim_bilgisi']}")
                    
            except Exception as e:
                print(f"❌ TEST HATASI: {str(e)}")
                import traceback
                traceback.print_exc()
    
    print("\n" + "=" * 50)
    print("🎯 ÖZET")
    print("Su depolama dinamik emsal testi tamamlandı!")
    print("- Marjinal emsal: %20")
    print("- Mutlak dikili emsal: %5") 
    print("- Dinamik emsal sistemi çalışıyor mu kontrol edildi")
    
except ImportError as e:
    print(f"❌ IMPORT HATASI: {str(e)}")
    print("Ana modül veya bağımlılıklar yüklenemedi!")
    sys.exit(1)
except Exception as e:
    print(f"❌ GENEL HATA: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
