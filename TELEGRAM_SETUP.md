# Telegram Bot Kurulum Rehberi

## 1. Telegram Bot Oluşturun (1 dakika)

1. Telegram'da **@BotFather** adlı bot'a mesaj yazın
2. `/newbot` komutunu girin
3. Bot'a bir isim verin (örn: "BDO Boss Timer")
4. Bot'a benzersiz bir username verin (örn: "bdo_boss_timer_bot")
5. **Bot Token** alacaksınız (bunu saklayın!)

Örnek token: `1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh`

## 2. Kendi Chat ID'nizi Alın (1 dakika)

1. Yeni oluşturduğunuz bot'a `/start` yazın
2. Aşağıdaki linke gidin (BOT_TOKEN'ı değiştirin):
   ```
   https://api.telegram.org/botBOT_TOKEN/getUpdates
   ```
3. JSON'da `chat` kısmında `id` sayısını bulun. Bu sizin Chat ID'niz.

Örnek: `"chat":{"id":123456789}`

## 3. .env.local Dosyasına Ekleyin

```env
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh
NEXT_PUBLIC_TELEGRAM_CHAT_ID=123456789
```

**Not:** `NEXT_PUBLIC_` ön eki sayesinde client tarafında kullanılabilir (frontend'de).

## 4. Bitti! ✅

Boss 10 dakika kaldığında Telegram'da otomatik bildirim alacaksınız.
