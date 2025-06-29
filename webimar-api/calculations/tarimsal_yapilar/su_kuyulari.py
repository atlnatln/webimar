"""
Su Kuyuları Hesaplama Modülü - Basit Versiyon

Bu modül su kuyuları için sadece arazi alanı girişi ile hesaplama yapar.
"""

# Su kuyuları için sabitler
SU_KUYULARI_EMSAL_ORANI = 0.10  # %10 emsal oranı (kuyular için düşük oran)
SU_KUYULARI_MIN_ARAZI_M2 = 200  # Minimum 200 m² arazi gereksinimi
SU_KUYULARI_TEKNIK_BINA_M2 = 50  # Standart teknik bina alanı (m²)
SU_KUYULARI_IDARI_ALAN_M2 = 20   # Standart idari alan (m²)

def su_kuyulari_degerlendir(data):
    """
    Su kuyuları değerlendirme fonksiyonu
    Sadece arazi alanı girişi ile basit hesaplama yapar
    """
    try:
        # Arazi alanını al (alan_m2 veya alan parametresi)
        arazi_alan = float(data.get('alan_m2', 0) or data.get('alan', 0))
        
        # Minimum arazi kontrolü
        if arazi_alan < SU_KUYULARI_MIN_ARAZI_M2:
            return {
                'success': False,
                'izin_durumu': 'TESİS YAPILAMAZ',
                'hata_mesaji': f'Su kuyuları için minimum arazi büyüklüğü {SU_KUYULARI_MIN_ARAZI_M2} m² olmalıdır.'
            }
        
        # Emsal hesaplaması
        maksimum_emsal_alani = arazi_alan * SU_KUYULARI_EMSAL_ORANI
        
        # Teknik bina ve idari alan hesaplama
        teknik_bina_alani = SU_KUYULARI_TEKNIK_BINA_M2
        idari_alan = SU_KUYULARI_IDARI_ALAN_M2
        
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
            'mesaj': f'Su kuyuları kurulabilir. Teknik bina: {teknik_bina_alani} m², İdari alan: {idari_alan} m²'
        }
        
    except Exception as e:
        return {
            'success': False,
            'izin_durumu': 'HATA',
            'hata_mesaji': f'Hesaplama sırasında hata oluştu: {str(e)}'
        }
