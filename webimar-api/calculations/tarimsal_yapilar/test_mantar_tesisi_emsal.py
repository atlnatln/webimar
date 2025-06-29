import unittest
from calculations.tarimsal_yapilar.mantar_tesisi import MantarTesisiHesaplayici

class TestMantarTesisiEmsal(unittest.TestCase):
    def test_marjinal_emsal_20(self):
        hesap = MantarTesisiHesaplayici(emsal_orani=0.20)
        arazi = 5000
        sonuc = hesap.analiz_et(arazi)
        self.assertEqual(sonuc['emsal_m2'], arazi * 0.20)
        self.assertLessEqual(sonuc['toplam_yapi_alani_m2'], sonuc['emsal_m2'])
        self.assertEqual(sonuc['izin_durumu'], 'izin_verilebilir')

    def test_mutlak_dikili_emsal_5(self):
        hesap = MantarTesisiHesaplayici(emsal_orani=0.05)
        arazi = 20000
        sonuc = hesap.analiz_et(arazi)
        self.assertEqual(sonuc['emsal_m2'], arazi * 0.05)
        self.assertLessEqual(sonuc['toplam_yapi_alani_m2'], sonuc['emsal_m2'])
        self.assertEqual(sonuc['izin_durumu'], 'izin_verilebilir')

    def test_emsal_kapasite_optimizasyonu(self):
        hesap = MantarTesisiHesaplayici(emsal_orani=0.05)
        arazi = 20000
        sonuc = hesap.analiz_et(arazi)
        # Emsal hakkı ile kapasite optimize edilmeli, alan aşılmamalı
        self.assertLessEqual(sonuc['toplam_yapi_alani_m2'], sonuc['emsal_m2'])
        self.assertGreater(sonuc['kapasite_kg_gun'], 0)

    def test_yetersiz_arazi(self):
        hesap = MantarTesisiHesaplayici(emsal_orani=0.20)
        arazi = 100
        sonuc = hesap.analiz_et(arazi)
        self.assertEqual(sonuc['izin_durumu'], 'izin_verilemez')
        self.assertEqual(sonuc['kapasite_kg_gun'], 0)

if __name__ == '__main__':
    unittest.main()
