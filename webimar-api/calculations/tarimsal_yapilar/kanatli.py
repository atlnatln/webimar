#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Kanatlı Hayvancılık Tesisi Emsal Hesaplama Aracı (Revize)

Bu program, verilen arazi büyüklüğüne göre kanatlı hayvan tesisi 
kapasitesini, müştemilat alanlarını ve bakıcı evi hakkını hesaplar.
Serbest dolaşan tavuk senaryoları için gezinti alanı kısıtı da hesaba katılır.
"""

import sys  # sys modülünü ekleyelim

# Kanatlı hayvancılık için sabitler - PHASE 2 DİNAMİK EMSAL SİSTEMİ
DEFAULT_EMSAL_ORANI = 0.20  # %20 varsayılan (dinamik sistem için)

class KanatlıHesaplama:
    def __init__(self, emsal_orani: float = None):
        # Dinamik emsal oranını belirle
        self.emsal_oranı = emsal_orani if emsal_orani is not None else DEFAULT_EMSAL_ORANI
        
        # Hayvan yoğunlukları (adet/m²)
        self.hayvan_yoğunlukları = {
            "yumurtacı_tavuk": 6,
            "etçi_tavuk": 14,
            "hindi": 3,
            "kaz": 2,
            "serbest_tavuk": 4
        }
        
        # Gezinti alanı gerekliliği (m²/hayvan)
        self.gezinti_alanı_gerekliliği = {
            "serbest_tavuk": 2  # Serbest tavuklar için 2 m²/tavuk
        }
        
        # Bakıcı evi hakkı eşik değerleri
        self.bakıcı_evi_eşikleri = {
            "yumurtacı_tavuk": 7500,
            "etçi_tavuk": 10000,
            "hindi": 1000,
            "kaz": 1000,
            "serbest_tavuk": 1000
        }
        
        # Yapı büyüklükleri
        self.bakıcı_evi_alanı = 75.0
        self.bekçi_kulübesi_alanı = 15.0
        self.idari_bina_alanı = 75.0
        
        # Minimum alan gereksinimleri
        self.min_zorunlu_müştemilat_alanı = 40.0
        self.min_işlevsel_kümes_alanı = 30.0 # Kümesin işlevsel olabilmesi için gereken minimum alan
        
    def hesapla(self, arazi_alanı, hayvan_tipi="yumurtacı_tavuk"):
        """Ana hesaplama fonksiyonu"""
        # Emsal hesabı
        emsal = arazi_alanı * self.emsal_oranı
        
        # Eğer hayvan tipi geçerli değilse, varsayılan olarak yumurtacı tavuk kullan
        if hayvan_tipi not in self.hayvan_yoğunlukları:
            hayvan_tipi = "yumurtacı_tavuk"
        
        # Hayvan yoğunluğu ve bakıcı evi eşiği
        hayvan_yoğunluğu = self.hayvan_yoğunlukları[hayvan_tipi]
        bakıcı_evi_eşiği = self.bakıcı_evi_eşikleri[hayvan_tipi]
        
        # Emsal yeterli mi kontrol et (minimum müştemilat + minimum kümes için)
        if emsal < self.min_zorunlu_müştemilat_alanı + self.min_işlevsel_kümes_alanı:
            açıklama_metni = ""
            if emsal < self.min_zorunlu_müştemilat_alanı:
                açıklama_metni = f"Emsale göre izin verilen {emsal:.2f} m² yapılaşma alanı, zorunlu müştemilat için gerekli olan minimum {self.min_zorunlu_müştemilat_alanı:.2f} m²'den bile azdır."
            else:
                açıklama_metni = f"Zorunlu müştemilat alanı ({self.min_zorunlu_müştemilat_alanı:.2f} m²) karşılandıktan sonra kümes için yeterli ({self.min_işlevsel_kümes_alanı:.2f} m²) alan kalmamaktadır."
            return {
                "sonuç": "TESİS YAPILAMAZ",
                "açıklama": açıklama_metni,
                "arazi_alanı": arazi_alanı,
                "emsal": emsal,
                "hayvan_tipi": hayvan_tipi
            }
        
        # Serbest dolaşan tavuklar için özel hesaplama
        if hayvan_tipi == "serbest_tavuk":
            return self.hesapla_serbest_tavuk(arazi_alanı, emsal, hayvan_yoğunluğu, bakıcı_evi_eşiği)
        
        # Standart hesaplama (diğer hayvan tipleri için)
        return self.standart_hesaplama(arazi_alanı, emsal, hayvan_tipi, hayvan_yoğunluğu, bakıcı_evi_eşiği)
    
    def hesapla_serbest_tavuk(self, arazi_alanı, emsal, hayvan_yoğunluğu, bakıcı_evi_eşiği):
        """Serbest dolaşan tavuklar için özel hesaplama fonksiyonu"""
        # Emsale göre potansiyel kümes ve müştemilat
        kümes_alanı_emsal_bazli = emsal * 0.75
        müştemilat_alanı_emsal_bazli = emsal * 0.25
        if kümes_alanı_emsal_bazli <= 120:
            if müştemilat_alanı_emsal_bazli < self.min_zorunlu_müştemilat_alanı:
                müştemilat_alanı_emsal_bazli = self.min_zorunlu_müştemilat_alanı
                kümes_alanı_emsal_bazli = emsal - müştemilat_alanı_emsal_bazli
                if kümes_alanı_emsal_bazli < 0: kümes_alanı_emsal_bazli = 0
        tavuk_kapasitesi_emsal = int(kümes_alanı_emsal_bazli * hayvan_yoğunluğu)
        
        # Gezinti alanı kısıtına göre kapasite
        yapılı_alan_tahmini_max = emsal # En kötü durum senaryosu, tüm emsal kullanılırsa
        kullanılabilir_gezinti_alanı = arazi_alanı - yapılı_alan_tahmini_max
        if kullanılabilir_gezinti_alanı < 0: kullanılabilir_gezinti_alanı = 0
        tavuk_kapasitesi_gezinti = int(kullanılabilir_gezinti_alanı / self.gezinti_alanı_gerekliliği["serbest_tavuk"])
        
        # Belirleyici kapasite
        tavuk_kapasitesi_final = min(tavuk_kapasitesi_emsal, tavuk_kapasitesi_gezinti)
        
        # Belirleyici kapasiteye göre gerçek kümes ve müştemilat alanları
        kümes_alanı_final = tavuk_kapasitesi_final / hayvan_yoğunluğu
        if kümes_alanı_final <= 120:
            müştemilat_alanı_final = self.min_zorunlu_müştemilat_alanı
        else:
            müştemilat_alanı_final = kümes_alanı_final / 3 # 1/4'ü müştemilat, 3/4'ü kümes ise müştemilat = kümes/3
        
        # Toplam kümes+müştemilat alanı, emsali aşmamalı (genelde aşmaz çünkü kapasite zaten emsal veya gezinti ile sınırlı)
        if kümes_alanı_final + müştemilat_alanı_final > emsal:
            # Bu durumun olmaması gerekir, ama bir güvenlik kontrolü
            # Emsali aşarsa, kapasiteyi emsale göre yeniden ayarla (bu durumda gezinti alanı daha kısıtlayıcı olmalıydı)
            kümes_alanı_final = emsal * 0.75
            müştemilat_alanı_final = emsal * 0.25
            if kümes_alanı_final <= 120:
                if müştemilat_alanı_final < self.min_zorunlu_müştemilat_alanı:
                    müştemilat_alanı_final = self.min_zorunlu_müştemilat_alanı
                    kümes_alanı_final = emsal - müştemilat_alanı_final
            tavuk_kapasitesi_final = int(kümes_alanı_final * hayvan_yoğunluğu)

        bakıcı_evi_hakkı_calc = tavuk_kapasitesi_final >= bakıcı_evi_eşiği
        
        sonuç_yapılar = []
        bakıcı_evi_yapıldı = False

        # Opsiyonel yapılar için kalan emsal hesabı
        emsal_kullanılan_KM = kümes_alanı_final + müştemilat_alanı_final
        kalan_emsal_opsiyonel_icin = emsal - emsal_kullanılan_KM

        if bakıcı_evi_hakkı_calc and kalan_emsal_opsiyonel_icin >= self.bakıcı_evi_alanı:
            bakıcı_evi_yapıldı = True
            sonuç_yapılar.append({"isim": "Bakıcı evi", "alan": self.bakıcı_evi_alanı})
            kalan_emsal_opsiyonel_icin -= self.bakıcı_evi_alanı
        
        if kalan_emsal_opsiyonel_icin >= self.bekçi_kulübesi_alanı:
            sonuç_yapılar.append({"isim": "Bekçi kulübesi", "alan": self.bekçi_kulübesi_alanı})
            kalan_emsal_opsiyonel_icin -= self.bekçi_kulübesi_alanı
            
        if kalan_emsal_opsiyonel_icin >= self.idari_bina_alanı:
            sonuç_yapılar.append({"isim": "İdari bina", "alan": self.idari_bina_alanı})
            kalan_emsal_opsiyonel_icin -= self.idari_bina_alanı
            
        kısıt_açıklaması = "emsal kısıtı"
        if tavuk_kapasitesi_final == tavuk_kapasitesi_gezinti and tavuk_kapasitesi_gezinti < tavuk_kapasitesi_emsal :
             kısıt_açıklaması = "gezinti alanı kısıtı"
        
        açıklama = f"Kapasite {kısıt_açıklaması} nedeniyle {tavuk_kapasitesi_final} tavukla sınırlandırılmıştır."
        
        sonuç_metni = ""
        if tavuk_kapasitesi_final > 0:
            if bakıcı_evi_hakkı_calc and bakıcı_evi_yapıldı:
                sonuç_metni = f"TESİS VE BAKICI EVİ YAPILABİLİR ({tavuk_kapasitesi_final:,} ADET SERBEST TAVUK KAPASİTELİ)".replace(",", ".")
            elif bakıcı_evi_hakkı_calc and not bakıcı_evi_yapıldı:
                sonuç_metni = f"TESİS YAPILABİLİR ({tavuk_kapasitesi_final:,} ADET SERBEST TAVUK KAPASİTELİ), BAKICI EVİ HAKKI KAZANILIR, ANCAK BAKICI EVİ İÇİN YETERLİ EMSAL ALANI KALMAMIŞTIR".replace(",", ".")
            else:
                sonuç_metni = f"TESİS YAPILABİLİR ({tavuk_kapasitesi_final:,} ADET SERBEST TAVUK KAPASİTELİ, BAKICI EVİ HAK DOĞMAZ)".replace(",", ".")
        else:
            sonuç_metni = "TESİS YAPILAMAZ" # Bu durum ana fonksiyonda yakalanmalıydı
            açıklama = "Belirlenen kısıtlar nedeniyle işlevsel bir tesis kurulamamaktadır."


        return {
            "arazi_alanı": arazi_alanı, "emsal": emsal, "hayvan_tipi": "serbest_tavuk",
            "kümes_alanı": kümes_alanı_final, "müştemilat_alanı": müştemilat_alanı_final,
            "hayvan_kapasitesi": tavuk_kapasitesi_final,
            "bakıcı_evi_hakkı": bakıcı_evi_hakkı_calc,
            "yapılar": sonuç_yapılar,
            "gezinti_alanı_kapasitesi": tavuk_kapasitesi_gezinti,
            "emsal_kapasitesi": tavuk_kapasitesi_emsal,
            "belirleyici_kısıt": kısıt_açıklaması,
            "sonuç": sonuç_metni, "açıklama": açıklama
        }
    
    def standart_hesaplama(self, arazi_alanı, emsal, hayvan_tipi, hayvan_yoğunluğu, bakıcı_evi_eşiği):
        """Standart hesaplama (serbest dolaşan tavuk dışındaki hayvanlar için)"""
        
        # Opsiyon 1: Bakıcı evi olmadan maksimum kapasite
        kümes_opt1 = emsal * 0.75
        müştemilat_opt1 = emsal * 0.25
        if kümes_opt1 <= 120:
            if müştemilat_opt1 < self.min_zorunlu_müştemilat_alanı:
                müştemilat_opt1 = self.min_zorunlu_müştemilat_alanı
                kümes_opt1 = emsal - müştemilat_opt1
                if kümes_opt1 < 0: kümes_opt1 = 0
        kapasite_opt1 = int(kümes_opt1 * hayvan_yoğunluğu)
        
        bakıcı_evi_hakkı_calc = kapasite_opt1 >= bakıcı_evi_eşiği
        
        # Başlangıçta final değerleri Opsiyon 1'e göre ayarla
        kümes_final = kümes_opt1
        müştemilat_final = müştemilat_opt1
        kapasite_final = kapasite_opt1
        bakıcı_evi_yapıldı = False
        sonuç_yapılar = []
        
        if bakıcı_evi_hakkı_calc:
            # Opsiyon 2: Bakıcı evi ile birlikte kapasite
            emsal_for_opt2 = emsal - self.bakıcı_evi_alanı
            if emsal_for_opt2 >= (self.min_zorunlu_müştemilat_alanı + self.min_işlevsel_kümes_alanı):
                # Bakıcı evi yapılabilir, kümes ve müştemilatı kalan emsale göre yeniden hesapla
                bakıcı_evi_yapıldı = True
                
                kümes_opt2 = emsal_for_opt2 * 0.75
                müştemilat_opt2 = emsal_for_opt2 * 0.25
                if kümes_opt2 <= 120:
                    if müştemilat_opt2 < self.min_zorunlu_müştemilat_alanı:
                        müştemilat_opt2 = self.min_zorunlu_müştemilat_alanı
                        kümes_opt2 = emsal_for_opt2 - müştemilat_opt2
                        if kümes_opt2 < 0: kümes_opt2 = 0
                
                kapasite_opt2 = int(kümes_opt2 * hayvan_yoğunluğu)

                # Final değerleri Opsiyon 2'ye göre güncelle
                kümes_final = kümes_opt2
                müştemilat_final = müştemilat_opt2
                kapasite_final = kapasite_opt2
                sonuç_yapılar.append({"isim": "Bakıcı evi", "alan": self.bakıcı_evi_alanı})
            # else: Bakıcı evi hakkı var ama (emsal - bakıcı_evi_alanı) yetersiz. Yapılamaz.
            # Bu durumda final değerler Opsiyon 1 olarak kalır.
            
        sonuç = {
            "arazi_alanı": arazi_alanı, "emsal": emsal, "hayvan_tipi": hayvan_tipi,
            "kümes_alanı": kümes_final,
            "müştemilat_alanı": müştemilat_final,
            "hayvan_kapasitesi": kapasite_final,
            "bakıcı_evi_hakkı": bakıcı_evi_hakkı_calc, # Hak, ilk max kapasiteye göre belirlenir
            "yapılar": sonuç_yapılar
        }
        
        # Diğer opsiyonel yapıları (bekçi, idari) kalan emsale göre ekle
        emsal_kullanılan_ana_yapılar = kümes_final + müştemilat_final
        if bakıcı_evi_yapıldı:
            emsal_kullanılan_ana_yapılar += self.bakıcı_evi_alanı
        
        kalan_emsal_for_diger_opsiyonel = emsal - emsal_kullanılan_ana_yapılar

        if kalan_emsal_for_diger_opsiyonel >= self.bekçi_kulübesi_alanı:
            sonuç["yapılar"].append({"isim": "Bekçi kulübesi", "alan": self.bekçi_kulübesi_alanı})
            kalan_emsal_for_diger_opsiyonel -= self.bekçi_kulübesi_alanı
        
        if kalan_emsal_for_diger_opsiyonel >= self.idari_bina_alanı:
            sonuç["yapılar"].append({"isim": "İdari bina", "alan": self.idari_bina_alanı})
        
        # Sonuç metnini hazırla
        sonuç_metni = ""
        if kapasite_final > 0 :
            hayvan_tipi_str = hayvan_tipi.upper().replace('_', ' ')
            if bakıcı_evi_hakkı_calc and bakıcı_evi_yapıldı:
                sonuç_metni = f"TESİS VE BAKICI EVİ YAPILABİLİR ({kapasite_final:,} ADET {hayvan_tipi_str} KAPASİTELİ)".replace(",", ".")
            elif bakıcı_evi_hakkı_calc and not bakıcı_evi_yapıldı:
                sonuç_metni = f"TESİS YAPILABİLİR ({kapasite_final:,} ADET {hayvan_tipi_str} KAPASİTELİ), BAKICI EVİ HAKKI KAZANILIR, ANCAK BAKICI EVİ İÇİN YETERLİ EMSAL ALANI KALMAMIŞTIR".replace(",", ".")
            else: # bakıcı_evi_hakkı_calc is False
                sonuç_metni = f"TESİS YAPILABİLİR ({kapasite_final:,} ADET {hayvan_tipi_str} KAPASİTELİ, BAKICI EVİ HAK DOĞMAZ)".replace(",", ".")
        else: # Bu durum ana fonksiyonda yakalanmalıydı
            sonuç_metni = "TESİS YAPILAMAZ"
            sonuç["açıklama"] = "Kümes için yeterli alan kalmadı veya başlangıç emsali yetersiz."

        sonuç["sonuç"] = sonuç_metni
        return sonuç

# ====== Web Arabirimi Fonksiyonları (rules_config.py ile entegrasyon için) ======

def yumurtaci_tavuk_degerlendir(arazi_buyuklugu_m2: float, su_tahsis_belgesi_var_mi: bool = None, yas_kapali_alanda_mi: bool = None, kullanici_adi: str = "", tarih_saat: str = "", emsal_orani: float = None) -> dict:
    """
    Arazi büyüklüğüne göre yumurtacı tavuk kümesi kurulup kurulamayacağını değerlendirir.
    
    Args:
        arazi_buyuklugu_m2: Arazinin büyüklüğü (m²)
        su_tahsis_belgesi_var_mi: Su tahsis belgesi var mı?
        yas_kapali_alanda_mi: Parsel YAS kapalı alan sınırları içinde mi?
        kullanici_adi: Kullanıcı adı (opsiyonel)
        tarih_saat: İşlem tarihi (opsiyonel)
        emsal_orani: Dinamik emsal oranı (varsayılan: DEFAULT_EMSAL_ORANI)
        
    Returns:
        dict: Değerlendirme sonuçlarını içeren sözlük
    """
    if yas_kapali_alanda_mi is True and su_tahsis_belgesi_var_mi is False:
        return {
            "izin_durumu": "izin_verilemez",
            "mesaj": "<b>Yeraltı Suyu Koruma Alanında kalan Arazide Su Tahsis Belgesi Zorunluluğu</b><br><br>"
                     "Seçilen arazi YAS (Yeraltı Suları Koruma Alanı) kapalı alan sınırları içerisinde yer almaktadır. "
                     "Bu tür arazilerde kanatlı hayvancılık tesisi yapımı için <b>su tahsis belgesi zorunludur.</b> "
                     "Mevcut durumda su tahsis belgeniz bulunmadığından bu alanda yumurtacı tavuk tesisi yapımına izin verilememektedir.",
            "kapasite": 0,
            "bakici_evi_hakki": False,
            "hayvan_tipi": "yumurtacı_tavuk",
            "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
            "hesaplama_detaylari": {"sonuç": "TESİS YAPILAMAZ", "açıklama": "YAS alanı içinde su tahsis belgesi yok."}
        }

    hesaplayici = KanatlıHesaplama(emsal_orani)
    sonuc = hesaplayici.hesapla(arazi_buyuklugu_m2, "yumurtacı_tavuk")
    
    # Dönen sonuçlar için okunabilir bir mesaj hazırla
    html_mesaj = _olustur_html_mesaj(sonuc, "YUMURTACI TAVUK TESİSİ DEĞERLENDİRME", emsal_orani)
    
    return {
        "izin_durumu": "izin_verilebilir" if "TESİS YAPILAMAZ" not in sonuc["sonuç"] else "izin_verilemez",
        "mesaj": html_mesaj,
        "html_mesaj": html_mesaj,  # Frontend uyumluluğu için HTML mesajını ayrıca html_mesaj alanında da döndür
        "kapasite": sonuc.get("hayvan_kapasitesi", 0),
        "bakici_evi_hakki": sonuc.get("bakıcı_evi_hakkı", False),
        "hayvan_tipi": "yumurtacı_tavuk",
        "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
        "emsal_m2": sonuc.get("emsal", 0),
        "kumes_alani_m2": sonuc.get("kümes_alanı", 0),
        "mustemilat_alani_m2": sonuc.get("müştemilat_alanı", 0),
        "hesaplama_detaylari": sonuc
    }

def etci_tavuk_degerlendir(arazi_buyuklugu_m2: float, su_tahsis_belgesi_var_mi: bool = None, yas_kapali_alanda_mi: bool = None, kullanici_adi: str = "", tarih_saat: str = "", emsal_orani: float = None) -> dict:
    """
    Arazi büyüklüğüne göre etçi tavuk kümesi kurulup kurulamayacağını değerlendirir.
    
    Args:
        arazi_buyuklugu_m2: Arazinin büyüklüğü (m²)
        su_tahsis_belgesi_var_mi: Su tahsis belgesi var mı?
        yas_kapali_alanda_mi: Parsel YAS kapalı alan sınırları içinde mi?
        kullanici_adi: Kullanıcı adı (opsiyonel)
        tarih_saat: İşlem tarihi (opsiyonel)
        emsal_orani: Dinamik emsal oranı (varsayılan: DEFAULT_EMSAL_ORANI)
        
    Returns:
        dict: Değerlendirme sonuçlarını içeren sözlük
    """
    if yas_kapali_alanda_mi is True and su_tahsis_belgesi_var_mi is False:
        return {
            "izin_durumu": "izin_verilemez",
            "mesaj": "<b>Yeraltı Suyu Koruma Alanında kalan Arazide Su Tahsis Belgesi Zorunluluğu</b><br><br>"
                     "Seçilen arazi YAS (Yeraltı Suları Koruma Alanı) kapalı alan sınırları içerisinde yer almaktadır. "
                     "Bu tür arazilerde kanatlı hayvancılık tesisi yapımı için <b>su tahsis belgesi zorunludur.</b> "
                     "Mevcut durumda su tahsis belgeniz bulunmadığından bu alanda etçi tavuk tesisi yapımına izin verilememektedir.",
            "kapasite": 0,
            "bakici_evi_hakki": False,
            "hayvan_tipi": "etçi_tavuk",
            "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
            "hesaplama_detaylari": {"sonuç": "TESİS YAPILAMAZ", "açıklama": "YAS alanı içinde su tahsis belgesi yok."}
        }

    hesaplayici = KanatlıHesaplama(emsal_orani)
    sonuc = hesaplayici.hesapla(arazi_buyuklugu_m2, "etçi_tavuk")
    
    # Dönen sonuçlar için okunabilir bir mesaj hazırla
    html_mesaj = _olustur_html_mesaj(sonuc, "ETÇİ TAVUK (BROİLER) TESİSİ DEĞERLENDİRME", emsal_orani)
    
    return {
        "izin_durumu": "izin_verilebilir" if "TESİS YAPILAMAZ" not in sonuc["sonuç"] else "izin_verilemez",
        "mesaj": html_mesaj,
        "html_mesaj": html_mesaj,  # Frontend uyumluluğu için HTML mesajını ayrıca html_mesaj alanında da döndür
        "kapasite": sonuc.get("hayvan_kapasitesi", 0),
        "bakici_evi_hakki": sonuc.get("bakıcı_evi_hakkı", False),
        "hayvan_tipi": "etçi_tavuk",
        "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
        "emsal_m2": sonuc.get("emsal", 0),
        "kumes_alani_m2": sonuc.get("kümes_alanı", 0),
        "mustemilat_alani_m2": sonuc.get("müştemilat_alanı", 0),
        "hesaplama_detaylari": sonuc
    }

def gezen_tavuk_degerlendir(arazi_buyuklugu_m2: float, su_tahsis_belgesi_var_mi: bool = None, yas_kapali_alanda_mi: bool = None, kullanici_adi: str = "", tarih_saat: str = "", emsal_orani: float = None) -> dict:
    """
    Arazi büyüklüğüne göre serbest dolaşan (gezen) tavuk kümesi kurulup kurulamayacağını değerlendirir.
    
    Args:
        arazi_buyuklugu_m2: Arazinin büyüklüğü (m²)
        su_tahsis_belgesi_var_mi: Su tahsis belgesi var mı?
        yas_kapali_alanda_mi: Parsel YAS kapalı alan sınırları içinde mi?
        kullanici_adi: Kullanıcı adı (opsiyonel)
        tarih_saat: İşlem tarihi (opsiyonel)
        emsal_orani: Dinamik emsal oranı (varsayılan: DEFAULT_EMSAL_ORANI)
        
    Returns:
        dict: Değerlendirme sonuçlarını içeren sözlük
    """
    if yas_kapali_alanda_mi is True and su_tahsis_belgesi_var_mi is False:
        return {
            "izin_durumu": "izin_verilemez",
            "mesaj": "<b>Yeraltı Suyu Koruma Alanında kalan Arazide Su Tahsis Belgesi Zorunluluğu</b><br><br>"
                     "Seçilen arazi YAS (Yeraltı Suları Koruma Alanı) kapalı alan sınırları içerisinde yer almaktadır. "
                     "Bu tür arazilerde kanatlı hayvancılık tesisi yapımı için <b>su tahsis belgesi zorunludur.</b> "
                     "Mevcut durumda su tahsis belgeniz bulunmadığından bu alanda serbest dolaşan tavuk tesisi yapımına izin verilememektedir.",
            "kapasite": 0,
            "bakici_evi_hakki": False,
            "hayvan_tipi": "serbest_tavuk",
            "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
            "hesaplama_detaylari": {"sonuç": "TESİS YAPILAMAZ", "açıklama": "YAS alanı içinde su tahsis belgesi yok."}
        }

    hesaplayici = KanatlıHesaplama(emsal_orani)
    sonuc = hesaplayici.hesapla(arazi_buyuklugu_m2, "serbest_tavuk")
    
    # Dönen sonuçlar için okunabilir bir mesaj hazırla
    html_mesaj = _olustur_html_mesaj(sonuc, "SERBEST DOLAŞAN (GEZEN) TAVUK TESİSİ DEĞERLENDİRME", emsal_orani)
    
    # Serbest dolaşan tavuklar için ek bilgileri de ekle
    if sonuc.get("gezinti_alanı_kapasitesi") is not None and sonuc.get("emsal_kapasitesi") is not None:
        ek_bilgiler = (
            f"<hr><b>SERBEST DOLAŞAN TAVUKLAR İÇİN EK BİLGİLER:</b><br>"
            f"Emsalin izin verdiği kapasite: {sonuc['emsal_kapasitesi']:,} adet<br>"
            f"Gezinti alanının izin verdiği kapasite: {sonuc['gezinti_alanı_kapasitesi']:,} adet<br>"
            f"Belirleyici kısıt: {sonuc.get('belirleyici_kısıt', 'belirsiz')}<br>"
            f"Gereken gezinti alanı: {(sonuc['hayvan_kapasitesi'] * 2):,.2f} m²"
        ).replace(",", ".")
        html_mesaj = html_mesaj.replace("<hr>NOT:", f"{ek_bilgiler}<hr>NOT:")
    
    return {
        "izin_durumu": "izin_verilebilir" if "TESİS YAPILAMAZ" not in sonuc["sonuç"] else "izin_verilemez",
        "mesaj": html_mesaj,
        "html_mesaj": html_mesaj,  # Frontend uyumluluğu için HTML mesajını ayrıca html_mesaj alanında da döndür
        "kapasite": sonuc.get("hayvan_kapasitesi", 0),
        "bakici_evi_hakki": sonuc.get("bakıcı_evi_hakkı", False),
        "hayvan_tipi": "serbest_tavuk",
        "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
        "emsal_m2": sonuc.get("emsal", 0),
        "kumes_alani_m2": sonuc.get("kümes_alanı", 0),
        "mustemilat_alani_m2": sonuc.get("müştemilat_alanı", 0),
        "gezinti_alani_kapasitesi": sonuc.get("gezinti_alanı_kapasitesi", 0),
        "emsal_kapasitesi": sonuc.get("emsal_kapasitesi", 0), 
        "belirleyici_kisit": sonuc.get("belirleyici_kısıt", ""),
        "hesaplama_detaylari": sonuc
    }

def hindi_degerlendir(arazi_buyuklugu_m2: float, su_tahsis_belgesi_var_mi: bool = None, yas_kapali_alanda_mi: bool = None, kullanici_adi: str = "", tarih_saat: str = "", emsal_orani: float = None) -> dict:
    """
    Arazi büyüklüğüne göre hindi kümesi kurulup kurulamayacağını değerlendirir.
    
    Args:
        arazi_buyuklugu_m2: Arazinin büyüklüğü (m²)
        su_tahsis_belgesi_var_mi: Su tahsis belgesi var mı?
        yas_kapali_alanda_mi: Parsel YAS kapalı alan sınırları içinde mi?
        kullanici_adi: Kullanıcı adı (opsiyonel)
        tarih_saat: İşlem tarihi (opsiyonel)
        emsal_orani: Dinamik emsal oranı (varsayılan: DEFAULT_EMSAL_ORANI)
        
    Returns:
        dict: Değerlendirme sonuçlarını içeren sözlük
    """
    if yas_kapali_alanda_mi is True and su_tahsis_belgesi_var_mi is False:
        return {
            "izin_durumu": "izin_verilemez",
            "mesaj": "<b>Yeraltı Suyu Koruma Alanında kalan Arazide Su Tahsis Belgesi Zorunluluğu</b><br><br>"
                     "Seçilen arazi YAS (Yeraltı Suları Koruma Alanı) kapalı alan sınırları içerisinde yer almaktadır. "
                     "Bu tür arazilerde kanatlı hayvancılık tesisi yapımı için <b>su tahsis belgesi zorunludur.</b> "
                     "Mevcut durumda su tahsis belgeniz bulunmadığından bu alanda hindi tesisi yapımına izin verilememektedir.",
            "kapasite": 0,
            "bakici_evi_hakki": False,
            "hayvan_tipi": "hindi",
            "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
            "hesaplama_detaylari": {"sonuç": "TESİS YAPILAMAZ", "açıklama": "YAS alanı içinde su tahsis belgesi yok."}
        }

    hesaplayici = KanatlıHesaplama(emsal_orani)
    sonuc = hesaplayici.hesapla(arazi_buyuklugu_m2, "hindi")
    
    # Dönen sonuçlar için okunabilir bir mesaj hazırla
    html_mesaj = _olustur_html_mesaj(sonuc, "HİNDİ TESİSİ DEĞERLENDİRME", emsal_orani)
    
    return {
        "izin_durumu": "izin_verilebilir" if "TESİS YAPILAMAZ" not in sonuc["sonuç"] else "izin_verilemez",
        "mesaj": html_mesaj,
        "html_mesaj": html_mesaj,  # Frontend uyumluluğu için HTML mesajını ayrıca html_mesaj alanında da döndür
        "kapasite": sonuc.get("hayvan_kapasitesi", 0),
        "bakici_evi_hakki": sonuc.get("bakıcı_evi_hakkı", False),
        "hayvan_tipi": "hindi",
        "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
        "emsal_m2": sonuc.get("emsal", 0),
        "kumes_alani_m2": sonuc.get("kümes_alanı", 0),
        "mustemilat_alani_m2": sonuc.get("müştemilat_alanı", 0),
        "hesaplama_detaylari": sonuc
    }

def kaz_ordek_degerlendir(arazi_buyuklugu_m2: float, su_tahsis_belgesi_var_mi: bool = None, yas_kapali_alanda_mi: bool = None, kullanici_adi: str = "", tarih_saat: str = "", emsal_orani: float = None) -> dict:
    """
    Arazi büyüklüğüne göre kaz-ördek çiftliği kurulup kurulamayacağını değerlendirir.
    
    Args:
        arazi_buyuklugu_m2: Arazinin büyüklüğü (m²)
        su_tahsis_belgesi_var_mi: Su tahsis belgesi var mı?
        yas_kapali_alanda_mi: Parsel YAS kapalı alan sınırları içinde mi?
        kullanici_adi: Kullanıcı adı (opsiyonel)
        tarih_saat: İşlem tarihi (opsiyonel)
        emsal_orani: Dinamik emsal oranı (varsayılan: DEFAULT_EMSAL_ORANI)
        
    Returns:
        dict: Değerlendirme sonuçlarını içeren sözlük
    """
    if yas_kapali_alanda_mi is True and su_tahsis_belgesi_var_mi is False:
        yas_mesaji = ("<b>Yeraltı Suyu Koruma Alanında kalan Arazide Su Tahsis Belgesi Zorunluluğu</b><br><br>"
                     "Seçilen arazi YAS (Yeraltı Suları Koruma Alanı) kapalı alan sınırları içerisinde yer almaktadır. "
                     "Bu tür arazilerde kanatlı hayvancılık tesisi yapımı için <b>su tahsis belgesi zorunludur.</b> "
                     "Mevcut durumda su tahsis belgeniz bulunmadığından bu alanda kaz-ördek çiftliği yapımına izin verilememektedir.")
        return {
            "izin_durumu": "izin_verilemez",
            "mesaj": yas_mesaji,
            "html_mesaj": yas_mesaji,  # Frontend uyumluluğu için HTML mesajını ayrıca html_mesaj alanında da döndür
            "kapasite": 0,
            "bakici_evi_hakki": False,
            "hayvan_tipi": "kaz", # veya "ördek" veya "kaz-ördek" olarak belirtilebilir
            "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
            "hesaplama_detaylari": {"sonuç": "TESİS YAPILAMAZ", "açıklama": "YAS alanı içinde su tahsis belgesi yok."}
        }

    hesaplayici = KanatlıHesaplama(emsal_orani)
    sonuc = hesaplayici.hesapla(arazi_buyuklugu_m2, "kaz") # Varsayılan olarak kaz yoğunluğu kullanılır
    
    # Dönen sonuçlar için okunabilir bir mesaj hazırla
    html_mesaj = _olustur_html_mesaj(sonuc, "KAZ-ÖRDEK ÇİFTLİĞİ DEĞERLENDİRME", emsal_orani)
    
    return {
        "izin_durumu": "izin_verilebilir" if "TESİS YAPILAMAZ" not in sonuc["sonuç"] else "izin_verilemez",
        "mesaj": html_mesaj,
        "html_mesaj": html_mesaj,  # Frontend uyumluluğu için HTML mesajını ayrıca html_mesaj alanında da döndür
        "kapasite": sonuc.get("hayvan_kapasitesi", 0),
        "bakici_evi_hakki": sonuc.get("bakıcı_evi_hakkı", False),
        "hayvan_tipi": "kaz",
        "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
        "emsal_m2": sonuc.get("emsal", 0),
        "kumes_alani_m2": sonuc.get("kümes_alanı", 0),
        "mustemilat_alani_m2": sonuc.get("müştemilat_alanı", 0),
        "hesaplama_detaylari": sonuc
    }

# ====== Yardımcı Fonksiyonlar ======

def _olustur_html_mesaj(sonuc: dict, baslik: str, emsal_orani: float = None) -> str:
    """
    Hesaplama sonuçlarını HTML formatında okunabilir bir mesaja dönüştürür.
    
    Args:
        sonuc: Hesaplama sonuçlarını içeren sözlük
        baslik: Mesajın başlığı
        emsal_orani: Kullanılacak emsal oranı (isteğe bağlı)
        
    Returns:
        str: HTML formatında okunabilir mesaj
    """
    from .constants import EMSAL_ORANI_MARJINAL
    kullanilacak_emsal = emsal_orani if emsal_orani is not None else EMSAL_ORANI_MARJINAL
    mesaj = f"<b>=== {baslik} ===</b><br><br>"
    mesaj += f"<b>Arazi Büyüklüğü:</b> {sonuc.get('arazi_alanı', 0):,.2f} m²<br>".replace(",", ".")
    mesaj += f"<b>İzin Verilen Emsal (%{kullanilacak_emsal*100:.0f}):</b> {sonuc.get('emsal', 0):,.2f} m²<br><br>".replace(",", ".")
    
    if "TESİS YAPILAMAZ" in sonuc.get("sonuç", ""):
        mesaj += f"<b>SONUÇ: TESİS YAPILAMAZ</b><br>"
        if "açıklama" in sonuc:
            mesaj += f"<b>Açıklama:</b> {sonuc['açıklama']}<br>"
    else:
        mesaj += "<b>KULLANIM DAĞILIMI:</b><br>"
        
        # Opsiyonel yapılar (Bakıcı evi, bekçi kulübesi, idari bina)
        # Yapılar listesini öncelik sırasına göre (varsa) düzenleyebiliriz veya olduğu gibi bırakabiliriz.
        # Örneğin: Bakıcı evi, sonra bekçi, sonra idari.
        yapilar_sirali = sorted(sonuc.get("yapılar", []), key=lambda x: (x['isim'] != 'Bakıcı evi', x['isim'] != 'Bekçi kulübesi', x['isim'] != 'İdari bina'))

        for yapı in yapilar_sirali: # sonuc.get("yapılar", []) yerine sıralı listeyi kullan
            mesaj += f"- {yapı['isim']}: {yapı['alan']:.2f} m²<br>"
        
        # Zorunlu yapılar
        mesaj += f"- Kümes alanı: {sonuc.get('kümes_alanı', 0):,.2f} m²<br>".replace(",", ".")
        mesaj += f"- Zorunlu müştemilat: {sonuc.get('müştemilat_alanı', 0):,.2f} m²<br><br>".replace(",", ".")
        
        hayvan_tipi_str = sonuc.get('hayvan_tipi', 'Bilinmeyen').replace("_", " ")
        mesaj += f"<b>HAYVAN KAPASİTESİ:</b> {sonuc.get('hayvan_kapasitesi', 0):,} adet {hayvan_tipi_str}<br>".replace(",", ".")
        
        # Bakıcı evi durum bilgisi
        bakıcı_evi_hakkı = sonuc.get("bakıcı_evi_hakkı", False)
        bakıcı_evi_fiilen_yapıldı = any(y['isim'] == 'Bakıcı evi' for y in sonuc.get("yapılar", []))
                
        mesaj += "<br><b>BAKICI EVİ DURUMU:</b> "
        if bakıcı_evi_hakkı and bakıcı_evi_fiilen_yapıldı:
            mesaj += "YAPILABİLİR (Hak kazanılmış ve alan yeterli)<br>"
        elif bakıcı_evi_hakkı and not bakıcı_evi_fiilen_yapıldı:
            mesaj += "YAPILAMAZ (Hak kazanılmış ancak mevcut emsal ile yapılamıyor/alan yetersiz)<br>"
        else: # bakıcı_evi_hakkı False
            hesaplayıcı = KanatlıHesaplama() # Eşik değerini almak için
            eşik = hesaplayıcı.bakıcı_evi_eşikleri.get(sonuc.get("hayvan_tipi"), "N/A")
            mesaj += f"YAPILAMAZ (Minimum {eşik:,} adet hayvan kapasitesi gerekirken {sonuc.get('hayvan_kapasitesi',0):,} adet var)<br>".replace(",", ".")
        
        mesaj += f"<br><b>SONUÇ:</b> {sonuc.get('sonuç','')}<br>"
        if "açıklama" in sonuc and sonuc["açıklama"]: # Açıklama boş değilse ekle
            mesaj += f"<b>Açıklama:</b> {sonuc['açıklama']}<br>"
    
    mesaj += "<hr>"
    mesaj += "<b>NOT:</b> Tüm hesaplamalar emsale dahil alanlar üzerinden yapılmıştır. "
    mesaj += "Gezinti alanları, istinat duvarları gibi emsale dahil olmayan "
    mesaj += "alanlar bu hesaplamalara dahil edilmemiştir."
    
    return mesaj

def yazdir_sonuc(sonuç):
    """Hesaplama sonuçlarını ekrana yazdırır"""
    print("\n" + "=" * 70)
    print(f"ARAZİ BÜYÜKLÜĞÜ: {sonuç['arazi_alanı']:,.2f} m²".replace(",", "."))
    print(f"İZİN VERİLEN EMSAL (%20): {sonuç['emsal']:,.2f} m²".replace(",", "."))
    print("-" * 70)
    
    if "sonuç" in sonuç and sonuç["sonuç"].startswith("TESİS YAPILAMAZ"):
        print("SONUÇ: TESİS YAPILAMAZ")
        if "açıklama" in sonuç:
            print(f"Açıklama: {sonuç['açıklama']}")
    else:
        print("KULLANIM DAĞILIMI:")
        
        # Opsiyonel yapılar
        for yapı in sonuç.get("yapılar", []):
            print(f"- {yapı['isim']}: {yapı['alan']:.2f} m²")
        
        # Zorunlu yapılar
        print(f"- Kümes alanı: {sonuç['kümes_alanı']:,.2f} m²".replace(",", "."))
        print(f"- Zorunlu müştemilat: {sonuç['müştemilat_alanı']:,.2f} m²".replace(",", "."))
        print("-" * 70)
        
        # Serbest dolaşan tavuklar için özel gösterge
        if sonuç['hayvan_tipi'] == "serbest_tavuk":
            print(f"HAYVAN KAPASİTESİ: {sonuç['hayvan_kapasitesi']:,} adet {sonuç['hayvan_tipi'].replace('_', ' ')}".replace(",", "."))
            print(f"EMSALİN İZİN VERDİĞİ KAPASİTE: {sonuç.get('emsal_kapasitesi', 0):,} adet".replace(",", "."))
            print(f"GEZİNTİ ALANININ İZİN VERDİĞİ KAPASİTE: {sonuç.get('gezinti_alanı_kapasitesi', 0):,} adet".replace(",", "."))
            print(f"BELİRLEYİCİ KISIT: {sonuç.get('belirleyici_kısıt', 'belirsiz')}".replace(",", "."))
            
            # Gezinti alanı gereksinimi
            gezinti_alanı_gereksinimi = sonuç['hayvan_kapasitesi'] * 2  # Her tavuk için 2 m²
            print(f"GEREKEN GEZİNTİ ALANI: {gezinti_alanı_gereksinimi:,.2f} m²".replace(",", "."))
        else:
            print(f"HAYVAN KAPASİTESİ: {sonuç['hayvan_kapasitesi']:,} adet {sonuç['hayvan_tipi'].replace('_', ' ')}".replace(",", "."))
        
        print("-" * 70)
        
        # Bakıcı evi durum bilgisi
        bakıcı_evi_var = False
        for yapı in sonuç.get("yapılar", []):
            if yapı["isim"] == "Bakıcı evi":
                bakıcı_evi_var = True
                break
                
        if sonuç["bakıcı_evi_hakkı"] and bakıcı_evi_var:
            print("BAKICI EVİ: YAPILABİLİR (Hak kazanılmış ve alan yeterli)")
        elif sonuç["bakıcı_evi_hakkı"] and not bakıcı_evi_var:
            print("BAKICI EVİ: YAPILAMAZ (Hak kazanılmış ancak alan yetersiz)")
        else:
            eşik = hesaplayıcı.bakıcı_evi_eşikleri[sonuç["hayvan_tipi"]]
            print(f"BAKICI EVİ: YAPILAMAZ (Minimum {eşik:,} adet hayvan kapasitesi gerekirken {sonuç['hayvan_kapasitesi']:,} adet var)".replace(",", "."))
        
        print("-" * 70)
        print(f"SONUÇ: {sonuç['sonuç']}")
        if "açıklama" in sonuç:
            print(f"Açıklama: {sonuç['açıklama']}")

    print("=" * 70)
    print("NOT: Tüm hesaplamalar emsale dahil alanlar üzerinden yapılmıştır.")
    print("Gezinti alanları, istinat duvarları gibi emsale dahil olmayan")
    print("alanlar bu hesaplamalara dahil edilmemiştir.")

def ana_menu():
    """Ana menüyü gösterir ve kullanıcıdan giriş ister"""
    print("=" * 70)
    print("KANATLI HAYVANCILIK TESİSİ EMSAL HESAPLAMA ARACI")
    print("=" * 70)
    print("Bu program, arazi büyüklüğünüze göre kurulabilecek kanatlı")
    print("hayvancılık tesisi kapasitesini ve yapı alanlarını hesaplar.")
    print("-" * 70)
    
    hayvan_tipleri = {
        "1": "yumurtacı_tavuk",
        "2": "etçi_tavuk",
        "3": "hindi",
        "4": "kaz",
        "5": "serbest_tavuk"
    }
    
    print("Lütfen hayvan tipini seçiniz:")
    print("1. Yumurtacı Tavuk (1 m² alanda 6 tavuk)")
    print("2. Etçi Tavuk (1 m² alanda 14 tavuk)")
    print("3. Hindi (1 m² alanda 3 hindi)")
    print("4. Kaz (1 m² alanda 2 kaz)")
    print("5. Serbest Tavuk (1 m² alanda 4 tavuk + 2 m² gezinti alanı)")
    
    hayvan_secim = input("Seçiminiz (1-5): ")
    if hayvan_secim not in hayvan_tipleri:
        print("Hata: Geçersiz seçim. Varsayılan olarak Yumurtacı Tavuk seçildi.")
        hayvan_secim = "1"
    
    hayvan_tipi = hayvan_tipleri[hayvan_secim]
    
    # Arazi büyüklüğünü al
    try:
        arazi_alani = float(input("Arazi büyüklüğünü metrekare olarak giriniz: "))
        if arazi_alani <= 0:
            print("Hata: Arazi büyüklüğü pozitif bir değer olmalıdır.")
            return
    except ValueError:
        print("Hata: Lütfen geçerli bir sayı giriniz.")
        return
    
    # Hesapla ve yazdır
    sonuç = hesaplayıcı.hesapla(arazi_alani, hayvan_tipi)
    yazdir_sonuc(sonuç)
    
    print("\nBaşka bir hesaplama yapmak istiyor musunuz? (e/h)")
    cevap = input()
    if cevap.lower() == "e":
        ana_menu()

def test_senaryolar():
    """Test senaryoları ile programın doğru çalıştığını kontrol eder"""
    print("\n" + "=" * 70)
    print("SERBEST DOLAŞAN TAVUK TESİSİ TEST SENARYOLARI")
    print("=" * 70)
    
    # Senaryo 5.1: EMSALİN ZORUNLU MÜŞTEMİLATA YETMEDİĞİ DURUM
    print("\nSenaryo 5.1: EMSALİN ZORUNLU MÜŞTEMİLATA YETMEDİĞİ DURUM")
    sonuç = hesaplayıcı.hesapla(150, "serbest_tavuk")
    yazdir_sonuc(sonuç)
    
    # Senaryo 5.2: KÜÇÜK BİR İŞLETME İÇİN YETERLİ EMSAL VE GEZİNTİ ALANI
    print("\nSenaryo 5.2: KÜÇÜK BİR İŞLETME İÇİN YETERLİ EMSAL VE GEZİNTİ ALANI")
    sonuç = hesaplayıcı.hesapla(400, "serbest_tavuk")
    yazdir_sonuc(sonuç)
    
    # Senaryo 5.3: ORTA ÖLÇEKLİ İŞLETME - GEZİNTİ ALANI KISITI
    print("\nSenaryo 5.3: ORTA ÖLÇEKLİ İŞLETME - GEZİNTİ ALANI KISITI")
    sonuç = hesaplayıcı.hesapla(1200, "serbest_tavuk")
    yazdir_sonuc(sonuç)
    
    # Senaryo 5.4: GEZİNTİ ALANI KISITINA GÖRE HESAPLANMIŞ ORTA ÖLÇEKLİ İŞLETME
    print("\nSenaryo 5.4: GEZİNTİ ALANI KISITINA GÖRE HESAPLANMIŞ ORTA ÖLÇEKLİ İŞLETME")
    sonuç = hesaplayıcı.hesapla(1800, "serbest_tavuk")
    yazdir_sonuc(sonuç)
    
    # Senaryo 5.5: BAKICI EVİ HAK EDECEK KAPASİTEYE ULAŞAN TESİS
    print("\nSenaryo 5.5: BAKICI EVİ HAK EDECEK KAPASİTEYE ULAŞAN TESİS")
    sonuç = hesaplayıcı.hesapla(3000, "serbest_tavuk")
    yazdir_sonuc(sonuç)
    
    # Senaryo 5.8: GEZİNTİ ALANI KISITINA GÖRE TASARLANMIŞ BÜYÜK TESİS
    print("\nSenaryo 5.8: GEZİNTİ ALANI KISITINA GÖRE TASARLANMIŞ BÜYÜK TESİS")
    sonuç = hesaplayıcı.hesapla(10000, "serbest_tavuk")
    yazdir_sonuc(sonuç)
    
    # Senaryo 5.9: ÇOK BÜYÜK ARAZİDE MAKSİMUM KAPASİTELİ TESİS
    print("\nSenaryo 5.9: ÇOK BÜYÜK ARAZİDE MAKSİMUM KAPASİTELİ TESİS")
    sonuç = hesaplayıcı.hesapla(30000, "serbest_tavuk")
    yazdir_sonuc(sonuç)

# ====== Program Ana Girişi ======

if __name__ == "__main__":
    hesaplayıcı = KanatlıHesaplama()
    
    # Test için
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_senaryolar()
    else:
        # Web modül testi
        if len(sys.argv) > 1 and sys.argv[1] == "--web-test":
            print("Kanatlı Hayvancılık Web Modülü Test Edililiyor...")
            test_arazi = 10000  # 10.000 m² test arazisi
            
            # Her bir kanatlı türü için test yapalım
            sonuc1 = yumurtaci_tavuk_degerlendir(test_arazi)
            print(f"Yumurtacı tavuk sonuç: {sonuc1['izin_durumu']}, kapasite: {sonuc1['kapasite']}")
            
            sonuc2 = etci_tavuk_degerlendir(test_arazi)
            print(f"Etçi tavuk sonuç: {sonuc2['izin_durumu']}, kapasite: {sonuc2['kapasite']}")
            
            sonuc3 = gezen_tavuk_degerlendir(test_arazi)
            print(f"Gezen tavuk sonuç: {sonuc3['izin_durumu']}, kapasite: {sonuc3['kapasite']}")
            
            sonuc4 = hindi_degerlendir(test_arazi)
            print(f"Hindi sonuç: {sonuc4['izin_durumu']}, kapasite: {sonuc4['kapasite']}")
            
            sonuc5 = kaz_ordek_degerlendir(test_arazi)
            print(f"Kaz-Ördek sonuç: {sonuc5['izin_durumu']}, kapasite: {sonuc5['kapasite']}")
        else:
            # Normal çalıştırma - ana menüyü göster
            ana_menu()