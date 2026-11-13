# Quran App

[![Vercel](https://vercel.com/button)](https://quran-apps-brown.vercel.app/)

Quran App adalah aplikasi web yang menyediakan akses mudah untuk membaca Al-Qur'an secara online dengan tampilan yang bersih dan responsif.

## Fitur

- Baca Al-Qur'an dengan teks Arab yang jelas
- Navigasi mudah antar surah dan ayat
- Tampilan responsif untuk berbagai perangkat
- Pemuatan halaman cepat dengan teknologi Next.js

## Teknologi yang Digunakan

### Web (frontend)

| Teknologi | Kegunaan |
|---|---|
| **Next.js 14** (App Router, static export) | Framework React; seluruh halaman di-*export* statis sehingga bisa dibundel ke aplikasi Android |
| **React 18** + **TypeScript 5** | UI berbasis komponen dengan pengetikan statis |
| **Tailwind CSS 3** + `tailwindcss-animate` | Styling utility-first dan animasi |
| **Ant Design 5** | Komponen UI (select, tabel, modal, switch) dengan tema hijau brand |
| **TanStack Query 5** | Pengambilan, cache, dan sinkronisasi data dari API |
| **Zustand 5** | State global (surah aktif, pengaturan adzan tersimpan di `localStorage`) |
| **date-fns** + **hijri-converter** | Format tanggal Indonesia dan kalender Hijriah |
| **jsPDF** + **jspdf-autotable** | Unduh jadwal imsakiyah sebagai PDF |
| **Swiper** | Slider Asmaul Husna |
| **Sonner** | Notifikasi toast |
| **Lucide React** + **React Icons** | Ikon |
| **SVG kustom** | Ilustrasi waktu sholat, ikon Ka'bah, dan kompas kiblat (ringan, tajam di semua layar) |

### Aplikasi Android

| Teknologi | Kegunaan |
|---|---|
| **Capacitor 8** | Membungkus aplikasi web menjadi APK Android |
| `@capacitor/geolocation` | Deteksi lokasi (GPS) untuk jadwal sholat & arah kiblat |
| `@capacitor/local-notifications` | Notifikasi adzan terjadwal dengan suara adzan, tetap berbunyi saat aplikasi ditutup |

### Pengujian & CI/CD

| Teknologi | Kegunaan |
|---|---|
| **Playwright** | Tes end-to-end & unit (`npm run test:e2e`), termasuk simulasi jam untuk adzan dan sensor kompas |
| **GitHub Actions** | Build APK bertanda tangan otomatis di setiap push ke `main`, versi naik otomatis, dan dipublikasikan ke GitHub Releases |
| **Vercel** | Hosting versi web |

## Sumber API

Aplikasi ini menggunakan beberapa sumber API untuk mendapatkan data:

- [eQuran API](https://equran.id/api/v2)
- [MyQuran API](https://api.myquran.com/v2)
- [Nominatim OpenStreetMap](https://nominatim.openstreetmap.org)

## Instalasi dan Penggunaan

1. Clone repository ini:
   ```sh
   git clone https://github.com/username/quran-app.git
   cd quran-app
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Jalankan aplikasi secara lokal:
   ```sh
   npm run dev
   ```
4. Akses aplikasi di browser melalui `http://localhost:3001`

## Deployment

Aplikasi ini dapat langsung di-deploy ke Vercel dengan perintah:

```sh
vercel
```

## Kontribusi

Jika ingin berkontribusi, silakan fork repository ini dan ajukan pull request dengan fitur atau perbaikan yang diusulkan.

## Lisensi

Aplikasi ini dirilis di bawah lisensi MIT.

---

Kunjungi aplikasi: [Quran App](https://quran-apps-brown.vercel.app/)
