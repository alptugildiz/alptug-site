# Deploy — CapRover + Cloudflare

Uygulama `output: "standalone"` ile build edilir ve `Dockerfile` ile paketlenir. İmaj **GitHub Actions'ta** build edilip GHCR'a (`ghcr.io/alptugildiz/alptug-site`) gönderilir; CapRover sadece hazır imajı çeker, sunucuda build yapılmaz. Port **3000**, health check **`/api/health`**.

CapRover paneli: `https://captain.5.10.220.30.nip.io` (root domain `5.10.220.30.nip.io`).

## 1. CapRover'da uygulama

1. CapRover paneli → **Apps** → `alptug-site` adında app oluştur (Persistent Data gerekmez; `/giderler` verisi için volume, 5. bölümdeki override ile bağlanır).
2. App → **HTTP Settings** → *Container HTTP Port* = `3000`.
3. **Connect New Domain**: `alptugildiz.com` ve `www.alptugildiz.com`.
4. App → **Deployment** → *Method 1: Official CLI* bölümünden **App Token** üret (CI bunu kullanacak).

## 2. Cloudflare DNS + HTTPS

Sıra önemli, çünkü Let's Encrypt doğrulaması Cloudflare proxy'si açıkken takılabilir.

1. Cloudflare → DNS: `A @ → 5.10.220.30` ve `A www → 5.10.220.30` kayıtlarını **DNS only (gri bulut)** olarak ekle. (Panel nip.io üzerinde olduğu için `captain` kaydı gerekmez.)
2. CapRover → app → her domain için **Enable HTTPS**, ardından **Force HTTPS by redirecting all HTTP traffic to HTTPS** seçeneğini aç.
3. Sertifika alındıktan sonra `@` ve `www` kayıtlarını **Proxied (turuncu bulut)** yap.
4. Cloudflare → SSL/TLS → mod: **Full (strict)**. *Flexible* kullanma, yönlendirme döngüsüne girer.
5. (Opsiyonel) Cloudflare → Rules → `www` → apex 301 yönlendirmesi.

> Let's Encrypt yenilemesi (90 gün) turuncu bulut altında HTTP-01 ile genelde sorunsuz çalışır. Takılırsa alternatif: Cloudflare → SSL/TLS → Origin Server → **Origin Certificate** (15 yıl) üret, CapRover'da *Use custom certificate* ile yükle.

## 3. Otomatik deploy (GitHub Actions)

`.github/workflows/deploy.yml`, `main`'e her push'ta:

1. **check**: lint + `next typegen` + typecheck
2. **build**: Docker imajını build edip `ghcr.io/alptugildiz/alptug-site:sha-<commit>` ve `:latest` olarak GHCR'a gönderir
3. **deploy**: CapRover'a o commit'in imajını çalıştırmasını söyler

GHCR paketi **public** olmalı (CapRover imajı giriş yapmadan çeker): GitHub → profil → Packages → `alptug-site` → Package settings → Change visibility → Public.

Repo → Settings → Secrets and variables → Actions → **Environment `production`** altında şu üçünü ekle:

| Secret | Örnek |
| --- | --- |
| `CAPROVER_URL` | `https://captain.5.10.220.30.nip.io` |
| `CAPROVER_APP` | `alptug-site` |
| `CAPROVER_APP_TOKEN` | 1. adımda üretilen app token |

Ardından Settings → Secrets and variables → Actions → **Variables** sekmesinde `CAPROVER_ENABLED = true` değişkenini ekle. Bu değişken yokken deploy job'u atlanır, lint/typecheck/build kontrolleri yine de çalışır.

Eski bir sürüme dönmek: CapRover → app → **Deployment** → *Method 6: Deploy via ImageName* → `ghcr.io/alptugildiz/alptug-site:sha-<eski-commit>`. Ya da GitHub → Actions → eski bir çalıştırma → **Re-run jobs**.

## 4. SSH'ı Cloudflare Tunnel arkasına almak (opsiyonel)

Amaç: 22 numaralı portu internete kapatmak, SSH'a yalnızca Cloudflare Access ile doğrulanmış kullanıcının erişmesini sağlamak.

**VPS'te:**

```bash
# cloudflared kur (Debian/Ubuntu)
curl -L https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt update && sudo apt install cloudflared
```

**Cloudflare Zero Trust paneli:**

1. Networks → Tunnels → **Create a tunnel** (Cloudflared). Panelin verdiği `sudo cloudflared service install <TOKEN>` komutunu VPS'te çalıştır.
2. Tunnel → **Public Hostname** ekle: `ssh.alptugildiz.com` → Service `SSH` → `localhost:22`.
3. Access → Applications → **Self-hosted** → domain `ssh.alptugildiz.com`. Policy: *Allow* → Emails → `alptugildiz@gmail.com` (e-posta OTP) veya GitHub login.

**Kendi bilgisayarında:**

```bash
winget install --id Cloudflare.cloudflared    # Windows
```

`~/.ssh/config`:

```
Host vps
  HostName ssh.alptugildiz.com
  User <kullanici>
  ProxyCommand cloudflared access ssh --hostname %h
```

`ssh vps` komutu tarayıcıda Access doğrulamasını açar, sonra bağlanır.

**Tünel çalıştığını doğruladıktan sonra** (ayrı bir terminalde `ssh vps` açıkken) 22'yi dışarıya kapat:

```bash
sudo ufw delete allow 22/tcp   # 80 ve 443 zaten açık
sudo ufw status
```

> Tek sunuculu kurulumda Swarm portlarını (996, 2377, 7946, 4789) **açma**; bunlar yalnızca birden fazla sunucuyu birbirine bağlamak içindir. 2377 Docker Swarm yönetim portudur.
>
> Not: Docker, yayınladığı portlarda UFW'yi atlar. CapRover'ın şifresiz 3000 portu `/etc/ufw/after.rules` içindeki `DOCKER-USER` kuralıyla kapatılmıştır.
>
> Sunucuya şifreyle SSH girişi de kullanılıyorsa, 22'yi kapatmadan önce bunu hesaba kat.

> Tünel dışında SSH erişimini kaybetmemek için VPS sağlayıcının web konsolunu (VNC/serial) yedek giriş yolu olarak hazır tut.

## 5. Giderler sayfası (`/giderler`)

Şifreli gider tablosu. Veri, konteynerde `/app/data/expenses.json` dosyasında durur (`GIDER_DATA_DIR`, Dockerfile'da ayarlı). Uygulama "Persistent Data" olmadan oluşturulduğu için volume, **Service Update Override** ile bağlanır. Bu ayar her deploy'da yeniden uygulanır.

1. CapRover → app → **App Configs** → en altta **Service Update Override**:

   ```yaml
   TaskTemplate:
     ContainerSpec:
       Mounts:
         - Type: volume
           Source: alptug-site-data
           Target: /app/data
   ```

   Volume ilk bağlandığında, imajdaki `/app/data` klasörünün `nextjs` sahipliğini alır. Volume, `/app/data`'yı içermeyen eski bir imajla oluşturulduysa root'a ait kalabilir; kayıt eklerken hata alınırsa `Source`'u yeni bir isimle değiştir (ör. `alptug-site-data2`) ve kaydet. Bunu yeni imaj deploy edildikten **sonra** yap.

2. CapRover → app → **App Configs** → **Environmental Variables**:

   | Değişken | Değer |
   | --- | --- |
   | `GIDER_ALPTUG_PASSWORD` | Alptuğ'un şifresi |
   | `GIDER_GAMZE_PASSWORD` | Gamze'nin şifresi |

   Şifreler sunucu env'inde düz metin durur (panel erişimi zaten sunucuya tam erişim demek); başka yerde kullanılan bir şifre koyma. Oturum cookie'sinin imza anahtarı iki şifreden türetilir, bu yüzden şifrelerden biri değişince herkesin oturumu kapanır. İkisinden biri eksikse sayfa "Sunucu yapılandırılmamış" der.

3. **Kalıcılık testi:** giriş yap, bir test kaydı gir, CapRover'da *Save & Restart* yap (ya da yeni bir deploy bekle). Kayıt duruyorsa volume çalışıyor. Sonra test kaydını sil.

Arama motorları: `/giderler` altındaki her yanıt `X-Robots-Tag: noindex, nofollow` başlığıyla döner (`next.config.ts`), sayfada da aynı meta etiketi var. `robots.txt`'ye bilerek eklenmedi: orada engellenen bir sayfayı Google tarayamaz, `noindex`'i göremez ve adres de herkese ilan edilmiş olur.

Yedek: sayfadaki **JSON indir** butonu tüm kayıtları indirir.

Yerelde: `.env.local`'e aynı iki değişkeni koy; veri proje kökündeki `data/` klasörüne yazılır (gitignore'da).

## 6. Doğrulama

```bash
curl -sI https://alptugildiz.com | grep -iE "^(HTTP|cf-ray|server)"   # 200 + cf-ray
curl -s https://alptugildiz.com/api/health                          # {"status":"ok",...}
```
