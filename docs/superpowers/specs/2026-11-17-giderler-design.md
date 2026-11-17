# Gider takip sayfası (`/giderler`) — tasarım

## Amaç

Alptuğ ve Gamze'nin kişisel harcamalarını ayrı ayrı girip birbirlerininkini de görebildiği, şifreli, küçük bir gider tablosu. Amaç sadece "kim, hangi kategoride, ne kadar harcamış" sorusunu görmek.

## Hedefler

- İki kullanıcı (alptug, gamze), şifreyle giriş.
- Her kullanıcı kendi giderlerini ekler, düzenler, siler; iki kişinin tablosu da iki kişiye görünür.
- Seçilen ay için kişi başına kategori toplamları ve genel toplam.
- Kategoriler (sabit liste): ulaşım, kozmetik, yemek, faturalar, psikolog, spor, tatlı/abur cubur, ev giderleri, giyim, diğer.

## Hedef dışı

- Ortak harcama, bölüşüm, borç hesabı. (Açıkça istenmedi.)
- Kullanıcı kaydı / şifre sıfırlama arayüzü; kullanıcılar env'de sabit.
- Grafikler, bütçe limitleri, çoklu para birimi (her şey ₺).

## Anti-hedefler

- Veritabanı veya ayrı bir servis kurmak.
- CapRover'da yeni uygulama açmak ya da deploy pipeline'ına / GitHub secret'larına dokunmak.
- Sayfanın arama motorlarında görünmesi veya ana sitede linklenmesi.

## Kısıtlar

- Next.js 16 (App Router, standalone output), CapRover'da tek konteyner, `nextjs` (uid 1001) kullanıcısıyla çalışıyor.
- Kalıcılık: mevcut CapRover uygulamasına *Service Update Override* ile `alptug-site-data` volume'ü `/app/data`'ya bağlandı (kullanıcı ekledi). Deploy sonrası test kaydıyla kalıcılık doğrulanacak.
- Yeni npm bağımlılığı eklenmeyecek; şifre hash'i ve cookie imzası `node:crypto` ile.

## Yaklaşımlar

1. **Kalıcı volume'de JSON dosyası — seçilen.** Ek servis yok, iki kişilik veri için yeterli. Volume mevcut uygulamaya YAML override ile eklendi; uygulama yeniden oluşturulmadı.
2. **CapRover one-click Postgres.** Ayrı servis + DB katmanı; iki kişi için gereksiz iş. Volume yöntemi çalışmazsa yedek plan.
3. **GitHub'a JSON commit'lemek.** Yavaş, token yönetimi, eşzamanlı yazımda çakışma. Elendi.
4. (localStorage elendi: veriler iki kişi arasında paylaşılamaz. Yeni CapRover uygulaması elendi: kullanıcı istemedi.)

## Kararlar

- **Adres:** `/giderler`; `noindex`, `robots.ts`'de disallow, sitemap'te yok, sitede link yok.
- **Kimlik doğrulama:**
  - Env: `GIDER_ALPTUG_PASSWORD_HASH`, `GIDER_GAMZE_PASSWORD_HASH` (scrypt, `salt:hash` hex), `GIDER_SESSION_SECRET`.
  - Hash üretmek için `scripts/` altında küçük bir Node script'i.
  - Girişte kullanıcı adı + şifre; başarılıysa HMAC imzalı, `httpOnly`, `secure`, `sameSite=lax` cookie, 30 gün.
  - Sunucu tarafında her istekte cookie doğrulanır; yazma işlemleri yalnızca kaydın sahibine izinli.
  - Yanlış şifre denemelerine basit bellek içi gecikme/limit.
- **Veri:** `${GIDER_DATA_DIR ?? "./data"}/expenses.json`; yerelde `./data` gitignore'da.
  - Kayıt: `{ id, owner: "alptug"|"gamze", date: "YYYY-MM-DD", amount (kuruş, tamsayı), category, note?, createdAt }`.
  - Yazımlar süreç içinde sıraya alınır, geçici dosya + rename ile atomik yazılır.
- **Dockerfile:** runner aşamasında `/app/data` oluşturulup `nextjs`'e verilir (volume ilk bağlanışta bu sahipliği alır).
- **Görünüm:** Ay seçici (varsayılan bu ay). Alptuğ ve Gamze için iki bölüm: her birinde gider listesi, kategori toplamları, ay toplamı. Giriş yapan kullanıcı kendi bölümüne kayıt ekleme formu görür. Mobilde bölümler alt alta.
- **Yedek:** Giriş yapmış kullanıcı için "JSON indir" butonu.
- **Stil:** Sitenin mevcut HUD diliyle uyumlu, ama ana sayfanın animasyon/boot efektleri olmadan sade bir araç sayfası.

## Builder'a bırakılanlar

- Mutasyonlar için Server Actions mı route handler mı (Next 16 dokümanlarına göre).
- Bileşen bölünmesi, tablo düzeninin ayrıntıları, düzenleme etkileşimi (satır içi ya da form).
- Giriş sayfasının görünümü.
