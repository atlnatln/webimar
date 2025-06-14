// Dikili Vasıf Debug Console Script
console.log('🔍 DIKILI VASIF DEBUG KONSOLU BAŞLATILIYOR...');

// Form elementlerini bul
const araziVasfiSelect = document.querySelector('select[name="arazi_vasfi"]');
const dikiliAlanInput = document.querySelector('input[placeholder*="12000"]');
const tarlaAlanInput = document.querySelector('input[placeholder*="15000"]');
const tapuAgacInput = document.querySelector('input[placeholder*="Tapu"]');
const mevcutAgacInput = document.querySelector('input[placeholder*="Mevcut"]');
const hesaplaButton = document.querySelector('button[type="submit"]');

console.log('📋 FORM ELEMENTLERİ:');
console.log('- Arazi Vasfı:', araziVasfiSelect);
console.log('- Dikili Alan:', dikiliAlanInput);
console.log('- Tarla Alanı:', tarlaAlanInput);
console.log('- Tapu Ağaç:', tapuAgacInput);
console.log('- Mevcut Ağaç:', mevcutAgacInput);
console.log('- Hesapla:', hesaplaButton);

if (araziVasfiSelect) {
    console.log('🎯 Arazi Vasfını "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf" olarak ayarlıyorum...');
    araziVasfiSelect.value = '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf';
    araziVasfiSelect.dispatchEvent(new Event('change', { bubbles: true }));
    
    setTimeout(() => {
        console.log('🔍 Arazi vasfı değişikliği sonrası form durumu:');
        console.log('- Seçili vasıf:', araziVasfiSelect.value);
        
        // Tarla alanı inputunun görünürlüğünü kontrol et
        const tarlaAlanContainer = tarlaAlanInput?.closest('.form-group') || tarlaAlanInput?.parentElement;
        if (tarlaAlanContainer) {
            const isVisible = tarlaAlanContainer.style.display !== 'none' && 
                             !tarlaAlanContainer.hidden &&
                             tarlaAlanContainer.offsetHeight > 0;
            console.log('- Tarla alanı görünür mü?', isVisible);
            
            if (isVisible) {
                console.log('❌ SORUN: Tarla alanı input hala görünüyor!');
                tarlaAlanContainer.style.border = '3px solid red';
                tarlaAlanContainer.style.backgroundColor = '#ffebee';
            } else {
                console.log('✅ DOĞRU: Tarla alanı input gizlendi');
            }
        }
        
        // Test verileri gir
        if (dikiliAlanInput) {
            console.log('📝 Dikili alan değeri giriliyor: 5000');
            dikiliAlanInput.value = '5000';
            dikiliAlanInput.dispatchEvent(new Event('input', { bubbles: true }));
            dikiliAlanInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        if (tapuAgacInput) {
            console.log('📝 Tapu ağaç değeri giriliyor: 25');
            tapuAgacInput.value = '25';
            tapuAgacInput.dispatchEvent(new Event('input', { bubbles: true }));
            tapuAgacInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        if (mevcutAgacInput) {
            console.log('📝 Mevcut ağaç değeri giriliyor: 20');
            mevcutAgacInput.value = '20';
            mevcutAgacInput.dispatchEvent(new Event('input', { bubbles: true }));
            mevcutAgacInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        setTimeout(() => {
            console.log('🎯 Form validation test ediliyor...');
            
            // Validation hatalarını kontrol et
            const errorMessages = document.querySelectorAll('.error-message, .validation-error, [class*="error"]');
            console.log('🔍 Validation hataları:');
            errorMessages.forEach((error, index) => {
                if (error.textContent.trim()) {
                    console.log(`  ${index + 1}. ${error.textContent.trim()}`);
                    if (error.textContent.includes('tarla')) {
                        console.log('❌ SORUN: Tarla alanı ile ilgili validation hatası var!');
                        error.style.border = '3px solid red';
                        error.style.backgroundColor = '#ffebee';
                    }
                }
            });
            
            // Form submit test
            console.log('🚀 Form submit test ediliyor...');
            if (hesaplaButton) {
                hesaplaButton.click();
                
                setTimeout(() => {
                    console.log('📊 Submit sonrası form durumu:');
                    console.log('- Dikili alan:', dikiliAlanInput?.value);
                    console.log('- Tarla alanı:', tarlaAlanInput?.value);
                    console.log('- Tapu ağaç:', tapuAgacInput?.value);
                    console.log('- Mevcut ağaç:', mevcutAgacInput?.value);
                    
                    // Son validation kontrolü
                    const finalErrors = document.querySelectorAll('.error-message, .validation-error, [class*="error"]');
                    console.log('🔍 Submit sonrası validation hataları:');
                    finalErrors.forEach((error, index) => {
                        if (error.textContent.trim()) {
                            console.log(`  ${index + 1}. ${error.textContent.trim()}`);
                        }
                    });
                    
                }, 1000);
            }
        }, 500);
    }, 1000);
} else {
    console.log('❌ Arazi vasfı select elementi bulunamadı!');
}

// Console helper functions
window.debugDikiliVasif = {
    checkFormState: () => {
        console.log('📊 FORM DURUMU:');
        console.log('- Arazi vasfı:', araziVasfiSelect?.value);
        console.log('- Dikili alan:', dikiliAlanInput?.value);
        console.log('- Tarla alanı:', tarlaAlanInput?.value);
        console.log('- Tapu ağaç:', tapuAgacInput?.value);
        console.log('- Mevcut ağaç:', mevcutAgacInput?.value);
    },
    
    toggleTarlaVisibility: () => {
        const tarlaContainer = tarlaAlanInput?.closest('.form-group') || tarlaAlanInput?.parentElement;
        if (tarlaContainer) {
            tarlaContainer.style.display = tarlaContainer.style.display === 'none' ? 'block' : 'none';
            console.log('👁️ Tarla alanı görünürlüğü değiştirildi');
        }
    },
    
    simulateMapTransfer: () => {
        console.log('🗺️ Harita transferi simülasyonu...');
        if (dikiliAlanInput) {
            dikiliAlanInput.value = '28592';
            dikiliAlanInput.dispatchEvent(new Event('input', { bubbles: true }));
            dikiliAlanInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Dikili alan haritadan aktarıldı: 28592 m²');
        }
    }
};

console.log('✅ DEBUG KONSOLU HAZIR!');
console.log('🔧 Kullanılabilir fonksiyonlar:');
console.log('- debugDikiliVasif.checkFormState()');
console.log('- debugDikiliVasif.toggleTarlaVisibility()');
console.log('- debugDikiliVasif.simulateMapTransfer()');
