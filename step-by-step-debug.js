// Step-by-step debug script
console.clear();
console.log('🔧 STEP-BY-STEP DEBUG');
console.log('='.repeat(40));

// Step 1: Check current state
console.log('📋 STEP 1: Current DOM State');
const form = document.querySelector('form');
const araziSelect = document.querySelector('select[name="arazi_vasfi"]');
console.log('- Form:', !!form);
console.log('- Arazi select:', !!araziSelect);
if (araziSelect) {
    console.log('- Current arazi value:', araziSelect.value);
    console.log('- Available options:');
    Array.from(araziSelect.options).forEach(opt => {
        console.log(`  * "${opt.value}" - ${opt.textContent}`);
    });
}
console.log('');

// Step 2: Select Tarla + Zeytinlik manually first
console.log('📋 STEP 2: Manual Selection Required');
console.log('PLEASE DO THIS MANUALLY:');
console.log('1. Click on the dropdown "Arazi Vasfı"');
console.log('2. Select "Tarla + Zeytinlik" option');
console.log('3. Wait for input fields to appear');
console.log('4. Then run: checkAfterSelection()');
console.log('');

// Step 3: Check after manual selection
window.checkAfterSelection = function() {
    console.log('📋 STEP 3: After Manual Selection');
    console.log('='.repeat(30));
    
    const updatedAraziSelect = document.querySelector('select[name="arazi_vasfi"]');
    const tarlaInput = document.querySelector('input[name="tarla_alani"]');
    const zeytinlikInput = document.querySelector('input[name="zeytinlik_alani"]');
    
    console.log('- Arazi select value:', updatedAraziSelect?.value);
    console.log('- Tarla input found:', !!tarlaInput);
    console.log('- Zeytinlik input found:', !!zeytinlikInput);
    
    if (tarlaInput && zeytinlikInput) {
        console.log('✅ Input fields found! Running automated test...');
        
        // Auto-fill and test
        tarlaInput.value = '15000';
        tarlaInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        zeytinlikInput.value = '5000';
        zeytinlikInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        console.log('✅ Values entered');
        console.log('- Tarla value:', tarlaInput.value);
        console.log('- Zeytinlik value:', zeytinlikInput.value);
        
        setTimeout(() => {
            const form = document.querySelector('form');
            if (form) {
                console.log('🚀 Submitting form...');
                form.dispatchEvent(new Event('submit', { bubbles: true }));
                
                setTimeout(() => {
                    console.log('🔍 Checking results...');
                    const resultSection = document.querySelector('[class*="ResultSection"]');
                    const resultContainer = document.querySelector('[class*="ResultContainer"]');
                    console.log('- ResultSection found:', !!resultSection);
                    console.log('- ResultContainer found:', !!resultContainer);
                    if (resultContainer) {
                        console.log('- ResultContainer visible:', resultContainer.offsetParent !== null);
                    }
                }, 3000);
            }
        }, 500);
    } else {
        console.log('❌ Input fields still not found!');
        console.log('Check if conditional rendering is working...');
        
        // Check all input fields
        const allInputs = document.querySelectorAll('input');
        console.log('All input fields on page:');
        allInputs.forEach((input, index) => {
            console.log(`${index + 1}. name="${input.name}" type="${input.type}" visible=${input.offsetParent !== null}`);
        });
    }
};

console.log('⚡ Ready! Follow the steps above.');
console.log('');
console.log('🎯 Expected workflow:');
console.log('1. Manual selection → checkAfterSelection()');
console.log('2. If inputs appear → Automatic test runs');
console.log('3. If inputs don\'t appear → Debug conditional rendering');
