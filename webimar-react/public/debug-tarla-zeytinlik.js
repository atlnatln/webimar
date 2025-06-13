// Debug script for "Tarla + Zeytinlik" calculation issue
console.log('🫒 Starting Tarla + Zeytinlik Debug...');

// Test verisi - exact match with what user enters
const testData = {
    alan_m2: 20000, // toplam alan (15000 + 5000)
    arazi_vasfi: 'Tarla + Zeytinlik',
    tarla_alani: 15000,
    zeytinlik_alani: 5000
};

console.log('📊 Test Data:', JSON.stringify(testData, null, 2));

// 1. API service kontrolü
console.log('\n🔍 API Service Check:');
if (window.apiService) {
    console.log('✅ window.apiService bulundu');
    
    if (window.apiService.calculations) {
        console.log('✅ window.apiService.calculations bulundu');
        
        const availableKeys = Object.keys(window.apiService.calculations);
        console.log('📋 Available calculation keys:', availableKeys);
        
        // bag_evi key'ini kontrol et
        if (window.apiService.calculations.bag_evi) {
            console.log('✅ bag_evi calculation function bulundu');
            
            // API'yi test et
            console.log('\n🧪 Testing bag_evi API with Tarla + Zeytinlik data...');
            window.apiService.calculations.bag_evi(testData)
                .then(result => {
                    console.log('🎯 API Test Result:', JSON.stringify(result, null, 2));
                    if (result.success) {
                        console.log('✅ API Test BAŞARILI');
                    } else {
                        console.log('❌ API Test BAŞARISIZ');
                        console.log('🔍 Error:', result.error || result.message);
                    }
                })
                .catch(error => {
                    console.error('❌ API Test Error:', error);
                });
            
        } else {
            console.log('❌ bag_evi calculation function bulunamadı');
            console.log('🔍 Available keys:', availableKeys);
        }
    } else {
        console.log('❌ window.apiService.calculations bulunamadı');
    }
} else {
    console.log('❌ window.apiService bulunamadı');
}

// 2. Form validation test
console.log('\n📝 Form Validation Test:');

function validateTarlaZeytinlik(formData) {
    const errors = {};
    
    // Bağ evi + Tarla + Zeytinlik validation logic
    if (formData.calculationType === 'bag-evi' && formData.arazi_vasfi === 'Tarla + Zeytinlik') {
        if (!formData.tarla_alani || formData.tarla_alani <= 0) {
            errors.tarla_alani = 'Tarla alanı pozitif bir sayı olmalıdır';
        }
        if (!formData.zeytinlik_alani || formData.zeytinlik_alani <= 0) {
            errors.zeytinlik_alani = 'Zeytinlik alanı pozitif bir sayı olmalıdır';
        }
        // alan_m2 should be calculated as tarla_alani + zeytinlik_alani
        const calculatedAlan = (formData.tarla_alani || 0) + (formData.zeytinlik_alani || 0);
        if (calculatedAlan !== formData.alan_m2) {
            console.log('⚠️ alan_m2 mismatch:', {
                expected: calculatedAlan,
                actual: formData.alan_m2
            });
        }
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
}

const validationResult = validateTarlaZeytinlik({
    calculationType: 'bag-evi',
    ...testData
});

console.log('📊 Validation Result:', validationResult);
if (validationResult.isValid) {
    console.log('✅ Form validation PASSED');
} else {
    console.log('❌ Form validation FAILED');
    console.log('🔍 Errors:', validationResult.errors);
}

// 3. Backend direct test
console.log('\n🔗 Backend Direct Test:');
fetch('http://127.0.0.1:8000/api/calculations/bag-evi/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
})
.then(response => {
    console.log('📡 Backend Response Status:', response.status);
    return response.json();
})
.then(data => {
    console.log('🎯 Backend Response:', JSON.stringify(data, null, 2));
    if (data.success) {
        console.log('✅ Backend Test BAŞARILI');
    } else {
        console.log('❌ Backend Test BAŞARISIZ');
    }
})
.catch(error => {
    console.error('❌ Backend Test Error:', error);
});

console.log('\n✨ Debug script completed. Check results above.');
