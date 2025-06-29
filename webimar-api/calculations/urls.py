from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='calculations_health'),
    
    # Constants endpoints
    path('arazi-tipleri/', views.get_arazi_tipleri, name='get_arazi_tipleri'),
    path('yapi-turleri/', views.get_yapi_turleri, name='get_yapi_turleri'),
    
    # Constants.py YAPI_TURU_ID_MAPPING'e göre 27 yapı türü endpoints
    
    # ID: 1-4 - Özel Üretim Tesisleri
    path('solucan-tesisi/', views.calculate_solucan_tesisi, name='calculate_solucan_tesisi'),  # ID: 1
    path('mantar-tesisi/', views.calculate_mantar_tesisi, name='calculate_mantar_tesisi'),    # ID: 2
    path('sera/', views.calculate_sera, name='calculate_sera'),                              # ID: 3
    path('aricilik/', views.calculate_aricilik, name='calculate_aricilik'),                  # ID: 4
    
    # ID: 5-16 - Depolama ve İşleme Tesisleri
    path('hububat-silo/', views.calculate_hububat_silo, name='calculate_hububat_silo'),      # ID: 5
    path('tarimsal-depo/', views.calculate_tarimsal_amacli_depo, name='calculate_tarimsal_amacli_depo'), # ID: 6
    path('lisansli-depo/', views.calculate_lisansli_depo, name='calculate_lisansli_depo'),   # ID: 7
    path('yikama-tesisi/', views.calculate_yikama_tesisi, name='calculate_yikama_tesisi'),   # ID: 8
    path('kurutma-tesisi/', views.calculate_kurutma_tesisi, name='calculate_kurutma_tesisi'), # ID: 9
    path('meyve-sebze-kurutma/', views.calculate_meyve_sebze_kurutma, name='calculate_meyve_sebze_kurutma'), # ID: 10
    path('zeytinyagi-fabrikasi/', views.calculate_zeytinyagi_fabrikasi, name='calculate_zeytinyagi_fabrikasi'), # ID: 11
    path('su-depolama/', views.calculate_su_depolama, name='calculate_su_depolama'),         # ID: 12
    path('su-kuyulari/', views.calculate_su_kuyulari, name='calculate_su_kuyulari'),         # ID: 13
    path('bag-evi/', views.calculate_bag_evi, name='calculate_bag_evi'),                     # ID: 14
    path('zeytinyagi-uretim-tesisi/', views.calculate_zeytinyagi_uretim_tesisi, name='calculate_zeytinyagi_uretim_tesisi'), # ID: 15
    path('soguk-hava-deposu/', views.calculate_soguk_hava_deposu, name='calculate_soguk_hava_deposu'), # ID: 16
    
    # ID: 17-27 - Hayvancılık Tesisleri
    path('sut-sigirciligi/', views.calculate_sut_sigirciligi, name='calculate_sut_sigirciligi'), # ID: 17
    path('agil-kucukbas/', views.calculate_agil_kucukbas, name='calculate_agil_kucukbas'),     # ID: 18
    # Kanatlı tesisler
    path('kumes-yumurtaci/', views.calculate_kumes_yumurtaci, name='calculate_kumes_yumurtaci'),  # ID: 19
    path('kumes-etci/', views.calculate_kumes_etci, name='calculate_kumes_etci'),                 # ID: 20
    path('kumes-gezen/', views.calculate_kumes_gezen, name='calculate_kumes_gezen'),             # ID: 21
    path('kumes-hindi/', views.calculate_kumes_hindi, name='calculate_kumes_hindi'),             # ID: 22
    path('kaz-ordek/', views.calculate_kaz_ordek, name='calculate_kaz_ordek'),                   # ID: 23
    path('hara/', views.calculate_hara, name='calculate_hara'),                                 # ID: 24
    path('ipek-bocekciligi/', views.calculate_ipek_bocekciligi, name='calculate_ipek_bocekciligi'), # ID: 25
    path('evcil-hayvan/', views.calculate_evcil_hayvan, name='calculate_evcil_hayvan'),         # ID: 26
    path('besi-sigirciligi/', views.calculate_besi_sigirciligi, name='calculate_besi_sigirciligi'), # ID: 27
    
    # Static dosya servisleri
    path('static/yonetmelikler/', views.get_yonetmelikler, name='get_yonetmelikler'),
    path('static/kml-files/', views.get_kml_files, name='get_kml_files'),
    
    # Kullanıcı hesaplama geçmişi
    path('history/', views.calculation_history, name='calculation_history'),
]