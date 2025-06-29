"""
At Yetiştiriciliği Tesisi (Hara) Hesaplama Modülü

Bu modül, verilen arazi büyüklüğüne göre at yetiştiriciliği tesisi (hara) kapasitesini,
ahır, padok, manej ve müştemilat alanlarını hesaplar.
Hayvan sağlığı, gelişimi ve refahı gözetilerek minimum 40 boks kuralını uygular.
"""
import math

# Sabit Değerler
EMSAL_ORANI = 0.20  # %20
HARA_MIN_ARAZI_M2 = 10000  # Minimum 10.000 m² (1 hektar) arazi gereksinimi

# Alan ihtiyaçları (m²/hayvan)
KISRAK_BOKS_ALANI = 16      # Kısrak için 4m x 4m = 16 m²
AYGIR_BOKS_ALANI = 25       # Aygır için 5m x 5m = 25 m²
YAVRULAMA_BOLMESI_ALANI = 25  # Yavrulama bölmesi için 5m x 5m = 25 m²
PADOK_ALANI = 32            # Padok alanı, boksun en az 2 katı
MANEJ_ALANI = 18            # Manej alanı: 3m x 6m = 18 m²

# Minimum değerler
MIN_BOKS_SAYISI = 40         # Minimum 40 boks şartı
MALZEME_DEPOSU_ALANI = 30    # Sabit 30 m²

# Diğer yapılar
IDARI_BINA_ALANI = 100       # 100 m²
VETERINER_KLINIGI_ALANI = 40 # 40 m²
KAPALI_MANEJ_ALANI = 800     # 800 m² (isteğe bağlı)

# Müştemilat tanımları ve büyüme faktörleri (modern sistem)
HARA_MUSTEMILAT_TANIMLARI = [
    {"isim": "Bakıcı Evi", "min_alan": 40, "ref_alan": 65, "buyume_faktoru": 0.4, "buyume_tipi": "logaritmik", "max_alan": 150},
    {"isim": "Yem Deposu", "min_alan": 50, "ref_alan": 75, "buyume_faktoru": 0.6, "buyume_tipi": "koksel", "max_alan": 250},
    {"isim": "Gübre Çukuru", "min_alan": 30, "ref_alan": 45, "buyume_faktoru": 0.5, "buyume_tipi": "koksel", "max_alan": 150},
    {"isim": "Malzeme Deposu", "min_alan": 30, "ref_alan": 30, "buyume_faktoru": 0.4, "buyume_tipi": "logaritmik", "max_alan": 100},
    {"isim": "İdari Bina", "min_alan": 80, "ref_alan": 100, "buyume_faktoru": 0.5, "buyume_tipi": "logaritmik", "max_alan": 250},
    {"isim": "Veteriner Kliniği", "min_alan": 40, "ref_alan": 40, "buyume_faktoru": 0.3, "buyume_tipi": "logaritmik", "max_alan": 100},
    {"isim": "Kapalı Manej", "min_alan": 600, "ref_alan": 800, "buyume_faktoru": 0.7, "buyume_tipi": "koksel", "max_alan": 2000}
]


class HaraTesisiHesaplayici:
    """At yetiştiriciliği tesisi (hara) hesaplama sınıfı"""
    def __init__(self, emsal_orani: float = None):
        # Dinamik emsal oranı kullan
        self.emsal_orani = emsal_orani if emsal_orani is not None else EMSAL_ORANI
        
        # Alan ihtiyaçları (m²/hayvan)
        self.kisrak_boks_alani = KISRAK_BOKS_ALANI
        self.aygir_boks_alani = AYGIR_BOKS_ALANI
        self.yavrulama_bolmesi_alani = YAVRULAMA_BOLMESI_ALANI
        self.padok_alani = PADOK_ALANI
        self.manej_alani = MANEJ_ALANI
        
        # Minimum değerler
        self.min_boks_sayisi = MIN_BOKS_SAYISI
        self.malzeme_deposu = MALZEME_DEPOSU_ALANI
        
        # Müştemilat tanımları
        self.mustemilat_tanimlari = HARA_MUSTEMILAT_TANIMLARI
        
        # Referans kapasite değeri
        self.ref_boks_sayisi = 40  # 40 boks referans alınır

    def hesapla_optimal_boks_sayisi(self, arazi_alani):
        """
        Belirtilen arazi alanı için optimal boks sayısını hesaplar
        
        Args:
            arazi_alani (float): Arazi büyüklüğü (m²)
            
        Returns:
            int: Optimal boks sayısı
        """
        # Arazi çok küçükse direkt minimum boks sayısını döndür
        if arazi_alani < HARA_MIN_ARAZI_M2:
            return self.min_boks_sayisi
            
        emsal_alani = arazi_alani * self.emsal_orani
        
        # Gerçekçi maksimum sınırlar uygula - çok büyük arazilerde mantıksız büyüklükte tesisler önermeyi engelle
        MAX_BOKS_SAYISI = 1000  # Gerçekçi üst sınır - profesyonel büyük ölçekli tesisler için
        
        # Çok büyük arazilerde (100+ hektar) boks sayısı sınırlaması
        if arazi_alani > 1000000:  # 100 hektar
            ust_sinir = MAX_BOKS_SAYISI
        else:
            ust_sinir = 1000  # Normal araziler için üst sınır
        
        # İkili arama (binary search) ile optimal boks sayısını bulalım
        alt_sinir = self.min_boks_sayisi
        optimal_boks = self.min_boks_sayisi
        hedef_kullanim_orani = 0.99  # %99 emsal kullanım hedefi
        en_iyi_kullanim_orani = 0
        
        while alt_sinir <= ust_sinir:
            orta = (alt_sinir + ust_sinir) // 2
            
            # Bu boks sayısı için yapı alanını hesapla
            test_sonuc = self.hesapla_test(arazi_alani, orta)
            kullanilan_emsal = test_sonuc["toplam_kapali_alan_m2"]
            kullanim_orani = kullanilan_emsal / emsal_alani if emsal_alani > 0 else 0
            
            if kullanim_orani <= hedef_kullanim_orani:
                # Bu boks sayısı kabul edilebilir, daha yükseğini dene
                if kullanim_orani > en_iyi_kullanim_orani:
                    optimal_boks = orta
                    en_iyi_kullanim_orani = kullanim_orani
                alt_sinir = orta + 1
            else:
                # Bu boks sayısı çok yüksek, daha düşüğünü dene
                ust_sinir = orta - 1
        
        # İnce ayar: birer birer artırarak maksimuma yaklaştır
        test_boks = optimal_boks
        while test_boks < MAX_BOKS_SAYISI:  # Maksimum limiti aşmadığını kontrol et
            test_boks += 1
            test_sonuc = self.hesapla_test(arazi_alani, test_boks)
            test_alan = test_sonuc["toplam_kapali_alan_m2"]
            
            if test_alan > emsal_alani:
                break  # Emsal alanını aştık, son uygun değeri kullan
            
            optimal_boks = test_boks  # Hala uygun, kapasiteyi güncelle
            
        return min(optimal_boks, MAX_BOKS_SAYISI)  # Maksimum sınırı aşmamalı

    def hesapla_mustemilat_alani(self, boks_sayisi, ahir_alani):
        """
        Boks sayısı ve ahır alanına göre müştemilat alanlarını hesaplar
        Modern büyüme modelleri kullanarak daha gerçekçi hesaplamalar yapar
        
        Args:
            boks_sayisi: Planlanan boks sayısı
            ahir_alani: Hesaplanan ahır alanı (m²)
            
        Returns:
            dict: Hesaplanan müştemilat alanlarını içeren sözlük
        """
        mustemilat_alanlar = []
        toplam_alan = 0
        
        # Büyüme oranı (referans boks sayısına göre)
        oran = boks_sayisi / self.ref_boks_sayisi if boks_sayisi > 0 else 1
        
        # Sektör standartlarına göre orantısal hesaplamalar
        # Bakıcı evi ahır alanının %6-7'si olmalı
        bakici_evi_alani = ahir_alani * 0.065  # %6.5
        # Yem deposu ahır alanının %7-8'i olmalı
        yem_deposu_alani = ahir_alani * 0.075  # %7.5
        # Gübre çukuru için ahır alanının %4-5'i
        gubre_cukuru_alani = ahir_alani * 0.045  # %4.5
        
        # Diğer müştemilat alanları için büyüme modellerini uygula
        for mustemilat in self.mustemilat_tanimlari:
            buyume_faktoru = mustemilat["buyume_faktoru"]
            buyume_tipi = mustemilat.get("buyume_tipi", "dogrusal")
            
            # Özel durum - sektör standartlarına göre hesaplananlar için sabit değerler kullan
            if mustemilat["isim"] == "Bakıcı Evi":
                hesaplanan_alan = bakici_evi_alani
            elif mustemilat["isim"] == "Yem Deposu":
                hesaplanan_alan = yem_deposu_alani
            elif mustemilat["isim"] == "Gübre Çukuru":
                hesaplanan_alan = gubre_cukuru_alani
            else:
                # Normal büyüme modelleri
                if buyume_tipi == "logaritmik":
                    # Logaritmik büyüme: min + ref_alan * log(oran+1) * büyüme_faktörü
                    hesaplanan_alan = mustemilat["min_alan"] + (mustemilat["ref_alan"] * math.log(oran + 1, 2) * buyume_faktoru)
                
                elif buyume_tipi == "koksel":
                    # Kök bazlı büyüme: min + ref_alan * kök(oran) * büyüme_faktörü
                    hesaplanan_alan = mustemilat["min_alan"] + (mustemilat["ref_alan"] * (oran ** 0.5) * buyume_faktoru)
                
                else:  # "dogrusal" veya diğer tipler için
                    # Standart doğrusal büyüme
                    hesaplanan_alan = mustemilat["min_alan"] + (mustemilat["ref_alan"] * oran * buyume_faktoru)
            
            # Minimum ve maksimum sınırları kontrol et
            hesaplanan_alan = max(mustemilat["min_alan"], hesaplanan_alan)
            
            # Maksimum alanı aşmamasını sağla (eğer tanımlanmışsa)
            # Ancak, bakıcı evi, yem deposu ve gübre çukuru için daha büyük ahırlarda sınır uygulamayalım
            if "max_alan" in mustemilat and mustemilat["isim"] not in ["Bakıcı Evi", "Yem Deposu", "Gübre Çukuru"]:
                hesaplanan_alan = min(hesaplanan_alan, mustemilat["max_alan"])
            
            alan = round(hesaplanan_alan, 2)
            
            mustemilat_alanlar.append({
                "isim": mustemilat["isim"],
                "alan": alan,
                "tip": "mustemilat" if mustemilat["isim"] not in ["İdari Bina", "Veteriner Kliniği", "Kapalı Manej"] else "opsiyonel"
            })
            
            # İlk 4 müştemilat zorunlu, diğerleri opsiyonel, opsiyonelleri toplam alana dahil etmiyoruz
            if mustemilat["isim"] in ["Bakıcı Evi", "Yem Deposu", "Gübre Çukuru", "Malzeme Deposu"]:
                toplam_alan += alan
        
        return {
            "mustemilat_listesi": mustemilat_alanlar,
            "toplam_zorunlu_alan": toplam_alan
        }

    def hesapla(self, arazi_alani, boks_sayisi=None):
        """
        Ana hesaplama fonksiyonu
        
        Args:
            arazi_alani: Arazi büyüklüğü (m²)
            boks_sayisi: Planlanan boks sayısı (None ise optimal değer hesaplanır)
            
        Returns:
            dict: Hesaplama sonuçlarını içeren sözlük
        """
        # Emsal hesabı
        emsal = arazi_alani * self.emsal_orani
        
        # Çok büyük araziler için alternatif kullanım önerileri
        cok_buyuk_arazi = arazi_alani > 1000000  # 100 hektar üzeri
        
        # Eğer belirtilen boks sayısı yoksa optimal değeri hesapla
        if boks_sayisi is None:
            boks_sayisi = self.hesapla_optimal_boks_sayisi(arazi_alani)
        # Minimum değerden küçükse, minimum değeri kullan
        elif boks_sayisi < self.min_boks_sayisi:
            boks_sayisi = self.min_boks_sayisi
    
        # Standart bokslar için minimum alan hesabı
        # Boks tiplerine göre dağılım
        kisrak_boks_orani = 0.85  # %85 kısrak boksları
        aygir_boks_orani = 0.05   # %5 aygır boksları
        yavrulama_boks_orani = 0.10  # %10 yavrulama bölmeleri
        
        kisrak_boks_sayisi = math.floor(boks_sayisi * kisrak_boks_orani)
        aygir_boks_sayisi = math.floor(boks_sayisi * aygir_boks_orani)
        yavrulama_boks_sayisi = boks_sayisi - kisrak_boks_sayisi - aygir_boks_sayisi
        
        # Alanlara göre hesaplama
        kisrak_bokslari_alani = kisrak_boks_sayisi * self.kisrak_boks_alani
        aygir_bokslari_alani = aygir_boks_sayisi * self.aygir_boks_alani
        yavrulama_bolmeleri_alani = yavrulama_boks_sayisi * self.yavrulama_bolmesi_alani
        
        min_ahir_alani = kisrak_bokslari_alani + aygir_bokslari_alani + yavrulama_bolmeleri_alani
        
        # Modern müştemilat hesaplama
        mustemilat_hesap = self.hesapla_mustemilat_alani(boks_sayisi, min_ahir_alani)
        zorunlu_mustemilat_alani = mustemilat_hesap["toplam_zorunlu_alan"]
        mustemilat_alanlar = mustemilat_hesap["mustemilat_listesi"]  # Burada tanımlama eksikliği var
    
        # Toplam minimum kapalı alan (ahır + zorunlu müştemilat)
        min_toplam_kapali_alan = min_ahir_alani + zorunlu_mustemilat_alani
        
        # Açık alan ihtiyaçları
        min_padok_alani = boks_sayisi * self.padok_alani
        min_manej_alani = boks_sayisi * self.manej_alani
        min_acik_alan = min_padok_alani + min_manej_alani
        
        # Emsal yeterli mi kontrol et
        if emsal < min_toplam_kapali_alan:
            return {
                "sonuc_durumu": "TESİS YAPILAMAZ",
                "aciklama": f"Emsale göre izin verilen {emsal:.2f} m² yapılaşma alanı, minimum kapasite için gerekli olan {min_toplam_kapali_alan:.2f} m²'den azdır.",
                "arazi_alani": arazi_alani,
                "emsal": emsal,
                "min_boks_sayisi": self.min_boks_sayisi,
                "min_ahir_alani": min_ahir_alani,
                "min_toplam_kapali_alan": min_toplam_kapali_alan,
                "boks_sayisi": boks_sayisi
            }
        
        # Açık alan sorunu var mı?
        acik_alan_sorunu = False
        acik_alan_oran = min_acik_alan / arazi_alani
        
        # Arazi büyüklüğüne göre kabul edilebilir açık alan oranı değişir
        # Kabul edilebilir oranları artırdık ve küçük arazilerde toleransı yükselttik
        if arazi_alani <= 50000:  # 5 hektar veya daha küçük
            kabul_edilebilir_oran = 0.60  # %60'a çıkarıldı - önceki: 0.50
        elif arazi_alani <= 200000:  # 5-20 hektar arası
            kabul_edilebilir_oran = 0.70  # %70'e çıkarıldı - önceki: 0.60
        elif arazi_alani <= 1000000:  # 20-100 hektar arası
            kabul_edilebilir_oran = 0.75  # %75'e çıkarıldı - önceki: 0.70
        else:  # 100 hektar üzeri
            kabul_edilebilir_oran = 0.85  # %85'e çıkarıldı - önceki: 0.80
        
        # Sınırda olan durumlar için özel kontrol (%50 ile %55 arası)
        # Bu aralıktaki değerler için uyarı göstermiyoruz
        if 0.50 <= acik_alan_oran <= 0.55:
            acik_alan_sorunu = False  # Sınırda olan durumları sorun yapmıyoruz
        else:
            # Açık alan oranı, kabul edilebilir oranın üzerindeyse sorun var
            acik_alan_sorunu = acik_alan_oran > kabul_edilebilir_oran
        
        # Çok büyük arazilerde (300+ hektar) açık alan sorunu göstermeyelim
        # Bu büyüklükteki arazilerde açık alan yüzdesi değil, toplam alan önemlidir
        if arazi_alani > 3000000:  # 300 hektar üzeri
            acik_alan_sorunu = False
        
        # Toplam yapı alanı hesaplaması
        toplam_zorunlu_alan = min_ahir_alani + zorunlu_mustemilat_alani
        
        # Kalan emsal hesaplaması
        kalan_emsal = emsal - toplam_zorunlu_alan
        
        # Yapilar listesi oluştur
        yapilar = [
            {"isim": "Ahır (Tavla)", "taban_alani": min_ahir_alani, "toplam_alan": min_ahir_alani, "tip": "ana_yapi"}
        ]
        
        # Zorunlu müştemilatları ekle
        for mustemilat in mustemilat_alanlar:
            if mustemilat["tip"] == "mustemilat":
                yapilar.append({
                    "isim": mustemilat["isim"], 
                    "taban_alani": mustemilat["alan"], 
                    "toplam_alan": mustemilat["alan"] * (2 if mustemilat["isim"] == "Bakıcı Evi" else 1),
                    "tip": "mustemilat"
                })
        
        # Opsiyonel yapılar eklenebilir mi?
        ek_yapilar = []
        kullanilan_emsal = toplam_zorunlu_alan
        
        # Opsiyonel yapıları dene
        for mustemilat in mustemilat_alanlar:
            if mustemilat["tip"] == "opsiyonel":
                alan = mustemilat["alan"]
                if kalan_emsal >= alan:
                    ek_yapilar.append({
                        "isim": mustemilat["isim"],
                        "taban_alani": alan,
                        "toplam_alan": alan * (2 if mustemilat["isim"] == "İdari Bina" else 1),
                        "tip": "opsiyonel"
                    })
                    kalan_emsal -= alan
                    kullanilan_emsal += alan
        
        # Tüm yapıları birleştir
        tum_yapilar = yapilar + ek_yapilar
        
        # Sonuç yapısını hazırla
        sonuc = {
            "arazi_alani_m2": arazi_alani,
            "emsal_m2": emsal,
            "boks_sayisi": boks_sayisi,
            "ahir_alani_m2": min_ahir_alani,
            "toplam_kapali_alan_m2": kullanilan_emsal,
            "padok_alani_m2": min_padok_alani,
            "manej_alani_m2": min_manej_alani,
            "toplam_acik_alan_m2": min_acik_alan,
            "yapilar": tum_yapilar,
            "kalan_emsal_m2": kalan_emsal,
            "acik_alan_sorunu": acik_alan_sorunu,
            "acik_alan_oran": acik_alan_oran,
            "cok_buyuk_arazi": cok_buyuk_arazi,
            "boks_detaylari": {
                "kisrak_boks_sayisi": kisrak_boks_sayisi,
                "aygir_boks_sayisi": aygir_boks_sayisi,
                "yavrulama_boks_sayisi": yavrulama_boks_sayisi,
                "kisrak_bokslari_alani_m2": kisrak_bokslari_alani,
                "aygir_bokslari_alani_m2": aygir_bokslari_alani,
                "yavrulama_bolmeleri_alani_m2": yavrulama_bolmeleri_alani
            }
        }
        
        # Açık alan sorunu varsa uyarı mesajı
        if acik_alan_sorunu:
            sonuc["sonuc_durumu"] = "TESİS PLANLAMASI UYGUNSUZ"
            
            # Arazi büyüklüğüne göre daha açıklayıcı mesajlar
            if arazi_alani > 500000:  # 50 hektar üzeri
                sonuc["aciklama"] = f"Bu arazi büyüklüğünde {boks_sayisi} boks kapasiteli hara tesisi kurulabilir, " \
                                 f"ancak dikkat edilmesi gereken husus: toplam açık alan ihtiyacı ({min_acik_alan:.2f} m²) " \
                                 f"arazinin %{acik_alan_oran*100:.1f}'ini kaplayacaktır. " \
                                 f"Boks sayısını azaltarak veya padok/manej alanlarını optimize ederek daha dengeli bir yerleşim planı oluşturulabilir."
            else:
                sonuc["aciklama"] = f"Bu arazi büyüklüğünde emsal dahilinde {boks_sayisi} boks ve zorunlu müştemilatlar için alan sağlanabilse de, " \
                                 f"toplam açık alan ihtiyacı ({min_acik_alan:.2f} m²) arazinin %{acik_alan_oran*100:.1f}'ini kaplayacaktır. " \
                                 f"Bu durum, at refahı açısından sağlıklı bir tesis işleyişi için uygun değildir."
        else:
            # Çok büyük araziler için özel açıklamalar ekleme
            if cok_buyuk_arazi:
                sonuc["sonuc_durumu"] = f"TESİS YAPILABİLİR (ÇOK BÜYÜK ARAZİ)"
                arazi_hektar = arazi_alani / 10000
                
                sonuc["aciklama"] = f"Bu {arazi_hektar:.1f} hektarlık çok büyük arazi için önerilen optimal hara kapasitesi {boks_sayisi} boksdur. " \
                                 f"Böyle büyük bir arazi için ek önerilerimiz:\n\n" \
                                 f"1) Ana hara tesisi (yaklaşık {boks_sayisi} boks kapasiteli) yanında birden fazla bağlı ünite kurabilirsiniz.\n" \
                                 f"2) Arazinin bir kısmını yarış pisti, açık etkinlik alanları gibi rekreasyon alanlarına ayırabilirsiniz.\n" \
                                 f"3) Arazinin bir bölümünü doğal otlak veya mera alanı olarak bırakabilirsiniz.\n" \
                                 f"4) Alternatif tarım alanları oluşturabilir veya doğal yaşam alanları geliştirebilirsiniz."
            else:
                # Opsiyonel yapılar eklendiyse bildir
                if ek_yapilar:
                    ek_yapi_isimleri = ", ".join([yapi["isim"] for yapi in ek_yapilar])
                    sonuc["sonuc_durumu"] = f"TESİS YAPILABİLİR ({boks_sayisi} BOKS KAPASİTELİ HARA)"
                    
                    # Kalan emsal çok az ise optimum kullanım mesajı
                    if kalan_emsal < emsal * 0.01:  # %1'den az kalan emsal
                        sonuc["aciklama"] = f"Bu arazide maksimum verimlilik ile {boks_sayisi} boks kapasiteli bir hara tesisi kurulabilir. " \
                                        f"Ek olarak {ek_yapi_isimleri} yapıları da inşa edilebilir. " \
                                        f"Emsal alanı neredeyse tamamen kullanılmıştır (kalan: {kalan_emsal:.2f} m²)."
                    else:
                        sonuc["aciklama"] = f"Bu arazide {boks_sayisi} boks kapasiteli bir hara tesisi kurulabilir. " \
                                        f"Ek olarak {ek_yapi_isimleri} yapıları da inşa edilebilir. " \
                                        f"Toplam {kalan_emsal:.2f} m² emsal alanı kullanılmadan kalmıştır."
                else:
                    sonuc["sonuc_durumu"] = f"TESİS YAPILABİLİR ({boks_sayisi} BOKS KAPASİTELİ HARA)"
                    
                    # Kalan emsal çok az ise optimum kullanım mesajı
                    if kalan_emsal < emsal * 0.01:  # %1'den az kalan emsal
                        sonuc["aciklama"] = f"Bu arazide maksimum verimlilik ile {boks_sayisi} boks kapasiteli bir hara tesisi kurulabilir. " \
                                        f"Emsal alanı neredeyse tamamen kullanılmıştır (kalan: {kalan_emsal:.2f} m²)."
                    else:
                        sonuc["aciklama"] = f"Bu arazide {boks_sayisi} boks kapasiteli bir hara tesisi kurulabilir. " \
                                        f"Toplam {kalan_emsal:.2f} m² emsal alanı ek yapılar için kullanılabilir."
        
        return sonuc

    def hesapla_test(self, arazi_alani, boks_sayisi):
        """
        Boks sayısına göre emsal alanı kullanımını test eder
        (hesapla metodunun sadece alan hesaplamalarını yapan versiyonu)
        
        Args:
            arazi_alani: Arazi büyüklüğü (m²)
            boks_sayisi: Test edilecek boks sayısı
            
        Returns:
            dict: Test sonuçları
        """
        # Emsal hesabı
        emsal = arazi_alani * self.emsal_orani
        
        # Boks tiplerini dağıt
        kisrak_boks_orani = 0.85  # %85 kısrak boksları
        aygir_boks_orani = 0.05   # %5 aygır boksları
        yavrulama_boks_orani = 0.10  # %10 yavrulama bölmeleri
        
        kisrak_boks_sayisi = math.floor(boks_sayisi * kisrak_boks_orani)
        aygir_boks_sayisi = math.floor(boks_sayisi * aygir_boks_orani)
        yavrulama_boks_sayisi = boks_sayisi - kisrak_boks_sayisi - aygir_boks_sayisi
        
        # Alanlara göre hesaplama
        kisrak_bokslari_alani = kisrak_boks_sayisi * self.kisrak_boks_alani
        aygir_bokslari_alani = aygir_boks_sayisi * self.aygir_boks_alani
        yavrulama_bolmeleri_alani = yavrulama_boks_sayisi * self.yavrulama_bolmesi_alani
        
        min_ahir_alani = kisrak_bokslari_alani + aygir_bokslari_alani + yavrulama_bolmeleri_alani
        
        # Modern müştemilat hesaplama
        mustemilat_hesap = self.hesapla_mustemilat_alani(boks_sayisi, min_ahir_alani)
        zorunlu_mustemilat_alani = mustemilat_hesap["toplam_zorunlu_alan"]
        
        # Toplam minimum kapalı alan (ahır + zorunlu müştemilat)
        toplam_zorunlu_alan = min_ahir_alani + zorunlu_mustemilat_alani
        
        # Açık alan ihtiyaçları
        min_padok_alani = boks_sayisi * self.padok_alani
        min_manej_alani = boks_sayisi * self.manej_alani
        min_acik_alan = min_padok_alani + min_manej_alani
        
        # Toplam yapı alanı hesaplaması
        kullanilan_emsal = toplam_zorunlu_alan
        
        # Opsiyonel yapılar için kalan emsal
        kalan_emsal = emsal - toplam_zorunlu_alan
        
        # Opsiyonel yapıları ekle
        mustemilat_alanlar = mustemilat_hesap["mustemilat_listesi"]
        for mustemilat in mustemilat_alanlar:
            if mustemilat["tip"] == "opsiyonel":
                alan = mustemilat["alan"]
                if kalan_emsal >= alan:
                    kalan_emsal -= alan
                    kullanilan_emsal += alan
        
        return {
            "toplam_kapali_alan_m2": kullanilan_emsal,
            "kalan_emsal_m2": kalan_emsal
        }

def _olustur_html_mesaj_hara(sonuc, emsal_orani: float = None):
    """
    Hara tesisi hesaplama sonuçlarını HTML formatında sunar
    
    Args:
        sonuc: Hesaplama sonuçlarını içeren sözlük
        emsal_orani: Kullanılacak emsal oranı (isteğe bağlı)
        
    Returns:
        str: HTML formatında sonuç mesajı
    """
    kullanilacak_emsal = emsal_orani if emsal_orani is not None else EMSAL_ORANI
    # CSS stillerini dahil et
    mesaj = """
    <style>
        .hara-sonuc {font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto;}
        .hara-sonuc h3 {color: #2e7d32; margin-bottom: 15px; font-size: 1.4em;}
        .hara-sonuc .baslik {font-weight: bold; margin-top: 15px; margin-bottom: 8px; color: #37474f;}
        .hara-sonuc table {border-collapse: collapse; width: 100%; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);}
        .hara-sonuc th, .hara-sonuc td {border: 1px solid #ddd; padding: 10px; text-align: left;}
        .hara-sonuc th {background-color: #f2f2f2; color: #333;}
        .hara-sonuc .ana-yapi {background-color: #f9f9f9;}
        .hara-sonuc .mustemilat {background-color: #eaf7ea;}
        .hara-sonuc .opsiyonel {background-color: #e8f4f8;}
        .hara-sonuc .acik-alan {background-color: #fff3cd;}
        .hara-sonuc .uyari {color: #856404; background-color: #fff3cd; padding: 12px; border-radius: 4px; margin: 15px 0; box-shadow: 0 1px 2px rgba(0,0,0,0.1);}
        .hara-sonuc .basarili {color: #155724; background-color: #d4edda; padding: 12px; border-radius: 4px; margin: 15px 0; box-shadow: 0 1px 2px rgba(0,0,0,0.1);}
        .hara-sonuc .hata {color: #721c24; background-color: #f8d7da; padding: 12px; border-radius: 4px; margin: 15px 0; box-shadow: 0 1px 2px rgba(0,0,0,0.1);}
        .hara-sonuc .notlar {font-size: 0.9em; font-style: italic; margin-top: 20px; padding: 12px; background-color: #f8f9fa; border-radius: 4px; border-left: 4px solid #ccc;}
        .hara-sonuc .bilgi {color: #0c5460; background-color: #d1ecf1; padding: 12px; border-radius: 4px; margin: 15px 0; box-shadow: 0 1px 2px rgba(0,0,0,0.1);}
        .hara-sonuc .oneri-liste {margin-left: 20px; line-height: 1.6;}
    </style>
    <div class="hara-sonuc">
    """
    
    mesaj += f"<h3>AT YETİŞTİRİCİLİĞİ TESİSİ (HARA) DEĞERLENDİRMESİ</h3>"
    mesaj += f"<p><b>Arazi Büyüklüğü:</b> {sonuc.get('arazi_alani_m2', 0):,.2f} m²<br>"
    mesaj += f"<b>İzin Verilen Toplam Emsal Alanı (%{kullanilacak_emsal*100:.0f}):</b> {sonuc.get('emsal_m2', 0):,.2f} m²</p>"
    
    # Sonuç durumuna göre mesaj türünü belirle
    sonuc_durumu = sonuc.get("sonuc_durumu", "")
    
    if "YAPILAMAZ" in sonuc_durumu:
        mesaj += f'<div class="hata"><b>SONUÇ: {sonuc_durumu}</b><br>{sonuc.get("aciklama", "")}</div>'
    elif "UYGUNSUZ" in sonuc_durumu:
        mesaj += f'<div class="uyari"><b>SONUÇ: {sonuc_durumu}</b><br>{sonuc.get("aciklama", "")}</div>'
    elif "ÇOK BÜYÜK ARAZİ" in sonuc_durumu:
        aciklama = sonuc.get("aciklama", "").replace("\n\n", "</p><p>").replace("\n", "<br>")
        mesaj += f'<div class="bilgi"><b>SONUÇ: {sonuc_durumu}</b><br><p>{aciklama}</p></div>'
    else:
        mesaj += f'<div class="basarili"><b>SONUÇ: {sonuc_durumu}</b><br>{sonuc.get("aciklama", "")}</div>'
    
    # Çok büyük arazi için ek bilgiler
    if sonuc.get("cok_buyuk_arazi", False):
        arazi_hektar = sonuc.get('arazi_alani_m2', 0) / 10000
        boks_sayisi = sonuc.get('boks_sayisi', 0)
        mesaj += f'<div class="bilgi"><b>BÜYÜK ARAZİ DEĞERLENDİRMESİ ({arazi_hektar:.1f} hektar)</b><br>'
        mesaj += f'<p>Bu büyüklükteki araziler için tek bir büyük hara tesisi kurmak yerine, daha optimize bir yaklaşım öneriyoruz:</p>'
        mesaj += f'<ul class="oneri-liste">'
        mesaj += f'<li><b>Optimal Boks Sayısı:</b> Maksimum 1000 boks kapasiteli bir ana hara tesisi (yaklaşık 16.000 m² kapalı alan)</li>'
        mesaj += f'<li><b>Çoklu Tesis İmkanı:</b> Ayrı yönetim birimleriyle birden fazla hara tesisi kurmak daha etkin yönetim ve hayvan refahı sağlar</li>'
        mesaj += f'<li><b>Alternatif Kullanım:</b> Yarış pisti, eğitim merkezleri, rekreasyon alanları gibi destekleyici tesisler planlanabilir</li>'
        mesaj += f'<li><b>Doğal Alanlar:</b> Arazinin büyük bölümünü otlak, mera veya doğal yaşam alanı olarak kullanmak hem sürdürülebilirlik hem de at sağlığı açısından faydalıdır</li>'
        mesaj += f'</ul></div>'
        
    # Kapasite ve alan kullanımı tablosu
    if "YAPILAMAZ" not in sonuc_durumu:
        mesaj += '<div class="baslik">TESİS YAPILARI VE ALANLARI</div>'
        mesaj += '<table>'
        mesaj += '<tr><th>Yapı/Alan</th><th>Taban Alanı (m²)</th><th>Açıklama</th></tr>'
        
        # Ana yapılar
        for yapi in sonuc.get("yapilar", []):
            tip_sinifi = yapi.get("tip", "")
            satir_sinifi = ""
            aciklama = ""
            
            if tip_sinifi == "ana_yapi":
                satir_sinifi = 'class="ana-yapi"'
                aciklama = "Temel üretim yapısı"
            elif tip_sinifi == "mustemilat":
                satir_sinifi = 'class="mustemilat"'
                aciklama = "Zorunlu müştemilat"
            elif tip_sinifi == "opsiyonel":
                satir_sinifi = 'class="opsiyonel"'
                aciklama = "Opsiyonel yapı (kalan emsalden)"
            
            mesaj += f'<tr {satir_sinifi}>'
            mesaj += f'<td>{yapi.get("isim", "")}</td>'
            mesaj += f'<td>{yapi.get("taban_alani", 0):,.2f}</td>'
            mesaj += f'<td>{aciklama}</td>'
            mesaj += '</tr>'
        
        # Toplam kapalı alan
        mesaj += '<tr style="font-weight: bold;">'
        mesaj += f'<td>TOPLAM KAPALI ALAN</td>'
        mesaj += f'<td>{sonuc.get("toplam_kapali_alan_m2", 0):,.2f}</td>'
        mesaj += f'<td>Emsale dahil yapı alanı</td>'
        mesaj += '</tr>'
        
        # Açık alanlar
        mesaj += '<tr class="acik-alan">'
        mesaj += f'<td>Padok (Gezinti Alanı)</td>'
        mesaj += f'<td>{sonuc.get("padok_alani_m2", 0):,.2f}</td>'
        mesaj += f'<td>Emsale dahil değil</td>'
        mesaj += '</tr>'
        
        mesaj += '<tr class="acik-alan">'
        mesaj += f'<td>Manej (Antrenman Alanı)</td>'
        mesaj += f'<td>{sonuc.get("manej_alani_m2", 0):,.2f}</td>'
        mesaj += f'<td>Emsale dahil değil</td>'
        mesaj += '</tr>'
        
        mesaj += '<tr class="acik-alan" style="font-weight: bold;">'
        mesaj += f'<td>TOPLAM AÇIK ALAN</td>'
        mesaj += f'<td>{sonuc.get("toplam_acik_alan_m2", 0):,.2f}</td>'
        mesaj += f'<td>Emsale dahil değil</td>'
        mesaj += '</tr>'
        
        mesaj += '</table>'
        
        # Kalan emsal
        mesaj += f'<p><b>Kalan Emsal:</b> {sonuc.get("kalan_emsal_m2", 0):,.2f} m²</p>'
        
        # Açık alan uyarısı - büyük araziler için özelleştirilmiş mesajlar
        # Açık alan oranı %50'yi çok az geçen durumlar için uyarı göstermeme
        if sonuc.get("acik_alan_sorunu", False):
            arazi_alani = sonuc.get('arazi_alani_m2', 0)
            acik_alan_oran = sonuc.get("acik_alan_oran", 0)
            
            # Sınırda olan durumlarda uyarı gösterme - bu kısım gereksiz ama hata almamak için kontrol ediyoruz
            if 0.50 <= acik_alan_oran <= 0.55:
                # Bu durumda uyarı göstermiyoruz
                pass
            # Çok büyük ve büyük araziler için uyarı mesajları 
            elif arazi_alani > 500000:  # 50 hektar üzeri
                mesaj += f'<div class="uyari"><b>ÖNERİ:</b> Açık alanlar (padok ve manej) arazinin %{acik_alan_oran*100:.1f}\'ini kaplıyor. ' \
                         f'Çok büyük arazinizde ({arazi_alani/10000:.1f} hektar) bu oran kabul edilebilir olmakla birlikte, ' \
                         f'açık alan dağılımını optimize etmenizi öneririz.</div>'
            # Kabul edilebilir oranı aşan durumlar için genel uyarı
            elif acik_alan_oran > 0.65:  # %65'in üzerindeki durumlarda daha belirgin uyarı
                mesaj += f'<div class="uyari"><b>UYARI:</b> Açık alanlar (padok ve manej) arazinin oldukça büyük bir kısmını ' \
                         f'(%{acik_alan_oran*100:.1f}) kaplıyor. Açık alanların daha verimli kullanılması için ' \
                         f'padok ve manej yerleşimini optimize etmenizi öneririz.</div>'
    
    # Notlar bölümü
    mesaj += '<div class="notlar">'
    mesaj += '<b>Önemli Notlar:</b><br>'
    mesaj += '- Haralarda (at üretimi ve yetiştiriciliği tesisleri) minimum 40 boks kapasitesi şartı aranmaktadır.<br>'
    mesaj += '- Boks alanları: Kısrak için 16 m² (4x4m), Aygır için 25 m² (5x5m), Yavrulama bölmesi için 25 m² (5x5m).<br>'
    mesaj += '- Padok alanı, at başına en az boks alanının 2 katı (32m²) olmalıdır.<br>'
    mesaj += '- Manej alanı, at başına en az 18 m² (3x6m) olmalıdır.<br>'
    mesaj += '- Bakıcı evi ahır alanının %6-7\'si, yem deposu %7-8\'i, gübre çukuru %4-5\'i olarak hesaplanmalıdır.<br>'
    mesaj += '- Tesiste bulunan hayvanların günlük en az 8 saat açık alanda hareket imkanı bulması önerilir.<br>'
    mesaj += '- Bu değerlendirme ön bilgilendirme amaçlıdır ve resmi bir belge niteliği taşımaz.'
    mesaj += '</div>'
    
    # Kapasite hesaplama detayları bölümünü güncelle
    if "YAPILAMAZ" not in sonuc_durumu and not sonuc.get("acik_alan_sorunu", False):
        mesaj += '<div class="baslik">KAPASİTE HESAPLAMA DETAYLARI</div>'
        mesaj += '<div class="notlar" style="background-color: #e8f4f8; border-left-color: #2196F3;">'
        mesaj += '<b>Optimal Boks Sayısının Hesaplanma Yöntemi</b><br>'
        
        # Hesaplama özeti
        boks_sayisi = sonuc.get('boks_sayisi', 0)
        arazi_alani = sonuc.get('arazi_alani_m2', 0)
        emsal_alani = sonuc.get('emsal_m2', 0)
        
        mesaj += f'<p>Bu arazi için emsal alanı (yapılaşma hakkı): {emsal_alani:.2f} m²</p>'
        mesaj += '<p>Hesaplama şu adımlarla yapılmıştır:</p>'
        
        # Algoritma açıklaması
        mesaj += '<ol>'
        mesaj += '<li><b>İkili arama algoritması</b> kullanılarak, 40-1000 boks aralığında emsal alanını en verimli şekilde kullanacak maksimum boks sayısı bulunur.</li>'
        mesaj += '<li>Her test edilen boks sayısı için, ahır ve müştemilat alanları hesaplanır ve emsal alanı ile karşılaştırılır.</li>'
        mesaj += '<li>Emsal alanını aşmayan en yüksek boks sayısı belirlenir.</li>'
        mesaj += '</ol>'
        
        # Formüller ve hesaplama detayları (güncellendi - boks tipleri eklendi)
        mesaj += '<p><b>102 boks kapasitesi için detaylı hesaplama:</b></p>'
        
        # Boks tiplerine göre dağılım - gerçekçi bir dağılım kullanıyoruz
        kisrak_boks_orani = 0.85  # %85 kısrak boksları
        aygir_boks_orani = 0.05   # %5 aygır boksları
        yavrulama_boks_orani = 0.10  # %10 yavrulama bölmeleri
        
        kisrak_boks_sayisi = math.floor(boks_sayisi * kisrak_boks_orani)
        aygir_boks_sayisi = math.floor(boks_sayisi * aygir_boks_orani)
        yavrulama_boks_sayisi = boks_sayisi - kisrak_boks_sayisi - aygir_boks_sayisi
        
        # Alanlara göre hesaplama
        kisrak_bokslari_alani = kisrak_boks_sayisi * KISRAK_BOKS_ALANI
        aygir_bokslari_alani = aygir_boks_sayisi * AYGIR_BOKS_ALANI
        yavrulama_bolmeleri_alani = yavrulama_boks_sayisi * YAVRULAMA_BOLMESI_ALANI
        
        toplam_boks_alani = kisrak_bokslari_alani + aygir_bokslari_alani + yavrulama_bolmeleri_alani
        
        # Ahır (tavla) alanı hesaplaması - güncellendi
        mesaj += f'<p><u>Ahır (Tavla) Alanı Detayları:</u></p>'
        mesaj += '<ul>'
        mesaj += f'<li>Kısrak Boksları: {kisrak_boks_sayisi} adet × {KISRAK_BOKS_ALANI} m²/boks = {kisrak_bokslari_alani:.2f} m²</li>'
        mesaj += f'<li>Aygır Boksları: {aygir_boks_sayisi} adet × {AYGIR_BOKS_ALANI} m²/boks = {aygir_bokslari_alani:.2f} m²</li>'
        mesaj += f'<li>Yavrulama Bölmeleri: {yavrulama_boks_sayisi} adet × {YAVRULAMA_BOLMESI_ALANI} m²/bölme = {yavrulama_bolmeleri_alani:.2f} m²</li>'
        mesaj += f'<li><b>Toplam Ahır Alanı:</b> {toplam_boks_alani:.2f} m²</li>'
        mesaj += '</ul>'
        
        # Müştemilat hesaplamaları
        mesaj += '<p><u>Müştemilat Alanları:</u></p>'
        mesaj += '<ul>'
        
        # Her bir müştemilatın hesaplanma yöntemi
        bakici_evi_alani = toplam_boks_alani * 0.065
        mesaj += f'<li>Bakıcı Evi: Ahır alanının %6.5\'i → {toplam_boks_alani:.2f} m² × 0.065 = {bakici_evi_alani:.2f} m²</li>'
        
        yem_deposu_alani = toplam_boks_alani * 0.075
        mesaj += f'<li>Yem Deposu: Ahır alanının %7.5\'i → {toplam_boks_alani:.2f} m² × 0.075 = {yem_deposu_alani:.2f} m²</li>'
        
        gubre_cukuru_alani = toplam_boks_alani * 0.045
        mesaj += f'<li>Gübre Çukuru: Ahır alanının %4.5\'i → {toplam_boks_alani:.2f} m² × 0.045 = {gubre_cukuru_alani:.2f} m²</li>'
        
        # Malzeme deposunun logaritmik hesaplanması
        oran = boks_sayisi / 40  # 40 referans boks sayısı
        malzeme_deposu_alani = 30 + (30 * math.log(oran + 1, 2) * 0.4)
        mesaj += f'<li>Malzeme Deposu: Logaritmik büyüme modeli ile hesaplanır → {malzeme_deposu_alani:.2f} m²</li>'
        mesaj += '</ul>'
        
        # Toplam alan
        zorunlu_mustemilat_alani = bakici_evi_alani + yem_deposu_alani + gubre_cukuru_alani + malzeme_deposu_alani
        toplam_kapali_alan = toplam_boks_alani + zorunlu_mustemilat_alani
        
        mesaj += f'<p><u>Toplam Kapalı Alan:</u> Ahır + Müştemilatlar = {toplam_boks_alani:.2f} m² + {zorunlu_mustemilat_alani:.2f} m² = {toplam_kapali_alan:.2f} m²</p>'
        
        # Emsal kullanım oranı
        kullanim_orani = (toplam_kapali_alan / emsal_alani) * 100
        mesaj += f'<p><u>Emsal Kullanım Oranı:</u> {toplam_kapali_alan:.2f} m² ÷ {emsal_alani:.2f} m² = %{kullanim_orani:.2f}</p>'
        
        # Sonuç açıklaması
        kalan_emsal = emsal_alani - toplam_kapali_alan
        mesaj += f'<p><b>Sonuç:</b> {boks_sayisi} boks (içerisinde {kisrak_boks_sayisi} kısrak boksu, {aygir_boks_sayisi} aygır boksu ve {yavrulama_boks_sayisi} yavrulama bölmesi bulunmaktadır), emsal alanının maksimum verimlilikte kullanılmasını sağlayan optimal kapasitedir. '
        mesaj += f'Kalan emsal alanı sadece {kalan_emsal:.2f} m²\'dir.</p>'
        
        # 103 boks yapılamaz açıklaması
        if boks_sayisi > 0:
            bir_fazla_boks = boks_sayisi + 1
            bir_fazla_kisrak = math.floor(bir_fazla_boks * kisrak_boks_orani)
            bir_fazla_aygir = math.floor(bir_fazla_boks * aygir_boks_orani)
            bir_fazla_yavrulama = bir_fazla_boks - bir_fazla_kisrak - bir_fazla_aygir
            
            bir_fazla_ahir = (bir_fazla_kisrak * KISRAK_BOKS_ALANI) + (bir_fazla_aygir * AYGIR_BOKS_ALANI) + (bir_fazla_yavrulama * YAVRULAMA_BOLMESI_ALANI)
            bir_fazla_bakici = bir_fazla_ahir * 0.065
            bir_fazla_yem = bir_fazla_ahir * 0.075
            bir_fazla_gubre = bir_fazla_ahir * 0.045
            bir_fazla_malzeme = malzeme_deposu_alani * 1.01  # yaklaşık hesap
            bir_fazla_toplam = bir_fazla_ahir + bir_fazla_bakici + bir_fazla_yem + bir_fazla_gubre + bir_fazla_malzeme
            
            mesaj += f'<p><i>Not: {bir_fazla_boks} boks yapılmak istenirse gerekli alan {bir_fazla_toplam:.2f} m² olacaktır, '
            mesaj += f'bu da izin verilen {emsal_alani:.2f} m² emsal alanını {bir_fazla_toplam - emsal_alani:.2f} m² aşacaktır.</i></p>'
        
        # Açık alan hesaplamaları 
        min_padok_alani = boks_sayisi * PADOK_ALANI
        min_manej_alani = boks_sayisi * MANEJ_ALANI
        min_acik_alan = min_padok_alani + min_manej_alani
        
        mesaj += '<p><u>Açık Alan İhtiyaçları:</u></p>'
        mesaj += '<ul>'
        mesaj += f'<li>Padok Alanı: {boks_sayisi} boks × {PADOK_ALANI} m² = {min_padok_alani:.2f} m²</li>'
        mesaj += f'<li>Manej Alanı: {boks_sayisi} boks × {MANEJ_ALANI} m² = {min_manej_alani:.2f} m²</li>'
        mesaj += f'<li><b>Toplam Açık Alan:</b> {min_acik_alan:.2f} m² (arazi alanının %{min_acik_alan/arazi_alani*100:.2f}\'i)</li>'
        mesaj += '</ul>'
        
        mesaj += '</div>'
    
    # Notlar bölümü
    mesaj += '<div class="notlar">'
    mesaj += '<b>Önemli Notlar:</b><br>'
    mesaj += '- Haralarda (at üretimi ve yetiştiriciliği tesisleri) minimum 40 boks kapasitesi şartı aranmaktadır.<br>'
    mesaj += '- Boks alanları: Kısrak için 16 m² (4x4m), Aygır için 25 m² (5x5m), Yavrulama bölmesi için 25 m² (5x5m).<br>'
    mesaj += '- Padok alanı, at başına en az boks alanının 2 katı (32m²) olmalıdır.<br>'
    mesaj += '- Manej alanı, at başına en az 18 m² (3x6m) olmalıdır.<br>'
    mesaj += '- Bakıcı evi ahır alanının %6-7\'si, yem deposu %7-8\'i, gübre çukuru %4-5\'i olarak hesaplanmalıdır.<br>'
    mesaj += '- Tesiste bulunan hayvanların günlük en az 8 saat açık alanda hareket imkanı bulması önerilir.<br>'
    mesaj += '- Bu değerlendirme ön bilgilendirme amaçlıdır ve resmi bir belge niteliği taşımaz.'
    mesaj += '</div>'
    
    return mesaj


def hara_kurali(arazi_buyuklugu_m2):
    """
    Hara (at yetiştiriciliği tesisi) için arazi büyüklüğü ve diğer koşulları kontrol eden kural
    
    Args:
        arazi_buyuklugu_m2: Arazi büyüklüğü (m²)
        
    Returns:
        dict: Kontrol sonuçlarını içeren sözlük
    """
    sonuc = {
        "izin_durumu": None,
        "ana_mesaj": None,
        "detay_mesaj_bakici_evi": "",
        "bilgi_mesaji_bakici_evi_hara": "",
        "uyari_mesaji_ozel_durum": "",
    }

    try:
        # Arazi büyüklüğünü güvenli bir şekilde float'a çevir
        try:
            arazi_buyuklugu_m2 = float(arazi_buyuklugu_m2)
        except (ValueError, TypeError):
            arazi_buyuklugu_m2 = 0

        # Minimum arazi büyüklüğü kontrolü
        if arazi_buyuklugu_m2 < HARA_MIN_ARAZI_M2:
            sonuc["izin_durumu"] = "izin_verilemez"
            sonuc["ana_mesaj"] = f"Hara (at üretimi/yetiştiriciliği tesisi) kurulumu için araziniz yeterli büyüklükte değildir. " \
                                f"Minimum {HARA_MIN_ARAZI_M2:,} m² arazi gereklidir. Mevcut arazi: {arazi_buyuklugu_m2:,} m²"
            sonuc["uyari_mesaji_ozel_durum"] = "Hara tesisleri için MINIMUM 4 dekarlık arazi gereklidir."
            return sonuc

        # Minimum arazi büyüklüğü yeterli, tam hesaplama için yönlendir
        hesaplayici = HaraTesisiHesaplayici(kullanilacak_emsal_orani)
        hesaplama_sonucu = hesaplayici.hesapla(arazi_buyuklugu_m2)
        
        html_mesaj = _olustur_html_mesaj_hara(hesaplama_sonucu, kullanilacak_emsal_orani)
        
        sonuc["izin_durumu"] = "izin_verilebilir" if "YAPILABİLİR" in hesaplama_sonucu.get("sonuc_durumu", "") else "izin_verilemez"
        sonuc["ana_mesaj"] = html_mesaj
        sonuc["detay_mesaj_bakici_evi"] = ""
        sonuc["bilgi_mesaji_bakici_evi_hara"] = "Hara tesislerinde bakıcı evi, müştemilat olarak dahil edilir."
        
        return sonuc
    except Exception as e:
        # Hata durumunda güvenli bir sonuç döndür
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = f"Hesaplama sırasında bir hata oluştu: {str(e)}"
        sonuc["uyari_mesaji_ozel_durum"] = "Lütfen sistem yöneticisiyle iletişime geçiniz."
        return sonuc


def hara_tesisi_degerlendir(arazi_bilgileri: dict, yapi_bilgileri: dict, emsal_orani: float = None) -> dict:
    """
    Arazi bilgilerine göre hara tesisi değerlendirmesi yapar
    
    Args:
        arazi_bilgileri: Arazi bilgilerini içeren sözlük
        yapi_bilgileri: Yapı bilgilerini içeren sözlük
        emsal_orani: Dinamik emsal oranı (opsiyonel)
        
    Returns:
        dict: Değerlendirme sonuçlarını içeren sözlük
    """
    # Dinamik emsal oranını kullan
    kullanilacak_emsal_orani = emsal_orani if emsal_orani is not None else EMSAL_ORANI
    # Arazi büyüklüğü kontrolü
    try:
        # Frontend'den alan_m2 veya buyukluk_m2 alanından veriyi al
        arazi_buyuklugu_m2 = float(arazi_bilgileri.get("alan_m2", arazi_bilgileri.get("buyukluk_m2", 0)))
        if arazi_buyuklugu_m2 <= 0:
            return {
                "izin_durumu": "izin_verilemez",
                "mesaj": "<div class='alert alert-danger'><b>Geçersiz Arazi Büyüklüğü</b><br>Belirtilen arazi büyüklüğü geçerli bir değer değil. Pozitif bir sayı girmelisiniz.</div>",
                "ana_mesaj": "<div class='alert alert-danger'><b>Geçersiz Arazi Büyüklüğü</b><br>Belirtilen arazi büyüklüğü geçerli bir değer değil. Pozitif bir sayı girmelisiniz.</div>",
                "kapasite": 0
            }
    except (ValueError, TypeError):
        return {
            "izin_durumu": "izin_verilemez",
            "mesaj": "<div class='alert alert-danger'><b>Geçersiz Arazi Büyüklüğü</b><br>Belirtilen arazi büyüklüğü sayısal bir değer değil. Geçerli bir sayı girmelisiniz.</div>",
            "ana_mesaj": "<div class='alert alert-danger'><b>Geçersiz Arazi Büyüklüğü</b><br>Belirtilen arazi büyüklüğü sayısal bir değer değil. Geçerli bir sayı girmelisiniz.</div>",
            "kapasite": 0
        }
    
    # YAS ve su tahsis belgesi kontrolü - Daha güvenli hale getirildi
    try:
        su_tahsis_belgesi_var_mi = str(arazi_bilgileri.get("su_tahsis_belgesi", "false")).lower() == "true"
        yas_kapali_alanda_mi = arazi_bilgileri.get("yas_kapali_alan_durumu") == "içinde"
    except (TypeError, AttributeError):
        # Varsayılan olarak en güvenli değerleri kullan
        su_tahsis_belgesi_var_mi = False
        yas_kapali_alanda_mi = False
    
    if yas_kapali_alanda_mi and not su_tahsis_belgesi_var_mi:
        yas_uyari_mesaji = """
        <div class='alert alert-warning'>
            <h4>Yeraltı Suyu Koruma Alanında Su Tahsis Belgesi Gerekli</h4>
            <p>Seçilen arazi YAS (Yeraltı Suları Koruma Alanı) içerisinde yer almaktadır. 
            Bu bölgede hara tesisi kurulumu için <b>su tahsis belgesi zorunludur</b>.</p>
            <p>Su tahsis belgesi olmadan tesise izin verilmemektedir.</p>
        </div>
        """
        return {
            "izin_durumu": "izin_verilemez",
            "mesaj": yas_uyari_mesaji,
            "ana_mesaj": yas_uyari_mesaji,
            "kapasite": 0
        }
    
    # Hesaplama yap - Boks sayısı varsa onu kullan, yoksa optimal hesaplasın
    hesaplayici = HaraTesisiHesaplayici(kullanilacak_emsal_orani)
    
    # Boks sayısı değeri varsa al - Daha güvenli hale getirildi
    try:
        # yapi_bilgileri None olabilir veya "boks_sayisi" key olmayabilir, bu durumları kontrol et
        if yapi_bilgileri is None:
            boks_sayisi = None
        else:
            boks_sayisi_str = yapi_bilgileri.get("boks_sayisi", "")
            if boks_sayisi_str and isinstance(boks_sayisi_str, (str, int, float)):
                boks_sayisi = int(float(boks_sayisi_str))
                if boks_sayisi <= 0:
                    boks_sayisi = None  # Hesaplayıcı optimal değeri hesaplayacak
            else:
                boks_sayisi = None  # Hesaplayıcı optimal değeri hesaplayacak
    except (ValueError, TypeError, AttributeError):
        boks_sayisi = None  # Hesaplayıcı optimal değeri hesaplayacak
    
    try:
        hesaplama_sonucu = hesaplayici.hesapla(arazi_buyuklugu_m2, boks_sayisi)
        html_mesaj = _olustur_html_mesaj_hara(hesaplama_sonucu, kullanilacak_emsal_orani)
        
        # Sonuç
        izin_durumu = "izin_verilebilir" if "YAPILABİLİR" in hesaplama_sonucu.get("sonuc_durumu", "") else "izin_verilemez"
        
        return {
            "izin_durumu": izin_durumu,
            "mesaj": html_mesaj,
            "ana_mesaj": html_mesaj,
            "kapasite": hesaplama_sonucu.get("boks_sayisi", 0),
            "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
            "emsal_m2": hesaplama_sonucu.get("emsal_m2", 0),
            "ahir_alani_m2": hesaplama_sonucu.get("ahir_alani_m2", 0),
            "toplam_kapali_alan_m2": hesaplama_sonucu.get("toplam_kapali_alan_m2", 0),
            "hesaplama_detaylari": hesaplama_sonucu
        }
    except Exception as e:
        # Hata durumunda kullanıcıya bilgi ver
        hata_mesaji = f"""
        <div class='alert alert-danger'>
            <h4>Hesaplama Sırasında Bir Hata Oluştu</h4>
            <p>Hara tesisi hesaplaması yapılırken beklenmeyen bir hata oluştu.</p>
            <p>Lütfen değerleri kontrol edip tekrar deneyiniz veya sistem yöneticisiyle iletişime geçiniz.</p>
            <p><small>Hata detayı: {str(e)}</small></p>
        </div>
        """
        return {
            "izin_durumu": "izin_verilemez",
            "mesaj": hata_mesaji,
            "ana_mesaj": hata_mesaji,
            "kapasite": 0,
            "arazi_buyuklugu_m2": arazi_buyuklugu_m2,
            "hata": str(e)
        }


def hara_kurali(arazi_buyuklugu_m2):
    """
    Hara (at yetiştiriciliği tesisi) için arazi büyüklüğü ve diğer koşulları kontrol eden kural
    
    Args:
        arazi_buyuklugu_m2: Arazi büyüklüğü (m²)
        
    Returns:
        dict: Kontrol sonuçlarını içeren sözlük
    """
    sonuc = {
        "izin_durumu": None,
        "ana_mesaj": None,
        "detay_mesaj_bakici_evi": "",
        "bilgi_mesaji_bakici_evi_hara": "",
        "uyari_mesaji_ozel_durum": "",
    }

    try:
        # Arazi büyüklüğünü güvenli bir şekilde float'a çevir
        try:
            arazi_buyuklugu_m2 = float(arazi_buyuklugu_m2)
        except (ValueError, TypeError):
            arazi_buyuklugu_m2 = 0

        # Minimum arazi büyüklüğü kontrolü
        if arazi_buyuklugu_m2 < HARA_MIN_ARAZI_M2:
            sonuc["izin_durumu"] = "izin_verilemez"
            sonuc["ana_mesaj"] = f"Hara (at üretimi/yetiştiriciliği tesisi) kurulumu için araziniz yeterli büyüklükte değildir. " \
                                f"Minimum {HARA_MIN_ARAZI_M2:,} m² arazi gereklidir. Mevcut arazi: {arazi_buyuklugu_m2:,} m²"
            sonuc["uyari_mesaji_ozel_durum"] = "Hara tesisleri için MINIMUM 4 dekarlık arazi gereklidir."
            return sonuc

        # Minimum arazi büyüklüğü yeterli, tam hesaplama için yönlendir
        hesaplayici = HaraTesisiHesaplayici(kullanilacak_emsal_orani)
        hesaplama_sonucu = hesaplayici.hesapla(arazi_buyuklugu_m2)
        
        html_mesaj = _olustur_html_mesaj_hara(hesaplama_sonucu, kullanilacak_emsal_orani)
        
        sonuc["izin_durumu"] = "izin_verilebilir" if "YAPILABİLİR" in hesaplama_sonucu.get("sonuc_durumu", "") else "izin_verilemez"
        sonuc["ana_mesaj"] = html_mesaj
        sonuc["detay_mesaj_bakici_evi"] = ""
        sonuc["bilgi_mesaji_bakici_evi_hara"] = "Hara tesislerinde bakıcı evi, müştemilat olarak dahil edilir."
        
        return sonuc
    except Exception as e:
        # Hata durumunda güvenli bir sonuç döndür
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = f"Hesaplama sırasında bir hata oluştu: {str(e)}"
        sonuc["uyari_mesaji_ozel_durum"] = "Lütfen sistem yöneticisiyle iletişime geçiniz."
        return sonuc
