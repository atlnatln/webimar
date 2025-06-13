// Tarayıcı konsolunda çalıştırılacak debug script'i
// Bu script'i tarayıcı konsoluna kopyala-yapıştır yapın

console.log('🐛 Browser Console Debug - Hesapla Button Investigation...');

// 1. Form ve buton element kontrolü
const form = document.querySelector('form');
const hesaplaButton = document.querySelector('button[type="submit"]');
const araziVasfiSelect = document.querySelector('select[name="arazi_vasfi"]');

console.log('📋 Form Elements Check:');
console.log('- Form element:', form ? '✅ Found' : '❌ Not found');
console.log('- Hesapla button:', hesaplaButton ? '✅ Found' : '❌ Not found');
console.log('- Arazi vasfı select:', araziVasfiSelect ? '✅ Found' : '❌ Not found');

if (araziVasfiSelect) {
    console.log('- Current arazi_vasfi value:', araziVasfiSelect.value);
    console.log('- Available options:', Array.from(araziVasfiSelect.options).map(o => o.value));
}

// 2. Form validation kontrolü
if (form) {
    const formData = new FormData(form);
    console.log('\n📊 Current Form Data:');
    for (let [key, value] of formData.entries()) {
        console.log(`- ${key}: ${value}`);
    }
}

// 3. "Tarla + Zeytinlik" alanları kontrolü
const tarlaAlaniInput = document.querySelector('input[name="tarla_alani"]');
const zeytinlikAlaniInput = document.querySelector('input[name="zeytinlik_alani"]');

console.log('\n🫒 Tarla + Zeytinlik Fields Check:');
console.log('- Tarla alanı input:', tarlaAlaniInput ? '✅ Found' : '❌ Not found');
console.log('- Zeytinlik alanı input:', zeytinlikAlaniInput ? '✅ Found' : '❌ Not found');

if (tarlaAlaniInput) {
    console.log('- Tarla alanı value:', tarlaAlaniInput.value);
    console.log('- Tarla alanı visible:', tarlaAlaniInput.offsetParent !== null);
}

if (zeytinlikAlaniInput) {
    console.log('- Zeytinlik alanı value:', zeytinlikAlaniInput.value);
    console.log('- Zeytinlik alanı visible:', zeytinlikAlaniInput.offsetParent !== null);
}

// 4. ResultDisplay container kontrolü
const resultContainer = document.querySelector('[class*="ResultContainer"], [data-testid="result-display"]');
const resultSection = document.querySelector('[class*="ResultSection"]');

console.log('\n📊 Result Display Check:');
console.log('- Result container:', resultContainer ? '✅ Found' : '❌ Not found');
console.log('- Result section:', resultSection ? '✅ Found' : '❌ Not found');

if (resultContainer) {
    console.log('- Result container visible:', resultContainer.offsetParent !== null);
    console.log('- Result container innerHTML length:', resultContainer.innerHTML.length);
}

// 5. Button click event test
if (hesaplaButton) {
    console.log('\n🔘 Button Event Test:');
    console.log('- Button disabled:', hesaplaButton.disabled);
    console.log('- Button text:', hesaplaButton.textContent);
    
    // Click listener'ları kontrol et
    const listeners = getEventListeners ? getEventListeners(hesaplaButton) : 'getEventListeners not available';
    console.log('- Event listeners:', listeners);
}

// 6. React state debug (eğer mümkünse)
console.log('\n⚛️ React Debug:');
if (window.React) {
    console.log('- React version:', window.React.version);
}

// 7. API calls monitoring
const originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log('🌐 API Call detected:', args[0]);
    return originalFetch.apply(this, args).then(response => {
        console.log('📨 API Response status:', response.status);
        return response;
    });
};

console.log('\n⚠️ Test adımları:');
console.log('1. Bağ evi sayfasına git: http://localhost:3000/bag-evi');
console.log('2. Arazi vasfından "Tarla + Zeytinlik" seç');
console.log('3. Tarla alanı: 15000, Zeytinlik alanı: 5000 gir');
console.log('4. Hesapla butonuna tıkla');
console.log('5. Konsolu izle - API call ve response loglarını gör');
