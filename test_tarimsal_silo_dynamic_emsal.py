#!/usr/bin/env python3
"""
Tarımsal Silo Modülü Frontend-Backend Entegrasyon Testi
Test edilen özellikler:
- Dinamik emsal oranı (%20 Marjinal / %5 Mutlak-Dikili)
- Frontend'den backend'e emsal_orani parametresi iletimi
- Kullanıcı dostu HTML çıktısı
"""
import os
import sys
import django

# Django ayarlarını yap
sys.path.insert(0, '/home/akn/Genel/web/webimar-api')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webimar_api.settings')
django.setup()

from calculations.tarimsal_yapilar import tarimsal_silo

def test_tarimsal_silo_dynamic_emsal():
    """Tarımsal silo dinamik emsal testleri"""
    print("🔧 TARIMSAL SİLO DİNAMİK EMSAL TESTLERİ")
    print("=" * 60)
    
    # Test parametreleri
    test_data = {
        'arazi_buyuklugu_m2': 10000,  # 10.000 m² arazi
        'silo_taban_alani_m2': 1500   # 1.500 m² silo taban alanı
    }
    
    print(f"📊 Test Parametreleri:")
    print(f"   Arazi Büyüklüğü: {test_data['arazi_buyuklugu_m2']:,} m²")
    print(f"   Silo Taban Alanı: {test_data['silo_taban_alani_m2']:,} m²")
    print()
    
    # Test 1: %20 Marjinal Alan Emsal
    print("🏜️ TEST 1: MARJİNAL ALAN EMSALI (%20)")
    print("-" * 40)
    
    result_20 = tarimsal_silo.hububat_silo_degerlendir(test_data, emsal_orani=0.20)
    
    print(f"✅ Sonuç: {result_20.get('sonuc', 'Bilinmiyor')}")
    print(f"📐 Emsal Oranı: %{result_20.get('emsal_orani', 0)*100:.0f}")
    print(f"🏗️ Maksimum Emsal Alanı: {result_20.get('maksimum_emsal_alani_m2', 0):,.0f} m²")
    print(f"🎯 Yapılanabilir: {'Evet' if result_20.get('yapilanabilir', False) else 'Hayır'}")
    print()
    
    # Test 2: %5 Mutlak/Dikili Alan Emsal
    print("🌱 TEST 2: MUTLAK/DİKİLİ ALAN EMSALI (%5)")
    print("-" * 40)
    
    result_5 = tarimsal_silo.hububat_silo_degerlendir(test_data, emsal_orani=0.05)
    
    print(f"✅ Sonuç: {result_5.get('sonuc', 'Bilinmiyor')}")
    print(f"📐 Emsal Oranı: %{result_5.get('emsal_orani', 0)*100:.0f}")
    print(f"🏗️ Maksimum Emsal Alanı: {result_5.get('maksimum_emsal_alani_m2', 0):,.0f} m²")
    print(f"🎯 Yapılanabilir: {'Evet' if result_5.get('yapilanabilir', False) else 'Hayır'}")
    print()
    
    # Test 3: Varsayılan emsal (None - %20 olmalı)
    print("⚙️ TEST 3: VARSAYILAN EMSAL (None)")
    print("-" * 40)
    
    result_default = tarimsal_silo.hububat_silo_degerlendir(test_data, emsal_orani=None)
    
    print(f"✅ Sonuç: {result_default.get('sonuc', 'Bilinmiyor')}")
    print(f"📐 Emsal Oranı: %{result_default.get('emsal_orani', 0)*100:.0f}")
    print(f"🏗️ Maksimum Emsal Alanı: {result_default.get('maksimum_emsal_alani_m2', 0):,.0f} m²")
    print(f"🎯 Yapılanabilir: {'Evet' if result_default.get('yapilanabilir', False) else 'Hayır'}")
    print()
    
    # Sonuçları karşılaştır
    print("📊 KARŞILAŞTIRMA SONUÇLARI")
    print("-" * 40)
    print(f"📐 %20 Emsal ile Maksimum Alan: {result_20.get('maksimum_emsal_alani_m2', 0):,.0f} m²")
    print(f"📐 %5 Emsal ile Maksimum Alan:  {result_5.get('maksimum_emsal_alani_m2', 0):,.0f} m²")
    print(f"🏜️ Marjinal ile yapılabilir: {'✅' if result_20.get('yapilanabilir', False) else '❌'}")
    print(f"🌱 Mutlak/Dikili ile yapılabilir: {'✅' if result_5.get('yapilanabilir', False) else '❌'}")
    print()
    
    # HTML çıktısının mevcut olduğunu kontrol et
    print("🖥️ HTML ÇIKTISI KONTROLÜ")
    print("-" * 40)
    html_var_20 = 'html_content' in result_20 and result_20['html_content']
    html_var_5 = 'html_content' in result_5 and result_5['html_content']
    
    print(f"📄 %20 emsal HTML çıktısı: {'✅ Mevcut' if html_var_20 else '❌ Eksik'}")
    print(f"📄 %5 emsal HTML çıktısı: {'✅ Mevcut' if html_var_5 else '❌ Eksik'}")
    
    if html_var_20:
        html_length = len(result_20['html_content'])
        print(f"📏 HTML uzunluğu: {html_length:,} karakter")
    
    print()
    
    # Frontend entegrasyonu için API formatı kontrolü
    print("🔗 FRONTEND ENTEGRASYONu KONTROLÜ")
    print("-" * 40)
    api_fields = ['success', 'yapilanabilir', 'sonuc', 'emsal_orani', 'html_content', 'izin_durumu']
    
    for field in api_fields:
        field_20 = field in result_20
        field_5 = field in result_5
        print(f"📋 {field}: {'✅' if field_20 and field_5 else '❌'}")
    
    print()
    
    # Genel başarı değerlendirmesi
    print("🎯 GENEL BAŞARI DEĞERLENDİRMESİ")
    print("-" * 40)
    
    success_criteria = [
        bool(result_20.get('success', False)),
        bool(result_5.get('success', False)),
        bool(result_default.get('success', False)),
        bool(html_var_20),
        bool(html_var_5),
        bool(result_20.get('emsal_orani') == 0.20),
        bool(result_5.get('emsal_orani') == 0.05),
        bool(result_default.get('emsal_orani') == 0.20)
    ]
    
    success_count = sum(success_criteria)
    total_criteria = len(success_criteria)
    success_rate = (success_count / total_criteria) * 100
    
    print(f"🎯 Başarı Oranı: {success_count}/{total_criteria} (%{success_rate:.0f})")
    
    if success_rate >= 90:
        print("🎉 MÜKEMMEl! Tarımsal silo dinamik emsal sistemi tam çalışıyor!")
    elif success_rate >= 75:
        print("✅ İYİ! Tarımsal silo sistemi çoğunlukla çalışıyor, küçük düzeltmeler gerekli.")
    else:
        print("⚠️ UYARI! Tarımsal silo sisteminde önemli sorunlar var, düzeltme gerekli.")
        
    return success_rate >= 75

if __name__ == "__main__":
    test_tarimsal_silo_dynamic_emsal()
