# TASK: Rancang App Shell VANGUARD dalam Grayscale Wireframe

Ini tugas desain struktural. JANGAN menulis atau mengubah code, CSS, komponen,
atau route. JANGAN menentukan warna, gradient, shadow, radius, atau animasi.

Output hanya satu file: `docs/WIREFRAME-APP-SHELL.md`

## ATURAN BAHASA

Bahasa Indonesia untuk narasi, bahasa Inggris untuk istilah UI dan teknis.
Karakter CJK dilarang. Sebelum selesai, jalankan `./scripts/check-docs-language.sh`
dan pastikan hasilnya bersih.

## WAJIB DIBACA

1. docs/PRODUCT-DEMO-BRIEF.md
2. docs/INFORMATION-ARCHITECTURE.md
3. docs/UX-AUDIT.md termasuk bagian 11 dan 12
4. docs/_evidence/fixed-widths.txt
5. frontend/src/components/layout/AppShell.tsx
6. frontend/src/components/layout/Sidebar.tsx
7. komponen command palette yang ada sekarang

## KEPUTUSAN TERKUNCI

1. Enam primary navigation: Overview, Live, Operations, Safety, Reports, Administration.
2. Dashboard adalah landing page.
3. Vehicles dan Drivers berada di Operations. Administration hanya master data,
   devices, users, rules, integrations, preferences.
4. Administration default destination /settings/organization.
5. Geofences di Operations, geofence rules di Administration.
6. /control menjadi Administration, Commands, berbasis izin.
7. Locate melebur ke global search dan Realtime Monitor.
8. Satu Demo Workspace chip, tanpa watermark.
9. Grayscale saja pada tahap ini, tema ditentukan nanti.
10. Teks operasional minimum 14px.
11. Maksimal dua surface utama per layar.
12. Map page tanpa page padding.
13. Vehicle punya operational context dan record page yang berbeda.
14. Demo memakai dua puluh lima kendaraan.
15. Tidak ada aksi simulated dan tidak ada aksi mati.

## BAGIAN 1 SHELL ANATOMY

Definisikan region: navigation rail, secondary nav opsional, top bar, content
region, inspector region, status bar bila perlu. Untuk setiap region tulis
tanggung jawab, isi yang diizinkan, isi yang dilarang, perilaku default,
perilaku pada map page, dan perilaku pada table page. Region tanpa alasan
operasional harus dihapus.

## BAGIAN 2 NAVIGATION BEHAVIOR

Tentukan lebar rail saat collapsed dan expanded, kapan label terlihat, bentuk
submenu berupa flyout atau panel atau in-page tab, active state, perilaku
keyboard, perilaku berbasis izin, perilaku hover dan focus, serta cara pengguna
mengetahui posisinya. Seluruh submenu tidak boleh terbuka bersamaan. Berikan dua
opsi struktur lalu rekomendasikan satu dengan alasan operasional.

## BAGIAN 3 TOP BAR

Top bar hanya memuat elemen global. Tentukan isi final dari kandidat global
search, fleet data freshness, demo workspace chip, notification inbox, help, dan
user menu. Nyatakan secara eksplisit elemen yang dilarang berada di top bar,
misalnya map layer, customize column, refresh per halaman, dan filter halaman.

## BAGIAN 4 GLOBAL SEARCH

Rancang entry point, shortcut, scope All Vehicle Driver Task Location Geofence,
struktur hasil, metadata per hasil, pengelompokan, recent searches, empty state,
no result state, loading state, alur keyboard, destination tiap tipe hasil, dan
cara pencarian lokasi menampilkan kendaraan terdekat. Sertakan wireframe teks.
Search membaca seluruh dua puluh lima kendaraan.

## BAGIAN 5 DATA FRESHNESS DAN DEMO INDICATOR

Rancang indikator freshness global, format waktu, kondisi normal delayed dan
degraded, lokasi indikator, perilaku demo workspace chip, isi penjelasan ketika
chip dibuka, dan tempat tombol reset demo. Indikator tidak boleh mengganggu area
kerja.

## BAGIAN 6 INSPECTOR PATTERN

Tentukan satu pola inspector untuk seluruh produk: kapan side inspector, kapan
overlay panel, kapan full page, lebar konseptual, struktur isi berupa identity
state context actions links, perilaku saat selection berubah, cara menutup,
perilaku pada layar sempit, dan hubungan dengan URL state. Pola harus konsisten
di Tracking, Tasks, Safety, History, dan Registry.

## BAGIAN 7 CONTENT REGION MODES

Definisikan mode map-primary, table-primary, split, detail, form, dan report.
Untuk setiap mode tulis padding, header behavior, toolbar behavior, scroll
behavior, posisi inspector, dan halaman yang memakainya. Tegaskan bahwa tidak
semua halaman memakai struktur yang sama.

## BAGIAN 8 GRAYSCALE WIREFRAMES

Buat wireframe teks untuk sepuluh kondisi: shell default 1440x900, shell dengan
submenu terbuka, map-primary tanpa selection, map-primary dengan inspector,
table-primary, table-primary dengan inspector, global search terbuka,
notification inbox terbuka, shell 1366x768, dan shell tablet. Gunakan blok ASCII
dan sebutkan ukuran konseptual tiap region. Tanpa warna dan efek.

## BAGIAN 9 STATE MATRIX

Definisikan initial load, data normal, data delayed, connection degraded, demo
reset, izin terbatas, error global, empty result, dan selection kosong. Untuk
setiap state tulis perubahan pada shell dan pesan yang ditampilkan. Pesan harus
operasional dan tidak teknis.

## BAGIAN 10 SPACE BUDGET

Hitung alokasi ruang pada 1366, 1440, dan 1920 untuk rail, inspector, konten,
dan padding. Bandingkan dengan kondisi sekarang yaitu daftar 280px ditambah panel
400px. Tentukan berapa maksimal panel yang boleh terbuka bersamaan.

## BAGIAN 11 ANTI AI SLOP CHECK

Checklist: tidak ada card di dalam card, tidak ada region tanpa fungsi, tidak ada
tombol global yang seharusnya kontekstual, tidak ada label di bawah 14px untuk
informasi operasional, tidak ada icon tanpa makna, satu pola inspector, satu pola
search, satu indikator freshness, setiap region punya alasan operasional.

## BAGIAN 12 IMPLEMENTATION NOTES

Catat komponen yang perlu dibuat, komponen lama yang perlu diganti, state yang
harus global, state yang harus ada di URL, dan risiko regresi. Hanya catatan,
tanpa kode.

## OUTPUT STRUCTURE

# VANGUARD App Shell Wireframe
## 1. Shell Anatomy
## 2. Navigation Behavior
## 3. Top Bar
## 4. Global Search
## 5. Data Freshness and Demo Indicator
## 6. Inspector Pattern
## 7. Content Region Modes
## 8. Grayscale Wireframes
## 9. State Matrix
## 10. Space Budget
## 11. Anti AI Slop Check
## 12. Implementation Notes
## 13. Open Questions

## CHAT OUTPUT

Tampilkan hanya struktur navigasi yang direkomendasikan beserta alasannya, isi
final top bar, pola inspector, perbandingan space budget sebelum dan sesudah,
dan open questions.

## DEFINITION OF DONE

- [ ] Enam area navigasi punya perilaku jelas dan submenu tidak terbuka bersamaan
- [ ] Top bar hanya memuat elemen global dan punya daftar larangan eksplisit
- [ ] Global search punya scope dan destination lengkap
- [ ] Satu pola inspector berlaku untuk semua halaman
- [ ] Content region punya beberapa mode, bukan satu formula
- [ ] Ada wireframe untuk 1366, 1440, dan tablet
- [ ] Space budget membuktikan area kerja lebih luas dari kondisi sekarang
- [ ] Tidak ada kode atau CSS yang diubah
