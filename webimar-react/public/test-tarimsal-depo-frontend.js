// Tarımsal Depo Frontend Test
console.log('🏬 Tarımsal Depo Frontend Entegrasyon Testi');

// Test verileri (curl testiyle aynı)
const testData = {
    alan_m2: 15000,  
    arazi_vasfi: 'tarım'
};

console.log('📊 Test Verileri:', testData);

// React frontend API'sini test et
async function testTarimsalDepoFrontend() {
    try {
        // React frontend tarayıcıda açıldığında bu script console'da çalıştırılacak
        console.log('🔄 React Frontend API Test Başlıyor...');
        
        // Frontend API service'ini kullan
        if (window.apiService && window.apiService.calculations && window.apiService.calculations.tarimsal_depo) {
            console.log('✅ API Service bulundu');
            
            const result = await window.apiService.calculations.tarimsal_depo(testData);
            console.log('📦 Frontend API Result:', result);
            
            if (result.success) {
                console.log('✅ Frontend test BAŞARILI');
                console.log('🏬 Sonuç:', result.sonuc);
                console.log('📊 İzin Durumu:', result.izin_durumu);
                console.log('💾 Depolama Kapasitesi:', result.detaylar?.depolama_kapasitesi_ton);
                console.log('🏗️ Maksimum İnşaat Alanı:', result.detaylar?.maksimum_insaat_alani_m2);
            } else {
                console.log('❌ Frontend test BAŞARISIZ');
                console.log('🔍 Hata:', result.error || result.message);
            }
        } else {
            console.log('❌ API Service bulunamadı, global olarak tanımlanmamış');
            console.log('🔍 window.apiService:', window.apiService);
        }
    } catch (error) {
        console.error('💥 Frontend Test Hatası:', error);
    }
}

// Global scope'a ekle
window.testTarimsalDepoFrontend = testTarimsalDepoFrontend;

console.log('💡 Tarayıcı console\'da çalıştırmak için: testTarimsalDepoFrontend()');
