"""
Soğuk Hava Deposu Hesaplama Modülü

Bu modül soğuk hava deposu yapılaşma kurallarını ve hesaplamalarını içerir.
Basitleştirilmiş hesaplama modeli kullanır.
"""

# Soğuk hava deposu için sabitler
DEFAULT_SOGUK_HAVA_DEPOSU_EMSAL_ORANI = 0.20  # %20 varsayılan emsal oranı (artık dinamik)
SOGUK_HAVA_DEPOSU_MIN_ARAZI_M2 = 1000  # Minimum 1000 m² arazi gereksinimi


def calculate_soguk_hava_deposu(alan_m2: float, emsal_orani: float = None) -> dict:
    """
    Soğuk hava deposu için basitleştirilmiş hesaplama yapar
    
    Args:
        alan_m2 (float): Arazi alanı
        emsal_orani (float): Dinamik emsal oranı (opsiyonel)
    """
    
    # Dinamik emsal oranını kullan
    SOGUK_HAVA_DEPOSU_EMSAL_ORANI = emsal_orani if emsal_orani is not None else DEFAULT_SOGUK_HAVA_DEPOSU_EMSAL_ORANI
    
    # Minimum arazi kontrolü
    if alan_m2 < SOGUK_HAVA_DEPOSU_MIN_ARAZI_M2:
        return {
            'success': False,
            'message': f'Soğuk hava deposu için minimum {SOGUK_HAVA_DEPOSU_MIN_ARAZI_M2} m² arazi gereklidir',
        }
    
    # Emsal hesaplama
    maksimum_emsal_alani = alan_m2 * SOGUK_HAVA_DEPOSU_EMSAL_ORANI
    
    # Basit alan dağılımı
    depo_alani_m2 = maksimum_emsal_alani * 0.70      # %70 depo alanı
    idari_alan_m2 = maksimum_emsal_alani * 0.20      # %20 idari alan
    teknik_alan_m2 = maksimum_emsal_alani * 0.10     # %10 teknik alan
    
    toplam_yapi_alani = depo_alani_m2 + idari_alan_m2 + teknik_alan_m2
    
    # Başarılı sonuç
    return {
        'success': True,
        'message': 'Soğuk hava deposu hesaplaması başarıyla tamamlandı.',
        'calculations': {
            'arazi_alani': alan_m2,
            'emsal_orani': f'{SOGUK_HAVA_DEPOSU_EMSAL_ORANI*100:.0f}%',
            'maksimum_emsal': round(maksimum_emsal_alani, 1),
            'soğuk_hava_deposu_alani': round(depo_alani_m2, 0),
            'idari_alan': round(idari_alan_m2, 0),
            'teknik_alan': round(teknik_alan_m2, 0),
            'toplam_yapi_alani': round(toplam_yapi_alani, 0),
            'kalan_emsal': round(maksimum_emsal_alani - toplam_yapi_alani, 1),
            'emsal_kullanim_orani': f'{(toplam_yapi_alani/maksimum_emsal_alani)*100:.1f}%'
        }
    }
