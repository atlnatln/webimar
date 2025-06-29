"""
Bu modül, lisanslı depo yapılaşma kurallarını ve hesaplamalarını içerir.
"""

# Sabitleri constants.py'den buraya taşıdık - PHASE 2 DİNAMİK EMSAL
DEFAULT_EMSAL_ORANI = 0.20  # %20 varsayılan emsal oranı (dinamik sistem için)
LISANSLI_DEPO_MIN_ARAZI_M2 = 3000  # Minimum arazi büyüklüğü (m²)

MUSTERMILAT_LISTESI = ["Lisanslı Depo", "Araç yolu", "İdari bina", "Çiftçi dinlenme odası", "Kantar", "Laboratuvar", "Güvenlik odası", "Teremi alanı", "Kule alanı"]

def lisansli_depo_genel_bilgilendirme(
    parsel_buyuklugu_m2: float,
    emsal_orani: float = None  # PHASE 2 DİNAMİK EMSAL PARAMETRESİ
) -> dict:
    """
    Sadece parsel büyüklüğüne göre, lisanslı depo ve müştemilatları için
    genel toplam yapılaşma hakkını hesaplar ve bilgi verir.

    Args:
        parsel_buyuklugu_m2: Toplam parsel (arazi) büyüklüğü (m²).
        emsal_orani: Emsal oranı (None ise varsayılan kullanılır).

    Returns:
        Bilgilendirme mesajını ve hesaplanan değerleri içeren bir sözlük.
    """
    # PHASE 2 DİNAMİK EMSAL SİSTEMİ
    kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
    
    sonuclar = {
        "giris_bilgileri": {
            "parsel_buyuklugu_m2": parsel_buyuklugu_m2,
        },
        "maks_toplam_kapali_yapi_hakki_m2": 0.0,
        "mesaj": ""
    }

    # Maksimum toplam kapalı yapılaşma hakkını hesapla - DİNAMİK EMSAL
    maks_toplam_kapali_yapi_hakki = parsel_buyuklugu_m2 * kullanilacak_emsal_orani
    sonuclar["maks_toplam_kapali_yapi_hakki_m2"] = maks_toplam_kapali_yapi_hakki

    sonuclar["mesaj"] = _olustur_html_mesaj_lisansli_depo(parsel_buyuklugu_m2, maks_toplam_kapali_yapi_hakki, f"%{kullanilacak_emsal_orani*100:.0f}")

    sonuclar["izin_durumu"] = "izin_verilebilir"
    
    return sonuclar

def _olustur_html_mesaj_lisansli_depo(parsel_buyuklugu_m2, maks_toplam_kapali_yapi_hakki_m2, emsal_orani_str):
    """
    Lisanslı depo için HTML formatında kullanıcı dostu bir mesaj oluşturur.
    """
    html_mesaj = f"<b>=== LİSANSLI DEPO VE MÜŞTEMİLATLARI BİLGİLENDİRME ===</b><br><br>"
    html_mesaj += f"<b>Parsel Büyüklüğü:</b> {parsel_buyuklugu_m2:,.2f} m²<br><br>"
    html_mesaj += (
        f"<b>ÖNEMLİ ŞART: Lisans Belgesi Zorunluluğu</b><br>"
        f"Bu bilgilendirme, yapılması planlanan deponun yürürlükteki mevzuata uygun bir <b>LİSANS BELGESİNE</b> "
        f"sahip olması veya bu belgeyi alabilecek olması koşuluna dayanmaktadır.<br>"
        f"<button style='margin:8px 0' onclick=\"if(window.openLisansliDepoModal){{openLisansliDepoModal();}}else{{window.open('https://ticaret.gov.tr/ic-ticaret/mevzuat/lisansli-depoculuk','_blank');}}\">"
        f"Lisanslı Depoculuk Mevzuatını Görüntüle</button><br><br><hr>"
    )
    
    html_mesaj += f"<b>1) TOPLAM KAPALI YAPILAŞMA HAKKINIZ</b><br>"
    html_mesaj += f"<ul><li>Maksimum kapalı yapılaşma hakkınız ({emsal_orani_str} emsal oranı): <b>{maks_toplam_kapali_yapi_hakki_m2:,.2f} m²</b></li>"
    html_mesaj += f"<li>Bu oran marjinal tarım arazisi için geçerli bir değerdir. Güncel ve kesin emsal oranları Tarım ve Orman İl Müdürlüğünce yapılacak etüt sonucu belirlenecektir.</li></ul><br>"
    
    html_mesaj += f"<b>2) YAPILABİLECEK TESİS VE MÜŞTEMİLATLAR (Lisans Belgesi Kapsamında)</b><br>"
    html_mesaj += "<ul>"
    for item in MUSTERMILAT_LISTESI:
        html_mesaj += f"<li>{item}</li>"
    html_mesaj += "</ul><br>"
    
    html_mesaj += f"<b>3) DİKKAT EDİLMESİ GEREKENLER</b><br>"
    html_mesaj += "<ul>"
    html_mesaj += f"<li>Lisanslı deponun kendisi ve yukarıda listelenen müştemilatlardan kapalı alan niteliğinde olanların toplamı, <b>{maks_toplam_kapali_yapi_hakki_m2:,.2f} m²</b>'yi aşmamalıdır.</li>"
    html_mesaj += f"<li>Her müştemilatın büyüklüğü, projenizin ihtiyaçlarına ve ilgili standartlara göre belirlenmelidir.</li>"
    html_mesaj += f"<li>Araç yolu gibi tamamen açık alanlar ve diğer müştemilatların (ör. teremi alanı, kule alanı) yerleşimi için ilgili imar planı ve yönetmeliklere uyulmalıdır. Açık alanlar genellikle emsal hesabına dahil edilmez, ancak toplam parsel kullanımını etkileyebilir.</li>"
    html_mesaj += "</ul><br><hr>"
    
    return html_mesaj

def lisansli_depo_degerlendir(arazi_buyuklugu_m2: float, emsal_orani: float = None) -> dict:
    """
    Arazi büyüklüğüne göre lisanslı depo kurulup kurulamayacağını değerlendirir.
    
    Args:
        arazi_buyuklugu_m2: Arazinin büyüklüğü (m²)
        emsal_orani: Emsal oranı (None ise varsayılan kullanılır)
        
    Returns:
        dict: Değerlendirme sonuçlarını içeren sözlük
    """
    sonuclar = lisansli_depo_genel_bilgilendirme(
        arazi_buyuklugu_m2, 
        emsal_orani  # PHASE 2 DİNAMİK EMSAL PARAMETRESİ
    )
    
    if arazi_buyuklugu_m2 < LISANSLI_DEPO_MIN_ARAZI_M2:
        sonuclar["izin_durumu"] = "izin_verilemez"
        sonuclar["mesaj"] = (
            f"Girdiğiniz {arazi_buyuklugu_m2:.2f} m² arazi büyüklüğü, lisanslı depo tesisi için önerilen "
            f"minimum büyüklük olan {LISANSLI_DEPO_MIN_ARAZI_M2} m²'nin altındadır. "
            f"Lisanslı depo için daha büyük bir arazi önerilmektedir."
        )
    
    return sonuclar

def lisansli_depo_degerlendir_api(data, emsal_orani: float = None):
    """
    API için lisanslı depo değerlendirme fonksiyonu - PHASE 2 DİNAMİK EMSAL
    
    Args:
        data: {
            'alan_m2': float  # Sadece arazi büyüklüğü gerekli
        }
        emsal_orani: Dinamik emsal oranı (None ise varsayılan kullanılır)
    
    Returns:
        dict: Değerlendirme sonucu
    """
    try:
        # PHASE 2 DİNAMİK EMSAL SİSTEMİ
        kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
        
        # Parametreleri al - hem alan_m2 hem arazi_buyuklugu_m2 destekle
        arazi_buyuklugu_m2 = float(data.get('arazi_buyuklugu_m2') or data.get('alan_m2', 0))
        
        # Girdi kontrolü
        if arazi_buyuklugu_m2 <= 0:
            return {
                'success': False,
                'error': 'Arazi büyüklüğü pozitif olmalıdır',
                'izin_durumu': 'TESİS YAPILAMAZ',
                'html_mesaj': _format_html_message('TESİS YAPILAMAZ', 'Geçersiz arazi büyüklüğü', arazi_buyuklugu_m2, 0, kullanilacak_emsal_orani)
            }
        
        # Minimum arazi kontrolü
        if arazi_buyuklugu_m2 < LISANSLI_DEPO_MIN_ARAZI_M2:
            return {
                'success': False,
                'error': f'Lisanslı depo için minimum {LISANSLI_DEPO_MIN_ARAZI_M2} m² arazi gereklidir',
                'izin_durumu': 'TESİS YAPILAMAZ',
                'html_mesaj': _format_html_message(
                    'TESİS YAPILAMAZ', 
                    f'Minimum arazi büyüklüğü: {LISANSLI_DEPO_MIN_ARAZI_M2} m²', 
                    arazi_buyuklugu_m2, 0, kullanilacak_emsal_orani
                )
            }
        
        # Emsal hesaplaması - DİNAMİK EMSAL
        maksimum_emsal_alani = arazi_buyuklugu_m2 * kullanilacak_emsal_orani
        
        # Başarılı durumda
        api_result = {
            'success': True,
            'arazi_buyuklugu_m2': arazi_buyuklugu_m2,
            'maksimum_emsal_alani_m2': maksimum_emsal_alani,
            'emsal_orani': kullanilacak_emsal_orani,  # DİNAMİK EMSAL
            'kalan_emsal_hakki_m2': maksimum_emsal_alani,  # Tamamı kullanılabilir
            'izin_durumu': 'TESİS YAPILABİLİR',
            'html_mesaj': _format_html_message(
                'TESİS YAPILABİLİR',
                f'Lisanslı depo tesisi kurulabilir. Toplam kullanılabilir alan: {maksimum_emsal_alani:.0f} m² (depo, araç yolu, idari bina, laboratuvar vb. için)',
                arazi_buyuklugu_m2, maksimum_emsal_alani, kullanilacak_emsal_orani
            )
        }
        
        return api_result
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'izin_durumu': 'TESİS YAPILAMAZ',
            'html_mesaj': _format_html_message('TESİS YAPILAMAZ', f'Hesaplama hatası: {str(e)}', 0, 0)
        }


def _format_html_message(izin_durumu, mesaj, arazi_buyuklugu_m2, maksimum_emsal=0, emsal_orani=None):
    """HTML formatında mesaj oluştur - kullanıcı dostu versiyon"""
    # Dinamik emsal oranını kullan
    kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
    durum_color = "#28a745" if izin_durumu == "TESİS YAPILABİLİR" else "#dc3545"
    durum_bg = "#d4edda" if izin_durumu == "TESİS YAPILABİLİR" else "#f8d7da"
    durum_icon = "✅" if izin_durumu == "TESİS YAPILABİLİR" else "❌"
    
    return f"""
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                <h3 style="color: {durum_color}; border-bottom: 2px solid {durum_color}; padding-bottom: 10px;">
                    {durum_icon} LİSANSLI DEPO TESİSİ {izin_durumu}
                </h3>
                
                <div style="background-color: {durum_bg}; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4 style="color: #721c24; margin-top: 0;">📋 Değerlendirme Sonucu</h4>
                    {mesaj}
                </div>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4 style="color: #495057; margin-top: 0;">📊 Proje Bilgileri</h4>
                    <p><strong>Arazi Büyüklüğü:</strong> {arazi_buyuklugu_m2:,.0f} m²</p>
                    <p><strong>Maksimum İzin Verilen Alan:</strong> {maksimum_emsal:,.0f} m²</p>
                    <p><strong>Minimum Arazi Gereksinimi:</strong> {LISANSLI_DEPO_MIN_ARAZI_M2:,.0f} m²</p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4 style="color: #856404; margin-top: 0;">📋 Yasal Dayanak</h4>
                    <p>• Maksimum emsal oranı: %{kullanilacak_emsal_orani*100:.0f}</p>
                    <p>• Minimum arazi büyüklüğü: {LISANSLI_DEPO_MIN_ARAZI_M2:,.0f} m²</p>
                    <p>• Müştemilatlar: Araç yolu, idari bina, laboratuvar, kantar, güvenlik odası vb.</p>
                </div>
            </div>
            """

# --- Kodun Kullanım Örneği ---
if __name__ == "__main__":
    # Test ile arazi büyüklüğü ve dinamik emsal
    parsel_alani_1 = 10000.0  # Örnek bir parsel büyüklüğü
    bilgilendirme_sonucu_1 = lisansli_depo_genel_bilgilendirme(parsel_alani_1)
    
    print(f"--- PARSEL BÜYÜKLÜĞÜ: {parsel_alani_1} m² İÇİN GENEL BİLGİLENDİRME ---")
    print(bilgilendirme_sonucu_1["mesaj"])
    print("-" * 70)

    parsel_alani_2 = 3500.0
    bilgilendirme_sonucu_2 = lisansli_depo_genel_bilgilendirme(parsel_alani_2)
    print(f"--- PARSEL BÜYÜKLÜĞÜ: {parsel_alani_2} m² İÇİN GENEL BİLGİLENDİRME ---")
    print(bilgilendirme_sonucu_2["mesaj"])
    print("-" * 70)
