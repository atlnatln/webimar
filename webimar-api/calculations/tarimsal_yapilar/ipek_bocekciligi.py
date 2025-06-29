"""
İpek Böcekçiliği Tesisi için yapılaşma kurallarını hesaplar.
"""
import logging

# Logger tanımla
logger = logging.getLogger(__name__)

# Sabitler
IPEK_BOCEKCILIGI_MIN_ARAZI_M2 = 500
DEFAULT_EMSAL_ORANI = 0.20 # PHASE 2: Dinamik emsal oranı için varsayılan değer
# Genel emsal oranı, ana_modul.py'den EMSAL_ORANI alınacak

def _olustur_html_mesaj_ipek_bocekciligi(sonuc_data: dict, arazi_buyuklugu_m2: float, genel_emsal_orani: float) -> str:
    """
    İpek böcekçiliği tesisi hesaplama sonuçlarını HTML formatında okunabilir bir mesaja dönüştürür.
    """
    mesaj_html = f"<b>=== İPEK BÖCEKÇİLİĞİ TESİSİ DEĞERLENDİRME RAPORU ===</b><br><br>"
    mesaj_html += f"<b>GİRİŞ BİLGİLERİ:</b><br>"
    mesaj_html += f"- Arazi Büyüklüğü: {arazi_buyuklugu_m2:,.2f} m²<br>".replace(",", ".")
    mesaj_html += f"- Dut Bahçesi Durumu: {'Var' if sonuc_data.get('dut_bahcesi_var_mi') else 'Yok'}<br>"
    
    if sonuc_data.get("izin_durumu") == "izin_verilemez":
        mesaj_html += f"<br><span style='color: red;'><b>SONUÇ: TESİS YAPILAMAZ</b></span><br>"
        mesaj_html += f"<b>Açıklama:</b> {sonuc_data.get('mesaj_metin', 'Belirtilen kriterlere göre tesis yapılamaz.')}<br>"
    else:
        maks_yapilasma = sonuc_data.get('maksimum_yapilasma_alani_m2', 0)
        
        mesaj_html += f"<br><b>Minimum Arazi Şartı ({IPEK_BOCEKCILIGI_MIN_ARAZI_M2:,.0f} m²):</b> ".replace(",", ".")
        if sonuc_data.get("min_arazi_sarti_saglandi_mi"):
            mesaj_html += "<span style='color: green;'>Sağlandı</span><br>"
        else:
            # Bu durum zaten izin_verilemez bloğunda ele alınmalı, ama bir yedek olarak.
            mesaj_html += "<span style='color: red;'>Sağlanamadı</span><br>" 
        
        mesaj_html += f"<br><b>YAPI ALANLARI:</b><br>"
        mesaj_html += f"- İzin Verilen Toplam Yapılaşma Alanı (Emsal %{genel_emsal_orani*100:.0f}): {maks_yapilasma:,.2f} m²<br>".replace(",", ".")
        
        # İpek böcekçiliği tesisi için alan dağılımını göster
        besleme_evi_alani_m2 = maks_yapilasma * 0.6
        depo_alani_m2 = maks_yapilasma * 0.2
        idari_bolum_alani_m2 = maks_yapilasma * 0.2
        
        mesaj_html += f"<br><b>ÖNERİLEN ALAN DAĞILIMI:</b><br>"
        mesaj_html += f"- Besleme Evi (%60): {besleme_evi_alani_m2:,.2f} m²<br>".replace(",", ".")
        mesaj_html += f"- Depo (%20): {depo_alani_m2:,.2f} m²<br>".replace(",", ".")
        mesaj_html += f"- İdari Bölüm (%20): {idari_bolum_alani_m2:,.2f} m²<br>".replace(",", ".")
        mesaj_html += f"<br><i>Not: Bu dağılım tavsiye niteliğindedir ve projenin ihtiyaçlarına göre değiştirilebilir, fakat toplam yapılaşma alanı izin verilen maksimum değeri aşmamalıdır.</i><br>"
        
        mesaj_html += f"<br><b>GENEL DEĞERLENDİRME:</b><br>"
        mesaj_html += f"{sonuc_data.get('mesaj_metin', '')}<br>"

    return mesaj_html

def hesapla_ipek_bocekciligi_kurallari(arazi_bilgileri: dict, yapi_bilgileri: dict, emsal_orani: float = None):
    """
    İpek böcekçiliği tesisi için yapılaşma kurallarını hesaplar.
    `emsal_orani` dinamik olarak sağlanır, sağlanmazsa DEFAULT_EMSAL_ORANI kullanılır.
    """
    arazi_buyuklugu_m2 = arazi_bilgileri.get("buyukluk_m2", 0)
    dut_bahcesi_var_mi = yapi_bilgileri.get("dut_bahcesi_var_mi", False)
    buyuk_ova_icinde = arazi_bilgileri.get("buyuk_ova_icinde", False)
    
    # Dinamik emsal oranını belirle
    kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
    
    logger.info(f"İpek böcekçiliği tesisi hesaplaması başlatılıyor: arazi={arazi_buyuklugu_m2}m², dut bahçesi={dut_bahcesi_var_mi}, emsal={kullanilacak_emsal_orani}")
    
    sonuc = {
        "izin_durumu": "belirsiz",
        "mesaj_metin": "",      # Hesaplama modülünden gelen düz metin mesaj
        "mesaj": "",            # ana_modul.py'nin kullanacağı HTML mesajı
        "maksimum_taban_alani": 0, # ana_modul.py bunu kullanır (toplam kapalı alan olarak)
        "maksimum_yapilasma_alani_m2": 0, # Detay için (yukarıdakiyle aynı olabilir)
        "min_arazi_sarti_saglandi_mi": False,
        "dut_bahcesi_var_mi": dut_bahcesi_var_mi, # Sonuçta dut bahçesi durumunu da saklayalım
        "uyari_mesaji_ozel_durum": "", # ana_modul.py için
        "sonraki_adim_bilgisi": ""     # ana_modul.py için
    }

    # Dut bahçesi kontrolü
    if not dut_bahcesi_var_mi:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["mesaj_metin"] = (
            "İpek böcekçiliği tesisi için arazide dut bahçesi bulunması zorunludur. "
            "Dut bahçesi olmayan arazide ipek böcekçiliği tesisi yapılamaz."
        )
        logger.warning(f"İpek böcekçiliği tesisi için dut bahçesi yok: {arazi_buyuklugu_m2}m²")
        sonuc["mesaj"] = _olustur_html_mesaj_ipek_bocekciligi(sonuc, arazi_buyuklugu_m2, kullanilacak_emsal_orani)
        return sonuc

    if arazi_buyuklugu_m2 < IPEK_BOCEKCILIGI_MIN_ARAZI_M2:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["mesaj_metin"] = (
            f"İpek böcekçiliği tesisi için minimum arazi büyüklüğü {IPEK_BOCEKCILIGI_MIN_ARAZI_M2:,.0f} m² olmalıdır. "
            f"Mevcut arazi {arazi_buyuklugu_m2:,.2f} m² olduğundan bu alanda tesis yapımına izin verilememektedir."
        ).replace(",",".")
        sonuc["min_arazi_sarti_saglandi_mi"] = False
        logger.warning(f"İpek böcekçiliği tesisi için arazi büyüklüğü yetersiz: {arazi_buyuklugu_m2}m² < {IPEK_BOCEKCILIGI_MIN_ARAZI_M2}m²")
    else:
        sonuc["izin_durumu"] = "izin_verilebilir"
        sonuc["min_arazi_sarti_saglandi_mi"] = True
        
        # Toplam kapalı yapılaşma alanı (besleme evi, depo vb.)
        maks_kapali_yapilasma_alani_m2 = arazi_buyuklugu_m2 * kullanilacak_emsal_orani
        sonuc["maksimum_yapilasma_alani_m2"] = maks_kapali_yapilasma_alani_m2
        sonuc["maksimum_taban_alani"] = maks_kapali_yapilasma_alani_m2 # ana_modul için
        
        sonuc["mesaj_metin"] = (
            f"İpek böcekçiliği tesisi için {arazi_buyuklugu_m2:,.2f} m² arazide yapılaşmaya genel olarak izin verilebilir. "
            f"Toplam kapalı yapılaşma alanı (besleme evi, depo, idari bölüm vb. dahil, dutluk hariç) genel emsal olan %{kullanilacak_emsal_orani*100:.0f} üzerinden en fazla {maks_kapali_yapilasma_alani_m2:,.2f} m² olabilir. "
            "Arazinin önemli bir kısmı dut ağaçları için ayrılmalıdır."
        ).replace(",",".")
        sonuc["uyari_mesaji_ozel_durum"] = f"İpek böcekçiliği tesisi için dut bahçesi korunmalı ve besleme evi gibi yapılar için uygun alanlar ayrılmalıdır."
        sonuc["sonraki_adim_bilgisi"] = "İpek böcekçiliği yapımı için öncelikle Tarım ve Orman İl Müdürlüğüne başvurarak arazinizin uygunluğunu onaylatmanız gerekmektedir."
        
        if buyuk_ova_icinde:
            sonuc["uyari_mesaji_ozel_durum"] += " Araziniz Büyük Ova Koruma Alanı içinde yer aldığı için süreç uzayabilir."
        
        logger.info(f"İpek böcekçiliği tesisine izin verilebilir: arazi={arazi_buyuklugu_m2}m², max yapı={maks_kapali_yapilasma_alani_m2}m²")

    # HTML mesajını oluştur ve "mesaj" anahtarına ata
    sonuc["mesaj"] = _olustur_html_mesaj_ipek_bocekciligi(sonuc, arazi_buyuklugu_m2, kullanilacak_emsal_orani)
    
    return sonuc

def ipek_bocekciligi_kurali(arazi_buyuklugu_m2, dut_bahcesi_var_mi=False, buyuk_ova_icinde_mi=False, emsal_orani: float = None):
    """
    İpek böcekçiliği tesisi için yapılaşma kurallarını değerlendirir.
    
    Args:
        arazi_buyuklugu_m2: Arazi büyüklüğü (m²)
        dut_bahcesi_var_mi: Arazide dut bahçesi var mı?
        buyuk_ova_icinde_mi: Arazi büyük ova koruma alanı içinde mi?
        emsal_orani: Dinamik emsal oranı (varsayılan: DEFAULT_EMSAL_ORANI)
        
    Returns:
        dict: Değerlendirme sonuçlarını içeren sözlük
    """
    # Dinamik emsal oranını belirle
    kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI

    # Bu fonksiyon doğrudan hesaplama yapmıyor, sadece ön kontrol ve mesaj döndürüyor.
    # Asıl hesaplama `hesapla_ipek_bocekciligi_kurallari` içinde yapılıyor.
    # Bu nedenle, bu fonksiyonun emsal oranını doğrudan kullanması gerekmeyebilir,
    # ancak tutarlılık ve gelecekteki olası kullanımlar için parametre olarak eklendi.

    sonuc = {
        "izin_durumu": "belirsiz",
        "ana_mesaj": "",
        "detay_mesaj_bakici_evi": "",
        "uyari_mesaji_ozel_durum": "",
        "surec_bilgisi_buyuk_ova": "",
        "sonraki_adim_bilgisi": ""
    }
    
    if not dut_bahcesi_var_mi:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = (
            "İpek böcekçiliği tesisi için arazide dut bahçesi bulunması zorunludur. "
            "Dut bahçesi olmayan arazide ipek böcekçiliği tesisi yapılamaz."
        )
        return sonuc
    
    if arazi_buyuklugu_m2 < IPEK_BOCEKCILIGI_MIN_ARAZI_M2:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = (
            f"İpek böcekçiliği tesisi için minimum arazi büyüklüğü {IPEK_BOCEKCILIGI_MIN_ARAZI_M2} m² olmalıdır. "
            f"Mevcut arazi {arazi_buyuklugu_m2:.2f} m² olduğundan yapılaşmaya izin verilememektedir."
        )
        return sonuc
        
    # İzin verilebilir durumlar
    sonuc["izin_durumu"] = "izin_verilebilir"
    sonuc["ana_mesaj"] = (
        f"İpek böcekçiliği tesisi için {arazi_buyuklugu_m2:.2f} m² arazide yapılaşmaya izin verilebilir. "
        "Detaylı yapılaşma koşulları için sistemdeki hesaplama modülünü kullanınız."
    )
    
    if buyuk_ova_icinde_mi:
        sonuc["surec_bilgisi_buyuk_ova"] = (
            "Araziniz Büyük Ova Koruma Alanı içerisinde yer almaktadır. "
            "Bu durumda başvuru süreci uzayabilir ve ek izinler gerekebilir."
        )
    
    sonuc["uyari_mesaji_ozel_durum"] = (
        "İpek böcekçiliği tesisi için dut bahçesi korunmalı ve besleme evi gibi yapılar için uygun alanlar ayrılmalıdır."
    )
    
    sonuc["sonraki_adim_bilgisi"] = (
        "İpek böcekçiliği yapımı için öncelikle Tarım ve Orman İl Müdürlüğüne başvurarak "
        "arazinizin uygunluğunu onaylatmanız gerekmektedir."
    )
    
    return sonuc
