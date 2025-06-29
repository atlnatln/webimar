"""
Tarımsal Amaçlı Depo hesaplama modülü
Tarımsal yapılar için depo alanı hesaplamaları
PHASE 2: Dinamik %20/%5 emsal sistemi ile çalışır
"""

def calculate_tarimsal_amacli_depo(alan, emsal_orani=None):
    """
    Tarımsal amaçlı depo alanı hesaplama fonksiyonu
    PHASE 2: Dinamik emsal sistemi (Marjinal %20 / Mutlak dikili %5)
    
    Args:
        alan (float): Arazi alanı (m²)
        emsal_orani (float): Dinamik emsal oranı (%20 marjinal, %5 mutlak dikili)
        
    Returns:
        dict: Hesaplama sonuçları
    """
    
    # Tarımsal amaçlı depo için sabitler
    MIN_ALAN = 500   # Minimum arazi alanı (m²)
    DEFAULT_EMSAL_ORANI = 0.20  # %20 varsayılan (marjinal arazi)
    DEPO_ALANI = 150  # Depo alanı (m²)
    IDARI_ALAN = 30   # İdari alan (m²)
    TEKNIK_ALAN = 20  # Teknik alan (m²)
    
    # Dinamik emsal oranını kullan - PHASE 2 DİNAMİK SİSTEM
    EMSAL_ORANI = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
    
    # Emsal türünü belirle (dinamik sistem bilgisi)
    if EMSAL_ORANI == 0.05:
        emsal_turu = "Mutlak tarım arazisi, dikili tarım arazisi ve özel ürün arazileri (%5)"
    else:
        emsal_turu = "Marjinal tarım arazileri (%20)"
    
    result = {
        'success': False,
        'message': '',
        'calculations': {}
    }
    
    try:
        # Alan kontrolü
        if alan < MIN_ALAN:
            result['message'] = f'Tarımsal amaçlı depo için minimum {MIN_ALAN} m² arazi alanı gereklidir.'
            return result
        
        # Emsal hesaplama
        max_emsal = alan * EMSAL_ORANI
        
        # Yapı alanları
        toplam_yapi_alani = DEPO_ALANI + IDARI_ALAN + TEKNIK_ALAN
        
        # Emsal kontrolü
        if toplam_yapi_alani > max_emsal:
            result['message'] = f'Toplam yapı alanı ({toplam_yapi_alani} m²) maksimum emsal hakkını ({max_emsal:.1f} m²) aşmaktadır.'
            return result
        
        # Kalan emsal
        kalan_emsal = max_emsal - toplam_yapi_alani
        
        # İzin durumu
        izin_durumu = 'izin_verilebilir' if toplam_yapi_alani <= max_emsal else 'izin_verilemez'
        
        # Ana mesaj - PHASE 2 DİNAMİK SİSTEM
        ana_mesaj = f"TARIMSAL DEPO YAPILABİLİR - {emsal_turu}"
        
        # HTML mesaj oluştur - PHASE 2 DİNAMİK EMSAL SİSTEMİ
        html_mesaj = f"""
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h4 style="color: #155724; margin-top: 0;">🏬 Tarımsal Amaçlı Depo Hesaplama Sonucu</h4>
        <p><strong>Sonuç:</strong> {ana_mesaj}</p>
        
        <div style="background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-weight: bold; color: #856404;">🎯 PHASE 2: Dinamik Emsal Sistemi</p>
            <p style="margin: 5px 0 0 0; color: #856404;">Bu tesiste <strong>{emsal_turu}</strong> uygulanmaktadır.</p>
        </div>
        
        <div style="margin: 15px 0;">
            <h5 style="color: #155724;">📊 Hesaplama Detayları:</h5>
            <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Arazi Alanı:</strong> {alan:,.0f} m²</li>
                <li><strong>Dinamik Emsal Oranı:</strong> {EMSAL_ORANI*100:.0f}% ({emsal_turu})</li>
                <li><strong>Maksimum Emsal Hakkı:</strong> {max_emsal:,.1f} m²</li>
            </ul>
        </div>
        
        <div style="margin: 15px 0;">
            <h5 style="color: #155724;">🏗️ Yapı Alanları:</h5>
            <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Depo Alanı:</strong> {DEPO_ALANI} m²</li>
                <li><strong>İdari Alan:</strong> {IDARI_ALAN} m²</li>
                <li><strong>Teknik Alan:</strong> {TEKNIK_ALAN} m²</li>
                <li><strong>Toplam Yapı Alanı:</strong> {toplam_yapi_alani} m²</li>
                <li><strong>Kalan Emsal Hakkı:</strong> {kalan_emsal:,.1f} m²</li>
                <li><strong>Emsal Kullanım Oranı:</strong> {(toplam_yapi_alani/max_emsal)*100:.1f}%</li>
            </ul>
        </div>
    </div>
</div>
        """.strip()
        
        result.update({
            'success': True,
            'sonuc': ana_mesaj,
            'mesaj': html_mesaj,
            'html_mesaj': html_mesaj,
            'izin_durumu': izin_durumu,
            'depolama_kapasitesi_ton': round(DEPO_ALANI * 2.5, 1),  # Tahmini kapasite (2.5 ton/m²)
            'maksimum_insaat_alani_m2': toplam_yapi_alani,
            'detaylar': {
                'arazi_alani': alan,
                'emsal_orani': f'{EMSAL_ORANI*100:.0f}%',
                'maksimum_emsal': round(max_emsal, 1),
                'depo_alani': DEPO_ALANI,
                'idari_alan': IDARI_ALAN,
                'teknik_alan': TEKNIK_ALAN,
                'toplam_yapi_alani': toplam_yapi_alani,
                'kalan_emsal': round(kalan_emsal, 1),
                'emsal_kullanim_orani': f'{(toplam_yapi_alani/max_emsal)*100:.1f}%',
                'izin_durumu': izin_durumu,
                'depolama_kapasitesi_ton': round(DEPO_ALANI * 2.5, 1)
            }
        })
        
    except Exception as e:
        result['message'] = f'Hesaplama sırasında hata oluştu: {str(e)}'
    
    return result
