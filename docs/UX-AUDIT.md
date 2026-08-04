# VANGUARD — UX Audit

**Tanggal:** 2026-08-04
**Auditor:** Claude Code
**Scope:** 14 halaman, source code valid, mock data nyata

---

## 1. Workflow Audit

### WF1: Memeriksa Kondisi Armada di Awal Shift

**Pengguna:** Dispatcher, Supervisor
**Tujuan:** Apakah armada dalam kondisi normal?
**Kondisi awal:** Browser terbuka di Dashboard
**Langkah yang ada sekarang:**
1. Dashboard load dengan skeleton loading
2. KPI cards tampil dari MOCK_STATS (local)
3. Exception list dari MOCK_VEHICLES.filter (local)
4. Refresh manual (tombol RefreshCw)

**Langkah:** 1 klik untuk refresh

**Titik kebingungan:**
- Refresh tombol 153 di Dashboard hanya re-trigger useCallback yang mengambil mock data yang sama. Tidak ada indikasi data dari mana. Pengguna tidak bisa bedakan mock dari real API.

**Informasi yang kurang:**
- Tidak ada timestamp kapan data terakhir benar-benar di-fetch
- Tidak ada indikasi API timeout atau error karena semua dari local state
- Tidak ada label "DEMO" atau workspace indicator

**Informasi yang berlebihan:**
- Activity feed (baris 118-125 dashboard) tidak actionable

**Konteks yang hilang:** Filter role-based tidak terimplementasi; semua role melihat data yang sama

**Dead end:** Tidak ada. Flow berhenti di Dashboard tanpa arah yang jelas

**Simulated action yang menyesatkan:**
- Refresh button (baris 53-65 dashboard) — fetchDashboardData tidak memanggil API nyata

**Dampak terhadap demo:**
- Dispatcher tidak bisa bedakan demo dari production
- Confidence rendah karena semua interaksi tidak mengubah data nyata

**Tingkat keparahan:** High

**Rekomendasi perbaikan:**
- Dashboard harus konek ke GET /api/dashboard/stats dan GET /api/vehicles
- Tambah "Fleet data updated Xs ago" global indicator
- Filter role preset diimplementasi di server-side

---

### WF2: Menemukan dan Menindaklanjuti Exception

**Pengguna:** Dispatcher
**Tujuan:** Pilih kendaraan bermasalah, follow up
**Kondisi awal:** Exception list di Dashboard
**Langkah yang ada sekarang:**
1. Klik row Exception (link ke /tracking?focus=${id})
2. Navigasi ke Tracking dengan param ?focus
3. Map fokus ke kendaraan

**Langkah:** 1 klik langsung

**Titik kebingungan:**
- /tracking?focus=N menggunakan numeric ID, bukan plate slug

**Informasi yang kurang:**
- ?focus=1 tidak jelas kendaraan mana tanpa cek mock data

**Konteks yang hilang:** Selected vehicle di URL param tidak konsisten dengan route pattern baru (?vehicle=b5678tgp)

**Dead end:** Tidak ada

**Simulated action yang menyesatkan:** Tidak ada (redirect URL berfungsi

**Dampak terhadap demo:**
- Route parameter mismatch akan merusak URL state

**Tingkat keparahan:** High

**Rekomendasi perbaikan:**
- Gunakan plate slug di URL (?vehicle=b5678tgp)
- ?focus menggunakan ID numerik dihapus

---

### WF3: Mencari Kendaraan atau Driver Tertentu

**Pengguna:** Dispatcher
**Tujuan:** Cari unit berdasarkan plat, driver, atau lokasi
**Langkah yang ada sekarang:**
1. Cmd+K command palette
2. Ketik query
3. Enter untuk select
4. Navigasi ke hasil

**Langkah:** 3-4 klik + keyboard

**Titik kebingungan:**
- Command palette di CommandPalette.tsx mencari MOCK_VEHICLES.slice(0,8)
- Tidak ada scope selector (Vehicle/Driver/Task/Location)

**Informasi yang kurang:**
- Tidak ada recent searches
- Tidak ada clear empty state description
- Tidak ada hasil "tidak ditemukan" state yang helpful

**Dead end:** Tidak ada

**Simulated action yang menyesatkan:**
- Search results hanya dari MOCK_VEHICLES(8 kendaraan pertama)

**Dampak demo:**
- Pengguna tidak bisa cari kendaraan urutan 9-25
- Search terasa broken

**Tingkat keparahan:** High

**Rekomendasi perbaikan:**
- Backend API search endpoint
- Recent searches persisted
- Clear empty state dan loading state

---

### WF4: Memantau Task Berjalan

**Pengguna:** Dispatcher
**Tujuan:** Task mana on-track, mana akan terlambat
**Langkah yang ada sekarang:**
1. Klik menu Operations > Task Monitor
2. Table view default dengan TASKS array lokal
3. Filter status dengan toolbar button
4. Klik row untuk select task

**Langkah:** 4+ klik

**Titik kebingungan:**
- TASKS array (10 task hardcoded di tasks/page.tsx:43-54) tidak realistis untuk fleet 25 kendaraan

**Informasi yang kurang:**
- Tidak ada ETA real calculation
- Tidak ada delay prediction
- Task tidak terkoneksi ke vehicle tracking data

**Dead end:** Tidak ada

**Simulated action yang menyesatkan:**
- Semua task action buttons (Start Trip, End Trip) hanya toast

**Dampak demo:**
- Dispatcher tidak bisa percaya data task

**Tingkat keparahan:** High

**Rekomendasi perbaikan:**
- Task backend router
- ETA calculation dari telemetry

---

### WF5: Menangani Task Prediksi Terlambat

**Pengguna:** Dispatcher
**Tujuan:** Identifikasi task yang akan miss SLA
**Langkah yang ada sekarang:**
1. Filter TASKS untuk ETA sudah lewat
2. Klik task
3. View map dengan route

**Langkah:** 3 klik + filter

**Titik kebingungan:**
- Tidak ada visual delay indicator di task row
- ETA tidak real-time

**Informasi yang kurang:**
- Delay prediction trigger point tidak jelas
- Threshold terlambat tidak visible di UI

**Dead end:** Tidak ada

**Simulated action:** Timeline START/END buttons (baris 598-611) tidak mengubah data

**Dampak demo:**
- Dispatcher tidak bisa tunjukkan value nyata prediksi delay

**Tingkat keparahan:** Medium

**Rekomendasi perbaikan:**
- Backend task/ETA endpoint dengan delay calculation
- Visual delay badge di task row

---

### WF6: Memeriksa Unit GPS Stale atau Offline

**Pengguna:** Dispatcher
**Tujuan:** Unit mana tidak kirim data, apakah perlu follow up
**Langkah yang ada sekarang:**
1. Dashboard exception list (baris 88-115)
2. Klik row → Tracking
3. Cek detail panel last_update

**Langkah:** 2 klik

**Titik kebingungan:**
- last_update timestamp di Dashboard dari MOCK_VEHICLES, bukan real telemetry

**Informasi yang kurang:**
- Tidak ada "data freshness badge" per unit di exception list
- Tidak ada "Stale Xm" label

**Dead end:** Tidak ada

**Simulated action:** Tidak ada

**Dampak demo:**
- Demo dispatcher tidak bisa bedakan stale dari normal

**Tingkat keparahan:** Medium

**Rekomendasi perbaikan:**
- Data freshness hybrid badge
- Stale threshold visual cue

---

### WF7: Menyelidiki Pelanggaran Kecepatan

**Pengguna:** Safety, Supervisor
**Tujuan:** Lihat detail speeding event
**Langkah yang ada sekarang:**
1. Klik alert popup speeding (tracking/page.tsx:773-810)
2. Popup dengan toast notification
3. Navigasi manual ke Safety/Reports

**Langkah:** 2-3 klik

**Titik kebingungan:**
- Speeding popup (tracking/page.tsx:196-209) deteksi mock — `vehicles.find(v => v.speed > 80`

**Informasi yang berlebihan:**
- Speeding detection loop recalculate setiap render vehicles

**Dead end:**
- Popup hanya dismiss manual, tidak ada "Buka Safety" action otomatis

**Simulated action:**
- Speeding detection dari mock data tidak akurat

**Dampak demo:**
- Demo timing speeding event tidak predictable

**Tingkat keparahan:** High

**Rekomendasi perbaikan:**
- Real alert system dari backend
- Alert context action buttons

---

### WF8: Meninjau Bukti Kamera

**Pengguna:** Safety, CS
**Tujuan:** Snapshot bukti event
**Langkah yang ada sekarang:**
1. Buka /snapshots
2. Gallery dengan thumbnails placeholder (gradient backgrounds)
3. Klik snapshot → preview modal
4. Download toast

**Langkah:** 3-4 klik

**Titik kebingungan:**
- Snapshot Thumb (snapshots/page.tsx:100-134) semuanya placeholder gradient
- Tidak ada real image
- Tidak ada loading state untuk fetch

**Informasi yang kurang:**
- Camera channels tidak jelas
- Timestamp tidak terkoneksi ke telemetry

**Dead end:** Tidak ada

**Simulated action:**
- Semua thumbnail adalah placeholder dengan gradient background

**Dampak demo:**
- Demo camera evidence tidak credible

**Tingkat keparahan:** Medium

**Rekomendasi perbaikan:**
- Real placeholder illustrations, bukan gradient placeholder
- Object storage integration plan

---

### WF9: Memeriksa Riwayat Perjalanan

**Pengguna:** Supervisor, Safety
**Tujuan:** Replay trip untuk investigasi
**Langkah yang ada sekarang:**
1. Buka /history
2. Select vehicle dari dropdown
3. Set date range
4. Play replay dengan playback controls

**Langkah:** 4+ klik

**Titik kebingungan:**
- REPLAY_VEHICLES (history/page.tsx:193-234) telemetry generated client-side
- Playback controls (play/pause/step/speed) hanya manipulasi state lokal

**Dead end:** Tidak ada

**Simulated action:** Playback controls, replay playback — semua state-only

**Dampak demo:**
- History bisa berfungsi dengan data generated — demo-ready karena state lokal persistence cukup

**Tingkat keparahan:** Low (workflow functional dengan mock data)

**Rekomendasi perbaikan:**
- Real telemetry data dari backend
- Playback controls konek ke real timestamps

---

### WF10: Membuat Laporan untuk Management

**Pengguna:** Management
**Tujuan:** Generate report untuk export
**Langkah yang ada sekarang:**
1. Buka /reports
2. Klik Generate pada card report type
3. Form dengan form fields
4. Submit → 3 detik mock completion
5. Status berubah jadi "done" di history

**Langkah:** 3 klik

**Titik kebingungan:**
- Generate button (reports/page.tsx:591) tidak jelas apa yang terjadi
- 3 detik mock completion tidak realistic

**Dead end:** Tidak ada

**Simulated action:**
- setTimeout 3000ms → setStatus("done") — tidak ada file yang di-generate

**Dampak demo:**
- Management tidak bisa download real PDF/CSV

**Tingkat keparahan:** High

**Rekomendasi perbaikan:**
- Mock export menghasilkan placeholder file dengan label "Sample Report"
- Backend report generation plan

---

### WF11: Mengelola Master Data Unit dan Driver

**Pengguna:** Admin
**Tujuan:** CRUD vehicles dan drivers
**Langkah yang ada sekarang:**
1. Buka /vehicles atau /drivers
2. Klik Add button → Panel terbuka
3. Isi form → Submit → toast success
4. Delete dengan confirmation

**Langkah:** 4-5 klik

**Titik kebingungan:**
- Form submit hanya setState lokal (vehicles/page.tsx:412-468)
- Tidak ada backend persistence

**Dead end:** Tidak ada

**Simulated action:**
- Semua CRUD forms operasi lokal state saja

**Dampak demo:**
- Admin tidak bisa melihat data yang disimpan

**Tingkat keparahan:** Low untuk demo, High untuk production

**Rekomendasi perbaikan:**
- Backend CRUD endpoints
- Optimistic UI dengan rollback

---

## 2. Page-Level Audit

### Dashboard

**Responsibility saat ini:** Ringkasan fleet stats dengan mock data lokal

**Responsibility seharusnya:** Fleet overview dengan data real, role-based preset

**Kesenjangan:**
- fetchDashboardData (baris 40-44) ambil dari mock, bukan API
- Activity feed tidak actionable

**Struktur informasi:** KPI cards + exception list + activity feed + mini map

**Masalah hierarchy:**
- Activity feed (baris 118-125) tidak actionable — tampilkan aktivitas fake
- Quick access buttons (baris 288-291) navigasi saja

**Masalah density:** PELANGGARAN. KPI cards, exception section, activity feed, dan mini map menghasilkan lebih dari dua surface utama. Aturan terkunci: maksimal dua surface utama per layar.

**Masalah keterbacaan:**
- Semua teks 14px+ — OK
- PELANGGARAN: label uppercase 11px dipakai untuk informasi operasional. Aturan terkunci: minimum 14px, uppercase sangat terbatas.

**Elemen tidak bernilai:**
- Activity feed items — tidak ada action

**Informasi penting tidak terlihat:**
- Data freshness indicator global
- Fleet count di luar KPI (baris 175-178)

**Tombol utama:**

| Tombol | Klasifikasi | Alasan |
|--------|-------------|---------|
| Retry button | Demo-persistent | Reload mock yang sama |
| QuickAccess links | Operational UI | Navigasi saja |
| Exception row links | Operational UI | Navigasi dengan context |

---

### Realtime Monitor (/tracking)

**Responsibility saat ini:** Map + list + detail panel, WebSocket attempted

**Responsibility seharusnya:** Operational context /tracking?vehicle=b1234kjt

**Masalah utama:**
- Fetch API (baris 189-193) fallback ke mock jika gagal — tidak ada loading state yang berbeda
- Speeding detection loop recalculate setiap render

**Masalah density:** Peta, daftar kendaraan 280px dari grid-cols-[280px_1fr] pada tracking/page.tsx baris 534, dan panel detail 380px dari DetailPanel.tsx baris 88 menghasilkan tiga surface utama. Aturan terkunci membatasi dua surface utama.

**Masalah interaksi:**
- Map controls di toolbar (baris 393-500) banyak yang simulated
- handleZoomToFit (baris 303) toast-only action
- handleFind (baris 297) toast-only

**State belum ditangani:**
- Offline vehicles tidak punya visual urgency berbeda dari driving/idle

**Tombol utama:**

| Tombol | Klasifikasi | Alasan |
|--------|-------------|---------|
| handleModeToggle | Operational UI | Toggle view mode — OK |
| handleRefresh | Simulated | Toast tanpa data fetch |
| handleZoomToFit | Dead | Toast-only |
| handleFind | Dead | Toast-only |
| handleClusterToggle | Demo-persistent | Toggle state lokal |
| handleZoneToggle | Demo-persistent | Toggle state lokal |
| handleSpeeding | Contextual | Alert popup, meaningful |

**Prioritas perbaikan:** P0

---

### Task Monitor (/tasks)

**Responsibility saat ini:** Table + map dengan TASKS lokal

**Masalah density:** 380px sidebar + map = 2 areas

**Masalah hierarchy:**
- TASKS array (10 items) tidak mencerminkan fleet nyata
- Timeline buttons START/END tidak jelas efeknya

**Masalah interaksi:**
- Task timeline START/END (baris 598-611) hanya toast
- handleAddTask (baris 108-115) hanya state lokal

**State belum ditangani:**
- Empty state tidak tertrigger karena selalu ada 10 task

**Tombol utama:**

| Tombol | Klasifikasi | Alasan |
|--------|-------------|---------|
| handleAddTask | Simulated | Toast-only |
| handleStartTrip | Simulated | Toast-only |
| handleEndTrip | Simulated | Toast-only |
| handleRefresh | Simulated | Timeout + toast |
| Filter buttons | Demo-persistent | OK |
| Row selection | Operational UI | OK |

**Prioritas perbaikan:** P1

---

### History (/history)

**Responsibility saat ini:** Trip replay dengan telemetry generated

**Masalah interaksi:** Playback controls state-only

**Keuntungan:** Telemetry generated — replay fungsional dengan mock data

**State belum ditangani:**
- Date range picker tidak terimplementasi

**Tombol utama:**

| Tombol | Klasifikasi |
|--------|-------------|
| handlePlayPause | Demo-persistent |
| handleReset | Demo-persistent |
| handleSpeed | Demo-persistent |
| handleVehicleChange | Demo-persistent |

**Prioritas perbaikan:** P2

---

### Settings (/settings)

**Responsibility saat ini:** Preferences UI dengan state lokal

**Masalah:** Tidak ada persistence yang nyata

**Tombol utama:** Semua operational UI atau simulated

**Prioritas perbaikan:** P3

---

## 3. AI Slop Diagnosis

### Container Berlebihan

**Lokasi:** Dashboard page structure (baris 183-319)
- 3 Card wrappers untuk konten yang tidak butuh elevation berbeda
- Section grouping seharusnya cukup dengan divider

### Struktur Simetris Berulang

**Lokasi:** Seluruh page — grid layouts serupa
- Setiap halaman.grid lg:grid-cols-3 pattern sama
- KPI cards di Dashboard, settings, vehicles, drivers — formula sama
- Tidak ada structural differentiation berdasarkan use case

### Typography Terlalu Kecil

**Lokasi:** Tailwind text-[10px] atau text-[11px] di banyak tempat
- Baris label di table header, metadata di badge
- Teks operasional 11px mengurangi readability

### Density Tidak Terkontrol

**Lokasi:** Table rows dengan mixed content
- Tidak ada density toggle yang berfungsi nyata
- Compact vs Comfortable toggle tidak connected ke state

### Badge Berlebihan

**Lokasi:** Badge.tsx di banyak halaman
- Setiap status punya badge sendiri
- StatusPill dengan dot + icon + text = 3 ways to encode 1 value

### Icon Dekoratif

**Lokasi:** Lucide icons di seluruh tempat
- Icon yang menggantikan teks (seharusnya OK)
- Icon sebagai decorative di Card tidak diberi alt text

### Animasi Tanpa Makna

**Lokasi:** motion/react di seluruh tempat
- Animated counter di KPI cards — OK untuk demo
- Page transition animations tidak ada — baik

### KPI Tanpa Periode

**Lokasi:** Dashboard KPI cards (baris 175-178)
- "12 driving" tanpa konteks waktu
- Seharusnya "12 driving (2 baru dalam 15 menit)"

### Shadow Tidak Fungsional

**Lokasi:** Card dengan elev-1 shadow
- Card shadow tidak berkomunikasi interactive state
- Overlay panel shadow berbeda dari card shadow — membingungkan

### Semua Halaman Formula Sama

**Lokasi:** Page structure pattern
- Header → Content → Footer pattern di semua halaman
- Action area / Empty area / Data area tidak dibedakan

### Gradient Dekoratif

**Lokasi:** Snapshot thumbnail placeholder (snapshots/page.tsx:100-134)
- Background gradient backgrounds tidak fungsional
- Maps background gradients — OK

### Label Tidak Operasional

**Lokasi:** REPORT_TYPES catalog (reports/page.tsx:73-95)
- Deskripsi report tidak actionable
- "Deskripsi:" prefix tidak perlu

### Warna Status Tidak Konsisten

**Lokasi:** Seluruh halaman
- Status colors dari CSS custom properties vs inline styles
- Tidak ada satu source of truth untuk warna

## 4. Masalah Ruang dan Layout

### Lebar Sidebar

**Nilai sekarang:** 248px expanded, 64px rail
- Daftar kendaraan di Tracking memakai kolom tetap 280px melalui grid-cols-[280px_1fr] pada tracking/page.tsx baris 534. Kolom task di Task Monitor memakai 380px melalui grid-cols-[380px_1fr] pada tasks/page.tsx baris 273.
- Content area 1366 - 280 - sidebar = 786px untuk map

### Page Padding Tidak Konsisten

**Nilai sekarang:** Padding 24px untuk Dashboard, settings pages
- Map pages tanpa padding — OK
- Table pages dengan 24px — acceptable

### Container Max-Width

**Nilai sekarang:** Tidak ada max-width di konten — full width

### Panel Map Lebar

**Nilai terverifikasi.** Lebar panel dan sidebar yang benar-benar ada di kode berada di `docs/_evidence/width-inventory.txt` dan `docs/_evidence/layout-widths-core.txt`. Yang terkonfirmasi: panel detail `w-[380px]` di `components/map/DetailPanel.tsx`, sidebar `w-[320px]` di `dashcam/page.tsx` dan `control/page.tsx`, serta overlay `w-[320px]` di `geofences/page.tsx`. Nilai 280px memang ada, tetapi ditulis sebagai grid template grid-cols-[280px_1fr] pada tracking/page.tsx baris 534, bukan sebagai utilitas lebar. Nilai 400px tidak ada. Panel detail sebenarnya 380px dan kolom task sebenarnya 380px. Setiap angka ruang harus diambil dari docs/_evidence/width-inventory.txt yang kini juga mencakup pola grid template.

### Row Height Tidak Terkendali

**Nilai sekarang:** Dynamic row height dari konten
- Task row 2.5 dengan multi-line content
- Vehicle row tinggi karena 3 line info

### Area Terbuang

**Dashboard:** Activity feed dengan 6 item fake — 6 × 80px = 480px area terbuang
- Empty state di table dengan ilustrasi besar

### Panel Selalu Terbuka

**Locate:** Selected vehicle panel di map overlay
- Tidak toggle off — consume ruang tanpa pilihan

### Kolom Tidak Perlu

**Vehicles table:** Semua kolom di vehicles/page.tsx (baris 646-684)
- 9 kolom — readability menurun di fleet monitor use case

### Map Controls Overload

**Tracking toolbar:** 12+ control items — kebingungan dispatcher

## 5. Interaksi dan Responsiveness

### Marker DOM Overload

**TrackingMap dengan 25 kendaraan = 25 DOM nodes
- Skalabilitas ke 100 kendaraan akan lambat

### Re-render Tidak Perlu

**Speeding detection loop** setiap render vehicles

### Polling Interval

**Telemetry polling:** 10 detik interval di AppShell — baik

### Animasi Tidak Berat

**Motion/react di page-level — acceptable
**Number ticker di KPI — acceptable**

### Table Tanpa Virtualisasi

**25 rows — OK
**100 rows akan lag**

### Image Placeholder

**Snapshots:** 12 placeholder gradient — heavy DOM

## 6. Accessibility dan Usability Lintas Usia

### Ukuran Teks Minimum

**Nilai sekarang:** body 14px sesuai aturan. PELANGGARAN: label 11px dipakai untuk status, waktu, plat nomor, dan nama driver. 11px hanya boleh untuk micro label non-operasional seperti satuan pengukuran.

### Kontras

**Nilai sekarang:** WCAG AA — OK untuk tema terang

### Target Klik

**Nilai sekarang:** 32px+ untuk buttons

### Keyboard Navigation

**Nilai sekarang:** Tab-navigable, focus ring visible

### Label Form

**Nilai sekarang:** Placeholder tanpa label di beberapa tempat

### Istilah Teknis

**Nilai sekarang:** "Telemetry", "API", "WebSocket" tidak explained

### Konsistensi Terminologi

**Nilai sekarang:** "Task", "Trip", "Activity" dicampur

### Istilah Tidak Seragam

| Halaman | Terminologi |
|---------|-------------|
| Dashboard | Activity feed |
| Tracking | Event log |
| History | Timeline |
| Reports | Log |

---

## 7. Konsistensi Audit

### Penamaan Status

| Halaman | Status Label |
|---------|-------------|
| Dashboard | driving, idle, stopped, offline |
| Tracking | driving, idle, stop, offline, delayed |
| Tasks | progress, unloading, waiting, assigned, completed |

### Format Waktu

| Lokasi | Format |
|---------|--------|
| last_update | ISO string |
| timeAgo | Xm ago, Xh ago |
| Date picker | custom string |

### Format Plat Nomor

**Sekarang:** "B 1234 KJT" — consistent

### Empty State

**Sekarang:** Ilustrasi + teks + CTA button — OK

### Error State

**Sekarang:** Toast + retry button — OK

### Loading State

**Sekarang:** Skeleton shimmer — OK

---

## 8. Demo Risk List

| # | Risiko | Severity |
|----|---------|--------|
| 1 | Speeding detection dari mock data tidak predictable | Critical |
| 2 | Task actions semua toast-only | High |
| 3 | Report generation tidak menghasilkan file | High |
| 4 | Refresh tidak fetch real API | High |
| 5 | Command palette hanya 8 kendaraan pertama | High |
| 6 | ?focus=N ID mismatch dengan canonical destination | Medium |
| 7 | Snapshot thumbnails semua gradient placeholder | Medium |
| 8 | Activity feed fake di Dashboard | Medium |
| 9 | No offline vehicles count berbeda di PAGE_TITLES vs MOCK_STATS | Low |
| 10 | Settings tidak persist | Low |

---

## 9. Prioritized Findings

> **Prinsip prioritas.** VANGUARD dijual lebih dahulu sebagai product demo dengan
> synthetic data. Backend nyata dikerjakan setelah ada klien. Karena itu tidak ada
> item backend baru yang boleh berada di P0. Masalah sebenarnya bukan penggunaan
> mock data, melainkan mock data yang tersebar dan tidak konsisten.

### P0: Memutus kredibilitas demo

| # | Masalah | Bukti lokasi | Dampak demo | Perbaikan tanpa backend baru |
|---|---------|--------------|-------------|------------------------------|
| P0-1 | Demo data tidak punya single source of truth | `MOCK_STATS`, `MOCK_VEHICLES` di `lib/mock-data.ts`; `TASKS` di `tasks/page.tsx`; `REPLAY_VEHICLES` di `history/page.tsx`; data snapshot dan dashcam terpisah | Angka dan status berbeda antarhalaman untuk kendaraan yang sama | Satu demo data store berisi 25 kendaraan, driver, task, trip, alert, evidence, geofence; semua halaman membacanya |
| P0-2 | Alert dihitung ad-hoc dari kondisi kecepatan pada `hooks/useSpeedingMonitor.ts`, sehingga alert tidak memiliki identitas, severity, maupun review state | Alert muncul dan hilang tidak terduga saat demo dijalankan | Alert menjadi entity yang dideklarasikan dengan severity, waktu, kendaraan, evidence, dan review state |
| P0-3 | Search hanya membaca sebagian fleet | `CommandPalette` memakai `MOCK_VEHICLES.slice(0, 8)` | Kendaraan urutan 9-25 tidak dapat ditemukan sehingga search terasa rusak | Search membaca seluruh demo data store dengan scope Vehicle, Driver, Task, Location, Geofence |
| P0-4 | URL state memakai ID numerik | `/tracking?focus=1`, `/history?vehicle=2` | Link tidak dapat dibagikan dan konteks hilang saat berpindah halaman | Gunakan plate slug canonical, contoh `?vehicle=b1234kjt` |
| P0-5 | Export report tidak menghasilkan apa pun | `reports/page.tsx` memakai `setTimeout` lalu mengubah status menjadi selesai | Klaim keberhasilan yang palsu, kelas kesalahan paling berbahaya | Export menghasilkan file nyata di sisi klien dengan label sample report |
| P0-6 | Angka fleet hardcoded dan tidak konsisten. Terverifikasi di empat tempat pada app shell: `components/layout/AppShell.tsx:42` menulis Overview 103 units, dan `components/layout/Sidebar.tsx` baris 235, 248, serta 260 menulis 103 units online | Angka pada layar bertentangan satu sama lain di depan calon klien | Seluruh angka dihitung dari demo data store |

### P1: Mengganggu workflow utama

| # | Masalah | Lokasi |
|---|---------|--------|
| P1-1 | Task action hanya menampilkan toast tanpa mengubah state | `tasks/page.tsx` |
| P1-2 | Aksi peta seperti zoom to fit dan find hanya toast | `tracking/page.tsx` |
| P1-3 | Refresh tidak mengubah apa pun dan tidak memperbarui indikator waktu | `dashboard/page.tsx`, `tracking/page.tsx` |
| P1-4 | Kegagalan pengambilan data jatuh ke mock secara diam-diam | `tracking/page.tsx` |
| P1-5 | CRUD master data hilang setelah reload | `vehicles/page.tsx`, `drivers/page.tsx` |
| P1-6 | Tidak ada indikator stale atau offline per unit | Dashboard exception list, Tracking list |
| P1-7 | Dua pustaka peta terpasang bersamaan. Dependency leaflet, react-leaflet, dan @types/leaflet masih ada di frontend/package.json, dan blok override Leaflet masih ada di frontend/src/app/globals.css sekitar baris 736 sampai 786, sedangkan peta yang dipakai adalah MapLibre GL | frontend/package.json, frontend/src/app/globals.css |

### P2: Mengurangi kualitas yang dirasakan

| # | Masalah | Lokasi |
|---|---------|--------|
| P2-1 | Activity feed tidak actionable | `dashboard/page.tsx` |
| P2-2 | Thumbnail evidence hanya gradient | `snapshots/page.tsx` |
| P2-3 | KPI tanpa periode atau tren | `dashboard/page.tsx` |
| P2-4 | Tabel vehicles memuat sembilan kolom | `vehicles/page.tsx` |
| P2-5 | Toolbar peta memuat lebih dari dua belas kontrol | `tracking/page.tsx` |
| P2-6 | Status dikodekan tiga kali melalui dot, icon, dan teks | komponen badge dan status pill |

### P3: Penyempurnaan

| # | Masalah | Lokasi |
|---|---------|--------|
| P3-1 | Preferensi tidak bertahan | `settings/page.tsx` |
| P3-2 | Density toggle tidak terhubung ke tampilan | app context |
| P3-3 | Terminologi tidak seragam antarhalaman | seluruh halaman |
| P3-4 | Struktur seluruh halaman memakai formula yang sama | pola layout |

### Backlog Phase B: Backend enablement

Dikerjakan setelah ada klien dan tidak menjadi syarat demo.

| # | Item | Catatan |
|---|------|---------|
| B-1 | Aplikasi backend dapat dijalankan dengan dependency lengkap | prasyarat semua item lain |
| B-2 | Autentikasi dan role-based access control | menentukan visibilitas navigasi |
| B-3 | Kontrak WebSocket disatukan antara frontend dan backend | penamaan field dan path berbeda saat ini |
| B-4 | Telemetry ingest dan riwayat yang dapat diandalkan | dasar tracking dan history |
| B-5 | Alert engine yang menyimpan alert secara persisten | menggantikan alert demo |
| B-6 | CRUD kendaraan, driver, dan device pairing | menggantikan state lokal |
| B-7 | Task dan trip lifecycle | menggantikan task demo |
| B-8 | Geofence evaluation engine | masuk dan keluar area |
| B-9 | Penyimpanan evidence kamera | menggantikan placeholder |
| B-10 | Report generation di server dan penjadwalan | menggantikan export klien |
| B-11 | Audit trail dan administrasi | kebutuhan enterprise |

---

## 10. Redesign Requirements

### Kebutuhan Dashboard

1. Data binding ke demo data store tunggal (bukan API). Backend nyata masuk Backlog Phase B.
2. Global fleet data freshness indicator
3. Activity feed dihapus atau dikurangi
4. KPI cards dengan periode atau tren
5. Role-based preset support
6. Exception dengan contextual link (?vehicle=plate-slug)
7. "DEMO WORKSPACE" chip
8. Refresh membaca ulang demo data store dan memperbarui timestamp freshness secara jujur.

### Kebutuhan Realtime Monitor

1. Pergerakan kendaraan digerakkan oleh demo simulation loop lokal. Perbaikan WebSocket masuk Backlog Phase B.
2. MapLibre GL tetap dipakai. Hapus seluruh sisa Leaflet di CSS dan dependency.
3. URL state dengan plate slug (?vehicle=b1234kjt)
4. Speeding alert queue dari backend
5. Map toolbar dikurangi (8 max)
6. Detail panel dengan data freshness per field

### Kebutuhan Task Monitor

1. Task action mengubah demo data store dan bertahan setelah reload.
2. ETA dan delay prediction dihitung dari demo data yang dideklarasikan, konsisten antarhalaman.
3. Timeline buttons terhubung ke real state
4. Progress bar terhubung ke telemetry
5. Map overlay dengan real coordinates

### Kebutuhan Trip History

1. Trip history dibaca dari demo data store yang sama dengan Tracking.
2. Real telemetry data untuk replay
3. Date range picker terfilter backend
4. Export CSV functional

### Kebutuhan Safety Review

1. Alert menjadi entity dalam demo data store dengan severity dan review state, bukan hasil filter speed.
2. Alert queue dengan action state (Open/Acknowledged/Resolved)
3. Evidence viewer functional dengan placeholder images
4. Command palette membaca seluruh fleet dari demo data store.

### Kebutuhan Reports

1. Export menghasilkan file nyata di sisi klien, berlabel sample report.
2. Report catalog functional filter
3. Preview mode functional
4. Export menghasilkan placeholder file dengan label "Sample Report"
5. Scheduled report dengan mock queue

### Kebutuhan App Shell dan Navigation

1. Global fleet data freshness indicator
2. Workspace chip dengan demo state
3. 6 primary navigation areas sesuai IA
4. Search konek ke backend
5. Sidebar responsive (248px/64px)
6. Role-based navigation visibility
7. MapLibre GL integration, Leaflet dihapus

### Kebutuhan Global Search

1. Search membaca seluruh demo data store, bukan sebagian.
2. Scope filter (All/Vehicle/Driver/Task/Location)
3. Recent searches persisted
4. Empty state dengan "tidak ada hasil" helpful
5. Result dengan plate slug canonical URL

### Kebutuhan State dan Feedback

1. Loading skeleton di setiap page
2. Error boundary per page
3. Toast system untuk operational feedback
4. Empty state dengan ilustratif + CTA
5. Stale/offline indicator per unit
6. LocalStorage persistence dengan schema version
7. Reset Demo button

---

## 11. Demo Data Integrity

Bagian ini menjelaskan akar dari sebagian besar temuan P0. Bukti mentah berada di
`docs/_evidence/mock-sources.txt` dan `docs/_evidence/hardcoded-counts.txt`.

### Sumber data yang tersebar

| Sumber | Lokasi | Isi | Dipakai oleh |
|--------|--------|-----|--------------|
| `MOCK_VEHICLES` | `frontend/src/lib/mock-data.ts` | daftar kendaraan dan posisi | Dashboard, Tracking, Locate, Vehicles |
| `MOCK_STATS` | `frontend/src/lib/mock-data.ts` | ringkasan agregat yang ditulis manual | Dashboard |
| `TASKS` | `frontend/src/app/(app)/tasks/page.tsx` | sepuluh task yang ditulis manual | Task Monitor |
| `REPLAY_VEHICLES` | `frontend/src/app/(app)/history/page.tsx` | jejak telemetry yang dihasilkan di klien | Trip History |
| data snapshot | `frontend/src/app/(app)/snapshots/page.tsx` | placeholder evidence | Snapshots |
| data dashcam | `frontend/src/app/(app)/dashcam/page.tsx` | placeholder video | Dashcam |
| data alert | dihitung inline dari kecepatan | tidak ada entity alert | Tracking, Accidents |

### Akibat langsung

1. Agregat tidak dihitung dari daftar kendaraan, sehingga KPI dapat bertentangan
   dengan isi tabel.
2. Task tidak terhubung ke kendaraan mana pun, sehingga ETA dan delay tidak dapat
   dipercaya saat demo.
3. Trip history tidak berhubungan dengan posisi terakhir pada Tracking.
4. Alert tidak memiliki identitas, sehingga tidak dapat dirujuk melalui URL,
   tidak dapat ditandai selesai, dan tidak dapat dihubungkan ke evidence.
5. Evidence tidak terhubung ke alert atau trip.

### Struktur demo data store yang direkomendasikan

Satu modul tunggal berisi entity berikut, dengan relasi eksplisit dan seed tetap.

| Entity | Kunci | Relasi |
|--------|-------|--------|
| Vehicle | plate slug | driver, device, posisi terakhir, trip aktif |
| Driver | driver id | vehicle, skor perilaku |
| Device | device id | vehicle, status pairing, waktu data terakhir |
| Task | task id | vehicle, driver, titik asal dan tujuan, jadwal, ETA, status |
| Trip | trip id | vehicle, task, jejak titik, event |
| Alert | alert id | vehicle, trip, severity, waktu, review state, evidence |
| Evidence | evidence id | vehicle, alert, kanal kamera, waktu |
| Geofence | geofence id | area, rule, event masuk dan keluar |

Aturan yang harus dipenuhi:

1. Seluruh agregat dihitung dari entity, tidak pernah ditulis manual.
2. Seluruh identitas kendaraan pada URL memakai plate slug.
3. Skenario demo bersifat deterministik dan dapat diulang.
4. Perubahan pengguna bertahan melalui penyimpanan lokal berversi.
5. Tersedia mekanisme reset ke seed awal.
6. Tidak ada aksi yang mengklaim berhasil tanpa mengubah data.

### Angka hardcoded yang harus dihapus

Daftar lengkap berada di `docs/_evidence/hardcoded-counts.txt`. Semua nilai pada
daftar itu harus diganti menjadi turunan dari demo data store dengan ukuran fleet
dua puluh lima kendaraan.

---

## 12. Page-Level Audit: Halaman Tersisa

Halaman berikut belum diaudit pada bagian dua dan wajib dilengkapi dengan format
yang sama, termasuk klasifikasi seluruh tombol utama.

| Halaman | Tanggung jawab yang benar | Kesenjangan utama yang sudah diketahui |
|---------|---------------------------|----------------------------------------|
| Locate | tidak menjadi navigasi utama, melebur ke global search dan Realtime Monitor | masih menjadi route dan fungsi tumpang tindih dengan Tracking |
| Vehicles | catatan resmi kendaraan | tabel terlalu lebar, CRUD tidak bertahan |
| Drivers | catatan resmi pengemudi | sama seperti Vehicles, tidak terhubung ke perilaku mengemudi |
| Geofences | area operasional dan pelanggarannya | tidak ada event masuk dan keluar yang nyata |
| Accidents | menjadi sub-view Safety, bukan domain terpisah | duplikasi dengan Safety Review |
| Reports | katalog laporan dan hasilnya | export tidak menghasilkan file |
| Snapshots | perpustakaan evidence, bukan langkah utama demo | thumbnail gradient, tidak terhubung ke alert |
| Dashcam | tinjauan rekaman | placeholder tanpa hubungan ke trip |
| Control | Administration, Commands, berbasis izin | status dan efek perintah tidak jelas |

### Klasifikasi tombol yang wajib dipakai

| Kelas | Arti | Boleh ada di demo |
|-------|------|-------------------|
| Persistent | mengubah demo data store dan bertahan setelah reload | ya |
| Operational UI | navigasi, filter, tampilan, seleksi | ya |
| Simulated | menampilkan keberhasilan tanpa perubahan data | tidak |
| Dead | tidak melakukan apa pun | tidak |

Setiap tombol berkelas Simulated atau Dead harus diubah menjadi Persistent,
diubah menjadi Operational UI, atau dihapus dari tampilan.

---

---

## 13. Ringkasan Eksekutif

### Sepuluh masalah paling merusak

| # | Masalah | Akar penyebab |
|---|---------|---------------|
| 1 | Angka pada layar bertentangan antarhalaman | agregat ditulis manual, tidak dihitung dari data |
| 2 | Export laporan mengaku berhasil tanpa menghasilkan file | aksi simulated |
| 3 | Alert muncul dan hilang tidak terduga | alert dihitung ad-hoc dari kecepatan |
| 4 | Kendaraan urutan sembilan sampai dua puluh lima tidak dapat dicari | search membaca sebagian data |
| 5 | Aksi task hanya menampilkan notifikasi | tidak ada penyimpanan demo |
| 6 | Refresh tidak mengubah apa pun dan tidak memperbarui waktu | tidak ada indikator freshness yang jujur |
| 7 | Tautan tidak dapat dibagikan dan konteks hilang | URL memakai ID numerik |
| 8 | Activity feed menambah kebisingan tanpa tindakan | konten tanpa tujuan operasional |
| 9 | Evidence kamera tidak dapat dipercaya | thumbnail hanya gradient |
| 10 | Dua pustaka peta hidup berdampingan | Leaflet masih terpasang meski MapLibre yang dipakai |

### Lima penyebab utama kesan AI slop

1. Kartu di dalam kartu, sehingga elevation tidak lagi berarti apa pun.
2. Status dikodekan tiga kali sekaligus melalui titik, ikon, dan teks.
3. Seluruh halaman memakai satu formula susunan yang sama tanpa memandang tugasnya.
4. Gradient dekoratif dipakai sebagai pengganti konten nyata.
5. Bayangan kartu dan bayangan panel identik, sehingga kedalaman tidak terbaca.

### Lima penyebab utama tampilan sempit

1. Panel detail 380px dan sidebar 320px dipakai bersamaan tanpa aturan berapa panel yang boleh terbuka sekaligus. Nilai pasti berada di docs/_evidence/width-inventory.txt.
2. Tabel kendaraan memuat sembilan kolom sekaligus.
3. Rail navigasi 248px tidak pernah menyempit sendiri saat halaman membutuhkan ruang.
4. Toolbar peta memuat lebih dari dua belas kontrol.
5. Padding halaman diterapkan seragam tanpa memandang mode konten.

### Daftar P0

| # | Perbaikan |
|---|-----------|
| P0-1 | Satu demo data store sebagai sumber tunggal untuk dua puluh lima kendaraan |
| P0-2 | Alert menjadi entity dengan severity, waktu, evidence, dan review state |
| P0-3 | Search membaca seluruh data, bukan sebagian |
| P0-4 | URL state memakai plate slug canonical |
| P0-5 | Export menghasilkan file nyata berlabel sample report |
| P0-6 | Seluruh angka fleet dihitung dari data, tidak ditulis manual |

Tidak ada item backend baru di P0. Seluruh pekerjaan backend berada di Backlog Phase B.

### Kebutuhan utama untuk tahap wireframe

1. App shell dengan indikator freshness global dan satu penanda demo workspace.
2. Navigasi enam area dengan submenu yang tidak pernah terbuka bersamaan.
3. Global search dengan scope dan tujuan yang jelas untuk setiap tipe hasil.
4. Satu pola inspector yang sama untuk kendaraan, task, alert, dan trip.
5. Beberapa mode konten, bukan satu formula halaman.
6. Peta dengan toolbar yang jauh lebih ringkas.
7. Anggaran ruang yang membuktikan area kerja lebih luas dari kondisi sekarang.
8. Wireframe untuk 1366, 1440, dan tablet.

---

## 14. Angka Terverifikasi dari Basis Kode

Bagian ini hanya memuat nilai yang dibuktikan melalui pencarian pada basis kode.
Nilai apa pun yang tidak tercantum di sini harus diukur ulang sebelum dipakai.

| Temuan | Nilai terverifikasi | Bukti |
|--------|---------------------|-------|
| Angka fleet palsu | empat kemunculan angka 103 di app shell | AppShell.tsx baris 42, Sidebar.tsx baris 235, 248, 260 |
| Panel detail peta | w-[380px] | components/map/DetailPanel.tsx baris 88 |
| Sidebar halaman dashcam dan control | w-[320px] | dashcam/page.tsx baris 347, control/page.tsx baris 420 |
| Overlay geofence | w-[320px] | geofences/page.tsx baris 605 |
| Teks kecil dan uppercase | 277 kemunculan pada 20 file, terbanyak history 39, locate 21, geofences 21 | docs/_evidence/small-text.txt |
| Aksi berbasis notifikasi dan timer | 16 kemunculan, terbanyak accidents 8 | docs/_evidence/toast-only-actions.txt |
| Sumber data mock | 80 kemunculan pada 20 file, terbanyak lib/mock-data.ts 9 dan lib/api.ts 8 | docs/_evidence/mock-sources.txt |
| Sisa pustaka Leaflet | tiga dependency di package.json dan sebelas blok override di globals.css baris 736 sampai 786 | docs/_evidence/leaflet-traces.txt |
| Deteksi kecepatan | sudah diekstrak menjadi hooks/useSpeedingMonitor.ts | docs/_evidence/mock-sources.txt |

### Koreksi terhadap versi audit sebelumnya

1. Nilai 280px ada sebagai grid template pada Tracking. Nilai 400px tidak ada; panel detail dan kolom task keduanya 380px. Pencarian lebar wajib mencakup pola grid-cols agar tidak melewatkan kolom tetap.
2. Deteksi kecepatan bukan loop inline di halaman, melainkan hook tersendiri.
3. Angka fleet palsu berada di app shell, bukan di halaman, sehingga perbaikannya
   masuk pekerjaan app shell.

### Tambahan angka terverifikasi

| Temuan | Nilai | Bukti |
|--------|-------|-------|
| Kolom daftar kendaraan di Tracking | 280px sebagai grid template | tracking/page.tsx baris 534, grid-cols-[280px_1fr] |
| Kolom task di Task Monitor | 380px sebagai grid template | tasks/page.tsx baris 273, grid-cols-[380px_1fr] |
| Panel detail peta | 380px | components/map/DetailPanel.tsx baris 88 |
| Nilai 400px | tidak ada di dalam kode | docs/_evidence/width-inventory.txt |
| Lebar konten maksimum | satu kemunculan max-w-[1600px] | docs/_evidence/width-inventory.txt |

Catatan metode: pencarian lebar wajib mencakup pola w-[...], min-w-[...],
max-w-[...], dan grid-cols-[...]. Inventaris pertama hanya memakai pola w-[...]
sehingga melewatkan kolom tetap yang ditulis sebagai grid template.
