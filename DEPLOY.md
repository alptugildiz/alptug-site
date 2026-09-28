# Deploy — CapRover + Cloudflare

Uygulama `output: "standalone"` ile build edilir, `Dockerfile` ile paketlenir, CapRover `captain-definition` üzerinden build alır. Port **3000**, health check **`/api/health`**.

## 1. CapRover'da uygulama

1. CapRover paneli → **Apps** → `alptug-site` adında app oluştur (Persistent Data gerekmez).
2. App → **HTTP Settings** → *Container HTTP Port* = `3000`.
3. **Connect New Domain**: `alptugildiz.com` ve `www.alptugildiz.com`.
4. App → **Deployment** → *Method 1: Official CLI* bölümünden **App Token** üret (CI bunu kullanacak).

## 2. Cloudflare DNS + HTTPS

Sıra önemli, çünkü Let's Encrypt doğrulaması Cloudflare proxy'si açıkken takılabilir.

1. Cloudflare → DNS: `A @ → VPS_IP` ve `A www → VPS_IP` kayıtlarını **DNS only (gri bulut)** olarak ekle. CapRover panelinin kendi alt alanı (`captain.alptugildiz.com` veya wildcard `*.alptugildiz.com`) da gri kalsın.
2. CapRover → app → her domain için **Enable HTTPS**, ardından **Force HTTPS by redirecting all HTTP traffic to HTTPS** seçeneğini aç.
3. Sertifika alındıktan sonra `@` ve `www` kayıtlarını **Proxied (turuncu bulut)** yap.
4. Cloudflare → SSL/TLS → mod: **Full (strict)**. *Flexible* kullanma, yönlendirme döngüsüne girer.
5. (Opsiyonel) Cloudflare → Rules → `www` → apex 301 yönlendirmesi.

> Let's Encrypt yenilemesi (90 gün) turuncu bulut altında HTTP-01 ile genelde sorunsuz çalışır. Takılırsa alternatif: Cloudflare → SSL/TLS → Origin Server → **Origin Certificate** (15 yıl) üret, CapRover'da *Use custom certificate* ile yükle.

## 3. Otomatik deploy (GitHub Actions)

`.github/workflows/deploy.yml`, `main`'e her push'ta lint, typecheck ve build çalıştırır, ardından CapRover'a deploy eder.

Repo → Settings → Secrets and variables → Actions → **Environment `production`** altında şu üçünü ekle:

| Secret | Örnek |
| --- | --- |
| `CAPROVER_URL` | `https://captain.alptugildiz.com` |
| `CAPROVER_APP` | `alptug-site` |
| `CAPROVER_APP_TOKEN` | 1. adımda üretilen app token |

Ardından Settings → Secrets and variables → Actions → **Variables** sekmesinde `CAPROVER_ENABLED = true` değişkenini ekle. Bu değişken yokken deploy job'u atlanır, lint/typecheck/build kontrolleri yine de çalışır.

Elle deploy: `npx caprover deploy` (interaktif) veya panelden **Deploy via upload** (`tar` dosyası).

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
sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw allow 996/tcp && sudo ufw allow 7946 && sudo ufw allow 4789/udp && sudo ufw allow 2377/tcp  # CapRover/Swarm
sudo ufw delete allow 22/tcp   # veya OpenSSH kuralı
sudo ufw enable && sudo ufw status
```

> Tünel dışında SSH erişimini kaybetmemek için VPS sağlayıcının web konsolunu (VNC/serial) yedek giriş yolu olarak hazır tut.

## 5. Doğrulama

```bash
curl -sI https://alptugildiz.com | grep -iE "^(HTTP|cf-ray|server)"   # 200 + cf-ray
curl -s https://alptugildiz.com/api/health                          # {"status":"ok",...}
```
