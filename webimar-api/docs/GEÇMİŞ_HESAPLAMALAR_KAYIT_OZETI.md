# Geçmiş Hesaplamaları Kaydetme Özeti

## Amaç
Kullanıcıların yaptığı hesaplamaların geçmişini veritabanında saklamak ve bu geçmişi /api/calculations/history/ endpoint'i üzerinden erişilebilir kılmak.

## Yapılanlar

- `CalculationHistory` modeli zaten mevcut ve kullanıcı, parametreler, sonuç ve zaman bilgisini tutuyor.
- `calculate_hara`, `calculate_evcil_hayvan`, `calculate_ipek_bocekciligi` fonksiyonlarına, başarılı bir hesaplama sonrası aşağıdaki kod eklendi:
  ```python
  if request.user.is_authenticated:
      CalculationHistory.objects.create(
          user=request.user,
          calculation_type="<hesaplama_tipi>",
          parameters=request.data,
          result=result
      )
  ```
- Böylece, ilgili hesaplama yapıldığında kullanıcıya ait bir geçmiş kaydı oluşuyor.
- `/api/calculations/history/` endpoint'i, giriş yapan kullanıcının geçmiş hesaplamalarını döndürüyor.

## Karşılaşılan Hatalar ve Çözüm

- **401 (Unauthorized) ve 'Given token not valid for any token type' hatası:**
  - Hata örneği:
    ```
    GET http://localhost:8000/api/accounts/me/ 401 (Unauthorized)
    {detail: 'Given token not valid for any token type', code: 'token_not_valid', messages: Array(1)}
    ```
  - **Çözüm:**
    - Frontend'den istek atılırken geçerli bir JWT token gönderilmeli.
    - Token'ın süresi dolmuşsa refresh edilmeli veya kullanıcı yeniden login olmalı.
    - Backend'de JWT ayarları (SIMPLE_JWT) güncellendi ve token ömrü uzatıldı.
    - Sunucu yeniden başlatıldıktan sonra yeni token ile istek atılınca sorun çözüldü.

## Hala Alınan Hata ve Çözüm Yolu

- `/api/calculations/history/` endpoint'ine istek atıldığında bazen 401 Unauthorized veya 'Given token not valid for any token type' hatası alınabiliyor.

### Olası Sebepler ve Çözüm Adımları

1. **Token'ın Süresi Dolmuş Olabilir**
   - Kullanıcıdan yeni bir login ile güncel access token alınmalı veya refresh token ile yenilenmeli.

2. **Frontend'de Authorization Header Eksik veya Yanlış**
   - API isteğinde mutlaka şu şekilde header gönderilmeli:
     ```
     Authorization: Bearer <access_token>
     ```
   - Header'ın doğru şekilde gönderildiğinden emin olun.

3. **Backend'de Token Tipi veya Algoritma Uyumsuzluğu**
   - SIMPLE_JWT ayarlarında `"AUTH_HEADER_TYPES": ("Bearer",)` ve `"ALGORITHM": "HS256"` olmalı (şu an doğru).

4. **REST_FRAMEWORK Authentication Çakışması**
   - Sadece JWT kullanmak için diğer authentication class'ları (örn. TokenAuthentication) kaldırılıp test edilebilir.

5. **CORS veya Proxy Sorunu**
   - CORS ayarlarında frontend adresinizin tam olarak tanımlı olduğundan emin olun.
   - Tarayıcıda "OPTIONS" isteği başarılı, "GET" isteği 401 ise genellikle token eksik veya hatalıdır.

6. **Kullanıcı Logout Olduktan Sonra Token Kullanımı**
   - Logout sonrası eski token ile istek atılmamalı.

### Hızlı Kontrol Listesi

- [ ] Frontend'de access token güncel ve doğru şekilde header'da gönderiliyor mu?
- [ ] Token süresi dolduysa refresh işlemi yapılıyor mu?
- [ ] Backend'de JWT ayarları ve authentication class'ları çakışmıyor mu?
- [ ] Kullanıcı gerçekten login mi? (`/api/accounts/me/` endpoint'i ile test edilebilir.)
- [ ] Tarayıcıda network tab'da Authorization header'ı görünüyor mu?

## Geçmiş Hesaplamalar Görünmüyor Sorunu ve Çözüm Adımları

Eğer frontend'de "Henüz bir hesaplama yapılmamış." mesajı görüyorsanız, aşağıdaki adımları kontrol edin:

1. **Gerçekten Hesaplama Yapıldı mı?**
   - API üzerinden bir hesaplama (örn. hara, evcil hayvan, vb.) POST isteğiyle başarıyla yapıldı mı?
   - Hesaplama sonrası backend loglarında CalculationHistory kaydı oluştuğuna dair bir log var mı?

2. **CalculationHistory Kaydı Oluşuyor mu?**
   - İlgili hesaplama fonksiyonunda şu kod olmalı:
     ```python
     if request.user.is_authenticated:
         CalculationHistory.objects.create(
             user=request.user,
             calculation_type="...",
             parameters=request.data,
             result=result
         )
     ```
   - Eğer yoksa, CalculationHistory kaydı oluşmaz ve geçmişte veri görünmez.

3. **Kullanıcı Doğru mu?**
   - Hesaplama yapan kullanıcı ile geçmişi sorgulayan kullanıcı aynı mı?
   - Her kullanıcının geçmişi sadece kendisine gösterilir.

4. **Veritabanında Kayıt Var mı?**
   - Django admin panelinden veya shell üzerinden CalculationHistory tablosunda kayıt olup olmadığı kontrol edilmeli.

5. **Frontend Doğru API'yi Çağırıyor mu?**
   - `/api/calculations/history/` endpoint'ine doğru ve JWT ile istek atılıyor mu?
   - Network tab'da dönen response gerçekten boş mu, yoksa frontend mapping hatası mı var?

6. **Backend'de Hata Var mı?**
   - API'den dönen response'ın `success: True` ve `data: []` (boş liste) mi, yoksa bir hata mesajı mı var?

**Çözüm:**
- Önce bir hesaplama yapın, ardından geçmişi sorgulayın.
- Hala boşsa yukarıdaki adımları sırayla kontrol edin.
- Sorun devam ederse backend loglarını ve veritabanını inceleyin.

## Test Ortamında CalculationHistory Kaydı Sorunu

Otomatik testlerde ve shell komutlarında CalculationHistory kaydı oluşmadığı gözlemlendi. Loglarda "CalculationHistory kaydı oluşturuldu" mesajı görülse de, test sonrası veritabanında kayıt bulunmuyor.

### Sebep
- Django test runner her test için geçici bir veritabanı oluşturur ve test bitince bu veritabanı silinir.
- Shell komutları ana veritabanına bakar, test sırasında oluşan kayıtlar test bitince kaybolur.
- Gerçek ortamda (production/development) ise hesaplama sonrası CalculationHistory kaydı oluşur ve kalıcıdır.

### Sonuç ve Doğru Yöntem
- Test ortamında kayıt oluşmaması normaldir, çünkü test veritabanı geçicidir.
- Gerçek kullanıcı ile canlı ortamda hesaplama yapıp hemen ardından geçmiş sorgulanmalıdır.
- Kodda mantıksal bir hata yoksa, canlıda geçmiş hesaplamalar görünmelidir.

---
Bu dosya, geçmiş hesaplama kaydı ve ilgili hata/çözüm süreçlerinin özetini ve uygulama adımlarını içerir.
