// Updated Hububat Silo API test script with silo_taban_alani_m2
const testData = {
    alan_m2: 5000,
    silo_taban_alani_m2: 1000,
    arazi_vasfi: "tarım"
};

console.log('🌾 Hububat Silo API Test (Updated with Silo Taban Alanı)');
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
    
    // Sonucu analiz et
    if (data.success) {
        console.log('✅ API Test BAŞARILI - Hububat silo hesaplaması çalışıyor');
        console.log('📊 Sonuç:', data.sonuc);
        console.log('📋 Detaylar:', data.detaylar);
        console.log('🏗️ Senaryo Tipi:', data.detaylar?.senaryo_tipi);
    } else {
        console.log('❌ API Test BAŞARISIZ');
        console.log('🔍 Error:', data.error || data.message);
    }
})
.catch(error => {
    console.error('❌ API Error:', error);
});
