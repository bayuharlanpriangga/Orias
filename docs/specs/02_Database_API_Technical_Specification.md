Level 2 Engineering Blueprint — Database, RLS, API Contract & State Machines (Orias.ID Game Top-Up)

# 1. Document Purpose

- Dokumen ini adalah blueprint implementasi Orias.ID versi web top up game. Isinya menerjemahkan arsitektur produk (TS) menjadi entitas database, relasi, kebijakan keamanan, batas service, kontrak API, aturan transaksi, dan state machine.

- Tujuan utama: memberi AI developer batasan teknis yang deterministik agar implementasi tetap modular, aman, teruji, dan konsisten antar phase.

- Scope: Orias.ID berdiri sendiri. Tidak ada integrasi ke sistem lain (OAS, OFM, OSS). Produk bersifat digital: tidak ada shipping, alamat, inventory fisik, maupun keranjang.

# 2. Core Architecture Rules

- Frontend berkomunikasi lewat service module. Komponen UI tidak boleh berisi query database langsung.

- Mutasi kritis (buat order, buat payment, proses webhook, kirim ke supplier, refund, ubah harga) hanya lewat fungsi server / Edge Function.

- Integritas database dijaga dengan foreign key, constraint, transaksi, dan RLS.

- Semua perubahan skema memakai migration berversi.

- Harga, diskon, biaya, status payment, dan status supplier divalidasi ulang di server. Total dari client tidak pernah dipercaya.

- Riwayat order memakai snapshot immutable untuk game, produk, harga, dan data akun.

- Event domain dipancarkan setelah transisi status berhasil. Konsumennya hanya komponen internal (notifikasi, audit, realtime, alert admin).

# 3. Database Conventions

- Primary key: UUID.

- Timestamp: timestamptz, disimpan dalam UTC.

- Uang: numeric(18,2), tidak pernah floating point.

- Status: enum atau text dengan check constraint.

- Semua tabel inti memiliki created_at dan updated_at bila relevan.

- Gunakan soft delete / status arsip untuk entitas bisnis yang histori referensinya harus tetap valid.

- Jangan pernah menghapus fisik order, payment, fulfillment attempt, refund, atau audit log dari UI admin.

- Nomor WhatsApp disimpan dalam format ternormalisasi 62xxxxxxxxxx dengan check constraint format.

# 4. Identity & Access Tables

- profiles: id, user_id, display_name, phone, avatar_url, status, created_at, updated_at.

- roles: id, code, name.

- user_roles: user_id, role_id.

- saved_game_accounts: id, user_id, game_id, account_input (jsonb), nickname, label, last_used_at, created_at, updated_at. Hanya untuk game ID_BASED. Unik per (user_id, game_id, account_input).

- Role yang direkomendasikan: customer, staff, admin, super_admin (reseller ditunda ke fase lanjut).

- Guest tidak memiliki baris di tabel ini; guest bertransaksi tanpa akun.

# 5. Game & Product Domain

- games: id, name, slug, publisher_id, category_id, fulfillment_type (ID_BASED | VOUCHER), description, how_to_topup, cover_url, banner_url, status, is_featured, sort_order, created_at, updated_at.

- game_input_fields: id, game_id, field_key, label, field_type (text | number | select), placeholder, is_required, validation_regex, options (jsonb), sort_order. Unik (game_id, field_key). Hanya boleh ada untuk game ID_BASED; game VOUCHER tidak boleh punya baris di sini (dijaga trigger/constraint).

- categories: id, parent_id, name, slug, description, image_url, sort_order, status.

- publishers: id, name, slug, logo_url, status.

- products (nominal): id, game_id, sku_internal, name, description, base_price, cost_price, status (active | inactive | maintenance | archived), is_featured, sort_order, created_at, updated_at. Check: base_price >= 0, cost_price >= 0. sku_internal unik.

- product_prices: id, product_id, base_price, cost_price, source (admin | supplier_sync), changed_by, created_at. Append-only, mencatat setiap perubahan harga.

- Slug game harus unik. Game berstatus bukan active tidak tampil publik.

# 6. Supplier Domain

- suppliers: id, code, name, status, priority, created_at, updated_at.

- supplier_products: id, supplier_id, supplier_sku, name, cost_price, status, synced_at, raw_metadata. Unik (supplier_id, supplier_sku).

- product_supplier_mappings: id, product_id, supplier_product_id, priority, status. Unik (product_id, priority). Priority terendah = primary, sisanya fallback.

- supplier_balances: id, supplier_id, balance, low_threshold, checked_at. Riwayat snapshot saldo; snapshot terbaru dipakai untuk keputusan maintenance.

- Kredensial supplier tidak disimpan di tabel; hanya di environment variables server.

# 7. Order & Invoice Domain

- orders: id, order_number, invoice_number, realtime_key, user_id (nullable untuk guest), game_id, product_id, game_name_snapshot, product_name_snapshot, sku_snapshot, fulfillment_type_snapshot, account_input (jsonb, null untuk VOUCHER), account_nickname, status, payment_status, fulfillment_status, currency, subtotal, discount_total, fee_total, grand_total, cost_snapshot, coupon_code, contact_phone (wajib), contact_email (opsional), expires_at, created_at, updated_at.

- Constraint: contact_phone NOT NULL dan sesuai format 62xxxxxxxxxx. account_input NOT NULL bila fulfillment_type_snapshot = ID_BASED dan NULL bila VOUCHER.

- invoice_number: unik, format tidak mudah ditebak, contoh INV-20261017-8K3Q7XZP (tanggal + kode acak berentropi tinggi). Dibuat saat order dibuat dan tidak pernah berubah.

- order_number: unik, mudah dibaca untuk admin. invoice_number dan order_number boleh sama dalam implementasi awal selama invoice_number tetap tidak berurutan.

- realtime_key: UUID acak per order, dipakai sebagai nama channel Realtime. Tidak dipakai di URL publik.

- order_status_history: id, order_id, from_status, to_status, source (payment_webhook | supplier_callback | system_job | admin | customer), changed_by, reason, metadata, created_at.

- Satu order = satu produk. Tidak ada tabel order_items di fase awal.

- Snapshot (nama, harga, SKU, account_input, nickname, kontak) immutable setelah order dibuat; dijaga trigger yang menolak update kolom snapshot.

# 8. Order State Machine

- Status order: PENDING_PAYMENT, PAID, PROCESSING, PENDING_SUPPLIER, SUCCESS, FAILED, EXPIRED, CANCELLED, REFUND_PENDING, REFUNDED.

- Transisi yang diizinkan: PENDING_PAYMENT → PAID; PENDING_PAYMENT → EXPIRED; PENDING_PAYMENT → CANCELLED; PAID → PROCESSING; PROCESSING → SUCCESS; PROCESSING → PENDING_SUPPLIER; PROCESSING → FAILED; PENDING_SUPPLIER → SUCCESS; PENDING_SUPPLIER → FAILED; FAILED → REFUND_PENDING; REFUND_PENDING → REFUNDED.

- Pembayaran yang masuk setelah order EXPIRED atau CANCELLED tidak mengubah status order. Payment ditandai late_payment dan masuk antrean refund admin. Order tidak boleh kembali ke PAID.

- Pemetaan ke step di halaman proses: PENDING_PAYMENT = step 1 (Menunggu Pembayaran); PAID, PROCESSING, PENDING_SUPPLIER = step 2 (Diproses); SUCCESS = step 3 (Sukses). EXPIRED, CANCELLED, FAILED, REFUND_PENDING, REFUNDED ditampilkan sebagai kondisi khusus di stepper.

- Pemetaan ini disediakan sebagai fungsi/view server (order_step) agar frontend tidak menyalin logikanya.

- Setiap transisi wajib memvalidasi status saat ini sebelum update (compare-and-set), membuat baris order_status_history, dan memancarkan event domain.

# 9. Payment Domain

- payments: id, order_id, provider, method, external_transaction_id, reference, amount, fee, currency, status, instruction (jsonb: QR string, nomor VA, deeplink), expires_at, paid_at, late_payment (boolean), raw_metadata, created_at, updated_at.

- Status payment: PENDING, PAID, FAILED, EXPIRED, REFUNDED.

- payment_transactions: id, payment_id, provider_event_id, event_type, payload, signature_valid, processed_at, created_at. Unik (provider, provider_event_id) untuk idempotency webhook.

- refunds: id, order_id, payment_id, amount, status (PENDING | PROCESSING | DONE | FAILED), reason, requested_by, processed_at, created_at, updated_at.

- Pemrosesan webhook harus idempotent. Notifikasi webhook berulang tidak boleh menduplikasi perubahan payment, order, atau fulfillment.

- Keberhasilan payment tidak pernah dipercaya dari redirect client.

# 10. Fulfillment Domain

- fulfillment_attempts: id, order_id, supplier_id, attempt_no, supplier_ref_id (unik), request_payload, response_payload, status (SENT | PENDING | SUCCESS | FAILED), supplier_sn, error_code, error_kind (ACCOUNT_INVALID | SUPPLIER_ERROR | TIMEOUT | INSUFFICIENT_BALANCE), latency_ms, created_at, updated_at.

- voucher_codes: id, order_id, code_encrypted, serial_encrypted, created_at. Dienkripsi dengan kunci dari secret server; tidak pernah dikembalikan lewat query tabel oleh client.

- Satu order hanya boleh punya satu attempt yang berstatus SENT/PENDING/SUCCESS pada satu waktu (partial unique index). Ini mencegah top up ganda.

- Kegagalan dengan error_kind = ACCOUNT_INVALID tidak boleh di-retry dan tidak boleh failover.

# 11. Promotion Domain

- promotions: id, code, name, type (PERCENT | FIXED), value, minimum_subtotal, maximum_discount, usage_limit, usage_per_user, starts_at, ends_at, status.

- promotion_rules: id, promotion_id, rule_type (GAME | PRODUCT | PAYMENT_METHOD | NEW_USER | USER), rule_value.

- promotion_usage: id, promotion_id, user_id (nullable), contact_phone, order_id, discount_amount, created_at. Unik (promotion_id, order_id).

- Penerapan promo harus deterministik dan divalidasi server. Harga akhir tidak boleh di bawah cost_snapshot tanpa persetujuan admin (flag allow_below_cost pada promosi).

- Pencegahan pemakaian ganda lewat constraint database dan pengecekan dalam transaksi. Batas per pengguna untuk guest memakai contact_phone.

# 12. Review Domain

- reviews: id, game_id, product_id (nullable), user_id (nullable), order_id, rating, title, content, status, verified_purchase, created_at, updated_at.

- Status review: PENDING, PUBLISHED, REJECTED, HIDDEN.

- Review hanya boleh dibuat untuk order berstatus SUCCESS. Satu order maksimal satu review.

# 13. Notification & Audit Domain

- notifications: id, user_id (nullable), order_id (nullable), channel (WHATSAPP | EMAIL | IN_APP), type, recipient, title, message, data, delivery_status (QUEUED | SENT | FAILED | READ), provider_message_id, error, sent_at, read_at, created_at.

- Unik (order_id, type, channel) untuk event transaksional agar event ganda tidak menghasilkan notifikasi ganda.

- audit_logs: id, user_id, action, entity_type, entity_id, old_data, new_data, ip_address, user_agent, created_at. Append-only, hanya dapat dibaca role administratif.

# 14. Recommended Relationships

- users 1—1 profiles; users N—N roles lewat user_roles; users 1—N saved_game_accounts.

- publishers 1—N games; categories 1—N categories (parent_id); categories 1—N games.

- games 1—N game_input_fields; games 1—N products; products 1—N product_prices.

- suppliers 1—N supplier_products; products N—N supplier_products lewat product_supplier_mappings.

- users 1—N orders (nullable); games 1—N orders; products 1—N orders.

- orders 1—N order_status_history; orders 1—N payments; payments 1—N payment_transactions.

- orders 1—N fulfillment_attempts; orders 1—1 voucher_codes (hanya VOUCHER); orders 1—N refunds.

- promotions 1—N promotion_rules; promotions 1—N promotion_usage.

- orders 1—N notifications; orders 1—1 reviews.

# 15. Transaction Boundaries

- Create Order berjalan sebagai satu alur transaksional: validasi game & produk aktif → validasi supplier tidak maintenance → validasi account_input terhadap game_input_fields (hanya ID_BASED) → normalisasi & validasi WhatsApp → hitung promo → hitung fee metode bayar → buat order + invoice_number + realtime_key → buat history awal → buat payment (instruksi bayar) → pancarkan ORDER_CREATED. Dijalankan dengan idempotency key.

- Konfirmasi payment (idempotent): verifikasi signature → simpan payment_transaction → update payment → compare-and-set order PENDING_PAYMENT → PAID → PROCESSING → panggil fulfillment → pancarkan PAYMENT_RECEIVED.

- Fulfillment: buat fulfillment_attempt dengan supplier_ref_id unik → kirim ke supplier → hasil SUCCESS/PENDING/FAILED → update order → pancarkan TOPUP_SUCCESS atau TOPUP_FAILED.

- Payment gagal/expired: order → EXPIRED; tidak ada pemanggilan supplier.

- Refund: FAILED → REFUND_PENDING → proses refund provider → REFUNDED. Refund dicatat di tabel refunds dan history order.

# 16. RLS Policy Principles

- Sensitive tables default-deny; izinkan operasi yang diperlukan secara eksplisit.

- Publik/anon: hanya membaca games, categories, publishers, products, game_input_fields berstatus aktif, serta review PUBLISHED.

- Anon tidak punya akses SELECT ke orders, payments, fulfillment_attempts, voucher_codes, notifications. Akses guest ke invoice hanya lewat Edge Function get-invoice (lihat bagian 20).

- Customer login: SELECT hanya profile, saved_game_accounts, order, payment, dan notifikasi miliknya sendiri; INSERT/UPDATE saved_game_accounts dan review eligible miliknya.

- Customer tidak boleh UPDATE status order, status payment, fulfillment, harga, promotion_usage, roles, atau audit log.

- Staff/admin diberi akses sesuai role secara eksplisit; super_admin memiliki akses administratif penuh. Staff CS dan finance tidak otomatis boleh mengubah harga.

- voucher_codes tidak punya policy SELECT untuk client; kode hanya dikembalikan oleh get-invoice setelah status SUCCESS.

# 17. API / Service Layer

- GameService: listGames, getGameBySlug, searchGames, getCategories, getInputFields.

- ProductService: listProducts(gameId), getProduct.

- AccountValidationService: validateAccount(gameId, accountInput) → nickname.

- OrderService: createOrder, getOrderHistory (login), cancelOrder (hanya PENDING_PAYMENT), getOrderTimeline.

- InvoiceService: getInvoice(invoiceNumber), subscribeStatus(invoiceNumber).

- PaymentService: createPayment, handleWebhook, verifyPayment, refundPayment.

- FulfillmentService: process(orderId), handleSupplierCallback, pollPending, retry.

- SupplierService: syncProducts, getBalance, setMaintenance.

- PromotionService: validateCoupon, calculateDiscount, recordUsage.

- SavedAccountService: list, save, remove, touch.

- ReviewService: createReview, moderateReview.

- NotificationService: enqueue, send, markRead, listInApp.

- AdminService: dashboard metrics, game & product management, order management, supplier management, customer management, reports.

# 18. API Contract Rules

- Gunakan envelope JSON yang konsisten. Sukses: { success: true, data: ... }. Error: { success: false, error: { code, message, details } }.

- Jangan pernah mengekspos internal database, secret key, kredensial payment/supplier, atau secret mentah provider.

- Gunakan pagination untuk endpoint koleksi.

- Kode error stabil: AUTH_REQUIRED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, INVALID_ACCOUNT, INVALID_PHONE, PRODUCT_UNAVAILABLE, SUPPLIER_MAINTENANCE, PAYMENT_FAILED, PAYMENT_EXPIRED, INVALID_COUPON, INVALID_ORDER_STATE, RATE_LIMITED, DUPLICATE_REQUEST.

# 19. Suggested Endpoint Map

- GET /api/games, GET /api/games/:slug, GET /api/games/:slug/input-fields, GET /api/categories.

- GET /api/games/:slug/products.

- POST /api/accounts/validate (cek nickname; rate limited).

- POST /api/promotions/validate.

- POST /api/orders (buat order + invoice + payment; idempotency key).

- GET /api/orders (riwayat, login).

- POST /api/orders/:id/cancel (hanya PENDING_PAYMENT).

- GET /api/invoices/:invoiceNumber (Edge Function get-invoice, guest dan login).

- POST /api/payments/webhook (provider).

- POST /api/fulfillment/callback (supplier; verifikasi signature/secret).

- GET/POST/DELETE /api/saved-accounts.

- POST /api/reviews.

- GET /api/notifications, PATCH /api/notifications/:id/read.

# 20. Realtime & Guest Access

- Guest tidak membaca tabel secara langsung. GET /api/invoices/:invoiceNumber (Edge Function get-invoice) mengembalikan data aman: nomor invoice, game, produk, nilai, status, step, instruksi bayar (selama PENDING_PAYMENT), ID game dan WhatsApp yang disamarkan, nickname, waktu tiap step, dan kode voucher hanya bila status SUCCESS.

- Respons not-found dibuat generik. Terapkan rate limiting per IP pada endpoint ini dan pada cek transaksi untuk mencegah enumerasi invoice.

- Realtime: perubahan status order dipancarkan lewat Supabase Realtime Broadcast ke topik `invoice:{realtime_key}` oleh trigger database setelah transisi status. Payload hanya berisi status dan step, tanpa data pribadi.

- Client mendapatkan realtime_key dari respons get-invoice, lalu berlangganan. Setelah event diterima, client boleh memuat ulang get-invoice untuk data lengkap.

- Fallback: bila channel terputus, client melakukan polling get-invoice dengan interval bertahap (misalnya 3–5 detik, melambat bertahap) dan berhenti pada status final.

- Status final (tidak ada polling lagi): SUCCESS, EXPIRED, CANCELLED, REFUNDED. FAILED dan REFUND_PENDING tetap dipantau sampai REFUNDED.

# 21. Admin API Boundary

- Admin API wajib mengecek role terautentikasi.

- Game & produk: POST/PATCH/archive /api/admin/games, /api/admin/games/:id/input-fields, /api/admin/products.

- Harga: POST /api/admin/products/:id/price (menulis product_prices).

- Supplier: GET/POST /api/admin/suppliers, mapping produk, sinkronisasi, saldo, set maintenance.

- Order: GET /api/admin/orders (cari invoice atau nomor WhatsApp), POST retry fulfillment, mark manual, refund, daftar "perlu dihubungi".

- Customer: GET /api/admin/customers. Promosi: CRUD /api/admin/promotions.

- Laporan: GET /api/admin/reports/sales, /games, /products, /suppliers.

- Semua mutasi administratif wajib menghasilkan audit log.

# 22. Idempotency

- Operasi POST yang dapat di-retry wajib mendukung idempotency key, terutama pembuatan order, pembuatan payment, penanganan webhook payment, callback supplier, refund, dan pengiriman fulfillment.

- Simpan idempotency key bersama hasil operasi dan kembalikan hasil asli untuk permintaan duplikat.

- Pengiriman ke supplier memakai supplier_ref_id yang unik per order dan per attempt sehingga retry jaringan tidak membuat top up ganda.

- Callback supplier dan webhook payment yang dikirim ulang tidak boleh mengubah hasil yang sudah final.

# 23. Concurrency & Safety

- Transisi status memakai compare-and-set (UPDATE ... WHERE status = expected) atau row lock; transisi gagal dikembalikan sebagai INVALID_ORDER_STATE.

- Partial unique index pada fulfillment_attempts mencegah dua attempt aktif untuk satu order.

- Dua webhook payment yang tiba bersamaan hanya boleh memicu satu pemanggilan fulfillment.

- Job terjadwal server-side: expire order PENDING_PAYMENT yang melewati expires_at; polling status supplier untuk order PENDING_SUPPLIER; deteksi order stuck PROCESSING lebih dari batas waktu lalu masukkan ke antrean "perlu dihubungi".

- Produk otomatis berstatus maintenance bila semua supplier mapping tidak dapat dipakai atau saldo supplier di bawah kebutuhan.

# 24. Caching Strategy

- Cache katalog publik (game, kategori, publisher, produk aktif) bila berguna; invalidasi setelah perubahan harga, status, atau produk.

- Jangan cache data order, invoice, payment, atau instruksi bayar di shared cache.

- Status maintenance produk harus cukup segar; gunakan TTL pendek.

# 25. Pagination & Filtering

- Semua list API mendukung pagination.

- Parameter yang direkomendasikan: page, limit, sort, search, category, publisher, fulfillment_type, min_price, max_price, status.

- Tetapkan batas ukuran halaman maksimum untuk mencegah abuse.

# 26. Error Handling

- Gunakan kode error bertipe dan stabil, bukan pesan bebas.

- Frontend memetakan kode error ke pesan ramah pengguna.

- Log server menyimpan konteks teknis; respons client tetap aman.

- Error payment provider dan supplier dinormalisasi ke kode error internal.

# 27. Observability

- Log request ID dan event bisnis penting.

- Lacak: gagal create order, error webhook payment, error callback supplier, order stuck, transisi tak terduga, kegagalan pengiriman WhatsApp, kegagalan realtime.

- Gunakan structured log, bukan console log acak, di produksi.

- Metrik: latensi API, error rate, success rate payment, success rate fulfillment per supplier, waktu rata-rata dari PAID ke SUCCESS, konversi funnel.

# 28. Database Migration Strategy

- Setiap perubahan skema memiliki migration bernomor.

- Jangan edit migration produksi yang sudah diterapkan; buat migration baru.

- Seed dipisahkan dari migration skema.

- Migration produksi sebaiknya backward-compatible; migration destruktif butuh review dan backup.

# 29. Testing Matrix

- Unit: harga, diskon, fee, validasi ID per game, normalisasi dan validasi WhatsApp, pemetaan status ke step, transisi state.

- Database: constraint (account_input vs fulfillment_type, format WhatsApp, supplier_ref_id unik, partial unique attempt aktif), foreign key, unique index, trigger snapshot immutable, RLS.

- Integrasi: create order → payment → webhook → fulfillment → SUCCESS; supplier PENDING → callback; failover supplier; FAILED → refund; order expired; late payment.

- E2E: guest buka game → isi ID (bila ada) → pilih nominal → isi WhatsApp → pilih pembayaran → Bayar → stepper realtime → sukses → cek transaksi.

- Keamanan: akses order orang lain, enumerasi invoice, role escalation, webhook replay, callback supplier palsu, penyalahgunaan kupon, double send ke supplier.

# 30. Phase-Based Implementation

- Phase 1: fondasi skema, auth, RBAC, game/produk/kategori/publisher, storage, RLS, admin game & produk CRUD.

- Phase 2: top up flow: input ID dinamis, validasi nickname, order + invoice, state history.

- Phase 3: supplier + fulfillment, payment provider + webhook, halaman proses realtime, cek transaksi, refund otomatis.

- Phase 4: promo, review, notifikasi WhatsApp, invoice cetak/unduh, dashboard customer.

- Phase 5: analytics dan laporan.

- Phase 6: advanced (wallet, reseller, PWA, produk digital lain, rekomendasi).

# 31. AI Developer Implementation Rules

- Sebelum coding tiap phase, periksa skema dan file yang ada; jangan membuat ulang arsitektur.

- Jangan mengganti nama kolom atau service tanpa migration/rencana kompatibilitas.

- Jangan membuat modul service ganda untuk domain yang sama.

- Jangan melewati service/business logic dengan panggilan database langsung dari UI.

- Jangan melemahkan RLS demi membuat fitur jalan; perbaiki policy atau pakai fungsi server tepercaya.

- Jangan menyimpan secret di kode frontend.

- Jangan mengimplementasikan fitur masa depan lebih awal bila menambah kompleksitas tanpa nilai saat ini.

- Setelah tiap phase, jalankan tes dan berikan ringkasan perubahan singkat, daftar migration, file terdampak, dan batasan yang diketahui.

- Temuan bug/masalah saat bekerja diperbaiki saat itu juga; bila butuh keputusan, tanya langsung sambil tawarkan solusi.

# 32. Definition of Done

- Fitur selesai hanya bila skema database, RLS/keamanan, logika bisnis, integrasi UI, error handling, validasi, tes, dan migration semuanya terpenuhi.

- Jalur transaksi kritis harus aman dari request ganda, harga basi, transisi status tidak sah, replay webhook payment, replay callback supplier, dan pengiriman ganda ke supplier.

- Setiap phase meninggalkan aplikasi dalam keadaan dapat dijalankan.

# 33. Core Data Flow

Customer → Storefront → Service/API → Validasi Transaksi → PostgreSQL. Untuk top up: Input (ID bila ID_BASED, nominal, WhatsApp, metode bayar) → Revalidasi server → Order + Invoice + Payment → Halaman proses (step 1) → Webhook payment → PAID → PROCESSING → Supplier → Callback/Polling → SUCCESS (atau FAILED → Refund). Setiap perubahan status dipancarkan ke halaman proses lewat Realtime.

# 34. Internal Event Flow

Orias.ID memancarkan event domain internal seperti ORDER_CREATED, PAYMENT_RECEIVED, FULFILLMENT_STARTED, TOPUP_SUCCESS, TOPUP_FAILED, ORDER_REFUNDED, ORDER_EXPIRED, dan SUPPLIER_BALANCE_LOW. Konsumennya: notifikasi (WhatsApp/in-app), audit log, broadcast realtime, dan alert/antrean admin. Tidak ada pengiriman event ke sistem eksternal.
