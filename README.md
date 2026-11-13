# Quran Apps

[![Vercel](https://vercel.com/button)](https://quran-apps-brown.vercel.app/)
[![Build Android APK](https://github.com/yusezmann/quran-apps/actions/workflows/android-build.yml/badge.svg)](https://github.com/yusezmann/quran-apps/actions/workflows/android-build.yml)
[![Rilis terbaru](https://img.shields.io/github/v/release/yusezmann/quran-apps?label=APK)](https://github.com/yusezmann/quran-apps/releases/latest)

Aplikasi ibadah harian berbahasa Indonesia: **Al-Qur'an, jadwal sholat & adzan, arah kiblat, imsakiyah, doa, hadits, dan Asmaul Husna**. Tersedia sebagai **aplikasi web** dan **aplikasi Android**.

- 🌐 **Web:** [quran-apps-brown.vercel.app](https://quran-apps-brown.vercel.app/)
- 📱 **Android:** [unduh APK terbaru](https://github.com/yusezmann/quran-apps/releases/latest/download/quran-apps.apk)

## Fitur

### Beranda — dasbor harian
- Hitung mundur ke **sholat berikutnya** dan 6 waktu sholat hari ini (Imsak–Isya) dengan ilustrasi suasana langit tiap waktu
- Tanggal Masehi & **Hijriah** (konvensi Indonesia, sama di seluruh aplikasi)
- Ganti kota manual atau **deteksi lokasi otomatis (GPS)**; kota tersimpan dan dipakai di semua fitur
- Pintasan **Lanjutkan membaca** (surah & ayat terakhir), **jadwal sebulan**, **libur berikutnya**, dan kartu khusus saat **Ramadhan**

### Adzan
- Adzan otomatis saat masuk waktu sholat, bisa diatur **per waktu sholat**
- Pilihan suara **Makkah / Mesir**; Subuh otomatis memakai **Adzan Subuh**
- **Pengingat** 5/10/15 menit sebelum sholat
- Di **Android**: notifikasi terjadwal yang **tetap berbunyi walau aplikasi ditutup atau layar mati**, dengan tombol uji notifikasi
- Di **web**: adzan berbunyi selama aplikasi terbuka, disertai notifikasi browser

### Al-Qur'an
- 114 surah dengan teks Arab, transliterasi, dan terjemahan Indonesia
- **Audio murottal** per ayat dengan pilihan qari dan putar berkelanjutan
- **Tafsir** per ayat dan penanda **terakhir dibaca**
- Pencarian surah berdasarkan nama, arti, atau nomor (toleran ejaan, mis. "al baqarah")

### Arah Kiblat
- Kompas kiblat dengan **ikon Ka'bah**, mengikuti sensor arah ponsel
- Penanda "**Anda sudah menghadap kiblat**" (±5°), jarak ke Ka'bah, dan tips kalibrasi
- Lokasi dari kota tersimpan atau **GPS** untuk akurasi lebih tinggi

### Imsakiyah
- Jadwal sholat **satu bulan** untuk seluruh kota di Indonesia, pilihan **bulan & tahun** (2024–2040)
- **Libur nasional & cuti bersama** (data resmi SKB 3 Menteri; perkiraan untuk tahun yang belum ditetapkan)
- Kartu "Hari ini", tampilan kartu per hari di ponsel, dan **unduh PDF**

### Doa, Hadits & Asmaul Husna
- **Doa harian** dan **40 Hadits Arbain Nawawi** dengan pencarian, teks Arab, dan terjemahan
- **Asmaul Husna**: 99 nama Allah dalam slider, kategori, dan lompat ke nomor

### Pengalaman pengguna
- Responsif untuk ponsel, tablet, dan desktop
- Navigasi bawah melayang yang tersembunyi saat menggulir dan muncul kembali saat berhenti
- Dapat dipasang sebagai **PWA**

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

## Sumber Data

| Sumber | Data |
|---|---|
| [eQuran API](https://equran.id/api/v2) | Surah, ayat, audio murottal, tafsir |
| [MyQuran API](https://api.myquran.com/v2) | Jadwal sholat (perhitungan Kemenag RI), daftar kota, kalender Hijriah, doa, hadits, Asmaul Husna |
| [Nominatim OpenStreetMap](https://nominatim.openstreetmap.org) | Mencari kota dari koordinat GPS dan koordinat kota untuk arah kiblat |
| [SKB 3 Menteri](https://www.setneg.go.id) | Libur nasional & cuti bersama resmi (disimpan di `lib/holidays/official.ts`) |

## Instalasi dan Penggunaan

Prasyarat: **Node.js 20+**.

1. Clone repository:
   ```sh
   git clone https://github.com/yusezmann/quran-apps.git
   cd quran-apps
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Siapkan variabel lingkungan:
   ```sh
   cp .env.example .env
   ```
4. Jalankan aplikasi:
   ```sh
   npm run dev
   ```
5. Buka `http://localhost:3001` di browser.

### Perintah lain

| Perintah | Fungsi |
|---|---|
| `npm run build` | Build produksi (hasil statis di folder `out/`) |
| `npm run test:e2e` | Menjalankan seluruh tes Playwright (memakai Google Chrome yang terpasang) |
| `npx cap sync android` | Menyalin hasil build ke proyek Android |

## Struktur Proyek

```
app/
  page.tsx              Beranda (dasbor harian)
  (features)/
    adzan/              Penjadwal adzan, banner, pengaturan
    asmaulhusna/        Asmaul Husna
    doa/  hadits/       Doa harian & Hadits Arbain
    imsakiyah/          Jadwal bulanan, libur nasional, PDF
    kiblat/             Kompas kiblat
    prayer-times/       Jadwal sholat hari ini & pilih lokasi
    quran/              Daftar surah & pembaca Al-Qur'an
components/             Komponen bersama (navigasi, footer, ilustrasi SVG)
lib/                    Logika murni: adzan, Hijriah, libur nasional, kiblat
e2e/                    Tes Playwright
android/                Proyek Android (Capacitor)
```

## Rilis Aplikasi Android

Setiap push ke `main` menjalankan GitHub Actions yang:

1. Membangun aplikasi web dan menyinkronkannya ke proyek Android
2. Membuat **APK rilis yang ditandatangani keystore tetap**, sehingga pembaruan bisa dipasang di atas versi lama
3. Menaikkan versi otomatis (`1.1.<nomor run>`) dan mempublikasikannya ke **GitHub Releases**

Tautan [`releases/latest/download/quran-apps.apk`](https://github.com/yusezmann/quran-apps/releases/latest/download/quran-apps.apk) selalu mengarah ke APK terbaru. Keystore disimpan sebagai GitHub Secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`).

### Pemeliharaan tahunan

Saat SKB 3 Menteri tentang libur nasional tahun berikutnya terbit (biasanya sekitar September), tambahkan datanya di [`lib/holidays/official.ts`](lib/holidays/official.ts).

## Deployment Web

Versi web di-deploy ke Vercel:

```sh
vercel
```

## Kontribusi

Silakan fork repository ini dan ajukan pull request dengan fitur atau perbaikan yang diusulkan. Jalankan `npm run test:e2e` sebelum mengirim perubahan.

## Lisensi

Aplikasi ini dirilis di bawah [lisensi MIT](LICENSE) © 2025–2026 Usman.

---

Dibuat oleh [Usman](https://usman-nine.vercel.app/) · [Kunjungi aplikasi](https://quran-apps-brown.vercel.app/)
