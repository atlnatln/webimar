// Hububat Silo API test scripti
const testData = {
    alan_m2: 5000,
    arazi_vasfi: "tarım"
};

console.log('🌾 Hububat Silo API Test');
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
    
    // Sorun tipini analiz et
    if (data.success) {
        console.log('✅ API Test BAŞARILI - Tip 1 sorunu (sadece frontend transform gerekli)');
    } else {
        console.log('❌ API Test BAŞARISIZ - Muhtemelen Tip 2 sorunu (backend wrapper gerekli)');
        console.log('🔍 Error:', data.error || data.message);
    }
})
.catch(error => {
    console.error('❌ API Error:', error);
});
