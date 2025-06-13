// Debug script to test calculation button functionality
(function() {
    console.log('🐛 Debug: Hesapla button test başlatılıyor...');
    
    // Wait for React app to load
    setTimeout(() => {
        console.log('🔍 Debug: Sayfa durumu kontrol ediliyor...');
        
        // Check if form exists
        const forms = document.querySelectorAll('form');
        console.log('📝 Debug: Form sayısı:', forms.length);
        
        // Check if submit button exists
        const submitButtons = document.querySelectorAll('button[type="submit"]');
        console.log('🧮 Debug: Submit button sayısı:', submitButtons.length);
        
        if (submitButtons.length > 0) {
            const submitButton = submitButtons[0];
            console.log('✅ Debug: Submit button bulundu:', submitButton);
            console.log('🎯 Debug: Button text:', submitButton.textContent);
            console.log('🎯 Debug: Button disabled:', submitButton.disabled);
            
            // Add click listener to debug
            submitButton.addEventListener('click', function(e) {
                console.log('🖱️ Debug: Submit button tıklandı!');
                console.log('📊 Debug: Event:', e);
            });
        }
        
        // Check result display container
        const resultContainers = document.querySelectorAll('[class*="Result"]');
        console.log('📊 Debug: Result container sayısı:', resultContainers.length);
        
        // Check if there are any calculation results visible
        const resultElements = document.querySelectorAll('*').length;
        console.log('🌐 Debug: Toplam DOM element sayısı:', resultElements);
        
        // Log current URL
        console.log('🔗 Debug: Mevcut URL:', window.location.href);
        
        // Check for API service
        if (window.apiService) {
            console.log('🔧 Debug: API service mevcut');
            console.log('🎯 Debug: Available calculations:', Object.keys(window.apiService.calculations || {}));
        } else {
            console.log('❌ Debug: API service bulunamadı');
        }
        
    }, 3000);
})();
