import unittest
from webimar.calculations.tarimsal_yapilar.kanatli import (
    KanatliHesaplama,
    yumurtaci_tavuk_degerlendir,
    etci_tavuk_degerlendir,
    gezen_tavuk_degerlendir,
    hindi_degerlendir,
    kaz_ordek_degerlendir,
    DEFAULT_EMSAL_ORANI
)

class TestKanatliDinamikEmsal(unittest.TestCase):

    def test_yumurtaci_tavuk_varsayilan_emsal(self):
        # Örnek veri, gerçekçi değerlerle güncellenmeli
        data = {"hayvan_sayisi": 1000, "parsel_alani": 10000}
        sonuc = yumurtaci_tavuk_degerlendir(data)
        self.assertIn("izin_verilebilir", sonuc["durum"])
        self.assertTrue(sonuc["maksimum_yapi_alani"] > 0)
        # Varsayılan emsal oranı ile hesaplandığını kontrol et (örnek)
        # Bu kısım KanatliHesaplama içindeki mantığa göre detaylandırılmalı
        # beklenen_alan = data["parsel_alani"] * DEFAULT_EMSAL_ORANI * KanatliHesaplama.YUMURTACI_TAVUK_KATSAYI
        # self.assertAlmostEqual(sonuc["maksimum_yapi_alani"], beklenen_alan, places=2)


    def test_yumurtaci_tavuk_ozel_emsal(self):
        data = {"hayvan_sayisi": 1000, "parsel_alani": 10000}
        ozel_emsal = 0.10
        sonuc = yumurtaci_tavuk_degerlendir(data, emsal_orani=ozel_emsal)
        self.assertIn("izin_verilebilir", sonuc["durum"])
        self.assertTrue(sonuc["maksimum_yapi_alani"] > 0)
        # Özel emsal oranı ile hesaplandığını kontrol et (örnek)
        # beklenen_alan = data["parsel_alani"] * ozel_emsal * KanatliHesaplama.YUMURTACI_TAVUK_KATSAYI
        # self.assertAlmostEqual(sonuc["maksimum_yapi_alani"], beklenen_alan, places=2)

    def test_etci_tavuk_varsayilan_emsal(self):
        data = {"hayvan_sayisi": 5000, "parsel_alani": 20000}
        sonuc = etci_tavuk_degerlendir(data)
        self.assertIn("izin_verilebilir", sonuc["durum"])
        # Hesaplama detaylarına göre assert'ler eklenebilir

    def test_etci_tavuk_ozel_emsal(self):
        data = {"hayvan_sayisi": 5000, "parsel_alani": 20000}
        ozel_emsal = 0.15
        sonuc = etci_tavuk_degerlendir(data, emsal_orani=ozel_emsal)
        self.assertIn("izin_verilebilir", sonuc["durum"])
        # Hesaplama detaylarına göre assert'ler eklenebilir

    # Diğer kanatlı türleri (gezen_tavuk, hindi, kaz_ordek) için de benzer testler eklenebilir.
    # Örneğin:
    def test_gezen_tavuk_varsayilan_emsal(self):
        data = {"hayvan_sayisi": 500, "parsel_alani": 15000, "gezen_tavuk_sistemi": True} # Varsayım
        sonuc = gezen_tavuk_degerlendir(data)
        self.assertIn("izin_verilebilir", sonuc["durum"])

    def test_hindi_ozel_emsal(self):
        data = {"hayvan_sayisi": 200, "parsel_alani": 10000}
        ozel_emsal = 0.05
        sonuc = hindi_degerlendir(data, emsal_orani=ozel_emsal)
        self.assertIn("izin_verilebilir", sonuc["durum"])

    def test_kaz_ordek_varsayilan_emsal(self):
        data = {"hayvan_sayisi": 100, "parsel_alani": 5000}
        sonuc = kaz_ordek_degerlendir(data)
        self.assertIn("izin_verilebilir", sonuc["durum"])

if __name__ == '''__main__''':
    unittest.main()
