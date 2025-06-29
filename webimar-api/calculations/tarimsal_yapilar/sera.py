"""
Bu modül, sera ve ilgili yapılar için kuralları uygulayan fonksiyonları içerir.
GES bilgilendirme odaklı hesaplamalar da bu modülde bulunur.
"""
import json
import logging

# Sera için sabitler constants.py'den buraya taşındı.
SERA_MIN_IDARI_TEKNIK_BINA_ALANI_M2 = 20
SERA_IDARI_BINA_SERA_ALANINA_ORANI_MAX = 0.05  # %5
SERA_GES_ZEMINE_PROJE_ALANINA_ORANI_MAX = 0.015  # %1.5
# SERA_VARSAYILAN_ALAN_ORANI bu modülde doğrudan kullanılmıyor, ana_modul.py'de kullanılıyor.

# Logger tanımla
logger = logging.getLogger(__name__)

def _olustur_html_mesaj_sera(sonuc_data: dict, toplam_proje_alani_m2: float, planlanan_sera_alani_m2: float) -> str:
    """
    Sera projesi hesaplama sonuçlarını HTML formatında okunabilir bir mesaja dönüştürür.
    """
    mesaj_html = f"<b>=== SERA PROJESİ DEĞERLENDİRME RAPORU ===</b><br><br>"
    mesaj_html += f"<b>GİRİŞ BİLGİLERİ:</b><br>"
    mesaj_html += f"- Toplam Proje Alanı (Arazi Büyüklüğü): {toplam_proje_alani_m2:,.2f} m²<br>".replace(",", ".")
    mesaj_html += f"- Planlanan Sera Alanı: {planlanan_sera_alani_m2:,.2f} m²<br><br>".replace(",", ".")

    mesaj_html += f"<b>İDARİ VE TEKNİK BİNA DURUMU:</b><br>"
    idari_bina_durumu_metin = sonuc_data.get('idari_bina_durumu_metin', 'Hesaplanamadı.')
    idari_bina_izin_alan = sonuc_data.get('idari_bina_izin_verilen_alan_m2', 0)
    
    mesaj_html += f"- {idari_bina_durumu_metin}<br>"
    mesaj_html += f"- İzin Verilen Maksimum İdari ve Teknik Bina Alanı: {idari_bina_izin_alan:,.2f} m²<br><br>".replace(",", ".")

    mesaj_html += f"<b>GÜNEŞ ENERJİSİ SANTRALİ (GES) BİLGİLENDİRMESİ:</b><br>"
    ges_bilgisi_metin = sonuc_data.get('ges_bilgisi_metin', 'GES hakkında bilgi bulunmamaktadır.')
    # GES bilgisini daha okunabilir hale getirelim
    ges_bilgisi_html = ges_bilgisi_metin.replace("\n- ", "<br>- ").replace("\n", "<br>")
    if ges_bilgisi_metin.startswith("Güneş Enerjisi Santrali (GES) Hakkında Genel Bilgi:\n"):
         ges_bilgisi_html = ges_bilgisi_html.replace("Güneş Enerjisi Santrali (GES) Hakkında Genel Bilgi:<br>", "") # Başlığı çıkardık, zaten yukarıda var
    
    mesaj_html += f"{ges_bilgisi_html}<br><br>"

    # Genel Sonuç (ana_modul.py'den gelen mesajı da içerebilir veya burada özetlenebilir)
    if "izin_durumu" in sonuc_data: # Bu ana_modul'den gelen genel sonucu gösterir
        if sonuc_data["izin_durumu"] == "izin_verilebilir":
            mesaj_html += f"<span style='color: green;'><b>GENEL SONUÇ: SERA YAPIMINA İZİN VERİLEBİLİR</b></span><br>"
            mesaj_html += f"Belirtilen {planlanan_sera_alani_m2:,.2f} m² sera alanı ve buna bağlı {idari_bina_izin_alan:,.2f} m² idari/teknik bina için yapılaşma genel olarak uygundur.<br>".replace(",", ".")
        else:
            mesaj_html += f"<span style='color: red;'><b>GENEL SONUÇ: {sonuc_data.get('mesaj', 'Detaylı bilgiye ulaşılamadı.')}</b></span><br>"
    
    return mesaj_html

def sera_projesi_bilgilendirme(
    toplam_proje_alani_m2: float,
    planlanan_sera_alani_m2: float,
) -> dict:
    """
    Sera projesi için idari bina kurallarını hesaplar ve GES hakkında genel bilgi verir.
    Bu fonksiyon artık doğrudan HTML mesajı üretmeyecek, ham verileri döndürecek.
    """
    sonuclar = {
        "idari_bina_izin_verilen_alan_m2": 0.0,
        "idari_bina_durumu_metin": "", # Düz metin olarak durum
        "ges_bilgisi_metin": ""      # Düz metin olarak GES bilgisi
    }

    maks_idari_bina_hesaplanan_alan_m2 = planlanan_sera_alani_m2 * SERA_IDARI_BINA_SERA_ALANINA_ORANI_MAX
    
    if maks_idari_bina_hesaplanan_alan_m2 < SERA_MIN_IDARI_TEKNIK_BINA_ALANI_M2:
        sonuclar["idari_bina_izin_verilen_alan_m2"] = SERA_MIN_IDARI_TEKNIK_BINA_ALANI_M2
        sonuclar["idari_bina_durumu_metin"] = (
            f"Planladığınız {planlanan_sera_alani_m2:,.2f} m² sera alanı için hesaplanan %{SERA_IDARI_BINA_SERA_ALANINA_ORANI_MAX*100:.0f}'lik oran ({maks_idari_bina_hesaplanan_alan_m2:,.2f} m²), "
            f"minimum {SERA_MIN_IDARI_TEKNIK_BINA_ALANI_M2:,.0f} m² şartının altında kaldığından, "
            f"yapabileceğiniz idari ve teknik bina alanı en fazla {SERA_MIN_IDARI_TEKNIK_BINA_ALANI_M2:,.2f} m² olacaktır."
        ).replace(",",".")
    else:
        sonuclar["idari_bina_izin_verilen_alan_m2"] = maks_idari_bina_hesaplanan_alan_m2
        sonuclar["idari_bina_durumu_metin"] = (
            f"Planladığınız {planlanan_sera_alani_m2:,.2f} m² sera alanı için, "
            f"bu alanın en fazla %{SERA_IDARI_BINA_SERA_ALANINA_ORANI_MAX*100:.0f}'i kadar (yani {maks_idari_bina_hesaplanan_alan_m2:,.2f} m²) "
            f"ve en az {SERA_MIN_IDARI_TEKNIK_BINA_ALANI_M2:,.0f} m² olmak şartıyla idari ve teknik bina yapabilirsiniz. "
            f"Bu durumda maksimum {maks_idari_bina_hesaplanan_alan_m2:,.2f} m² yapabilirsiniz."
        ).replace(",",".")

    logger.info(f"Sera idari bina hesaplaması: Sera alanı={planlanan_sera_alani_m2} m², " 
               f"maks idari bina={sonuclar['idari_bina_izin_verilen_alan_m2']} m²")

    sonuclar["ges_bilgisi_metin"] = (
        "Güneş Enerjisi Santrali (GES) Hakkında Genel Bilgi:\n"
        "- Sera üzerine GES kurulması: Bitkisel üretim tekniği açısından uygun olmaması ve serada yapılan bitkisel üretime olumsuz etkisi nedeniyle genellikle uygun görülmemektedir.\n"
        "- Zemine GES Kurulumu: Eğer arazinizin sınıfı 'marjinal tarım arazisi (TA)' ise, talep edilmesi durumunda proje alanınızın en fazla "
        f"%{SERA_GES_ZEMINE_PROJE_ALANINA_ORANI_MAX*100:.1f}'ine zemine GES kurulmasına izin verilebilir. Bu durum, arazinizin resmi sınıflandırmasına bağlıdır."
    )
    
    # Özet mesaj artık _olustur_html_mesaj_sera tarafından oluşturulacak.
    # Bu fonksiyon sadece ham verileri döndürecek.
    return sonuclar

def sera_degerlendir(data):
    """
    Sera hesaplama fonksiyonu - API endpoint için
    
    Args:
        data: Form verilerini içeren dict
        
    Returns:
        dict: Hesaplama sonuçları
    """
    try:
        # Form verilerini parse et - doğru field adlarını kullan
        arazi_alani = float(data.get('arazi_buyuklugu_m2', 0))
        sera_alani = float(data.get('sera_alani_m2', arazi_alani * 0.8))  # Varsayılan %80
        
        # Arazi bilgileri
        arazi_bilgileri = {
            "buyukluk_m2": arazi_alani,
            "ana_vasif": data.get('arazi_vasfi', 'TA'),
        }
        
        # Sera bilgileri
        sera_bilgileri = {
            "sera_alani_m2": sera_alani,
        }
        
        # Ana hesaplama
        sonuc = hesapla_sera_yapilasma_kurallari(arazi_bilgileri, sera_bilgileri)
        
        # API response formatına dönüştür
        response = {
            "success": True,
            "sonuc": "SERA YAPILABİLİR",
            "maksimum_sera_alani": sera_alani,
            "maksimum_idari_bina_alani": sonuc["maksimum_idari_bina_alani"],
            "mesaj": sonuc["mesaj"],
            "detaylar": {
                "arazi_alani": arazi_alani,
                "sera_alani": sera_alani,
                "idari_bina_alani": sonuc["maksimum_idari_bina_alani"],
                "izin_durumu": sonuc["izin_durumu"]
            }
        }
        
        return response
        
    except Exception as e:
        logger.error(f"Sera hesaplama hatası: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": "Sera hesaplama sırasında hata oluştu"
        }

def hesapla_sera_yapilasma_kurallari(arazi_bilgileri, sera_bilgileri):
    """
    Sera yapılaşma kurallarını hesaplar ve değerlendirir.
    HTML mesajını _olustur_html_mesaj_sera kullanarak oluşturur.
    """
    arazi_buyuklugu_m2 = arazi_bilgileri.get("buyukluk_m2", 0)
    arazi_vasfi = arazi_bilgileri.get("ana_vasif", "belirlenmemiş")
    planlanan_sera_alani_m2 = sera_bilgileri.get("sera_alani_m2", 0)
    
    logger.info(f"Sera bilgileri: {json.dumps(sera_bilgileri, default=str)}")
    
    bilgilendirme_verileri = sera_projesi_bilgilendirme(
        toplam_proje_alani_m2=arazi_buyuklugu_m2,
        planlanan_sera_alani_m2=planlanan_sera_alani_m2,
    )
    
    logger.info(f"İdari bina izin verilen alan: {bilgilendirme_verileri['idari_bina_izin_verilen_alan_m2']} m²")
    logger.info(f"İdari bina durumu (metin): {bilgilendirme_verileri['idari_bina_durumu_metin']}")
    
    sonuc = {
        "izin_durumu": "izin_verilebilir",
        "mesaj": "", # Bu ana HTML mesajı olacak
        "maksimum_taban_alani": planlanan_sera_alani_m2, # Bu seranın taban alanı
        "maksimum_idari_bina_alani": bilgilendirme_verileri["idari_bina_izin_verilen_alan_m2"],
        # Ham verileri de ekleyelim, HTML mesajı oluşturulurken kullanılacak
        "idari_bina_durumu_metin": bilgilendirme_verileri["idari_bina_durumu_metin"],
        "ges_bilgisi_metin": bilgilendirme_verileri["ges_bilgisi_metin"],
        "idari_bina_izin_verilen_alan_m2": bilgilendirme_verileri["idari_bina_izin_verilen_alan_m2"], # _olustur_html_mesaj_sera için
        "uyari_mesaji_ozel_durum": "", # Gerekirse doldurulabilir
        "sonraki_adim_bilgisi": ""    # Gerekirse doldurulabilir
    }
    
    # HTML mesajını oluştur
    # ana_modul.py'den gelen genel mesajı da dikkate alabiliriz, şimdilik sadece sera özelinde oluşturalım.
    # ana_modul.py'deki mesaj, bu mesajın bir parçası olarak eklenebilir veya ayrı yönetilebilir.
    # Şimdilik, ana_modul.py'nin kendi mesajını koruduğunu varsayalım ve bu mesajı daha çok detay olarak düşünelim.
    # Ancak, idealde tek bir kapsamlı HTML mesajı olmalı.
    # Bu yüzden, ana_modul.py'nin sonuc["mesaj"]'ını buraya aktarıp birleştirebiliriz.
    # Ya da ana_modul.py bu fonksiyondan dönen mesajı direkt kullanır.
    # İkinci yaklaşım daha temiz.
    
    # `sonuc` sözlüğünü _olustur_html_mesaj_sera'ya gönderiyoruz.
    # Bu fonksiyon, `sonuc` içindeki `izin_durumu` gibi anahtar bilgilere de erişebilir.
    sonuc["mesaj"] = _olustur_html_mesaj_sera(sonuc, arazi_buyuklugu_m2, planlanan_sera_alani_m2)
    
    # ana_modul.py'nin sonraki_adim_bilgisi'ni de bu HTML mesajına dahil edebiliriz.
    # Şimdilik, ana_modul.py'nin bu alanı ayrıca yönettiğini varsayalım.
    # sonuc["sonraki_adim_bilgisi"] = "Detaylar yukarıdaki değerlendirme raporunda belirtilmiştir." 
    # Bu satır yerine, _olustur_html_mesaj_sera'nın bu bilgiyi zaten içerdiğini varsayıyoruz.

    logger.info(f"Sera kuralları sonuç (HTML mesajı dahil): {json.dumps(sonuc, default=str, ensure_ascii=False)}")
    
    return sonuc
