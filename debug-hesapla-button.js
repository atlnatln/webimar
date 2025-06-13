// Hesapla butonu debug test
console.log('🐛 Debugging Hesapla Button...');

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

// 4. Button click event test
if (hesaplaButton) {
    console.log('\n🔘 Button Event Test:');
    console.log('- Button disabled:', hesaplaButton.disabled);
    console.log('- Button text:', hesaplaButton.textContent);
    
    // Event listener test
    console.log('- Testing button click...');
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    
    try {
        hesaplaButton.dispatchEvent(clickEvent);
        console.log('✅ Button click event dispatched successfully');
    } catch (error) {
        console.error('❌ Button click error:', error);
    }
}

// 5. Console errors check
console.log('\n⚠️ Check console for any React errors or validation messages');
console.log('📝 Next steps:');
console.log('1. Select "Tarla + Zeytinlik" from dropdown');
console.log('2. Enter tarla_alani: 15000');
console.log('3. Enter zeytinlik_alani: 5000');
console.log('4. Click Hesapla button');
console.log('5. Check console for validation errors');
