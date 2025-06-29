"""
Bu modül, tüm arazi vasıfları ve yapı türleri için kullanılan sabit değerleri içerir.
"""

# Arazi tipleri tanımı (eski projeden taşınan)
ARAZI_TIPLERI = [
    {"id": 1, "ad": "Tarla + herhangi bir dikili vasıflı"},
    {"id": 2, "ad": "Dikili vasıflı"},
    {"id": 3, "ad": "Tarla + Zeytinlik"},
    {"id": 4, "ad": "Zeytin ağaçlı + tarla"},
    {"id": 5, "ad": "Zeytin ağaçlı + herhangi bir dikili vasıf"},
    {"id": 6, "ad": "… Adetli Zeytin Ağacı bulunan tarla"},
    {"id": 7, "ad": "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf"},
    {"id": 8, "ad": "Zeytinlik"},
    {"id": 9, "ad": "Ham toprak, taşlık, kıraç, palamutluk, koruluk gibi diğer vasıflı"},
    {"id": 10, "ad": "Tarla"},
    {"id": 11, "ad": "Sera"},
]

# Yapı türleri tanımı (eski projeden taşınan - ID ile birlikte)
YAPI_TURLERI = [
    {"id": 1, "ad": "Solucan ve solucan gübresi üretim tesisi"}, 
    {"id": 2, "ad": "Mantar üretim tesisi"}, 
    {"id": 3, "ad": "Sera"},
    {"id": 4, "ad": "Arıcılık tesisleri"},
    {"id": 5, "ad": "Hububat ve yem depolama silosu"},
    {"id": 6, "ad": "Tarımsal amaçlı depo"},
    {"id": 7, "ad": "Lisanslı depolar"},
    {"id": 8, "ad": "Tarımsal ürün yıkama tesisi"},
    {"id": 9, "ad": "Hububat, çeltik, ayçiçeği kurutma tesisi"},
    {"id": 10, "ad": "Açıkta meyve/sebze kurutma alanı"},
    {"id": 11, "ad": "Zeytinyağı fabrikası"},
    {"id": 12, "ad": "Su depolama"},
    {"id": 13, "ad": "Su kuyuları"},
    {"id": 14, "ad": "Bağ evi"},
    {"id": 15, "ad": "Su depolama ve pompaj sistemi"},
    {"id": 28, "ad": "Zeytinyağı üretim tesisi"},
    {"id": 16, "ad": "Soğuk hava deposu"},
    {"id": 17, "ad": "Süt Sığırcılığı Tesisi"},
    {"id": 18, "ad": "Ağıl (küçükbaş hayvan barınağı)"},
    {"id": 19, "ad": "Kümes (yumurtacı tavuk)"},
    {"id": 20, "ad": "Kümes (etçi tavuk)"},
    {"id": 21, "ad": "Kümes (gezen tavuk)"},
    {"id": 22, "ad": "Kümes (hindi)"},
    {"id": 23, "ad": "Kaz Ördek çiftliği"},
    {"id": 24, "ad": "Hara (at üretimi/yetiştiriciliği tesisi)"},
    {"id": 25, "ad": "İpek böcekçiliği tesisi"}, 
    {"id": 26, "ad": "Evcil hayvan ve bilimsel araştırma hayvanı üretim tesisi"},
    {"id": 27, "ad": "Besi Sığırcılığı Tesisi"},
]

# Arazi tipi ID'lerinden adlarına mapping
ARAZI_TIPI_ID_TO_AD = {arazi["id"]: arazi["ad"] for arazi in ARAZI_TIPLERI}

# Arazi tipi adlarından ID'lere mapping
ARAZI_TIPI_AD_TO_ID = {arazi["ad"]: arazi["id"] for arazi in ARAZI_TIPLERI}

# Yapı türü ID'lerinden adlarına mapping
YAPI_TURU_ID_TO_AD = {yapi["id"]: yapi["ad"] for yapi in YAPI_TURLERI}

# Yapı türü adlarından ID'lere mapping
YAPI_TURU_AD_TO_ID = {yapi["ad"]: yapi["id"] for yapi in YAPI_TURLERI}

# Sera için sabitler
SERA_VARSAYILAN_ALAN_ORANI = 0.8

# Emsal oranları
EMSAL_ORANI_MARJINAL = 0.20  # Marjinal tarım arazileri için %20
EMSAL_ORANI_MUTLAK_DIKILI = 0.05  # Mutlak tarım arazisi, dikili tarım arazisi ve özel ürün arazileri için %5

# Genel yapı türleri listesi - YAPI_TURLERI'nden dinamik olarak oluşturulan
GENEL_YAPI_TURLERI_LISTESI = [yapi["ad"] for yapi in YAPI_TURLERI]
