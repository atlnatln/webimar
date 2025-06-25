# HAR İTA ENTEGRASYONU VE KML KONTROLLERİ SÜRECİ

## 🎯 AMAÇ
Kullanıcının harita üzerinden nokta seçerek farklı coğrafi bölgelere göre uyarı ve kontroller yapılması.

## 📋 GEREKSİNİMLER

### 1. TEMEL HAR İTA KONTROLLERI
- **İzmir KML Sınırları**: `/home/akn/Genel/web/webimar-react/public/Büyük Ovalar İzmir.kml`
- **Kapalı Su Havzası**: `/home/akn/Genel/web/webimar-api/calculations/static_files/izmir_kapali_alan.kml`
- **Yasal Dayanak**: `/home/akn/Genel/web/webimar-api/calculations/static_files/5403_sayili_kanun.md`
- **Genelge**: `/home/akn/Genel/web/webimar-api/calculations/static_files/genelge.md`

### 2. KONTROL SENARYOLARI

#### 2.1 İzmir Sınırları Dışı
- **Durum**: Seçilen nokta İzmir KML sınırları dışında
- **Aksiyon**: Uyarı balonu göster
- **Mesaj**: "Hesaplamalarımız sadece İzmir ili sınırları içinde yapılabilmektedir. Lütfen harita üzerinden İzmir sınırları içinde bir nokta seçiniz."

#### 2.2 Büyük Ova Koruma Alanı
- **Durum**: Seçilen nokta "Büyük Ovalar İzmir.kml" içinde
- **Aksiyon**: Bilgi bileşeni göster
- **Genel Mesaj**: "Harita üzerinde seçtiğiniz nokta büyük ova koruma alanı içerisinde kaldığı için işlemler normalden daha uzun sürecektir."
- **Ek Mesaj (Bağ Evi & Sera hariç)**: "Harita üzerinden seçtiğiniz yerdeki arazinizin alternatifi büyük ova dışında bulunuyorsa talebiniz reddedilecektir."
- **Modal İçeriği**: 5403 sayılı kanun Madde 14

#### 2.3 Kapalı Su Havzası (Hayvancılık/Tarımsal Ürün Yıkama)
- **Durum**: Seçilen nokta "izmir_kapali_alan.kml" içinde + Hayvancılık tesisi veya Tarımsal ürün yıkama seçili
- **Aksiyon**: Su tahsis belgesi kontrolü
- **Soru**: "Su tahsis belgeniz var mı?"
- **Hayır ise**: İzin verilemez uyarısı
- **Modal İçeriği**: Genelge kapalı su havzası bölümü

#### 2.4 Bağ Evi Modal Haritası
- **Durum**: Bağ evi hesaplamasında açılan alan kontrol modallarında
- **Aksiyon**: Seçilen noktayı alan kontrol haritalarında da göster

## 🔧 UYGULAMA ADIMLARI

### Adım 1: KML Dosyalarını Kontrol Et
- [ ] İzmir büyük ova KML dosyasının varlığını kontrol et
- [ ] Kapalı su havzası KML dosyasının varlığını kontrol et
- [ ] KML parser'ının doğru çalıştığını doğrula

### Adım 2: Harita Click Handler'ı Güncelle
- [ ] Tıklanan noktanın KML poligonları içinde olup olmadığını kontrol et
- [ ] İzmir sınırları kontrolü ekle
- [ ] Büyük ova kontrolü ekle
- [ ] Kapalı su havzası kontrolü ekle

### Adım 3: UI Bileşenlerini Oluştur
- [ ] Uyarı balonları için Toast/Alert bileşeni
- [ ] Bilgi kartları için InfoCard bileşeni
- [ ] Modal dialog bileşeni (yasal metinler için)
- [ ] Su tahsis belgesi soru formu

### Adım 4: Context ve State Yönetimi
- [ ] Seçilen nokta bilgilerini sakla
- [ ] KML kontrol sonuçlarını state'e ekle
- [ ] Form validasyonlarını güncelle

### Adım 5: Bağ Evi Modal Entegrasyonu
- [ ] Ana haritadaki seçili noktayı alan kontrol modallarına geçir
- [ ] AlanKontrol bileşenini güncelle

## 📁 DOSYA YAPISI

```
webimar-react/
├── src/
│   ├── components/
│   │   ├── Map/
│   │   │   ├── MapClickHandler.tsx (YENİ)
│   │   │   ├── KMLController.tsx (YENİ)
│   │   │   └── LocationInfoCard.tsx (YENİ)
│   │   ├── Modals/
│   │   │   ├── BuyukOvaModal.tsx (YENİ)
│   │   │   └── SuTahsisModal.tsx (YENİ)
│   │   └── Alerts/
│   │       └── LocationAlert.tsx (YENİ)
│   ├── utils/
│   │   ├── kmlChecker.ts (YENİ)
│   │   └── locationValidator.ts (YENİ)
│   └── contexts/
│       └── LocationContext.tsx (GÜNCELLE)
```

## 🎯 HEDEF KULLANICI DENEYİMİ

1. **Kullanıcı haritaya tıklar**
2. **Sistem tıklanan noktayı analiz eder**
3. **Uygun uyarı/bilgi mesajlarını gösterir**
4. **Form gereksinimlerini günceller**
5. **Kullanıcı formu doldurabilir veya uyarılara göre harekete eder**

## ⚠️ ÖNEMLİ NOTLAR
- KML dosyalarının düzenli güncellenmesi gerekebilir
- Performans için KML kontrolleri cache'lenebilir
- Mobil uyumluluk göz önünde bulundurulmalı
- Accessibility standartlarına uygun UI tasarımı

---
**Başlangıç Tarihi**: 25 Haziran 2025
**Tamamlanma Tarihi**: 25 Haziran 2025
**Durum**: ✅ TAMAMLANDI

## 🎉 BAŞARIYLA İMPLEMENTE EDİLDİ

### ✅ Tamamlanan Özellikler:
1. **LocationValidationContext** - Merkezi konum doğrulama sistemi
2. **KML Checker** - İzmir, Büyük Ova ve Kapalı Su Havzası kontrolü
3. **Form Blocking** - Geçersiz konum seçiminde form engelleme
4. **LocationInfoCard** - Kullanıcı dostu bilgilendirme kartları
5. **BuyukOvaModal** - 5403 sayılı kanun Madde 14 detayları + Bağ evi harita entegrasyonu
6. **SuTahsisModal** - Su tahsis belgesi kontrolü ve yasal açıklamalar
7. **Dinamik Uyarılar** - Yapı tipine göre özelleşmiş mesajlar

### 🔧 Teknik Detaylar:
- **Frontend**: React 18 + TypeScript + Styled Components + Leaflet
- **Backend**: Django 5.2 + Django REST Framework
- **KML Parsing**: Custom JavaScript KML parser
- **State Management**: React Context API
- **Performance**: Lazy loading, memoization, cache strategies

### 🧪 Test Edildi:
- ✅ İzmir dışı nokta seçimi → Form bloklanır
- ✅ Büyük Ova içi → Bilgilendirme ve yasal modal
- ✅ Kapalı su havzası + Su gereken tesis → Su belgesi kontrolü
- ✅ Bağ evi modalında seçilen nokta haritası
- ✅ Responsive design ve mobile uyumluluk

### 🚀 Canlı Sunucular:
- **Frontend**: http://localhost:3000
- **Backend**: http://127.0.0.1:8000
- **Status**: Her iki server da başarıyla çalışıyor

---

**KML DENETİM SİSTEMİ BAŞARIYLA ENTEGRASYONa HAZIR! 🎯**
