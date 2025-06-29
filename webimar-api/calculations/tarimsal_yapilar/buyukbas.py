"""
Büyükbaş Hayvancılık Tesisi (Süt ve Besi) Hesaplama Modülü
"""
import math  # Logaritmik hesaplama için math kütüphanesi eklendi

# Sabit Değerler (buyukbas_hayvancilik_tum_senaryolar.txt ve referans koda göre)
EMSAL_ORANI = 0.20
AHIR_YEM_DEPOSU_ALANI_HAYVAN_BASINA = 15  # m²/hayvan
GEZINTI_ALANI_SUT_SIGIRI = 7  # m²/hayvan (emsale dahil değil)

BAKICI_EVI_ESIKLERI = {
    "süt_sığırı": 25,  # baş
    "besi_sığırı": 50   # baş
}
BAKICI_EVI_BUYUKLUKLERI = {
    "550-1500": {"taban_alani": 75, "toplam_alan": 150},
    ">1500": {"taban_alani": 150, "toplam_alan": 300}
}
BEKCI_KULUBESI_ALANI = 15  # m²
IDARI_BINA_TABAN_ALANI = 75  # m²
IDARI_BINA_TOPLAM_ALAN = 150 # m²

SAGIMHANE_KATSAYI_SUT = 0.3 # Her 10 baş için ~3m², min 15m² (20 baş ve üzeri için)
SUT_DEPOLAMA_ALANI = 15 # m² (süt üretimi için, 20 baş ve üzeri için)
BESI_EKIPMAN_ALANI = 30 # m² (besi için, 30 baş ve üzeri için)

MIN_ZORUNLU_MUSTEMILAT_ALANI = 50  # m² (5 baş hayvandan az ise)
MIN_ISLEVSEL_AHIR_ALANI = 30  # m² (2 baş hayvan için)
AHIR_ALANI_ORANI = 5/7
MUSTEMILAT_ALANI_ORANI = 2/7 # veya ahır alanının %40'ı

# Yeni ekleme - Detaylı müştemilat tanımları
MUSTEMILAT_TANIMLARI = {
    # Zorunlu Müştemilatlar (Ahır ve Yem Deposu Hariç)
    "su_deposu": {
        "isim": "Su Deposu", "grup": "zorunlu", "oncelik": 1,
        "min_alan_m2": 5, "artis_hayvan_basi_m2": 0.03, "max_alan_m2": 40,  # max_alan_m2 düşürüldü
        "hayvan_tipi_gecerli": ["süt_sığırı", "besi_sığırı"]
    },
    "malzeme_deposu": {
        "isim": "Malzeme Deposu", "grup": "zorunlu", "oncelik": 2,
        "min_alan_m2": 10, "artis_hayvan_basi_m2": 0.07, "max_alan_m2": 100,  # max_alan_m2 düşürüldü
        "hayvan_tipi_gecerli": ["süt_sığırı", "besi_sığırı"]
    },
    "gubre_deposu": { # Gübre Çukuru / Sıvat Deposu
        "isim": "Gübre Deposu/Çukuru", "grup": "zorunlu", "oncelik": 3,
        "min_alan_m2": 20, "artis_hayvan_basi_m2": 0.35, "max_alan_m2": 250,  # max_alan_m2 düşürüldü
        "hayvan_tipi_gecerli": ["süt_sığırı", "besi_sığırı"]
    },
    "jenerator_odasi": {
        "isim": "Jeneratör Odası", "grup": "zorunlu", "oncelik": 4,
        "min_alan_m2": 5, "artis_hayvan_basi_m2": 0.002, "max_alan_m2": 25,  # artış katsayısı dramatik şekilde düşürüldü
        "hayvan_tipi_gecerli": ["süt_sığırı", "besi_sığırı"]
    },
    "revir": {
        "isim": "Revir / Hasta Hayvan Bölümü", "grup": "zorunlu", "oncelik": 5,
        "min_alan_m2": 10, "artis_hayvan_basi_m2": 0.06, "max_alan_m2": 80,  # max_alan_m2 düşürüldü
        "hayvan_tipi_gecerli": ["süt_sığırı", "besi_sığırı"]
    },
    "samanlik": { # Kaba Yem Deposu
        "isim": "Samanlık / Kaba Yem Deposu", "grup": "zorunlu", "oncelik": 6,
        "min_alan_m2": 20, "artis_hayvan_basi_m2": 0.30, "max_alan_m2": 400,  # max_alan_m2 düşürüldü
        "hayvan_tipi_gecerli": ["süt_sığırı", "besi_sığırı"]
    },
    "sagimhane_sut_unitesi": { # Sadece Süt Sığırcılığı için Zorunlu
        "isim": "Sağımhane ve Süt Soğutma/Depolama Ünitesi", "grup": "zorunlu", "oncelik": 7,
        "min_alan_m2": 15,  
        "artis_hayvan_basi_m2": 0.12, 
        "max_alan_m2": 200,  # max_alan_m2 düşürüldü
        "aktiflesme_esigi_hayvan_sayisi": 10,
        "hayvan_tipi_gecerli": ["süt_sığırı"]
    },
    # Opsiyonel Müştemilatlar
    "bekci_kulubesi": {
        "isim": "Bekçi Kulübesi", "grup": "opsiyonel", "oncelik": 10,
        "sabit_alan_m2": 15,
        "hayvan_tipi_gecerli": ["süt_sığırı", "besi_sığırı"]
    },
    "idari_bina": {
        "isim": "İdari Bina", "grup": "opsiyonel", "oncelik": 11,
        "sabit_alan_m2": 75, # Taban alanı
        "toplam_insaat_alan_m2": 150, # İki katlı olabilir
        "hayvan_tipi_gecerli": ["süt_sığırı", "besi_sığırı"]
    },
    "besi_ozel_ekipman_alani": { # Sadece Besi Sığırcılığı için Opsiyonel
        "isim": "Besi İçin Özel Ekipman ve Yem Hazırlama Alanı", "grup": "opsiyonel", "oncelik": 12,
        "min_alan_m2": 20,
        "artis_hayvan_basi_m2": 0.2, "max_alan_m2": 50,
        "aktiflesme_esigi_hayvan_sayisi": 30, # Örneğin 30 baş ve üzeri için düşünülür
        "hayvan_tipi_gecerli": ["besi_sığırı"]
    },
    "paketleme_tesisi": {
        "isim": "Paketleme Tesisi ve Deposu", "grup": "opsiyonel", "oncelik": 13,
        "min_alan_m2": 50, "artis_hayvan_basi_m2": 0.5, "max_alan_m2": 200,
        "hayvan_tipi_gecerli": ["süt_sığırı", "besi_sığırı"] # Genellikle büyük işletmeler için
    }
}

class BuyukbasHesaplama:
    def __init__(self, emsal_orani: float = None):
        self.emsal_orani = emsal_orani if emsal_orani is not None else EMSAL_ORANI
        self.ahir_yem_deposu_alani_hayvan_basina = AHIR_YEM_DEPOSU_ALANI_HAYVAN_BASINA
        self.gezinti_alani_sut_sigiri = GEZINTI_ALANI_SUT_SIGIRI
        self.bakici_evi_esikleri = BAKICI_EVI_ESIKLERI
        self.bakici_evi_buyuklukleri = BAKICI_EVI_BUYUKLUKLERI
        self.bekci_kulubesi_alani = BEKCI_KULUBESI_ALANI
        self.idari_bina_taban_alani = IDARI_BINA_TABAN_ALANI
        self.idari_bina_toplam_alan = IDARI_BINA_TOPLAM_ALAN
        self.sagimhane_katsayi_sut = SAGIMHANE_KATSAYI_SUT
        self.sut_depolama_alani = SUT_DEPOLAMA_ALANI
        self.besi_ekipman_alani = BESI_EKIPMAN_ALANI
        self.min_zorunlu_mustemilat_alani = MIN_ZORUNLU_MUSTEMILAT_ALANI
        self.min_islevsel_ahir_alani = MIN_ISLEVSEL_AHIR_ALANI
        self.ahir_alani_orani = AHIR_ALANI_ORANI
        self.mustemilat_alani_orani = MUSTEMILAT_ALANI_ORANI
        # Yeni eklenen özellik
        self.mustemilat_tanimlari = MUSTEMILAT_TANIMLARI

    def _hesapla_mustemilat_alani(self, must_tanimi: dict, hayvan_kapasitesi: int) -> float:
        """
        Belirli bir müştemilat için hayvan kapasitesine göre alan hesaplar
        """
        if must_tanimi.get("aktiflesme_esigi_hayvan_sayisi", 0) > hayvan_kapasitesi:
            return 0.0

        # kod değişkenini fonksiyon başında tanımla
        kod = next((k for k, v in self.mustemilat_tanimlari.items() if v == must_tanimi), None)

        alan = 0
        if "sabit_alan_m2" in must_tanimi:
            alan = must_tanimi["sabit_alan_m2"]
        else:
            alan = must_tanimi.get("min_alan_m2", 0)
            
            # Büyük tesisler için özel ölçekleme uygulanacak müştemilatlar
            ozel_olcekleme_gerektiren_mustemilatlar = ["jenerator_odasi", "revir", "su_deposu"]
            
            # Jeneratör odası için çok daha sıkı bir ölçekleme stratejisi
            if kod == "jenerator_odasi":
                if hayvan_kapasitesi < 50:
                    val = 10
                else:
                    val = 10 + 30 * math.log10(hayvan_kapasitesi / 50)
                val = round(val, 2)
                return min(val, must_tanimi.get("max_alan_m2", 100))
            
            # Diğer kritik müştemilatlar için özel bir ölçekleme fonksiyonu
            elif kod in ozel_olcekleme_gerektiren_mustemilatlar:
                if hayvan_kapasitesi > 20000:  # Çok büyük tesisler için sabit değerler
                    # 20,000+ baş için kritik altyapı müştemilat boyutları çok fazla büyümemeli
                    if kod == "su_deposu":
                        return min(40, must_tanimi.get("max_alan_m2", 40))  # Sabit 40m² veya max değer
                    elif kod == "revir":
                        return min(80, must_tanimi.get("max_alan_m2", 80))  # Sabit 80m² veya max değer
                elif hayvan_kapasitesi > 1000:
                    # 1000-20,000 arası hayvan için çok daha agresif ölçekleme
                    if hayvan_kapasitesi > 5000:  # Çok büyük tesisler
                        olcekleme_faktoru = 0.005 + (0.01 * (math.log10(1000) / math.log10(hayvan_kapasitesi)))
                    else:  # Orta büyüklükteki tesisler
                        olcekleme_faktoru = 0.05 + (0.1 * (math.log10(1000) / math.log10(hayvan_kapasitesi)))
                    
                    artis = must_tanimi.get("artis_hayvan_basi_m2", 0) * hayvan_kapasitesi * olcekleme_faktoru
                    alan += artis
                    return min(alan, must_tanimi.get("max_alan_m2", float('inf')))
        
        # Gübre deposu ve samanlık için özel ölçekleme - çok büyük tesisler için daha agresif
        if kod in ["gubre_deposu", "samanlik"]:
            if hayvan_kapasitesi > 20000:  # Çok büyük tesisler için daha agresif ölçekleme
                olcekleme_faktoru = 0.005 + (0.005 * (math.log10(5000) / math.log10(hayvan_kapasitesi)))
            elif hayvan_kapasitesi > 5000:
                olcekleme_faktoru = 0.02 + (0.03 * (math.log10(5000) / math.log10(hayvan_kapasitesi)))
            elif hayvan_kapasitesi > 500:
                olcekleme_faktoru = 0.1 + (0.1 * (math.log10(500) / math.log10(hayvan_kapasitesi)))
            else:
                olcekleme_faktoru = 1.0
        # Sağımhane için özel ölçekleme - daha da agresif sınırlandırma
        elif kod == "sagimhane_sut_unitesi":
            if hayvan_kapasitesi > 20000:  # Çok büyük tesisler için daha agresif ölçekleme
                olcekleme_faktoru = 0.005 + (0.005 * (math.log10(5000) / math.log10(hayvan_kapasitesi)))
            elif hayvan_kapasitesi > 5000:
                olcekleme_faktoru = 0.02 + (0.03 * (math.log10(5000) / math.log10(hayvan_kapasitesi)))
            elif hayvan_kapasitesi > 500:
                olcekleme_faktoru = 0.1 + (0.1 * (math.log10(500) / math.log10(hayvan_kapasitesi)))
            else:
                olcekleme_faktoru = 1.0
        # Diğer müştemilatlar için normal logaritmik ölçekleme
        else:
            olcekleme_faktoru = 1.0
            if hayvan_kapasitesi > 500:
                # Orta büyüklükteki tesisler (500-5000 arası)
                if hayvan_kapasitesi <= 5000:  
                    olcekleme_faktoru = 0.3 + (0.5 * (math.log10(500) / math.log10(hayvan_kapasitesi)))
                # Büyük tesisler (5000-15000 arası)
                elif hayvan_kapasitesi <= 15000:  
                    olcekleme_faktoru = 0.15 + (0.15 * (math.log10(5000) / math.log10(hayvan_kapasitesi)))
                # Çok büyük tesisler (15000-30000 arası)
                elif hayvan_kapasitesi <= 30000:  
                    olcekleme_faktoru = 0.05 + (0.1 * (math.log10(15000) / math.log10(hayvan_kapasitesi)))
                # Devasa tesisler (30000+)
                else:
                    olcekleme_faktoru = 0.03 + (0.02 * (math.log10(30000) / math.log10(hayvan_kapasitesi)))
    
        artis = must_tanimi.get("artis_hayvan_basi_m2", 0) * hayvan_kapasitesi * olcekleme_faktoru
        alan += artis
        
        if "max_alan_m2" in must_tanimi:
            alan = min(alan, must_tanimi["max_alan_m2"])
    
        return alan

    def hesapla(self, arazi_alani_m2: float, hayvan_tipi: str):
        """Büyükbaş hayvancılık tesisi için alan ve kapasite hesaplaması yapar"""
        emsal = arazi_alani_m2 * self.emsal_orani
        bakici_evi_esigi = self.bakici_evi_esikleri[hayvan_tipi]

        # Emsal alanı, minimum zorunlu müştemilat alanından bile azsa, hiçbir şekilde yapılamaz
        if emsal < self.min_zorunlu_mustemilat_alani:
            return {
                "sonuc_mesaji": "TESİS YAPILAMAZ", 
                "aciklama": f"Emsale göre izin verilen {emsal:.2f} m² yapılaşma alanı, zorunlu müştemilat için gerekli olan minimum {self.min_zorunlu_mustemilat_alani:.2f} m²'den bile azdır.",
                "arazi_alani_m2": arazi_alani_m2, 
                "emsal_m2": emsal, 
                "hayvan_tipi": hayvan_tipi, 
                "hayvan_kapasitesi": 0,
                "bakici_evi_hakki": False, 
                "yapilar": []
            }
        
        # Emsal yeterli ama ahır için alan kalmıyorsa yine yapılamaz
        if emsal < self.min_zorunlu_mustemilat_alani + self.min_islevsel_ahir_alani:
            return {
                "sonuc_mesaji": "TESİS YAPILAMAZ", 
                "aciklama": f"Zorunlu müştemilat alanı ({self.min_zorunlu_mustemilat_alani:.2f} m²) karşılandıktan sonra ahır için yeterli ({self.min_islevsel_ahir_alani:.2f} m²) alan kalmamaktadır.",
                "arazi_alani_m2": arazi_alani_m2, 
                "emsal_m2": emsal, 
                "hayvan_tipi": hayvan_tipi, 
                "hayvan_kapasitesi": 0,
                "bakici_evi_hakki": False, 
                "yapilar": []
            }

        # ---------- Yeniden Yapılandırılmış Hesaplama Mantığı ----------
        final_hayvan_kapasitesi = 0
        ahir_alani_final = 0
        zorunlu_mustemilat_detaylari_final = []
        # Kalan emsal, ahır, zorunlu müştemilatlar VE bakıcı evi (yapılırsa) sonrası
        kalan_emsal_opsiyonel_icin = 0 
        
        # Bakıcı evi detayları (iterasyonla belirlenecek)
        bakici_evi_yapildi_final = False
        bakici_evi_taban_alani_final = 0
        bakici_evi_toplam_insaat_alani_final = 0
        
        # Maksimum olası hayvan sayısından başlayarak en uygun kapasiteyi bulma (iteratif yaklaşım)
        tahmini_max_hayvan_emsalden = int((emsal * self.ahir_alani_orani) / self.ahir_yem_deposu_alani_hayvan_basina)
        
        for h_kapasite_deneme in range(tahmini_max_hayvan_emsalden, -1, -1):
            if h_kapasite_deneme == 0 and emsal < self.min_zorunlu_mustemilat_alani:
                 return {
                     "sonuc_mesaji": "TESİS YAPILAMAZ", 
                     "aciklama": f"Emsal ({emsal:.2f} m²), minimum zorunlu müştemilat ({self.min_zorunlu_mustemilat_alani:.2f} m²) için bile yetersiz.",
                     "arazi_alani_m2": arazi_alani_m2, 
                     "emsal_m2": emsal, 
                     "hayvan_tipi": hayvan_tipi,
                     "hayvan_kapasitesi": 0,
                     "bakici_evi_hakki": False,
                     "yapilar": []
                 }

            gerekli_ahir_alani_deneme = h_kapasite_deneme * self.ahir_yem_deposu_alani_hayvan_basina
            
            if h_kapasite_deneme > 0 and gerekli_ahir_alani_deneme < self.min_islevsel_ahir_alani:
                continue

            anlik_zorunlu_mustemilat_detaylari = []
            toplam_hesaplanan_zorunlu_must_alani = 0
            for key, tanim in self.mustemilat_tanimlari.items():
                if tanim["grup"] == "zorunlu" and hayvan_tipi in tanim["hayvan_tipi_gecerli"]:
                    alan = self._hesapla_mustemilat_alani(tanim, h_kapasite_deneme)
                    if alan > 0:
                        anlik_zorunlu_mustemilat_detaylari.append({"isim": tanim["isim"], "alan_m2": alan, "kod": key})
                        toplam_hesaplanan_zorunlu_must_alani += alan
            
            min_toplam_zorunlu_must_kurali = 0
            if h_kapasite_deneme > 0:
                min_toplam_zorunlu_must_kurali = max(gerekli_ahir_alani_deneme * 0.40, self.min_zorunlu_mustemilat_alani if h_kapasite_deneme < 5 else 0)
            elif emsal >= self.min_zorunlu_mustemilat_alani:
                min_toplam_zorunlu_must_kurali = self.min_zorunlu_mustemilat_alani

            farki_kapatmak_icin_ek_alan = 0
            if toplam_hesaplanan_zorunlu_must_alani < min_toplam_zorunlu_must_kurali:
                farki_kapatmak_icin_ek_alan = min_toplam_zorunlu_must_kurali - toplam_hesaplanan_zorunlu_must_alani

            fiili_toplam_zorunlu_must_alani = toplam_hesaplanan_zorunlu_must_alani + farki_kapatmak_icin_ek_alan

            if farki_kapatmak_icin_ek_alan > 0 and toplam_hesaplanan_zorunlu_must_alani > 0:
                for must_detay in anlik_zorunlu_mustemilat_detaylari:
                    oran = must_detay["alan_m2"] / toplam_hesaplanan_zorunlu_must_alani
                    must_detay["alan_m2"] += farki_kapatmak_icin_ek_alan * oran
            elif farki_kapatmak_icin_ek_alan > 0:
                anlik_zorunlu_mustemilat_detaylari.append({"isim": "Asgari Zorunlu Müştemilat Alanı", "alan_m2": farki_kapatmak_icin_ek_alan, "kod": "diger_zorunlu"})

            # Bakıcı evi için potansiyel alanı hesapla (eğer hak kazanılıyorsa ve yapılabiliyorsa)
            deneme_bakici_evi_hakki = h_kapasite_deneme >= bakici_evi_esigi
            potansiyel_bakici_evi_taban_alani_iter = 0
            potansiyel_bakici_evi_toplam_insaat_iter = 0
            
            if deneme_bakici_evi_hakki:
                toplam_ana_yapi_alani_deneme = gerekli_ahir_alani_deneme + fiili_toplam_zorunlu_must_alani
                if toplam_ana_yapi_alani_deneme > 1500:
                    potansiyel_bakici_evi_taban_alani_iter = self.bakici_evi_buyuklukleri[">1500"]["taban_alani"]
                    potansiyel_bakici_evi_toplam_insaat_iter = self.bakici_evi_buyuklukleri[">1500"]["toplam_alan"]
                elif toplam_ana_yapi_alani_deneme >= 550:
                    potansiyel_bakici_evi_taban_alani_iter = self.bakici_evi_buyuklukleri["550-1500"]["taban_alani"]
                    potansiyel_bakici_evi_toplam_insaat_iter = self.bakici_evi_buyuklukleri["550-1500"]["toplam_alan"]

            toplam_gerekli_emsal_deneme = gerekli_ahir_alani_deneme + fiili_toplam_zorunlu_must_alani + potansiyel_bakici_evi_taban_alani_iter

            if toplam_gerekli_emsal_deneme <= emsal:
                final_hayvan_kapasitesi = h_kapasite_deneme
                ahir_alani_final = gerekli_ahir_alani_deneme
                zorunlu_mustemilat_detaylari_final = sorted(anlik_zorunlu_mustemilat_detaylari, 
                                                          key=lambda x: self.mustemilat_tanimlari.get(x["kod"], {"oncelik": 99}).get("oncelik", 99))
                
                bakici_evi_yapildi_final = (potansiyel_bakici_evi_taban_alani_iter > 0)
                bakici_evi_taban_alani_final = potansiyel_bakici_evi_taban_alani_iter
                bakici_evi_toplam_insaat_alani_final = potansiyel_bakici_evi_toplam_insaat_iter
                
                kalan_emsal_opsiyonel_icin = emsal - toplam_gerekli_emsal_deneme
                break 
        
        if final_hayvan_kapasitesi == 0 and ahir_alani_final == 0: # Ve bakıcı evi de yapılamadıysa
            # Bu durum, ya başlangıçta emsal yetersizdir ya da min. işlevsel ahır + min. müştemilat sığmıyordur.
            # Başlangıç kontrolleri bu durumu yakalamalı.
            aciklama = f"Emsal ({emsal:.2f} m²), "
            if emsal < self.min_zorunlu_mustemilat_alani:
                 aciklama += f"minimum zorunlu müştemilat ({self.min_zorunlu_mustemilat_alani:.2f} m²) için bile yetersiz."
            elif emsal < self.min_zorunlu_mustemilat_alani + self.min_islevsel_ahir_alani:
                 aciklama += f"zorunlu müştemilat ({self.min_zorunlu_mustemilat_alani:.2f} m²) ve minimum işlevsel ahır ({self.min_islevsel_ahir_alani:.2f} m²) için yetersiz."
            else:
                 aciklama += "belirlenen kapasitede ahır, zorunlu müştemilatlar ve potansiyel bakıcı evi için yeterli alan bulunamadı."
            return {
                "sonuc_mesaji": "TESİS YAPILAMAZ", 
                "aciklama": aciklama, 
                "arazi_alani_m2": arazi_alani_m2, 
                "emsal_m2": emsal, 
                "hayvan_tipi": hayvan_tipi,
                "hayvan_kapasitesi": 0,
                "bakici_evi_hakki": False,
                "yapilar": []
            }

        yapilar_listesi = []
        for z_must in zorunlu_mustemilat_detaylari_final:
            yapilar_listesi.append({
                "isim": z_must["isim"], 
                "taban_alani": z_must["alan_m2"], 
                "toplam_alan": z_must["alan_m2"], 
                "tip": "zorunlu_mustemilat"
            })

        if bakici_evi_yapildi_final:
            yapilar_listesi.append({
                "isim": "Bakıcı Evi", 
                "taban_alani": bakici_evi_taban_alani_final, 
                "toplam_alan": bakici_evi_toplam_insaat_alani_final,
                "tip": "bakici_evi"
            })
        
        # Raporlama için bakıcı evi hakkı durumu
        bakici_evi_hakki_kazanildi_raporlama = final_hayvan_kapasitesi >= bakici_evi_esigi
        
        sirali_opsiyonel_mustemilatlar = sorted(
            [v for k, v in self.mustemilat_tanimlari.items() if v["grup"] == "opsiyonel" and hayvan_tipi in v["hayvan_tipi_gecerli"]],
            key=lambda x: x["oncelik"]
        )

        for ops_tanim in sirali_opsiyonel_mustemilatlar:
            ops_alan = self._hesapla_mustemilat_alani(ops_tanim, final_hayvan_kapasitesi)
            ops_toplam_insaat = ops_tanim.get("toplam_insaat_alan_m2", ops_alan)

            if ops_alan > 0 and kalan_emsal_opsiyonel_icin >= ops_alan:
                yapilar_listesi.append({
                    "isim": ops_tanim["isim"], 
                    "taban_alani": ops_alan, 
                    "toplam_alan": ops_toplam_insaat,
                    "tip": "opsiyonel_mustemilat"
                })
                kalan_emsal_opsiyonel_icin -= ops_alan

        sonuc_mesaji_str = ""
        hayvan_tipi_metni = "SÜT SIĞIRI" if hayvan_tipi == "süt_sığırı" else "BESİ SIĞIRI"
        if final_hayvan_kapasitesi > 0:
            if bakici_evi_hakki_kazanildi_raporlama and bakici_evi_yapildi_final:
                sonuc_mesaji_str = f"TESİS VE BAKICI EVİ YAPILABİLİR ({final_hayvan_kapasitesi} BAŞ {hayvan_tipi_metni} KAPASİTELİ)"
            elif bakici_evi_hakki_kazanildi_raporlama and not bakici_evi_yapildi_final:
                sonuc_mesaji_str = f"TESİS YAPILABİLİR ({final_hayvan_kapasitesi} BAŞ {hayvan_tipi_metni} KAPASİTELİ), BAKICI EVİ HAKKI KAZANILIR ANCAK YAPILAMAZ (Yetersiz emsal veya yapı alanı kriteri sağlanmıyor)"
            else: # bakıcı evi hakkı kazanılmadı
                sonuc_mesaji_str = f"TESİS YAPILABİLİR ({final_hayvan_kapasitesi} BAŞ {hayvan_tipi_metni} KAPASİTELİ, BAKICI EVİ HAK DOĞMAZ)"
        else:
            sonuc_mesaji_str = "TESİS YAPILAMAZ"
            # Açıklama zaten ilk kontrollerde veya iterasyon sonrası 'if final_hayvan_kapasitesi == 0' bloğunda set edilmiş olmalı.

        hesaplama_sonucu = {
            "arazi_alani_m2": arazi_alani_m2,
            "emsal_m2": emsal,
            "hayvan_tipi": hayvan_tipi,
            "ahir_alani_m2": ahir_alani_final,
            "mustemilat_alani_m2": sum(yapi["taban_alani"] for yapi in yapilar_listesi if yapi["tip"] == "zorunlu_mustemilat"),
            "hayvan_kapasitesi": final_hayvan_kapasitesi,
            "bakici_evi_hakki": bakici_evi_hakki_kazanildi_raporlama, # Raporlama için genel hak durumu
            "bakici_evi_yapildi": bakici_evi_yapildi_final, # Fiili yapılma durumu
            "bakici_evi_taban_alani_m2": bakici_evi_taban_alani_final if bakici_evi_yapildi_final else 0,
            "bakici_evi_toplam_insaat_alani_m2": bakici_evi_toplam_insaat_alani_final if bakici_evi_yapildi_final else 0,
            "yapilar": yapilar_listesi,
            "sonuc_mesaji": sonuc_mesaji_str,
            "aciklama": "Detaylı değerlendirme yapılmıştır.", # Bu, _olustur_html_mesaj_buyukbas içinde daha spesifik bir açıklama ile desteklenebilir.
            "kalan_emsal_m2": kalan_emsal_opsiyonel_icin 
        }
        
        # Süt sığırları için gezinti alanı hesaplaması ve kontrolü
        if hayvan_tipi == "süt_sığırı" and final_hayvan_kapasitesi > 0:
            gezinti_alani_gerekli = final_hayvan_kapasitesi * self.gezinti_alani_sut_sigiri
            hesaplama_sonucu["gezinti_alani_m2_gerekli"] = gezinti_alani_gerekli
            
            if arazi_alani_m2 < (emsal + hesaplama_sonucu["gezinti_alani_m2_gerekli"]):
                 hesaplama_sonucu["uyari_gezinti_alani"] = f"Dikkat: {final_hayvan_kapasitesi} baş süt sığırı için gereken {hesaplama_sonucu['gezinti_alani_m2_gerekli']:.2f} m² gezinti alanını karşılamak için toplam arazi büyüklüğü yetersiz olabilir."

        return hesaplama_sonucu


def _olustur_html_mesaj_buyukbas(sonuc: dict, baslik_ek: str, emsal_orani: float = None) -> str:
    """HTML formatında detaylı sonuç raporu oluşturur"""
    kullanilacak_emsal = emsal_orani if emsal_orani is not None else EMSAL_ORANI
    mesaj = f"<b>=== BÜYÜKBAŞ {baslik_ek.upper()} TESİSİ DEĞERLENDİRME ===</b><br><br>"
    mesaj += f"<b>Arazi Büyüklüğü:</b> {sonuc.get('arazi_alani_m2', 0):,.2f} m²<br>"
    mesaj += f"<b>İzin Verilen Toplam Emsal Alanı (%{kullanilacak_emsal*100:.0f}):</b> {sonuc.get('emsal_m2', 0):,.2f} m²<br><br>"

    if "TESİS YAPILAMAZ" in sonuc.get("sonuc_mesaji", ""):
        mesaj += f"<b style='color:red;'>SONUÇ: TESİS YAPILAMAZ</b><br>"
        mesaj += f"<b>Açıklama:</b> {sonuc.get('aciklama', 'Belirtilmemiş')}<br>"
    else:
        # Tesis yapılabilir durumunda detaylı bilgiler
        mesaj += "<b>TESİS BİLGİLERİ:</b><br>"
        
        # Ahır alanı ve hayvan kapasitesi
        mesaj += f"- Ahır ve Yem Deposu Alanı: {sonuc.get('ahir_alani_m2', 0):,.2f} m²<br>"
        
        # Müştemilat detayları (yeni yapı)
        toplam_kullanilan_emsal = sonuc.get('ahir_alani_m2', 0)
        
        if sonuc.get("yapilar"):
            # Yapıları tipine göre gruplayalım
            yapilar_gruplu = {
                "zorunlu_mustemilat": [],
                "bakici_evi": [],
                "opsiyonel_mustemilat": []
            }
            
            for yapi in sonuc.get("yapilar", []):
                tip = yapi.get("tip", "diger")
                if tip in yapilar_gruplu:
                    yapilar_gruplu[tip].append(yapi)
            
            # Zorunlu müştemilatlar
            if yapilar_gruplu["zorunlu_mustemilat"]:
                mesaj += "<b>Yapılabilecek Müştemilatlar:</b><br>" # Başlık düzeltildi/onaylandı
                for yapi in yapilar_gruplu["zorunlu_mustemilat"]:
                    mesaj += f"- {yapi['isim']}: {yapi['taban_alani']:.2f} m²<br>"
                    toplam_kullanilan_emsal += yapi['taban_alani']
            
            # Bakıcı evi bilgisi
            if yapilar_gruplu["bakici_evi"]:
                for yapi in yapilar_gruplu["bakici_evi"]:
                    mesaj += f"<br><b>Bakıcı Evi:</b> {yapi['taban_alani']:.2f} m² taban alanı (Toplam inşaat: {yapi['toplam_alan']:.2f} m²)<br>"
                    toplam_kullanilan_emsal += yapi['taban_alani']
            
            # Opsiyonel müştemilatlar
            if yapilar_gruplu["opsiyonel_mustemilat"]:
                mesaj += "<br><b>Opsiyonel Yapılar:</b><br>"
                for yapi in yapilar_gruplu["opsiyonel_mustemilat"]:
                    mesaj += f"- {yapi['isim']}: {yapi['taban_alani']:.2f} m²"
                    if yapi.get('toplam_alan', yapi['taban_alani']) != yapi['taban_alani']:
                        mesaj += f" (Toplam İnşaat: {yapi['toplam_alan']:.2f} m²)"
                    mesaj += "<br>"
                    toplam_kullanilan_emsal += yapi['taban_alani']
        
        # Hayvan kapasitesi bilgisi
        mesaj += f"<br><b>Hayvan Kapasitesi:</b> {sonuc.get('hayvan_kapasitesi', 0)} Baş {sonuc.get('hayvan_tipi','').replace('_',' ').upper()}<br>"
        
        # Süt sığırları için gezinti alanı bilgisi
        if sonuc.get('hayvan_tipi') == 'süt_sığırı':
            mesaj += f"<b>Gerekli Açık Gezinti Alanı (Emsal Dışı):</b> {sonuc.get('gezinti_alani_m2_gerekli', 0):,.2f} m²<br>"
            if "uyari_gezinti_alani" in sonuc:
                mesaj += f"<small style='color:orange;'><i>{sonuc['uyari_gezinti_alani']}</i></small><br>"

        # Bakıcı evi durumu
        mesaj += "<br><b>Bakıcı Evi Durumu:</b> "
        if sonuc.get("bakici_evi_hakki"):
            if sonuc.get("bakici_evi_yapildi"):
                mesaj += f"YAPILABİLİR (Hak kazanılmış, {sonuc.get('bakici_evi_taban_alani_m2',0)} m² taban alanlı, {sonuc.get('bakici_evi_toplam_insaat_alani_m2',0)} m² toplam inşaat alanlı olarak planlanmıştır).<br>"
            else:
                mesaj += "YAPILAMAZ (Hak kazanılmış ancak mevcut emsal ile yapılamıyor veya yapı alanı kriteri sağlanmıyor).<br>"
        else:
            esik = BAKICI_EVI_ESIKLERI.get(sonuc.get("hayvan_tipi"), "N/A")
            mesaj += f"YAPILAMAZ (Minimum {esik} baş hayvan kapasitesi gerekirken {sonuc.get('hayvan_kapasitesi',0)} baş var).<br>"

        # Özet tablo
        mesaj += "<br><table style='width:100%; border-collapse: collapse;'>"
        mesaj += "<tr><td colspan='2' style='border:1px solid #ddd; padding:8px; background-color:#f2f2f2;'><b>ÖZET BİLGİLER</b></td></tr>"
        mesaj += f"<tr><td style='border:1px solid #ddd; padding:8px;'><b>Toplam Kullanılan Emsal Alanı:</b></td><td style='border:1px solid #ddd; padding:8px;'>{toplam_kullanilan_emsal:,.2f} m²</td></tr>"
        mesaj += f"<tr><td style='border:1px solid #ddd; padding:8px;'><b>Kalan Emsal Alanı:</b></td><td style='border:1px solid #ddd; padding:8px;'>{sonuc.get('kalan_emsal_m2', 0):,.2f} m²</td></tr>"
        mesaj += "</table>"

        # Sonuç mesajı
        mesaj += f"<br><b style='color:green;'>SONUÇ: {sonuc.get('sonuc_mesaji','')}</b><br>"
        if sonuc.get("aciklama") and "Detaylı değerlendirme" not in sonuc.get("aciklama"):
             mesaj += f"<b>Açıklama:</b> {sonuc.get('aciklama')}<br>"

    # Çok büyük tesisler için özel uyarı ve açıklama (eşik değeri 5000'den 3000'e düşürüldü)
    if sonuc.get("hayvan_kapasitesi", 0) > 3000 and not "TESİS YAPILAMAZ" in sonuc.get("sonuc_mesaji", ""):
        mesaj += "<br><div style='background-color:#fff3cd; padding:10px; border:1px solid #ffeeba; border-radius:4px;'>"
        mesaj += "<b style='color:#856404;'>ÖNEMLİ UYARI:</b> "
        mesaj += "Hesaplanan kapasite (3.000+ hayvan) çok büyük ölçekli bir tesis anlamına gelir. "
        mesaj += "Bu boyutta işletmeler genellikle daha küçük modüler birimlere bölünür veya "
        mesaj += "birden fazla tesis olarak projelendirilir. Projelendirme aşamasında bu hususa dikkat edilmelidir. "
        
        # 20,000+ hayvan kapasitesi için özel ekleme
        if sonuc.get("hayvan_kapasitesi", 0) > 20000:
            mesaj += "<br><br><b style='color:#721c24;'>ÖZEL NOT:</b> "
            mesaj += "20.000+ hayvan kapasiteli tesisler için kritik altyapı müştemilatlarında "
            mesaj += "(jeneratör odası, su deposu, revir vb.) sabit maksimum boyutlar uygulanmıştır. "
            mesaj += "Gerçek projelendirmede, bu büyüklükteki bir tesisin birden fazla küçük tesise "
            mesaj += "bölünmesi veya modüler yapıda tasarlanması daha uygundur."
        
        mesaj += "</div><br>"
    
    # Müştemilat alanları hakkında ek not
    if not "TESİS YAPILAMAZ" in sonuc.get("sonuc_mesaji", ""):
        mesaj += "<br><small><i>Not: Müştemilat alanları, hayvan kapasitesine göre logaritmik olarak ölçeklenmektedir. "
        mesaj += "Özellikle büyük kapasiteli tesisler için jeneratör odası, su deposu gibi belirli müştemilatlar için "
        mesaj += "gerçekçi maksimum alanlar uygulanmıştır. Bu alanlar, temel ihtiyaçları karşılayacak şekilde "
        mesaj += "tasarlanmıştır.</i></small><br>"
    
    # Not bölümü
    mesaj += "<hr>"
    mesaj += "<b>NOT:</b> Tüm hesaplamalar güncel mevzuat ve yönetmeliklere göre yapılmıştır. "
    mesaj += "Süt sığırları için belirtilen açık gezinti alanı emsale dahil değildir, ancak parsel içerisinde karşılanmalıdır. "
    mesaj += "Bu değerlendirme ön bilgilendirme amaçlıdır ve resmi bir belge niteliği taşımaz."
    
    return mesaj

def sut_sigiri_degerlendir(arazi_bilgileri: dict, yapi_bilgileri: dict, emsal_orani: float = None) -> dict:
    """Süt sığırcılığı tesisi için değerlendirme yapar"""
    # Arazi büyüklüğü kontrolü ve negatif değer koruması
    try:
        arazi_buyuklugu_m2 = float(arazi_bilgileri.get("buyukluk_m2", 0))
        if arazi_buyuklugu_m2 <= 0:
            return {
                "izin_durumu": "izin_verilemez",
                "mesaj": "<b>Geçersiz Arazi Büyüklüğü</b><br><br>"
                         "Belirtilen arazi büyüklüğü geçerli bir değer değil. Pozitif bir sayı girmelisiniz.",
                "kapasite": 0, "bakici_evi_hakki": False,
            }
    except (ValueError, TypeError):
        return {
            "izin_durumu": "izin_verilemez",
            "mesaj": "<b>Geçersiz Arazi Büyüklüğü</b><br><br>"
                     "Belirtilen arazi büyüklüğü sayısal bir değer değil. Geçerli bir sayı girmelisiniz.",
                "kapasite": 0, "bakici_evi_hakki": False,
        }

    su_tahsis_belgesi_var_mi = str(arazi_bilgileri.get("su_tahsis_belgesi","false")).lower() == "true"
    yas_kapali_alanda_mi = arazi_bilgileri.get("yas_kapali_alan_durumu") == "içinde"

    if yas_kapali_alanda_mi and not su_tahsis_belgesi_var_mi:
        yas_uyari_mesaji = (
            "<b>Yeraltı Suyu Koruma Alanında Su Tahsis Belgesi Zorunluluğu</b><br><br>"
            "Seçilen arazi YAS (Yeraltı Suları Koruma Alanı) kapalı alan sınırları içerisinde yer almaktadır. "
            "Bu tür arazilerde büyükbaş hayvancılık tesisi yapımı için <b>su tahsis belgesi zorunludur.</b> "
            "Mevcut durumda su tahsis belgeniz bulunmadığından bu alanda büyükbaş hayvancılık tesisi yapımına izin verilememektedir."
        )
        return {
            "izin_durumu": "izin_verilemez",
            "mesaj": yas_uyari_mesaji,
            "ana_mesaj": yas_uyari_mesaji,
            "kapasite": 0,
            "bakici_evi_hakki": False,
            "hayvan_tipi": "süt_sığırı",
            "hesaplama_detaylari": {"sonuc_mesaji": "TESİS YAPILAMAZ", "aciklama": "YAS alanı içinde su tahsis belgesi yok."}
        }

    hesaplayici = BuyukbasHesaplama(emsal_orani)
    hesap_sonucu = hesaplayici.hesapla(arazi_buyuklugu_m2, "süt_sığırı")
    
    html_mesaj = _olustur_html_mesaj_buyukbas(hesap_sonucu, "SÜT SIĞIRCILIĞI", emsal_orani)
    
    return {
        "izin_durumu": "izin_verilebilir" if "TESİS YAPILAMAZ" not in hesap_sonucu["sonuc_mesaji"] else "izin_verilemez",
        "mesaj": html_mesaj,
        "ana_mesaj": html_mesaj,  # decision_logic.py'de kullanım için eklendi
        "kapasite": hesap_sonucu.get("hayvan_kapasitesi", 0),
        "bakici_evi_hakki": hesap_sonucu.get("bakici_evi_hakki", False),
        "hayvan_tipi": "süt_sığırı",
        "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
        "emsal_m2": hesap_sonucu.get("emsal_m2", 0),
        "ahir_alani_m2": hesap_sonucu.get("ahir_alani_m2", 0),
        "mustemilat_alani_m2": hesap_sonucu.get("mustemilat_alani_m2", 0),
        "hesaplama_detaylari": hesap_sonucu
    }

def besi_sigiri_degerlendir(arazi_bilgileri: dict, yapi_bilgileri: dict, emsal_orani: float = None) -> dict:
    """Besi sığırcılığı tesisi için değerlendirme yapar"""
    # Arazi büyüklüğü kontrolü ve negatif değer koruması
    try:
        arazi_buyuklugu_m2 = float(arazi_bilgileri.get("buyukluk_m2", 0))
        if arazi_buyuklugu_m2 <= 0:
            return {
                "izin_durumu": "izin_verilemez",
                "mesaj": "<b>Geçersiz Arazi Büyüklüğü</b><br><br>"
                         "Belirtilen arazi büyüklüğü geçerli bir değer değil. Pozitif bir sayı girmelisiniz.",
                "kapasite": 0,
                "bakici_evi_hakki": False,
            }
    except (ValueError, TypeError):
        return {
            "izin_durumu": "izin_verilemez",
            "mesaj": "<b>Geçersiz Arazi Büyüklüğü</b><br><br>"
                     "Belirtilen arazi büyüklüğü sayısal bir değer değil. Geçerli bir sayı girmelisiniz.",
            "kapasite": 0,
            "bakici_evi_hakki": False,
        }

    # Su tahsis ve YAS kontrolü
    su_tahsis_belgesi_var_mi = str(arazi_bilgileri.get("su_tahsis_belgesi","false")).lower() == "true"
    yas_kapali_alanda_mi = arazi_bilgileri.get("yas_kapali_alan_durumu") == "içinde"

    if yas_kapali_alanda_mi and not su_tahsis_belgesi_var_mi:
        yas_uyari_mesaji = (
            "<b>Yeraltı Suyu Koruma Alanında Su Tahsis Belgesi Zorunluluğu</b><br><br>"
            "Seçilen arazi YAS (Yeraltı Suları Koruma Alanı) kapalı alan sınırları içerisinde yer almaktadır. "
            "Bu tür arazilerde büyükbaş hayvancılık tesisi yapımı için <b>su tahsis belgesi zorunludur.</b> "
            "Mevcut durumda su tahsis belgeniz bulunmadığından bu alanda büyükbaş hayvancılık tesisi yapımına izin verilememektedir."
        )
        return {
            "izin_durumu": "izin_verilemez",
            "mesaj": yas_uyari_mesaji,
            "ana_mesaj": yas_uyari_mesaji,
            "kapasite": 0,
            "bakici_evi_hakki": False,
            "hayvan_tipi": "besi_sığırı",
            "hesaplama_detaylari": {"sonuc_mesaji": "TESİS YAPILAMAZ", "aciklama": "YAS alanı içinde su tahsis belgesi yok."}
        }

    # Hesaplamayı yap
    hesaplayici = BuyukbasHesaplama(emsal_orani)
    hesap_sonucu = hesaplayici.hesapla(arazi_buyuklugu_m2, "besi_sığırı")
    html_mesaj = _olustur_html_mesaj_buyukbas(hesap_sonucu, "BESİ SIĞIRCILIĞI", emsal_orani)

    return {
        "izin_durumu": "izin_verilebilir" if "TESİS YAPILAMAZ" not in hesap_sonucu["sonuc_mesaji"] else "izin_verilemez",
        "mesaj": html_mesaj,
        "ana_mesaj": html_mesaj,
        "kapasite": hesap_sonucu.get("hayvan_kapasitesi", 0),
        "bakici_evi_hakki": hesap_sonucu.get("bakici_evi_hakki", False),
        "hayvan_tipi": "besi_sığırı",
        "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
        "emsal_m2": hesap_sonucu.get("emsal_m2", 0),
        "ahir_alani_m2": hesap_sonucu.get("ahir_alani_m2", 0),
        "mustemilat_alani_m2": hesap_sonucu.get("mustemilat_alani_m2", 0),
        "hesaplama_detaylari": hesap_sonucu
    }
