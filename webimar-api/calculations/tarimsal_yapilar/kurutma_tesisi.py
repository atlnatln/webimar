"""
Kurutma Tesisi yapılaşma kurallarını ve hesaplamalarını içeren modül
Basitleştirilmiş emsal kontrolü - sadece %20 emsal oranı kontrolü
"""
import logging

# Logger tanımla
logger = logging.getLogger(__name__)

# Sabit Kurallar - PHASE 2 DİNAMİK EMSAL SİSTEMİ
DEFAULT_EMSAL_ORANI = 0.20  # %20 varsayılan (dinamik sistem için)

def kurutma_tesisi_degerlendir(data, emsal_orani: float = None):
    """
    API için kurutma tesisi değerlendirme fonksiyonu - Basitleştirilmiş
    Sadece emsal oranı (%20) kontrolü yapar
    
    Args:
        data: {
            'alan_m2' or 'arazi_buyuklugu_m2': float
        }
    
    Returns:
        dict: Değerlendirme sonucu
    """
    try:
        # PHASE 2 DİNAMİK EMSAL SİSTEMİ
        kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
        
        # Parametreleri al - hem alan_m2 hem arazi_buyuklugu_m2 desteği
        arazi_buyuklugu_m2 = float(data.get('alan_m2') or data.get('arazi_buyuklugu_m2') or 0)
        
        # Girdi kontrolü
        if arazi_buyuklugu_m2 <= 0:
            return {
                'success': False,
                'error': 'Arazi büyüklüğü pozitif olmalıdır',
                'izin_durumu': 'TESİS YAPILAMAZ',
                'html_mesaj': _format_html_message('TESİS YAPILAMAZ', 'Geçersiz arazi büyüklüğü', arazi_buyuklugu_m2, 0, kullanilacak_emsal_orani)
            }
        
        # Emsal hesaplaması - DİNAMİK EMSAL
        maksimum_emsal_alani = arazi_buyuklugu_m2 * kullanilacak_emsal_orani
        
        # Başarılı durumda sonuç döndür
        api_result = {
            'success': True,
            'arazi_buyuklugu_m2': arazi_buyuklugu_m2,
            'maksimum_emsal_alani_m2': maksimum_emsal_alani,
            'emsal_orani': kullanilacak_emsal_orani,  # DİNAMİK EMSAL
            'izin_durumu': 'TESİS YAPILABİLİR',
            'html_mesaj': _format_html_message(
                'TESİS YAPILABİLİR',
                f'Kurutma tesisi kurulabilir. Maksimum yapılaşma alanı: {maksimum_emsal_alani:.0f} m² (%{kullanilacak_emsal_orani*100} emsal oranı ile)',
                arazi_buyuklugu_m2, maksimum_emsal_alani, kullanilacak_emsal_orani  # DİNAMİK EMSAL
            )
        }
        
        return api_result
        
    except Exception as e:
        logger.error(f"Kurutma tesisi değerlendirme hatası: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'izin_durumu': 'TESİS YAPILAMAZ',
            'html_mesaj': _format_html_message('TESİS YAPILAMAZ', f'Hesaplama hatası: {str(e)}', 0, 0, DEFAULT_EMSAL_ORANI)
        }


def _format_html_message(izin_durumu, mesaj, arazi_buyuklugu_m2, maksimum_emsal=0, emsal_orani=None):
    """HTML formatında mesaj oluştur - PHASE 2 DİNAMİK EMSAL"""
    # PHASE 2 DİNAMİK EMSAL SİSTEMİ
    kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
    durum_color = "#28a745" if izin_durumu == "TESİS YAPILABİLİR" else "#dc3545"
    durum_bg = "#d4edda" if izin_durumu == "TESİS YAPILABİLİR" else "#f8d7da"
    durum_icon = "✅" if izin_durumu == "TESİS YAPILABİLİR" else "❌"
    
    return f"""
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                <h3 style="color: {durum_color}; border-bottom: 2px solid {durum_color}; padding-bottom: 10px;">
                    {durum_icon} KURUTMA TESİSİ {izin_durumu}
                </h3>
                
                <div style="background-color: {durum_bg}; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4 style="color: #721c24; margin-top: 0;">📋 Değerlendirme Detayları</h4>
                    <p>{mesaj}</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4 style="color: #495057; margin-top: 0;">📊 Proje Bilgileri</h4>
                    <p><strong>Arazi Büyüklüğü:</strong> {arazi_buyuklugu_m2:,.0f} m²</p>
                    <p><strong>Maksimum İzin Verilen Alan:</strong> {maksimum_emsal:,.0f} m²</p>
                    <p><strong>Emsal Oranı:</strong> %{kullanilacak_emsal_orani*100}</p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4 style="color: #856404; margin-top: 0;">📋 Yasal Dayanak</h4>
                    <p>• Maksimum emsal oranı: %{kullanilacak_emsal_orani*100}</p>
                    <p>• Bu alan içerisinde kurutma tesisi, idari bina, teknik bina, depolama alanları kurulabilir</p>
                    <p>• Müştemilatlar: Araç yolu, kantar, laboratuvar, güvenlik odası vb.</p>
                </div>
            </div>
            """


# Test fonksiyonu
if __name__ == "__main__":
    # Test verileri
    test_data = {
        'arazi_buyuklugu_m2': 10000
    }
    
    result = kurutma_tesisi_degerlendir(test_data)
    # print(f"Test Sonucu: {result['izin_durumu']}")
    # print(f"Success: {result['success']}")
    # if result['success']:
    #     print(f"Maksimum yapılaşma alanı: {result.get('maksimum_emsal_alani_m2', 0):.0f} m²")
