// Test script for Arıcılık Tesisi API
const API_BASE_URL = 'http://127.0.0.1:8000';

async function testAricilikTesisiAPI() {
    console.log('🐝 Testing Arıcılık Tesisi API...');
    
    const testData = {
        alan_m2: 5000,
        arazi_vasfi: 'tarım'
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/calculations/aricilik/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📊 Response Status:', response.status);
        console.log('📊 Response OK:', response.ok);
        
        const data = await response.json();
        console.log('📦 Full Response:', JSON.stringify(data, null, 2));
        
        // Sorun tipini analiz et
        if (response.ok && data.success) {
            console.log('✅ API Test BAŞARILI - Tip 1 sorunu (sadece frontend transform gerekli)');
            
            // Response format analizi
            console.log('\n🔍 Response Format Analizi:');
            console.log('- success:', data.success);
            console.log('- sonuc:', data.sonuc);
            console.log('- mesaj:', data.mesaj ? 'VAR' : 'YOK');
            console.log('- html_mesaj:', data.html_mesaj ? 'VAR' : 'YOK');
            console.log('- detaylar:', data.detaylar ? 'VAR' : 'YOK');
            console.log('- izin_durumu:', data.izin_durumu);
            
        } else {
            console.log('❌ API Test BAŞARISIZ - Tip 2 sorunu (backend wrapper gerekli)');
            console.log('Hata:', data.error || data.message);
        }
        
    } catch (error) {
        console.error('💥 Network Error:', error);
        console.log('❌ API Test BAŞARISIZ - Network/Connection sorunu');
    }
}

// Test'i çalıştır
testAricilikTesisiAPI();
