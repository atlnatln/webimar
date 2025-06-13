// BROWSER CONSOLE'DA ÇALIŞTIRIN
// http://localhost:3000/bag-evi sayfasında F12 -> Console

console.log('🫒 Zeytin Ağaçlı + Tarla - Hızlı Test');

// 1. API servisi kontrolü
if (window.apiService && window.apiService.calculations && window.apiService.calculations.bag_evi) {
    console.log('✅ API service mevcut');
    
    // Test verisi
    const testData = {
        alan_m2: 25000,
        arazi_vasfi: 'Zeytin ağaçlı + tarla',
        tarla_alani: 25000,
        zeytin_alani: 150  // 150 ağaç = 6 ağaç/dekar
    };
    
    console.log('📊 Test verisi:', testData);
    
    // API testi
    window.apiService.calculations.bag_evi(testData)
        .then(result => {
            console.log('🎯 API Sonucu:', result);
            
            if (result.success) {
                console.log('✅ Backend başarılı');
                console.log('📈 İzin Durumu:', result.data?.izin_durumu);
                console.log('🔄 Hesaplama Tipi:', result.data?.hesaplama_tipi);
                
                // Varsayımsal kontrol
                const message = result.data?.ana_mesaj || '';
                if (message.includes('VARSAYIMSAL') || message.includes('varsayımsal')) {
                    console.warn('⚠️ Hala varsayımsal mesaj var');
                } else {
                    console.log('✅ Varsayımsal etiket yok');
                }
                
                // Manuel kontrol önerisi kontrol
                const uyari = result.data?.uyari_mesaji_ozel_durum || '';
                if (uyari.includes('önerilir') || uyari.includes('Manuel')) {
                    console.warn('⚠️ Hala manuel kontrol önerisi var');
                } else {
                    console.log('✅ Manuel kontrol önerisi yok');
                }
            } else {
                console.error('❌ Backend hatası:', result.error);
            }
        })
        .catch(error => {
            console.error('❌ API Error:', error);
        });
} else {
    console.error('❌ API service bulunamadı');
    console.log('🔍 Available:', window.apiService?.calculations ? Object.keys(window.apiService.calculations) : 'none');
}

// 2. Form kontrolü (eğer sayfada varsa)
setTimeout(() => {
    const araziSelect = document.querySelector('select[name="arazi_vasfi"]');
    if (araziSelect) {
        console.log('📝 Form elementi bulundu');
        
        // Seçeneklerin varlığını kontrol et
        const options = Array.from(araziSelect.options).map(o => o.value);
        console.log('📋 Mevcut seçenekler:', options);
        
        if (options.includes('Zeytin ağaçlı + tarla')) {
            console.log('✅ "Zeytin ağaçlı + tarla" seçeneği mevcut');
        } else {
            console.error('❌ "Zeytin ağaçlı + tarla" seçeneği yok');
        }
    } else {
        console.log('ℹ️ Form elementi bulunamadı (sayfa yüklenmiyor olabilir)');
    }
}, 2000);
