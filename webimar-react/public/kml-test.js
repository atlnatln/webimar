// Test KML dosyalarının yüklenip yüklenmediğini kontrol et
const testKMLLoad = async () => {
  console.log('🧪 KML Test başlıyor...');
  
  try {
    // İzmir KML test
    const izmirResponse = await fetch('/izmir.kml');
    console.log('İzmir KML:', izmirResponse.ok ? '✅' : '❌');
    
    // Büyük Ova KML test
    const ovaResponse = await fetch('/Büyük Ovalar İzmir.kml');
    console.log('Büyük Ova KML:', ovaResponse.ok ? '✅' : '❌');
    
    // Kapalı Su Havzası KML test
    const suResponse = await fetch('/izmir_kapali_alan.kml');
    console.log('Kapalı Su Havzası KML:', suResponse.ok ? '✅' : '❌');
    
    if (izmirResponse.ok) {
      const izmirText = await izmirResponse.text();
      console.log('İzmir KML içerik uzunluğu:', izmirText.length);
    }
    
  } catch (error) {
    console.error('❌ KML test hatası:', error);
  }
};

// Test noktaları
const testPoints = [
  { name: 'Karşıyaka (İzmir içi)', lat: 38.4565, lng: 27.1062 },
  { name: 'Menemen (Büyük Ova)', lat: 38.5826, lng: 27.0728 },
  { name: 'Ankara (İzmir dışı)', lat: 39.9334, lng: 32.8597 }
];

console.log('Test noktaları hazırlandı:', testPoints);

// Browser console'da çalıştırılabilir
window.testKMLLoad = testKMLLoad;
window.testPoints = testPoints;
