#!/usr/bin/env python3
"""
PHASE 2 - Adım 3: Tarımsal Amaçlı Depo Dinamik Emsal Testi
Test: Statik %30'dan dinamik %20/%5 sistemine çevirme
"""
import sys
import os
sys.path.append('/home/akn/Genel/web/webimar-api')

from calculations.tarimsal_yapilar.ana_modul import genel_vasif_kural_kontrolu
from calculations.tarimsal_yapilar.tarimsal_amacli_depo import calculate_tarimsal_amacli_depo

def test_tarimsal_depo_dinamik_emsal():
    """Tarımsal amaçlı depo dinamik emsal testi"""
    print("=" * 70)
    print("🧪 PHASE 2 - TARIMSAL AMACLI DEPO DİNAMİK EMSAL TESTİ")
    print("=" * 70)
    
    # Test verileri
    test_alan = 5000  # m²
    
    # Test 1: Marjinal arazi (%20 emsal)
    print("\n📊 TEST 1: Marjinal Arazi (%20 emsal)")
    print("-" * 50)
    
    arazi_bilgileri_marjinal = {
        "ana_vasif": "Tarla",
        "buyukluk_m2": test_alan,
        "buyuk_ova_icinde": False
    }
    
    yapi_bilgileri_marjinal = {
        "tur_ad": "Tarımsal amaçlı depo",
        "emsal_turu": "marjinal"  # %20 emsal
    }
    
    sonuc_marjinal = genel_vasif_kural_kontrolu(arazi_bilgileri_marjinal, yapi_bilgileri_marjinal)
    
    print(f"✅ İzin Durumu: {sonuc_marjinal.get('izin_durumu')}")
    print(f"📝 Mesaj: {sonuc_marjinal.get('mesaj', '')[:100]}...")
    print(f"🏗️ Maksimum Taban Alanı: {sonuc_marjinal.get('maksimum_taban_alani')} m²")
    print(f"⚠️ Özel Durum: {sonuc_marjinal.get('uyari_mesaji_ozel_durum')}")
    
    # Test 2: Mutlak dikili arazi (%5 emsal)
    print("\n📊 TEST 2: Mutlak Dikili Arazi (%5 emsal)")
    print("-" * 50)
    
    arazi_bilgileri_mutlak = {
        "ana_vasif": "Dikili vasıflı",
        "buyukluk_m2": test_alan,
        "buyuk_ova_icinde": False
    }
    
    yapi_bilgileri_mutlak = {
        "tur_ad": "Tarımsal amaçlı depo",
        "emsal_turu": "mutlak_dikili"  # %5 emsal
    }
    
    sonuc_mutlak = genel_vasif_kural_kontrolu(arazi_bilgileri_mutlak, yapi_bilgileri_mutlak)
    
    print(f"✅ İzin Durumu: {sonuc_mutlak.get('izin_durumu')}")
    print(f"📝 Mesaj: {sonuc_mutlak.get('mesaj', '')[:100]}...")
    print(f"🏗️ Maksimum Taban Alanı: {sonuc_mutlak.get('maksimum_taban_alani')} m²")
    print(f"⚠️ Özel Durum: {sonuc_mutlak.get('uyari_mesaji_ozel_durum')}")
    
    # Test 3: Doğrudan modül testi (%20 emsal)
    print("\n📊 TEST 3: Doğrudan Modül Testi (%20)")
    print("-" * 50)
    
    dogrudan_sonuc_20 = calculate_tarimsal_amacli_depo(test_alan, emsal_orani=0.20)
    print(f"✅ Başarı: {dogrudan_sonuc_20.get('success')}")
    print(f"📝 Mesaj: {dogrudan_sonuc_20.get('sonuc')}")
    print(f"🏗️ Maksimum İnşaat Alanı: {dogrudan_sonuc_20.get('maksimum_insaat_alani_m2')} m²")
    print(f"🎯 Emsal Oranı: {dogrudan_sonuc_20.get('detaylar', {}).get('emsal_orani')}")
    
    # Test 4: Doğrudan modül testi (%5 emsal)
    print("\n📊 TEST 4: Doğrudan Modül Testi (%5)")
    print("-" * 50)
    
    dogrudan_sonuc_5 = calculate_tarimsal_amacli_depo(test_alan, emsal_orani=0.05)
    print(f"✅ Başarı: {dogrudan_sonuc_5.get('success')}")
    print(f"📝 Mesaj: {dogrudan_sonuc_5.get('sonuc')}")
    print(f"🏗️ Maksimum İnşaat Alanı: {dogrudan_sonuc_5.get('maksimum_insaat_alani_m2')} m²")
    print(f"🎯 Emsal Oranı: {dogrudan_sonuc_5.get('detaylar', {}).get('emsal_orani')}")
    
    # Karşılaştırma ve sonuç
    print("\n" + "=" * 70)
    print("📊 KARŞILAŞTIRMA VE SONUÇ")
    print("=" * 70)
    
    # Emsal hesaplamaları
    marjinal_emsal = test_alan * 0.20  # %20
    mutlak_emsal = test_alan * 0.05    # %5
    
    print(f"🏗️ Marjinal Arazi (%20): {marjinal_emsal} m² emsal hakkı")
    print(f"🏗️ Mutlak Dikili Arazi (%5): {mutlak_emsal} m² emsal hakkı")
    print(f"🏢 Sabit Yapı Alanı: 200 m² (Depo: 150 + İdari: 30 + Teknik: 20)")
    
    # Sonuç değerlendirmesi
    marjinal_uygun = 200 <= marjinal_emsal
    mutlak_uygun = 200 <= mutlak_emsal
    
    print(f"\n✅ Marjinal Arazi Uygunluğu: {'UYGUN' if marjinal_uygun else 'UYGUN DEĞİL'}")
    print(f"✅ Mutlak Dikili Arazi Uygunluğu: {'UYGUN' if mutlak_uygun else 'UYGUN DEĞİL'}")
    
    # Test başarı durumu
    test_basarili = (
        sonuc_marjinal.get('izin_durumu') == 'izin_verilebilir' and marjinal_uygun and
        sonuc_mutlak.get('izin_durumu') == ('izin_verilebilir' if mutlak_uygun else 'izin_verilemez') and
        dogrudan_sonuc_20.get('success') == True and
        dogrudan_sonuc_5.get('success') == (True if mutlak_uygun else False)
    )
    
    print(f"\n🎯 PHASE 2 - Adım 3 Test Sonucu: {'✅ BAŞARILI' if test_basarili else '❌ BAŞARISIZ'}")
    
    if test_basarili:
        print("🎉 Tarımsal amaçlı depo başarıyla dinamik %20/%5 sistemine çevrildi!")
        print("📈 Proje durumu: %35 → %38")
    else:
        print("⚠️ Test başarısız, dinamikleştirme kontrol edilmeli")
    
    return test_basarili

if __name__ == "__main__":
    test_tarimsal_depo_dinamik_emsal()
