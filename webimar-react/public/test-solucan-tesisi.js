// Test script for solucan-tesisi API endpoint
const axios = require('axios');

async function testSolucanTesisiAPI() {
    console.log('🚀 Starting test calculation for: solucan-tesisi');
    
    const testData = {
        alan_m2: 5000,
        arazi_vasfi: 'Dikili tarım'
    };
    
    console.log('📊 Test data:', testData);
    
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/calculations/solucan-tesisi/', testData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📦 Response headers:', response.headers);
        console.log('✅ API response:', response.data);
        
        // Analyze the response structure
        console.log('🎯 Result type:', typeof response.data);
        if (response.data.success !== undefined) {
            console.log('🔍 Success:', response.data.success);
            console.log('📝 Message:', response.data.message || response.data.mesaj);
            if (response.data.detaylar || response.data.data) {
                console.log('📊 Data:', response.data.detaylar || response.data.data);
            }
            if (response.data.ana_mesaj_html) {
                console.log('🎨 HTML Message available:', response.data.ana_mesaj_html.length, 'characters');
            }
        } else {
            console.log('📄 Raw response:', response.data);
        }
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
        if (error.response) {
            console.error('📡 Status:', error.response.status);
            console.error('📦 Response:', error.response.data);
        }
    }
}

// Run the test
testSolucanTesisiAPI().catch(console.error);
