"""
Hububat ve Yem Depolama Siloları İçin Yapılaşma Kurallarını Değerlendiren Python Modülü
"""
import json
import logging

# Logger tanımla
logger = logging.getLogger(__name__)

# Sabit Kurallar - PHASE 2 DİNAMİK EMSAL SİSTEMİ
DEFAULT_EMSAL_ORANI = 0.20  # %20 varsayılan (dinamik sistem için)
IDARI_TEKNIK_BINA_SILO_ALANINA_ORANI_MAKS = 0.10  # %10 (Silo taban alanının)
# Minimum idari/teknik bina alanı sabitini ekle
SILO_MIN_IDARI_TEKNIK_BINA_ALANI_M2 = 20

def silo_projesi_degerlendir(
    parsel_buyuklugu_m2: float,
    planlanan_silo_taban_alani_m2: float,
    emsal_orani: float = None  # PHASE 2 DİNAMİK EMSAL PARAMETRESİ
) -> dict:
    """
    Hububat/yem depolama silosu projesini, parsel büyüklüğü ve silo alanına göre değerlendirir.

    Args:
        parsel_buyuklugu_m2: Toplam parsel (arazi) büyüklüğü (m²).
        planlanan_silo_taban_alani_m2: Kurulması planlanan silonun taban alanı (m²).
        emsal_orani: Emsal oranı (None ise varsayılan %20 kullanılır).

    Returns:
        Değerlendirme sonucunu ve detaylı mesajı içeren bir sözlük.
    """
    # print(f"Silo değerlendirme için gelen değerler - Parsel: {parsel_buyuklugu_m2}, Silo alanı: {planlanan_silo_taban_alani_m2}, Tipler: {type(parsel_buyuklugu_m2)}, {type(planlanan_silo_taban_alani_m2)}")
    
    # PHASE 2 DİNAMİK EMSAL SİSTEMİ
    kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
    
    # Değerlerin None, boş string veya geçersiz olma durumunu kontrol et
    try:
        if parsel_buyuklugu_m2 is None or planlanan_silo_taban_alani_m2 is None:
            raise ValueError("Değerler None olamaz")
            
        # String olarak gelmişse sayıya çevir
        if isinstance(parsel_buyuklugu_m2, str):
            parsel_buyuklugu_m2 = float(parsel_buyuklugu_m2.strip())
        else:
            parsel_buyuklugu_m2 = float(parsel_buyuklugu_m2)
            
        if isinstance(planlanan_silo_taban_alani_m2, str):
            planlanan_silo_taban_alani_m2 = float(planlanan_silo_taban_alani_m2.strip())
        else:
            planlanan_silo_taban_alani_m2 = float(planlanan_silo_taban_alani_m2)
            
        # 0 veya negatif değerler için kontrol
        if parsel_buyuklugu_m2 <= 0 or planlanan_silo_taban_alani_m2 <= 0:
            raise ValueError("Değerler pozitif olmalıdır")
            
    except (ValueError, TypeError) as e:
        # Hata durumunda uyarı mesajı içeren varsayılan değerleri dön
        print(f"Silo hesaplama hatası: {str(e)}")
        return {
            "giris_bilgileri": {
                "parsel_buyuklugu_m2": 0.0,
                "planlanan_silo_taban_alani_m2": 0.0,
            },
            "maks_toplam_kapali_yapi_hakki_m2": 0.0,
            "maks_idari_teknik_bina_alani_m2": 0.0,
            "kalan_emsal_hakki_m2": 0.0,
            "senaryo_tipi": "Hata: Geçersiz Değer",
            "mesaj": f"Silo hesaplaması için geçersiz değerler girildi. Lütfen sayısal değerler girdiğinizden emin olun. Hata detayı: {str(e)}"
        }
    # Parametre kontrolü - float olmayan değerleri veya negatif değerleri reddet
    if not isinstance(parsel_buyuklugu_m2, (int, float)) or parsel_buyuklugu_m2 <= 0:
        return {
            "giris_bilgileri": {
                "parsel_buyuklugu_m2": 0.0,
                "planlanan_silo_taban_alani_m2": 0.0,
            },
            "maks_toplam_kapali_yapi_hakki_m2": 0.0,
            "maks_idari_teknik_bina_alani_m2": 0.0,
            "kalan_emsal_hakki_m2": 0.0,
            "senaryo_tipi": "Hata: Geçersiz Parsel Büyüklüğü",
            "mesaj": f"Parsel büyüklüğü geçerli bir sayı olmalı ve sıfırdan büyük olmalıdır. Girilen değer: {parsel_buyuklugu_m2}"
        }
    
    if not isinstance(planlanan_silo_taban_alani_m2, (int, float)) or planlanan_silo_taban_alani_m2 <= 0:
        return {
            "giris_bilgileri": {
                "parsel_buyuklugu_m2": parsel_buyuklugu_m2,
                "planlanan_silo_taban_alani_m2": 0.0,
            },
            "maks_toplam_kapali_yapi_hakki_m2": parsel_buyuklugu_m2 * kullanilacak_emsal_orani,  # DİNAMİK EMSAL
            "maks_idari_teknik_bina_alani_m2": 0.0,
            "kalan_emsal_hakki_m2": parsel_buyuklugu_m2 * kullanilacak_emsal_orani,  # DİNAMİK EMSAL
            "senaryo_tipi": "Hata: Geçersiz Silo Alanı",
            "mesaj": f"Silo taban alanı geçerli bir sayı olmalı ve sıfırdan büyük olmalıdır. Girilen değer: {planlanan_silo_taban_alani_m2}"
        }
    
    sonuclar = {
        "giris_bilgileri": {
            "parsel_buyuklugu_m2": parsel_buyuklugu_m2,
            "planlanan_silo_taban_alani_m2": planlanan_silo_taban_alani_m2,
        },
        "maks_toplam_kapali_yapi_hakki_m2": 0.0,
        "maks_idari_teknik_bina_alani_m2": 0.0,
        "kalan_emsal_hakki_m2": 0.0,
        "senaryo_tipi": "",
        "mesaj": ""
    }

    # Maksimum toplam kapalı yapılaşma hakkını hesapla - DİNAMİK EMSAL
    maks_toplam_kapali_yapi_hakki = parsel_buyuklugu_m2 * kullanilacak_emsal_orani
    sonuclar["maks_toplam_kapali_yapi_hakki_m2"] = maks_toplam_kapali_yapi_hakki

    # İdari ve teknik bina için maksimum alanı hesapla (silo alanı ve kalan emsal sınırı)
    # DOĞRU MANTIK: Silo alanı da emsal'e dahildir!
    oranli_idari = planlanan_silo_taban_alani_m2 * IDARI_TEKNIK_BINA_SILO_ALANINA_ORANI_MAKS
    kalan_emsal = maks_toplam_kapali_yapi_hakki - planlanan_silo_taban_alani_m2
    maks_idari_teknik_bina_alani = min(oranli_idari, max(kalan_emsal, 0.0))
    sonuclar["maks_idari_teknik_bina_alani_m2"] = maks_idari_teknik_bina_alani

    # Kalan emsal hakkını yeniden hesapla
    toplam_silo_ve_idari = planlanan_silo_taban_alani_m2 + maks_idari_teknik_bina_alani
    kalan_emsal_hakki = maks_toplam_kapali_yapi_hakki - toplam_silo_ve_idari
    sonuclar["kalan_emsal_hakki_m2"] = kalan_emsal_hakki

    # --- SENARYO 1 ---
    # Silo alanı emsal'e dahil olduğu için, silo alanı tek başına emsal'i aşabilir
    if planlanan_silo_taban_alani_m2 > maks_toplam_kapali_yapi_hakki:
        sonuclar["senaryo_tipi"] = "Senaryo 1: Tesis Büyüklüğü Emsali Aşıyor"
        sonuclar["mesaj"] = (
            f"Değerlendirme Sonucu: İstenilen Tesis Büyüklüğü Bu Parselde Yapılamaz\n\n"
            f"Girdiğiniz {parsel_buyuklugu_m2:.2f} m² parsel büyüklüğü için maksimum toplam kapalı yapılaşma hakkınız (emsal %{kullanilacak_emsal_orani*100:.0f}) {maks_toplam_kapali_yapi_hakki:.2f} m²'dir.\n"
            f"Planladığınız {planlanan_silo_taban_alani_m2:.2f} m² silo taban alanı, bu maksimum yapılaşma hakkını aşmaktadır.\n"
            f"Bu nedenle, talep ettiğiniz büyüklükte bir silo bu parselde mevcut imar koşullarına göre yapılamamaktadır.\n\n"
            f"Çözüm önerileri:\n"
            f"• Silo taban alanını maksimum {maks_toplam_kapali_yapi_hakki:.0f} m²'ye düşürünüz\n"
            f"• Daha büyük bir parsele geçiniz\n"
            f"• Daha yüksek emsal oranlı bir arazi türü seçiniz (%20 marjinal alan)\n\n"
            f"**Not:** Silo taban alanı emsal hesabına dahildir. Kantar ve kamyon yükleme/boşaltma alanları emsal'e dahil değildir."
        )
        return sonuclar

    # --- SENARYO 2 ---
    elif abs(planlanan_silo_taban_alani_m2 - maks_toplam_kapali_yapi_hakki) < 0.01:
        sonuclar["senaryo_tipi"] = "Senaryo 2: Sadece Silo İçin Koşullu Yapılabilirlik"
        sonuclar["mesaj"] = (
            f"Değerlendirme Sonucu: Koşullu Yapılabilirlik (Sadece Silo İçin)\n\n"
            f"Girdiğiniz {parsel_buyuklugu_m2:.2f} m² parsel büyüklüğü için maksimum toplam kapalı yapılaşma hakkınız (emsal %{kullanilacak_emsal_orani*100:.0f}) {maks_toplam_kapali_yapi_hakki:.2f} m²'dir.\n"  # DİNAMİK EMSAL
            f"Planladığınız {planlanan_silo_taban_alani_m2:.2f} m² silo taban alanı, bu maksimum yapılaşma hakkının tamamını kullanmaktadır.\n\n"
            f"Eğer araziniz **'marjinal tarım arazisi' statüsünde ise**, {planlanan_silo_taban_alani_m2:.2f} m²'lik siloyu bu parselde yapabilirsiniz. \n"
            f"Ancak, bu durumda toplam kapalı yapılaşma hakkınızın tamamı silo tarafından kullanılacağı için, silo taban alanının %{IDARI_TEKNIK_BINA_SILO_ALANINA_ORANI_MAKS*100:.0f}'u kadar olan idari/teknik bina ve ayrıca bir bekçi kulübesi için **emsal dahilinde ek kapalı alan kalmayacaktır**. Bu kapalı müştemilatlar olmadan projenize devam edebilirsiniz.\n\n"
            f"Arazinizin 'marjinal tarım arazisi' statüsünde olup olmadığını ilgili kurumlardan teyit etmeniz önemlidir. Eğer arazi marjinal değilse veya idari/teknik bina gibi kapalı müştemilatlar projeniz için gerekliyse, silo alanını küçülterek veya parsel bilgilerinizi gözden geçirerek tekrar planlama yapmanız önerilir.\n\n"
            f"**Önemli Not:** Kantar ve silo taban alanı kadar ({planlanan_silo_taban_alani_m2:.2f} m²) kamyon yükleme/boşaltma alanı gibi yapılar/alanlar genellikle emsal hesabına dahil edilmediğinden, bunları projenize ekleyebilirsiniz."
        )
        return sonuclar

    # --- SENARYO 3 & 4 ---
    # DÜZELTİLDİ: Silo alanı emsal'e dahil değil, sadece idari bina emsal'den çıkar
    toplam_emsal_kullanan_alan = maks_idari_teknik_bina_alani  # Sadece idari bina
    kalan_emsal_hakki = maks_toplam_kapali_yapi_hakki - toplam_emsal_kullanan_alan
    sonuclar["kalan_emsal_hakki_m2"] = kalan_emsal_hakki

    # --- SENARYO 3 ---
    if abs(toplam_emsal_kullanan_alan - maks_toplam_kapali_yapi_hakki) < 0.01:
        sonuclar["senaryo_tipi"] = "Senaryo 3: Kısmi Müştemilat İle Yapılabilirlik"
        
        # Bu senaryoda, silo ve idari/teknik bina toplamı emsali doldurur, bekçi vb. için yer kalmaz.
        # maks_idari_teknik_bina_alani zaten doğru hesaplanmıştır (min(%10, kalan_emsal_idari_icin))
        # kalan_emsal_hakki_bekci_vb_icin de 0 olarak hesaplanmıştır.
        
        idari_teknik_oran_hesabi = planlanan_silo_taban_alani_m2 * IDARI_TEKNIK_BINA_SILO_ALANINA_ORANI_MAKS
        
        sonuclar["mesaj"] = (
            f"Değerlendirme Sonucu: Kısmi Müştemilat İle Yapılabilirlik\n\n"
            f"Girdiğiniz {parsel_buyuklugu_m2:,.2f} m² parsel büyüklüğü için maksimum toplam kapalı yapılaşma hakkınız (emsal %{kullanilacak_emsal_orani*100:.0f}) {maks_toplam_kapali_yapi_hakki:,.2f} m²'dir.\n"  # DİNAMİK EMSAL
            f"Planladığınız {planlanan_silo_taban_alani_m2:,.2f} m² silo taban alanı için:\n"
            f"* İdari ve teknik bina için normalde silo alanının %{IDARI_TEKNIK_BINA_SILO_ALANINA_ORANI_MAKS*100:.0f}'u kadar (yani {idari_teknik_oran_hesabi:,.2f} m²) bir hak doğardı. "
            f"Ancak, silo alanı ({planlanan_silo_taban_alani_m2:,.2f} m²) düşüldükten sonra toplam emsal hakkınızdan geriye sadece {maks_idari_teknik_bina_alani:,.2f} m² kaldığı için, "
            f"idari ve teknik bina için kullanabileceğiniz maksimum alan <b>{maks_idari_teknik_bina_alani:,.2f} m²</b> ile sınırlıdır.\n\n"
            f"Bu durumda, {planlanan_silo_taban_alani_m2:,.2f} m² silo ve {maks_idari_teknik_bina_alani:,.2f} m² idari/teknik bina inşa edebilirsiniz. "
            f"Bu ikisinin toplamı ({planlanan_silo_taban_alani_m2 + maks_idari_teknik_bina_alani:,.2f} m²) parselinizin maksimum kapalı yapılaşma hakkına eşittir.\n\n"
            f"Eğer ayrıca bir <b>bekçi kulübesi</b> de yapmayı planlıyorsanız, bu kulübenin alanı da mevcut {maks_toplam_kapali_yapi_hakki:,.2f} m²'lik toplam kapalı yapılaşma hakkınızın içinde kalmalıdır. Bu durumda:\n"
            f"a) Bekçi kulübesi için yer açmak amacıyla idari/teknik binanızın alanını {maks_idari_teknik_bina_alani:,.2f} m²'den daha küçük planlamanız,\n"
            f"b) Silo taban alanını küçültmeniz (haliyle idari ve teknik binanız da aynı oranda küçülecektir),\n"
            f"c) Veya bu parselde bekçi kulübesi yapmaktan vazgeçmeniz,\n"
            f"ç) Ya da daha büyük bir parsele geçmeniz gerekebilir.\n"
            f"Çünkü mevcut durumda idari/teknik binayı tam hakkınız olan {maks_idari_teknik_bina_alani:,.2f} m² yaparsanız, bekçi kulübesi için emsal dahilinde ek yer kalmamaktadır.\n\n"
            f"<b>Önemli Not:</b> Kantar ve silo taban alanı kadar ({planlanan_silo_taban_alani_m2:,.2f} m²) kamyon yükleme/boşaltma alanı gibi yapılar/alanlar genellikle emsal hesabına dahil edilmediğinden, bunları projenize ekleyebilirsiniz."
        )
        return sonuclar

    # --- SENARYO 4 ---
    elif toplam_emsal_kullanan_alan < maks_toplam_kapali_yapi_hakki:
        sonuclar["senaryo_tipi"] = "Senaryo 4: Proje Uygundur (Müştemilat İçin Yeterli Alan Var)"
        sonuclar["mesaj"] = (
            f"Değerlendirme Sonucu: Proje Uygundur\n\n"
            f"Girdiğiniz {parsel_buyuklugu_m2:.2f} m² parsel büyüklüğü için maksimum toplam kapalı yapılaşma hakkınız (emsal %{kullanilacak_emsal_orani*100:.0f}) {maks_toplam_kapali_yapi_hakki:.2f} m²'dir.\n"  # DİNAMİK EMSAL
            f"Planladığınız {planlanan_silo_taban_alani_m2:.2f} m² silo taban alanı için:\n"
            f"*   İdari ve teknik bina için kullanabileceğiniz maksimum alan (silo alanının %{IDARI_TEKNIK_BINA_SILO_ALANINA_ORANI_MAKS*100:.0f}'u): {planlanan_silo_taban_alani_m2:.2f} m² * {IDARI_TEKNIK_BINA_SILO_ALANINA_ORANI_MAKS:.2f} = **{maks_idari_teknik_bina_alani:.2f} m²**\n\n"
            f"Bu durumda, {planlanan_silo_taban_alani_m2:.2f} m² silo + {maks_idari_teknik_bina_alani:.2f} m² idari/teknik bina inşa edebilirsiniz.\n"
            f"**Önemli:** Silo taban alanı emsal hesabına dahil edilmez, sadece idari/teknik bina emsal'den düşülür.\n"
            f"Toplam emsal kullanan alanınız: {maks_idari_teknik_bina_alani:.2f} m² (sadece idari bina)\n"
            f"Geriye kalan emsal hakkınız: {maks_toplam_kapali_yapi_hakki:.2f} m² - {maks_idari_teknik_bina_alani:.2f} m² = **{kalan_emsal_hakki:.2f} m²**.\n"
            f"Bu kalan {kalan_emsal_hakki:.2f} m²'lik emsal hakkınızı, bir bekçi kulübesi için kullanabilirsiniz (bekçi kulübesinin standart bir ölçüsü olmamakla birlikte genellikle küçük bir alanı kaplar, örneğin 5-15 m²).\n\n"
            f"Projeniz ({planlanan_silo_taban_alani_m2:.2f} m² silo, {maks_idari_teknik_bina_alani:.2f} m² idari/teknik bina ve makul büyüklükte bir bekçi kulübesi) bu parselde uygulanabilir görünmektedir.\n\n"
            f"**Önemli Not:** Kantar ve silo taban alanı kadar ({planlanan_silo_taban_alani_m2:.2f} m²) kamyon yükleme/boşaltma alanı gibi yapılar/alanlar genellikle emsal hesabına dahil edilmediğinden, bunları projenize ekleyebilirsiniz."
        )
        return sonuclar

    sonuclar["senaryo_tipi"] = "Belirsiz Durum"
    sonuclar["mesaj"] = "Girdiğiniz değerler için net bir senaryo belirlenemedi. Lütfen girdilerinizi kontrol edin veya bir uzmana danışın."
    return sonuclar

# --- Yeni fonksiyonlar sera.py benzeri ---

def silo_projesi_bilgilendirme(
    toplam_proje_alani_m2: float,
    planlanan_silo_alani_m2: float,
    emsal_orani: float = None  # PHASE 2 DİNAMİK EMSAL PARAMETRESİ
) -> dict:
    """
    Silo projesi için idari/teknik bina kurallarını hesaplar ve genel bilgi verir.

    Args:
        toplam_proje_alani_m2: Toplam sahip olunan arazi büyüklüğü (m²).
        planlanan_silo_alani_m2: Kurulması planlanan silonun taban alanı (m²).

    Returns:
        Sonuçları ve açıklamaları içeren bir sözlük.
    """
    # PHASE 2 DİNAMİK EMSAL SİSTEMİ
    kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
    
    sonuclar = {
        "giris_bilgileri": {
            "toplam_proje_alani_m2": toplam_proje_alani_m2,
            "planlanan_silo_alani_m2": planlanan_silo_alani_m2,
        },
        "idari_bina_durumu": "",
        "idari_bina_izin_verilen_alan_m2": 0.0,
        "maks_toplam_kapali_yapi_hakki_m2": toplam_proje_alani_m2 * kullanilacak_emsal_orani,  # DİNAMİK EMSAL
        "ozet_mesaj": ""
    }

    # İdari ve Teknik Bina alanı - Silo alanının belli bir yüzdesi kadar
    maks_idari_bina_hesaplanan_alan_m2 = planlanan_silo_alani_m2 * IDARI_TEKNIK_BINA_SILO_ALANINA_ORANI_MAKS
    
    if maks_idari_bina_hesaplanan_alan_m2 < SILO_MIN_IDARI_TEKNIK_BINA_ALANI_M2:
        sonuclar["idari_bina_izin_verilen_alan_m2"] = SILO_MIN_IDARI_TEKNIK_BINA_ALANI_M2
        sonuclar["idari_bina_durumu"] = (
            f"Planladığınız {planlanan_silo_alani_m2} m² silo alanı için hesaplanan %{IDARI_TEKNIK_BINA_SILO_ALANINA_ORANI_MAKS*100:.0f}'luk oran ({maks_idari_bina_hesaplanan_alan_m2:.2f} m²), "
            f"minimum {SILO_MIN_IDARI_TEKNIK_BINA_ALANI_M2} m² şartının altında kaldığından, "
            f"yapabileceğiniz idari ve teknik bina alanı en fazla {SILO_MIN_IDARI_TEKNIK_BINA_ALANI_M2:.2f} m² olacaktır."
        )
    else:
        sonuclar["idari_bina_izin_verilen_alan_m2"] = maks_idari_bina_hesaplanan_alan_m2
        sonuclar["idari_bina_durumu"] = (
            f"Planladığınız {planlanan_silo_alani_m2} m² silo alanı için, "
            f"bu alanın en fazla %{IDARI_TEKNIK_BINA_SILO_ALANINA_ORANI_MAKS*100:.0f}'u kadar (yani {maks_idari_bina_hesaplanan_alan_m2:.2f} m²) "
            f"ve en az {SILO_MIN_IDARI_TEKNIK_BINA_ALANI_M2} m² olmak şartıyla idari ve teknik bina yapabilirsiniz. "
            f"Bu durumda maksimum {maks_idari_bina_hesaplanan_alan_m2:.2f} m² yapabilirsiniz."
        )

    # Debug için hesaplama detaylarını yazdır
    logger.info(f"Silo idari bina hesaplaması: Silo alanı={planlanan_silo_alani_m2} m², " 
               f"maks idari bina={sonuclar['idari_bina_izin_verilen_alan_m2']} m²")
               
    # Emsal hesaplaması
    toplam_kapalı_alan = planlanan_silo_alani_m2 + sonuclar["idari_bina_izin_verilen_alan_m2"]
    kalan_emsal_hakki = sonuclar["maks_toplam_kapalı_yapi_hakki_m2"] - toplam_kapalı_alan
    
    if kalan_emsal_hakki < 0:
        emsal_bilgisi = (
            f"Uyarı: Planladığınız silo ({planlanan_silo_alani_m2} m²) ve idari bina ({sonuclar['idari_bina_izin_verilen_alan_m2']} m²) toplamı, emsal hakkınızı aşmaktadır."
        )
    else:
        emsal_bilgisi = (
            f"Emsal Hesaplaması: Arazinizin maksimum yapılaşma hakkı ({sonuclar['maks_toplam_kapali_yapi_hakki_m2']:.2f} m²) içinde "
            f"planladığınız silo ve idari bina sonrası {kalan_emsal_hakki:.2f} m² yapılaşma hakkınız kalmaktadır. "
            f"Bu alanı bekçi kulübesi gibi diğer kapalı yapılar için kullanabilirsiniz."
        )

    # Özet Mesaj Oluşturma
    sonuclar["ozet_mesaj"] = (
        f"--- Silo Projesi Bilgilendirme Raporu ---\n"
        f"Toplam Proje Alanı: {toplam_proje_alani_m2} m²\n"
        f"Maksimum Yapılaşma Hakkı (Emsal %{kullanilacak_emsal_orani*100:.0f}): {sonuclar['maks_toplam_kapali_yapi_hakki_m2']:.2f} m²\n"
        f"Planlanan Silo Alanı: {planlanan_silo_alani_m2} m²\n\n"
        f"İdari ve Teknik Bina Durumu:\n{sonuclar['idari_bina_durumu']}\n\n"
        f"{emsal_bilgisi}\n\n"
        f"Genel Bilgiler:\n"
        f"- Silolar, tahıl, yem, saman ve benzeri ürünlerin depolanması için uygundur.\n"
        f"- Siloların kolay ulaşılabilir alanlara yapılması, lojistik açıdan önemlidir.\n"
        f"- Kantar ve kamyon yükleme/boşaltma alanları gibi açık alanlar genellikle emsal hesabına dahil edilmez.\n"
        f"-----------------------------------------"
    )

    return sonuclar

def hesapla_silo_yapilasma_kurallari(arazi_bilgileri, silo_bilgileri, emsal_orani: float = None):
    """
    Silo yapılaşma kurallarını hesaplar ve anasayfaya sade, frontend ile uyumlu veri döndürür.
    """
    arazi_buyuklugu_m2 = arazi_bilgileri.get("buyukluk_m2", 0)
    planlanan_silo_taban_alani_m2_input = silo_bilgileri.get("planlanan_silo_taban_alani_m2")

    # Arazi büyüklüğü kontrolü
    if arazi_buyuklugu_m2 <= 0:
        return {
            "izin_durumu": "izin_verilemez",
            "mesaj": f"<b>=== SİLO (HUBUBAT/YEM DEPOLAMA) TESİSİ DEĞERLENDİRME RAPORU ===</b><br><br>" +
                     f"<b>HATA:</b> Arazi büyüklüğü 0 veya negatif olamaz. Lütfen geçerli bir arazi büyüklüğü giriniz.",
            "durum": "hata",
            "maksimum_taban_alani": None
        }

    if planlanan_silo_taban_alani_m2_input is None:
        return {
            "izin_durumu": "belirsiz",
            "mesaj": f"<b>=== SİLO (HUBUBAT/YEM DEPOLAMA) TESİSİ DEĞERLENDİRME RAPORU ===</b><br><br>" +
                     f"<b>HATA:</b> Lütfen planlanan silo taban alanını (m²) giriniz.",
            "durum": "belirsiz",
            "maksimum_taban_alani": None,
            "uyari_mesaji_ozel_durum": "Silo taban alanı değeri gereklidir.",
            "sonraki_adim_bilgisi": "Planlanan silo taban alanını girerek tekrar deneyiniz."
        }
    try:
        if isinstance(planlanan_silo_taban_alani_m2_input, str):
            planlanan_silo_taban_alani_m2 = float(planlanan_silo_taban_alani_m2_input.strip())
        else:
            planlanan_silo_taban_alani_m2 = float(planlanan_silo_taban_alani_m2_input)
        if planlanan_silo_taban_alani_m2 <= 0:
            raise ValueError("Silo alanı sıfırdan büyük olmalıdır")
    except (ValueError, TypeError) as e:
        hata_mesaji = f"<b>=== SİLO (HUBUBAT/YEM DEPOLAMA) TESİSİ DEĞERLENDİRME RAPORU ===</b><br><br>" +\
                      f"<b>GİRİŞ BİLGİLERİ:</b><br>" +\
                      f"- Parsel Büyüklüğü: {arazi_buyuklugu_m2:,.2f} m²<br>" +\
                      f"- Planlanan Silo Taban Alanı: {planlanan_silo_taban_alani_m2_input} m²<br><br>" +\
                      f"<b>HATA:</b> Silo taban alanı geçersiz bir formatta girilmiş. Lütfen sayısal bir değer giriniz. Hata: {str(e)}"
        
        return {
            "izin_durumu": "hata",
            "mesaj": hata_mesaji.replace(",", "."),
            "durum": "hata",
            "maksimum_taban_alani": 0,
            "uyari_mesaji_ozel_durum": "Geçersiz silo taban alanı değeri.",
            "sonraki_adim_bilgisi": ""
        }

    # PHASE 2 DİNAMİK EMSAL SİSTEMİ
    kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
    
    # Silo değerlendirmesi için ham veriyi al
    silo_degerlendirme_data = silo_projesi_degerlendir(arazi_buyuklugu_m2, planlanan_silo_taban_alani_m2, kullanilacak_emsal_orani)  # DİNAMİK EMSAL

    # İzin durumunu belirle
    izin_durumu = "izin_verilebilir"
    senaryo_tipi = silo_degerlendirme_data.get("senaryo_tipi", "")
    if "Hata:" in senaryo_tipi or "Yapılamaz" in senaryo_tipi or "yapılamaz" in silo_degerlendirme_data.get("mesaj", "").lower() :
        izin_durumu = "izin_verilemez"
    
    # HTML Mesajını Oluştur - Bununla başlayan bir mesaj yeterli, sonradan tekrarlanmamalı
    html_mesaj = f"<b>=== SİLO (HUBUBAT/YEM DEPOLAMA) TESİSİ DEĞERLENDİRME RAPORU ===</b><br><br>"
    
    # Giriş Bilgileri
    html_mesaj += f"<b>GİRİŞ BİLGİLERİ:</b><br>"
    html_mesaj += f"- Parsel Büyüklüğü: {arazi_buyuklugu_m2:,.2f} m²<br>".replace(",", ".")
    html_mesaj += f"- Planlanan Silo Taban Alanı: {planlanan_silo_taban_alani_m2:,.2f} m²<br><br>".replace(",", ".")

    # Genel Haklar
    html_mesaj += f"<b>GENEL HAKLAR:</b><br>"
    html_mesaj += f"- Maksimum Toplam Kapalı Yapı Hakkı (Emsal %{kullanilacak_emsal_orani*100:.0f}): {silo_degerlendirme_data.get('maks_toplam_kapali_yapi_hakki_m2', 0):,.2f} m²<br><br>".replace(",", ".")

    # Ana Sonuç (Renkli ve Vurgulu)
    if izin_durumu == "izin_verilemez":
        html_mesaj += f"<b style='color: red;'>SONUÇ: TESİS YAPILAMAZ</b><br><br>"
    elif "Hata:" in senaryo_tipi:
        html_mesaj += f"<b style='color: red;'>SONUÇ: HESAPLAMA HATASI</b><br><br>"
    else: # izin_verilebilir
        html_mesaj += f"<b style='color: green;'>SONUÇ: TESİS YAPILABİLİR</b><br><br>"

    # --- Detaylı Değerlendirme ve Senaryo Detayları ---
    # Senaryo 4 (Proje Uygundur) için bu bölümü atla
    if not senaryo_tipi.startswith("Senaryo 4"):
        html_mesaj += f"<b>DEĞERLENDİRME VE SENARYO DETAYLARI ({senaryo_tipi}):</b><br>"
        detayli_aciklama = silo_degerlendirme_data.get("mesaj", "")
        html_mesaj += detayli_aciklama.replace("\n\n", "<br><br>").replace("\n", "<br>")
        html_mesaj += "<br><br>"

    # Eğer İzin Verilebilir ve Hata Yoksa - Kullanım Dağılımı / Özet Alanlar
    if izin_durumu == "izin_verilebilir" and "Hata:" not in senaryo_tipi :
        html_mesaj += f"<b>KULLANIM DAĞILIMI / ÖZET ALANLAR:</b><br>"
        html_mesaj += f"- Planlanan Silo Taban Alanı: {silo_degerlendirme_data.get('giris_bilgileri', {}).get('planlanan_silo_taban_alani_m2', 0):,.2f} m²<br>".replace(",", ".")
        maks_idari = silo_degerlendirme_data.get('maks_idari_teknik_bina_alani_m2', 0)
        oranli_idari = silo_degerlendirme_data.get('giris_bilgileri', {}).get('planlanan_silo_taban_alani_m2', 0) * 0.10
        if maks_idari < oranli_idari - 0.01:
            html_mesaj += f"- İdari ve Teknik Bina İçin Kullanılabilecek Maksimum Alan: {maks_idari:,.2f} m²<br>".replace(",", ".")
        else:
            html_mesaj += f"- İdari ve Teknik Bina İçin Kullanılabilecek Maksimum Alan: {maks_idari:,.2f} m²<br>".replace(",", ".")
        kalan_emsal = silo_degerlendirme_data.get('kalan_emsal_hakki_m2', 0)
        if kalan_emsal >= 0: 
             html_mesaj += f"- Kalan Emsal Hakkı (Bekçi Kulübesi vb. için): {kalan_emsal:,.2f} m²<br>".replace(",", ".")
        html_mesaj += "<br>"
        # Önemli Notu ekle
        planlanan_silo = silo_degerlendirme_data.get('giris_bilgileri', {}).get('planlanan_silo_taban_alani_m2', 0)
        html_mesaj += (
            f"<b>Önemli Not:</b> Kantar ve silo taban alanı kadar ({planlanan_silo:,.2f} m²) kamyon yükleme/boşaltma alanı gibi yapılar/alanlar "
            "genellikle emsal hesabına dahil edilmediğinden, bunları projenize ekleyebilirsiniz.<br>"
        ).replace(",", ".")
    # Büyük Ova Uyarısı
    buyuk_ova_warning_text = ""
    if arazi_bilgileri.get("buyuk_ova_icinde"):
        buyuk_ova_warning_text = (
            "Seçilen alan Büyük Ova Koruma Alanı sınırları içerisinde yer almaktadır. "
            "Bu nedenle ilgili değerlendirme süreci standarttan daha uzun sürebilir ve ek izin süreçleri gerekebilir."
        )
        html_mesaj += f"<b style='color: orange;'>UYARI: BÜYÜK OVA KORUMA ALANI</b><br><br>"

    # Yatay Çizgi ve Önemli Notlar
    html_mesaj += "<hr>"
    
    sonuc = {
        "izin_durumu": izin_durumu,
        "mesaj": html_mesaj,  # Tek bir HTML raporu yeterli
        "durum": izin_durumu,  # durum alanını da güncelleyin
        "maksimum_taban_alani": silo_degerlendirme_data.get("maks_toplam_kapali_yapi_hakki_m2"),
        "maksimum_idari_teknik_alan": silo_degerlendirme_data.get("maks_idari_teknik_bina_alani_m2"),
        "kalan_emsal_hakki": silo_degerlendirme_data.get("kalan_emsal_hakki_m2"),
        "uygulanan_kural": senaryo_tipi,
        "surec_bilgisi_buyuk_ova": buyuk_ova_warning_text 
    }
    return sonuc

def hububat_silo_degerlendir(data, emsal_orani: float = None):
    """
    API için hububat silo değerlendirme fonksiyonu - Kullanıcı dostu HTML çıktısı ile
    
    Args:
        data: Form verileri {'arazi_buyuklugu_m2': float, 'silo_taban_alani_m2': float}
        emsal_orani: Dinamik emsal oranı (None ise varsayılan %20 kullanılır)
    
    Returns:
        dict: Hesaplama sonucu ve HTML mesaj içeren API yanıtı
    """
    try:
        # Form verilerini parse et
        arazi_buyuklugu = float(data.get('arazi_buyuklugu_m2', 0))
        silo_taban_alani = float(data.get('silo_taban_alani_m2', 0))
        
        # Parametreleri kontrol et
        if arazi_buyuklugu <= 0:
            raise ValueError("Arazi büyüklüğü pozitif olmalıdır")
        if silo_taban_alani <= 0:
            raise ValueError("Silo taban alanı pozitif olmalıdır")
            
        # DİNAMİK EMSAL SİSTEMİ
        kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
        
        # Mevcut hesaplama fonksiyonunu kullan
        result = silo_projesi_degerlendir(arazi_buyuklugu, silo_taban_alani, kullanilacak_emsal_orani)
        
        # İzin durumunu belirle
        senaryo_tipi = result.get('senaryo_tipi', '')
        yapilanabilir = not ("Hata:" in senaryo_tipi or "Yapılamaz" in senaryo_tipi)
        
        # Maksimum emsal alanını hesapla
        maksimum_emsal_alani = arazi_buyuklugu * kullanilacak_emsal_orani
        
        # KULLANICI DOSTU HTML ÇIKTISI - Yapilanabilir kontrolü düzeltildi
        # Senaryo 1 kontrolü: Eğer silo alanı emsal'i aşıyorsa yapılamaz
        if silo_taban_alani > maksimum_emsal_alani:
            yapilanabilir = False
            
        if yapilanabilir:
            html_content = f"""
            <div class="calculation-report">
                <h2 style="color: #2d5016; text-align: center; margin-bottom: 20px;">
                    🏗️ Hububat ve Yem Depolama Silosu Değerlendirme Raporu
                </h2>
                
                <div class="summary-section" style="text-align: center; margin-bottom: 25px;">
                    <div class="result-success" style="background-color: #d4edda; color: #155724; padding: 20px; border-radius: 8px; border: 2px solid #c3e6cb;">
                        <h3 style="margin: 0; font-size: 24px;">✅ TESİS YAPILABİLİR</h3>
                        <p style="margin: 10px 0 0 0; font-size: 16px;">Planlanan {silo_taban_alani:,.0f} m² silo taban alanı için tesis kurulabilir.</p>
                    </div>
                </div>
                
                <div class="input-section" style="margin-bottom: 20px;">
                    <h3 style="color: #495057; border-bottom: 2px solid #007bff; padding-bottom: 5px;">📊 Girdi Bilgileri</h3>
                    <table class="info-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <tr><td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold; width: 50%;">Arazi Büyüklüğü:</td><td style="padding: 12px; border: 1px solid #ddd;">{arazi_buyuklugu:,.0f} m²</td></tr>
                        <tr><td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Planlanan Silo Taban Alanı:</td><td style="padding: 12px; border: 1px solid #ddd;">{silo_taban_alani:,.0f} m²</td></tr>
                        <tr><td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Uygulanan Emsal Oranı:</td><td style="padding: 12px; border: 1px solid #ddd;"><strong style="color: #007bff;">%{kullanilacak_emsal_orani*100:.0f}</strong></td></tr>
                    </table>
                </div>
                
                <div class="calculation-section" style="margin-bottom: 20px;">
                    <h3 style="color: #495057; border-bottom: 2px solid #28a745; padding-bottom: 5px;">🔢 Hesaplama Detayları</h3>
                    <table class="info-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <tr><td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold; width: 50%;">Maksimum Emsal Alanı:</td><td style="padding: 12px; border: 1px solid #ddd; color: #28a745; font-weight: bold;">{result.get('maks_toplam_kapali_yapi_hakki_m2', 0):,.2f} m²</td></tr>
                        <tr><td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Silo Taban Alanı:</td><td style="padding: 12px; border: 1px solid #ddd;">{silo_taban_alani:,.0f} m²</td></tr>
                        <tr><td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">İdari/Teknik Bina Alanı:</td><td style="padding: 12px; border: 1px solid #ddd;">{result.get('maks_idari_teknik_bina_alani_m2', 0):,.2f} m²</td></tr>
                        <tr><td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Kalan Emsal Hakkı:</td><td style="padding: 12px; border: 1px solid #ddd; color: #17a2b8; font-weight: bold;">{result.get('kalan_emsal_hakki_m2', 0):,.2f} m²</td></tr>
                    </table>
                </div>
                
                <div class="scenario-section" style="margin-bottom: 20px;">
                    <h3 style="color: #495057; border-bottom: 2px solid #ffc107; padding-bottom: 5px;">📋 Değerlendirme Sonucu</h3>
                    <div class="scenario-info" style="background-color: #fff9c4; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
                        <p style="margin: 10px 0 0 0; line-height: 1.5; font-weight: bold; color: #28a745;">
                            ✅ Planladığınız silo projesi bu parselde başarıyla gerçekleştirilebilir.
                        </p>
                        <p style="margin: 10px 0 0 0; line-height: 1.5;">
                            Silo tesisinin yanı sıra gerekli idari/teknik binalar ve diğer müştemilat yapıları için de yeterli alan bulunmaktadır.
                        </p>
                    </div>
                </div>
                
                <div class="rules-section" style="margin-bottom: 20px;">
                    <h3 style="color: #495057; border-bottom: 2px solid #6f42c1; padding-bottom: 5px;">⚖️ Uygulanan Kurallar</h3>
                    <ul style="margin-left: 20px; line-height: 1.8;">
                        <li><strong>Emsal oranı:</strong> %{kullanilacak_emsal_orani*100:.0f} ({"Marjinal alan" if kullanilacak_emsal_orani == 0.20 else "Mutlak/Dikili alan"})</li>
                        <li><strong>İdari/teknik bina oranı:</strong> %{IDARI_TEKNIK_BINA_SILO_ALANINA_ORANI_MAKS*100:.0f} (silo alanının)</li>
                        <li><strong>Minimum idari/teknik bina:</strong> {SILO_MIN_IDARI_TEKNIK_BINA_ALANI_M2} m²</li>
                        <li><strong>Silo taban alanı emsal hesabına dahil edilir</strong></li>
                    </ul>
                </div>
                
                <div class="legal-section" style="background-color: #e9ecef; padding: 15px; border-radius: 5px; border-left: 4px solid #6c757d;">
                    <h3 style="color: #495057; margin-top: 0;">📖 Yasal Dayanak</h3>
                    <p style="margin: 0; line-height: 1.5;">Bu hesaplama, Tarım Arazilerinin Korunması, Kullanılması ve Planlanmasına Dair Yönetmelik ve ilgili genelge hükümlerine göre yapılmıştır. Emsal hesaplamasında silo taban alanı dikkate alınmaz, sadece idari ve teknik bina alanları emsal hakkından düşülür.</p>
                </div>
            </div>
            """
        else:
            # Hangi emsal oranı ile çalışabileceğini hesapla
            maksimum_silo_alani_marjinal = arazi_buyuklugu * 0.20
            maksimum_silo_alani_mutlak = arazi_buyuklugu * 0.05
            
            html_content = f"""
            <div class="calculation-report">
                <h2 style="color: #721c24; text-align: center; margin-bottom: 20px;">
                    🏗️ Hububat ve Yem Depolama Silosu Değerlendirme Raporu
                </h2>
                
                <div class="summary-section" style="text-align: center; margin-bottom: 25px;">
                    <div class="result-error" style="background-color: #f8d7da; color: #721c24; padding: 20px; border-radius: 8px; border: 2px solid #f5c6cb;">
                        <h3 style="margin: 0; font-size: 24px;">❌ TESİS YAPILAMAZ</h3>
                        <p style="margin: 10px 0 0 0; font-size: 16px;">Mevcut koşullarda planlanan tesis kurulamamaktadır.</p>
                    </div>
                </div>
                
                <div class="input-section" style="margin-bottom: 20px;">
                    <h3 style="color: #495057; border-bottom: 2px solid #dc3545; padding-bottom: 5px;">📊 Girdi Bilgileri</h3>
                    <table class="info-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <tr><td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold; width: 50%;">Arazi Büyüklüğü:</td><td style="padding: 12px; border: 1px solid #ddd;">{arazi_buyuklugu:,.0f} m²</td></tr>
                        <tr><td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Talep Edilen Silo Alanı:</td><td style="padding: 12px; border: 1px solid #ddd; color: #dc3545; font-weight: bold;">{silo_taban_alani:,.0f} m²</td></tr>
                        <tr><td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Uygulanan Emsal Oranı:</td><td style="padding: 12px; border: 1px solid #ddd;"><strong style="color: #dc3545;">%{kullanilacak_emsal_orani*100:.0f}</strong></td></tr>
                    </table>
                </div>
                
                <div class="scenario-section" style="margin-bottom: 20px;">
                    <h3 style="color: #495057; border-bottom: 2px solid #dc3545; padding-bottom: 5px;">📋 Değerlendirme Sonucu</h3>
                    <div class="scenario-info" style="background-color: #f8d7da; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545;">
                        <p style="margin: 10px 0 0 0; line-height: 1.5; font-weight: bold; color: #721c24;">
                            ❌ Planladığınız silo projesi mevcut parselde gerçekleştirilemez.
                        </p>
                        <p style="margin: 10px 0 0 0; line-height: 1.5;">
                            Talep ettiğiniz silo alanı ({silo_taban_alani:,.0f} m²), mevcut emsal hakkınızı ({maksimum_emsal_alani:,.0f} m²) aşmaktadır.
                        </p>
                    </div>
                </div>
                
                <div class="calculation-section" style="margin-bottom: 20px;">
                    <h3 style="color: #495057; border-bottom: 2px solid #dc3545; padding-bottom: 5px;">🔢 Mevcut Durum</h3>
                    <table class="info-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <tr><td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold; width: 50%;">Maksimum İzin Verilen Alan:</td><td style="padding: 12px; border: 1px solid #ddd; color: #28a745; font-weight: bold;">{maksimum_emsal_alani:,.0f} m²</td></tr>
                        <tr><td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Talep Edilen Alan:</td><td style="padding: 12px; border: 1px solid #ddd; color: #dc3545; font-weight: bold;">{silo_taban_alani:,.0f} m²</td></tr>
                        <tr><td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa; font-weight: bold;">Aşım Miktarı:</td><td style="padding: 12px; border: 1px solid #ddd; color: #dc3545; font-weight: bold;">+{silo_taban_alani - maksimum_emsal_alani:,.0f} m²</td></tr>
                    </table>
                </div>
                
                <div class="solution-section" style="margin-bottom: 20px;">
                    <h3 style="color: #495057; border-bottom: 2px solid #28a745; padding-bottom: 5px;">💡 Çözüm Önerileri</h3>
                    <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; border-left: 4px solid #17a2b8;">
                        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                            <li><strong>Silo alanını küçültün:</strong> Maksimum <strong>{maksimum_emsal_alani:,.0f} m²</strong> silo taban alanı kurabilirsiniz</li>
                            <li><strong>Daha büyük arazi:</strong> Bu silo için minimum <strong>{silo_taban_alani / kullanilacak_emsal_orani:,.0f} m²</strong> arazi gereklidir</li>
                            {f'<li><strong>Emsal değiştirin:</strong> Araziniz marjinal tarım arazisi ise %20 emsal ile {maksimum_silo_alani_marjinal:,.0f} m² silo kurabilirsiniz</li>' if kullanilacak_emsal_orani == 0.05 else ''}
                        </ul>
                    </div>
                </div>
                
                <div class="comparison-section" style="margin-bottom: 20px;">
                    <h3 style="color: #495057; border-bottom: 2px solid #ffc107; padding-bottom: 5px;">📈 Emsal Karşılaştırması</h3>
                    <table class="info-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <tr style="background-color: #fff3cd;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; width: 33%;">Emsal Türü</td>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; width: 33%;">Oran</td>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; width: 34%;">Max. Silo Alanı</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd;">🏜️ Marjinal Alan</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">%20</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #28a745; font-weight: bold;">{maksimum_silo_alani_marjinal:,.0f} m²</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd;">🌱 Mutlak/Dikili</td>
                            <td style="padding: 12px; border: 1px solid #ddd;">%5</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #ffc107; font-weight: bold;">{maksimum_silo_alani_mutlak:,.0f} m²</td>
                        </tr>
                    </table>
                </div>
                
                <div class="legal-section" style="background-color: #e9ecef; padding: 15px; border-radius: 5px; border-left: 4px solid #6c757d;">
                    <h3 style="color: #495057; margin-top: 0;">📖 Yasal Dayanak</h3>
                    <p style="margin: 0; line-height: 1.5;">Bu değerlendirme, Tarım Arazilerinin Korunması, Kullanılması ve Planlanmasına Dair Yönetmelik hükümlerine göre yapılmıştır. Emsal hesaplamasında silo taban alanı emsal hakkından düşülmez.</p>
                </div>
            </div>
            """
        
        # API formatında response oluştur
        api_response = {
            'success': True,
            'yapilanabilir': yapilanabilir,
            'sonuc': "TESİS YAPILABİLİR" if yapilanabilir else "TESİS YAPILAMAZ",
            'arazi_buyuklugu_m2': arazi_buyuklugu,
            'silo_taban_alani_m2': silo_taban_alani,
            'maksimum_emsal_alani_m2': maksimum_emsal_alani,
            'emsal_orani': kullanilacak_emsal_orani,
            'hesaplama_detaylari': result,
            'html_content': html_content,
            'mesaj': html_content,  # Frontend için
            'izin_durumu': 'izin_verilebilir' if yapilanabilir else 'izin_verilemez'
        }
        
        return api_response
        
    except Exception as e:
        logger.error(f"Hububat silo API hesaplama hatası: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'sonuc': 'HESAPLAMA HATASI',
            'mesaj': f'<div style="color: #721c24; text-align: center; padding: 20px;"><h3>❌ HESAPLAMA HATASI</h3><p>Hesaplama sırasında hata oluştu: {str(e)}</p></div>',
            'izin_durumu': 'izin_verilemez'
        }

# --- Test için örnek kullanım ---
if __name__ == "__main__":
    pass
