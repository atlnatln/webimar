# HARİTA ENTEGRASYONu TEST CHECKLIST

## DÜZELTME ÖNCESİ SORUNLAR

### ✅ 1. İzmir Poligon Dolgusu
- **SORUN**: İzmir poligonu yarı saydam yeşil dolgu gösteriyordu
- **ÇÖZÜM**: `fillColor: 'transparent'` ve `fillOpacity: 0` olarak güncellendi
- **DOSYA**: `KMLLayerManager.tsx`

### ✅ 2. Koordinat ve İzmir Sınırları Mesajı
- **SORUN**: İzmir içinde iken koordinat ve "İzmir sınırları içinde" mesajı gösteriliyordu
- **ÇÖZÜM**: Sadece İzmir dışında gösterilecek şekilde güncellendi
- **DOSYA**: `LocationInfoCard.tsx`

### 🔍 3. Büyük Ova Uyarısı
- **SORUN**: Büyük ova içinde nokta seçildiğinde uyarı çıkmıyor
- **TEST EDİLECEK**: Debug log'ları eklendi
- **DOSYA**: `LocationInfoCard.tsx`

### 🔍 4. Su Tahsis Belgesi Kutucuğu
- **SORUN**: Hayvancılık/tarımsal ürün yıkama + kapalı su havzası için kutucuk çıkmıyor
- **TEST EDİLECEK**: Debug log'ları eklendi
- **DOSYA**: `LocationInfoCard.tsx`

### ✅ 5. Modal Harita Zoom
- **SORUN**: Modal açıldığında haritada zoom yapılmıyor
- **ÇÖZÜM**: Zoom seviyesi 18'e çıkarıldı ve marker event handler eklendi
- **DOSYA**: `BuyukOvaModal.tsx`

## TEST ADMLARI

### Test 1: İzmir Dışı Nokta
1. Haritada İzmir sınırları dışında bir nokta seç
2. ✅ Koordinat bilgisi gösterilmeli
3. ✅ "İzmir sınırları dışında" hatası gösterilmeli

### Test 2: İzmir İçi + Normal Alan
1. Haritada İzmir içi, ova dışı bir nokta seç
2. ❌ Koordinat bilgisi gösterilmemeli
3. ❌ İzmir sınırları mesajı gösterilmemeli
4. ✅ "Konum Uygun" mesajı gösterilmeli

### Test 3: Büyük Ova İçi Nokta
1. Haritada Büyük Ova içi bir nokta seç (örn: Menemen)
2. ✅ "Büyük Ova Koruma Alanı İçinde" uyarısı çıkmalı
3. ✅ "Detayları Gör" butonu çalışmalı
4. ✅ Modal açıldığında harita zoom yapmalı

### Test 4: Kapalı Su Havzası + Hayvancılık
1. Tarımsal yapı türü olarak hayvancılık tesisi seç
2. Kapalı su havzası içi nokta seç
3. ✅ "Kapalı Su Havzası İçinde" uyarısı çıkmalı
4. ✅ "Su Belgesi Kontrol" butonu çıkmalı

### Test 5: İzmir Poligon Görünümü
1. Harita açıldığında
2. ✅ Sadece İzmir sınır çizgileri görünmeli
3. ❌ Dolgu rengi görünmemeli
4. ❌ Diğer KML katmanları görünmemeli

## DEBUG LOG'LARI

Console'da şu log'ları kontrol et:
- `🔍 LocationInfoCard render:` - Component render bilgisi
- `🔍 Water permit check:` - Su tahsis kontrol bilgisi
- `🔍 KML kontrol başlıyor:` - KML kontrol başlangıcı
- `✅ KML kontrol sonucu:` - KML kontrol sonucu

## TEST SONUÇLARI

### Büyük Ova Testi
- [ ] Debug log'ları görünüyor mu?
- [ ] `buyukOvaIcinde: true` değeri geliyor mu?
- [ ] Uyarı kartı gösteriliyor mu?

### Su Tahsis Testi
- [ ] `needsWaterPermit: true` değeri geliyor mu?
- [ ] `kapaliSuHavzasiIcinde: true` değeri geliyor mu?
- [ ] Su tahsis modal butonu gösteriliyor mu?

## YÜKLEME KONTROLÜ

KML dosyalarının yüklenip yüklenmediğini kontrol et:
```
📊 Mevcut KML verileri: {
  izmirSiniri: X,
  buyukOvalar: Y, 
  kapaliSuHavzasi: Z
}
```

Tüm değerler 0'dan büyük olmalı.
