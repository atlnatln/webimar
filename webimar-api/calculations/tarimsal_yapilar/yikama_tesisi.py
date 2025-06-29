"""
Yıkama Tesisi yapılaşma kurallarını ve hesaplamalarını içeren modül
"""
import logging

# Logger tanımla
logger = logging.getLogger(__name__)

# Sabit Kurallar - PHASE 2 DİNAMİK EMSAL SİSTEMİ
DEFAULT_EMSAL_ORANI = 0.20  # %20 varsayılan (dinamik sistem için)
YIKAMA_TESISI_MIN_ARAZI_M2 = 1000  # Minimum arazi büyüklüğü (m²)
IDARI_TEKNIK_BINA_ORANI_MAX = 0.15  # %15 (Yıkama tesisi alanının)
MIN_IDARI_TEKNIK_BINA_ALANI_M2 = 30  # Minimum idari/teknik bina alanı

def yikama_tesisi_degerlendir(data, emsal_orani: float = None):
    """
    API için yıkama tesisi değerlendirme fonksiyonu
    
    Args:
        data: {
            'arazi_buyuklugu_m2': float,
            'yikama_tesisi_alani_m2': float
        }
    
    Returns:
        dict: Değerlendirme sonucu
    """
    try:
        # PHASE 2 DİNAMİK EMSAL SİSTEMİ
        kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
        
        # Parametreleri al - hem alan_m2 hem arazi_buyuklugu_m2 destekle
        arazi_buyuklugu_m2 = float(data.get('arazi_buyuklugu_m2') or data.get('alan_m2', 0))
        # Yıkama tesisi alanı gönderilmemişse emsal hakkının %30'u olarak hesapla
        yikama_tesisi_alani_m2 = float(data.get('yikama_tesisi_alani_m2', 0))
        if yikama_tesisi_alani_m2 <= 0:
            yikama_tesisi_alani_m2 = arazi_buyuklugu_m2 * kullanilacak_emsal_orani * 0.3  # Emsal hakkının %30'u - DİNAMİK EMSAL
        
        # Girdi kontrolü
        if arazi_buyuklugu_m2 <= 0:
            return {
                'success': False,
                'error': 'Arazi büyüklüğü pozitif olmalıdır',
                'izin_durumu': 'TESİS YAPILAMAZ',
                'html_mesaj': _format_html_message('TESİS YAPILAMAZ', 'Geçersiz arazi büyüklüğü', arazi_buyuklugu_m2, yikama_tesisi_alani_m2, 0, kullanilacak_emsal_orani)
            }
        
        # Minimum arazi kontrolü
        if arazi_buyuklugu_m2 < YIKAMA_TESISI_MIN_ARAZI_M2:
            return {
                'success': False,
                'error': f'Yıkama tesisi için minimum {YIKAMA_TESISI_MIN_ARAZI_M2} m² arazi gereklidir',
                'izin_durumu': 'TESİS YAPILAMAZ',
                'html_mesaj': _format_html_message(
                    'TESİS YAPILAMAZ', 
                    f'Minimum arazi büyüklüğü: {YIKAMA_TESISI_MIN_ARAZI_M2} m²', 
                    arazi_buyuklugu_m2, yikama_tesisi_alani_m2, 0, kullanilacak_emsal_orani
                )
            }
        
        # Emsal hesaplaması - DİNAMİK EMSAL
        maksimum_emsal_alani = arazi_buyuklugu_m2 * kullanilacak_emsal_orani
        
        # İdari ve teknik bina alanı hesaplaması
        idari_teknik_bina_alani = max(
            yikama_tesisi_alani_m2 * IDARI_TEKNIK_BINA_ORANI_MAX,
            MIN_IDARI_TEKNIK_BINA_ALANI_M2
        )
        
        # Toplam kapalı alan
        toplam_kapali_alan = yikama_tesisi_alani_m2 + idari_teknik_bina_alani
        
        # Emsal kontrolü
        if toplam_kapali_alan > maksimum_emsal_alani:
            return {
                'success': False,
                'error': 'Toplam kapalı alan emsal hakkını aşmaktadır',
                'izin_durumu': 'TESİS YAPILAMAZ',
                'html_mesaj': _format_html_message(
                    'TESİS YAPILAMAZ',
                    f'Toplam kapalı alan ({toplam_kapali_alan:.0f} m²) maksimum emsal alanını ({maksimum_emsal_alani:.0f} m²) aşmaktadır',
                    arazi_buyuklugu_m2, yikama_tesisi_alani_m2, maksimum_emsal_alani, kullanilacak_emsal_orani
                )
            }
        
        # Başarılı durumda kalan alan hesapla
        kalan_emsal_hakki = maksimum_emsal_alani - toplam_kapali_alan
        
        api_result = {
            'success': True,
            'arazi_buyuklugu_m2': arazi_buyuklugu_m2,
            'yikama_tesisi_alani_m2': yikama_tesisi_alani_m2,
            'idari_teknik_bina_alani_m2': idari_teknik_bina_alani,
            'toplam_kapali_alan_m2': toplam_kapali_alan,
            'maksimum_emsal_alani_m2': maksimum_emsal_alani,
            'emsal_orani': kullanilacak_emsal_orani,  # DİNAMİK EMSAL
            'kalan_emsal_hakki_m2': kalan_emsal_hakki,
            'izin_durumu': 'TESİS YAPILABİLİR',
            'html_mesaj': _format_html_message(
                'TESİS YAPILABİLİR',
                f'Yıkama tesisi kurulabilir. Yıkama tesisi: {yikama_tesisi_alani_m2:.0f} m², İdari/teknik bina: {idari_teknik_bina_alani:.0f} m². Kalan emsal hakkı: {kalan_emsal_hakki:.0f} m² (ek yapılar için kullanılabilir)',
                arazi_buyuklugu_m2, yikama_tesisi_alani_m2, maksimum_emsal_alani, kullanilacak_emsal_orani
            )
        }
        
        return api_result
        
    except Exception as e:
        logger.error(f"Yıkama tesisi değerlendirme hatası: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'izin_durumu': 'TESİS YAPILAMAZ',
            'html_mesaj': _format_html_message('TESİS YAPILAMAZ', f'Hesaplama hatası: {str(e)}', 0, 0, 0, DEFAULT_EMSAL_ORANI)
        }


def _format_html_message(izin_durumu, mesaj, arazi_buyuklugu_m2, yikama_tesisi_alani_m2, maksimum_emsal=0, emsal_orani=None):
    """HTML formatında mesaj oluştur - PHASE 2 DİNAMİK EMSAL"""
    # PHASE 2 DİNAMİK EMSAL SİSTEMİ
    kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
    durum_color = "#28a745" if izin_durumu == "TESİS YAPILABİLİR" else "#dc3545"
    durum_bg = "#d4edda" if izin_durumu == "TESİS YAPILABİLİR" else "#f8d7da"
    durum_icon = "✅" if izin_durumu == "TESİS YAPILABİLİR" else "❌"
    
    return f"""
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                <h3 style="color: {durum_color}; border-bottom: 2px solid {durum_color}; padding-bottom: 10px;">
                    {durum_icon} YIKAMA TESİSİ {izin_durumu}
                </h3>
                
                <div style="background-color: {durum_bg}; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4 style="color: #721c24; margin-top: 0;">📋 Değerlendirme Detayları</h4>
                    {mesaj}
                </div>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4 style="color: #495057; margin-top: 0;">📊 Proje Bilgileri</h4>
                    <p><strong>Arazi Büyüklüğü:</strong> {arazi_buyuklugu_m2:,.0f} m²</p>
                    <p><strong>Yıkama Tesisi Alanı:</strong> {yikama_tesisi_alani_m2:,.0f} m²</p>
                    <p><strong>Maksimum İzin Verilen Alan:</strong> {maksimum_emsal:,.0f} m²</p>
                    <p><strong>Minimum Arazi Gereksinimi:</strong> {YIKAMA_TESISI_MIN_ARAZI_M2:,.0f} m²</p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4 style="color: #856404; margin-top: 0;">📋 Yasal Dayanak</h4>
                    <p>• Maksimum emsal oranı: %{kullanilacak_emsal_orani*100}</p>
                    <p>• Minimum arazi büyüklüğü: {YIKAMA_TESISI_MIN_ARAZI_M2:,.0f} m²</p>
                    <p>• İdari/teknik bina oranı: %{IDARI_TEKNIK_BINA_ORANI_MAX*100} (yıkama tesisi alanının)</p>
                    <p>• Minimum idari/teknik bina: {MIN_IDARI_TEKNIK_BINA_ALANI_M2} m²</p>
                    <p>• Müştemilatlar: Araç yolu, kantar, laboratuvar, güvenlik odası, depolama alanı vb.</p>
                </div>
            </div>
            """


# Test fonksiyonu
if __name__ == "__main__":
    # Test verileri
    test_data = {
        'arazi_buyuklugu_m2': 2000,
        'yikama_tesisi_alani_m2': 300
    }
    
    result = yikama_tesisi_degerlendir(test_data)
    print(f"Test Sonucu: {result['izin_durumu']}")
    print(f"Success: {result['success']}")
    if result['success']:
        print(f"Kalan emsal hakkı: {result.get('kalan_emsal_hakki_m2', 0):.0f} m²")
