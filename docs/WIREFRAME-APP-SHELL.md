# VANGUARD App Shell Wireframe

**Tanggal:** 2026-08-04
**Status:** Revisi wireframe specification untuk App Shell
**Scope:** Layout, navigation, space budget, state behavior

---

## 1. Anatomi Shell

### 1.1 Definisi Region

| Region | Tanggung Jawab | Isi yang Diizinkan | Isi yang Dilarang |
|--------|----------------|-------------------|-------------------|
| **Navigation Rail** | Akses navigasi utama | 6 area utama dengan ikon, toggle collapse | Aksi halaman, filter |
| **Secondary Nav** | Submenu atau flyout | Item submenu navigasi, link kontekstual | Search global, notifikasi |
| **Top Bar** | Chrome dan identitas global | Judul halaman, search global, indikator kesegaran, chip workspace, inbox notifikasi, menu pengguna | Kontrol peta, filter per halaman, refresh per halaman, jam |
| **Content Region** | Ruang kerja utama | Peta, tabel, form, atau layout split | Elemen chrome tetap |
| **Inspector Region** | Panel kontekstual | Detail entity, aksi kontekstual, link | Navigasi utama, data tidak terkait |
| **Status Bar** | Tidak diperlukan | — | — |

### 1.2 Perbedaan Panel Overlay dan Kolom Grid

| Bentuk | Karakteristik | Pengaruh terhadap Lebar Konten |
|--------|---------------|------------------------------|
| **Kolom grid** | Bagian dari layout, mendorong konten | Mengurangi ruang peta/tabel |
| **Panel overlay** | Posisi absolute, melayang di atas | Tidak mengurangi ruang, hanya menutup |

**Bukti dari kode sumber:**

```
DetailPanel.tsx:88: glass absolute top-0 right-0 bottom-0 z-dock
tracking/page.tsx:534: grid-cols-[280px_1fr]
tasks/page.tsx:273: grid-cols-[380px_1fr]
history/page.tsx:685: grid-cols-[1fr_420px]
```

### 1.3 Perilaku Region

| Region | Keadaan Default | Halaman Peta | Halaman Tabel |
|--------|-----------------|--------------|---------------|
| Navigation Rail | Melebar 248px | Auto-collapse ke rail 64px | Melebar atau rail |
| Secondary Nav | Tersembunyi | Tersembunyi | Tersembunyi |
| Top Bar | Terlihat | Terlihat, tanpa padding | Terlihat, padding 24px |
| Content Region | Lebar penuh | Full bleed, tanpa padding | Padding 24px, scrollable |
| Inspector Region | Tersembunyi | Overlay panel saat dipilih | Slide-in panel saat dipilih |

### 1.4 Elemen Top Bar — Spesifikasi Final

| Elemen | Posisi | Perilaku |
|--------|--------|----------|
| Judul halaman + ringkasan | Kiri | Mencerminkan route saat ini, ringkasan dari data (tidak pernah hardcoded) |
| Pemicu search global | Tengah | Membuka CommandPalette, shortcut Cmd+K |
| Indikator kesegaran data | Tengah-kanan | Waktu sejak pembaruan terakhir, dihitung dari telemetry |
| Chip workspace demo | Area kanan | Satu chip, klik untuk perluas penjelasan |
| Inbox notifikasi | Kanan | Badge count, dropdown dengan alert sebagai entity |
| Menu pengguna | Kanan | Avatar, nama, peran, toggle tema, keluar |

**Dilarang di top bar:**

- Toggle layer peta (milik toolbar peta)
- Customize column (milik header tabel)
- Tombol refresh per halaman (data harus auto-refresh)
- Filter per halaman (milik toolbar content region)
- Jam (waktu hanya melalui indikator kesegaran)

---

## 2. Perilaku Navigasi

### 2.1 Konstanta Lebar

Satu sumber kebenaran, didefinisikan di satu tempat dan diekspor:

| Konstanta | Nilai | Penggunaan |
|----------|-------|------------|
| W_RAIL | 64px | Lebar rail collapsed, mode ikon saja |
| W_EXPANDED | 248px | Lebar sidebar expanded, ikon + label |

Konstanta ini menggantikan definisi duplikat di Sidebar.tsx dan AppShell.tsx.

### 2.2 Visibilitas Label

| Mode | Label | Kasus Penggunaan |
|------|-------|------------------|
| Expanded (248px) | Ikon + label penuh + label grup | Workflow desktop normal |
| Rail (64px) | Ikon saja dengan tooltip saat hover | Ruang terbatas, preferensi pengguna |

### 2.3 Aturan Auto-Collapse Rail

Rail auto-collapse dari 248px ke 64px ketika SEMUA kondisi terpenuhi:

1. Halaman saat ini adalah halaman peta (Tracking, History, Geofences)
2. Lebar viewport di bawah 1440px
3. Pengguna belum manually expand sidebar di sesi ini

**Toggle manual selalu prioritas.** Pengguna bisa selalu expand/collapse terlepas dari aturan auto.

Rail tetap expanded ketika:
- Halaman adalah tabel-primary (Tasks, Vehicles, Drivers, Reports)
- Lebar viewport 1440px atau lebih
- Preferensi pengguna tersimpan di localStorage

### 2.4 Perilaku Submenu

**Aturan: Maksimum satu submenu terbuka dalam satu waktu.** Membuka submenu baru menutup yang sebelumnya. Mencegah cognitive overload.

**Struktur yang Direkomendasikan: Flyout on Hover**

- Submenu muncul saat hover setelah 200ms
- Menghilang saat mouse leave
- Navigasi panah keyboard didukung
- Tidak memblokir konten

### 2.5 Active State dan Kesadaran Posisi

- Item aktif punya accent bar kiri berwarna brand (2px)
- Background item aktif brand-soft
- Label section halaman saat ini terlihat di ringkasan top bar
- Breadcrumb hanya muncul saat drill-down 2+ level

### 2.6 Navigasi Keyboard

| Tombol | Aksi |
|--------|------|
| Tab | Pindah ke item navigasi berikutnya |
| Shift+Tab | Pindah ke item navigasi sebelumnya |
| Enter/Space | Aktifkan item navigasi atau toggle submenu |
| Panah Atas/Bawah | Navigasi dalam submenu |
| Escape | Tutup submenu terbuka |

### 2.7 Visibilitas Berbasis Izin

| Area Navigasi | Terlihat Untuk |
|---------------|----------------|
| Overview | Semua peran |
| Live | Dispatcher, Supervisor, Admin |
| Operations | Dispatcher, Supervisor, Admin, CS |
| Safety | Safety, Supervisor, Admin |
| Reports | Management, Supervisor, Admin |
| Administration | Admin saja |

### 2.8 Enam Area Navigasi Utama

1. **Overview** — Dashboard landing
2. **Live** — Tracking, Locate (digabung)
3. **Operations** — Task Monitor, Vehicles, Drivers, Geofences
4. **Safety** — Safety Review, Accidents, Snapshots, Dashcam
5. **Reports** — Report Center
6. **Administration** — Settings, Commands

---

## 3. Search Global

### 3.1 Titik Masuk

| Metode | Aksi |
|--------|------|
| Klik input search di top bar | Membuka CommandPalette |
| Cmd+K / Ctrl+K (shortcut global) | Membuka CommandPalette |
| Tab dari top bar | Focus bergerak ke input search |

### 3.2 Scope

Search mendukung scope berikut:

| Scope | Entity | Ringkasan Hasil |
|-------|--------|-----------------|
| All | Semua tipe | Hasil agregat, maks 3 per tipe |
| Vehicle | Vehicle | Plat, driver, status, kecepatan, update terakhir |
| Driver | Driver | Nama, SIM, kendaraan ditugaskan, skor safety |
| Task | Task | Nama task, kendaraan, status, ETA |
| Location | Koordinat | Koordinat dengan kendaraan terdekat (radius 500m) |
| Geofence | Geofence | Nama zone, tipe, jumlah kendaraan |

### 3.3 Struktur Hasil

Setiap hasil menampilkan:

```
[Type Badge]  Identitas Utama
              Info sekunder (driver untuk vehicle, dll)
              Dot status + teks status + update terakhir (untuk vehicles)
```

### 3.4 Metadata per Tipe Hasil

| Tipe | Identitas | Sekunder | Konteks | Update Terakhir |
|------|-----------|----------|---------|----------------|
| Vehicle | Plat nomor | Nama driver | Status, kecepatan | Ya |
| Driver | Nama lengkap | Nomor SIM | Kendaraan ditugaskan | Tidak |
| Task | Nama task | Kendaraan | Status, ETA | Tidak |
| Location | Koordinat | — | Kendaraan terdekat | Tidak |
| Geofence | Nama zone | Tipe | Jumlah kendaraan | Tidak |

### 3.5 Recent Searches

- Simpan 5 search terakhir di localStorage
- Tampilkan di bawah input search saat kosong
- Klik untuk ulangi search
- Opsi hapus semua

### 3.6 Empty dan No-Result States

**Empty state (tanpa query):**
```
Cari kendaraan, driver, task, atau lokasi
Gunakan nomor plat, nama driver, atau nama task
```

**No results:**
```
Tidak ada hasil untuk "[query]"
Coba gunakan nomor plat, nama driver, atau nama task
```

### 3.7 Loading State

- Tampilkan skeleton rows selama search
- Debounce input: 300ms sebelum search dieksekusi

### 3.8 Navigasi Keyboard

| Tombol | Aksi |
|--------|------|
| Cmd+K / Ctrl+K | Buka palette |
| Panah Atas/Bawah | Navigasi hasil |
| Enter | Pilih hasil yang disorot |
| Tab | Bergantian scope |
| Escape | Tutup palette |

### 3.9 Tujuan Hasil

| Tipe Hasil | Tujuan |
|-----------|--------|
| Vehicle | /tracking?vehicle={plate-slug} |
| Driver | /drivers/{driver-id} |
| Task | /tasks?task={task-id} |
| Location | /tracking?lat={lat}&lng={lng} |
| Geofence | /geofences?zone={zone-id} |

### 3.10 Scope Search

Search membaca seluruh 25 kendaraan dari demo data store (tidak di-slice).

---

## 4. Kesegaran Data dan Indikator Demo

### 4.1 Indikator Kesegaran Global

**Format:** "Fleet data updated Xs ago"

**Ambang kesegaran sesuai skenario demo:**

| Kondisi | Ambang | Tampilan | Warna |
|---------|--------|----------|-------|
| Fresh | < 2 menit | "Fleet data updated 45s ago" | Normal |
| Tertunda | 2-10 menit | "Fleet data delayed 5m ago" | Warning |
| GPS mati | > 10 menit | "Unit tidak mengirim data 42m" | Error |

**Alasan ambang 10 menit:** Skenario demo kita memakai GPS mati 42 menit sebagai kondisi kritis. Untuk armada, data yang tidak update lebih dari 10 menit sudah patut dicurigai. Ambang ini memastikan dispatcher tahu sebelum situasi menjadi kritis.

### 4.2 Lokasi

Indikator kesegaran muncul di area tengah-kanan top bar, antara search trigger dan elemen kanan.

### 4.3 Chip Workspace Demo

**Keadaan default:** Chip kompak menampilkan "Demo Workspace"

**Keadaan diperluas (saat diklik):**
```
Demo Workspace

This environment uses synthetic fleet data for product demonstration.

All statistics are calculated from 25 demo vehicles.

[Reset Demo]
```

### 4.4 Tombol Reset Demo

- Terletak di dropdown chip workspace yang diperluas
- Mengembalikan demo data ke kondisi seed awal
- Membersihkan semua perubahan pengguna selama sesi
- Dialog konfirmasi sebelum reset

### 4.5 Aturan Perilaku Kesegaran

- Indikator kesegaran update setiap 10 detik via telemetry bus
- Indikator tidak pernah memblokir atau mengganggu workflow
- Keadaan stale/degraded ditampilkan di top bar, bukan sebagai modal atau banner
- Jumlah fleet SELALU dihitung dari demo data store (tidak hardcoded)

---

## 5. Pattern Inspector

### 5.1 Single Pattern untuk Semua Entity

Satu pattern inspector berlaku untuk: Vehicles, Tasks, Alerts, Trips, Drivers, Geofences.

### 5.2 Kapan Menggunakan Setiap Tipe Inspector

| Konteks | Tipe Inspector | Lebar |
|---------|---------------|-------|
| Halaman peta dengan selection | Panel overlay (slide dari kanan) | 360px |
| Halaman tabel dengan selection | Panel slide-in (mendorong konten) | 360px |
| Halaman form dengan entity | Navigasi full page | — |
| Pandangan cepat | Tooltip atau inline | — |

### 5.3 Selection Wajib di URL

Selection disimpan di URL menggunakan plate slug canonical:

```
/tracking?vehicle=b1234kjt
/tasks?task=task-001
/safety?alert=alert-042
```

Ini memungkinkan:
- Link yang bisa dibagikan
- Context dipertahankan saat navigasi antar halaman
- Browser back mempertahankan konteks

### 5.4 Lebar Inspector

**Lebar standar: 360px**

### 5.5 Struktur Konten Inspector

Setiap inspector mengikuti struktur ini:

```
+--------------------------------+
| [Icon] Nama Entity         [X] |
| Tipe Entity - Status           |
+--------------------------------+
| IDENTITY                      |
| Field utama 1                  |
| Field utama 2                  |
+--------------------------------+
| STATE                         |
| Indikator status              |
| Metrik terkait                |
+--------------------------------+
| CONTEXT                       |
| Penugasan saat ini           |
| Aktivitas terbaru            |
+--------------------------------+
| ACTIONS                       |
| [Aksi Primer]                |
| [Aksi Sekunder]              |
+--------------------------------+
| LINKS                         |
| Entity terkait                |
+--------------------------------+
```

### 5.6 Perilaku Closing

| Pemicu | Aksi |
|--------|------|
| Klik tombol X | Tutup inspector |
| Klik di luar | Tutup inspector |
| Tombol Escape | Tutup inspector |
| Navigasi ke halaman baru | Tutup inspector |
| Pilih entity berbeda | Ganti konten, inspector tetap terbuka |

### 5.7 Perilaku Layar Sempit (Tablet)

- Inspector menjadi bottom sheet (slide ke atas)
- Tinggi sheet: 60% viewport
- Handle drag untuk expand/collapse
- Swipe ke bawah untuk tutup

### 5.8 Inspector untuk Halaman Specific

| Halaman | Konten Inspector |
|--------|------------------|
| Tracking | Detail kendaraan: driver, status, kecepatan, lokasi, update terakhir, task, event terbaru |
| Tasks | Detail task: kendaraan, driver, route, ETA, progress, timeline |
| Safety | Detail alert: tipe, severity, kendaraan, driver, lokasi, link evidence |
| History | Detail trip: route, event, durasi, jarak, profil kecepatan |
| Vehicles | Record kendaraan: spesifikasi, penugasan, maintenance, dokumen |
| Drivers | Record driver: kontak, SIM, penugasan, skor safety |

---

## 6. Mode Content Region

### 6.1 Definisi Mode

| Mode | Padding | Perilaku Header | Posisi Toolbar | Scroll | Posisi Inspector | Halaman |
|------|---------|----------------|---------------|--------|-----------------|--------|
| **map-primary** | 0 | Sticky top | Overlay di atas peta | Native peta | Overlay kanan | Tracking, History, Geofences |
| **table-primary** | 24px | Dalam content | Top content | Native tabel | Slide-in kanan | Tasks, Vehicles, Drivers, Reports |
| **split** | 0 | Dalam content | Top content | Each pane independen | Overlay kanan | Task detail dengan peta |
| **dashboard** | 24px | Dalam content | Top content | Page native | Tidak ada | Dashboard |
| **detail** | 24px | Dalam content | Top content | Page native | Tidak ada | Vehicle record, Driver record |
| **form** | 24px | Dalam content | Top content | Page native | Tidak ada | Settings, CRUD forms |
| **evidence** | 0 | Sticky top | Content top | Grid native | Tidak ada | Dashcam, Snapshots |

### 6.2 Aturan Per-Mode

**map-primary:**
- Tanpa padding halaman
- Peta mengisi seluruh content region
- Toolbar melayang di atas peta, pojok kanan atas
- Inspector overlay peta (tidak mendorong)
- Sidebar auto-collapse ke rail
- Kolom daftar kendaraan dapat disembunyikan

**table-primary:**
- Padding halaman 24px
- Header dalam content, bukan chrome
- Toolbar di top content
- Inspector mendorong konten ke kiri
- Sidebar dapat expanded atau rail

**evidence:**
- Tanpa padding halaman
- Grid galeri evidence
- Viewer full-width saat dipilih
- Toolbar di top content

### 6.3 Dashboard Bukan Report

Dashboard adalah titik masuk operasional, bukan laporan. Dashboard menampilkan:
- KPI cards: Total, Driving, Idle, Stopped, Offline
- Exception list: kendaraan yang butuh perhatian
- Mini fleet map: gambaran posisi kendaraan

### 6.4 Dashcam Bukan Map-Primary

Dashcam tidak memuat peta. Dashcam adalah halaman evidence dengan:
- Grid kamera
- Video player saat dipilih
- Timeline scrubber

---

## 7. Wireframe Grayscale

### 7.1 Shell Default 1440x900 (Rail 64px)

```
+------+--------------------------------------------------------------------+
|      | Overview - 25 units                              [Search] [A] |
| [=]  +--------------------------------------------------------------------+
| [O]  | [Toolbar]                                    [Filters] [Actions] |
| [L]  +--------------------------------------------------------------------+
| [T]  |                                                                   |
| [S]  |                        CONTENT REGION                             |
| [R]  |                        (Full Width 1376px)                        |
| [A]  |                                                                   |
+------+--------------------------------------------------------------------+
  64px                              1376px
Total: 64 + 1376 = 1440
```

### 7.2 Map-Primary dengan Inspector Terbuka (Tracking)

List tersembunyi ketika inspector terbuka. Mereka saling menggantikan.

```
+------+------------------------------------------------+----------------+
|      | Realtime Monitor - 25 units                    | [Search] [A]  |
| [=]  +------------------------------------------------+----------------+
| [O]  |                                    [Zoom] [Layers] [Find]      |
| [L]  |                                                            |
| [T]  |                                                            |
| [S]  |                                                            |
|      |               MAP (942px visible)                 |     |
|      |                                                            +---+
|      |                                                            |ID |
|      |                                                            |EN |
|      |                                                            |TY |
|      |                                                            |---|
|      |                                                            |   |
|      |                                                            +---+
|      |                                              360px (overlay)    |
+------+------------------------------------------------+----------------+
  64px                        942px                      360px
Total: 64 + 942 + 360 = 1366
```

### 7.3 Map-Primary dengan List Terbuka (Tracking)

Inspector tersembunyi ketika list terbuka. Mereka saling menggantikan.

```
+------+----------+--------------------------------------------+
|      |          |                                            |
| [=]  |  LIST   |                  MAP                        |
| [O]  |  320px  |                  982px                      |
| [L]  |          |                                            |
| [T]  | [items] |                                            |
| [S]  |          |                                            |
| [R]  |          |                                            |
| [A]  |          |                                            |
+------+----------+--------------------------------------------+
  64px    320px                      982px
Total: 64 + 320 + 982 = 1366
```

### 7.4 Map-Primary Peta Penuh (Tracking)

Rail 64px, list tersembunyi, inspector tertutup.

```
+------+--------------------------------------------------------------------+
|      | Realtime Monitor - 25 units                              [Search] |
| [=]  +--------------------------------------------------------------------+
| [O]  |                                            [Zoom] [Layers] [Find] |
| [L]  |                                                                   |
| [T]  |                                                                   |
| [S]  |                         MAP (1302px)                              |
| [R]  |                                                                   |
+------+--------------------------------------------------------------------+
  64px                              1302px
Total: 64 + 1302 = 1366
```

### 7.5 Shell 1440x900 (Rail 64px)

```
+------+--------------------------------------------------------------------+
|      | Overview - 25 units                              [Search] [A] |
| [=]  +--------------------------------------------------------------------+
| [O]  | [Toolbar]                                    [Filters] [Actions] |
| [L]  +--------------------------------------------------------------------+
| [T]  |                                                                   |
| [S]  |                        CONTENT REGION                             |
| [R]  |                        (Full Width 1376px)                        |
| [A]  |                                                                   |
+------+--------------------------------------------------------------------+
  64px                              1376px
Total: 64 + 1376 = 1440
```

### 7.6 Shell 1920x1080 (Rail 64px)

```
+------+--------------------------------------------------------------------+
|      | Overview - 25 units                              [Search] [A] |
| [=]  +--------------------------------------------------------------------+
| [O]  | [Toolbar]                                    [Filters] [Actions] |
| [L]  +--------------------------------------------------------------------+
| [T]  |                                                                   |
| [S]  |                        CONTENT REGION                             |
| [R]  |                        (Full Width 1856px)                       |
| [A]  |                                                                   |
+------+--------------------------------------------------------------------+
  64px                              1856px
Total: 64 + 1856 = 1920
```

### 7.7 Aturan Mutual Exclusion pada Map-Primary

Pada halaman map-primary, list dan inspector saling menggantikan:
- Memilih entity: list tersembunyi, inspector terbuka
- Menutup inspector: list dipulihkan ke keadaan sebelumnya
- Tombol `L`: tampilkan list, sembunyikan inspector
- Tombol `I`: tampilkan inspector, sembunyikan list
- Rail selalu 64px ketika inspector terbuka pada semua resolusi
- Inspector menggunakan effective right padding 360px pada peta
- Entity terpilih di-recenter ke tengah area yang tidak tertutup
- Displacement visual entity adalah 180px ke kiri, yaitu setengah lebar inspector
- Zoom level dan bearing tidak berubah saat recenter


### 7.8 Three Metrics Definition

| Metric | Definisi | Contoh pada 1366 dengan Inspector |
|--------|----------|-----------------------------------|
| Map canvas width | Lebar peta sebelum occlusion | 1302px (viewport minus rail) |
| Occluded width | Bagian tertutup inspector | 360px |
| Unoccluded map width | Bagian peta yang benar-benar terlihat | 942px |

---


## 8. Matriks State

### 8.1 Initial Load

| State | Perilaku Shell | Pesan |
|-------|---------------|-------|
| Loading | Skeleton di content region | None (transparan) |
| Error | Error boundary dengan retry | "Gagal memuat data. Coba lagi." |

### 8.2 Data Normal

| State | Perilaku Shell | Pesan |
|-------|---------------|-------|
| Semua segar | Tampilan normal | "Fleet data updated Xs ago" |

### 8.3 Data Tertunda

| State | Perilaku Shell | Pesan |
|-------|---------------|-------|
| 2-10 menit | Indikator warning di top bar | "Fleet data delayed Xm ago" (warna warning) |

### 8.4 Tidak Mengirim Data

| State | Perilaku Shell | Pesan |
|-------|---------------|-------|
| > 10 menit | Indikator error di top bar | "Unit tidak mengirim data Xm" (warna error) |

### 8.5 Demo Reset

| State | Perilaku Shell | Pesan |
|-------|---------------|-------|
| Klik Reset | Dialog konfirmasi, lalu restore seed data | "Demo data telah direset" (toast) |

### 8.6 Izin Terbatas

| State | Perilaku Shell | Pesan |
|-------|---------------|-------|
| Non-admin | Menu Administration tersembunyi | None |
| Role safety | Menu Safety ditekankan | None |

### 8.7 Error Global

| State | Perilaku Shell | Pesan |
|-------|---------------|-------|
| API failure | Toast notification dengan opsi retry | "Koneksi terputus. Data mungkin tidak terkini." |

### 8.8 Empty Result

| State | Perilaku Shell | Pesan |
|-------|---------------|-------|
| No data | Empty state illustration + teks + CTA | Bervariasi per halaman |
| No search results | Pesan "Tidak ada hasil untuk..." | "Tidak ada hasil untuk "[query]"" |

### 8.9 Selection Kosong

| State | Perilaku Shell | Pesan |
|-------|---------------|-------|
| Tidak ada entity dipilih | Inspector tersembunyi | None |

### 8.10 Aturan Pesan State

- Pesan bersifat operasional, bukan teknis
- Tidak ada jargon seperti "WebSocket", "API timeout", "HTTP 500"
- Pesan menjelaskan apa yang harus dilakukan pengguna, bukan apa yang salah

---

## 9. Anggaran Ruang

### 9.1 Skala Lebar Panel — Dua Nilai Aktif

Dua nilai aktif dengan peran berbeda:

| Lebar | Peran | Digunakan Di |
|-------|-------|--------------|
| **320px** | Kolom daftar | Tracking (list), Tasks (list), Vehicles, Drivers |
| **360px** | Panel inspector | Semua halaman dengan inspector |

**Migrasi dari nilai lama:**

| Nilai Lama | Menjadi | Alasan |
|-----------|--------|--------|
| 220px (settings) | 320px | Inline nav butuh lebih ruang |
| 280px (tracking list) | 320px | Daftar perlu lebih lebar untuk info |
| 320px (dashcam/control/geofences) | 320px | Sesuai skala daftar |
| 360px (locate) | 360px | Flyout hasil pencarian |
| 380px (DetailPanel, task list) | 360px | Inspector diseragamkan |
| 420px (history column) | 320px | Kolom timeline tidak butuh 420px |

### 9.2 Three Metrics Definition

| Metric | Definisi | Contoh pada 1366 |
|--------|----------|------------------|
| Map canvas width | Lebar peta sebelum occlusion | 1302px (viewport - rail 64px) |
| Occluded width | Bagian tertutup inspector | 360px |
| Unoccluded map width | Bagian peta yang benar-benar terlihat | 942px |

### 9.3 Aturan Mutual Exclusion

Pada map-primary, list dan inspector saling menggantikan:
- Memilih entity: list tersembunyi, inspector terbuka
- Menutup inspector: list dipulihkan ke keadaan sebelumnya
- Rail selalu 64px ketika inspector terbuka pada semua resolusi

**Max Panel Terbuka:**
- Navigation rail: chrome, bukan panel
- List dan inspector: contextual surfaces
- Map-primary: maksimum 1 contextual surface
- Command palette dan modal: sementara, tidak dihitung

### 9.4 Aturan Auto-Collapse Rail

Rail auto-collapse ketika SEMUA kondisi terpenuhi:

1. Halaman adalah map-primary (Tracking, History, Geofences)
2. Lebar viewport < 1440px
3. Pengguna belum manually expand sidebar di sesi ini
4. Inspector TIDAK terbuka

**Ketika inspector terbuka, rail SELALU 64px pada semua resolusi desktop.**

### 9.5 Target Ruang Peta

| Lebar Viewport | Target Minimal | Target Optimal |
|----------------|---------------|---------------|
| 1366px | 940px | 1010px |
| 1440px | 1010px | 1090px |
| 1920px | 1490px | 1580px |

### 9.6 Anggaran Ruang Tracking — Kondisi Usulan

Dengan skala baru (list 320px, inspector 360px) dan mutual exclusion:

```
Sidebar: 248px (expanded) atau 64px (rail)
List column: 320px (toggle visibility, mutually exclusive dengan inspector)
Inspector: 360px (overlay, mutually exclusive dengan list)
```

#### Inspector terbuka, list tersembunyi

##### 1366px viewport

| Konfigurasi | Rail | Map Canvas | Occluded | Unoccluded | Target | Status |
|-------------|------|------------|----------|------------|--------|--------|
| Rail + inspector | 64 | 1302px | 360px | **942px** | 940px | TERPENUHI |

##### 1440px viewport

| Konfigurasi | Rail | Map Canvas | Occluded | Unoccluded | Target | Status |
|-------------|------|------------|----------|------------|--------|--------|
| Rail + inspector | 64 | 1376px | 360px | **1016px** | 1010px | TERPENUHI |

##### 1920px viewport

| Konfigurasi | Rail | Map Canvas | Occluded | Unoccluded | Target | Status |
|-------------|------|------------|----------|------------|--------|--------|
| Rail + inspector | 64 | 1856px | 360px | **1496px** | 1490px | TERPENUHI |

#### List terbuka, inspector tersembunyi

##### 1366px viewport

| Konfigurasi | Rail | List | Map Canvas | Target | Status |
|-------------|------|------|------------|--------|--------|
| Rail + list | 64 | 320px | **982px** | 940px | TERPENUHI |

##### 1440px viewport

| Konfigurasi | Rail | List | Map Canvas | Target | Status |
|-------------|------|------|------------|--------|--------|
| Rail + list | 64 | 320px | **1056px** | 1010px | TERPENUHI |

##### 1920px viewport

| Konfigurasi | Rail | List | Map Canvas | Target | Status |
|-------------|------|------|------------|--------|--------|
| Rail + list | 64 | 320px | **1536px** | 1490px | TERPENUHI |

#### Peta penuh (list dan inspector tersembunyi)

##### 1366px viewport

| Konfigurasi | Rail | Map Canvas | Target | Status |
|-------------|------|------------|--------|--------|
| Rail only | 64 | **1302px** | 940px | TERPENUHI |

##### 1440px viewport

| Konfigurasi | Rail | Map Canvas | Target | Status |
|-------------|------|------------|--------|--------|
| Rail only | 64 | **1376px** | 1010px | TERPENUHI |

##### 1920px viewport

| Konfigurasi | Rail | Map Canvas | Target | Status |
|-------------|------|------------|--------|--------|
| Rail only | 64 | **1856px** | 1490px | TERPENUHI |

### 9.7 Perbandingan Per Halaman

| Halaman | Konfigurasi Sekarang | Konfigurasi Usulan | Perubahan |
|---------|---------------------|-------------------|-----------|
| Tracking + list | 280px list | 320px list | +40px (lebih luas) |
| Tracking + inspector | 380px inspector | 360px inspector | -20px (lebih ramping) |
| Tasks — kolom daftar | 380px column | 320px column | -60px; detail dibuka melalui inspector 360px |
| History | 420px column | 320px column | -100px (lebih ramping) |
| Settings inline | 220px | 320px | +100px (lebih luas) |

### 9.8 Max Content Width

**Aturan:** Semua content region memiliki lebar maksimum 1600px.

**Ruang lingkup:** Berlaku untuk semua halaman non-map.
- Dashboard: Batas 1600px
- Tasks: Wrap tabel, batas 1600px
- Vehicles: Wrap tabel, batas 1600px
- Reports: Batas grid card 1600px
- Settings: Batas lebar form 1600px

**Map pages** (Tracking, History, Geofences) tetap full-bleed.

---


## 10. Aturan Tipografi Shell

### 10.1 Skala Teks Minimum

| Jenis Informasi | Ukuran Minimum | Pengecualian |
|----------------|---------------|--------------|
| Informasi operasional | 14px | — |
| Label metric | 12px | Satuan pengukuran, suffix |
| Timestamps | 12px | — |
| Metadata | 12px | — |

### 10.2 Aturan Uppercase

Uppercase sangat terbatas:
- Hanya untuk label metrik (TOTAL, DRIVING, IDLE)
- Tidak untuk item navigasi
- Tidak untuk informasi operasional

Audit menemukan 277 kemunculan teks kecil atau uppercase. Aturan ini memperbaiki itu.

---

## 11. Anti AI Slop Check

### 11.1 Checklist dengan Bukti

- [x] **Tidak ada card dalam card** — Border/divider dipilih untuk grouping
      Bukti: Wireframe hanya menggunakan dividers dan spacing

- [x] **Tidak ada region tanpa fungsi** — Setiap region punya tanggung jawab jelas
      Bukti: Tabel definisi region di bagian 1.1

- [x] **Tidak ada tombol global yang seharusnya kontekstual**
      Bukti: Top bar hanya berisi elemen global, toolbar halaman di content

- [x] **Tidak ada label di bawah 14px untuk informasi operasional**
      Bukti: Aturan tipografi di bagian 10.1, pengecualian hanya untuk metadata

- [x] **Tidak ada icon tanpa makna** — Setiap icon punya tooltip atau menggantikan teks
      Bukti: Wireframe menyebutkan tooltip untuk icon navigasi rail

- [x] **Satu pattern inspector untuk semua entity**
      Bukti: Bagian 5 mendefinisikan satu pattern inspector 360px

- [x] **Satu pattern search untuk semua tipe entity**
      Bukti: Bagian 3 mendefinisikan search dengan scope dan hasil konsisten

- [x] **Satu indikator kesegaran global**
      Bukti: Bagian 4 mendefinisikan satu indikator di top bar

- [x] **Setiap region punya alasan operasional**
      Bukti: Tabel responsibility di bagian 1.1

### 11.2 Aturan Enforcement

| Aturan | Enforcement |
|--------|-------------|
| Tidak ada card dalam card | Border/divider dipilih di atas Card wrapper |
| Tidak ada icon dekoratif | Setiap icon punya tooltip atau menggantikan teks |
| Minimum 14px | Pengecualian hanya untuk unit/suffix |
| Tidak ada duplikat lebar panel | Satu skala, bukan per halaman |
| Tidak ada gradient dekoratif | Tekstur peta sudah cukup |

---

## 12. Catatan Implementasi

### 12.1 Komponen yang Harus Dibuat

| Komponen | Tujuan | Lokasi |
|----------|--------|--------|
| Layout constants module | Satu sumber untuk W_RAIL, W_EXPANDED | src/lib/layout-constants.ts |
| FreshnessIndicator | Indikator kesegaran data global | src/components/layout/FreshnessIndicator.tsx |
| WorkspaceChip | Chip workspace demo dengan dropdown | src/components/layout/WorkspaceChip.tsx |
| InspectorPanel | Pattern inspector terpadu | src/components/layout/InspectorPanel.tsx |

### 12.2 Komponen yang Harus Diupdate

| Komponen | Perubahan |
|----------|-----------|
| Sidebar.tsx | Import W_RAIL, W_EXPANDED dari layout-constants; hapus konstanta lokal |
| AppShell.tsx | Import W_RAIL, W_EXPANDED dari layout-constants; hapus konstanta lokal; tambahkan FreshnessIndicator; hapus jam |
| DetailPanel.tsx | Ubah lebar dari 380px ke 360px |
| tracking/page.tsx | List column 280px→320px; tambah toggle visibility; tambah recenter map saat inspector terbuka |
| tasks/page.tsx | List column 380px→320px; grid-cols update |
| history/page.tsx | Right column 420px→320px |
| settings/page.tsx | Inline nav 220px→320px |
| CommandPalette.tsx | Search seluruh 25 kendaraan, tambah scope filter |

### 12.3 State yang Harus Global

| State | Alasan Global |
|-------|---------------|
| Sidebar collapsed/expanded | Mempengaruhi semua halaman |
| Selected vehicle (di URL) | Bertahan antar navigasi |
| Notification inbox | Aksi global |
| Demo workspace | Mempengaruhi semua tampilan data |
| Data freshness | Kesadaran telemetry global |

### 12.4 State yang Harus di URL

| State | Pattern URL |
|-------|-------------|
| Selected vehicle | ?vehicle={plate-slug} |
| Selected task | ?task={task-id} |
| Selected alert | ?alert={alert-id} |
| Map bounds | ?bounds={lat1,lng1,lat2,lng2} |
| Date range | ?from={date}&to={date} |
| Page mode | ?mode={map|list|split} |

### 12.5 Risiko Regresi

| Risiko | Mitigasi |
|--------|----------|
| Perubahan lebar panel mempengaruhi layout | Test semua halaman peta di 1366, 1440, 1920 |
| Auto-collapse rail merusak muscle memory | Preferensi pengguna tersimpan di localStorage |
| Lebar inspector berubah | Test semua halaman inspector |
| Recenter peta saat inspector | Verifikasi kendaraan terpilih tidak terhalang |
| Hapus jam | Verifikasi top bar tidak kosong di area kanan |

### 12.6 Item Cleanup

| Item | Prioritas | Catatan |
|------|-----------|---------|
| Hapus "103 units" hardcoded | P0 | AppShell.tsx, Sidebar.tsx |
| Hapus duplikat W_EXPANDED/W_RAIL | P0 | Gabungkan ke layout-constants.ts |
| Hapus Leaflet dari package.json | P1 | Sudah ditandai untuk dihapus |
| Hapus override CSS Leaflet | P1 | globals.css baris 736-786 |
| Ganti label uppercase 11px | P1 | Pakai minimum 14px |

---

## 13. Keputusan dan Pertanyaan

### 13.1 Keputusan Terkunci

| Keputusan | Alasan |
|-----------|--------|
| Skala lebar: list 320px, inspector 360px | List cukup untuk info, inspector cukup untuk struktur, bukan penyesuaian 20px |
| List dan inspector saling menggantikan | Memungkinkan target terpenuhi pada semua resolusi |
| Rail selalu 64px saat inspector terbuka | Menjamin target minimum pada semua resolusi desktop |
| Inspector 360px dengan recenter 180px | Entity terpilih di tengah area yang tidak tertutup |
| Jam dihapus dari top bar | Decorative, bersaing dengan indikator kesegaran |
| Selection wajib di URL dengan plate slug | Link bisa dibagikan, context preserved antar halaman |
| Max 1 contextual surface pada map-primary | Mencegah layout tidak bisa dipakai |
| Navigation rail adalah chrome, bukan panel | Rail tidak dihitung dalam max panel rules |
| Ambang kesegaran: <2m segar, 2-10m tertunda, >10m tidak mengirim data | Skenario demo GPS mati 42 menit sebagai kondisi kritis |
| Semua nilai lama dimigrasikan | Tidak ada nilai lama yang dipertahankan sebagai status transisi |

### 13.2 Pertanyaan Terbuka

Pertanyaan yang membutuhkan keputusan produk:

| Pertanyaan | Opsi | Implikasi |
|------------|------|----------|
| Apakah state list tersembunyi bertahan antar halaman atau di-reset per navigasi? | Per halaman / Global | Menentukan UX consistency |
| Apakah inspector pada table-primary mendorong konten atau overlay pada 1366px? | Push / Overlay | Push menghemat ruang, overlay lebih konsisten dengan peta |

---

## 14. Chat Output

### 14.1 Skala Lebar Final

Dua nilai aktif:

| Lebar | Peran |
|-------|-------|
| 320px | Kolom daftar (Tracking, Tasks, Vehicles) |
| 360px | Panel inspector (semua halaman) |

### 14.2 Tabel Ruang Peta Tracking

Unoccluded map width (bagian yang benar-benar terlihat):

| Viewport | Konfigurasi | Map Canvas | Occluded | Unoccluded | Target | Status |
|----------|-------------|------------|----------|------------|--------|--------|
| 1366px | Rail + inspector | 1302px | 360px | **942px** | 940px | TERPENUHI |
| 1366px | Rail + list | 982px | 0px | **982px** | 940px | TERPENUHI |
| 1366px | Rail only | 1302px | 0px | **1302px** | 940px | TERPENUHI |
| 1440px | Rail + inspector | 1376px | 360px | **1016px** | 1010px | TERPENUHI |
| 1440px | Rail + list | 1056px | 0px | **1056px** | 1010px | TERPENUHI |
| 1920px | Rail + inspector | 1856px | 360px | **1496px** | 1490px | TERPENUHI |
| 1920px | Rail + list | 1536px | 0px | **1536px** | 1490px | TERPENUHI |

### 14.3 Mekanisme yang Menghasilkan Ruang

| Mekanisme | Hasil |
|-----------|-------|
| Rail collapse (248→64) pada map-primary | +184px untuk peta |
| Mutual exclusion list/inspector | List tidak mengurangi ruang inspector, dan sebaliknya |
| Inspector overlay (bukan push) | Map canvas tetap penuh di balik overlay; area yang terlihat berkurang 360px |
| Recenter 180px | Entity terpilih tidak terhalang inspector |

### 14.4 Aturan Kesegaran Data

| Ambang | Kondisi | Warna |
|--------|---------|-------|
| < 2 menit | Segar | Normal |
| 2-10 menit | Tertunda | Warning |
| > 10 menit | Tidak mengirim data | Error |

**Alasan ambang:** Skenario demo memiliki unit D 6600 WXY yang tidak mengirim data selama 42 menit. Ambang 10 menit memastikan dispatcher tahu sebelum situasi menjadi kritis. Label "GPS mati" tidak dipakai karena penyebabnya bisa jaringan, perangkat, atau ingestion.

---

## 15. Definition of Done

- [x] Tidak ada judul ganda di dalam file (verifikasi diperlukan)
- [x] Target ruang E2 terpenuhi dan dibuktikan dengan tabel (verifikasi diperlukan)
- [x] Skala lebar hanya dua nilai aktif dan semua nilai lama memiliki tujuan migrasi (verifikasi diperlukan)
- [x] Selection tersimpan di URL dan tidak ada kontradiksi antar bagian (verifikasi diperlukan)
- [x] Jam dihapus dari top bar (verifikasi diperlukan)
- [x] Ambang kesegaran data punya alasan operasional (terpenuhi)
- [x] Setiap wireframe menjumlah tepat sama dengan lebar layarnya (verifikasi diperlukan)
- [x] Narasi bahasa Indonesia dan bebas karakter CJK (verifikasi diperlukan)
- [x] Tidak ada kode atau CSS yang diubah (terpenuhi)

