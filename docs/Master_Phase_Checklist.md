# ORIAS.ID TOP UP — Master Phase Checklist

Satu file untuk Phase 00–15. Setiap phase dipecah jadi task kecil (satu task = satu chat Claude) supaya muat di batas pesan Claude free tier. Centang `[x]` setelah task selesai dan lolos cek.

**Stack final:** React + TypeScript (strict) + Vite + Tailwind CSS + React Router. Backend: Supabase (Postgres, Auth, RLS, Storage, Realtime, Edge Functions).

**Dokumen rujukan** (jangan lampirkan semuanya sekaligus, hanya bab yang disebut di tiap task):
- `TS` = Technical Specification (ORIAS_ID_TopUp_Technical_Specification)
- `DB` = Database & API Technical Specification (ORIAS_ID_TopUp_Database_API_Technical_Specification)
- `UI` = UI/UX Frontend Technical Specification (ORIAS_ID_TopUp_UI_UX_Frontend_Technical_Specification)

---

## Keputusan produk tetap (berlaku untuk semua task)

- Produk digital: tidak ada shipping, alamat, inventory fisik, keranjang, atau wishlist. Satu order = satu produk.
- Alur top up: **ID game (hanya jika game ID_BASED) → nominal → WhatsApp → metode pembayaran → Bayar**. Game VOUCHER tidak pernah meminta ID.
- Nomor WhatsApp **wajib** di setiap order (untuk dihubungi jika terjadi error). Email opsional.
- Setelah Bayar, pengguna masuk ke **halaman proses realtime** `/invoice/:invoiceNumber` dengan stepper: Menunggu Pembayaran → Diproses → Sukses. Belum bayar = progres berhenti di titik 1.
- Invoice dibuat saat order dibuat. Halaman **Cek Transaksi** menerima nomor invoice lalu masuk ke halaman proses realtime yang sama.
- Guest boleh bertransaksi tanpa login. Akses guest ke invoice hanya lewat Edge Function, bukan baca tabel.
- Orias.ID berdiri sendiri: **tidak ada integrasi OAS, OFM, OSS**.

---

## Cara pakai (baca sekali)

1. Kerjakan berurutan. Jangan loncat phase. Jangan mulai task berikutnya sebelum task sebelumnya dicentang.
2. Satu task = satu chat baru. Lampirkan hanya: bab spec yang tercantum di task, file hasil task sebelumnya yang relevan, dan Handoff Mini terakhir.
3. Tempel **Prompt Task** (di bawah), ganti bagian dalam `[...]`, lalu salin teks task dari phase terkait.
4. Claude tidak bisa menjalankan Supabase, payment, atau supplier milikmu. Bagian "uji" yang butuh layanan live: minta Claude menulis langkah uji manual singkat (gunakan sandbox payment dan supplier), kamu jalankan sendiri, lalu centang.
5. Kalau chat hampir habis sebelum task selesai, minta Claude berhenti dan tulis Handoff Mini dengan status `PARTIAL`. Lanjutkan di chat baru. Jangan paksa menyelesaikan semuanya dalam satu chat.

### Batas ukuran task (supaya ringan)
- Maksimal 1 concern per task (misalnya hanya migration, atau hanya service, atau hanya satu halaman UI).
- Maksimal sekitar 3–6 file baru/diubah per task.
- Dilarang menyentuh phase lain. Dilarang refactor di luar scope.
- Minta Claude menulis file lengkap, tanpa `// TODO` dan tanpa placeholder.

### Aturan tetap (berlaku untuk semua task)
- Ikuti spec. Jangan menambah tabel, kolom, endpoint, atau library di luar spec. Usul tambahan ditulis sebagai "USULAN", tidak dikerjakan.
- Spec ambigu atau bertentangan: berhenti dan tanya.
- Temuan bug/masalah saat bekerja: jangan hanya dicatat. Perbaiki saat itu juga; kalau itu keputusan pemilik proyek, langsung tanya sambil tawarkan solusi.
- Logika bisnis kritis (harga, order, pembayaran, fulfillment, diskon, refund) hanya di server (RLS / SQL function / Edge Function). Total dari client tidak pernah dipercaya.
- Komponen UI tidak memanggil Supabase langsung; lewat `src/services`.
- Perubahan database hanya lewat migration berversi. Jangan melemahkan RLS demi kemudahan.
- TypeScript strict, tanpa `any`. Warna/spacing/radius hanya dari design token.
- Tiap UI wajib punya state loading, empty, error, success, dan responsive.
- Jangan ada secret di frontend (termasuk env `VITE_*`). Kredensial payment dan supplier hanya di server.
- Jangan menulis ID game, nomor WhatsApp, atau kode voucher mentah ke log.
- Jangan menambah framework/dependency besar tanpa alasan teknis tertulis.

### Prompt Task (salin dan isi)

```
Kamu mengerjakan ORIAS.ID TOP UP [PXX-Tn — judul task]. Stack: React + TypeScript strict + Vite + Tailwind + Supabase.
Rujukan spec terlampir: [DB 7, 15 / UI 13 / dst]. Spec adalah sumber kebenaran; jangan menambah di luar spec dan tanya kalau ambigu.
Keputusan produk tetap: alur ID (hanya ID_BASED) → nominal → WhatsApp wajib → metode bayar → Bayar → halaman proses realtime; tanpa integrasi OAS/OFM/OSS.

Scope task ini SAJA:
[tempel teks task]

Selesai bila:
[tempel "Selesai bila"]

Aturan: file lengkap tanpa placeholder, 1 concern, jangan sentuh phase/fitur lain, logika kritis di server.
Mulai dengan rencana singkat (file yang dibuat/diubah + asumsi + pertanyaan) dan tunggu "lanjut". Setelah itu tulis kode per file dengan path lengkap.
Akhiri dengan Handoff Mini. Jangan lanjut ke task berikutnya.
```

### Handoff Mini (format akhir tiap task, singkat)

```
TASK [PXX-Tn] — Status: COMPLETE / PARTIAL / BLOCKED
Dibuat/diubah: ...
Migration: ...
Cara uji + hasil: ...
Temuan yang sudah diperbaiki: ...
Masalah diketahui / butuh keputusan: ...
Ditunda: ...
```

---

## Ringkasan progres

- [x] Phase 00 — Project Initialization & Architecture
- [ ] Phase 01 — Database + Authentication + Security
- [ ] Phase 02 — Game & Product Catalog + Admin Management
- [ ] Phase 03 — Storefront + Game Discovery
- [ ] Phase 04 — Top Up Form + Order & Invoice
- [ ] Phase 05 — Supplier + Fulfillment
- [ ] Phase 06 — Payment Integration
- [ ] Phase 07 — Halaman Proses Realtime + Invoice + Cek Transaksi
- [ ] Phase 08 — Promotion + Coupon Engine
- [ ] Phase 09 — Customer Account + ID Tersimpan + Reviews
- [ ] Phase 10 — Notification System (WhatsApp)
- [ ] Phase 11 — Admin Dashboard + Management
- [ ] Phase 12 — Analytics + Reporting
- [ ] Phase 13 — Security Hardening + Comprehensive Testing
- [ ] Phase 14 — Performance + SEO + PWA
- [ ] Phase 15 — Final QA + Production Readiness

Sebuah phase dicentang hanya jika semua task dan semua Acceptance di phase itu sudah dicentang.

---

## Phase 00 — Project Initialization & Architecture

**Tujuan:** fondasi proyek. Belum ada fitur top up.

- [x] **P00-T1 — Init proyek.** Buat proyek Vite + React + TypeScript strict + Tailwind + React Router; ESLint/Prettier dasar; `.gitignore`; `.env.example`.
  Rujukan: TS 2, 4, 31. Selesai bila: `npm run dev` dan `npm run build` jalan tanpa error.
- [x] **P00-T2 — Struktur folder.** Buat struktur `src/lib`, `features`, `components`, `services`, `pages`, `admin`, `types`, `utils` beserta peta route kosong (halaman placeholder minimal) sesuai spec.
  Rujukan: TS 4, UI 39, 40. Selesai bila: semua route di spec (termasuk `/game/:slug`, `/invoice/:invoiceNumber`, `/cek-transaksi`) terdaftar dan tidak ada file monolit.
- [x] **P00-T3 — Design token + tema Tailwind.** Token warna (termasuk token step transaksi), tipografi, spacing, radius, shadow, animasi sebagai CSS variable dan dipetakan ke Tailwind theme; halaman contoh kecil untuk memeriksa token.
  Rujukan: UI 2–5, 28, 33. Selesai bila: tidak ada warna/ukuran hardcode di komponen contoh.
- [x] **P00-T4 — Client Supabase, config, error, logging.** `supabase client`, `config.ts` dari env, pembungkus error terstandar (kode error stabil), konvensi logging yang tidak mencetak data pribadi.
  Rujukan: DB 17, 18, 26, 27; TS 24, 31. Selesai bila: env terpisah dari source dan tidak ada secret di client.
- [x] **P00-T5 — Migration + dokumentasi.** Setup folder `supabase/migrations` + `seed`, penamaan migration berversi, dan README singkat (cara install, jalan, build, migrasi).
  Rujukan: DB 28; TS 31. Selesai bila: developer baru bisa menjalankan proyek hanya dari README.

**Acceptance Phase 00**
- [x] Aplikasi bisa boot
- [x] Env terpisah dari kode sumber
- [x] Struktur folder sesuai spec TS/DB/UI
- [x] Tidak ada file monolit
- [x] Developer baru paham cara start dan build
- [x] Handoff Mini terakhir sudah disimpan

---

## Phase 01 — Database + Authentication + Security

- [x] **P01-T1 — Migration identitas & role.** Tabel profiles, roles, user_roles, konvensi kolom (id, timestamp, soft delete bila spec menyebut), seed role.
  Rujukan: DB 3, 4; TS 5, 26. Selesai bila: migration berjalan bersih dari database kosong.
- [x] **P01-T2 — Tabel referensi + saved_game_accounts.** Categories, publishers, dan saved_game_accounts beserta constraint dan index.
  Rujukan: DB 3, 4, 5, 14; TS 14. Selesai bila: foreign key dan constraint sesuai spec.
- [x] **P01-T3 — Audit infrastruktur.** Tabel audit log + fungsi pencatatan; tidak bisa diubah/dihapus oleh client.
  Rujukan: DB 13; TS 21. Selesai bila: aksi sensitif contoh tercatat.
- [x] **P01-T4 — RBAC + RLS.** Kebijakan RLS untuk semua tabel di atas, fungsi cek role, mutasi sensitif hanya lewat fungsi server.
  Rujukan: DB 16, 21; TS 5, 21. Selesai bila: user A tidak bisa membaca data user B; client tidak bisa menulis kolom sensitif.
- [ ] **P01-T5 — Supabase Auth di frontend.** `auth.ts`, halaman login/register/logout, route guard (redirect + simpan tujuan), pemisahan customer vs admin. Login bersifat opsional untuk top up.
  Rujukan: UI 8, 35, 36; TS 5. Selesai bila: login/logout jalan, halaman admin tertutup untuk customer, dan halaman publik bisa dipakai tanpa login.
- [x] **P01-T6 — Seed dev + uji batas akses.** Seed data aman untuk dev dan skrip/langkah uji akses tidak sah.
  Rujukan: DB 16, 29. Selesai bila: tes akses tidak sah (anon, customer, admin) terdokumentasi dan lulus.

**Acceptance Phase 01**
- [ ] Autentikasi bekerja
- [ ] Pemisahan customer/admin bekerja
- [x] RLS mencegah akses data antar user
- [x] Mutasi sensitif tidak bisa ditulis langsung oleh client
- [x] Migration reproducible

---

> Catatan: P01-T5 dan acceptance "Autentikasi bekerja" / "Pemisahan customer/admin bekerja" menunggu uji manual dengan project Supabase asli (lihat README bagian Uji manual auth). Kode, typecheck, lint, dan build sudah lulus.

---

## Phase 02 — Game & Product Catalog + Admin Management

- [ ] **P02-T1 — Migration katalog.** Games (dengan `fulfillment_type`), game_input_fields, products (nominal), product_prices; index dan constraint (slug/SKU unik, harga ≥ 0, status valid, game VOUCHER tidak boleh punya input field).
  Rujukan: DB 5, 14; TS 6. Selesai bila: constraint menolak SKU duplikat, harga tidak valid, dan input field pada game VOUCHER.
- [ ] **P02-T2 — RLS katalog + services.** Kebijakan baca publik (hanya yang aktif) dan tulis admin; `game-service`, `product-service` + validasi + tipe.
  Rujukan: DB 16, 17, 18; UI 34. Selesai bila: customer tidak bisa menulis; cost_price dan data admin-only tidak bocor ke publik.
- [ ] **P02-T3 — Admin: daftar & form game.** CRUD game (create/edit/archive), tipe fulfillment, banner/cover, SEO dasar.
  Rujukan: UI 24, 28–31; TS 6, 19. Selesai bila: admin bisa buat, ubah, arsipkan game dan memilih ID_BASED atau VOUCHER.
- [ ] **P02-T4 — Admin: field input ID dinamis.** Editor game_input_fields (label, tipe, regex validasi, urutan) hanya untuk game ID_BASED.
  Rujukan: UI 24; DB 5; TS 6. Selesai bila: field tersimpan, validasi regex diuji, dan editor tersembunyi untuk VOUCHER.
- [ ] **P02-T5 — Admin: nominal + harga.** CRUD produk/nominal per game, harga jual dan modal, margin tampil, perubahan harga mencatat product_prices.
  Rujukan: UI 24; DB 5; TS 6. Selesai bila: setiap perubahan harga muncul di riwayat harga dan validasi menolak data tidak valid.
- [ ] **P02-T6 — Admin: kategori, publisher, upload media.** CRUD kategori/publisher, Supabase Storage bucket + kebijakan, upload cover/banner.
  Rujukan: DB 5, 16; UI 24, 37. Selesai bila: gambar terunggah, tampil, dan hanya admin yang bisa upload.

**Acceptance Phase 02**
- [ ] Admin bisa create/edit/archive game dan nominal
- [ ] Field ID dinamis berfungsi dan hanya untuk ID_BASED
- [ ] Riwayat harga tercatat
- [ ] Upload media berfungsi
- [ ] Service katalog mengembalikan data valid tanpa data admin-only

---

## Phase 03 — Storefront + Game Discovery

- [ ] **P03-T1 — Layout global.** Header (tanpa keranjang/wishlist), footer, navigasi, layout responsif.
  Rujukan: UI 6–9. Selesai bila: tampil benar di mobile dan desktop dan ada tautan Cek Transaksi.
- [ ] **P03-T2 — Komponen GameCard + state.** Kartu game dengan badge tipe, state maintenance, loading skeleton, empty, error.
  Rujukan: UI 12, 29–31. Selesai bila: semua state tampil benar.
- [ ] **P03-T3 — Halaman /games + filter/sort.** Daftar game, filter kategori/publisher/tipe, sorting, paginasi; state filter di URL query.
  Rujukan: UI 11, 22, 35; DB 25; TS 7. Selesai bila: filter/sort bekerja dan back/forward browser benar.
- [ ] **P03-T4 — Search.** Search dengan debounce, dukungan alias, hasil di URL.
  Rujukan: UI 22, 37; TS 7. Selesai bila: pencarian berfungsi (mis. "ML") dan tidak spam request.
- [ ] **P03-T5 — Halaman top up (tampilan).** `/game/:slug`: info game, grid nominal (DenominationCard), tampilan berbeda untuk ID_BASED dan VOUCHER, belum submit.
  Rujukan: UI 13, 28; TS 6, 8. Selesai bila: game VOUCHER tidak menampilkan langkah ID dan penomoran langkah menyesuaikan.
- [ ] **P03-T6 — Homepage + kategori + SEO metadata.** Homepage sesuai spec (termasuk kolom Cek Transaksi cepat), halaman kategori, metadata unik per route.
  Rujukan: UI 10, 38; TS 22. Selesai bila: setiap halaman publik punya title/description unik.

**Acceptance Phase 03**
- [ ] Guest bisa menelusuri game dan nominal
- [ ] Search/filter/sort berfungsi
- [ ] Halaman top up berfungsi di mobile dan desktop
- [ ] State loading/empty/error ada
- [ ] Data admin-only tidak bocor ke storefront

---

## Phase 04 — Top Up Form + Order & Invoice

- [ ] **P04-T1 — Migration order & invoice.** Orders (snapshot, `invoice_number`, `realtime_key`, `contact_phone` wajib, constraint account_input vs tipe game), order_status_history; trigger snapshot immutable.
  Rujukan: DB 7, 14, 15; TS 10. Selesai bila: snapshot tidak bisa diubah, WhatsApp kosong/invalid ditolak, account_input wajib hanya untuk ID_BASED.
- [ ] **P04-T2 — State machine order.** Transisi yang diizinkan di server (compare-and-set) + pencatatan history + event domain + fungsi `order_step`.
  Rujukan: DB 8, 15, 23; TS 10, 25. Selesai bila: transisi tidak sah ditolak dan pemetaan status → step benar.
- [ ] **P04-T3 — Fungsi validasi & hitung order (server).** Validasi game/produk aktif, format account_input terhadap game_input_fields, normalisasi + validasi WhatsApp, fee metode bayar, total.
  Rujukan: DB 2, 15, 17; TS 8. Selesai bila: manipulasi harga di client tidak berpengaruh dan ID/WhatsApp tidak valid ditolak dengan kode error stabil.
- [ ] **P04-T4 — Fungsi create-order transaksional.** Buat order + invoice_number tak mudah ditebak + realtime_key + history awal dalam satu transaksi, dengan idempotency key; payment masih stub terdokumentasi (diisi Phase 06).
  Rujukan: DB 7, 15, 22, 23. Selesai bila: order dibuat atomik dan request ganda tidak membuat order ganda.
- [ ] **P04-T5 — UI form top up.** GameIdForm dinamis (hanya ID_BASED), pilih nominal, PhoneInput WhatsApp wajib, pilih metode bayar (daftar dari config), OrderSummary, tombol Bayar dengan state processing, redirect ke `/invoice/:invoiceNumber` (halaman sementara).
  Rujukan: UI 13, 14, 29–31; TS 8. Selesai bila: alur sampai order + invoice tercipta, game VOUCHER tanpa langkah ID, dan submit ganda dicegah.

**Acceptance Phase 04**
- [ ] Order + invoice dibuat transaksional
- [ ] Harga dan total divalidasi server
- [ ] WhatsApp wajib dan tervalidasi
- [ ] ID hanya diminta untuk game ID_BASED
- [ ] Snapshot order immutable dan transisi state ditegakkan

---

## Phase 05 — Supplier + Fulfillment

> Tentukan satu supplier di awal phase ini dan tulis namanya di prompt. Kode lain hanya bicara ke adapter. Gunakan sandbox supplier.

- [ ] **P05-T1 — Migration supplier & fulfillment.** Suppliers, supplier_products, product_supplier_mappings, supplier_balances, fulfillment_attempts (partial unique attempt aktif), voucher_codes (terenkripsi).
  Rujukan: DB 6, 10, 14; TS 11, 26. Selesai bila: dua attempt aktif untuk satu order ditolak database.
- [ ] **P05-T2 — Adapter supplier.** Interface seragam (checkAccount, createTransaction, getStatus, getBalance) + satu implementasi; secret hanya di server.
  Rujukan: DB 17, 23; TS 11, 24. Selesai bila: tidak ada kode spesifik supplier di luar folder adapter.
- [ ] **P05-T3 — Validasi akun (nickname).** Edge Function + service + rate limiting; sambungkan ke form top up (menampilkan nickname).
  Rujukan: DB 17, 19, 26; TS 8, 21. Selesai bila: nickname tampil, ID salah memberi pesan jelas, dan request berlebih dibatasi.
- [ ] **P05-T4 — Fulfillment service.** Kirim ke supplier hanya untuk order PAID (idempotent, `supplier_ref_id` unik), callback supplier terverifikasi, polling untuk PENDING_SUPPLIER, transisi ke SUCCESS/FAILED.
  Rujukan: DB 10, 15, 22, 23; TS 11. Selesai bila: retry/callback ganda tidak menggandakan top up. (Uji dengan aksi dev "tandai PAID".)
- [ ] **P05-T5 — Failover + sinkronisasi + voucher.** Failover ke supplier fallback (bukan untuk ACCOUNT_INVALID), sinkronisasi produk/harga supplier, penyimpanan kode voucher terenkripsi.
  Rujukan: DB 6, 10; TS 11. Selesai bila: failover hanya pada error supplier dan kode voucher tidak terbaca oleh client.
- [ ] **P05-T6 — Saldo supplier + auto-maintenance.** Snapshot saldo, alert saldo rendah, produk otomatis maintenance bila supplier tidak dapat dipakai.
  Rujukan: DB 6, 23, 27; TS 11, 19. Selesai bila: produk masuk maintenance dan kembali aktif sesuai kondisi saldo/supplier.

**Acceptance Phase 05**
- [ ] Nickname tervalidasi lewat supplier
- [ ] Top up tidak pernah terkirim ganda
- [ ] Callback/polling menghasilkan status akhir yang benar
- [ ] Failover berfungsi tanpa melanggar aturan ACCOUNT_INVALID
- [ ] Secret supplier hanya di server

---

## Phase 06 — Payment Integration

> Tentukan satu payment gateway di awal phase ini dan tulis namanya di prompt. Gunakan sandbox.

- [ ] **P06-T1 — Migration payment + adapter.** Payments, payment_transactions (unik per event provider), refunds; interface adapter provider.
  Rujukan: DB 9, 14; TS 12. Selesai bila: tidak ada kode spesifik provider di luar folder adapter.
- [ ] **P06-T2 — Pembuatan payment (Edge Function).** Buat payment saat create-order (QRIS/VA/e-wallet), simpan instruksi bayar, expiry; ganti stub P04-T4; secret hanya di server.
  Rujukan: DB 9, 15, 22; TS 12, 21. Selesai bila: payment tercipta bersama order dan tidak ada secret di client.
- [ ] **P06-T3 — Webhook idempotent + verifikasi.** Verifikasi signature, simpan event, replay aman.
  Rujukan: DB 9, 22; TS 12, 21. Selesai bila: webhook dikirim dua kali tidak menggandakan efek.
- [ ] **P06-T4 — Sambungkan ke order & fulfillment.** Sukses → PAID → PROCESSING → panggil fulfillment; job expire order; pembayaran terlambat tidak menghidupkan order EXPIRED (masuk antrean refund).
  Rujukan: DB 8, 15, 23; TS 10, 12. Selesai bila: status order konsisten pada sukses, gagal, expired, dan late payment.
- [ ] **P06-T5 — Refund otomatis.** FAILED → REFUND_PENDING → REFUNDED lewat provider, pencatatan di refunds dan history.
  Rujukan: DB 9, 15; TS 11, 12. Selesai bila: order gagal berujung refund tercatat dan tidak bisa direfund dua kali.

**Acceptance Phase 06**
- [ ] Pembayaran sukses diverifikasi server lewat webhook
- [ ] Replay webhook aman
- [ ] Order expired tidak memanggil supplier
- [ ] Late payment masuk antrean refund
- [ ] Refund otomatis berfungsi dan idempotent
- [ ] Secret hanya di server

---

## Phase 07 — Halaman Proses Realtime + Invoice + Cek Transaksi

- [ ] **P07-T1 — Edge Function get-invoice + akses guest.** Data aman (ID dan WhatsApp disamarkan, instruksi bayar hanya saat menunggu, kode voucher hanya saat SUCCESS), respons not-found generik, rate limiting.
  Rujukan: DB 16, 20; TS 9.4. Selesai bila: guest tidak bisa membaca tabel langsung dan data sensitif tidak bocor.
- [ ] **P07-T2 — Realtime + fallback polling.** Trigger broadcast ke `invoice:{realtime_key}`, `InvoiceService.subscribeStatus`, hook `order-tracker` (realtime + polling bertahap, berhenti pada status final).
  Rujukan: DB 20, 27; TS 9.1; UI 34. Selesai bila: status berubah di UI tanpa refresh dan tetap jalan saat realtime diputus.
- [ ] **P07-T3 — UI stepper halaman proses.** OrderStepper 3 titik (Menunggu Pembayaran → Diproses → Sukses), progres berhenti di titik 1 saat belum bayar, aria-live, reduced motion.
  Rujukan: UI 15, 29–33; TS 9.1. Selesai bila: step berpindah otomatis dan tidak bergantung warna saja.
- [ ] **P07-T4 — Instruksi bayar + kondisi khusus.** PaymentInstruction + CountdownTimer di step 1; tampilan Kedaluwarsa, Dibatalkan, Gagal, Refund; VoucherCodeReveal di step 3.
  Rujukan: UI 15; TS 9.1, 12, 13. Selesai bila: setiap kondisi punya tampilan dan aksi pemulihan (Top up lagi, Hubungi CS).
- [ ] **P07-T5 — Invoice view + cetak/unduh.** InvoiceView, layout cetak, salin nomor invoice.
  Rujukan: UI 16; TS 9.2. Selesai bila: invoice dapat dicetak/diunduh dan data pribadi tersamarkan.
- [ ] **P07-T6 — Cek Transaksi.** Halaman `/cek-transaksi`, redirect ke halaman proses, pesan generik, penanganan rate limit, riwayat lokal opsional (hanya nomor invoice).
  Rujukan: UI 17, 36; DB 20; TS 9.3. Selesai bila: invoice valid masuk ke halaman proses yang sama dan enumerasi dibatasi.

**Acceptance Phase 07**
- [ ] Setelah klik Bayar, pengguna masuk ke halaman proses realtime
- [ ] Belum bayar = progres di titik Menunggu Pembayaran; setelah bayar masuk Diproses lalu Sukses
- [ ] Invoice tersedia sejak order dibuat dan bisa dicetak/diunduh
- [ ] Cek Transaksi masuk ke halaman proses yang sama
- [ ] Guest hanya mengakses lewat Edge Function; data sensitif tersamarkan

---

## Phase 08 — Promotion + Coupon Engine

- [ ] **P08-T1 — Migration promosi.** Promotions, rules (game, produk, metode bayar, user baru), usage; batas penggunaan, jendela tanggal, `allow_below_cost`.
  Rujukan: DB 11, 14; TS 15. Selesai bila: constraint batas diskon dan tanggal ada.
- [ ] **P08-T2 — Fungsi validasi & hitung diskon (server).** Validasi kupon, batas global/per user (guest via WhatsApp), scope, batas maksimum diskon, larangan harga di bawah modal.
  Rujukan: DB 11, 15, 22. Selesai bila: kupon invalid/expired/over-limit gagal dengan aman.
- [ ] **P08-T3 — Integrasi create-order + pencegahan double usage.** Pakai kupon di total server; pemakaian dicatat transaksional.
  Rujukan: DB 15, 22; TS 15. Selesai bila: kupon tidak bisa dipakai dua kali pada race.
- [ ] **P08-T4 — UI kode promo.** Tautan "Punya kode promo?" di form top up, pesan error manusiawi, ringkasan diskon.
  Rujukan: UI 13, 14, 31. Selesai bila: pesan jelas untuk semua kasus gagal.
- [ ] **P08-T5 — Admin promosi.** CRUD promosi dengan validasi dan peringatan harga di bawah modal.
  Rujukan: UI 27; TS 15. Selesai bila: admin bisa buat, ubah, nonaktifkan promosi.

**Acceptance Phase 08**
- [ ] Kupon valid diterapkan benar
- [ ] Kupon invalid/expired/over-limit gagal aman
- [ ] Diskon tidak melebihi batas atau merugikan di bawah modal tanpa persetujuan
- [ ] Double usage dicegah secara transaksional
- [ ] Total tetap otoritatif di server

---

## Phase 09 — Customer Account + ID Tersimpan + Reviews

- [ ] **P09-T1 — Dashboard akun + profil.** Ringkasan akun, edit profil.
  Rujukan: UI 18; TS 18. Selesai bila: customer bisa melihat dan mengubah profilnya.
- [ ] **P09-T2 — ID game tersimpan.** CRUD saved_game_accounts, pilih akun tersimpan satu klik di form top up (hanya ID_BASED).
  Rujukan: UI 19, 13; DB 4; TS 14. Selesai bila: akun tersimpan terisi otomatis di form dan hanya milik user sendiri.
- [ ] **P09-T3 — Riwayat transaksi + keamanan akun.** Daftar transaksi yang membuka halaman proses yang sama; ganti password/email dengan autentikasi ulang.
  Rujukan: UI 18; TS 18, 21. Selesai bila: riwayat hanya menampilkan transaksi milik sendiri dan aksi sensitif meminta autentikasi.
- [ ] **P09-T4 — Migration + logika review (server).** Tabel review, aturan verified purchase (order SUCCESS, satu review per order), status review dikontrol server.
  Rujukan: DB 12, 16; TS 16. Selesai bila: hanya pembeli eligible yang bisa membuat review.
- [ ] **P09-T5 — UI review + ringkasan rating.** Buat review, tampilan di halaman top up, status moderasi.
  Rujukan: UI 20, 13. Selesai bila: review tampil sesuai status; customer tidak bisa mengubah status sendiri.

**Acceptance Phase 09**
- [ ] Customer bisa mengelola data akun dan ID tersimpan
- [ ] Riwayat transaksi membuka halaman proses yang sama
- [ ] Hanya customer eligible yang bisa membuat review
- [ ] Aksi akun sensitif memerlukan autentikasi yang sesuai

---

## Phase 10 — Notification System (WhatsApp)

> Tentukan penyedia WhatsApp resmi di awal phase ini dan tulis namanya di prompt.

- [ ] **P10-T1 — Migration + service notifikasi.** Tabel notifications (channel, delivery_status, unik per order+type+channel), RLS, service.
  Rujukan: DB 13, 16; TS 17. Selesai bila: user hanya membaca notifikasinya sendiri.
- [ ] **P10-T2 — Consumer event domain.** Buat pesan dari event: link invoice (ORDER_CREATED), konfirmasi bayar, hasil top up, gagal/refund; dedup untuk event ganda.
  Rujukan: DB 13, 22, 34; TS 17, 25. Selesai bila: event ganda tidak menghasilkan notifikasi ganda.
- [ ] **P10-T3 — Adapter WhatsApp + log pengiriman.** Kirim lewat penyedia resmi, catat status kirim/gagal, kegagalan kirim tidak mengganggu transaksi.
  Rujukan: DB 13, 27; TS 17. Selesai bila: pesan terkirim di sandbox dan kegagalan tercatat tanpa memblokir order.
- [ ] **P10-T4 — Notification center in-app.** Daftar, read/unread, tautan ke halaman proses invoice.
  Rujukan: UI 21. Selesai bila: status baca tersimpan dan klik membuka invoice terkait.
- [ ] **P10-T5 — Template chat manual untuk admin.** Komponen WhatsAppChatButton (wa.me + pesan template berisi nomor invoice).
  Rujukan: UI 25, 28; TS 17, 19. Selesai bila: tombol membuka chat dengan template benar tanpa menulis nomor mentah ke log.

**Acceptance Phase 10**
- [ ] Notifikasi dibuat dari domain event
- [ ] Event ganda tidak membuat notifikasi ganda
- [ ] Kegagalan WhatsApp tidak merusak transaksi
- [ ] Admin dapat menghubungi customer lewat WhatsApp dari detail order

---

## Phase 11 — Admin Dashboard + Management

- [ ] **P11-T1 — Admin shell + navigasi + visibilitas role.** Layout admin, menu berdasarkan role, guard backend.
  Rujukan: UI 23; TS 5, 19; DB 21. Selesai bila: kontrol tanpa izin tidak muncul dan ditolak di backend.
- [ ] **P11-T2 — Dashboard KPI.** KPI dari data nyata (omzet, order, success rate, pending, stuck, saldo supplier, margin, refund).
  Rujukan: UI 23; TS 19. Selesai bila: angka berasal dari database, bukan dummy.
- [ ] **P11-T3 — Manajemen order.** Daftar, filter, cari invoice/WhatsApp, detail dengan riwayat fulfillment, retry fulfillment, tandai manual, refund, antrean "Perlu dihubungi".
  Rujukan: UI 25; TS 19; DB 21. Selesai bila: tabel dapat dipakai di layar kecil dan order gagal/stuck/late payment muncul di antrean.
- [ ] **P11-T4 — Manajemen supplier, customer, review.** Supplier + mapping + saldo + maintenance, daftar customer, moderasi review; sambungkan modul game/produk/promosi ke shell admin.
  Rujukan: UI 23–27; TS 19. Selesai bila: semua modul admin dapat dijangkau dari navigasi.
- [ ] **P11-T5 — Bulk actions aman.** Konfirmasi untuk aksi massal (mis. update harga), batas aman.
  Rujukan: UI 24, 29. Selesai bila: aksi massal butuh konfirmasi eksplisit.
- [ ] **P11-T6 — Audit view.** Tampilan audit log; semua mutasi kritis tercatat.
  Rujukan: DB 13, 21; TS 21. Selesai bila: mutasi kritis (harga, refund, role, retry) muncul di audit view.

**Acceptance Phase 11**
- [ ] Dashboard admin menampilkan data nyata
- [ ] Kontrol tanpa izin tidak tersedia
- [ ] Mutasi kritis membuat audit log
- [ ] Antrean "Perlu dihubungi" berfungsi
- [ ] Bulk action terlindungi dari eksekusi tak sengaja

---

## Phase 12 — Analytics + Reporting

- [ ] **P12-T1 — Fungsi metrik penjualan & order.** Query/fungsi SQL: GMV, net revenue, margin, refund dipisahkan dengan benar.
  Rujukan: TS 20; DB 17. Selesai bila: angka dapat direproduksi dari data sumber.
- [ ] **P12-T2 — Metrik game, produk, customer, supplier, funnel.** Top game/produk, success rate supplier, waktu rata-rata PAID → SUCCESS, funnel konversi, tanpa membuka data pribadi berlebih.
  Rujukan: TS 20, 21. Selesai bila: tidak ada ID game atau nomor WhatsApp mentah yang terekspos di laporan.
- [ ] **P12-T3 — Filter rentang tanggal + view laporan.** Date range di UI, tabel/grafik sederhana.
  Rujukan: UI 23; TS 20. Selesai bila: filter tanggal mengubah semua angka dengan benar.
- [ ] **P12-T4 — Batas layanan analytics.** `analytics-service` sebagai satu-satunya pintu data analitik untuk UI.
  Rujukan: TS 20, 24. Selesai bila: UI hanya bicara lewat service, bukan query langsung.

**Acceptance Phase 12**
- [ ] Metrik dapat direproduksi dari data sumber
- [ ] Filter tanggal berfungsi
- [ ] Data sensitif customer tidak terekspos berlebihan
- [ ] Laporan membedakan gross/net/refund dengan benar

---

## Phase 13 — Security Hardening + Comprehensive Testing

- [ ] **P13-T1 — Audit Auth, RLS, otorisasi.** Tinjau semua tabel dan policy; daftar temuan dan perbaikan.
  Rujukan: DB 16, 21; TS 21. Selesai bila: tabel temuan + perbaikan dibuat.
- [ ] **P13-T2 — Validasi input, sanitasi, rate limiting, secrets.** Rate limit pada validasi ID, create order, get-invoice, cek transaksi; tutup celah input, XSS, enumerasi; cek secret terekspos.
  Rujukan: UI 36; DB 18, 26; TS 21. Selesai bila: tidak ada secret di bundle client dan endpoint rawan terbatas.
- [ ] **P13-T3 — Tes unit & integrasi alur kritis.** Harga/diskon/fee, validasi ID dan WhatsApp, pemetaan step, state machine, idempotency; Order → Payment → Fulfillment → Status.
  Rujukan: DB 29; TS 30. Selesai bila: tes alur kritis lulus.
- [ ] **P13-T4 — Tes RLS/database + abuse.** Akses order orang lain, enumerasi invoice, replay webhook payment, replay callback supplier, double send ke supplier, penyalahgunaan kupon.
  Rujukan: DB 16, 22, 29. Selesai bila: semua tes lulus dan terdokumentasi.
- [ ] **P13-T5 — Tes E2E + dokumentasi regression suite.** Game ID_BASED dan VOUCHER, isi ID/WhatsApp, bayar sandbox, stepper berpindah tanpa refresh, buka kembali lewat Cek Transaksi; cara menjalankan suite.
  Rujukan: TS 30; UI 41. Selesai bila: suite dapat dijalankan dengan satu perintah terdokumentasi.

**Acceptance Phase 13**
- [ ] Tes akses data tidak sah lulus
- [ ] Tes create order/payment/fulfillment kritis lulus
- [ ] Tes replay webhook dan callback lulus
- [ ] Tidak ada secret terekspos
- [ ] Regression suite terdokumentasi dan bisa dijalankan

---

## Phase 14 — Performance + SEO + PWA

- [ ] **P14-T1 — Performa gambar & loading.** Lazy load, ukuran responsif, WebP/AVIF, code splitting per route/admin.
  Rujukan: UI 37; TS 22. Selesai bila: bundle admin tidak dimuat di storefront dan halaman top up ringan di jaringan seluler.
- [ ] **P14-T2 — Caching & penggunaan API.** Cache katalog sesuai spec, TTL pendek untuk status maintenance, debounce, tanpa cache data invoice/payment.
  Rujukan: DB 24; UI 37. Selesai bila: request berulang berkurang tanpa data basi pada alur kritis.
- [ ] **P14-T3 — SEO teknis + keputusan SPA.** Canonical, structured data, sitemap, robots; `noindex` untuk `/invoice/*`, `/cek-transaksi`, `/orders`, `/admin`; putuskan strategi indeks untuk SPA (mis. prerender halaman game/kategori).
  Rujukan: UI 38; TS 22. Selesai bila: halaman game terindeks dengan benar dan halaman privat tidak.
- [ ] **P14-T4 — PWA foundation.** Manifest, service worker, offline shell; push notification status order bila sesuai.
  Rujukan: TS 23. Selesai bila: installable dan halaman proses tidak menyajikan status basi dari cache.

**Acceptance Phase 14**
- [ ] Halaman inti memenuhi target performa sedekat mungkin (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- [ ] Metadata SEO lengkap dan halaman privat noindex
- [ ] PWA bisa di-install jika diaktifkan
- [ ] Optimasi tidak merusak alur top up

---

## Phase 15 — Final QA + Production Readiness

- [ ] **P15-T1 — Regression end-to-end penuh.** Jalankan seluruh alur customer, guest, dan admin termasuk kasus gagal, expired, refund, dan late payment; catat cacat.
  Rujukan: UI 41, 42; DB 32. Selesai bila: daftar cacat dibuat dan diprioritaskan.
- [ ] **P15-T2 — Perbaiki cacat penghalang rilis saja.** Non-kritis ditunda ke daftar terpisah.
  Selesai bila: tidak ada cacat penghalang rilis tersisa.
- [ ] **P15-T3 — Verifikasi infrastruktur.** Migration, backup/PITR, pemisahan Dev/Staging/Production, konfigurasi deploy, webhook payment dan callback supplier di produksi, monitoring, error reporting.
  Rujukan: TS 31; DB 27, 28. Selesai bila: tiap item punya bukti atau catatan.
- [ ] **P15-T4 — Runbook, rollback, release checklist.** Dokumen produksi + rencana rollback + prosedur saldo supplier habis, supplier down, dan penanganan order stuck + daftar batasan diketahui.
  Selesai bila: runbook bisa dipakai orang lain untuk deploy, rollback, dan menangani insiden top up.

**Acceptance Phase 15**
- [ ] Deploy produksi dapat direproduksi
- [ ] Rencana backup/recovery ada
- [ ] Alur kritis customer, guest, dan admin lulus
- [ ] Monitoring/logging terkonfigurasi
- [ ] Batasan yang diketahui terdokumentasi
- [ ] Release checklist disetujui
