"""
Bağ Evi yapılaşma kuralları ve değerlendirme fonksiyonları
Genişletilebilir yapı - diğer arazi tipleri için de kullanılabilir
"""

# Sabitler ve yapılandırma değerleri
BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI = 5000  # 0.5 hektar - Dikili alan minimum
BAG_EVI_MIN_ARAZI_BUYUKLUGU_MUTLAK = 20000  # 2 hektar - Tarla alanı minimum
BAG_EVI_MIN_ARAZI_BUYUKLUGU_ORTU_ALTI = 3000  # 0.3 hektar - Örtüaltı minimum
BAG_EVI_MAX_TABAN_ALANI = 75  # metrekare
BAG_EVI_MAX_TOPLAM_ALAN = 150  # metrekare

# Bağ evi kuralları sözlüğü (diğer modüllerle uyumluluk için)
BAG_EVI_KURALLARI = {
    "dikili_min_alan": BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI,
    "tarla_min_alan": BAG_EVI_MIN_ARAZI_BUYUKLUGU_MUTLAK,
    "ortu_alti_min_alan": BAG_EVI_MIN_ARAZI_BUYUKLUGU_ORTU_ALTI,
    "max_taban_alani": BAG_EVI_MAX_TABAN_ALANI,
    "max_toplam_alan": BAG_EVI_MAX_TOPLAM_ALAN
}

def bag_evi_degerlendir_varsayimsal(arazi_bilgileri, yapi_bilgileri, bag_evi_var_mi=False):
    """
    Ağaç kontrolü yapılmamış "Tarla + herhangi bir dikili vasıflı" araziler için varsayımsal değerlendirme
    
    Args:
        arazi_bilgileri: Arazi detaylarını içeren sözlük 
            {ana_vasif, buyukluk_m2, tarla_alani, dikili_alani, buyuk_ova_icinde}
        yapi_bilgileri: Yapı detaylarını içeren sözlük
        bag_evi_var_mi: Aynı ilçede bağ evi var mı bilgisi
        
    Returns:
        dict: Değerlendirme sonucunu içeren sözlük
    """
    sonuc = {
        "izin_durumu": None, 
        "ana_mesaj": None, 
        "uyari_mesaji_ozel_durum": "",
        "buyuk_ova_icerisinde": arazi_bilgileri.get("buyuk_ova_icinde", False),
        "hesaplama_tipi": "kesin"
    }
    
    # Ailenin aynı ilçede başka bağ evi var mı kontrolü
    if bag_evi_var_mi:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = "Tarım Arazilerinde Yapılaşma Şartları Genelgesi'ne göre, her aile için aynı ilçe sınırları içerisinde sadece bir adet bağ evi izni verilebilir. Ailenizin aynı ilçede başka bir bağ evi olduğu için yeni bağ evi yapılamaz."
        return sonuc
    
    tarla_alani = arazi_bilgileri.get('tarla_alani', 0)
    dikili_alani = arazi_bilgileri.get('dikili_alani', 0)
    toplam_arazi = tarla_alani + dikili_alani
    
    # Varsayımsal kontrol: Dikili alan >= 5000 veya tarla alanı >= 20000
    dikili_yeterli = dikili_alani >= BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI
    tarla_yeterli = tarla_alani >= BAG_EVI_MIN_ARAZI_BUYUKLUGU_MUTLAK
    
    if dikili_yeterli or tarla_yeterli:
        sonuc["izin_durumu"] = "izin_verilebilir_varsayimsal"
        sonuc["ana_mesaj"] = f"""
        <b>VARSAYIMSAL HESAPLAMA SONUCU</b><br><br>
        
        <b>📋 Girilen Bilgiler:</b><br>
        • Toplam Arazi: {toplam_arazi:,} m² ({toplam_arazi/10000:.2f} hektar)<br>
        • Dikili Alan: {dikili_alani:,} m²<br>
        • Tarla Alanı: {tarla_alani:,} m²<br><br>
        
        <b>✅ Değerlendirme:</b><br>
        Girilen bilgilere göre, eğer fiili durumda:<br>
        • Dikili alanınız gerçekten {dikili_alani:,} m² ise (minimum {BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI:,} m² gerekli) {"✅" if dikili_yeterli else "❌"}<br>
        • Tarla alanınız gerçekten {tarla_alani:,} m² ise (minimum {BAG_EVI_MIN_ARAZI_BUYUKLUGU_MUTLAK:,} m² gerekli) {"✅" if tarla_yeterli else "❌"}<br><br>
        
        <b>🏠 Bağ Evi İzni:</b><br>
        Bu bilgiler doğru ise <b>bağ evi yapılabilir</b>:<br>
        • Maksimum taban alanı: {BAG_EVI_MAX_TABAN_ALANI} m²<br>
        • Maksimum toplam inşaat alanı: {BAG_EVI_MAX_TOPLAM_ALAN} m²<br><br>
        
        <b>⚠️ UYARI:</b><br>
        Bu hesaplama girdiğiniz bilgilerin doğru olduğu varsayımıyla yapılmıştır. 
        Manuel ağaç kontrolü yapmanız önerilir.
        """.replace(",", ".")
        
        sonuc["uyari_mesaji_ozel_durum"] = "Varsayımsal sonuç - Manuel kontrol önerilir."
    else:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = f"""
        <b>VARSAYIMSAL HESAPLAMA SONUCU</b><br><br>
        
        <b>📋 Girilen Bilgiler:</b><br>
        • Toplam Arazi: {toplam_arazi:,} m² ({toplam_arazi/10000:.2f} hektar)<br>
        • Dikili Alan: {dikili_alani:,} m² (minimum {BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI:,} m² gerekli) ❌<br>
        • Tarla Alanı: {tarla_alani:,} m² (minimum {BAG_EVI_MIN_ARAZI_BUYUKLUGU_MUTLAK:,} m² gerekli) ❌<br><br>
        
        <b>❌ Değerlendirme:</b><br>
        Girilen bilgilere göre bağ evi şartları sağlanamamaktadır:<br>
        • Dikili alan {BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI:,} m²'den az<br>
        • Tarla alanı {BAG_EVI_MIN_ARAZI_BUYUKLUGU_MUTLAK:,} m²'den az<br><br>
        
        En az birinin yeterli olması gerekmektedir.
        """.replace(",", ".")
    
    return sonuc

def bag_evi_degerlendir_manuel_kontrol(arazi_bilgileri, yapi_bilgileri, dikili_kontrol_sonucu, bag_evi_var_mi=False):
    """
    Manuel ağaç kontrolü yapılmış "Tarla + herhangi bir dikili vasıflı" araziler için kesin değerlendirme
    
    Args:
        arazi_bilgileri: Arazi detaylarını içeren sözlük
        yapi_bilgileri: Yapı detaylarını içeren sözlük  
        dikili_kontrol_sonucu: Manuel kontrol sonuçları
        bag_evi_var_mi: Aynı ilçede bağ evi var mı bilgisi
        
    Returns:
        dict: Değerlendirme sonucunu içeren sözlük
    """
    sonuc = {
        "izin_durumu": None, 
        "ana_mesaj": None, 
        "uyari_mesaji_ozel_durum": "",
        "buyuk_ova_icerisinde": arazi_bilgileri.get("buyuk_ova_icinde", False),
        "hesaplama_tipi": "manuel_kontrol"
    }
    
    # Ailenin aynı ilçede başka bağ evi var mı kontrolü
    if bag_evi_var_mi:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = "Tarım Arazilerinde Yapılaşma Şartları Genelgesi'ne göre, her aile için aynı ilçe sınırları içerisinde sadece bir adet bağ evi izni verilebilir. Ailenizin aynı ilçede başka bir bağ evi olduğu için yeni bağ evi yapılamaz."
        return sonuc
    
    tarla_alani = arazi_bilgileri.get('tarla_alani', 0)
    dikili_alani = arazi_bilgileri.get('dikili_alani', 0)
    toplam_arazi = tarla_alani + dikili_alani
    
    # Direct transfer durumu
    if dikili_kontrol_sonucu.get('directTransfer'):
        # Polygon transferi başarılı, dikili alan yeterli kabul edilir
        sonuc["izin_durumu"] = "izin_verilebilir"
        sonuc["ana_mesaj"] = f"""
        <b>MANUEL KONTROL SONUCU (Polygon Transfer)</b><br><br>
        
        <b>📋 Arazi Bilgileri:</b><br>
        • Toplam Arazi: {toplam_arazi:,} m² ({toplam_arazi/10000:.2f} hektar)<br>
        • Dikili Alan: {dikili_alani:,} m²<br>
        • Tarla Alanı: {tarla_alani:,} m²<br><br>
        
        <b>✅ Manuel Kontrol Sonucu:</b><br>
        Polygon transfer işlemi başarıyla tamamlanmıştır. Bu, arazinizdeki dikili alanın 
        mevcut sistemde kayıtlı olduğunu ve yeterli olduğunu göstermektedir.<br><br>
        
        <b>🏠 Bağ Evi İzni VERİLEBİLİR:</b><br>
        • Maksimum taban alanı: {BAG_EVI_MAX_TABAN_ALANI} m²<br>
        • Maksimum toplam inşaat alanı: {BAG_EVI_MAX_TOPLAM_ALAN} m²<br><br>
        
        Bu kesin bir sonuçtur, ek kontrol gerekmemektedir.
        """.replace(",", ".")
        
        return sonuc
    
    # Normal manuel kontrol sonucu
    yeterlilik = dikili_kontrol_sonucu.get('yeterlilik', {})
    yeterli_mi = yeterlilik.get('yeterli', False)
    manuel_dikili_alan = yeterlilik.get('dikili_alan_m2', 0)
    
    # Tarla alanı kontrolü
    tarla_yeterli = tarla_alani >= BAG_EVI_MIN_ARAZI_BUYUKLUGU_MUTLAK
    
    if yeterli_mi or tarla_yeterli:
        sonuc["izin_durumu"] = "izin_verilebilir"
        sonuc["ana_mesaj"] = f"""
        <b>MANUEL KONTROL SONUCU</b><br><br>
        
        <b>📋 Arazi Bilgileri:</b><br>
        • Toplam Arazi: {toplam_arazi:,} m² ({toplam_arazi/10000:.2f} hektar)<br>
        • Beyan Edilen Dikili Alan: {dikili_alani:,} m²<br>
        • Tarla Alanı: {tarla_alani:,} m²<br><br>
        
        <b>🌳 Manuel Ağaç Sayım Sonucu:</b><br>
        • Tespit Edilen Dikili Alan: {manuel_dikili_alan:,} m²<br>
        • Dikili Alan Yeterli mi: {"✅ Evet" if yeterli_mi else "❌ Hayır"} (min {BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI:,} m²)<br>
        • Tarla Alanı Yeterli mi: {"✅ Evet" if tarla_yeterli else "❌ Hayır"} (min {BAG_EVI_MIN_ARAZI_BUYUKLUGU_MUTLAK:,} m²)<br><br>
        
        <b>✅ Değerlendirme:</b><br>
        Manuel ağaç sayım sonucuna göre bağ evi şartları sağlanmaktadır.<br><br>
        
        <b>🏠 Bağ Evi İzni VERİLEBİLİR:</b><br>
        • Maksimum taban alanı: {BAG_EVI_MAX_TABAN_ALANI} m²<br>
        • Maksimum toplam inşaat alanı: {BAG_EVI_MAX_TOPLAM_ALAN} m²
        """.replace(",", ".")
    else:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = f"""
        <b>MANUEL KONTROL SONUCU</b><br><br>
        
        <b>📋 Arazi Bilgileri:</b><br>
        • Toplam Arazi: {toplam_arazi:,} m² ({toplam_arazi/10000:.2f} hektar)<br>
        • Beyan Edilen Dikili Alan: {dikili_alani:,} m²<br>
        • Tarla Alanı: {tarla_alani:,} m²<br><br>
        
        <b>🌳 Manuel Ağaç Sayım Sonucu:</b><br>
        • Tespit Edilen Dikili Alan: {manuel_dikili_alan:,} m²<br>
        • Dikili Alan Yeterli mi: ❌ Hayır (min {BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI:,} m²)<br>
        • Tarla Alanı Yeterli mi: ❌ Hayır (min {BAG_EVI_MIN_ARAZI_BUYUKLUGU_MUTLAK:,} m²)<br><br>
        
        <b>❌ Değerlendirme:</b><br>
        Manuel ağaç sayım sonucuna göre bağ evi şartları sağlanamamaktadır:<br>
        • Tespit edilen dikili alan {BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI:,} m²'den az<br>
        • Tarla alanı {BAG_EVI_MIN_ARAZI_BUYUKLUGU_MUTLAK:,} m²'den az<br><br>
        
        Bağ evi yapımı için en az birinin yeterli olması gerekmektedir.
        """.replace(",", ".")
    
    return sonuc

# Gelecekteki genişleme için genel arazi tipi değerlendirme fonksiyonu
def bag_evi_degerlendir(arazi_bilgileri, yapi_bilgileri, bag_evi_var_mi=False, manuel_kontrol_sonucu=None):
    """
    Genel bağ evi değerlendirme fonksiyonu (diğer arazi tipleri için)
    
    Args:
        arazi_bilgileri: Arazi detaylarını içeren sözlük 
            {id, ana_vasif, buyukluk_m2, buyuk_ova_icinde}
        yapi_bilgileri: Yapı detaylarını içeren sözlük
        bag_evi_var_mi: Aynı ilçede bağ evi var mı bilgisi
        manuel_kontrol_sonucu: Opsiyonel manuel dikili alan kontrol sonucu
        
    Returns:
        dict: Değerlendirme sonucunu içeren sözlük
    """
    sonuc = {
        "izin_durumu": None, 
        "ana_mesaj": None, 
        "uyari_mesaji_ozel_durum": "",
        "buyuk_ova_icerisinde": arazi_bilgileri.get("buyuk_ova_icinde", False)
    }
    
    arazi_vasfi = arazi_bilgileri.get("ana_vasif", "")
    arazi_buyuklugu = arazi_bilgileri.get("buyukluk_m2", 0)
    
    # Ailenin aynı ilçede başka bağ evi var mı kontrolü
    if bag_evi_var_mi:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = "Tarım Arazilerinde Yapılaşma Şartları Genelgesi'ne göre, her aile için aynı ilçe sınırları içerisinde sadece bir adet bağ evi izni verilebilir. Ailenizin aynı ilçede başka bir bağ evi olduğu için yeni bağ evi yapılamaz."
        return sonuc
    
    # Arazi vasfına göre minimum büyüklük kontrolü
    if arazi_vasfi == "Dikili vasıflı":
        if arazi_buyuklugu < BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI:
            sonuc["izin_durumu"] = "izin_verilemez"
            sonuc["ana_mesaj"] = f"Dikili tarım arazilerinde bağ evi yapılabilmesi için arazi büyüklüğünün en az 0,5 hektar ({BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI} m²) olması gerekmektedir. Mevcut arazi büyüklüğünüz {arazi_buyuklugu} m² olup, bu koşulu sağlamamaktadır."
            return sonuc
        else:
            # Manuel kontrol sonucu var mı kontrol et
            if manuel_kontrol_sonucu:
                # Manuel kontrol yapılmış - kesin sonuç ver
                sonuc["izin_durumu"] = "izin_verilebilir"
                sonuc["ana_mesaj"] = f"""
                <b>MANUEL KONTROL SONUCU</b><br><br>
                
                <b>📋 Arazi Bilgileri:</b><br>
                • Dikili Alan: {arazi_buyuklugu:,} m² ({arazi_buyuklugu/10000:.2f} hektar)<br>
                • Arazi Vasfı: Dikili vasıflı<br><br>
                
                <b>✅ Değerlendirme:</b><br>
                Manuel ağaç kontrolü yapılmış ve koşullar sağlanmıştır.<br>
                Dikili alan {BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI:,} m² minimum şartını aşmaktadır.<br><br>
                
                <b>🏠 Bağ Evi İzni:</b><br>
                Bağ evi yapımına <b>izin verilebilir</b>:<br>
                • Maksimum taban alanı: {BAG_EVI_MAX_TABAN_ALANI} m²<br>
                • Maksimum toplam inşaat alanı: {BAG_EVI_MAX_TOPLAM_ALAN} m²<br>
                """.replace(",", ".")
                sonuc["hesaplama_tipi"] = "manuel_kontrol"
            else:
                # Manuel kontrol yapılmamış - varsayımsal sonuç ver
                sonuc["izin_durumu"] = "izin_verilebilir_varsayimsal"
                sonuc["ana_mesaj"] = f"""
                <b>VARSAYIMSAL HESAPLAMA SONUCU</b><br><br>
                
                <b>📋 Girilen Bilgiler:</b><br>
                • Dikili Alan: {arazi_buyuklugu:,} m² ({arazi_buyuklugu/10000:.2f} hektar)<br>
                • Arazi Vasfı: Dikili vasıflı<br><br>
                
                <b>✅ Değerlendirme:</b><br>
                Girilen bilgilere göre, eğer fiili durumda:<br>
                • Dikili alanınız gerçekten {arazi_buyuklugu:,} m² ise (minimum {BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI:,} m² gerekli) ✅<br>
                • Bu alanda yeterli ağaç yoğunluğu bulunuyorsa<br><br>
                
                <b>🏠 Bağ Evi İzni:</b><br>
                Bu bilgiler doğru ise <b>bağ evi yapılabilir</b>:<br>
                • Maksimum taban alanı: {BAG_EVI_MAX_TABAN_ALANI} m²<br>
                • Maksimum toplam inşaat alanı: {BAG_EVI_MAX_TOPLAM_ALAN} m²<br><br>
                
                <b>⚠️ UYARI:</b><br>
                Bu hesaplama girdiğiniz bilgilerin doğru olduğu varsayımıyla yapılmıştır. 
                Manuel ağaç kontrolü yapmanız önerilir.
                """.replace(",", ".")
                sonuc["hesaplama_tipi"] = "varsayimsal"
                sonuc["uyari_mesaji_ozel_durum"] = "Varsayımsal sonuç - Manuel kontrol önerilir."
    
    elif arazi_vasfi == "Tarla":
        if arazi_buyuklugu < BAG_EVI_MIN_ARAZI_BUYUKLUGU_MUTLAK:
            sonuc["izin_durumu"] = "izin_verilemez"
            sonuc["ana_mesaj"] = f"Tarla vasfı için bağ evi yapılabilmesi en az 2 hektar ({BAG_EVI_MIN_ARAZI_BUYUKLUGU_MUTLAK} m²) olmalıdır. Mevcut: {arazi_buyuklugu} m²."
            return sonuc
        else:
            sonuc["izin_durumu"] = "izin_verilebilir"
            sonuc["ana_mesaj"] = f"Bağ evi izni verilebilir. Tarla büyüklüğü {arazi_buyuklugu} m² ve minimum {BAG_EVI_MIN_ARAZI_BUYUKLUGU_MUTLAK} m² şartı sağlanıyor."
    
    elif arazi_vasfi in ["Örtüaltı tarım", "Sera"]:
        if arazi_buyuklugu < BAG_EVI_MIN_ARAZI_BUYUKLUGU_ORTU_ALTI:
            sonuc["izin_durumu"] = "izin_verilemez"
            sonuc["ana_mesaj"] = f"Örtüaltı tarım veya sera arazilerinde bağ evi yapılabilmesi için arazi büyüklüğünün en az 0,3 hektar ({BAG_EVI_MIN_ARAZI_BUYUKLUGU_ORTU_ALTI} m²) olması gerekmektedir. Mevcut arazi büyüklüğünüz {arazi_buyuklugu} m² olup, bu koşulu sağlamamaktadır."
            return sonuc
        else:
            sonuc["izin_durumu"] = "izin_verilebilir"
            sonuc["ana_mesaj"] = f"Bağ evi yapımına izin verilebilir. Arazi büyüklüğünüz {arazi_buyuklugu} m² olup, örtüaltı tarım veya sera arazisi için minimum gerekli alan {BAG_EVI_MIN_ARAZI_BUYUKLUGU_ORTU_ALTI} m² şartını sağlamaktadır."
    
    elif arazi_vasfi == "Tarla + Zeytinlik":
        # "Tarla + Zeytinlik" arazi tipi için uygun dual function sistemi var
        # Bu durumda ana_hesaplama fonksiyonu zaten bu arazi tipini handle ediyor
        # Bu fonksiyon genellikle diğer arazi tipleri için kullanılır, bu yüzden yönlendirme yapalım
        return bag_evi_ana_hesaplama(arazi_bilgileri, yapi_bilgileri, bag_evi_var_mi, manuel_kontrol_sonucu)
    
    elif arazi_vasfi == "Zeytin ağaçlı + tarla":
        # "Zeytin ağaçlı + tarla" arazi tipi için uygun dual function sistemi var
        # Bu durumda ana_hesaplama fonksiyonu zaten bu arazi tipini handle ediyor
        # Bu fonksiyon genellikle diğer arazi tipleri için kullanılır, bu yüzden yönlendirme yapalım
        return bag_evi_ana_hesaplama(arazi_bilgileri, yapi_bilgileri, bag_evi_var_mi, manuel_kontrol_sonucu)
    
    else:
        # Diğer arazi tipleri için uyarı
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = f"Bağ evi yapımı için arazi vasfı uygun değil. Bağ evi sadece Dikili tarım, Tarla, Örtüaltı tarım, Sera, Tarla + Zeytinlik veya Zeytin ağaçlı + tarla arazilerinde yapılabilir. Mevcut arazi vasfınız: {arazi_vasfi}"
        return sonuc
    
    # Yapı bilgileri uyarısı
    sonuc["uyari_mesaji_ozel_durum"] = f"Bağ evi maksimum taban alanı {BAG_EVI_MAX_TABAN_ALANI} m², toplam inşaat alanı ise en fazla {BAG_EVI_MAX_TOPLAM_ALAN} m² olabilir."
    
    return sonuc


# Ana hesaplama fonksiyonu - manuel kontrol sonucu ve diğer parametreleri kabul eder
def bag_evi_ana_hesaplama(arazi_bilgileri, yapi_bilgileri, bag_evi_var_mi=False, manuel_kontrol_sonucu=None):
    """
    Bağ evi için ana hesaplama fonksiyonu. Frontend'den gelen manuel kontrol sonucunu 
    değerlendirip uygun hesaplama fonksiyonunu çağırır.
    
    Args:
        arazi_bilgileri: Arazi detaylarını içeren sözlük 
        yapi_bilgileri: Yapı detaylarını içeren sözlük
        bag_evi_var_mi: Aynı ilçede bağ evi var mı bilgisi
        manuel_kontrol_sonucu: Opsiyonel manuel dikili alan kontrol sonucu
        
    Returns:
        dict: Değerlendirme sonucunu içeren sözlük
    """
    # Log girdisi ekleyelim
    print(f"🌿 Bağ Evi hesaplaması - Manuel kontrol sonucu mevcut: {manuel_kontrol_sonucu is not None}")
    
    # Arazi vasfını kontrol et
    arazi_vasfi = arazi_bilgileri.get('ana_vasif', '')
    print(f"🌾 Arazi vasfı: {arazi_vasfi}")
    
    # "Tarla + Zeytinlik" arazi tipi için özel dual function sistemi
    if arazi_vasfi == 'Tarla + Zeytinlik':
        if manuel_kontrol_sonucu is not None:
            print("🫒 Tarla + Zeytinlik - Manuel kontrol fonksiyonu çağrılıyor")
            return bag_evi_degerlendir_tarla_zeytinlik_manuel(
                arazi_bilgileri, yapi_bilgileri, manuel_kontrol_sonucu, bag_evi_var_mi
            )
        else:
            print("🫒 Tarla + Zeytinlik - Varsayımsal hesaplama fonksiyonu çağrılıyor")
            return bag_evi_degerlendir_tarla_zeytinlik_varsayimsal(
                arazi_bilgileri, yapi_bilgileri, bag_evi_var_mi
            )
    
    # "Zeytin ağaçlı + tarla" arazi tipi için özel dual function sistemi
    if arazi_vasfi == 'Zeytin ağaçlı + tarla':
        if manuel_kontrol_sonucu is not None:
            print("🫒 Zeytin ağaçlı + tarla - Manuel kontrol fonksiyonu çağrılıyor")
            return bag_evi_degerlendir_zeytin_tarla_manuel(
                arazi_bilgileri, yapi_bilgileri, manuel_kontrol_sonucu, bag_evi_var_mi
            )
        else:
            print("🫒 Zeytin ağaçlı + tarla - Varsayımsal hesaplama fonksiyonu çağrılıyor")
            return bag_evi_degerlendir_zeytin_tarla_varsayimsal(
                arazi_bilgileri, yapi_bilgileri, bag_evi_var_mi
            )
    
    # "Zeytin ağaçlı + herhangi bir dikili vasıf" arazi tipi için özel dual function sistemi
    if arazi_vasfi == 'Zeytin ağaçlı + herhangi bir dikili vasıf':
        if manuel_kontrol_sonucu is not None:
            print("🫒 Zeytin ağaçlı + dikili vasıf - Manuel kontrol fonksiyonu çağrılıyor")
            return bag_evi_degerlendir_zeytin_dikili_manuel(
                arazi_bilgileri, yapi_bilgileri, manuel_kontrol_sonucu, bag_evi_var_mi
            )
        else:
            print("🫒 Zeytin ağaçlı + dikili vasıf - Varsayımsal hesaplama fonksiyonu çağrılıyor")
            return bag_evi_degerlendir_zeytin_dikili_varsayimsal(
                arazi_bilgileri, yapi_bilgileri, bag_evi_var_mi
            )
    
    # Manuel kontrol sonucu varsa, manuel kontrol değerlendirmesi yap
    if manuel_kontrol_sonucu is not None:
        print(f"🌳 Manuel kontrol verileri kullanılıyor: {manuel_kontrol_sonucu}")
        
        # Frontend'den gelen veri yapısına göre uygun işleme
        dikili_kontrol_sonucu = {}
        
        # Frontend'den gelen dikiliAlanKontrolSonucu yapısını kontrol et
        if isinstance(manuel_kontrol_sonucu, dict):
            if 'dikiliAlanKontrolSonucu' in manuel_kontrol_sonucu:
                dikili_kontrol_sonucu = manuel_kontrol_sonucu.get('dikiliAlanKontrolSonucu', {})
                # dikiliAlan değerini manuel dikili alan olarak ayarla
                dikili_alan = manuel_kontrol_sonucu.get('dikiliAlan', 0)
                # Yeterlilik değerini manuel ayarla
                if dikili_alan >= BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI:
                    if 'yeterlilik' not in dikili_kontrol_sonucu:
                        dikili_kontrol_sonucu['yeterlilik'] = {}
                    dikili_kontrol_sonucu['yeterlilik']['yeterli'] = True
                    dikili_kontrol_sonucu['yeterlilik']['dikili_alan_m2'] = dikili_alan
                    print(f"🌳 Dikili alan ({dikili_alan} m²) yeterli olarak işaretlendi.")
            else:
                # Direkt olarak manuel_kontrol_sonucu'nu kullan
                dikili_kontrol_sonucu = manuel_kontrol_sonucu
        else:
            # Veri tipi uygun değilse, manuel_kontrol_sonucu'nu olduğu gibi kullan
            dikili_kontrol_sonucu = manuel_kontrol_sonucu
            
        print(f"🔧 İşlenmiş kontrol sonucu: {dikili_kontrol_sonucu}")
            
        return bag_evi_degerlendir_manuel_kontrol(
            arazi_bilgileri, 
            yapi_bilgileri, 
            dikili_kontrol_sonucu, 
            bag_evi_var_mi
        )
    
    # Manuel kontrol sonucu yoksa varsayımsal değerlendirme yap
    print("🧮 Varsayımsal hesaplama yapılıyor.")
    return bag_evi_degerlendir_varsayimsal(arazi_bilgileri, yapi_bilgileri, bag_evi_var_mi)


# Eski çağrıların uyumluluğu için ana_hesaplama fonksiyonunu bağlayalım
def hesapla(arazi_bilgileri, yapi_bilgileri, bag_evi_var_mi=False, manuel_kontrol_sonucu=None):
    """
    Eski API çağrıları için uyumluluk fonksiyonu
    """
    return bag_evi_ana_hesaplama(arazi_bilgileri, yapi_bilgileri, bag_evi_var_mi, manuel_kontrol_sonucu)

def bag_evi_degerlendir_tarla_zeytinlik_varsayimsal(arazi_bilgileri, yapi_bilgileri, bag_evi_var_mi=False):
    """
    "Tarla + Zeytinlik" arazi tipi için varsayımsal değerlendirme
    - Sadece alan büyüklüğü kontrolü (ağaç kontrolü YOK)
    - Tarla alanı + zeytinlik alanı şartlarına göre hesaplama
    
    Args:
        arazi_bilgileri: Arazi detaylarını içeren sözlük 
            {ana_vasif, buyukluk_m2, tarla_alani, zeytinlik_alani, buyuk_ova_icinde}
        yapi_bilgileri: Yapı detaylarını içeren sözlük
        bag_evi_var_mi: Aynı ilçede bağ evi var mı bilgisi
        
    Returns:
        dict: Değerlendirme sonucunu içeren sözlük
    """
    sonuc = {
        "izin_durumu": None, 
        "ana_mesaj": None, 
        "uyari_mesaji_ozel_durum": "",
        "buyuk_ova_icerisinde": arazi_bilgileri.get("buyuk_ova_icinde", False),
        "hesaplama_tipi": "kesin"
    }
    
    # Ailenin aynı ilçede başka bağ evi var mı kontrolü
    if bag_evi_var_mi:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = "Tarım Arazilerinde Yapılaşma Şartları Genelgesi'ne göre, her aile için aynı ilçe sınırları içerisinde sadece bir adet bağ evi izni verilebilir. Ailenizin aynı ilçede başka bir bağ evi olduğu için yeni bağ evi yapılamaz."
        return sonuc
    
    tarla_alani = arazi_bilgileri.get('tarla_alani', 0)
    zeytinlik_alani = arazi_bilgileri.get('zeytinlik_alani', 0)
    toplam_arazi = tarla_alani + zeytinlik_alani
    
    # "Tarla + Zeytinlik" kriterleri:
    # 1. Tarla alanı >= 20000 m² (2.0 hektar)
    # 2. Zeytinlik alanı >= 1 m² (minimal zeytinlik varlığı)
    # 3. Toplam alan >= 20001 m² (2.0001 hektar)
    
    tarla_yeterli = tarla_alani >= 20000
    zeytinlik_yeterli = zeytinlik_alani >= 1
    toplam_yeterli = toplam_arazi >= 20001
    
    # Tüm şartların sağlanması gerekiyor
    if tarla_yeterli and zeytinlik_yeterli and toplam_yeterli:
        sonuc["izin_durumu"] = "izin_verilebilir_varsayimsal"
        sonuc["ana_mesaj"] = f"""
        <b>VARSAYIMSAL HESAPLAMA SONUCU - TARLA + ZEYTİNLİK</b><br><br>
        
        <b>📋 Girilen Bilgiler:</b><br>
        • Toplam Arazi: {toplam_arazi:,} m² ({toplam_arazi/10000:.2f} hektar)<br>
        • Tarla Alanı: {tarla_alani:,} m² (minimum 20.000 m² gerekli) {"✅" if tarla_yeterli else "❌"}<br>
        • Zeytinlik Alanı: {zeytinlik_alani:,} m² (minimum 1 m² gerekli) {"✅" if zeytinlik_yeterli else "❌"}<br><br>
        
        <b>✅ Değerlendirme:</b><br>
        Girilen bilgilere göre, eğer fiili durumda:<br>
        • Tarla alanınız gerçekten {tarla_alani:,} m² ise ✅<br>
        • Zeytinlik alanınız gerçekten {zeytinlik_alani:,} m² ise ✅<br>
        • Toplam alan {toplam_arazi:,} m² ise ✅<br><br>
        
        <b>🏠 Bağ Evi İzni:</b><br>
        Bu bilgiler doğru ise <b>bağ evi yapılabilir</b>:<br>
        • Maksimum taban alanı: {BAG_EVI_MAX_TABAN_ALANI} m²<br>
        • Maksimum toplam inşaat alanı: {BAG_EVI_MAX_TOPLAM_ALAN} m²<br><br>
        
        <b>⚠️ UYARI:</b><br>
        Bu hesaplama girdiğiniz bilgilerin doğru olduğu varsayımıyla yapılmıştır. 
        Manuel alan kontrolü yapmanız önerilir.
        """.replace(",", ".")
        
        sonuc["uyari_mesaji_ozel_durum"] = "Varsayımsal sonuç - Manuel alan kontrolü önerilir."
    else:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = f"""
        <b>VARSAYIMSAL HESAPLAMA SONUCU - TARLA + ZEYTİNİNLİK</b><br><br>
        
        <b>📋 Girilen Bilgiler:</b><br>
        • Toplam Arazi: {toplam_arazi:,} m² (minimum 20.001 m² gerekli) {"✅" if toplam_yeterli else "❌"}<br>
        • Tarla Alanı: {tarla_alani:,} m² (minimum 20.000 m² gerekli) {"✅" if tarla_yeterli else "❌"}<br>
        • Zeytinlik Alanı: {zeytinlik_alani:,} m² (minimum 1 m² gerekli) {"✅" if zeytinlik_yeterli else "❌"}<br><br>
        
        <b>❌ Değerlendirme:</b><br>
        Girilen bilgilere göre bağ evi şartları sağlanamamaktadır:<br>
        {"• Tarla alanı yetersiz (min 20.000 m²)<br>" if not tarla_yeterli else ""}
        {"• Zeytinlik alanı yetersiz (min 1 m²)<br>" if not zeytinlik_yeterli else ""}
        {"• Toplam alan yetersiz (min 20.001 m²)<br>" if not toplam_yeterli else ""}
        <br>Tüm şartların sağlanması gerekmektedir.
        """.replace(",", ".")
    
    return sonuc


def bag_evi_degerlendir_tarla_zeytinlik_manuel(arazi_bilgileri, yapi_bilgileri, manuel_kontrol_sonucu, bag_evi_var_mi=False):
    """
    "Tarla + Zeytinlik" arazi tipi için manuel kontrol sonucu değerlendirmesi
    - Polygon transfer verilerini işleme
    - Sadece alan kontrolü (ağaç kontrolü YOK)
    - Kesin sonuç dönme
    
    Args:
        arazi_bilgileri: Arazi detaylarını içeren sözlük
        yapi_bilgileri: Yapı detaylarını içeren sözlük  
        manuel_kontrol_sonucu: Manuel kontrol verileri
        bag_evi_var_mi: Aynı ilçede bağ evi var mı bilgisi
        
    Returns:
        dict: Kesin değerlendirme sonucunu içeren sözlük
    """
    sonuc = {
        "izin_durumu": None, 
        "ana_mesaj": None, 
        "uyari_mesaji_ozel_durum": "",
        "buyuk_ova_icerisinde": arazi_bilgileri.get("buyuk_ova_icinde", False),
        "hesaplama_tipi": "manuel_kontrol"
    }
    
    # Ailenin aynı ilçede başka bağ evi var mı kontrolü
    if bag_evi_var_mi:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = "Tarım Arazilerinde Yapılaşma Şartları Genelgesi'ne göre, her aile için aynı ilçe sınırları içerisinde sadece bir adet bağ evi izni verilebilir. Ailenizin aynı ilçede başka bir bağ evi olduğu için yeni bağ evi yapılamaz."
        return sonuc
    
    tarla_alani = arazi_bilgileri.get('tarla_alani', 0)
    zeytinlik_alani = arazi_bilgileri.get('zeytinlik_alani', 0)
    toplam_arazi = tarla_alani + zeytinlik_alani
    
    # DirectTransfer kontrolü (haritadan direkt alan ölçümü)
    if manuel_kontrol_sonucu.get('directTransfer', False):
        sonuc["izin_durumu"] = "izin_verilebilir"
        sonuc["ana_mesaj"] = f"""
        <b>MANUEL KONTROL SONUCU - TARLA + ZEYTİNİNLİK</b><br><br>
        
        <b>📋 Arazi Bilgileri:</b><br>
        • Toplam Arazi: {toplam_arazi:,} m² ({toplam_arazi/10000:.2f} hektar)<br>
        • Tarla Alanı: {tarla_alani:,} m²<br>
        • Zeytinlik Alanı: {zeytinlik_alani:,} m²<br><br>
        
        <b>✅ Manuel Kontrol Sonucu:</b><br>
        Polygon çizimi ile alan ölçümü tamamlanmıştır. Bu arazide tarla ve zeytinlik alanlarının 
        mevcut olduğu ve yeterli büyüklükte olduğu tespit edilmiştir.<br><br>
        
        <b>🏠 Bağ Evi İzni VERİLEBİLİR:</b><br>
        • Maksimum taban alanı: {BAG_EVI_MAX_TABAN_ALANI} m²<br>
        • Maksimum toplam inşaat alanı: {BAG_EVI_MAX_TOPLAM_ALAN} m²<br><br>
        
        Bu kesin bir sonuçtur, ek kontrol gerekmemektedir.
        """.replace(",", ".")
        
        return sonuc
    
    # Normal manuel kontrol değerlendirmesi
    tarla_yeterli = tarla_alani >= BAG_EVI_MIN_ARAZI_BUYUKLUGU_MUTLAK
    zeytinlik_yeterli = zeytinlik_alani >= 1
    toplam_yeterli = toplam_arazi >= 20001
    
    if tarla_yeterli and zeytinlik_yeterli:
        sonuc["izin_durumu"] = "izin_verilebilir"
        sonuc["ana_mesaj"] = f"""
        <b>MANUEL KONTROL SONUCU - TARLA + ZEYTİNİNLİK</b><br><br>
        
        <b>📋 Arazi Bilgileri:</b><br>
        • Toplam Arazi: {toplam_arazi:,} m² ({toplam_arazi/10000:.2f} hektar)<br>
        • Tarla Alanı: {tarla_alani:,} m² (min 20.000 m²) {"✅" if tarla_yeterli else "❌"}<br>
        • Zeytinlik Alanı: {zeytinlik_alani:,} m² (min 1 m²) {"✅" if zeytinlik_yeterli else "❌"}<br><br>
        
        <b>✅ Değerlendirme:</b><br>
        Manuel kontrol sonucuna göre tüm şartlar sağlanmaktadır:<br>
        • Tarla alanı yeterli ✅<br>
        • Zeytinlik alanı yeterli ✅<br><br>
        
        <b>🏠 Bağ Evi İzni VERİLEBİLİR:</b><br>
        • Maksimum taban alanı: {BAG_EVI_MAX_TABAN_ALANI} m²<br>
        • Maksimum toplam inşaat alanı: {BAG_EVI_MAX_TOPLAM_ALAN} m²
        """.replace(",", ".")
    else:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = f"""
        <b>MANUEL KONTROL SONUCU - TARLA + ZEYTİNİNLİK</b><br><br>
        
        <b>📋 Arazi Bilgileri:</b><br>
        • Toplam Arazi: {toplam_arazi:,} m² (min 20.001 m²) {"✅" if toplam_yeterli else "❌"}<br>
        • Tarla Alanı: {tarla_alani:,} m² (min 20.000 m²) {"✅" if tarla_yeterli else "❌"}<br>
        • Zeytinlik Alanı: {zeytinlik_alani:,} m² (min 1 m²) {"✅" if zeytinlik_yeterli else "❌"}<br><br>
        
        <b>❌ Değerlendirme:</b><br>
        Manuel kontrol sonucunda şartlar sağlanamamaktadır:<br>
        {"• Tarla alanı yetersiz (min 20.000 m²)<br>" if not tarla_yeterli else ""}
        {"• Zeytinlik alanı yetersiz (min 1 m²)<br>" if not zeytinlik_yeterli else ""}
        {"• Toplam alan yetersiz (min 20.001 m²)<br>" if not toplam_yeterli else ""}
        <br>Tüm şartların sağlanması gerekmektedir.
        """.replace(",", ".")
    
    return sonuc


def bag_evi_degerlendir_zeytin_dikili_varsayimsal(arazi_bilgileri, yapi_bilgileri, bag_evi_var_mi=False):
    """
    "Zeytin ağaçlı + herhangi bir dikili vasıf" arazi tipi için varsayımsal değerlendirme
    - Dikili alan kontrolü (≥5000 m²)
    - Zeytin ağacı yoğunluğu kontrolü (dekara <10 ağaç)
    - Harita kontrolü mevcut (varsayımsal sonuç verir)
    
    Args:
        arazi_bilgileri: Arazi detaylarını içeren sözlük 
            {ana_vasif, buyukluk_m2, dikili_alani, zeytin_agac_adedi, buyuk_ova_icinde}
        yapi_bilgileri: Yapı detaylarını içeren sözlük
        bag_evi_var_mi: Aynı ilçede bağ evi var mı bilgisi
        
    Returns:
        dict: Değerlendirme sonucunu içeren sözlük
    """
    sonuc = {
        "izin_durumu": None, 
        "ana_mesaj": None, 
        "uyari_mesaji_ozel_durum": "",
        "buyuk_ova_icerisinde": arazi_bilgileri.get("buyuk_ova_icinde", False),
        "hesaplama_tipi": "varsayimsal"
    }
    
    # Ailenin aynı ilçede başka bağ evi var mı kontrolü
    if bag_evi_var_mi:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = "Tarım Arazilerinde Yapılaşma Şartları Genelgesi'ne göre, her aile için aynı ilçe sınırları içerisinde sadece bir adet bağ evi izni verilebilir. Ailenizin aynı ilçede başka bir bağ evi olduğu için yeni bağ evi yapılamaz."
        return sonuc
    
    dikili_alani = arazi_bilgileri.get('dikili_alani', 0)
    zeytin_agac_adedi = arazi_bilgileri.get('zeytin_agac_adedi', 0)
    
    # Dekara zeytin ağacı yoğunluğu hesaplama (1 dekar = 1000 m²)
    dekar_sayisi = dikili_alani / 1000
    dekara_agac_adedi = zeytin_agac_adedi / dekar_sayisi if dekar_sayisi > 0 else 0
    
    # "Zeytin ağaçlı + herhangi bir dikili vasıf" kriterleri:
    # 1. Dikili alan >= 5000 m² (0.5 hektar) 
    # 2. Dekara zeytin ağacı adedi < 10 (10 veya üstü ret)
    
    dikili_yeterli = dikili_alani >= BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI
    agac_yogunlugu_uygun = dekara_agac_adedi < 10
    
    # Tüm şartların sağlanması gerekiyor
    if dikili_yeterli and agac_yogunlugu_uygun:
        sonuc["izin_durumu"] = "izin_verilebilir_varsayimsal"
        sonuc["ana_mesaj"] = f"""
        <b>VARSAYIMSAL HESAPLAMA SONUCU - ZEYTİN AĞAÇLI + DİKİLİ VASIF</b><br><br>
        
        <b>📋 Girilen Bilgiler:</b><br>
        • Dikili Alan: {dikili_alani:,} m² ({dikili_alani/10000:.2f} hektar / {dekar_sayisi:.1f} dekar)<br>
        • Zeytin Ağacı Adedi: {zeytin_agac_adedi:,} adet<br>
        • Dekara Ağaç Yoğunluğu: {dekara_agac_adedi:.1f} adet/dekar<br><br>
        
        <b>✅ Değerlendirme:</b><br>
        Girilen bilgilere göre, eğer fiili durumda:<br>
        • Dikili alanınız gerçekten {dikili_alani:,} m² ise (min {BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI:,} m²) {"✅" if dikili_yeterli else "❌"}<br>
        • Zeytin ağacı yoğunluğu dekara {dekara_agac_adedi:.1f} adet ise (max 9.9 adet/dekar) {"✅" if agac_yogunlugu_uygun else "❌"}<br><br>
        
        <b>🏠 Bağ Evi İzni:</b><br>
        Bu bilgiler doğru ise <b>bağ evi yapılabilir</b>:<br>
        • Maksimum taban alanı: {BAG_EVI_MAX_TABAN_ALANI} m²<br>
        • Maksimum toplam inşaat alanı: {BAG_EVI_MAX_TOPLAM_ALAN} m²<br><br>
        
        <b>⚠️ UYARI:</b><br>
        Bu hesaplama girdiğiniz bilgilerin doğru olduğu varsayımıyla yapılmıştır. 
        Manuel ağaç kontrolü yapmanız önerilir.
        """.replace(",", ".")
        
        sonuc["uyari_mesaji_ozel_durum"] = "Varsayımsal sonuç - Manuel kontrol önerilir."
    else:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = f"""
        <b>VARSAYIMSAL HESAPLAMA SONUCU - ZEYTİN AĞAÇLI + DİKİLİ VASIF</b><br><br>
        
        <b>📋 Girilen Bilgiler:</b><br>
        • Dikili Alan: {dikili_alani:,} m² ({dikili_alani/10000:.2f} hektar / {dekar_sayisi:.1f} dekar)<br>
        • Zeytin Ağacı Adedi: {zeytin_agac_adedi:,} adet<br>
        • Dekara Ağaç Yoğunluğu: {dekara_agac_adedi:.1f} adet/dekar<br><br>
        
        <b>❌ Değerlendirme:</b><br>
        Bağ evi şartları sağlanamamaktadır:<br>
        {"• Dikili alan yetersiz (min 5.000 m² gerekli)<br>" if not dikili_yeterli else ""}
        {"• Zeytin ağacı yoğunluğu fazla (dekara 10+ ağaç var, max 9.9 adet/dekar)<br>" if not agac_yogunlugu_uygun else ""}
        <br>Tüm şartların sağlanması gerekmektedir.
        """.replace(",", ".")
    
    return sonuc


def bag_evi_degerlendir_zeytin_dikili_manuel(arazi_bilgileri, yapi_bilgileri, manuel_kontrol_sonucu, bag_evi_var_mi=False):
    """
    "Zeytin ağaçlı + herhangi bir dikili vasıf" arazi tipi için manuel kontrol sonucu değerlendirmesi
    - Polygon transfer verilerini işleme
    - Dikili alan ve zeytin ağacı yoğunluğu kontrolü
    - Kesin sonuç dönme (varsayımsal etiket YOK)
    
    Args:
        arazi_bilgileri: Arazi detaylarını içeren sözlük
        yapi_bilgileri: Yapı detaylarını içeren sözlük  
        manuel_kontrol_sonucu: Manuel kontrol verileri
        bag_evi_var_mi: Aynı ilçede bağ evi var mı bilgisi
        
    Returns:
        dict: Kesin değerlendirme sonucunu içeren sözlük
    """
    sonuc = {
        "izin_durumu": None, 
        "ana_mesaj": None, 
        "uyari_mesaji_ozel_durum": "",
        "buyuk_ova_icerisinde": arazi_bilgileri.get("buyuk_ova_icinde", False),
        "hesaplama_tipi": "manuel_kontrol"
    }
    
    # Ailenin aynı ilçede başka bağ evi var mı kontrolü
    if bag_evi_var_mi:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = "Tarım Arazilerinde Yapılaşma Şartları Genelgesi'ne göre, her aile için aynı ilçe sınırları içerisinde sadece bir adet bağ evi izni verilebilir. Ailenizin aynı ilçede başka bir bağ evi olduğu için yeni bağ evi yapılamaz."
        return sonuc
    
    dikili_alani = arazi_bilgileri.get('dikili_alani', 0)
    zeytin_agac_adedi = arazi_bilgileri.get('zeytin_alani', 0)  # Ağaç adedi
    
    # Zeytin ağacı yoğunluğu hesaplama
    dekar_sayisi = dikili_alani / 1000.0
    if dekar_sayisi > 0:
        dekara_agac_adedi = zeytin_agac_adedi / dekar_sayisi
    else:
        dekara_agac_adedi = 0
    
    # DirectTransfer kontrolü (haritadan direkt alan ölçümü)
    if manuel_kontrol_sonucu.get('directTransfer', False):
        # Yine de şartları kontrol edelim
        dikili_yeterli = dikili_alani >= BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI
        agac_yogunlugu_uygun = dekara_agac_adedi < 10
        
        if dikili_yeterli and agac_yogunlugu_uygun:
            sonuc["izin_durumu"] = "izin_verilebilir"
            sonuc["ana_mesaj"] = f"""
            <b>MANUEL KONTROL SONUCU - ZEYTİN AĞAÇLI + DİKİLİ VASIF</b><br><br>
            
            <b>📋 Arazi Bilgileri:</b><br>
            • Dikili Alan: {dikili_alani:,} m² ({dekar_sayisi:.1f} dekar)<br>
            • Zeytin Ağacı Adedi: {zeytin_agac_adedi:,} adet<br>
            • Dekara Ağaç Yoğunluğu: {dekara_agac_adedi:.1f} adet/dekar<br><br>
            
            <b>✅ Manuel Kontrol Sonucu:</b><br>
            Polygon çizimi ile alan ölçümü tamamlanmıştır. Dikili alan yeterli ve 
            zeytin ağacı yoğunluğu uygun seviyededir.<br><br>
            
            <b>🏠 Bağ Evi İzni VERİLEBİLİR:</b><br>
            • Maksimum taban alanı: {BAG_EVI_MAX_TABAN_ALANI} m²<br>
            • Maksimum toplam inşaat alanı: {BAG_EVI_MAX_TOPLAM_ALAN} m²<br><br>
            
            Bu kesin bir sonuçtur, ek kontrol gerekmemektedir.
            """.replace(",", ".")
        else:
            sonuc["izin_durumu"] = "izin_verilemez"
            sonuc["ana_mesaj"] = f"""
            <b>MANUEL KONTROL SONUCU - ZEYTİN AĞAÇLI + DİKİLİ VASIF</b><br><br>
            
            <b>📋 Arazi Bilgileri:</b><br>
            • Dikili Alan: {dikili_alani:,} m² ({dekar_sayisi:.1f} dekar) {"✅" if dikili_yeterli else "❌"}<br>
            • Zeytin Ağacı Adedi: {zeytin_agac_adedi:,} adet<br>
            • Dekara Ağaç Yoğunluğu: {dekara_agac_adedi:.1f} adet/dekar {"✅" if agac_yogunlugu_uygun else "❌"}<br><br>
            
            <b>❌ Manuel Kontrol Sonucu:</b><br>
            Polygon çizimi ile alan ölçümü tamamlanmıştır, ancak şartlar sağlanamamaktadır.<br><br>
            
            <b>Bağ evi yapılamaz:</b><br>
            {"• Dikili alan yetersiz (min 5.000 m²)<br>" if not dikili_yeterli else ""}
            {"• Zeytin ağacı yoğunluğu fazla (dekara 10+ ağaç)<br>" if not agac_yogunlugu_uygun else ""}
            """.replace(",", ".")
        
        return sonuc
    
    # Normal manuel kontrol değerlendirmesi
    dikili_yeterli = dikili_alani >= BAG_EVI_MIN_ARAZI_BUYUKLUGU_DIKILI
    agac_yogunlugu_uygun = dekara_agac_adedi < 10
    
    if dikili_yeterli and agac_yogunlugu_uygun:
        sonuc["izin_durumu"] = "izin_verilebilir"
        sonuc["ana_mesaj"] = f"""
        <b>MANUEL KONTROL SONUCU - ZEYTİN AĞAÇLI + DİKİLİ VASIF</b><br><br>
        
        <b>📋 Arazi Bilgileri:</b><br>
        • Dikili Alan: {dikili_alani:,} m² ({dekar_sayisi:.1f} dekar) {"✅" if dikili_yeterli else "❌"}<br>
        • Zeytin Ağacı Adedi: {zeytin_agac_adedi:,} adet<br>
        • Dekara Ağaç Yoğunluğu: {dekara_agac_adedi:.1f} adet/dekar {"✅" if agac_yogunlugu_uygun else "❌"}<br><br>
        
        <b>✅ Değerlendirme:</b><br>
        Manuel kontrol sonucuna göre tüm şartlar sağlanmaktadır:<br>
        • Dikili alan yeterli (min 5.000 m²) ✅<br>
        • Zeytin ağacı yoğunluğu uygun (dekara 10'dan az) ✅<br><br>
        
        <b>🏠 Bağ Evi İzni VERİLEBİLİR:</b><br>
        • Maksimum taban alanı: {BAG_EVI_MAX_TABAN_ALANI} m²<br>
        • Maksimum toplam inşaat alanı: {BAG_EVI_MAX_TOPLAM_ALAN} m²
        """.replace(",", ".")
    else:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = f"""
        <b>MANUEL KONTROL SONUCU - ZEYTİN AĞAÇLI + DİKİLİ VASIF</b><br><br>
        
        <b>📋 Arazi Bilgileri:</b><br>
        • Dikili Alan: {dikili_alani:,} m² ({dekar_sayisi:.1f} dekar) {"✅" if dikili_yeterli else "❌"}<br>
        • Zeytin Ağacı Adedi: {zeytin_agac_adedi:,} adet<br>
        • Dekara Ağaç Yoğunluğu: {dekara_agac_adedi:.1f} adet/dekar {"✅" if agac_yogunlugu_uygun else "❌"}<br><br>
        
        <b>❌ Değerlendirme:</b><br>
        Manuel kontrol sonucunda şartlar sağlanamamaktadır:<br>
        {"• Dikili alan yetersiz (min 5.000 m²)<br>" if not dikili_yeterli else ""}
        {"• Zeytin ağacı yoğunluğu fazla (dekara 10+ ağaç, max 9.9 adet/dekar)<br>" if not agac_yogunlugu_uygun else ""}
        <br><b>Bağ evi yapılamaz.</b>
        """.replace(",", ".")
    
    return sonuc


# ...existing code...
    """
    "Zeytin ağaçlı + tarla" arazi tipi için varsayımsal değerlendirme
    - Tarla alanı kontrolü (≥20000 m²)
    - Zeytin ağacı yoğunluğu kontrolü (dekara <10 ağaç)
    - Kesin sonuç (varsayımsal etiketi YOK)
    
    Args:
        arazi_bilgileri: Arazi detaylarını içeren sözlük 
            {ana_vasif, buyukluk_m2, tarla_alani, zeytin_alani, buyuk_ova_icinde}
        yapi_bilgileri: Yapı detaylarını içeren sözlük
        bag_evi_var_mi: Aynı ilçede bağ evi var mı bilgisi
        
    Returns:
        dict: Değerlendirme sonucunu içeren sözlük
    """
    sonuc = {
        "izin_durumu": None, 
        "ana_mesaj": None, 
        "uyari_mesaji_ozel_durum": "",
        "buyuk_ova_icerisinde": arazi_bilgileri.get("buyuk_ova_icinde", False),
        "hesaplama_tipi": "kesin"
    }
    
    # Ailenin aynı ilçede başka bağ evi var mı kontrolü
    if bag_evi_var_mi:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = "Tarım Arazilerinde Yapılaşma Şartları Genelgesi'ne göre, her aile için aynı ilçe sınırları içerisinde sadece bir adet bağ evi izni verilebilir. Ailenizin aynı ilçede başka bir bağ evi olduğu için yeni bağ evi yapılamaz."
        return sonuc
    
    tarla_alani = arazi_bilgileri.get('tarla_alani', 0)
    zeytin_alani = arazi_bilgileri.get('zeytin_alani', 0)  # Ağaç adedi
    
    # Zeytin ağacı yoğunluğu hesaplama
    dekar_sayisi = tarla_alani / 1000.0
    if dekar_sayisi > 0:
        dekara_agac_adedi = zeytin_alani / dekar_sayisi
    else:
        dekara_agac_adedi = 0
    
    # "Zeytin ağaçlı + tarla" kriterleri:
    # 1. Tarla alanı >= 20000 m² (2.0 hektar)
    # 2. Zeytin ağacı yoğunluğu < 10 ağaç/dekar
    
    tarla_yeterli = tarla_alani >= 20000
    agac_yogunlugu_uygun = dekara_agac_adedi < 10
    
    # Her iki şartın da sağlanması gerekiyor
    if tarla_yeterli and agac_yogunlugu_uygun:
        sonuc["izin_durumu"] = "izin_verilebilir"
        sonuc["ana_mesaj"] = f"""
        <b>HESAPLAMA SONUCU - ZEYTİN AĞAÇLI + TARLA</b><br><br>
        
        <b>📋 Girilen Bilgiler:</b><br>
        • Tarla Alanı: {tarla_alani:,} m² ({dekar_sayisi:.1f} dekar)<br>
        • Zeytin Ağacı Adedi: {zeytin_alani:,} adet<br>
        • Dekara Ağaç Yoğunluğu: {dekara_agac_adedi:.1f} adet/dekar<br><br>
        
        <b>✅ Değerlendirme:</b><br>
        Girilen bilgilere göre tüm şartlar sağlanmaktadır:<br>
        • Tarla alanı yeterli (min 20.000 m²) ✅<br>
        • Zeytin ağacı yoğunluğu uygun (dekara 10'dan az) ✅<br><br>
        
        <b>🏠 Bağ Evi İzni VERİLEBİLİR:</b><br>
        • Maksimum taban alanı: {BAG_EVI_MAX_TABAN_ALANI} m²<br>
        • Maksimum toplam inşaat alanı: {BAG_EVI_MAX_TOPLAM_ALAN} m²
        """.replace(",", ".")
    else:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = f"""
        <b>HESAPLAMA SONUCU - ZEYTİN AĞAÇLI + TARLA</b><br><br>
        
        <b>📋 Girilen Bilgiler:</b><br>
        • Tarla Alanı: {tarla_alani:,} m² ({dekar_sayisi:.1f} dekar) {"✅" if tarla_yeterli else "❌"}<br>
        • Zeytin Ağacı Adedi: {zeytin_alani:,} adet<br>
        • Dekara Ağaç Yoğunluğu: {dekara_agac_adedi:.1f} adet/dekar {"✅" if agac_yogunlugu_uygun else "❌"}<br><br>
        
        <b>❌ Değerlendirme:</b><br>
        Girilen bilgilere göre bağ evi şartları sağlanamamaktadır:<br>
        {"• Tarla alanı yetersiz (min 20.000 m²)<br>" if not tarla_yeterli else ""}
        {"• Zeytin ağacı yoğunluğu fazla (dekara 10+ ağaç, max 9.9 adet/dekar)<br>" if not agac_yogunlugu_uygun else ""}
        <br><b>Bağ evi yapılamaz.</b>
        """.replace(",", ".")
    
    return sonuc


def bag_evi_degerlendir_zeytin_tarla_manuel(arazi_bilgileri, yapi_bilgileri, manuel_kontrol_sonucu, bag_evi_var_mi=False):
    """
    "Zeytin ağaçlı + tarla" arazi tipi için manuel kontrol sonucu değerlendirmesi
    - Polygon transfer verilerini işleme
    - Tarla alanı ve zeytin ağacı yoğunluğu kontrolü
    - Kesin sonuç dönme
    
    Args:
        arazi_bilgileri: Arazi detaylarını içeren sözlük
        yapi_bilgileri: Yapı detaylarını içeren sözlük  
        manuel_kontrol_sonucu: Manuel kontrol verileri
        bag_evi_var_mi: Aynı ilçede bağ evi var mı bilgisi
        
    Returns:
        dict: Kesin değerlendirme sonucunu içeren sözlük
    """
    sonuc = {
        "izin_durumu": None, 
        "ana_mesaj": None, 
        "uyari_mesaji_ozel_durum": "",
        "buyuk_ova_icerisinde": arazi_bilgileri.get("buyuk_ova_icinde", False),
        "hesaplama_tipi": "manuel_kontrol"
    }
    
    # Ailenin aynı ilçede başka bağ evi var mı kontrolü
    if bag_evi_var_mi:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = "Tarım Arazilerinde Yapılaşma Şartları Genelgesi'ne göre, her aile için aynı ilçe sınırları içerisinde sadece bir adet bağ evi izni verilebilir. Ailenizin aynı ilçede başka bir bağ evi olduğu için yeni bağ evi yapılamaz."
        return sonuc
    
    tarla_alani = arazi_bilgileri.get('tarla_alani', 0)
    zeytin_alani = arazi_bilgileri.get('zeytin_alani', 0)  # Ağaç adedi
    
    # Zeytin ağacı yoğunluğu hesaplama
    dekar_sayisi = tarla_alani / 1000.0
    if dekar_sayisi > 0:
        dekara_agac_adedi = zeytin_alani / dekar_sayisi
    else:
        dekara_agac_adedi = 0
    
    # DirectTransfer kontrolü (haritadan direkt alan ölçümü)
    if manuel_kontrol_sonucu.get('directTransfer', False):
        # Yine de şartları kontrol edelim
        tarla_yeterli = tarla_alani >= 20000
        agac_yogunlugu_uygun = dekara_agac_adedi < 10
        
        if tarla_yeterli and agac_yogunlugu_uygun:
            sonuc["izin_durumu"] = "izin_verilebilir"
            sonuc["ana_mesaj"] = f"""
            <b>MANUEL KONTROL SONUCU - ZEYTİN AĞAÇLI + TARLA</b><br><br>
            
            <b>📋 Arazi Bilgileri:</b><br>
            • Tarla Alanı: {tarla_alani:,} m² ({dekar_sayisi:.1f} dekar)<br>
            • Zeytin Ağacı Adedi: {zeytin_alani:,} adet<br>
            • Dekara Ağaç Yoğunluğu: {dekara_agac_adedi:.1f} adet/dekar<br><br>
            
            <b>✅ Manuel Kontrol Sonucu:</b><br>
            Polygon çizimi ile alan ölçümü tamamlanmıştır. Tarla alanı yeterli ve 
            zeytin ağacı yoğunluğu uygun seviyededir.<br><br>
            
            <b>🏠 Bağ Evi İzni VERİLEBİLİR:</b><br>
            • Maksimum taban alanı: {BAG_EVI_MAX_TABAN_ALANI} m²<br>
            • Maksimum toplam inşaat alanı: {BAG_EVI_MAX_TOPLAM_ALAN} m²<br><br>
            
            Bu kesin bir sonuçtur, ek kontrol gerekmemektedir.
            """.replace(",", ".")
        else:
            sonuc["izin_durumu"] = "izin_verilemez"
            sonuc["ana_mesaj"] = f"""
            <b>MANUEL KONTROL SONUCU - ZEYTİN AĞAÇLI + TARLA</b><br><br>
            
            <b>📋 Arazi Bilgileri:</b><br>
            • Tarla Alanı: {tarla_alani:,} m² ({dekar_sayisi:.1f} dekar) {"✅" if tarla_yeterli else "❌"}<br>
            • Zeytin Ağacı Adedi: {zeytin_alani:,} adet<br>
            • Dekara Ağaç Yoğunluğu: {dekara_agac_adedi:.1f} adet/dekar {"✅" if agac_yogunlugu_uygun else "❌"}<br><br>
            
            <b>❌ Manuel Kontrol Sonucu:</b><br>
            Polygon çizimi ile alan ölçümü tamamlanmıştır, ancak şartlar sağlanamamaktadır.<br><br>
            
            <b>Bağ evi yapılamaz:</b><br>
            {"• Tarla alanı yetersiz (min 20.000 m²)<br>" if not tarla_yeterli else ""}
            {"• Zeytin ağacı yoğunluğu fazla (dekara 10+ ağaç)<br>" if not agac_yogunlugu_uygun else ""}
            """.replace(",", ".")
        
        return sonuc
    
    # Normal manuel kontrol değerlendirmesi
    tarla_yeterli = tarla_alani >= 20000
    agac_yogunlugu_uygun = dekara_agac_adedi < 10
    
    if tarla_yeterli and agac_yogunlugu_uygun:
        sonuc["izin_durumu"] = "izin_verilebilir"
        sonuc["ana_mesaj"] = f"""
        <b>MANUEL KONTROL SONUCU - ZEYTİN AĞAÇLI + TARLA</b><br><br>
        
        <b>📋 Arazi Bilgileri:</b><br>
        • Tarla Alanı: {tarla_alani:,} m² ({dekar_sayisi:.1f} dekar) {"✅" if tarla_yeterli else "❌"}<br>
        • Zeytin Ağacı Adedi: {zeytin_alani:,} adet<br>
        • Dekara Ağaç Yoğunluğu: {dekara_agac_adedi:.1f} adet/dekar {"✅" if agac_yogunlugu_uygun else "❌"}<br><br>
        
        <b>✅ Değerlendirme:</b><br>
        Manuel kontrol sonucuna göre tüm şartlar sağlanmaktadır:<br>
        • Tarla alanı yeterli (min 20.000 m²) ✅<br>
        • Zeytin ağacı yoğunluğu uygun (dekara 10'dan az) ✅<br><br>
        
        <b>🏠 Bağ Evi İzni VERİLEBİLİR:</b><br>
        • Maksimum taban alanı: {BAG_EVI_MAX_TABAN_ALANI} m²<br>
        • Maksimum toplam inşaat alanı: {BAG_EVI_MAX_TOPLAM_ALAN} m²
        """.replace(",", ".")
    else:
        sonuc["izin_durumu"] = "izin_verilemez"
        sonuc["ana_mesaj"] = f"""
        <b>MANUEL KONTROL SONUCU - ZEYTİN AĞAÇLI + TARLA</b><br><br>
        
        <b>📋 Arazi Bilgileri:</b><br>
        • Tarla Alanı: {tarla_alani:,} m² ({dekar_sayisi:.1f} dekar) {"✅" if tarla_yeterli else "❌"}<br>
        • Zeytin Ağacı Adedi: {zeytin_alani:,} adet<br>
        • Dekara Ağaç Yoğunluğu: {dekara_agac_adedi:.1f} adet/dekar {"✅" if agac_yogunlugu_uygun else "❌"}<br><br>
        
        <b>❌ Değerlendirme:</b><br>
        Manuel kontrol sonucunda şartlar sağlanamamaktadır:<br>
        {"• Tarla alanı yetersiz (min 20.000 m²)<br>" if not tarla_yeterli else ""}
        {"• Zeytin ağacı yoğunluğu fazla (dekara 10+ ağaç, max 9.9 adet/dekar)<br>" if not agac_yogunlugu_uygun else ""}
        <br><b>Bağ evi yapılamaz.</b>
        """.replace(",", ".")
    
    return sonuc
