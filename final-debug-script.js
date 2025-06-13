// Final Debug Script - Tarayıcı konsoluna yapıştırın
console.clear();
console.log('🔧 HESAPLA BUTTON DEBUG - FINAL TEST');
console.log('='.repeat(50));

// Test case
console.log('📋 Test Case: Tarla + Zeytinlik Bağ Evi Hesaplama');
console.log('');

// DOM element kontrolü
console.log('🔍 DOM Elements Check:');
const form = document.querySelector('form');
const hesaplaButton = document.querySelector('button[type="submit"]');
const araziSelect = document.querySelector('select[name="arazi_vasfi"]');
const tarlaInput = document.querySelector('input[name="tarla_alani"]');
const zeytinlikInput = document.querySelector('input[name="zeytinlik_alani"]');

console.log('- Form found:', !!form);
console.log('- Hesapla button found:', !!hesaplaButton);
console.log('- Arazi select found:', !!araziSelect);
console.log('- Tarla input found:', !!tarlaInput);
console.log('- Zeytinlik input found:', !!zeytinlikInput);
console.log('');

// Result container kontrolü
const resultSection = document.querySelector('[class*="ResultSection"]');
const resultContainer = document.querySelector('[class*="ResultContainer"]');
console.log('🖼️ Result Display Check:');
console.log('- ResultSection found:', !!resultSection);
console.log('- ResultContainer found:', !!resultContainer);
console.log('');

// Test function
window.runHesaplaTest = function() {
    console.log('🎯 AUTOMATED TEST STARTING...');
    console.log('='.repeat(30));
    
    // 1. Arazi vasfını seç
    if (araziSelect) {
        araziSelect.value = 'Tarla + Zeytinlik';
        araziSelect.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ 1. Arazi vasfı seçildi: Tarla + Zeytinlik');
    }
    
    // Kısa delay sonra inputları doldur
    setTimeout(() => {
        // 2. Tarla alanını gir
        if (tarlaInput) {
            tarlaInput.value = '15000';
            tarlaInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ 2. Tarla alanı girildi: 15000');
        }
        
        // 3. Zeytinlik alanını gir
        if (zeytinlikInput) {
            zeytinlikInput.value = '5000';
            zeytinlikInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ 3. Zeytinlik alanı girildi: 5000');
        }
        
        // 4. Form submit
        setTimeout(() => {
            if (form) {
                console.log('🚀 4. Form submit ediliyor...');
                form.dispatchEvent(new Event('submit', { bubbles: true }));
                console.log('✅ 4. Form submit edildi');
                
                // 5 saniye sonra sonucu kontrol et
                setTimeout(() => {
                    console.log('');
                    console.log('🔍 FINAL RESULT CHECK:');
                    console.log('='.repeat(30));
                    
                    const updatedResultSection = document.querySelector('[class*="ResultSection"]');
                    const updatedResultContainer = document.querySelector('[class*="ResultContainer"]');
                    
                    console.log('- ResultSection visible:', !!(updatedResultSection && updatedResultSection.offsetParent !== null));
                    console.log('- ResultContainer visible:', !!(updatedResultContainer && updatedResultContainer.offsetParent !== null));
                    
                    if (updatedResultContainer) {
                        console.log('- ResultContainer innerHTML length:', updatedResultContainer.innerHTML.length);
                        console.log('- Has success content:', updatedResultContainer.innerHTML.includes('Hesaplama Sonucu'));
                        console.log('- Has error content:', updatedResultContainer.innerHTML.includes('Hesaplama Hatası'));
                    }
                    
                    console.log('');
                    console.log('🎯 TEST COMPLETED - Check logs above for any issues');
                }, 5000);
            }
        }, 500);
    }, 500);
};

console.log('✅ Setup complete!');
console.log('');
console.log('📝 MANUAL TEST STEPS:');
console.log('1. Select "Tarla + Zeytinlik" from dropdown');
console.log('2. Enter Tarla alanı: 15000');
console.log('3. Enter Zeytinlik alanı: 5000');
console.log('4. Click "Hesapla" button');
console.log('5. Watch console logs');
console.log('');
console.log('🤖 AUTOMATED TEST:');
console.log('Run: runHesaplaTest()');
console.log('');
console.log('⚠️  IMPORTANT: Watch for these key logs:');
console.log('- 🚀 CalculationForm - handleSubmit triggered');
console.log('- 📞 CalculationForm - Calling onCalculationStart');
console.log('- 🚀 CalculationPage - handleCalculationStart called');
console.log('- 📞 CalculationForm - Calling onResult with:');
console.log('- 🎯 CalculationPage - handleCalculationResult called');
console.log('- 🖼️ ResultDisplay props:');
