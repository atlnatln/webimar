/**
 * Console Log Filter - Optimal Version
 * Tarayıcı console loglarını akıllı filtreleme ile optimize eder
 */

// Debug seviyesi: 0=Sadece hatalar, 1=Önemli işlemler, 2=Detaylı debug, 3=Tüm loglar
const DEBUG_LEVEL = parseInt(localStorage.getItem('DEBUG_LEVEL') || '1', 10);

// Orijinal console metodlarını yedekle
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

// Önemli loglar (Level 1+) - Sadece kritik işlemler
const IMPORTANT_PATTERNS = [
  /✨.*Rendering successful result/,
  /💥.*Showing error result/,
  /❌.*Error/,
  /🔄.*Emsal türü değişti/,
  /🎯.*API Result:/,
  /⚠️/,
  /🚀.*Doğrudan aktarım/,
  /🚀.*Dikili vasıflı için özel aktarım/,
  /🚀.*Tarla \\+ Zeytinlik için aktarım/,
  /🚀.*Adetli Zeytin Ağacı.*için aktarım/,
  /🧹.*Temizleme işlemi algılandı/,
  /✅.*Form tamamen temizlendi/,
  /📝.*AKILLI ALGILA.*manuel olarak değiştirildi/,
  /🔍.*API Response Detail/,
  /🎯.*CalculationPage.*called with:/,
  /🔍.*CalculationPage.*State updated:/,
  /🚀.*CalculationPage.*handleCalculationStart/,
  /📊.*CalculationPage.*State updated:/,
  /🔄.*CalculationPage.*Render/,
  /🔍.*CalculationPage.*Render/,
  /🔍.*DEBUG.*Mesaj/,
  /🔍.*Mesaj.*render.*koşulu/,
  /🔍.*Mesaj.*kontrol/
];

// Detaylı debug loglar (Level 2+)
const DEBUG_PATTERNS = [
  /🚀.*handleSubmit triggered/,
  /📐.*Emsal türü eklendi/,
  /📊.*Current formData/,
  /🔄.*CalculationType:/,
  /✅.*Form validation/,
  /🔍.*API Response Detail/
];

// Gürültülü loglar (Level 3+ veya filtrelenecek) - Bu loglar DEBUG_LEVEL=1'de gizlenir
const NOISE_PATTERNS = [
  /Download the React DevTools/,
  /react-dom-client.development.js/,
  /scheduler.development.js/,
  /📍.*konum yüklendi/,
  /KML katmanları yüklendi/,
  /🔍.*Looking for key/,
  /✅.*Key exists/,
  /🖼️.*ResultDisplay props/,
  /⏳.*Showing loading state/,
  /📞.*Calling/,
  /🔬.*Debug Info/,
  /📋.*Available calculations/,
  /🎲.*calculationFunction/,
  /🔍.*DEBUG/,
  /🔄.*CalculationForm.*handleInputChange/,
  /✅.*CalculationForm.*State updated/,
  /📊.*CalculationForm.*Current formData/,
  /📊.*CalculationForm.*Should show/,
  /🎯.*CalculationForm.*Arazi vasfı/,
  /🔄.*harita değerine geri döndürülüyor/,
  /🔄.*Harita verisi pasif ediliyor/
];

// Filtreleme fonksiyonu
function shouldShowLog(message, level) {
  const messageStr = String(message);

  // Level 0: Sadece hata logları
  if (DEBUG_LEVEL === 0) {
    return false; // console.error ayrı işlenir
  }

  // Önemli logları her zaman göster (Level 1+)
  if (IMPORTANT_PATTERNS.some(pattern => pattern.test(messageStr))) {
    return true;
  }

  // Level 1: Sadece önemli loglar
  if (DEBUG_LEVEL === 1) {
    return false;
  }

  // Level 2: Önemli + Debug loglar
  if (DEBUG_LEVEL === 2) {
    if (DEBUG_PATTERNS.some(pattern => pattern.test(messageStr))) {
      return true;
    }
    // Gürültülü logları filtrele
    return !NOISE_PATTERNS.some(pattern => pattern.test(messageStr));
  }

  // Level 3: Tüm loglar
  return true;
}

// Console metodlarını override et
console.log = function(...args) {
  if (shouldShowLog(args[0])) {
    originalLog.apply(console, args);
  }
};

console.warn = function(...args) {
  if (DEBUG_LEVEL >= 1) {
    originalWarn.apply(console, args);
  }
};

console.error = function(...args) {
  // Hataları her zaman göster
  originalError.apply(console, args);
};

// Debug level kontrolü için global fonksiyon
window.setDebugLevel = function(level) {
  localStorage.setItem('DEBUG_LEVEL', level.toString());
  window.location.reload(); // Sayfayı yenile
};

// Başlangıç mesajı
originalLog(`🔧 Console filtreleme aktif (Level ${DEBUG_LEVEL}). Değiştirmek için: setDebugLevel(0-3)`);
originalLog(`📋 Debug Levels: 0=Sadece hatalar, 1=Önemli işlemler, 2=Detaylı debug, 3=Tüm loglar`);

export { DEBUG_LEVEL };
