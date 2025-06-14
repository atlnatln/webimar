#!/usr/bin/env python3
"""
Direct backend test for dikili vasıf 5000 m² case
"""
import sys
import os
sys.path.append('/home/akn/Genel/web/webimar-api')

from calculations.tarimsal_yapilar.bag_evi import bag_evi_universal_degerlendir

def test_dikili_5000_direct():
    """5000 m² dikili alan ile direct test"""
    print("🧪 DIRECT BACKEND TEST - 5000 m² Dikili Alan")
    print("="*60)
    
    # Test verisi
    arazi_bilgileri = {
        "ana_vasif": "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf",
        "dikili_alani": 5000,  # Minimum gereksinim
        "tapu_zeytin_agac_adedi": 25,
        "mevcut_zeytin_agac_adedi": 20,
        "zeytin_agac_adedi": 25,  # Math.max(tapu, mevcut)
        "buyuk_ova_icinde": False
    }
    
    yapi_bilgileri = {
        "taban_alani_m2": 150,
        "kat_sayisi": 1,
        "yukseklik_m": 4.5
    }
    
    print("📋 Test Verisi:")
    print(f"  - Arazi vasfı: {arazi_bilgileri['ana_vasif']}")
    print(f"  - Dikili alan: {arazi_bilgileri['dikili_alani']} m²")
    print(f"  - Tapu ağaç: {arazi_bilgileri['tapu_zeytin_agac_adedi']}")
    print(f"  - Mevcut ağaç: {arazi_bilgileri['mevcut_zeytin_agac_adedi']}")
    print(f"  - Kullanılan ağaç: {arazi_bilgileri['zeytin_agac_adedi']}")
    print()
    
    # Backend fonksiyonu çağır
    try:
        sonuc = bag_evi_universal_degerlendir(
            arazi_bilgileri=arazi_bilgileri,
            yapi_bilgileri=yapi_bilgileri,
            bag_evi_var_mi=False,
            manuel_kontrol_sonucu=None
        )
        
        print("📥 Backend Sonucu:")
        print(f"  - İzin durumu: {sonuc.get('izin_durumu')}")
        print(f"  - Ana mesaj: {sonuc.get('ana_mesaj', '')[:200]}...")
        print(f"  - Hesaplama tipi: {sonuc.get('hesaplama_tipi')}")
        
        # Debug detayları varsa yazdır
        if 'debug_info' in sonuc:
            print("\n🔍 Debug Bilgileri:")
            for key, value in sonuc['debug_info'].items():
                print(f"  - {key}: {value}")
        
        # Başarı durumu kontrol
        if sonuc.get('izin_durumu') == 'izin_verilebilir_varsayimsal':
            print("\n✅ TEST BAŞARILI - İzin verilebilir")
        else:
            print("\n❌ TEST BAŞARISIZ - İzin verilemez")
            print(f"🚨 Hata sebebi: {sonuc.get('ana_mesaj', 'Bilinmeyen hata')}")
            
    except Exception as e:
        print(f"\n💥 EXCEPTION OLUŞTU:")
        print(f"🚨 Hata: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_dikili_5000_direct()
