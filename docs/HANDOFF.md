# Handoff — Phase 00 & Phase 01

Dibuat dalam satu sesi (di luar aturan "satu task = satu chat"), jadi dicatat per task.

## Phase 00 — Project Initialization & Architecture

TASK P00-T1 — Status: COMPLETE
Dibuat: package.json, tsconfig*.json, vite.config.ts, tailwind/postcss config, eslint.config.js, prettier, .gitignore, .env.example, index.html.
Uji: `npm run build` dan `npm run dev` jalan (halaman, main.tsx, router, CSS merespons 200).

TASK P00-T2 — Status: COMPLETE
Struktur src/{lib,features,components,services,pages,admin,types,utils} + semua route di TS 4 terdaftar (public, `/game/:slug`, `/invoice/:invoiceNumber`, `/cek-transaksi`, admin lazy-load). Tidak ada file monolit.

TASK P00-T3 — Status: COMPLETE
Design token (CSS variable, tema gelap + ivory) dipetakan ke Tailwind; palet bawaan Tailwind dihapus. Halaman contoh: `/dev/tokens` (hanya mode dev). ESLint melarang warna hard-coded `bg-[#...]` (sudah diuji).

TASK P00-T4 — Status: COMPLETE
`lib/api.ts` (klien Supabase), `config.ts` (menolak service_role/sb_secret_ di frontend), `errors.ts` (envelope + kode error stabil), `logger.ts` (redaksi data pribadi), `events.ts`. ESLint melarang komponen/halaman memakai Supabase langsung (sudah diuji).

TASK P00-T5 — Status: COMPLETE
`supabase/migrations`, `supabase/seed.sql`, `supabase/functions/.env.example`, README.

## Phase 01 — Database + Authentication + Security

TASK P01-T1 — Status: COMPLETE — migration 001 (roles, profiles, user_roles, trigger signup + backfill).
TASK P01-T2 — Status: COMPLETE — migration 002 (categories, publishers, saved_game_accounts).
TASK P01-T3 — Status: COMPLETE — migration 003 (audit_logs append-only, write_audit_log hanya service_role).
TASK P01-T4 — Status: COMPLETE — migration 004 (has_role/is_staff/is_admin/get_my_roles, admin_grant_role/admin_revoke_role khusus super_admin + audit, RLS, GRANT per kolom).
TASK P01-T5 — Status: PARTIAL — kode selesai (login, register, logout, RequireAuth, RequireRole, ?next= aman dari open redirect); belum diuji dengan Supabase asli.
TASK P01-T6 — Status: COMPLETE — `supabase/seed.sql` (5 akun dev) + `db-tests/` (58 uji akses, semua lulus di PostgreSQL 16 dengan stub Supabase).

## Temuan yang sudah diperbaiki saat mengerjakan
- Tabel baru default-deny: `alter default privileges ... revoke` di migration 001, supaya tabel Phase berikutnya tidak otomatis terbuka ke anon/authenticated (default Supabase memberi akses penuh).
- Kolom sensitif profil (`status`, `user_id`) tidak bisa diubah client: GRANT UPDATE hanya pada display_name, phone, avatar_url.
- Super admin terakhir dan role `customer` tidak bisa dicabut.
- Registrasi: `display_name` dari metadata disaring (trim, 2–60 karakter) di trigger server, bukan dipercaya dari client.
- Parameter `?next=` login divalidasi (cegah open redirect).
- Tipe `rpc('get_my_roles')` tulisan-tangan ter-resolve `never` di supabase-js 2.118; dibungkus cast eksplisit di `auth-service.ts`. Hilang bila memakai `supabase gen types`.

## Perlu keputusan / tindak lanjut
1. `saved_game_accounts.game_id` belum punya foreign key karena tabel `games` baru ada di Phase 02. WAJIB ditambahkan di migration P02-T1 (`alter table ... add foreign key (game_id) references games(id)`).
2. Lupa password / reset password belum dibuat (tidak ada di checklist Phase 01; ada di screen map UI 43). Usul: tambahkan sebelum produksi.
3. Konfirmasi email: `signUp` menangani kedua mode (dengan/tanpa konfirmasi). Putuskan mode untuk produksi.
4. Super admin pertama di produksi dibuat manual lewat SQL (lihat README).
5. Chunk `TokenShowcasePage` ikut ter-build di produksi walau rutenya hanya didaftarkan saat dev. Tidak berbahaya; bisa dirapikan di Phase 14.

## Ditunda
Semua fitur Phase 02 dan seterusnya (halaman masih placeholder).
