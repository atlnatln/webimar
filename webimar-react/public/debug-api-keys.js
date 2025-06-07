// Debug script to check apiService.calculations keys
console.log('=== DEBUG API KEYS ===');

// React uygulamasında apiService'e erişim için window objesi kullanılabilir
// Eğer apiService export edilmişse, browser console'da kullanılabilir

// Manuel olarak STRUCTURE_TYPE_TO_ID mapping'ini kontrol edelim
const STRUCTURE_TYPE_TO_ID = {
  'bag-evi': 2,
  'lisansli-depo': 3,
  'solucan-tesisi': 1,
  'aricilik-tesisi': 4,
  'tavukculuk-tesisi': 5,
  'koyunculuk-tesisi': 6,
  'buyukbas-hayvancilik-tesisi': 7,
  'kucukbas-hayvancilik-tesisi': 8,
  'sera-tesisi': 9,
  'mantar-uretim-tesisi': 10,
  'soguk-hava-deposu': 11,
  'silo-tesisi': 12,
  'su-urunleri-tesisi': 13,
  'su-depolama-tesisi': 14,
  'gubre-depolama-tesisi': 15
};

console.log('📋 STRUCTURE_TYPE_TO_ID mapping:', STRUCTURE_TYPE_TO_ID);

// generateCalculationFunctions tarafından oluşturulan key'leri simüle edelim
const generatedKeys = Object.keys(STRUCTURE_TYPE_TO_ID).map(key => key.replace(/-/g, '_'));
console.log('🔄 Generated API keys (- to _):', generatedKeys);

// solucan-tesisi için generated key
const solucanKey = 'solucan-tesisi'.replace(/-/g, '_');
console.log(`🎯 solucan-tesisi → ${solucanKey}`);

// Test API call
const testSolucanAPI = async () => {
  try {
    console.log('🧪 Testing solucan tesisi API directly...');
    const response = await fetch('http://127.0.0.1:8000/api/calculations/solucan-tesisi/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        alan_m2: 5000,
        arazi_vasfi: 'Dikili tarım'
      })
    });
    
    const data = await response.json();
    console.log('✅ Direct API response:', data);
    return data;
  } catch (error) {
    console.error('❌ Direct API error:', error);
    return null;
  }
};

// Run test
testSolucanAPI();
