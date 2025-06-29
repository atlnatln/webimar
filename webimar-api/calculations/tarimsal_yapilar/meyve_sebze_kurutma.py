"""
Meyve Sebze Kurutma Alanı yapılaşma kurallarını ve hesaplamalarını içeren modül
"""
import logging

# Logger tanımla
logger = logging.getLogger(__name__)

# Sabit Kurallar - PHASE 2 DİNAMİK EMSAL SİSTEMİ
DEFAULT_EMSAL_ORANI = 0.20  # %20 varsayılan (dinamik sistem için)
MEYVE_SEBZE_KURUTMA_MIN_ARAZI_M2 = 1000  # Minimum arazi büyüklüğü (m²)
IDARI_TEKNIK_BINA_ORANI_MAX = 0.08  # %8 (Kurutma alanının - açık alan olduğu için daha düşük)
MIN_IDARI_TEKNIK_BINA_ALANI_M2 = 25  # Minimum idari/teknik bina alanı

def meyve_sebze_kurutma_degerlendir(data, emsal_orani: float = None):
    """
    API için meyve sebze kurutma alanı değerlendirme fonksiyonu
    
    Args:
        data: {
            'arazi_bilgileri': {
                'parsel_alani': float
            },
            'yapi_bilgileri': {
                'kurutma_alani': float
            }
        }
    
    Returns:
        dict: Değerlendirme sonucu
    """
    try:
        # PHASE 2 DİNAMİK EMSAL SİSTEMİ
        kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
        
        # Parametreleri al - hem flat hem nested JSON destekle
        if 'arazi_bilgileri' in data and 'yapi_bilgileri' in data:
            # Nested JSON format (eski format)
            arazi_bilgileri = data.get('arazi_bilgileri', {})
            yapi_bilgileri = data.get('yapi_bilgileri', {})
            arazi_buyuklugu_m2 = float(arazi_bilgileri.get('parsel_alani', 0))
            kurutma_alani_m2 = float(yapi_bilgileri.get('kurutma_alani', 0))
        else:
            # Flat JSON format (frontend'den gelen)
            arazi_buyuklugu_m2 = float(data.get('arazi_buyuklugu_m2') or data.get('alan_m2', 0))
            kurutma_alani_m2 = float(data.get('kurutma_alani_m2', 0))
            # Kurutma alanı girilmemişse arazi alanının %60'ı olarak hesapla (açık alan)
            if kurutma_alani_m2 <= 0:
                kurutma_alani_m2 = arazi_buyuklugu_m2 * 0.6
        
        # Girdi kontrolü
        if arazi_buyuklugu_m2 <= 0:
            return {
                'success': False,
                'error': 'Arazi büyüklüğü pozitif olmalıdır',
                'izin_durumu': 'TESİS YAPILAMAZ',
                'html_mesaj': _format_html_message('TESİS YAPILAMAZ', 'Geçersiz arazi büyüklüğü', arazi_buyuklugu_m2, kurutma_alani_m2, 0, kullanilacak_emsal_orani)
            }
        
        # Minimum arazi kontrolü
        if arazi_buyuklugu_m2 < MEYVE_SEBZE_KURUTMA_MIN_ARAZI_M2:
            return {
                'success': False,
                'error': f'Meyve sebze kurutma alanı için minimum {MEYVE_SEBZE_KURUTMA_MIN_ARAZI_M2} m² arazi gereklidir',
                'izin_durumu': 'TESİS YAPILAMAZ',
                'html_mesaj': _format_html_message(
                    'TESİS YAPILAMAZ', 
                    f'Minimum arazi büyüklüğü: {MEYVE_SEBZE_KURUTMA_MIN_ARAZI_M2} m²', 
                    arazi_buyuklugu_m2, kurutma_alani_m2, 0, kullanilacak_emsal_orani
                )
            }
        
        # Emsal hesaplaması - DİNAMİK EMSAL
        maksimum_emsal_alani = arazi_buyuklugu_m2 * kullanilacak_emsal_orani
        
        # İdari ve teknik bina alanı hesaplaması (açık alan kurutma için düşük oran)
        idari_teknik_bina_alani = max(
            kurutma_alani_m2 * IDARI_TEKNIK_BINA_ORANI_MAX,
            MIN_IDARI_TEKNIK_BINA_ALANI_M2
        )
        
        # Not: Açık alan kurutma alanı emsal hesabına dahil edilmez, sadece idari bina dahil
        toplam_kapali_alan = idari_teknik_bina_alani  # Sadece kapalı alan
        
        # Emsal kontrolü (sadece kapalı alan için)
        if toplam_kapali_alan > maksimum_emsal_alani:
            return {
                'success': False,
                'error': 'İdari/teknik bina alanı emsal hakkını aşmaktadır',
                'izin_durumu': 'TESİS YAPILAMAZ',
                'html_mesaj': _format_html_message(
                    'TESİS YAPILAMAZ',
                    f'İdari/teknik bina alanı ({toplam_kapali_alan:.0f} m²) maksimum emsal alanını ({maksimum_emsal_alani:.0f} m²) aşmaktadır',
                    arazi_buyuklugu_m2, kurutma_alani_m2, maksimum_emsal_alani, kullanilacak_emsal_orani
                )
            }
        
        # Başarılı durumda kalan alan hesapla
        kalan_emsal_hakki = maksimum_emsal_alani - toplam_kapali_alan
        
        # Açık alan kontrolü (kurutma alanının arazi içinde kalması)
        if kurutma_alani_m2 > arazi_buyuklugu_m2 * 0.80:  # Arazinin %80'inden fazla olamaz
            return {
                'success': False,
                'error': 'Kurutma alanı çok büyük (arazinin maksimum %80\'i kullanılabilir)',
                'izin_durumu': 'TESİS YAPILAMAZ',
                'html_mesaj': _format_html_message(
                    'TESİS YAPILAMAZ',
                    f'Kurutma alanı ({kurutma_alani_m2:.0f} m²) arazinin %80\'ini ({arazi_buyuklugu_m2 * 0.8:.0f} m²) aşmaktadır',
                    arazi_buyuklugu_m2, kurutma_alani_m2, maksimum_emsal_alani, kullanilacak_emsal_orani
                )
            }
        
        api_result = {
            'success': True,
            'arazi_buyuklugu_m2': arazi_buyuklugu_m2,
            'kurutma_alani_m2': kurutma_alani_m2,
            'idari_teknik_bina_alani_m2': idari_teknik_bina_alani,
            'toplam_kapali_alan_m2': toplam_kapali_alan,
            'maksimum_emsal_alani_m2': maksimum_emsal_alani,
            'emsal_orani': kullanilacak_emsal_orani,  # DİNAMİK EMSAL
            'kalan_emsal_hakki_m2': kalan_emsal_hakki,
            'izin_durumu': 'TESİS YAPILABİLİR',
            'html_mesaj': _format_html_message(
                'TESİS YAPILABİLİR',
                f'Meyve/sebze kurutma alanı kurulabilir. Açık kurutma alanı: {kurutma_alani_m2:.0f} m², İdari/teknik bina: {idari_teknik_bina_alani:.0f} m². Kalan emsal hakkı: {kalan_emsal_hakki:.0f} m² (ek yapılar için kullanılabilir)',
                arazi_buyuklugu_m2, kurutma_alani_m2, maksimum_emsal_alani, kullanilacak_emsal_orani  # DİNAMİK EMSAL
            )
        }
        
        return api_result
        
    except Exception as e:
        logger.error(f"Meyve sebze kurutma değerlendirme hatası: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'izin_durumu': 'TESİS YAPILAMAZ',
            'html_mesaj': _format_html_message('TESİS YAPILAMAZ', f'Hesaplama hatası: {str(e)}', 0, 0, 0, DEFAULT_EMSAL_ORANI)
        }


def _format_html_message(izin_durumu, mesaj, arazi_buyuklugu_m2, kurutma_alani_m2, maksimum_emsal=0, emsal_orani=None):
    """HTML formatında mesaj oluştur - PHASE 2 DİNAMİK EMSAL"""
    # PHASE 2 DİNAMİK EMSAL SİSTEMİ
    kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
    durum_color = "#28a745" if izin_durumu == "TESİS YAPILABİLİR" else "#dc3545"
    durum_bg = "#d4edda" if izin_durumu == "TESİS YAPILABİLİR" else "#f8d7da"
    durum_icon = "✅" if izin_durumu == "TESİS YAPILABİLİR" else "❌"
    
    return f"""
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                <h3 style="color: {durum_color}; border-bottom: 2px solid {durum_color}; padding-bottom: 10px;">
                    {durum_icon} MEYVE SEBZE KURUTMA ALANI {izin_durumu}
                </h3>
                
                <div style="background-color: {durum_bg}; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4 style="color: #721c24; margin-top: 0;">📋 Değerlendirme Detayları</h4>
                    {mesaj}
                </div>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4 style="color: #495057; margin-top: 0;">📊 Proje Bilgileri</h4>
                    <p><strong>Arazi Büyüklüğü:</strong> {arazi_buyuklugu_m2:,.0f} m²</p>
                    <p><strong>Açık Kurutma Alanı:</strong> {kurutma_alani_m2:,.0f} m²</p>
                    <p><strong>Maksimum İzin Verilen Kapalı Alan:</strong> {maksimum_emsal:,.0f} m²</p>
                    <p><strong>Minimum Arazi Gereksinimi:</strong> {MEYVE_SEBZE_KURUTMA_MIN_ARAZI_M2:,.0f} m²</p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4 style="color: #856404; margin-top: 0;">📋 Yasal Dayanak</h4>
                    <p>• Maksimum emsal oranı: %{kullanilacak_emsal_orani*100}</p>
                    <p>• Minimum arazi büyüklüğü: {MEYVE_SEBZE_KURUTMA_MIN_ARAZI_M2:,.0f} m²</p>
                    <p>• İdari/teknik bina oranı: %{IDARI_TEKNIK_BINA_ORANI_MAX*100} (kurutma alanının)</p>
                    <p>• Minimum idari/teknik bina: {MIN_IDARI_TEKNIK_BINA_ALANI_M2} m²</p>
                    <p>• Kurutma alanı sınırı: Arazinin maksimum %80'i</p>
                    <p>• Not: Açık kurutma alanı emsal hesabına dahil edilmez</p>
                </div>
            </div>
            """
