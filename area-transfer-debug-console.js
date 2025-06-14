// Area Transfer Debug Test - Browser Console'da çalıştırın
console.clear();
console.log('🔍 Area Transfer Debug Test Başlıyor...');
console.log('='.repeat(50));

// 1. Önce arazi vasfını "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf" olarak seçin
const araziSelect = document.querySelector('select[name="arazi_vasfi"]');
if (araziSelect) {
    // Önce mevcut seçenekleri listele
    console.log('📋 Mevcut arazi vasfı seçenekleri:');
    Array.from(araziSelect.options).forEach((option, index) => {
        console.log(`  ${index}: "${option.value}" - ${option.textContent}`);
    });
    
    // Hedef seçeneği bul
    const targetOption = Array.from(araziSelect.options).find(option => 
        option.value === '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf'
    );
    
    if (targetOption) {
        console.log('✅ Hedef arazi vasfı bulundu:', targetOption.value);
        araziSelect.value = targetOption.value;
        araziSelect.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('🎯 Arazi vasfı seçildi ve change event tetiklendi');
    } else {
        console.log('❌ Hedef arazi vasfı bulunamadı');
    }
} else {
    console.log('❌ Arazi vasfı select elementi bulunamadı');
}

// 2. Dikili alan input'unu kontrol et
setTimeout(() => {
    console.log('\n📏 Form Input Kontrolü:');
    const dikiliInput = document.querySelector('input[name="dikili_alani"]');
    
    if (dikiliInput) {
        console.log('✅ Dikili alan input bulundu');
        console.log('📊 Mevcut değer:', dikiliInput.value);
        console.log('🎨 Input visible:', dikiliInput.offsetParent !== null);
        
        // Manuel test için input değerini kontrol et
        console.log('\n🧪 Manuel input testi:');
        const originalValue = dikiliInput.value;
        dikiliInput.value = '99537';
        dikiliInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('🔄 Test değer atandı: 99537');
        
        setTimeout(() => {
            console.log('📊 Test sonrası değer:', dikiliInput.value);
            if (dikiliInput.value === '99537') {
                console.log('✅ Input değişikliği çalışıyor');
            } else {
                console.log('❌ Input değişikliği çalışmıyor');
            }
            
            // Orijinal değeri geri yükle
            dikiliInput.value = originalValue;
            dikiliInput.dispatchEvent(new Event('change', { bubbles: true }));
        }, 500);
    } else {
        console.log('❌ Dikili alan input bulunamadı');
    }
}, 1000);

// 3. Harita Bilgisi butonunu kontrol et
setTimeout(() => {
    console.log('\n🗺️ Harita Bilgisi Butonu Kontrolü:');
    const mapButton = document.querySelector('button');
    const mapButtons = document.querySelectorAll('button');
    
    console.log('📊 Toplam buton sayısı:', mapButtons.length);
    
    // "Harita Bilgisi" yazısı içeren butonu bul
    let haritaButton = null;
    mapButtons.forEach((button, index) => {
        console.log(`  Buton ${index}: "${button.textContent?.trim()}"`);
        if (button.textContent?.includes('Harita Bilgisi')) {
            haritaButton = button;
        }
    });
    
    if (haritaButton) {
        console.log('✅ Harita Bilgisi butonu bulundu');
        console.log('🎯 Buton metni:', haritaButton.textContent);
        console.log('🔧 Buton disabled:', haritaButton.disabled);
        
        console.log('\n💡 Test talimatı:');
        console.log('1. Harita Bilgisi butonuna tıklayın');
        console.log('2. Dikili alanı çizin (test için küçük bir poligon yeterli)');
        console.log('3. "🚀 Poligon Verilerini Hesaplama Formuna Aktar" butonuna tıklayın');
        console.log('4. Console\'da debug loglarını izleyin');
        console.log('5. Dikili alan input\'unda değerin güncellenip güncellenmediğini kontrol edin');
    } else {
        console.log('❌ Harita Bilgisi butonu bulunamadı');
    }
}, 2000);

// 4. Area transfer fonksiyonunu test etmek için mock data hazırla
setTimeout(() => {
    console.log('\n🧪 Mock Area Transfer Testi:');
    
    // handleDikiliKontrolSuccess fonksiyonunu global scope'a ekle
    if (typeof window.handleDikiliKontrolSuccess === 'undefined') {
        console.log('⚠️ handleDikiliKontrolSuccess fonksiyonu global scope\'ta bulunamadı');
        console.log('💡 Bu normal - fonksiyon React component\'i içinde tanımlı');
    }
    
    // Mock data hazırla
    const mockTransferData = {
        dikiliAlan: 99537,
        tarlaAlani: 0,
        zeytinlikAlani: 0,
        directTransfer: true,
        eklenenAgaclar: [],
        dikiliAlanKontrolSonucu: null
    };
    
    console.log('📦 Mock transfer data hazırlandı:', mockTransferData);
    console.log('💡 Bu veri haritadan gelen gerçek transfer verisini simüle eder');
    
    // Test için global bir fonksiyon tanımla
    window.testAreaTransfer = function() {
        console.log('🚀 Manual area transfer test başlıyor...');
        
        // React component içindeki handleDikiliKontrolSuccess'i çağırmaya çalış
        // Bu sadece component mounted ise ve function available ise çalışır
        const dikiliInput = document.querySelector('input[name="dikili_alani"]');
        if (dikiliInput && dikiliInput.value) {
            console.log('📏 Test öncesi dikili alan değeri:', dikiliInput.value);
            
            // Simulated transfer
            dikiliInput.value = '99537';
            dikiliInput.dispatchEvent(new Event('change', { bubbles: true }));
            
            console.log('✅ Simulated transfer completed');
            console.log('📏 Test sonrası dikili alan değeri:', dikiliInput.value);
        }
    };
    
    console.log('💡 Manuel test için: testAreaTransfer()');
    
}, 3000);

console.log('\n🎯 Debug test hazır!');
console.log('📝 Sonraki adımlar:');
console.log('1. Yukarıdaki otomatik testlerin sonuçlarını inceleyin');
console.log('2. Manuel harita testi yapın');
console.log('3. testAreaTransfer() fonksiyonunu çağırarak manuel transfer test edin');
