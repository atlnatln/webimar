"""
Su Depolama Tesisi Hesaplama Modülü - Basit Versiyon

Bu modül su depolama tesisleri için sadece arazi alanı girişi ile hesaplama yapar.
"""

# Su depolama tesisleri için sabitler
DEFAULT_SU_DEPOLAMA_EMSAL_ORANI = 0.20  # %20 varsayılan emsal oranı (artık dinamik)
SU_DEPOLAMA_MIN_ARAZI_M2 = 500  # Minimum 500 m² arazi gereksinimi
SU_DEPOLAMA_TEKNIK_BINA_M2 = 80  # Standart teknik bina alanı (m²)
SU_DEPOLAMA_IDARI_ALAN_M2 = 40   # Standart idari alan (m²)

def su_depolama_degerlendir(data, emsal_orani=None):
    """
    Su depolama tesisi değerlendirme fonksiyonu
    Sadece arazi alanı girişi ile basit hesaplama yapar
    
    Args:
        data: Form verileri
        emsal_orani (float): Dinamik emsal oranı (opsiyonel)
    """
    # Dinamik emsal oranını kullan
    SU_DEPOLAMA_EMSAL_ORANI = emsal_orani if emsal_orani is not None else DEFAULT_SU_DEPOLAMA_EMSAL_ORANI
    try:
        # Arazi alanını al - hem alan_m2 hem alan parametrelerini destekle
        arazi_alan = float(data.get('alan_m2', 0)) or float(data.get('arazi_buyuklugu_m2', 0)) or float(data.get('alan', 0))
        
        # Minimum arazi kontrolü
        if arazi_alan < SU_DEPOLAMA_MIN_ARAZI_M2:
            return {
                'success': False,
                'izin_durumu': 'TESİS YAPILAMAZ',
                'hata_mesaji': f'Su depolama tesisi için minimum arazi büyüklüğü {SU_DEPOLAMA_MIN_ARAZI_M2} m² olmalıdır.'
            }
        
        # Emsal hesaplaması
        maksimum_emsal_alani = arazi_alan * SU_DEPOLAMA_EMSAL_ORANI
        
        # Teknik bina ve idari alan hesaplama
        teknik_bina_alani = SU_DEPOLAMA_TEKNIK_BINA_M2
        idari_alan = SU_DEPOLAMA_IDARI_ALAN_M2
        
        # Toplam kapalı alan
        toplam_kapali_alan = teknik_bina_alani + idari_alan
        
        # Emsal kontrolü
        if toplam_kapali_alan > maksimum_emsal_alani:
            return {
                'success': False,
                'izin_durumu': 'TESİS YAPILAMAZ',
                'hata_mesaji': f'Toplam kapalı alan ({toplam_kapali_alan:.0f} m²) maksimum emsal alanını ({maksimum_emsal_alani:.0f} m²) aşıyor.'
            }
        
        # Kalan emsal hakkı
        kalan_emsal_hakki = maksimum_emsal_alani - toplam_kapali_alan
        
        # Başarılı sonuç
        return {
            'success': True,
            'izin_durumu': 'TESİS YAPILABİLİR',
            'arazi_buyuklugu_m2': arazi_alan,
            'teknik_bina_alani_m2': teknik_bina_alani,
            'idari_alan_m2': idari_alan,
            'toplam_kapali_alan_m2': toplam_kapali_alan,
            'maksimum_emsal_alani_m2': maksimum_emsal_alani,
            'kalan_emsal_hakki_m2': kalan_emsal_hakki,
            'emsal_kullanim_orani': round((toplam_kapali_alan / maksimum_emsal_alani) * 100, 1),
            'mesaj': f'Su depolama tesisi kurulabilir. Teknik bina: {teknik_bina_alani} m², İdari alan: {idari_alan} m²'
        }
        
    except Exception as e:
        return {
            'success': False,
            'izin_durumu': 'HATA',
            'hata_mesaji': f'Hesaplama sırasında hata oluştu: {str(e)}'
        }