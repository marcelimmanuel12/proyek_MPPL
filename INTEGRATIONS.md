# Integrasi Eksternal — SehatKu

Dokumen ini merangkum semua layanan eksternal dan pihak ketiga yang digunakan oleh project **SehatKu**, beserta detail teknis, env variable yang dibutuhkan, dan status saat ini.

---

## Ringkasan

| # | Layanan | Kategori | Status | Env Variable |
|---|---------|----------|--------|--------------|
| 1 | Lovable AI Gateway | AI / LLM | ✅ Aktif | `LOVABLE_API_KEY` |
| 2 | Google Gemini (via Gateway) | AI / LLM Model | ✅ Aktif (lewat Gateway) | — |
| 3 | OpenStreetMap | Peta / Map | ✅ Aktif (gratis, no key) | — |
| 4 | Google Maps (Link) | Maps / Navigasi | ✅ Aktif (deep link saja) | — |
| 5 | Web Notifications API | Browser API | ✅ Aktif | — |
| 6 | Browser Geolocation API | Browser API | ✅ Aktif | — |
| 7 | Supabase | Database + Auth | ❌ Dihapus | ~~`SUPABASE_URL`~~ |
| 8 | Lovable Cloud Auth | OAuth / Auth | ❌ Dihapus | ~~`LOVABLE_API_KEY`~~ |
| 9 | Cloudflare Workers | Deployment | ⚠️ Target awal, perlu dikonfigurasi | — |

---

## Detail Per Integrasi

---

### 1. Lovable AI Gateway

**Endpoint:** `https://ai.gateway.lovable.dev/v1/chat/completions`

**Digunakan di:** `src/lib/ai.functions.ts`

**Fungsi:**
- Gateway proxy untuk memanggil model AI (saat ini Google Gemini)
- Dipakai untuk tiga fitur utama:

| Fungsi Server | Trigger | Output |
|---------------|---------|--------|
| `analyzeInitialHealth` | Selesai isi kuesioner onboarding | Analisis kesehatan awal + rekomendasi (max 200 kata) |
| `analyzeMonitoring` | Check-in monitoring 5 jam | Feedback harian singkat (max 100 kata) |
| `aiChat` | Tab AI Konsultasi di dashboard | Respons konsultasi / analisis gejala / rekomendasi pola hidup |

**Request format:**
```json
{
  "model": "google/gemini-3-flash-preview",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ]
}
```

**Error handling:**
- `429` → "Terlalu banyak permintaan"
- `402` → "Kuota AI habis"

**Env variable yang dibutuhkan:**
```env
LOVABLE_API_KEY=your_key_here
```

> ⚠️ Key ini diakses di **server-side only** via `process.env.LOVABLE_API_KEY`. Tidak boleh di-expose ke client.

---

### 2. Google Gemini (via Lovable Gateway)

**Model yang dipakai:** `google/gemini-3-flash-preview`

**Akses:** Tidak langsung — semua request ke Gemini dilewatkan melalui Lovable AI Gateway (lihat #1).

**Tidak perlu** Google AI API key sendiri selama menggunakan gateway Lovable.

---

### 3. OpenStreetMap (Embed)

**Endpoint:** `https://www.openstreetmap.org/export/embed.html`

**Digunakan di:** `src/routes/_authenticated/dashboard.tsx` — tab `MapTab`

**Fungsi:**
- Menampilkan peta area Indonesia secara embed via `<iframe>`
- Jika user mengizinkan geolokasi, peta di-center ke koordinat user
- Tidak memerlukan API key
- Tidak mengirim data user ke OpenStreetMap

**Contoh URL yang dibuat:**
```
https://www.openstreetmap.org/export/embed.html?bbox=95,-11,141,6&layer=mapnik
```

---

### 4. Google Maps (Deep Link saja)

**Endpoint:** `https://www.google.com/maps/search/?api=1&query=...`

**Digunakan di:** `src/routes/_authenticated/dashboard.tsx` — tombol "Lihat di Maps" per rumah sakit

**Fungsi:**
- Buka Google Maps di tab baru untuk navigasi ke rumah sakit yang dipilih
- Ini adalah **link biasa** (bukan Maps API/SDK), tidak memerlukan API key
- Data koordinat rumah sakit berasal dari **static list** di `src/lib/hospitals-data.ts` (12 RS, kurasi manual)

---

### 5. Web Notifications API (Browser)

**Tipe:** Native Browser API

**Digunakan di:**
- `src/hooks/use-reminder-notifications.ts`
- `src/routes/_authenticated/dashboard.tsx` — tombol "Aktifkan Notif"

**Fungsi:**
- Meminta izin notifikasi browser saat pertama kali user membuka dashboard
- Mengirim notifikasi native OS untuk:
  - 🔔 Pengingat (tidur, olahraga, check-up, custom) — sesuai jam yang dijadwalkan
  - 💊 Waktu minum obat — sesuai `schedule_times` di data obat
  - 🩺 Jadwal check-up hari ini — dikirim jam 08:00

**Mekanisme:**
- Polling setiap **60 detik** via `setInterval`
- Membandingkan waktu saat ini (HH:MM) dengan jadwal
- Menggunakan `firedRef` (Set) untuk mencegah notifikasi duplikat dalam satu hari

**Tidak memerlukan** API key atau layanan pihak ketiga.

---

### 6. Browser Geolocation API

**Tipe:** Native Browser API

**Digunakan di:** `src/routes/_authenticated/dashboard.tsx` — tab `MapTab`, tombol "Gunakan Lokasiku"

**Fungsi:**
- Mengambil koordinat lat/lng user (`navigator.geolocation.getCurrentPosition`)
- Dipakai untuk menghitung jarak ke tiap rumah sakit menggunakan formula **Haversine** (di `src/lib/hospitals-data.ts`)
- Mengurutkan daftar RS dari yang terdekat

**Privasi:** Koordinat user hanya digunakan secara lokal di browser, tidak dikirim ke server atau pihak ketiga.

---

### 7. Supabase ❌ (Sudah Dihapus)

**Status:** Dihapus pada refaktor ke full Next.js + Prisma.

**Yang sudah dibersihkan:**
- `src/integrations/supabase/` — folder dihapus
- `@supabase/supabase-js` — dihapus dari `package.json`
- Semua `supabase.from(...)` di source code diganti dengan `fetch("/api/...")`
- Env variables Supabase di `.env` perlu dibersihkan secara manual

**Env variables lama (tidak lagi dipakai):**
```env
SUPABASE_URL=...           # tidak dipakai
SUPABASE_PUBLISHABLE_KEY=... # tidak dipakai
VITE_SUPABASE_URL=...      # tidak dipakai
VITE_SUPABASE_PUBLISHABLE_KEY=... # tidak dipakai
```

---

### 8. Lovable Cloud Auth (`@lovable.dev/cloud-auth-js`) ❌ (Sudah Dihapus)

**Status:** Dihapus bersamaan dengan Supabase.

**Yang sudah dibersihkan:**
- `src/integrations/lovable/` — folder dihapus
- Import `lovable.auth.signInWithOAuth` di `login.tsx` sudah diganti

> Tombol Google OAuth di halaman login saat ini hanya menampilkan toast info. Perlu diimplementasi ulang menggunakan **NextAuth.js** atau library auth pilihan.

---

### 9. Cloudflare Workers (Deployment Target)

**Status:** ⚠️ Konfigurasi awal dari Lovable, belum tentu aktif di setup saat ini.

**Package terkait:**
- `@cloudflare/vite-plugin` — ada di `dependencies`
- `nitro` (3.0.260603-beta) — ada di `dependencies`

**Catatan:** Karena project sekarang bermigrasi ke Next.js, deployment target kemungkinan berubah ke **Vercel** atau **Railway**. Dua package di atas bisa dihapus dari `package.json` setelah migrasi selesai.

---

## Environment Variables yang Diperlukan (Saat Ini)

```env
# AI Gateway (wajib untuk fitur AI)
LOVABLE_API_KEY=your_lovable_ai_key

# Database (akan dibutuhkan setelah setup Prisma)
DATABASE_URL=your_database_connection_string

# Auth (akan dibutuhkan setelah setup NextAuth)
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
```

---

## Integrasi yang Perlu Ditambahkan (Roadmap)

| Kebutuhan | Rekomendasi | Catatan |
|-----------|-------------|---------|
| Database ORM | **Prisma** | Sudah direncanakan |
| Auth (email/password) | **NextAuth.js (Auth.js v5)** | Ganti Supabase Auth |
| Auth (Google OAuth) | **NextAuth.js + Google Provider** | Ganti Lovable Cloud Auth |
| Database hosting | **Neon / PlanetScale / Railway** | PostgreSQL managed |
| Deployment | **Vercel** | Paling mudah untuk Next.js |

---

*Dokumen ini diperbarui: Juni 2026*
