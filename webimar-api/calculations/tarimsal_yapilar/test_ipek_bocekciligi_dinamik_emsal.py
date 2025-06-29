import unittest
from webimar.calculations.tarimsal_yapilar.ipek_bocekciligi import (
    hesapla_ipek_bocekciligi_kurallari,
    DEFAULT_EMSAL_ORANI
)

class TestIpekBocekciligiDinamikEmsal(unittest.TestCase):

    def test_varsayilan_emsal_orani(self):
        # Örnek veri, gerçekçi değerlerle güncellenmeli
        data = {
            "parsel_alani": 1000,
            "ipek_bocegi_yetistiriciligi_yapiliyor_mu": True,
            "dut_agaci_sayisi": 50 # Örnek bir parametre, modülün ihtiyaçlarına göre ayarlanmalı
        }
        sonuc = hesapla_ipek_bocekciligi_kurallari(data)
        self.assertIn("izin_verilebilir", sonuc["durum"])
        self.assertTrue(sonuc["maksimum_yapi_alani"] > 0)
        # Varsayılan emsal ile hesaplandığını doğrula (örnek)
        # Bu kısım ipek_bocekciligi_kurali içindeki mantığa göre detaylandırılmalı
        # Örneğin, eğer direkt parsel alanı * emsal ise:
        # beklenen_alan = data["parsel_alani"] * DEFAULT_EMSAL_ORANI
        # self.assertAlmostEqual(sonuc["maksimum_yapi_alani"], beklenen_alan, places=2)

    def test_ozel_emsal_orani(self):
        data = {
            "parsel_alani": 1000,
            "ipek_bocegi_yetistiriciligi_yapiliyor_mu": True,
            "dut_agaci_sayisi": 50
        }
        ozel_emsal = 0.10
        sonuc = hesapla_ipek_bocekciligi_kurallari(data, emsal_orani=ozel_emsal)
        self.assertIn("izin_verilebilir", sonuc["durum"])
        self.assertTrue(sonuc["maksimum_yapi_alani"] > 0)
        # Özel emsal ile hesaplandığını doğrula (örnek)
        # beklenen_alan = data["parsel_alani"] * ozel_emsal
        # self.assertAlmostEqual(sonuc["maksimum_yapi_alani"], beklenen_alan, places=2)

    def test_yapilmiyor_durumu(self):
        data = {
            "parsel_alani": 1000,
            "ipek_bocegi_yetistiriciligi_yapiliyor_mu": False,
            "dut_agaci_sayisi": 0
        }
        sonuc = hesapla_ipek_bocekciligi_kurallari(data)
        self.assertIn("tesis_yapilamaz", sonuc["durum"]) # veya uygun bir "yapılamaz" durumu

if __name__ == '''__main__''':
    unittest.main()
