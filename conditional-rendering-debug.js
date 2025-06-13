// Debug Conditional Rendering
console.clear();
console.log('🔍 CONDITIONAL RENDERING DEBUG');
console.log('='.repeat(40));

// Check arazi select current value
const araziSelect = document.querySelector('select[name="arazi_vasfi"]');
console.log('📋 Current State:');
console.log('- Arazi select found:', !!araziSelect);
if (araziSelect) {
    console.log('- Current value:', `"${araziSelect.value}"`);
    console.log('- Value length:', araziSelect.value.length);
    console.log('- Value type:', typeof araziSelect.value);
}

// Check all available options
console.log('\n📝 Available Options:');
if (araziSelect) {
    Array.from(araziSelect.options).forEach((opt, index) => {
        console.log(`${index + 1}. value: "${opt.value}" | text: "${opt.textContent}" | selected: ${opt.selected}`);
    });
}

// Check if "Tarla + Zeytinlik" exactly matches
console.log('\n🎯 Exact Match Test:');
const expectedValue = 'Tarla + Zeytinlik';
if (araziSelect) {
    const currentValue = araziSelect.value;
    console.log('- Expected:', `"${expectedValue}"`);
    console.log('- Current:', `"${currentValue}"`);
    console.log('- Exact match:', currentValue === expectedValue);
    console.log('- Includes match:', currentValue.includes('Zeytinlik'));
}

// Try to set the value and test
window.testValueSet = function() {
    console.log('\n🧪 TESTING VALUE SET:');
    if (araziSelect) {
        // Method 1: Direct value set
        araziSelect.value = 'Tarla + Zeytinlik';
        console.log('1. After direct set:', `"${araziSelect.value}"`);
        
        // Method 2: Find exact option and select
        const options = Array.from(araziSelect.options);
        const zeytinlikOption = options.find(opt => opt.textContent.includes('Zeytinlik'));
        if (zeytinlikOption) {
            console.log('2. Found option:', `"${zeytinlikOption.value}" | "${zeytinlikOption.textContent}"`);
            araziSelect.value = zeytinlikOption.value;
            console.log('3. After option set:', `"${araziSelect.value}"`);
            
            // Trigger change event
            araziSelect.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('4. Change event triggered');
            
            // Wait and check for inputs
            setTimeout(() => {
                const tarlaInput = document.querySelector('input[name="tarla_alani"]');
                const zeytinlikInput = document.querySelector('input[name="zeytinlik_alani"]');
                console.log('5. After timeout:');
                console.log('   - Tarla input found:', !!tarlaInput);
                console.log('   - Zeytinlik input found:', !!zeytinlikInput);
                
                if (tarlaInput && zeytinlikInput) {
                    console.log('✅ SUCCESS! Input fields appeared');
                    console.log('   - Tarla input visible:', tarlaInput.offsetParent !== null);
                    console.log('   - Zeytinlik input visible:', zeytinlikInput.offsetParent !== null);
                } else {
                    console.log('❌ FAILED! Input fields still missing');
                    console.log('Checking all inputs again...');
                    const allInputs = document.querySelectorAll('input');
                    console.log('All inputs:');
                    allInputs.forEach((input, i) => {
                        console.log(`${i+1}. name="${input.name}" visible=${input.offsetParent !== null}`);
                    });
                }
            }, 1000);
        } else {
            console.log('❌ Zeytinlik option not found!');
        }
    }
};

console.log('\n✅ Ready! Run testValueSet() to test value setting');
console.log('\n📝 Manual Test:');
console.log('1. First run this script');
console.log('2. Check the current value and options');
console.log('3. Run testValueSet() to test automatic selection');
console.log('4. Or manually select from dropdown and check again');
