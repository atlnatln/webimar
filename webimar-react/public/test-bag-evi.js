// Bağ Evi API Test - Frontend ile tam entegrasyon testi
console.log('🍇 Testing Bağ Evi API...');

// Test Data - Bağ evi için özel veriler
const testData = {
    // Temel bilgiler
    alan_m2: 15000, // Bu tarla_alani ile otomatik olarak doldurulacak
    arazi_vasfi: 'Tarla + herhangi bir dikili vasıflı',
    
    // Bağ evi özel alanları
    tarla_alani: 15000,
    dikili_alani: 12000
};

console.log('📊 Test Verileri:', JSON.stringify(testData, null, 2));

// 1. Backend API'yi direkt test et
fetch('http://127.0.0.1:8000/api/calculations/bag-evi/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
})
.then(response => {
    console.log('📡 Backend Response Status:', response.status);
    console.log('📡 Backend Response OK:', response.ok);
    return response.json();
})
.then(data => {
    console.log('\n🔍 Backend API Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
        console.log('✅ Backend API Test BAŞARILI');
        console.log('📊 Sonuç:', data.sonuc);
        console.log('📋 HTML Mesaj:', data.html_mesaj ? 'VAR' : 'YOK');
        console.log('🏗️ Maksimum İnşaat Alanı:', data.detaylar?.maksimum_insaat_alani);
        console.log('🍇 Dikili Alan Kontrolü:', data.detaylar?.dikili_alan_kontrol);
    } else {
        console.log('❌ Backend API Test BAŞARISIZ');
        console.log('🔍 Error:', data.error || data.message);
    }
})
.catch(error => {
    console.error('❌ Backend API Error:', error);
});

// 2. Frontend calculation service'i test et
setTimeout(() => {
    console.log('\n🚀 Testing Frontend Calculation Service...');
    
    if (window.apiService && window.apiService.calculations && window.apiService.calculations.bag_evi) {
        console.log('✅ Frontend service bulundu');
        
        window.apiService.calculations.bag_evi(testData)
            .then(result => {
                console.log('\n🎯 Frontend API Result:', JSON.stringify(result, null, 2));
                
                if (result.success) {
                    console.log('✅ Frontend test BAŞARILI');
                    console.log('📊 Frontend Result Success:', result.success);
                    console.log('📋 Frontend Result Message:', result.message);
                    console.log('🏗️ Frontend Result Data:', result.data);
                } else {
                    console.log('❌ Frontend test BAŞARISIZ');
                    console.log('🔍 Frontend Error:', result.error || result.message);
                }
            })
            .catch(error => {
                console.error('❌ Frontend Service Error:', error);
            });
    } else {
        console.log('❌ Frontend service bulunamadı');
        console.log('🔍 window.apiService:', window.apiService);
        console.log('🔍 window.apiService.calculations:', window.apiService?.calculations);
        console.log('🔍 Bag evi key exists?:', window.apiService?.calculations ? 'bag_evi' in window.apiService.calculations : 'NO apiService');
    }
}, 1000);

// 3. Form validation test
console.log('\n📝 Testing Form Validation Logic...');

// Senario 1: Normal bağ evi hesaplama
const validData = {
    calculationType: 'bag-evi',
    arazi_vasfi: 'Tarla + herhangi bir dikili vasıflı',
    tarla_alani: 15000,
    dikili_alani: 12000
};

console.log('✅ Valid Data Test:', validData);

// Senario 2: Dikili alan > Tarla alan (hatalı)
const invalidData = {
    calculationType: 'bag-evi',
    arazi_vasfi: 'Tarla + herhangi bir dikili vasıflı',
    tarla_alani: 10000,
    dikili_alani: 15000 // Bu hatalı - dikili alan tarla alanından büyük
};

console.log('❌ Invalid Data Test (dikili > tarla):', invalidData);

// Senario 3: Farklı arazi vasfı (normal alan hesaplama)
const normalAreaData = {
    calculationType: 'bag-evi',
    arazi_vasfi: 'tarım',
    alan_m2: 5000
};

console.log('📊 Normal Area Data Test:', normalAreaData);
