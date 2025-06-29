#!/usr/bin/env python3
"""
Arazi tiplerinin yeni API projesine doğru bir şekilde taşındığını test eden dosya
"""

from calculations.tarimsal_yapilar.constants import (
    ARAZI_TIPLERI,
    YAPI_TURLERI,
    ARAZI_TIPI_ID_TO_AD,
    YAPI_TURU_ID_TO_AD,
    ARAZI_TIPI_AD_TO_ID,
    YAPI_TURU_AD_TO_ID
)

def test_arazi_tipleri():
    """Arazi tiplerinin doğru bir şekilde tanımlandığını test eder"""
    print("=== ARAZİ TİPLERİ TESTİ ===")
    
    # Arazi tiplerinin varlığını kontrol et
    assert len(ARAZI_TIPLERI) == 11, f"Beklenen arazi tipi sayısı: 11, Bulunan: {len(ARAZI_TIPLERI)}"
    
    # İlk birkaç arazi tipini kontrol et
    expected_arazi = [
        {"id": 1, "ad": "Tarla + herhangi bir dikili vasıflı"},
        {"id": 2, "ad": "Dikili vasıflı"},
        {"id": 10, "ad": "Tarla"},
        {"id": 8, "ad": "Zeytinlik"}
    ]
    
    for expected in expected_arazi:
        found = any(a["id"] == expected["id"] and a["ad"] == expected["ad"] for a in ARAZI_TIPLERI)
        assert found, f"Arazi tipi bulunamadı: {expected}"
        print(f"✓ Arazi tipi bulundu: ID={expected['id']}, Ad={expected['ad']}")
    
    print(f"✓ Toplam {len(ARAZI_TIPLERI)} arazi tipi başarıyla yüklendi")

def test_yapi_turleri():
    """Yapı türlerinin doğru bir şekilde tanımlandığını test eder"""
    print("\n=== YAPI TÜRLERİ TESTİ ===")
    
    # Yapı türlerinin varlığını kontrol et
    assert len(YAPI_TURLERI) == 27, f"Beklenen yapı türü sayısı: 27, Bulunan: {len(YAPI_TURLERI)}"
    
    # İlk birkaç yapı türünü kontrol et
    expected_yapi = [
        {"id": 1, "ad": "Solucan ve solucan gübresi üretim tesisi"},
        {"id": 17, "ad": "Süt Sığırcılığı Tesisi"},
        {"id": 3, "ad": "Sera"},
        {"id": 14, "ad": "Bağ evi"}
    ]
    
    for expected in expected_yapi:
        found = any(y["id"] == expected["id"] and y["ad"] == expected["ad"] for y in YAPI_TURLERI)
        assert found, f"Yapı türü bulunamadı: {expected}"
        print(f"✓ Yapı türü bulundu: ID={expected['id']}, Ad={expected['ad']}")
    
    print(f"✓ Toplam {len(YAPI_TURLERI)} yapı türü başarıyla yüklendi")

def test_mapping_functions():
    """Mapping fonksiyonlarının doğru çalıştığını test eder"""
    print("\n=== MAPPİNG FONKSİYONLARI TESTİ ===")
    
    # Arazi tipi mapping testleri
    assert ARAZI_TIPI_ID_TO_AD[1] == "Tarla + herhangi bir dikili vasıflı"
    assert ARAZI_TIPI_AD_TO_ID["Tarla"] == 10
    assert ARAZI_TIPI_ID_TO_AD[8] == "Zeytinlik"
    print("✓ Arazi tipi mapping fonksiyonları çalışıyor")
    
    # Yapı türü mapping testleri
    assert YAPI_TURU_ID_TO_AD[1] == "Solucan ve solucan gübresi üretim tesisi"
    assert YAPI_TURU_AD_TO_ID["Sera"] == 3
    assert YAPI_TURU_ID_TO_AD[17] == "Süt Sığırcılığı Tesisi"
    print("✓ Yapı türü mapping fonksiyonları çalışıyor")

def test_import_from_init():
    """__init__.py dosyasından import edilebilirliği test eder"""
    print("\n=== IMPORT TESTİ ===")
    
    try:
        from calculations.tarimsal_yapilar import (
            ARAZI_TIPLERI,
            YAPI_TURLERI,
            ARAZI_TIPI_ID_TO_AD,
            YAPI_TURU_ID_TO_AD
        )
        print("✓ Sabitler __init__.py dosyasından başarıyla import edildi")
        
        # Birkaç değeri kontrol et
        assert len(ARAZI_TIPLERI) == 11
        assert len(YAPI_TURLERI) == 27
        assert ARAZI_TIPI_ID_TO_AD[1] == "Tarla + herhangi bir dikili vasıflı"
        assert YAPI_TURU_ID_TO_AD[17] == "Süt Sığırcılığı Tesisi"
        print("✓ Import edilen değerler doğru")
        
    except ImportError as e:
        print(f"❌ Import hatası: {e}")
        raise

if __name__ == "__main__":
    try:
        test_arazi_tipleri()
        test_yapi_turleri()
        test_mapping_functions()
        test_import_from_init()
        
        print("\n" + "="*50)
        print("🎉 TÜM TESTLER BAŞARILI!")
        print("Arazi tipleri ve yapı türleri başarıyla yeni API projesine taşındı.")
        print("="*50)
        
    except Exception as e:
        print(f"\n❌ Test hatası: {e}")
        raise
