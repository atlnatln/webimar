// Test different scenario for hububat silo (Senaryo 4 - Proje Uygundur)
const testData = {
    alan_m2: 10000,     // Daha büyük arazi
    silo_taban_alani_m2: 800,   // Daha küçük silo
    arazi_vasfi: "tarım"
};

console.log('🌾 Hububat Silo API Test - Senaryo 4 (Proje Uygundur)');
console.log('📤 Test Data:', testData);

fetch('http://127.0.0.1:8000/api/calculations/hububat-silo/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
})
.then(response => {
    console.log('📡 Response Status:', response.status);
    return response.json();
})
.then(data => {
    console.log('📦 API Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
        console.log('✅ API Test BAŞARILI');
        console.log('📊 Sonuç:', data.sonuc);
        console.log('🏗️ Senaryo Tipi:', data.detaylar?.senaryo_tipi);
        console.log('💰 Maksimum Emsal:', data.detaylar?.maksimum_emsal, 'm²');
        console.log('🏢 İdari/Teknik Alan:', data.detaylar?.maks_idari_teknik_alan, 'm²');
        console.log('➕ Kalan Emsal:', data.detaylar?.kalan_emsal, 'm²');
    } else {
        console.log('❌ API Test BAŞARISIZ');
        console.log('🔍 Error:', data.error || data.message);
    }
})
.catch(error => {
    console.error('❌ API Error:', error);
});
