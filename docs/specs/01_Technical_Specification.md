Technical Planning & System Architecture Document — Orias.ID Game Top-Up

# 1. Product Vision

- Orias.ID adalah web top up game dan voucher digital yang cepat, jelas, dan aman.

- Target utama: katalog game, pilihan nominal, input ID game (hanya untuk game berbasis ID), pembayaran, halaman proses realtime, invoice, cek transaksi, fulfillment otomatis via supplier, promo, review, dan analytics internal.

- Prinsip produk: alur singkat (ID → nominal → metode bayar → bayar), status selalu terlihat realtime, dan tidak ada top up ke akun yang salah.

- Scope: Orias.ID berdiri sendiri. Tidak ada integrasi ke sistem lain (OAS, OFM, OSS).

# 2. Recommended Tech Stack

- Frontend: React, TypeScript (strict mode), Vite, Tailwind CSS, React Router.

- Backend: Supabase — PostgreSQL, Authentication, Storage, Row Level Security (RLS), Edge Functions, Realtime (untuk progres proses order).

- Supplier/provider top up (contoh agregator di Indonesia: Digiflazz, VIP Reseller, Apigames; pilih setelah cek harga, uptime, dan syarat) diakses lewat adapter di Edge Functions, tidak pernah dari browser.

- Operasi kritis (buat order, kirim ke supplier, refund, ubah harga) harus lewat service/API layer.

# 3. High-Level Architecture

- Customer → Orias.ID Storefront → API/Business Logic Layer → Database / Payment Gateway / Supplier API.

- Alur inti: Order + invoice dibuat → customer diarahkan ke halaman proses → customer bayar → webhook payment terverifikasi → sistem kirim permintaan ke supplier → callback/polling supplier → order sukses atau gagal (refund).

- Setiap perubahan status order di database langsung diterima halaman proses melalui Realtime.

# 4. Project Architecture

- Public routes: / (home), /games, /game/:slug (halaman top up), /invoice/:invoiceNumber (halaman proses realtime + invoice), /cek-transaksi (input nomor invoice), /promo, /orders (riwayat, login), /profile.

- Admin routes: /admin (dashboard), /admin/games, /admin/products (nominal), /admin/orders, /admin/suppliers, /admin/customers, /admin/promotions, /admin/reports, /admin/settings. Di-lazy-load sebagai bundle terpisah.

- src/lib: router.tsx, queryClient/state setup, supabase client (api.ts), auth.ts, config.ts, events.ts.

- src/features: games, topup (form ID + nominal + metode bayar), orders, order-tracker (halaman proses realtime), invoice, payment, fulfillment, promotions, customers, reviews, supplier-sync.

- src/components: navbar, game-card, denomination-picker, game-id-form, payment-method-picker, step-progress, modal, toast, pagination.

- src/services: game-service, product-service, order-service, invoice-service, payment-service, fulfillment-service, supplier-service (satu-satunya lapisan yang memanggil Supabase/API).

- src/types, src/utils (currency, validation, formatter, security), supabase (migrations, functions, seed).

# 5. User Roles

- Guest: browse game, top up tanpa login, buka halaman proses via link invoice, cek transaksi dengan nomor invoice.

- Customer: akun, riwayat order, ID game tersimpan, kupon, notifikasi, review.

- Staff: CS (cek/retry order), finance (verifikasi payment, refund), operator (kelola produk).

- Admin dan Super Admin: seluruh akses administratif; perubahan role hanya Super Admin.

- RBAC dirancang sejak awal.

# 6. Game & Product System

- Game fields: id, name, slug, publisher, cover/banner, category, status, fulfillment_type, description, how_to_topup, created_at, updated_at.

- fulfillment_type menentukan alur:
  - ID_BASED: top up langsung ke akun, customer wajib mengisi ID game.
  - VOUCHER: customer menerima kode voucher, tidak ada input ID sama sekali.

- Untuk game ID_BASED, field input bersifat dinamis per game lewat skema JSON (game_input_fields). Contoh: Mobile Legends = User ID + Zone ID; Genshin = UID + Server; Free Fire = Player ID saja. Game baru tidak perlu ubah kode.

- Product (nominal) fields: id, game_id, sku_internal, name (mis. "86 Diamonds"), supplier_sku, base_price (harga jual), cost_price (harga modal), status (active/inactive/maintenance), is_featured, sort_order.

- Satu produk bisa punya beberapa supplier (primary + fallback) lewat product_supplier_mappings.

- Harga tidak dihitung di client; hanya ditampilkan. Margin = base_price − cost_price dipantau di admin.

# 7. Search & Discovery

- Search game by nama/alias (contoh "ML" → Mobile Legends), kategori, publisher, populer.

- PostgreSQL full-text search + trigram untuk fase awal; Meilisearch/Typesense bila diperlukan.

- URL SEO-friendly: /game/mobile-legends, /kategori/voucher-game.

# 8. Alur Top Up (Checkout)

Alur dibuat satu halaman dengan urutan langkah yang ringkas:

- Game ID_BASED: 1) Masukkan ID game → 2) Pilih nominal → 3) Isi nomor WhatsApp → 4) Pilih metode pembayaran → klik Bayar.

- Game VOUCHER: 1) Pilih nominal → 2) Isi nomor WhatsApp → 3) Pilih metode pembayaran → klik Bayar. Tidak ada langkah ID.

Aturan:

- Validasi ID: untuk game ID_BASED, setelah ID diisi sistem memanggil endpoint cek nickname supplier (bila didukung) dan menampilkan nickname untuk konfirmasi. Bila game tidak mendukung, tampilkan peringatan bahwa kesalahan ID tidak dapat dibatalkan.

- Nomor WhatsApp wajib diisi di setiap order (ID_BASED maupun VOUCHER) agar customer dapat dihubungi bila terjadi error, misalnya top up gagal, ID salah, atau refund. Satu kolom saja, dengan keterangan singkat tujuan pengumpulannya. Email bersifat opsional.

- Validasi WhatsApp: normalisasi ke format 62xxxxxxxxxx (terima 08xx dan +62), cek panjang dan awalan nomor Indonesia. Verifikasi OTP tidak diwajibkan di fase awal agar alur tetap cepat; bisa ditambahkan bila banyak nomor palsu.

- Kode promo bersifat opsional dan tersembunyi di balik tautan "Punya kode promo?".

- Saat klik Bayar, server membuat order + invoice, memvalidasi ulang produk aktif, harga, promo, status supplier, dan format ID, lalu membuat transaksi payment. Customer langsung diarahkan ke /invoice/:invoiceNumber (halaman proses realtime).

- Satu order = satu produk di fase awal. Tidak ada keranjang.

- Order menyimpan snapshot harga, nama produk, game, ID, nickname, dan kontak agar histori tidak berubah.

# 9. Halaman Proses Realtime, Invoice & Cek Transaksi

## 9.1 Halaman proses (/invoice/:invoiceNumber)

- Satu halaman yang sama dipakai setelah klik Bayar, dari link invoice, dan dari Cek Transaksi.

- Menampilkan progres step (stepper) dengan 3 titik utama:
  1. Menunggu Pembayaran — progres berhenti di titik ini selama belum dibayar. Menampilkan instruksi bayar (QR QRIS, nomor VA, atau tombol e-wallet), nominal, dan hitung mundur batas waktu.
  2. Diproses — aktif otomatis saat pembayaran terverifikasi dan top up dikirim ke supplier.
  3. Sukses — top up masuk. Untuk voucher, kode ditampilkan di titik ini.

- Kondisi di luar jalur utama ditampilkan jelas di stepper: Kedaluwarsa (tidak dibayar sampai batas waktu), Gagal (supplier gagal), dan Refund (dana dikembalikan/diproses kembali).

- Realtime: halaman berlangganan perubahan status order lewat Supabase Realtime sehingga step berpindah tanpa refresh. Sediakan fallback polling bila koneksi realtime terputus.

- Tombol: Salin nomor invoice, Cek status, Cetak/Unduh invoice, Top up lagi.

## 9.2 Invoice

- Invoice dibuat otomatis saat order dibuat (status belum bayar) dan tetap sama setelah dibayar.

- Isi: nomor invoice, tanggal, game, produk/nominal, ID game dan nomor WhatsApp (disamarkan sebagian) dan nickname, rincian harga (subtotal, diskon, biaya), total, metode bayar, status, dan waktu tiap step.

- Nomor invoice memakai format yang tidak mudah ditebak, contoh INV-20261017-8K3Q7XZP (tanggal + kode acak berentropi tinggi), karena nomor ini juga menjadi kunci akses guest.

- Dapat dicetak atau diunduh sebagai PDF. Link invoice dikirim ke WhatsApp customer (dan email bila diisi) segera setelah order dibuat.

## 9.3 Cek Transaksi (/cek-transaksi)

- Form satu kolom untuk memasukkan nomor invoice. Bila ditemukan, customer diarahkan ke halaman proses realtime yang sama (9.1), bukan halaman terpisah.

- Pesan error generik bila tidak ditemukan. Terapkan rate limiting agar nomor invoice tidak bisa ditebak lewat brute force.

## 9.4 Kontrol akses guest

- Guest tidak punya akses langsung ke tabel orders. Data invoice diambil lewat Edge Function (get-invoice) yang hanya mengembalikan field yang aman.

- Data sensitif disamarkan (ID game sebagian, nomor WhatsApp sebagian). Kode voucher hanya tampil setelah status Sukses.

- Channel Realtime memakai identifier acak per invoice, bukan ID urut.

# 10. Order Management

- Order fields: id, order_number, invoice_number (unik), user_id (nullable untuk guest), game_id, product_id, account_input (JSON, kosong untuk voucher), account_nickname, status, payment_status, fulfillment_status, subtotal, discount, fee, grand_total, contact_phone (wajib, format 62xxx), contact_email (opsional), expires_at, timestamps.

- Order state machine: PENDING_PAYMENT → PAID → PROCESSING → SUCCESS.

- Alternatif: PENDING_PAYMENT → EXPIRED/CANCELLED; PROCESSING → PENDING_SUPPLIER (menunggu callback) → SUCCESS/FAILED; FAILED → REFUND_PENDING → REFUNDED.

- Pemetaan ke stepper: PENDING_PAYMENT = step 1; PAID, PROCESSING, PENDING_SUPPLIER = step 2; SUCCESS = step 3.

- Order status history wajib disimpan, lengkap dengan sumber perubahan (payment webhook, supplier callback, admin).

- Idempotency: satu order hanya boleh dikirim ke supplier satu kali; gunakan ref_id unik per order untuk mencegah top up ganda.

- Pembayaran terlambat: bila pembayaran masuk setelah order EXPIRED atau CANCELLED, status order tidak berubah dan tidak ada top up. Pembayaran ditandai terlambat dan masuk antrean refund/"perlu dihubungi" di admin; customer dihubungi lewat WhatsApp.

# 11. Fulfillment & Supplier

- Fulfillment hanya berjalan setelah payment berstatus PAID terverifikasi.

- Tabel: suppliers, supplier_products, fulfillment_attempts (request, response, status, latency), supplier_balances.

- Hasil supplier: SUCCESS, PENDING, FAILED. PENDING ditangani lewat callback webhook + polling terjadwal; jangan menyimpulkan gagal terlalu cepat.

- Failover: bila supplier primary gagal (bukan karena ID salah), coba supplier fallback otomatis. Jangan retry bila error berupa akun tidak valid.

- Auto-refund bila final FAILED, sesuai kebijakan refund.

- Saldo deposit ke supplier dipantau; alert saat di bawah ambang batas dan produk otomatis di-maintenance bila saldo tidak cukup.

- Voucher: kode dari supplier disimpan terenkripsi dan hanya ditampilkan ke pemegang invoice.

# 12. Payment

- Payment abstraction layer: QRIS, E-Wallet (GoPay, OVO, DANA, ShopeePay), Virtual Account bank, dan minimarket. Provider contoh: Midtrans, Xendit, Tripay, Duitku.

- payments menyimpan order_id, provider, method, reference, amount, fee, status, paid_at, expired_at, timestamps.

- Status: PENDING, PAID, FAILED, EXPIRED, REFUNDED.

- Pembayaran dianggap berhasil hanya dari webhook provider dengan verifikasi signature, bukan redirect frontend. Webhook harus idempotent.

- Instruksi bayar ditampilkan di halaman proses (step 1), bukan di halaman terpisah.

- Masa berlaku pembayaran singkat (QRIS/e-wallet 15–60 menit); order yang lewat batas otomatis EXPIRED dan stepper menampilkan Kedaluwarsa.

# 13. Delivery

- Tidak ada shipping fisik. Modul shipping, alamat, dan berat tidak ada.

- "Delivery" = hasil fulfillment: status top up, waktu masuk, nomor transaksi supplier/SN, dan kode voucher (untuk game voucher), semuanya terlihat di halaman proses dan invoice.

# 14. Saved Game Accounts

- Customer login dapat menyimpan ID game (ID + server + nickname) agar top up berikutnya satu klik. Hanya berlaku untuk game ID_BASED.

- Fields: user_id, game_id, account_input (JSON), nickname, label, last_used_at.

# 15. Promotion Engine

- Support diskon persentase, nominal, minimum pembelian, khusus game/produk/metode pembayaran, khusus user baru, batas pemakaian, periode, flash sale, dan kode kupon.

- Validasi di server (validation layer), termasuk pengecekan agar promo tidak membuat harga di bawah cost_price tanpa persetujuan admin.

# 16. Reviews & Trust

- Review per game/produk terikat order SUCCESS (verified_purchase), dengan rating dan komentar.

- Social proof: jumlah transaksi sukses, rata-rata waktu proses, status layanan real-time.

# 17. Notification System

- Channel: WhatsApp (nomor wajib di setiap order) dan in-app; email bila diisi; push pada fase lanjut.

- WhatsApp dipakai untuk link invoice, konfirmasi bayar, hasil top up, dan penanganan error. Pengiriman otomatis lewat penyedia WhatsApp resmi (WhatsApp Business API atau provider berizin). Sebelum itu aktif, admin/CS menghubungi customer secara manual dari halaman detail order (tombol Chat WhatsApp yang membuka wa.me dengan pesan template).

- Event: Order Created, Payment Reminder, Payment Success, Top Up Success, Top Up Failed/Refund. Order dengan status Gagal atau Stuck PROCESSING otomatis masuk antrean 'perlu dihubungi' di admin.

- notifications: user_id (atau kontak guest), type, title, message, data, read_at, created_at.

# 18. Customer Dashboard

- Overview, riwayat order (setiap order membuka halaman proses yang sama), ID game tersimpan, kupon, profile, notifikasi.

# 19. Admin Dashboard

- KPI: omzet, order, order sukses/gagal, success rate per supplier, pending payment, order stuck PROCESSING, saldo supplier, margin, refund.

- Manajemen game & produk: create/edit/arsip, atur fulfillment_type dan field ID, mapping supplier, sinkronisasi harga dari supplier, bulk update harga/margin, CSV import/export.

- Manajemen order: lihat, filter, cari by invoice atau nomor WhatsApp, retry fulfillment, tandai manual, refund, hubungi customer via WhatsApp.

- Manajemen supplier: status, saldo, log request/response.

# 20. Analytics

- KPI: GMV, net revenue, gross margin, order, AOV, customer baru vs repeat, conversion, success rate fulfillment, refund rate.

- Funnel: Game View → Isi ID (bila ada) → Pilih Nominal → Klik Bayar → Payment → Sukses.

- Top game, top produk, jam sibuk, performa supplier. Semua dikelola di dalam Orias.ID.

# 21. Audit & Security

- Audit log: user, action, entity, entity_id, old_data, new_data, IP/user agent sesuai kebijakan privasi, timestamp.

- Authentication Supabase Auth; authorization RBAC + RLS. Akses guest hanya lewat Edge Function (lihat 9.4).

- Operasi sensitif (buat order, payment processing, kirim ke supplier, refund, ubah harga, ubah role) hanya lewat Edge Functions.

- API key supplier dan payment hanya di environment variables server; tidak boleh masuk repository maupun frontend.

- Rate limiting sejak awal untuk endpoint validasi ID, pembuatan order, dan cek transaksi (rawan abuse dan enumerasi).

- Anti-fraud: batas order per IP/nomor WhatsApp, deteksi pola refund berulang, blacklist ID/nomor. Nomor WhatsApp adalah data pribadi: simpan seperlunya, samarkan di halaman publik, dan jelaskan tujuannya di kebijakan privasi.

- Siapkan syarat & ketentuan, kebijakan refund, dan kebijakan privasi sesuai ketentuan yang berlaku di Indonesia.

# 22. SEO & Performance

- Halaman game adalah landing page utama untuk SEO: metadata per game, canonical, Open Graph, structured data Product/Offer/AggregateRating. Karena SPA (Vite), strategi prerender/SSR untuk /game/:slug harus diputuskan sebelum fase SEO. Halaman /invoice dan /cek-transaksi diberi noindex.

- Target: LCP < 2.5s, CLS < 0.1, INP < 200ms; fokus mobile.

- Lazy loading, kompresi gambar (WebP/AVIF), code splitting, caching katalog, CDN.

# 23. PWA

- Orias.ID dapat dikembangkan sebagai PWA: installable, offline shell, push notification status order.

# 24. API & Service Layer

- Frontend tidak mengetahui detail query database maupun format API supplier.

- Contoh: GameService.getGames(), GameService.validateAccount(), ProductService.getProducts(gameId), OrderService.createOrder(), InvoiceService.getInvoice(invoiceNumber), OrderService.subscribeStatus(invoiceNumber), PaymentService.createPayment(), FulfillmentService.process(orderId).

- Adapter supplier memakai interface seragam (checkAccount, createTransaction, getStatus, getBalance) agar supplier mudah diganti atau ditambah.

# 25. Event Architecture

- Event internal: ORDER_CREATED, PAYMENT_RECEIVED, FULFILLMENT_STARTED, TOPUP_SUCCESS, TOPUP_FAILED, ORDER_REFUNDED, ORDER_EXPIRED, PRODUCT_PRICE_CHANGED, SUPPLIER_BALANCE_LOW.

- Event dipakai untuk notifikasi, audit log, update status realtime, dan alert admin. Tidak ada pengiriman event ke sistem eksternal.

# 26. Core Database Tables

- users, profiles, roles, user_roles, saved_game_accounts.

- games, game_input_fields, categories, publishers, products, product_prices (riwayat harga).

- suppliers, supplier_products, product_supplier_mappings, supplier_balances.

- orders (termasuk invoice_number), order_status_history, fulfillment_attempts, voucher_codes (terenkripsi).

- payments, payment_transactions, refunds.

- promotions, promotion_rules, promotion_usage.

- reviews, notifications, audit_logs.

# 27. Future Expansion

- Reseller/B2B dengan level harga dan API key sendiri.

- Produk digital lain: pulsa, paket data, token listrik, e-money, gift card.

- Saldo Orias (wallet) dan loyalty points.

# 28. Design Direction

- Konsep: Modern Mystical Gaming Commerce.

- Karakter visual: premium, cepat, mistis, modern, tepercaya. Dark base dengan gold accent dan opsi deep purple/burgundy; glow dan glass surface subtil.

- Halaman game: banner, form ID (jika ID_BASED), nominal berbentuk kartu besar yang mudah di-tap, pilihan metode bayar, ringkasan harga + tombol Bayar sticky di mobile.

- Halaman proses: stepper vertikal di mobile dan horizontal di desktop, titik aktif bergerak halus, badge status jelas, dan ringkasan invoice di samping/bawah.

- Homepage: search, banner promo, game populer, flash sale, kategori, cara top up, testimoni/rating, status layanan, dan kolom cek transaksi.

# 29. Coding Principles

- SOLID, DRY, Separation of Concerns, Single Responsibility, Modular Architecture, Progressive Enhancement, Security First, Database Integrity, Transaction Safety.

- Jangan membuat satu file komponen/modul sangat besar; pecah menjadi komponen, hooks, dan service yang fokus.

- TypeScript strict mode, tanpa `any`.

# 30. Testing

- Unit test: kalkulasi harga/diskon/fee, validasi ID per game, normalisasi dan validasi nomor WhatsApp, pemetaan status order ke step, state machine order, idempotency.

- Integration test: Order → Payment webhook → Fulfillment → Status; supplier failover; refund otomatis; get-invoice dan kontrol akses guest.

- E2E test: pilih game (ID_BASED dan VOUCHER), isi ID, pilih nominal, isi WhatsApp (validasi format), pilih metode bayar, klik Bayar, stepper di titik belum bayar, bayar (sandbox), stepper pindah ke Diproses lalu Sukses tanpa refresh, buka kembali lewat Cek Transaksi.

- Gunakan sandbox payment dan supplier untuk semua test.

# 31. Environment & Deployment

- Pisahkan Development, Staging, Production.

- Environment variables minimal: SUPABASE_URL, SUPABASE_ANON_KEY, PAYMENT_API_KEY, PAYMENT_WEBHOOK_SECRET, SUPPLIER_API_KEY, SUPPLIER_CALLBACK_SECRET.

- Migration versioned: 001_initial_schema.sql, 002_games_products.sql, 003_orders_invoice.sql, 004_payment.sql, 005_fulfillment_suppliers.sql.

- Backup otomatis dan point-in-time recovery.

# 32. Development Roadmap

- Phase 1 — Foundation: Auth, database, game (ID_BASED/VOUCHER), produk/nominal, halaman game, admin dasar.

- Phase 2 — Top Up Flow: form ID dinamis, validasi nickname, pilih nominal, input WhatsApp wajib, pilih metode bayar, pembuatan order + invoice.

- Phase 3 — Transaction: payment gateway + webhook, halaman proses realtime (stepper), fulfillment supplier + callback, cek transaksi, refund otomatis.

- Phase 4 — Commerce: promo/kupon, flash sale, review, notifikasi, cetak/unduh invoice.

- Phase 5 — Analytics: dashboard, performa supplier, margin, customer analytics.

- Phase 6 — Advanced: wallet, reseller, PWA, produk digital lain, rekomendasi.

# 33. Development Rule for AI Developer

- Kerjakan phase-based; jangan implementasi seluruh roadmap sekaligus.

- Setiap phase menghasilkan sistem yang dapat dijalankan dan diuji.

- Jaga konsistensi schema, service layer, state machine, security policy, dan struktur folder.

- Perubahan schema wajib lewat migration.

- Logika kritis (harga, payment, fulfillment, refund) wajib diuji dan tidak boleh hanya di client.

- Temuan bug/masalah saat bekerja diperbaiki saat itu juga; bila butuh keputusan, langsung tanya sambil tawarkan solusi.

# 34. Final Architecture Summary

Customer → Orias.ID Storefront → API/Business Logic → PostgreSQL / Payment Gateway / Supplier API. Alur: [ID jika game ID_BASED] → nominal → WhatsApp → metode bayar → Bayar → halaman proses realtime (Menunggu Pembayaran → Diproses → Sukses) dengan invoice, dan bisa dibuka kembali lewat Cek Transaksi. Orias.ID berdiri sendiri tanpa integrasi sistem eksternal.
