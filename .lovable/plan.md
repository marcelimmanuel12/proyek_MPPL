
Saya akan mengembangkan 6 area utama. Karena cakupannya besar, saya pecah jadi modul yang jelas — semua tetap dalam satu siklus build.

## 1. Pengingat Obat & Check-up (CRUD + Notifikasi)
- Halaman baru `/reminders` dengan tab: **Pengingat**, **Obat**, **Check-up**.
- CRUD penuh (create, list, edit dialog, delete dengan konfirmasi) untuk tabel `reminders`, `medications`, `checkups`.
- Notifikasi otomatis: hook `useReminderNotifications` sudah ada — perluas agar juga jalan untuk jadwal obat (`medications.schedule_times`) dan check-up (`checkups.checkup_date`). Tambah permintaan izin notifikasi browser saat masuk dashboard, plus toast in-app.
- Tombol Edit & Delete + indikator status aktif/nonaktif.

## 2. Peta Rumah Sakit
- Halaman baru `/hospitals` menggunakan Google Maps (connector `google_maps` — saya cek/aktifkan).
- Fitur:
  - Search rumah sakit by nama/lokasi (Places API New `searchText` via gateway).
  - Daftar 10 RS terdekat dari lokasi user (geolocation browser → `searchNearby`).
  - Detail: alamat, jam buka, telepon, rating (place details).
  - Tombol "Booking / Daftar Online" → dialog form sederhana yang menyimpan ke tabel baru `hospital_bookings` (nama, tanggal, keluhan, status pending).

## 3. Challenge — alur lanjutan
- Halaman detail `/challenges/$id`:
  - Info target, durasi, deskripsi, status (Belum mulai / Berjalan / Selesai).
  - Progress bar harian + tombol "Check-in hari ini" yang menambah `user_challenges.progress_days`.
  - Tandai `completed` saat progress >= duration_days, beri badge.
- Halaman `/challenges` daftar + tombol Ikut.
- **Leaderboard** di bawah daftar: top user berdasar total progress + jumlah challenge selesai (query via server fn agar bisa pakai admin client untuk join lintas user; hanya expose `full_name` + skor).
- Sistem badge sederhana: tabel `user_badges` (auto-insert saat selesai challenge).

## 4. Edukasi otomatis pada onboarding (realtime saat input usia)
Di form onboarding (kolom umur), tampilkan kartu live:
- **Tekanan darah normal** by rentang umur (anak/remaja/dewasa/lansia) — tabel statis di frontend.
- **Kategori usia produktif** (15–64 thn di Indonesia) + info bonus demografi 2045.
- **Rekomendasi gula harian** (anak <25g, dewasa ≤50g WHO/Kemenkes), ditampilkan dengan ikon.
Semua reaktif `onChange` umur.

## 5. Database changes (migrasi)
Tabel baru:
- `hospital_bookings` (user_id, hospital_name, hospital_place_id, address, booking_date, complaint, status, created_at)
- `user_badges` (user_id, badge_code, label, earned_at)
- Tambah index pada `user_challenges(user_id)` untuk leaderboard.
RLS + GRANT seperti pola standar.

## 6. UI/Navigation
- Tambah link di dashboard ke: Pengingat, Peta RS, Challenge.
- Pastikan semua route baru di bawah `_authenticated/`.

## Catatan teknis
- Google Maps: pakai connector + browser key untuk Maps JS, gateway untuk Places.
- Leaderboard pakai `createServerFn` + `supabaseAdmin` (load inside handler), hanya proyeksikan kolom aman.
- Notifikasi: tetap polling 60 detik (sudah ada), perluas ke medication & checkup.

Setuju saya lanjut implementasi semuanya? Atau ada modul yang mau diprioritaskan dulu (mis. cuma #1, #2, #4 dulu)?
