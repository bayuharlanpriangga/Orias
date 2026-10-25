Level 3 Engineering Blueprint — Design System, Screens, Components, UX Flows & Frontend Rules (Orias.ID Game Top-Up)

# 1. Document Purpose

- Dokumen ini mendefinisikan bahasa visual, arsitektur UX, struktur halaman, komponen reusable, perilaku responsif, penanganan state frontend, aksesibilitas, dan aturan implementasi untuk Orias.ID versi web top up game.

- Tujuan utama: setiap layar Orias.ID terasa sebagai satu sistem produk, bukan kumpulan halaman yang tidak berhubungan.

- Stack frontend: React, TypeScript (strict mode), Vite, Tailwind CSS.

- Prinsip UX utama: alur top up sependek mungkin (ID → nominal → WhatsApp → metode bayar → Bayar) dan status transaksi selalu terlihat realtime. Mayoritas pengguna memakai ponsel, jadi mobile adalah target desain pertama.

# 2. Design Direction

- Konsep inti: Modern Mystical Gaming Commerce.

- Kepribadian brand: premium, cepat, misterius, modern, tenang, tepercaya, sedikit celestial.

- Hierarki visual mengutamakan kegunaan transaksi lebih dulu, identitas mistis kedua.

- Hindari tampilan seperti UI game fantasi. Detail mistis mendukung branding tanpa mengurangi keterbacaan dan konversi.

# 3. Visual Principles

- Gunakan spasi lega, hierarki jelas, dekorasi terkendali, dan gambar game/nominal yang kuat.

- Gold berfungsi sebagai aksen, bukan warna dominan UI.

- Gunakan permukaan gelap dan ivory/terang sebagai tema yang saling melengkapi bila sesuai.

- Gunakan gradien halus, border tipis, bayangan lembut, dan glow terkontrol.

- Hindari glassmorphism berlebihan, blur berlebihan, animasi berlebihan, dan elemen dekoratif di belakang informasi penting.

- Setiap elemen dekoratif harus berprioritas visual lebih rendah daripada nama game, nominal, harga, CTA, dan status transaksi.

# 4. Design Tokens

- Token warna dipusatkan sebagai CSS variable dan dipetakan ke tema Tailwind sehingga komponen memakai utility class berbasis token.

- Contoh token semantik: --color-bg, --color-surface, --color-surface-elevated, --color-text, --color-text-muted, --color-border, --color-primary, --color-primary-hover, --color-success, --color-warning, --color-danger, --color-info.

- Token status transaksi: --color-step-pending, --color-step-active, --color-step-done, --color-step-error. Status tidak boleh hanya dibedakan lewat warna (lihat bagian 32).

- Token tipografi: display, heading-xl, heading-lg, heading-md, body-lg, body-md, body-sm, caption.

- Token spasi memakai skala konsisten seperti 4, 8, 12, 16, 24, 32, 48, 64.

- Token radius: small, medium, large, pill. Token shadow: subtle, card, elevated. Token animasi: fast, normal, slow.

- Jangan menulis warna, spasi, radius, atau durasi animasi acak di komponen, termasuk nilai arbitrer Tailwind (mis. bg-[#123456]) yang melewati token.

# 5. Typography

- Gunakan satu keluarga font UI utama dan opsional satu keluarga display/aksen.

- Teks isi harus mengutamakan keterbacaan.

- Harga dan nominal memakai bobot tegas dan format angka yang jelas (angka tabular, pemisah ribuan konsisten, prefiks Rp).

- Nama game dan nama nominal memakai line clamp terkontrol di kartu.

- Jangan memakai tipografi dekoratif untuk deskripsi panjang, form, checkout, nomor invoice, kode voucher, atau data admin.

# 6. Responsive Breakpoints

- Mobile: sekitar 320–767px. Tablet: sekitar 768–1023px. Desktop: sekitar 1024–1439px. Wide desktop: 1440px ke atas.

- Layout harus beradaptasi, bukan sekadar mengecil.

- Navigasi, grid game, grid nominal, halaman top up, halaman proses, dan tabel admin membutuhkan perilaku responsif khusus.

# 7. Global Layout

- Desktop: container konten terpusat dengan lebar maksimum dan padding horizontal konsisten.

- Mobile: padding horizontal ringkas dan konten selebar layar.

- Header tetap stabil secara visual di semua halaman.

- Gunakan judul halaman, breadcrumb, konten, dan spasi section yang konsisten.

- Jangan membuat sistem spasi khusus per halaman kecuali ada alasan UX terdokumentasi.

# 8. Global Header

- Header desktop: logo ORIAS.ID, navigasi utama (Game, Promo, Cek Transaksi), pencarian, dan area akun.

- Header mobile: tombol menu, logo, tombol pencarian. Cek Transaksi tersedia di menu dan di homepage.

- Tidak ada ikon keranjang atau wishlist.

- Pencarian harus mudah dijangkau di halaman daftar game.

- Area akun berubah menurut status autentikasi; login bersifat opsional untuk bertransaksi, jadi tombol Masuk tidak boleh menghalangi alur top up.

- Header harus dapat diakses dengan navigasi keyboard.

# 9. Footer

- Bagian footer: Bantuan (hubungi via WhatsApp), Cara Top Up, Cek Transaksi, Akun, Legal (syarat & ketentuan, kebijakan privasi, kebijakan refund), dan tautan sosial bila ada.

- Sertakan copyright dan tautan legal.

- Jangan membebani footer dengan navigasi yang tidak perlu.

- Di mobile, grup footer boleh menjadi accordion.

# 10. Homepage

- Struktur yang direkomendasikan: Header → Hero/Banner Promo → Kolom Cek Transaksi cepat → Game Populer → Flash Sale → Kategori (Game, Voucher) → Cara Top Up (3–4 langkah) → Trust/Layanan (waktu proses rata-rata, success rate, kontak WhatsApp CS) → Footer.

- Hero harus punya headline jelas, pesan pendukung, dan CTA utama menuju game populer atau pencarian.

- Game populer tampil menonjol tetapi tidak menutupi hero.

- Section bersifat modular agar kampanye dapat diurutkan ulang tanpa menulis ulang halaman.

- Mobile mengutamakan penemuan game dan kejelasan CTA.

# 11. Game Listing Page (/games)

- Struktur: breadcrumb → judul → jumlah hasil → kontrol filter/urutkan → grid game → paginasi/infinite loading.

- Filter: kategori, publisher, tipe (ID atau voucher). Desktop boleh memakai sidebar filter; mobile memakai bottom sheet atau drawer.

- Kartu game menampilkan cover, badge bila relevan (Promo, Voucher, Maintenance), nama game, dan publisher.

- Tampilkan skeleton saat data dimuat.

- Hasil kosong harus memberi pesan membantu dan aksi pemulihan.

# 12. Game Card

- State wajib: default, hover, loading, maintenance, unavailable, promo, featured.

- Interaksi utama: membuka halaman top up game.

- Jangan menaruh terlalu banyak kontrol di kartu.

- Badge tipe (ID atau Voucher) membantu pengguna tahu apakah ID akan diminta.

# 13. Halaman Top Up (/game/:slug)

- Ini adalah layar terpenting. Alurnya satu halaman dengan langkah bernomor yang jelas:
  - Game ID_BASED: 1 Masukkan ID → 2 Pilih nominal → 3 Isi WhatsApp → 4 Pilih pembayaran.
  - Game VOUCHER: 1 Pilih nominal → 2 Isi WhatsApp → 3 Pilih pembayaran. Langkah ID tidak ditampilkan sama sekali, dan penomoran menyesuaikan.

- Layout desktop: kolom kiri berisi banner/info game dan langkah-langkah; kolom kanan berisi ringkasan pesanan yang sticky dengan tombol Bayar.

- Layout mobile: banner ringkas → langkah-langkah berurutan → bar bawah sticky berisi total dan tombol Bayar. Ringkasan lengkap dapat dibuka dari bar bawah.

- Form ID (GameIdForm): field dibangun dinamis dari game_input_fields (mis. User ID + Server). Setelah ID lengkap, tampilkan hasil validasi nickname dengan jelas ("Akun ditemukan: NamaAkun") atau pesan error yang bisa dipulihkan. Bila game tidak mendukung cek nickname, tampilkan peringatan bahwa kesalahan ID tidak dapat dibatalkan.

- Grid nominal (DenominationCard): kartu besar mudah di-tap, menampilkan nama nominal dan harga; badge promo/populer; state terpilih, nonaktif (maintenance), dan habis.

- Field WhatsApp (PhoneInput): wajib, dengan label dan keterangan singkat "Dipakai untuk mengirim invoice dan menghubungi kamu jika ada kendala". Terima 08xx dan +62; tampilkan format ternormalisasi; validasi inline.

- Pilihan pembayaran: lihat bagian 14.

- Kode promo bersifat opsional dan tersembunyi di balik tautan "Punya kode promo?".

- State CTA: Bayar, Lengkapi data (nonaktif dengan petunjuk field yang belum terisi), Memproses, Produk sedang maintenance.

- Saat klik Bayar tombol masuk state processing dan mencegah submit ganda; setelah order dibuat, pengguna diarahkan ke /invoice/:invoiceNumber.

- Customer login dapat memilih ID tersimpan (saved game account) dengan satu klik.

# 14. Metode Pembayaran & Ringkasan Pesanan

- PaymentMethodCard: logo/nama metode, biaya (bila ada), estimasi verifikasi, state terpilih dan nonaktif. Kelompokkan: QRIS, E-Wallet, Virtual Account, Minimarket.

- Total bergantung metode bayar (fee), sehingga total di ringkasan harus diperbarui saat metode berubah, dengan pembaruan yang tenang (tanpa animasi harga yang mengganggu).

- OrderSummary menampilkan: game, nominal, ID + nickname (ID_BASED), subtotal, diskon, biaya, dan total. Semua nilai uang diformat konsisten.

- Total yang tampil hanya untuk pratinjau; server menghitung total final saat order dibuat.

- Bila harga atau status produk berubah antara tampilan dan submit, tampilkan pesan jelas dan pertahankan input pengguna.

# 15. Halaman Proses Realtime (/invoice/:invoiceNumber)

- Halaman ini dipakai setelah klik Bayar, dari tautan invoice di WhatsApp, dan dari Cek Transaksi.

- Stepper (OrderStepper) memiliki 3 titik utama: Menunggu Pembayaran → Diproses → Sukses. Desktop memakai stepper horizontal; mobile memakai stepper vertikal.

- Aturan titik progres:
  - Belum bayar: indikator berhenti di titik 1 (Menunggu Pembayaran) sampai pembayaran terverifikasi.
  - Setelah bayar: berpindah ke titik 2 (Diproses) secara otomatis.
  - Berhasil: berpindah ke titik 3 (Sukses).

- Konten per step:
  - Step 1: PaymentInstruction sesuai metode (QR QRIS, nomor VA dengan tombol salin, tombol buka e-wallet), nominal, dan CountdownTimer batas bayar.
  - Step 2: pesan "Sedang diproses", estimasi waktu, dan indikator aktivitas. Bila supplier masih menunggu (PENDING_SUPPLIER), tampilkan bahwa proses sedikit lebih lama dan sampaikan bahwa tim akan menghubungi lewat WhatsApp bila ada kendala.
  - Step 3: ringkasan hasil (nominal masuk ke akun/nickname), waktu selesai, nomor transaksi. Untuk voucher: VoucherCodeReveal (kode disembunyikan dulu, tombol tampilkan dan salin).

- Kondisi di luar jalur utama ditampilkan jelas di stepper dengan ikon dan teks: Kedaluwarsa (tidak dibayar), Dibatalkan, Gagal (disertai info refund), Refund diproses, Refund selesai. Setiap kondisi menyediakan aksi pemulihan (Top up lagi, Hubungi CS via WhatsApp).

- Pembaruan realtime: halaman berlangganan perubahan status; step berpindah tanpa refresh. Tampilkan indikator kecil bila koneksi realtime terputus dan sedang memakai polling. Jangan mengosongkan layar saat memuat ulang data.

- Tombol: Salin nomor invoice, Cek status, Cetak/Unduh invoice, Top up lagi.

- Status pending tidak boleh ditampilkan sebagai sukses. Bedakan PENDING_PAYMENT dari PAID dengan jelas.

- Halaman ini bersifat noindex dan tidak menampilkan data pribadi mentah (ID dan WhatsApp disamarkan sebagian).

# 16. Invoice

- InvoiceView ditampilkan di halaman proses dan dapat dicetak/diunduh sebagai PDF.

- Isi: nomor invoice, tanggal, game, nominal, ID game (samar) dan nickname, rincian harga (subtotal, diskon, biaya), total, metode bayar, status, dan waktu tiap step.

- Invoice dibuat sejak order dibuat (status belum bayar) dan berubah menjadi bukti lunas tanpa mengganti nomor.

- Layout cetak terpisah (tanpa elemen navigasi dan dekorasi). Nomor invoice memakai font yang mudah dibaca dan mudah disalin.

# 17. Cek Transaksi (/cek-transaksi)

- Satu field untuk nomor invoice, dengan tombol Cek dan dukungan tempel (paste).

- Bila ditemukan, pengguna diarahkan ke halaman proses realtime (bagian 15); tidak ada halaman hasil terpisah.

- Bila tidak ditemukan, tampilkan pesan generik yang sama untuk semua kegagalan ("Nomor invoice tidak ditemukan. Periksa kembali.") dan tampilkan pesan khusus bila terkena rate limit.

- Opsional: daftar "Transaksi terakhir di perangkat ini" (disimpan lokal) dengan tombol hapus riwayat.

- Halaman ini noindex.

# 18. Customer Account

- Akun bersifat opsional. Navigasi akun: Ringkasan, Riwayat Transaksi, ID Game Tersimpan, Kupon, Ulasan, Notifikasi, Profil, Keamanan.

- Desktop boleh memakai sidebar; mobile memakai navigasi bertumpuk/kartu.

- Aksi sensitif seperti ganti password harus punya state konfirmasi eksplisit.

- Daftar transaksi menampilkan nomor invoice, game, nominal, tanggal, total, dan status. Mengetuk transaksi membuka halaman proses yang sama (bagian 15), bukan halaman detail terpisah.

# 19. ID Game Tersimpan

- Daftar akun game tersimpan per game (label, ID samar, nickname).

- Aksi: tambah, ubah label, hapus. Dari halaman top up, pengguna dapat memilih akun tersimpan dengan satu klik.

- Hanya berlaku untuk game ID_BASED.

# 20. Reviews

- Form ulasan mendukung rating dan komentar, hanya untuk transaksi Sukses; tampilkan indikator verified purchase.

- Status moderasi tidak boleh tampil sebagai istilah internal yang membingungkan bagi customer.

- Ringkasan rating dan jumlah ulasan tampil di halaman top up sebagai social proof.

# 21. Notifications

- Pusat notifikasi mengelompokkan status belum dibaca dan sudah dibaca.

- Status belum dibaca harus jelas tanpa hanya mengandalkan warna.

- Klik notifikasi mengarah ke resource terkait, yaitu halaman proses invoice.

- Kegagalan pengiriman WhatsApp tidak boleh mengganggu alur customer; status transaksi tetap dapat dilihat di halaman proses.

# 22. Search UX

- Input pencarian mendukung debouncing.

- Autocomplete dapat menampilkan game populer, game yang cocok (termasuk alias seperti "ML"), kategori, dan pencarian terakhir.

- Hasil pencarian menyimpan query dan filter di URL bila memungkinkan.

- Tangani hasil kosong dan salah ketik dengan jelas.

# 23. Admin Dashboard

- Layout admin: sidebar navigasi + top bar + area konten.

- Kartu dashboard: omzet, order, order sukses/gagal, success rate, pending payment, order stuck PROCESSING, saldo supplier, margin, refund.

- Grafik: tren omzet, tren order, top game, top produk, performa supplier.

- Dashboard mendukung pemilihan rentang tanggal.

- Jangan membebani dashboard dengan grafik dekoratif yang tidak mendukung keputusan.

# 24. Admin Game & Product Management

- Daftar game: pencarian, filter, status, tipe (ID/voucher), aksi massal.

- Editor game: informasi dasar, fulfillment_type, field input ID dinamis (hanya ID_BASED), media, SEO, status.

- Daftar nominal per game: nama, harga jual, harga modal, margin, status, mapping supplier; edit harga mencatat riwayat harga.

- Gunakan tab atau section terpisah untuk editor yang kompleks.

- Perubahan yang belum disimpan harus terdeteksi; aksi destruktif butuh konfirmasi.

# 25. Admin Order Management

- Tabel order menampilkan nomor invoice, game, nominal, WhatsApp, tanggal, status payment, status fulfillment, total, dan aksi.

- Pencarian berdasarkan nomor invoice atau nomor WhatsApp. Filter: status, game, supplier, rentang tanggal.

- Detail order: timeline status, data akun (ID, nickname), payment, riwayat fulfillment attempt dan respons supplier, catatan, dan audit sesuai role.

- Antrean "Perlu dihubungi": order Gagal, Stuck, atau pembayaran terlambat, lengkap dengan tombol Chat WhatsApp (membuka wa.me dengan pesan template dan nomor invoice).

- Aksi: retry fulfillment, tandai manual, refund. Aksi yang tidak dapat dibatalkan atau sensitif secara finansial wajib konfirmasi.

- UI admin tidak boleh menyediakan kontrol yang tidak boleh dijalankan role saat ini.

# 26. Admin Supplier Management

- Daftar supplier: status, prioritas, saldo terakhir (SupplierBalanceCard), ambang saldo rendah.

- Mapping produk ke supplier (primary dan fallback), sinkronisasi harga/produk, dan tombol set maintenance.

- Log request/respons fulfillment dengan data sensitif disamarkan.

- Peringatan jelas saat saldo di bawah ambang.

# 27. Admin Promotions

- Editor promosi: kode, tipe, nilai, kondisi, batas penggunaan, batas per pengguna, waktu mulai/akhir, cakupan game/produk/metode pembayaran, user baru, status.

- Pratinjau perilaku diskon sebelum aktivasi bila praktis; peringatan bila harga akhir di bawah modal.

- Promosi kedaluwarsa atau nonaktif tetap terlihat untuk audit/riwayat.

# 28. Component System

- Komponen inti: Button, IconButton, Input, Select, Checkbox, Radio, Switch, Textarea, Modal, Drawer, Toast, Tooltip, Badge, Tabs, Dropdown, Pagination, Breadcrumb, Skeleton, EmptyState, ErrorState, ConfirmDialog, CopyButton.

- Komponen komersial: GameCard, GameGrid, DenominationCard, GameIdForm, PhoneInput, PaymentMethodCard, OrderSummary, PriceDisplay, CouponInput, OrderStepper, OrderStatusBadge, PaymentInstruction, CountdownTimer, InvoiceView, VoucherCodeReveal, Rating.

- Komponen admin: DataTable, FilterBar, StatCard, ChartCard, BulkActionBar, FormSection, AuditTimeline, SupplierBalanceCard, WhatsAppChatButton.

# 29. Component State Rules

- Komponen interaktif harus mendefinisikan state default, hover, focus, active, disabled, loading, error, dan success bila berlaku.

- Form membedakan error validasi tingkat field dari error global/server.

- Tombol yang memicu mutasi jaringan harus masuk state processing dan mencegah submit ganda.

- Toast menyampaikan keberhasilan/kegagalan tanpa menggantikan state error persisten di halaman.

# 30. Loading States

- Gunakan skeleton untuk grid game, grid nominal, halaman proses, daftar akun, dan kartu dashboard bila stabilitas layout penting.

- Gunakan spinner untuk aksi singkat seperti submit tombol dan validasi nickname.

- Jangan mengosongkan seluruh layar untuk mutasi data kecil.

- Pertahankan konten yang ada saat mutasi latar belakang berjalan, terutama saat halaman proses memuat ulang data.

# 31. Empty & Error States

- Setiap halaman berbasis data harus punya state loading, empty, error, dan success.

- State kosong menjelaskan alasan dan memberi aksi lanjut.

- Error harus dapat dibaca manusia dan menyertakan retry/pemulihan bila sesuai.

- Detail error teknis tidak boleh ditampilkan langsung ke customer.

# 32. Accessibility

- Gunakan HTML semantik.

- Semua kontrol interaktif harus dapat diakses keyboard dan memiliki fokus yang terlihat.

- Jangan mengandalkan warna saja untuk status; stepper dan badge wajib memakai ikon dan teks.

- Perubahan step di halaman proses diumumkan lewat region aria-live (polite).

- Gambar informatif perlu alt text bermakna; gambar dekoratif ditandai sesuai.

- Form harus punya label dan asosiasi error yang aksesibel. Field ID dan WhatsApp memakai inputmode yang sesuai.

- Jaga kontras yang memadai.

# 33. Motion & Interaction

- Gunakan motion untuk menjelaskan perubahan state, bukan sebagai dekorasi di semua tempat.

- Rekomendasi: 150–250ms untuk mikro-interaksi dan sekitar 250–400ms untuk drawer/modal; perpindahan titik stepper boleh sedikit lebih halus namun tetap singkat.

- Hormati prefers-reduced-motion (stepper berpindah tanpa animasi).

- Jangan menganimasikan perubahan harga atau informasi penting secara mengganggu.

# 34. Frontend State Architecture

- Pisahkan server state dari UI state.

- Server state: game, produk, order/invoice, profil, notifikasi. UI state: modal/drawer terbuka, tab terpilih, filter, pilihan sementara pada form top up.

- Pilihan form top up (ID, nominal, WhatsApp, metode bayar) disimpan sebagai state lokal halaman dan dipulihkan bila pengguna kembali dari kegagalan.

- Status order realtime dikelola di satu hook/modul (order-tracker) yang menggabungkan Realtime dan polling, bukan diduplikasi di komponen.

- Pusatkan hanya state yang benar-benar dipakai bersama; hindari objek global raksasa.

- Gunakan komunikasi berbasis event antar modul fitur bila sesuai (context, custom hooks, atau emitter ringan).

# 35. URL & Navigation Rules

- Filter dan pencarian penting harus dapat direpresentasikan di query parameter URL.

- Back/forward browser harus berperilaku dapat diprediksi.

- Gunakan slug stabil untuk halaman publik.

- Halaman /invoice/:invoiceNumber dan /cek-transaksi dapat dibuka tanpa login.

- Halaman yang dilindungi (riwayat, akun, admin) mengarahkan pengguna yang belum login ke halaman masuk sambil menyimpan tujuan.

# 36. Frontend Security Rules

- Jangan menaruh API key rahasia di kode frontend, termasuk environment variable berawalan VITE_ (ikut ter-bundle ke client).

- Jangan percaya total yang dihitung client.

- Jangan mengekspos data khusus admin di elemen DOM tersembunyi.

- Jangan menampilkan atau menyimpan ID game, nomor WhatsApp, atau kode voucher mentah di log, URL, atau penyimpanan lokal tanpa kebutuhan. Riwayat lokal di Cek Transaksi hanya menyimpan nomor invoice.

- Escape/sanitasi konten buatan pengguna sebelum dirender; jangan memakai dangerouslySetInnerHTML dengan konten tidak tepercaya.

- Gunakan autentikasi/sesi aman dari backend.

# 37. Performance Rules

- Lazy-load gambar di bawah fold dan gunakan ukuran gambar responsif.

- Gunakan code splitting berbasis route (React.lazy) untuk admin dan fitur jarang dipakai.

- Debounce permintaan pencarian/filter dan validasi nickname.

- Hindari re-render berlebihan; memoisasi hanya bila terbukti membantu.

- Jangan memuat library admin di halaman storefront.

- Halaman top up dan halaman proses harus ringan dan cepat di jaringan seluler.

# 38. SEO Frontend Rules

- Setiap halaman game/kategori publik memiliki title dan meta description unik.

- Gunakan canonical URL dan heading semantik berurutan logis.

- Structured data produk harus cocok dengan informasi yang terlihat.

- Jangan membuat URL duplikat yang dapat diindeks dari kombinasi filter sembarang kecuali sengaja dikonfigurasi.

- Halaman /invoice/*, /cek-transaksi, /orders, dan /admin diberi noindex.

# 39. Frontend Folder Structure

- src/lib: bootstrap aplikasi, router, state setup, events, API client, config.

- src/components: komponen UI reusable.

- src/features: modul fitur seperti games, topup, orders, order-tracker, invoice, payment, promotions, reviews, saved-accounts (komponen, hooks, dan tipe per fitur).

- src/pages: komposisi tingkat route.

- src/services: modul service/API per domain.

- src/admin: halaman/komponen/service khusus admin (lazy-loaded).

- src/types: tipe TypeScript yang selaras dengan skema database.

- src/utils: format, validasi (termasuk normalisasi WhatsApp), helper keamanan.

- src/index.css dan tailwind.config: design token (CSS variable), pemetaan tema Tailwind, base style.

# 40. Frontend Coding Rules for AI Developer

- Jangan membuat file monolit. Jaga TypeScript strict dan hindari `any`.

- Satu modul memiliki satu domain bisnis.

- Komponen fokus pada rendering dan interaksi; service menangani komunikasi bisnis/API.

- Jangan menduplikasi logika kartu, format harga, toast, modal, validasi, maupun pemetaan status ke step (gunakan hasil step dari server).

- Gunakan ulang design token, bukan nilai hard-coded.

- Jangan mengubah style global untuk menyelesaikan masalah komponen lokal tanpa memeriksa dampaknya.

- Sebelum membuat komponen baru, cari komponen reusable yang sudah ada.

- Setiap layar baru harus memperhitungkan desktop, tablet, mobile, serta state loading, empty, error, dan success.

- Temuan bug/masalah saat bekerja diperbaiki saat itu juga; bila butuh keputusan, tanya langsung sambil tawarkan solusi.

# 41. UX Quality Checklist

- Apakah pengguna paham langkah berikutnya tanpa penjelasan?

- Apakah CTA utama (Bayar) jelas, dan tidak ada langkah ID yang muncul untuk game voucher?

- Apakah harga dan total biaya tidak ambigu?

- Apakah pengguna bisa pulih dari error (ID salah, pembayaran kedaluwarsa, top up gagal)?

- Apakah UI mencegah aksi ganda (tombol Bayar, tombol validasi)?

- Apakah checkout di mobile nyaman?

- Apakah posisi stepper langsung dimengerti, dan berpindah sendiri tanpa refresh?

- Apakah status penting terlihat tanpa mengandalkan warna?

- Apakah halaman dapat dipakai dengan navigasi keyboard?

- Apakah antarmuka tetap terasa sebagai Orias.ID tanpa dekorasi branding?

# 42. Definition of Done — Frontend

- Layar dianggap selesai hanya bila layout, perilaku responsif, state komponen, state loading, empty, error, aksesibilitas, integrasi API, validasi, dan konsistensi visual sudah diimplementasikan.

- Tidak ada halaman yang dianggap selesai hanya karena happy path berjalan.

# 43. Recommended Screen Map

- Publik: Home, Daftar Game, Hasil Pencarian, Kategori, Halaman Top Up (/game/:slug), Proses & Invoice (/invoice/:invoiceNumber), Cek Transaksi, Promo, Login, Register, Lupa Password.

- Customer: Ringkasan Akun, Riwayat Transaksi, ID Game Tersimpan, Kupon, Ulasan, Notifikasi, Profil, Keamanan.

- Top up (status): Menunggu Pembayaran, Diproses, Sukses, Kedaluwarsa, Gagal/Refund (semuanya variasi satu halaman proses).

- Admin: Dashboard, Game, Editor Game, Produk/Nominal, Kategori, Publisher, Supplier, Order, Detail Order, Antrean Perlu Dihubungi, Customer, Promosi, Ulasan, Laporan, Pengaturan, Audit Log.

# 44. Final Frontend Architecture

Frontend Orias.ID diperlakukan sebagai aplikasi modular: Pages menyusun Components; Components berkomunikasi dengan Feature Modules; Modules memakai Domain Services; Services berkomunikasi dengan API; API menegakkan autentikasi, otorisasi, validasi, transaksi, dan aturan bisnis. Design Token menyediakan satu bahasa visual untuk storefront dan admin. Alur inti: halaman top up → halaman proses realtime, dengan satu sumber kebenaran status dari server.
