/**
 * Console Log Filter
 * Bu script, React uygulamasında belirli bir pattern'e sahip olmayan 
 * console.log çağrılarını filtrelemek için kullanılır.
 * 
 * Kullanım:
 * - Konsol loglarını tamamen devre dışı bırakmak için DEBUG_LEVEL = 0 ayarlayın
 * - Sadece önemli mesajları görmek için DEBUG_LEVEL = 1 ayarlayın (varsayılan)
 * - Tüm logları görmek için DEBUG_LEVEL = 2 ayarlayın
 */

// Debug seviyesi: 0=Hiçbir log, 1=Önemli loglar, 2=Tüm loglar
const DEBUG_LEVEL = 1;

// Orijinal console.log fonksiyonunu yedekle
const originalConsoleLog = console.log;

// Önemli log pattern'leri (bunlar her zaman gösterilir)
const IMPORTANT_PATTERNS = [
  '🔄 Emsal türü değişti',
  '📐 Emsal türü eklendi',
  '🎯 API Result',
  '🚀 CalculationForm - handleSubmit triggered',
  '✅ CalculationForm - Form validation passed',
  '❌ CalculationForm - Form validation failed',
  '❌ Error',
  '❌ CalculationForm - Error occurred'
];

// Debug pattern'leri (sadece DEBUG_LEVEL = 2'de gösterilir)
const DEBUG_PATTERNS = [
  '📊 CalculationForm - Current formData',
  '🔍 DEBUG',
  '📍 konum yüklendi',
  '🧹 CalculationPage',
  '✅ CalculationPage'
];

// console.log fonksiyonunu override et
console.log = function() {
  // DEBUG_LEVEL = 0 ise hiçbir log gösterme
  if (DEBUG_LEVEL === 0) return;

  const args = Array.from(arguments);
  const logMessage = args.join(' ');

  // Önemli log pattern'i varsa her zaman göster
  const isImportant = IMPORTANT_PATTERNS.some(pattern => 
    typeof logMessage === 'string' && logMessage.includes(pattern)
  );

  // Debug pattern'i varsa sadece DEBUG_LEVEL = 2'de göster
  const isDebug = DEBUG_PATTERNS.some(pattern => 
    typeof logMessage === 'string' && logMessage.includes(pattern)
  );

  // DEBUG_LEVEL = 1 ise sadece önemli logları göster
  // DEBUG_LEVEL = 2 ise tüm logları göster
  if (isImportant || DEBUG_LEVEL === 2 || (DEBUG_LEVEL === 1 && !isDebug)) {
    originalConsoleLog.apply(console, args);
  }
};

// Script'in çalıştığını bildirmek için bir log
originalConsoleLog('🔧 Console log filtreleme aktifleştirildi. (DEBUG_LEVEL = ' + DEBUG_LEVEL + ')');
