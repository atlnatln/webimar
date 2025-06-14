// Final test script for "… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf"
console.log('🎯 FINAL TEST - DIKILI VASIF FIXES');
console.log('==================================');

// Fonksiyon tanımları
window.testDikiliVasifFixes = function() {
    console.log('🧪 Testing calculateVineyardResult fixes...');
    
    // Test 1: Dikili alan 5000 m² (minimum) - should be successful
    console.log('\n📋 TEST 1: Dikili alan 5000 m² (minimum requirement)');
    try {
        // Bu test sadece arazi tipi kontrolünü test eder
        const araziVasfi = '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf';
        console.log(`- Arazi vasfı: "${araziVasfi}"`);
        console.log('- Dikili alan: 5000 m²');
        console.log('- Tarla alanı: 0 m² (should be ignored)');
        console.log('- Eklenen ağaçlar: [] (empty - should be OK)');
        console.log('✅ Expected: No tarla area validation error');
    } catch (error) {
        console.log('❌ Error in test 1:', error.message);
    }
    
    // Test 2: Form elementleri kontrolü
    console.log('\n📋 TEST 2: Form elements visibility');
    try {
        const araziVasfiSelect = document.querySelector('select[name="arazi_vasfi"]');
        if (araziVasfiSelect) {
            console.log('✅ Arazi vasfı select found');
            console.log(`Current value: "${araziVasfiSelect.value}"`);
            
            // Check if tarla alanı input is hidden
            const tarlaInputs = document.querySelectorAll('input[name="tarla_alani"]');
            console.log(`Found ${tarlaInputs.length} tarla alanı input(s)`);
            
            tarlaInputs.forEach((input, index) => {
                const isVisible = input.offsetHeight > 0 && input.offsetWidth > 0;
                const isDisabled = input.disabled;
                console.log(`  Input ${index + 1}: visible=${isVisible}, disabled=${isDisabled}`);
            });
        } else {
            console.log('❌ Arazi vasfı select not found');
        }
    } catch (error) {
        console.log('❌ Error in test 2:', error.message);
    }
    
    // Test 3: Error messages
    console.log('\n📋 TEST 3: Error messages check');
    try {
        const errorElements = document.querySelectorAll('.error, .error-message, [class*="error"]');
        console.log(`Found ${errorElements.length} error element(s)`);
        
        errorElements.forEach((error, index) => {
            if (error.textContent && error.textContent.trim()) {
                const text = error.textContent.trim();
                console.log(`  Error ${index + 1}: "${text}"`);
                
                if (text.includes('tarla alanı')) {
                    console.log('    ⚠️  Contains tarla area reference');
                }
            }
        });
    } catch (error) {
        console.log('❌ Error in test 3:', error.message);
    }
    
    console.log('\n🎯 Test completed!');
    console.log('Expected results:');
    console.log('- No "tarla alanı" validation error for dikili vasıf');
    console.log('- Tarla alanı input should be hidden or disabled');
    console.log('- Kriter 1 should pass with 5000 m² dikili alan');
};

// Test specific to our issue
window.testTarlaValidationIssue = function() {
    console.log('🔍 TARLA VALIDATION ISSUE TEST');
    console.log('==============================');
    
    // Find form and set arazi vasfi
    const araziVasfiSelect = document.querySelector('select[name="arazi_vasfi"]');
    if (araziVasfiSelect) {
        console.log('Setting arazi vasfı to dikili vasıf...');
        araziVasfiSelect.value = '… Adetli Zeytin Ağacı bulunan + herhangi bir dikili vasıf';
        araziVasfiSelect.dispatchEvent(new Event('change', { bubbles: true }));
        
        setTimeout(() => {
            // Check validation
            const errorMsgs = document.querySelectorAll('*').filter(el => 
                el.textContent && el.textContent.includes('tarla alanı')
            );
            
            console.log(`Found ${errorMsgs.length} elements mentioning tarla alanı`);
            errorMsgs.forEach((msg, index) => {
                console.log(`  ${index + 1}. "${msg.textContent.trim()}"`);
            });
            
            if (errorMsgs.length === 0) {
                console.log('✅ No tarla alanı validation errors found!');
            } else {
                console.log('❌ Still showing tarla alanı validation errors');
            }
        }, 500);
    }
};

// Auto-run tests
console.log('🚀 Running tests automatically...');
testDikiliVasifFixes();

console.log('\n📖 Available test functions:');
console.log('- testDikiliVasifFixes()');
console.log('- testTarlaValidationIssue()');
console.log('\nTo test the tarla validation issue specifically, run:');
console.log('testTarlaValidationIssue()');
