# Cloudflare Worker Kurulum Rehberi

## Adım 1: Cloudflare Dashboard'a Git

1. https://dash.cloudflare.com/ adresine git
2. Mevcut Cloudflare hesabınla giriş yap (Warp için kullandığın hesap)

## Adım 2: Worker Oluştur

1. Sol menüden **"Workers & Pages"** tıkla
2. **"Create application"** butonuna tıkla
3. **"Create Worker"** seç
4. Worker'a isim ver: `confluence-proxy` (veya istediğin isim)
5. **"Deploy"** butonuna tıkla

## Adım 3: Worker Kodunu Ekle

1. Deploy'dan sonra **"Edit code"** butonuna tıkla
2. Sol paneldeki **TÜM varsayılan kodu sil**
3. `confluence-worker.js` dosyasındaki **TÜM kodu kopyala**
4. Cloudflare editörüne yapıştır
5. Sağ üstteki **"Save and Deploy"** butonuna tıkla

## Adım 4: Environment Variables Ekle (ÖNEMLİ!)

Worker deploy edildikten sonra, API key'lerini güvenli bir şekilde eklememiz gerekiyor:

1. Worker sayfasında **"Settings"** sekmesine tıkla
2. **"Variables and Secrets"** bölümüne git
3. **"Add variable"** butonuna tıkla
4. Şu 3 değişkeni ekle:

**Variable 1:**
- Name: `CONFLUENCE_EMAIL`
- Value: `yarkin.akcil@gusto.com`
- **"Encrypt"** seçeneğini TIKLA ✅

**Variable 2:**
- Name: `CONFLUENCE_API_KEY`
- Value: `(Senin Confluence API Key'in - ATATT... ile başlayan)`
- **"Encrypt"** seçeneğini TIKLA ✅

**Variable 3:**
- Name: `CONFLUENCE_DOMAIN`
- Value: `gustohq.atlassian.net`
- Encrypt gerekmez (bu public bilgi)

5. **"Save and Deploy"** tıkla

## Adım 5: Worker URL'ini Kopyala

Deploy edildikten sonra, Worker URL'ini göreceksin:

```
https://confluence-proxy.SENIN-KULLANICI-ADIN.workers.dev
```

**Bu URL'i kopyala!** Sonraki adımda kullanacağız.

## Adım 6: URL'i Bana Gönder

Worker URL'ini bana gönder, ben de `learning-page.html` dosyasını güncelleyeceğim!

## Adım 7: Test Et

Worker'ı test etmek için tarayıcıda şu adresi aç:

```
https://WORKER-URL-IN/?query=test
```

JSON formatında Confluence sonuçları görmelisin!

---

## Sorun Giderme

### Worker çalışmıyor?
- Tüm kodu doğru kopyaladığından emin ol
- "Save and Deploy" tıkladığından emin ol
- URL'de `?query=test` parametresini kullandığından emin ol

### CORS hatası hala var mı?
- Worker URL'ini doğru kullandığından emin ol
- Worker'ın deployed olduğundan emin ol (yeşil tik işareti)

### API hatası alıyorsun?
- API token'ın doğru olduğundan emin ol
- Confluence URL'inin doğru olduğundan emin ol

---

## Güvenlik Notu

API anahtarın Worker kodunda gömülü. Bu güvenlidir çünkü:
- ✅ Kod Cloudflare sunucularında çalışır (tarayıcıda değil)
- ✅ Kullanıcılar API anahtarını göremez
- ✅ Sadece Worker API'ye erişebilir

İsterseniz daha sonra Cloudflare Environment Variables kullanarak daha da güvenli hale getirebilirsiniz.


