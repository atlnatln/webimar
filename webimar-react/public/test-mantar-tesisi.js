// Test script for mantar-tesisi API endpoint
const axios = require('axios');

const testMantarTesisi = async () => {
  try {
    console.log('🚀 Starting test calculation for: mantar-tesisi');
    
    const testData = {
      alan_m2: 1000,
      arazi_vasfi: 'Dikili tarım'
    };
    
    console.log('📊 Test data:', testData);
    
    const response = await axios.post('http://127.0.0.1:8000/api/calculations/mantar-tesisi/', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📦 Response headers:', response.headers);
    console.log('✅ API response:', response.data);
    console.log('🎯 Result type:', typeof response.data);
    console.log('🔍 Success:', response.data.success);
    console.log('📝 Message:', response.data.mesaj || response.data.message || response.data.sonuc);
    console.log('📊 Data:', response.data.detaylar || response.data.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error testing mantar-tesisi API:');
    if (error.response) {
      console.error('📡 Status:', error.response.status);
      console.error('📦 Data:', error.response.data);
      console.error('📋 Headers:', error.response.headers);
    } else if (error.request) {
      console.error('📡 Request made but no response:', error.request);
    } else {
      console.error('⚙️ Error message:', error.message);
    }
    return null;
  }
};

// Run the test
testMantarTesisi();
