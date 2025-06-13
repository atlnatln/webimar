# "Zeytin ağaçlı + tarla" Özelliği - Manual Test Checklist

## 🎯 Test URL
http://localhost:3000/bag-evi

## ✅ Test Adımları

### 1. Form Alanları Kontrolü
- [ ] Arazi vasfı dropdown'ında "Zeytin ağaçlı + tarla" seçeneği var mı?
- [ ] Bu seçeneği seçtiğinizde 2 yeni alan görünüyor mu?
  - [ ] "Tarla Alanı (m²)" input alanı
  - [ ] "Zeytin Ağacı Adedi" input alanı
- [ ] Diğer form alanları (normal alan, dikili alan) gizleniyor mu?

### 2. Form Validation Testi
#### Test Senaryosu 1: Başarılı
- [ ] Tarla Alanı: `25000`
- [ ] Zeytin Ağacı Adedi: `150` (6 ağaç/dekar - başarılı)
- [ ] "Hesapla" butonuna tıklayın
- [ ] **Beklenen**: İzin verilebilir sonucu

#### Test Senaryosu 2: Ağaç Yoğunluğu Fazla
- [ ] Tarla Alanı: `20000`  
- [ ] Zeytin Ağacı Adedi: `250` (12.5 ağaç/dekar - fazla)
- [ ] "Hesapla" butonuna tıklayın
- [ ] **Beklenen**: İzin verilemez sonucu

#### Test Senaryosu 3: Yetersiz Alan
- [ ] Tarla Alanı: `15000`
- [ ] Zeytin Ağacı Adedi: `90`
- [ ] "Hesapla" butonuna tıklayın
- [ ] **Beklenen**: İzin verilemez sonucu

### 3. Sonuç Ekranı Kontrolü
- [ ] Sonuç "HESAPLAMA SONUCU" başlığı ile geliyor mu? (VARSAYIMSAL yok)
- [ ] Manuel kontrol butonları GİZLİ mi?
  - [ ] "Manuel Kontrol" butonu yok
  - [ ] "Harita" butonu yok
- [ ] Sonuç mesajında "varsayımsal" kelimesi YOK mu?
- [ ] "Manuel kontrol önerilir" uyarısı YOK mu?

### 4. Backend API Kontrolü (Console Test)
- [ ] F12 ile konsolu açın
- [ ] `quick-test-console.js` içeriğini kopyalayıp yapıştırın
- [ ] API sonucunda:
  - [ ] `hesaplama_tipi: "kesin"`
  - [ ] `izin_durumu: "izin_verilebilir"` (başarılı senaryoda)
  - [ ] Varsayımsal etiketler yok

## 🎉 Başarı Kriterleri

### ✅ Tüm bu kontrollerden geçerse:
1. **Form alanları doğru görünüyor**
2. **Validasyon kuralları çalışıyor**
3. **Sonuç ekranı doğru formatlanmış**
4. **Manuel kontrol butonları gizli**
5. **Backend kesin sonuç dönüyor**
6. **Varsayımsal etiketler yok**

## 🚨 Bilinen Özellikler

### "Zeytin ağaçlı + tarla" vs "Tarla + Zeytinlik" Farkları:
- **Zeytin ağaçlı + tarla**: Sadece TARLA alanı hesaplanır, ağaç ADEDİ sorulur
- **Tarla + Zeytinlik**: Hem tarla hem zeytinlik ALANI hesaplanır
- **Zeytin ağaçlı + tarla**: Dekara 10+ ağaç varsa → RET
- **Tarla + Zeytinlik**: Ağaç sayısı kontrolü YOK

### Form Davranışı:
- **Zeytin ağaçlı + tarla**: Direkt sonuç, manuel kontrol yok
- **Tarla + Zeytinlik**: Varsayımsal sonuç, manuel kontrol önerisi var

## 📞 Sorun Durumunda:
1. Backend loglarını kontrol edin: `django runserver` terminali
2. Frontend loglarını kontrol edin: Browser console
3. API endpoint'ini test edin: http://127.0.0.1:8000/api/calculations/bag-evi/
