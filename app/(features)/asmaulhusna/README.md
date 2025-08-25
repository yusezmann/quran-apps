# Fitur Asmaul Husna - Quran Apps

## Deskripsi
Fitur Asmaul Husna adalah bagian dari aplikasi Quran yang menampilkan 99 nama Allah yang Maha Indah dan Agung dengan interface yang modern dan responsif.

## Fitur Utama

### 1. Tampilan Kartu Asmaul Husna
- **Kartu Utama**: Menampilkan tulisan Arab dengan styling yang menarik
- **Nama Latin**: Nama Asmaul Husna dalam bahasa Latin
- **Arti Bahasa Indonesia**: Penjelasan makna setiap nama
- **Progress Indicator**: Bar progress yang menunjukkan posisi dalam 99 nama

### 2. Navigasi
- **Swiper Navigation**: Navigasi slide dengan gesture touch/swipe
- **Navigation Dots**: Indikator posisi dengan dot navigation
- **Quick Navigation**: Navigasi cepat ke kategori tertentu
- **Progress Bar**: Bar progress di bagian atas halaman

### 3. Fitur Tambahan
- **Reading Stats**: Statistik membaca (waktu, progress, estimasi selesai)
- **Info Section**: Informasi tentang Asmaul Husna yang dapat di-expand
- **Responsive Design**: Tampilan yang optimal di berbagai ukuran layar

## Komponen

### AsmaulHusnaCard
Komponen utama untuk menampilkan kartu Asmaul Husna dengan:
- Tulisan Arab yang besar dan jelas
- Efek visual yang menarik
- Progress indicator per kartu

### NavigationDots
Navigasi dengan dot yang menunjukkan posisi saat ini dalam 99 nama.

### ProgressBar
Progress bar di bagian atas halaman yang menunjukkan kemajuan membaca.

### QuickNavigation
Navigasi cepat dengan:
- Kategori Asmaul Husna
- Search functionality
- Lompat ke nomor tertentu

### ReadingStats
Statistik membaca yang menampilkan:
- Progress percentage
- Posisi saat ini
- Waktu yang telah dibaca
- Estimasi waktu selesai
- Teks motivasi

### AsmaulHusnaInfo
Informasi tentang Asmaul Husna dengan:
- Keutamaan membaca
- Waktu terbaik
- Cara membaca
- Penjelasan lengkap

## Styling

### CSS Features
- **Glassmorphism**: Efek kaca dengan backdrop blur
- **Gradient**: Warna gradient yang menarik
- **Animations**: Transisi dan animasi yang halus
- **Responsive**: Mobile-first design approach

### Color Scheme
- **Primary**: Green (#10b981)
- **Secondary**: Blue (#3b82f6)
- **Accent**: Purple (#8b5cf6)
- **Background**: Dark dengan overlay

## Responsivitas

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Adaptasi
- Ukuran font yang responsif
- Layout yang menyesuaikan layar
- Touch-friendly navigation

## Teknologi

### Dependencies
- **Next.js 14**: Framework React
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS
- **Ant Design**: UI components
- **Swiper**: Touch slider
- **Zustand**: State management

### Performance
- Lazy loading untuk komponen
- Optimized animations
- Efficient state management

## Cara Penggunaan

1. **Navigasi Slide**: Gunakan tombol navigasi atau swipe gesture
2. **Quick Navigation**: Klik tombol "Buka Navigasi Cepat" untuk akses cepat
3. **Info**: Klik judul "Tentang Asmaul Husna" untuk melihat informasi detail
4. **Progress Tracking**: Lihat progress bar dan statistik membaca

## Fitur Masa Depan

- [ ] Audio pronunciation untuk setiap nama
- [ ] Bookmark favorite names
- [ ] Share functionality
- [ ] Offline support
- [ ] Dark/Light theme toggle
- [ ] Multi-language support

## Contributing

Untuk berkontribusi pada fitur ini:
1. Fork repository
2. Buat branch untuk fitur baru
3. Commit perubahan
4. Push ke branch
5. Buat Pull Request

## License

Fitur ini merupakan bagian dari Quran Apps yang open source.
