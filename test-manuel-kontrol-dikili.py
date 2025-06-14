#!/usr/bin/env python3
"""
Manuel control test for dikili vasıf
"""
import sys
import os
sys.path.append('/home/akn/Genel/web/webimar-api')

from calculations.tarimsal_yapilar.bag_evi import bag_evi_universal_degerlendir

def test_manuel_kontrol():
    """Manuel kontrol sonucu ile test"""
    print("🧪 MANUEL KONTROL TEST - Dikili Vasıf")
    print("="*60)
    
    # Test verisi
    arazi_bilgileri = {
        "ana_vasif": "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf",
        "dikili_alani": 5000,  
        "tapu_zeytin_agac_adedi": 25,
        "mevcut_zeytin_agac_adedi": 20,
        "zeytin_agac_adedi": 25,  
        "buyuk_ova_icinde": False
    }
    
    yapi_bilgileri = {
        "taban_alani_m2": 150,
        "kat_sayisi": 1,
        "yukseklik_m": 4.5
    }
    
    # Manuel kontrol sonucu (başarılı)
    manuel_kontrol_sonucu = {
        "yeterlilik": {
            "yeterli": True,
            "kriter1": True,
            "kriter2": False,
            "oran": 100
        },
        "alanBilgisi": {
            "kaplanAlan": 5000,
            "oran": 100
        }
    }
    
    print("📋 Test Verisi:")
    print(f"  - Arazi vasfı: {arazi_bilgileri['ana_vasif']}")
    print(f"  - Dikili alan: {arazi_bilgileri['dikili_alani']} m²")
    print(f"  - Manuel kontrol: Başarılı (kriter1=True, oran=%100)")
    print()
    
    # Backend fonksiyonu çağır
    try:
        sonuc = bag_evi_universal_degerlendir(
            arazi_bilgileri=arazi_bilgileri,
            yapi_bilgileri=yapi_bilgileri,
            bag_evi_var_mi=False,
            manuel_kontrol_sonucu=manuel_kontrol_sonucu
        )
        
        print("📥 Backend Sonucu:")
        print(f"  - İzin durumu: {sonuc.get('izin_durumu')}")
        print(f"  - Ana mesaj: {sonuc.get('ana_mesaj', '')[:200]}...")
        print(f"  - Hesaplama tipi: {sonuc.get('hesaplama_tipi')}")
        
        # Başarı durumu kontrol
        if sonuc.get('izin_durumu') == 'izin_verilebilir':
            print("\n✅ TEST BAŞARILI - Manuel kontrol ile izin verilebilir")
        else:
            print("\n❌ TEST BAŞARISIZ - Manuel kontrol reddedildi")
            print(f"🚨 Hata sebebi: {sonuc.get('ana_mesaj', 'Bilinmeyen hata')}")
            
    except Exception as e:
        print(f"\n💥 EXCEPTION OLUŞTU:")
        print(f"🚨 Hata: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_manuel_kontrol()
