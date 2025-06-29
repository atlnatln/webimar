"""
Arıcılık Tesisi Hesaplama Modülü

Bu modül, genelge.md'deki kurallara göre arıcılık tesisi hesaplamalarını yapar.
Kural: 50 arılı kovana sahip arıcılık yapılması şartıyla, bal sağım/saklama ve 
arıcılık malzeme depolaması için bir işletmeye 50 metrekare kapalı alanda 
arıhane veya arı kışlatma evi yapılabilir.
İşletmeye ilave her 50 arılı kovanlık için ilave 10 metrekare alan eklenebilir.
"""

# Sabit değerler
EMSAL_ORANI = 0.20
MINIMUM_KOVANI_SAYISI = 50  # Minimum kovan sayısı
BASE_ALAN = 50  # İlk 50 kovan için temel alan (m²)
ADDITIONAL_ALAN_PER_50_KOVAN = 10  # Her ilave 50 kovan için ek alan (m²)


def aricilik_degerlendir(data, emsal_orani: float = None):
    """
    Arıcılık tesisi hesaplama API fonksiyonu
    
    Args:
        data: Hesaplama için gerekli veriler
            - arazi_buyuklugu_m2: Arazi büyüklüğü (m²)
            - kovan_sayisi: Planlanan kovan sayısı
            
    Returns:
        dict: Hesaplama sonuçları
    """
    try:
        # Veri çıkarma
        arazi_buyuklugu_m2 = float(data.get('arazi_buyuklugu_m2', 0))
        kovan_sayisi = int(data.get('kovan_sayisi', 0))
        
        # Temel kontroller
        if arazi_buyuklugu_m2 <= 0:
            return {
                "success": False,
                "error": "Geçerli bir arazi büyüklüğü giriniz."
            }
            
        if kovan_sayisi < MINIMUM_KOVANI_SAYISI:
            return {
                "success": False,
                "error": f"Arıcılık tesisi için minimum {MINIMUM_KOVANI_SAYISI} adet kovan gereklidir."
            }
        
        # Emsal oranını belirle
        kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else EMSAL_ORANI
        
        # Emsal hesaplama
        emsal_m2 = arazi_buyuklugu_m2 * kullanilacak_emsal_orani
        
        # Gerekli kapalı alan hesaplama
        # İlk 50 kovan için 50 m²
        gerekli_alan = BASE_ALAN
        
        # İlave 50'li gruplar için ek alan
        if kovan_sayisi > MINIMUM_KOVANI_SAYISI:
            ilave_kovan_sayisi = kovan_sayisi - MINIMUM_KOVANI_SAYISI
            ilave_50_li_grup_sayisi = (ilave_kovan_sayisi + 49) // 50  # Yukarı yuvarlama
            gerekli_alan += ilave_50_li_grup_sayisi * ADDITIONAL_ALAN_PER_50_KOVAN
        
        # Yapılabilirlik kontrolü
        if gerekli_alan > emsal_m2:
            return {
                "success": True,
                "yapilanabilir": False,
                "sonuc": "TESİS YAPILAMAZ",
                "aciklama": f"{kovan_sayisi} adet kovan için {gerekli_alan} m² kapalı alan gereklidir. "
                           f"Emsal (%{kullanilacak_emsal_orani*100:.0f}) ile kullanılabilir alan: {emsal_m2:.2f} m²",
                "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
                "kovan_sayisi": kovan_sayisi,
                "gerekli_alan_m2": gerekli_alan,
                "emsal_m2": emsal_m2,
                "kalan_alan_m2": 0
            }
        
        # Başarılı hesaplama
        kalan_alan = emsal_m2 - gerekli_alan
        
        # Maksimum kovan kapasitesi hesaplama
        maks_alan_50_li_gruplar = int(emsal_m2 // ADDITIONAL_ALAN_PER_50_KOVAN)
        maks_kovan_kapasitesi = MINIMUM_KOVANI_SAYISI + (maks_alan_50_li_gruplar - 5) * 50  # İlk 50 m² için 5 grup sayılır
        
        # HTML rapor oluşturma
        html_content = f"""
        <div class="calculation-report">
            <h2>Arıcılık Tesisi Değerlendirme Raporu</h2>
            
            <div class="summary-section">
                <h3>Özet</h3>
                <div class="result-success">
                    <strong>TESİS YAPILABİLİR ({kovan_sayisi} ADET KOVAN KAPASİTELİ)</strong>
                </div>
            </div>
            
            <div class="input-section">
                <h3>Girdi Bilgileri</h3>
                <table class="info-table">
                    <tr><td>Arazi Büyüklüğü:</td><td>{arazi_buyuklugu_m2:,.0f} m²</td></tr>
                    <tr><td>Planlanan Kovan Sayısı:</td><td>{kovan_sayisi:,} adet</td></tr>
                </table>
            </div>
            
            <div class="calculation-section">
                <h3>Hesaplama Detayları</h3>
                <table class="info-table">
                    <tr><td>Emsal Oranı:</td><td>%{kullanilacak_emsal_orani*100:.0f}</td></tr>
                    <tr><td>Kullanılabilir Emsal Alanı:</td><td>{emsal_m2:,.2f} m²</td></tr>
                    <tr><td>Gerekli Kapalı Alan:</td><td>{gerekli_alan:,.0f} m²</td></tr>
                    <tr><td>Kalan Emsal Alanı:</td><td>{kalan_alan:,.2f} m²</td></tr>
                </table>
            </div>
            
            <div class="capacity-section">
                <h3>Kapasite Analizi</h3>
                <table class="info-table">
                    <tr><td>Mevcut Kapasite:</td><td>{kovan_sayisi} adet kovan</td></tr>
                    <tr><td>Maksimum Olası Kapasite:</td><td>{maks_kovan_kapasitesi} adet kovan</td></tr>
                </table>
            </div>
            
            <div class="rules-section">
                <h3>Uygulanan Kurallar</h3>
                <ul>
                    <li>Minimum {MINIMUM_KOVANI_SAYISI} arılı kovan şartı</li>
                    <li>İlk {MINIMUM_KOVANI_SAYISI} kovan için {BASE_ALAN} m² temel alan</li>
                    <li>Her ilave {MINIMUM_KOVANI_SAYISI} kovan için {ADDITIONAL_ALAN_PER_50_KOVAN} m² ek alan</li>
                    <li>%{int(EMSAL_ORANI*100)} emsal oranı uygulanır</li>
                </ul>
            </div>
            
            <div class="legal-section">
                <h3>Yasal Dayanak</h3>
                <p>Bu hesaplama, Tarım Arazilerinin Korunması, Kullanılması ve Planlanmasına Dair Yönetmelik 
                ve ilgili genelge hükümlerine göre yapılmıştır.</p>
            </div>
        </div>
        
        <style>
        .calculation-report {{ font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
        .summary-section {{ margin-bottom: 20px; }}
        .result-success {{ background-color: #d4edda; color: #155724; padding: 15px; border-radius: 5px; text-align: center; }}
        .info-table {{ width: 100%; border-collapse: collapse; margin-bottom: 15px; }}
        .info-table td {{ padding: 8px; border: 1px solid #ddd; }}
        .info-table td:first-child {{ font-weight: bold; background-color: #f8f9fa; }}
        h2, h3 {{ color: #2c3e50; }}
        .rules-section ul {{ margin-left: 20px; }}
        .legal-section {{ margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }}
        </style>
        """
        
        return {
            "success": True,
            "yapilanabilir": True,
            "sonuc": f"TESİS YAPILABİLİR ({kovan_sayisi} ADET KOVAN KAPASİTELİ)",
            "html_content": html_content,
            "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
            "kovan_sayisi": kovan_sayisi,
            "gerekli_alan_m2": gerekli_alan,
            "emsal_m2": emsal_m2,
            "kalan_alan_m2": kalan_alan,
            "maksimum_kovan_kapasitesi": maks_kovan_kapasitesi
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Hesaplama hatası: {str(e)}"
        }

import logging
logger = logging.getLogger('calculations')

def aricilik_frontend_degerlendir(data: dict) -> dict:
    """
    Frontend'den gelen parametreleri backend formatına dönüştürerek arıcılık tesisi değerlendirmesi yapar
    
    Args:
        data: Frontend'den gelen veri (alan_m2, arazi_vasfi, vs.)
        
    Returns:
        dict: Değerlendirme sonuçlarını içeren sözlük
    """
    try:
        # Frontend parametrelerini backend formatına dönüştür
        alan_m2 = data.get('alan_m2') or data.get('alan', 0)
        arazi_vasfi = data.get('arazi_vasfi', 'tarım')
        
        # Emsal oranı parametresini al (frontend'deki butonlardan gelen değer)
        emsal_orani = data.get('emsal_orani', None)
        emsal_turu = data.get('emsalTuru') or data.get('emsal_turu')
        # Eğer emsal_orani yoksa, emsal_turu'na göre belirle
        if emsal_orani is None and emsal_turu:
            if emsal_turu in ['mutlak_dikili', 'mutlak', 'dikili']:
                emsal_orani = 0.05
            elif emsal_turu in ['marjinal', 'marjinal_tarim']:
                emsal_orani = 0.20
        
        # Arıcılık tesisi için varsayılan kovan sayısı (minimum 50)
        # Frontend'de kovan sayısı girisi yoksa optimal kovan sayısını hesaplayalım
        kovan_sayisi = data.get('kovan_sayisi')
        if not kovan_sayisi:
            # Dinamik emsal oranını kullanarak optimal kovan sayısını hesapla
            kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else EMSAL_ORANI
            emsal_m2 = float(alan_m2) * kullanilacak_emsal_orani
            # Maksimum yapılabilir kovan sayısını hesapla
            if emsal_m2 >= BASE_ALAN:
                # İlk 50 kovan için 50 m², sonraki her 50 kovan için 10 m²
                kalan_emsal = emsal_m2 - BASE_ALAN
                ek_kovan_grubu = int(kalan_emsal / ADDITIONAL_ALAN_PER_50_KOVAN)
                kovan_sayisi = MINIMUM_KOVANI_SAYISI + (ek_kovan_grubu * 50)
            else:
                kovan_sayisi = MINIMUM_KOVANI_SAYISI
        
        # Backend için gerekli format
        backend_data = {
            'arazi_buyuklugu_m2': alan_m2,
            'kovan_sayisi': kovan_sayisi
        }
        
        # Ana değerlendirme fonksiyonunu emsal_orani ile çağır
        result = aricilik_degerlendir(backend_data, emsal_orani)
        
        # Sonucu frontend için uygun formata dönüştür
        if result.get('success'):
            return {
                'success': True,
                'sonuc': result.get('sonuc', 'Arıcılık tesisi kurulabilir'),
                'mesaj': result.get('html_content', ''),
                'html_mesaj': result.get('html_content', ''),
                'detaylar': result,
                'izin_durumu': 'izin_verilebilir' if result.get('yapilanabilir') else 'izin_verilemez'
            }
        else:
            return {
                'success': False,
                'error': result.get('error', 'Arıcılık tesisi hesaplama hatası'),
                'mesaj': result.get('error', 'Arıcılık tesisi hesaplama hatası'),
                'izin_durumu': 'izin_verilemez'
            }
        
    except Exception as e:
        logger.error(f"Arıcılık tesisi frontend wrapper error: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'mesaj': f'Arıcılık tesisi hesaplama sırasında hata oluştu: {str(e)}',
            'izin_durumu': 'izin_verilemez'
        }