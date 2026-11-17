# Giderler raporu (`/giderler/rapor`) — tasarım

## Amaç

Gider tablosuna, ayları karşılaştırmak ve seçilen bir tarih aralığındaki harcamayı görmek için bir rapor sayfası eklemek. Rapor PDF olarak saklanabilmeli.

## Hedefler

- Seçilen tarih aralığının özeti: toplam, kişi dağılımı, kategori toplamları.
- Ay ay karşılaştırma: satırlar kategoriler, sütunlar aralıktaki aylar; her hücrede tutar ve bir önceki aya göre değişim; üstte aylık toplamların çubuk grafiği.
- Filtreler: başlangıç/bitiş tarihi, hazır kısayollar (Bu ay, Son 3 ay, Son 6 ay, Bu yıl), kişi (İkimiz / Alptuğ / Gamze).
- PDF: tarayıcının yazdır → "PDF olarak kaydet" akışı, kâğıda uygun görünümle.

## Hedef dışı

- Sunucuda PDF üretmek (kullanıcı tarayıcı yazdırmayı seçti).
- Excel/CSV çıktısı, bütçe/hedef, ortak harcama.

## Yaklaşımlar (PDF)

1. **Tarayıcı yazdırma + print stylesheet — seçilen.** Yeni paket yok, çıktı ekranla aynı, Türkçe karakter sorunu yok. Bedeli: yazdır penceresinde bir tık.
2. Sunucuda PDF kütüphanesi ile dosya üretmek. Doğrudan dosya iner ama rapor ikinci kez yazılır, font gömme ve bakım yükü var. Elendi.

## Kararlar

- **Adres:** `/giderler/rapor`, giderler sayfasının üst barından "Rapor" linki; rapordan "Giderler"e geri link. Oturum yoksa `/giderler`'e yönlendirir. `X-Robots-Tag` zaten `/giderler/:path*` altını kapsıyor; sayfaya da `noindex` metadata.
- **URL parametreleri:** `bas`, `bit` (YYYY-MM-DD), `kisi` (`ikimiz` | `alptug` | `gamze`). Geçersiz/eksikse varsayılan: Son 3 ay (iki ay öncesinin 1'i → bugün), `ikimiz`. `bas > bit` ise yer değiştirilir.
- **Kısayollar** (bugüne göre, İstanbul saati): Bu ay = ayın 1'i → bugün; Son 3 ay / Son 6 ay = (n-1) ay öncesinin 1'i → bugün; Bu yıl = 1 Ocak → bugün.
- **Özet:** aralıktaki kayıtlar, kişi filtresine göre. `ikimiz` iken iki kişinin toplamı ayrıca gösterilir. Kategori listesi, giderler sayfasındaki çubuklu görünümle aynı.
- **Ay ay:** aralığın kapsadığı her ay bir sütun. Uçtaki aylar yalnızca aralık içindeki günlerle sayılır ve "kısmi" diye işaretlenir; içinde bulunulan ay "devam ediyor" diye işaretlenir. Satırlar: aralıkta harcaması olan kategoriler + Toplam satırı. Değişim: önceki ay > 0 ise yüzde (▲/▼, tam sayıya yuvarlanmış), eşitse "=", önceki 0 ve bu ay > 0 ise "yeni", ilk sütunda değişim yok.
- **Grafik:** aylık toplam çubukları, düz HTML/CSS (kütüphane yok). `ikimiz` iken kişi başına yığılı iki renk (Alptuğ: signal yeşili, Gamze: krem).
- **PDF:** "PDF kaydet" butonu `window.print()` çağırır. `@media print`: beyaz zemin, koyu metin, scanline/grain/butonlar/filtre kontrolleri gizli, yerine tek satır filtre özeti ("1 Eyl 2026 – 17 Kas 2026 · İkimiz"); tablo satırları sayfa sonunda bölünmez. Sayfa başlığı (`document.title`) PDF dosya adı önerisi olarak "Giderler raporu 1 Eyl – 17 Kas 2026" olur.
- **Mantık** `src/lib/giderler/report.ts`'de saf fonksiyonlar, `node:test` ile test edilir; UI ince kalır.

## Builder'a bırakılanlar

- Bileşen bölünmesi, filtre formunun etkileşimi (form GET ile ya da router ile).
- Grafik ve tablonun ayrıntılı görünümü, mobilde tablonun yatay kaydırması.
