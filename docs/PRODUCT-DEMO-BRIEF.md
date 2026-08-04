# VANGUARD — Product Demo Blueprint

**Tanggal:** 2026-08-04
**Status:** Draft untuk review internal
**Tujuan:** Sales-ready product demo menggunakan synthetic/mock data

---

## 1. Target Buyer

### Kategori 1: Perusahaan Transportasi dan Distribusi

- **Jenis perusahaan:** Freight forwarder, perusahaan distribusi retail, ekspedisi
- **Ukuran armada:** 10–100 kendaraan
- **Masalah utama:** Tidak tahu posisi kendaraan, tidak bisa prediksi keterlambatan, tidak ada bukti pengiriman
- **Pengguna harian:** Dispatcher, operations supervisor
- **Pengambil keputusan:** Fleet Manager, Operations Director
- **Alasan membeli:**
  - Mengurangi biaya operasional dari visibilitas armada
  - Bukti delivery untuk klaim customer
  - Mengurangi speed violation dan fuel waste
- **Yang ingin dilihat saat demo:**
  - Dashboard kondisi armada
  - Vehicle tracking realtime
  - Task monitoring dengan ETA
  - Report speeding dan fuel
- **Keberatan yang mungkin muncul:**
  - "Data kami proprietary, tidak bisa di-cloud"
  - "Driver kami menolak GPS"
  - "Tim kami tidak teknis"

### Kategori 2: Pemilik Armada (Fleet Owner)

- **Jenis perusahaan:** Manufacturing, mining, construction dengan armada sendiri
- **Ukuran armada:** 5–50 kendaraan
- **Masalah utama:** Aset tidak terpantau, utilisasi rendah, maintenance tidak terjadwal
- **Pengguna harian:** Fleet coordinator, maintenance head
- **Pengambil keputusan:** Plant Manager, CFO
- **Alasan membeli:**
  - Aset terpakai maksimal
  - Pengurangan downtime kendaraan
  - Compliance dengan SOP safety
- **Yang ingin dilihat saat demo:**
  - Vehicle utilization dashboard
  - Maintenance schedule tracking
  - Driver performance report
  - Fuel usage analysis
- **Keberatan yang mungkin muncul:**
  - "Kami sudah punya sistem lain"
  - "Implementasi terlalu lama"
  - "Harga per kendaraan mahal"

### Kategori 3: Perusahaan Logistik (3PL/4PL)

- **Jenis perusahaan:** Third-party logistics provider, cold chain, e-commerce fulfillment
- **Ukuran armada:** 20–200+ kendaraan
- **Masalah utama:** SLA compliance, customer transparency, multi-customer visibility
- **Pengguna harian:** Customer service, dispatch supervisor, account manager
- **Pengambil keputusan:** Commercial Director, CEO
- **Alasan membeli:**
  - Customer portal transparency
  - SLA monitoring real-time
  - Automated proof of delivery
- **Yang ingin dilihat saat demo:**
  - Task monitoring dengan ETA dan delay prediction
  - Customer delivery proof (snapshot/dashcam)
  - On-time delivery rate report
  - Geofence arrival confirmation
- **Keberatan yang mungkin muncul:**
  - "Customer kami bisa lihat posisi kendaraan?"
  - " Bagaimana kalau ada dispute delivery?"
  - "Integrasi dengan sistem kami?"

### Kategori 4: Tim Safety dan Compliance

- **Jenis perusahaan:** Semua kategori di atas dengan fokus safety
- **Masalah utama:** Speeding driver, fatigue driving, accident investigation
- **Pengguna harian:** Safety officer, HR compliance, legal
- **Pengambil keputusan:** HSE Director, Legal Counsel
- **Alasan membeli:**
  - Bukti untuk accident investigation
  - Driver behavior monitoring
  - Regulatory compliance reporting
- **Yang ingin dilihat saat demo:**
  - Speeding event dengan lokasi dan kecepatan
  - Dashcam footage saat event
  - Driver safety score
  - Fatigue warning report
- **Keberatan yang mungkin muncul:**
  - "Apakah footage bisa jadi bukti hukum?"
  - "Bagaimana dengan privacy driver?"
  - "Apakah ada alert real-time ke supervisor?"

### Kategori 5: Management dan Finance

- **Jenis perusahaan:** Semua kategori di atas
- **Masalah utama:** ROI unclear, operational cost visibility
- **Pengguna harian:** CFO, Finance Controller, Management
- **Pengambil keputusan:** Board, Investors
- **Alasan membeli:**
  - Operational cost reduction visibility
  - Fleet utilization report
  - KPI dashboard untuk performance review
- **Yang ingin dilihat saat demo:**
  - Monthly operational summary
  - Fuel efficiency report
  - Vehicle utilization rate
  - On-time delivery performance
- **Keberatan yang mungkin muncul:**
  - "Berapa ROI-nya?"
  - "Berapa biaya per kendaraan per bulan?"
  - "Bagaimana kalau kendaraan dijual?"

---

## 2. Product Promise

### One-Sentence Product Promise

> VANGUARD membantu perusahaan melihat armada secara realtime, menemukan masalah sebelum menjadi besar, dan membuktikan kepada customer bahwa pengiriman berjalan sesuai rencana.

### Tiga Nilai Bisnis Utama

1. **Visibilitas** — Lihat seluruh armada dalam satu layar, tahu kendaraan mana yang bergerak, idle, atau butuh perhatian.

2. **Prediksi** — Dapatkan alert sebelum keterlambatan terjadi, sebelum speeding menjadi accident, sebelum fuel habis di jalan.

3. **Bukti** — Screenshot arrival, footage dashcam, dan report yang bisa digunakan untuk dispute resolution atau compliance audit.

### Tiga Kemampuan Pembeda

1. **Data freshness visible** — Selalu tampilkan kapan data terakhir diupdate, sehingga pengguna tahu apakah informasi masih relevan atau sudah stale.

2. **Exception-first UI** — Dashboard langsung tampilkan masalah yang butuh perhatian, bukan angka rata-rata yang menyamarkan.

3. **Route visualization** — Planned route vs actual route dalam satu tampilan, sehingga deviasi langsung terlihat.

### Masalah yang Tidak Diselesaikan VANGUARD pada Tahap Demo

- Optimasi route otomatis
- Driver scheduling dan dispatching otomatis
- Fuel consumption real-time calculation
- Predictive maintenance
- Integration dengan ERP/warung management
- Customer self-service portal
- Mobile app untuk driver

### Perbedaan Product Demo dan Production Deployment

| Aspek | Product Demo | Production Deployment |
|-------|--------------|---------------------|
| Data | Synthetic/mock konsisten | Real vehicle data |
| Update | Simulated refresh | WebSocket real-time |
| Actions | Demo-persistent (local state) | Backend persistence |
| Scale | 10–25 kendaraan demo | Ratusan kendaraan |
| Users | 1 demo user | Multi-user dengan role |
| Integrations | Tidak ada | GPS device, telematics, sensor |

---

## 3. Feature Registry

| Modul | Tujuan | Pengguna | Pekerjaan Utama | Kondisi Sekarang | Kondisi Demo yang Ditargetkan | Target Jangka Panjang | Prioritas Redesign |
|-------|--------|----------|---------------|-----------------|------------------------------|---------------------|-------------------|
| Dashboard | Ringkasan kondisi armada | Semua | Cek exception, buka kendaraan bermasalah | SHELL | Demo-ready | Real data dari backend | 2 |
| Realtime Monitor | Tracking kendaraan realtime | Dispatcher | Cari kendaraan, cek posisi, cek status | PARTIAL | Demo-ready | WebSocket realtime | 3 |
| Locate | Pencarian unit cepat | Dispatcher | Cari unit spesifik | SHELL | Prototype (sub-feature tracking) | Merge ke tracking | Tunda |
| Geofences | Manajemen zona virtual | Admin | Buat, edit, hapus zona | SHELL | Demo-ready | CRUD backend | 7 |
| Task Monitor | Monitoring pekerjaan pengiriman | Dispatcher | Cek task, ETA, progress | SHELL | Demo-ready | Task backend | 4 |
| Vehicles | Master data kendaraan | Admin | CRUD kendaraan | SHELL | Demo-ready | CRUD backend | 8 |
| Drivers | Master data driver | Admin | CRUD driver, safety score | SHELL | Demo-ready | CRUD backend + safety | 8 |
| History | Trip replay dan investigasi | Supervisor | Investigasi perjalanan | SHELL | Demo-ready | Real telemetry history | 5 |
| Accidents | Log insiden dan accident | Safety | Catat, review, resolve insiden | SHELL | Prototype | Full incident management | Tunda |
| Reports | Laporan operasional | Management | Generate report untuk review | SHELL | Demo-ready (mock generation) | Real report engine | 6 |
| Camera Snapshot | Bukti foto event | Safety, CS | Review snapshot arrival | SHELL | Demo-ready (placeholder) | Real image storage | Tunda |
| Dashcam Monitor | Live video kendaraan | Safety | Review footage event | SHELL | Demo-ready (placeholder) | Real video streaming | Tunda |
| Control Panel | Konfigurasi sistem | Admin | Unit config, command | SHELL | Planned | Command dispatch | Tunda |
| Settings | Preferensi user | Semua | Theme, notifikasi | SHELL | Planned | User preference backend | Tunda |

### Klasifikasi Action Buttons

| Jenis | Deskripsi | Contoh |
|-------|-----------|--------|
| **Persistent action** | Berubah di database backend nyata | Simpan kendaraan |
| **Demo-persistent action** | Berubah di local state demo, persist selama session demo | Filter/search, sort, panel toggle |
| **Operational UI action** | Mengubah UI tanpa simpan data | Tab navigation, zoom map |
| **Simulated action** | Berasa bekerja, tapi hanya visual feedback | Refresh mock, generate report mock |
| **Dead action** | Toast sukses tanpa perubahan apapun | Tombol yang tidak punya handler |

---

## 4. Sales Demo Story

### Durasi: 10 Menit

Alur demo adalah **satu cerita**, bukan tur 14 halaman. Presenter berperan sebagai dispatcher yang sedang memantau operasi pagi hari.

### Langkah 1: Buka Aplikasi — Dashboard (1 menit)

**Halaman:** Dashboard

**Tindakan presenter:**
- Buka VANGUARD, tampilkan Dashboard
- Jelaskan: "Ini adalah control tower armada kami. 25 unit aktif, 12 sedang bergerak."

**Informasi yang tampil:**
- KPI cards: Total, Driving, Idle, Offline
- Status distribution bar
- Mini fleet map
- Exception list (offline, delayed, low fuel, speeding)

**Nilai bisnis dijelaskan:**
- "Dalam 1 menit, saya sudah tahu ada 3 unit butuh perhatian"
- "Tanpa sistem ini, saya harus telepon satu-satu"

**Demo data yang dibutuhkan:**
- MOCK_STATS dengan distribusi realistis
- 2-3 unit offline (termasuk 1 offline > 1 jam)
- 1 unit delayed (> 30 menit tanpa update)
- 1 unit low fuel (< 20%)
- 1 unit speeding (terbaru)

**Transisi ke langkah berikutnya:**
Klik salah satu exception → buka Realtime Monitor dengan kendaraan tersebut difocus.

---

### Langkah 2: Fokus ke Kendaraan Bermasalah (1 menit)

**Halaman:** Realtime Monitor

**Tindakan presenter:**
- Map otomatis zoom ke kendaraan
- Panel detail tampil di kanan
- Jelaskan: "Ini posisi terakhir B 1234 KJT. Driver: Ahmad Sudirman. Speed: 0. Status: OFFLINE."

**Informasi yang tampil:**
- Marker kendaraan di map
- Detail panel: plat, driver, status, speed, heading, last update
- Map controls: zoom, layer toggle

**Nilai bisnis dijelaskan:**
- "Saya bisa lihat kendaraan offline — berarti GPS tidak mengirim data"
- "Last update 47 menit lalu — data sudah tidak fresh"

**Demo data yang dibutuhkan:**
- 1 kendaraan dengan status offline > 30 menit
- Koordinat di area operasional

**Transisi ke langkah berikutnya:**
Klik unit kedua yang statusnya DELAYED → tampilkan panel detail dengan GPS delayed warning.

---

### Langkah 3: Cek Kualitas Data GPS (1 menit)

**Halaman:** Realtime Monitor (panel detail)

**Tindakan presenter:**
- Tunjukkan panel detail kendaraan delayed
- Jelaskan field-field data freshness

**Informasi yang tampil:**
- Last update timestamp
- GPS signal indicator
- Heading dan speed terkini
- Fuel level

**Nilai bisnis dijelaskan:**
- "Data GPS fresh adalah dasar visibility. Kalau data terlambat, decision kita salah."
- "Indicator delayed membantu saya tanya driver: apakah masih di jalan?"

**Transisi ke langkah berikutnya:**
Klik tab Task Monitor di sidebar → goto Tasks.

---

### Langkah 4: Lihat Task dan ETA (1.5 menit)

**Halaman:** Task Monitor

**Tindakan presenter:**
- Tampilkan daftar task dengan filter Progress
- Pilih task yang diprediksi terlambat

**Informasi yang tampil:**
- Vehicle, Driver, Group
- Task name (origin → destination)
- Status: Progress / Unloading / Waiting
- ETA dan distance remaining
- Progress bar

**Nilai bisnis dijelaskan:**
- "Task PLI-Depok ETA 18:45. Sekarang jam 18:30. Masih on track."
- "Task BDG-Bekasi ETA 16:00. Sekarang jam 16:15. Akan saya cek."

**Demo data yang dibutuhkan:**
- 3 task Progress
- 1 task Progress dengan ETA sudah lewat (prediksi terlambat)
- 1 task Unloading

**Transisi ke langkah berikutnya:**
Double-click row task terlambat → map fokus ke kendaraan dengan route visualization.

---

### Langkah 5: Bandingkan Planned vs Actual Route (2 menit)

**Halaman:** Task Monitor (map view dengan route)

**Tindakan presenter:**
- Tunjukkan actual route (garis hijau solid)
- Tunjukkan planned route (garis abu-abu putus-putus)
- Highlight deviation point

**Informasi yang tampil:**
- Origin marker (hijau)
- Destination marker
- Actual route dengan animasi draw-on
- Planned route (alternate path)
- Deviation point marker

**Nilai bisnis dijelaskan:**
- "Hijau adalah route yang sudah dilalui. Abu-abu adalah route yang seharusnya."
- "Ada deviasi di sini — driver mengambil jalan alternate. Apakah sesuai SOP?"
- "Ini penting untuk customer yang minta tracking: apakah driver di route yang benar?"

**Demo data yang dibutuhkan:**
- 1 kendaraan dengan actual route yang berbeda dari planned
- 1 deviation point dengan timestamp

**Transisi ke langkah berikutnya:**
Klik tab Speeding Events di panel kanan → tampilkan alert speeding event.

---

### Langkah 6: Review Safety Event (1.5 menit)

**Halaman:** Task Monitor (detail panel) atau Popup Alert

**Tindakan presenter:**
- Tunjukkan speeding event notification
- Jelaskan: kecepatan, lokasi, waktu

**Informasi yang tampil:**
- Speeding alert: "B 5678 TGP — 82 km/h di Jl. Tol Dalam Kota"
- Timestamp
- Map marker di lokasi speeding

**Nilai bisnis dijelaskan:**
- "Speeding adalah faktor risiko accident terbesar"
- "Dengan VANGUARD, saya tahu persis kapan dan di mana speeding terjadi"
- "Ini bisa jadi dasar untuk coaching driver"

**Demo data yang dibutuhkan:**
- 1 speeding event dengan detail lengkap
- Kecepatan di atas threshold (80+ km/j)
- Lokasi spesifik

**Transisi ke langkah berikutnya:**
Klik "Lihat Evidence" → goto Snapshots atau Dashcam.

---

### Langkah 7: Review Evidence (1 menit)

**Halaman:** Camera Snapshot

**Tindakan presenter:**
- Tampilkan gallery snapshot
- Filter: speeding event
- Pilih snapshot relevant

**Informasi yang tampil:**
- Thumbnail snapshot
- Timestamp
- Location
- Event type
- Vehicle dan driver

**Nilai bisnis dijelaskan:**
- "Ini bukti visual saat speeding terjadi"
- "Kalau ada accident, dashcam footage jadi bukti penting"
- "Customer juga bisa minta bukti arrival — snapshot ini bisa dikasih ke mereka"

**Demo data yang dibutuhkan:**
- 3-5 snapshot dengan event types berbeda
- 1 snapshot speeding
- 1 snapshot arrival

**Transisi ke langkah berikutnya:**
Klik History di sidebar → buka trip history.

---

### Langkah 8: Investigasi Perjalanan Sebelumnya (1 menit)

**Halaman:** Trip History

**Tindakan presenter:**
- Pilih kendaraan yang baru di-track
- Tampilkan playback controls

**Informasi yang tampil:**
- Route visualization
- Timeline events
- Speed profile
- Stop/idle segments

**Nilai bisnis dijelaskan:**
- "Kalau ada dispute, saya bisa lihat perjalanan lengkap kendaraan"
- "Berapa lama berhenti di sini? Apakah sesuai SOP?"

**Demo data yang dibutuhkan:**
- 1 kendaraan dengan replay data lengkap
- Mix event types: start, stop, speeding, geofence

**Transisi ke langkah berikutnya:**
Klik Reports di sidebar → buka report center.

---

### Langkah 9: Generate Report untuk Management (1 menit)

**Halaman:** Reports

**Tindakan presenter:**
- Buka katalog report
- Pilih: Speeding Report
- Generate untuk periode demo

**Informasi yang tampil:**
- Katalog report types
- Generate form
- Report history dengan status

**Nilai bisnis dijelaskan:**
- "Report ini untuk management: ada berapa speeding event minggu ini?"
- "Report bisa di-export PDF atau Excel"
- "Automated schedule report: kirim ke email management setiap Senin pagi"

**Demo data yang dibutuhkan:**
- Report types dengan categories
- 1 report history item

**Transisi ke langkah berikutnya:**
Selesai. Kembali ke Dashboard untuk penutup.

---

### Langkah 10: Penutup (30 detik)

**Halaman:** Dashboard

**Tindakan presenter:**
- Kembali ke Dashboard
- Tunjukkan ringkasan demo

**Nilai bisnis dijelaskan:**
- "Dalam 10 menit, kita sudah bahas monitoring, task, safety, evidence, dan report."
- "Semua dalam satu workspace."
- "Questions?"

---

## 5. Synthetic Demo Scenarios

Lima skenario ini menggunakan data konsisten di seluruh halaman. Satu kendaraan harus punya data yang sama di setiap halaman.

### Skenario 1: GPS Offline > 1 Jam

| Field | Value |
|-------|-------|
| **Vehicle** | B 1234 KJT |
| **Driver** | Ahmad Sudirman |
| **Group** | CDDL BEKASI |
| **Task** | PLI-Depok |
| **Location** | -6.4023, 106.7947 (Depok) |
| **Last GPS Update** | 1 jam 15 menit lalu |
| **Current Status** | OFFLINE |
| **Fuel Level** | 72% |
| **Severity** | HIGH — GPS tidak mengirim data |
| **Related Evidence** | Tidak ada (offline) |
| **History Events** | Speeding event jam 08:15, Stop jam 09:30 |
| **Resolution State** | Belum resolved |

### Skenario 2: Overspeed di Area Publik

| Field | Value |
|-------|-------|
| **Vehicle** | B 5678 TGP |
| **Driver** | Budi Santoso |
| **Group** | CDE BEKASI |
| **Task** | TNF-Bekasi |
| **Location** | -6.1750, 106.8500 (Jl. Tol Dalam Kota KM 15) |
| **Speeding Timestamp** | 2026-06-20 14:35:22 |
| **Speed Recorded** | 87 km/j |
| **Speed Limit** | 60 km/j (area publik) |
| **Overspeed Delta** | +27 km/j |
| **Current Status** | DRIVING |
| **Severity** | HIGH |
| **Related Evidence** | Snapshot #2 (Camera Snapshot page) |
| **History Events** | Speeding event di lokasi yang sama jam 08:15 |
| **Resolution State** | Open — perlu follow-up |

### Skenario 3: Task Predicted Late

| Field | Value |
|-------|-------|
| **Vehicle** | B 9012 XYZ |
| **Driver** | Cahyo Wibowo |
| **Group** | FULL BOX BEKASI |
| **Task Name** | CIK-Kediri |
| **Task Ref** | 5410295525 |
| **Origin** | Cikarang Warehouse |
| **Destination** | Kediri Distribution Center |
| **Schedule Start** | 06:00 |
| **Schedule End** | 16:00 |
| **Distance Total** | 450 km |
| **Distance Traveled** | 280 km |
| **Current ETA** | 17:30 |
| **Delay Prediction** | 90 menit |
| **Status** | Progress |
| **Last Location** | -7.2000, 111.5000 (Jalan Pantura) |
| **Severity** | MEDIUM |
| **Root Cause** | Traffic di jalan pantura |
| **Resolution State** | Open — monitor |

### Skenario 4: Unloading Terlalu Lama

| Field | Value |
|-------|-------|
| **Vehicle** | L 7890 DEF |
| **Driver** | Eko Prasetyo |
| **Group** | FULL BOX PALEMBANG |
| **Task Name** | KLN-Surabaya |
| **Destination** | Surabaya DC |
| **Arrival Time** | 2026-06-20 14:15 |
| **Current Time** | 16:45 |
| **Unloading Duration** | 2 jam 30 menit |
| **Expected Unload Time** | 1 jam |
| **Status** | Unloading |
| **Location** | -7.2500, 112.7500 (Surabaya DC) |
| **Severity** | MEDIUM |
| **Root Cause** | Unknown — perlu dicek |
| **Resolution State** | Open |

### Skenario 5: Route Deviation

| Field | Value |
|-------|-------|
| **Vehicle** | H 2345 GHI |
| **Driver** | Fajar Ramadhan |
| **Group** | CDDL BEKASI |
| **Task Name** | TSM-BGR |
| **Planned Route** | Via Tol Cipularang |
| **Actual Route** | Via jalan arteri Bandung |
| **Deviation Point** | -6.7320, 108.5523 |
| **Deviation Time** | 2026-06-20 10:22:15 |
| **Deviation Distance** | 8 km dari route |
| **Reason (suspected)** | Kemacetan di tol |
| **Status** | Progress |
| **Severity** | LOW |
| **Resolution State** | Noted — tidak perlu action |

---

## 6. UX Principles

### P1: Cepat Dipahami

**Prinsip:** Pengguna baru harus bisa memahami kondisi armada dalam 30 detik pertama tanpa membaca manual.

**Contoh perilaku nyata:**
- Dashboard tampilkan KPI cards besar di atas fold
- Status kendaraan pakai kombinasi warna, ikon, dan label — bukan hanya warna
- Halaman utama tanpa interstitial atau onboarding screens

### P2: Ruang Kerja Luas

**Prinsip:** Maksimalkan ruang untuk data operasional. Map dan table harus sebesar mungkin.

**Contoh perilaku nyata:**
- Sidebar collapsible, default expanded
- Map pages tanpa page padding
- Table width full available, scrollable horizontally
- Toolbar di-header, tidak ambil ruang konten

### P3: Progressive Disclosure

**Prinsip:** Tampilkan ringkasan dulu, detail bisa di-expand. Jangan tampilkan semua informasi sekaligus.

**Contoh perilaku nyata:**
- Dashboard: exception list 3 teratas, klik untuk lihat semua
- Task Monitor: table view default, map on-demand
- Vehicle detail: panel collapsed default, expand on click

### P4: Exception-First

**Prinsip:** Tampilkan masalah yang butuh perhatian di atas, sebelum data normal.

**Contoh perilaku nyata:**
- Dashboard: attention section sebelum status distribution
- Alert badge di sidebar notification
- Offline/delayed vehicles muncul di atas list

### P5: Context Preservation

**Prinsip:** Navigasi antar halaman tidak kehilangan konteks. Jika saya fokus ke kendaraan A, klik History harus show History kendaraan A.

**Contoh perilaku nyata:**
- URL params untuk preserve selected vehicle: /history?vehicle=B+1234+KJT
- State management tidak reset saat navigate
- Breadcrumb untuk orientasi

### P6: Visible Data Confidence

**Prinsip:** Pengguna harus tahu kapan data terakhir diupdate dan apakah masih fresh.

**Contoh perilaku nyata:**
- Timestamp "Last update: 2 menit lalu" di setiap panel
- Indicator delayed saat update > 30 menit
- Visual indicator stale data (warna, opacity)
- GPS signal strength indicator

### P7: Role-Aware Information

**Prinsip:** Informasi yang tampil disesuaikan dengan peran pengguna.

**Contoh perilaku nyata:**
- Dispatcher: task monitor, realtime map
- Safety: speeding events, dashcam
- Management: reports, summary dashboards
- Admin: vehicles, drivers, geofences

### P8: Keyboard dan Mouse Friendly

**Prinsip:** Semua aksi bisa dilakukan dengan keyboard. Mouse untuk power users.

**Contoh perilaku nyata:**
- Tab navigation untuk table rows
- Enter untuk select
- Cmd+K untuk command palette
- Double-click row untuk open on map
- Ctrl+K untuk quick search global

### P9: Pengguna dengan Kemampuan Teknis Berbeda

**Prinsip:** UI harus bisa digunakan oleh dispatcher yang tidak teknis, maupun IT admin yang teknis.

**Contoh perilaku nyata:**
- Tooltip untuk istilah teknis
- Inline help di form fields
- Command palette untuk advanced users
- Simple mode vs advanced toggle

### P10: State Management yang Jelas

**Prinsip:** Loading, empty, stale, offline, dan error state punya UI yang berbeda dan helpful.

**Contoh perilaku nyata:**
- Loading: skeleton shimmer, bukan spinner
- Empty: ilustrasi + teks + CTA, bukan "No data"
- Stale: banner warning "Data belum diupdate — koneksi lambat"
- Offline: mode degraded, tampilkan last-known data
- Error: inline error message dengan retry action

---

## 7. Anti-AI-Slop Rules

### General Layout Rules

1. **Jangan pakai card jika spacing atau divider cukup** — Card menambah visual noise. Gunakan hanya saat benar-benar butuh elevation atau grouping.

2. **Maksimal dua surface utama per layar** — Background canvas + satu surface utama (map atau table). Panel overlay tidak termasuk.

3. **Shadow hanya untuk overlay** — Modal, panel slide-in, dropdown. Tidak untuk cards dalam flow utama.

4. **Pill hanya untuk status dan active filter** — Bukan decorative element.

5. **Uppercase sangat terbatas** — Hanya untuk label metrik (total, driving, idle). Bukan untuk navigation items.

6. **Teks operasional minimum 14px** — 12px untuk metadata atau timestamps saja.

### Map Page Rules

7. **Map page tanpa page padding** — Full bleed. Toolbar di atas map, tidak di samping.

8. **Jangan tampilkan seluruh informasi sekaligus** — Panel detail overlay, collapsed default.

9. **Jangan gunakan glow sebagai identitas** — Glow hanya untuk status live animation, bukan decorative.

10. **Jangan pakai gradient dekoratif** — Background maps sudah punya texture. Jangan tambah gradient di atasnya.

### Data Display Rules

11. **Jangan membuat semua halaman memakai struktur yang sama** — Dashboard grid, Map full-bleed, Table scrollable. Struktur mengikuti use case.

12. **Jangan tampilkan statistik tanpa periode atau tindakan** — "12 driving" tanpa konteks waktu tidak helpful. Tambah "12 driving" + "2 baru dalam 30 menit" + [Action: lihat detail].

13. **Satu primary action per context** — Tabel: export. Form: save. Tidak ada 3 primary buttons di satu section.

14. **Icon harus punya fungsi** — Icon sebagai decorative element meningkatkan cognitive load. Icon harus punya tooltip atau menggantikan text.

### Animation Rules

15. **Animasi hanya menjelaskan perubahan state** — Marker bergerak menjelaskan posisi berubah. KPI count-up menjelaskan angka baru. Tidak ada animasi untuk hal statis.

### Checklist Evaluasi Anti-AI-Slop

```
[ ] Apakah card ini menambah elevation value atau hanya menambah noise?
[ ] Apakah shadow ini untuk overlay atau decorative?
[ ] Apakah pill ini untuk status atau decorative?
[ ] Apakah teks ini 14px+ untuk readability?
[ ] Apakah map page full-bleed?
[ ] Apakah informasi berlebih di satu screen?
[ ] Apakah gradient ini dekoratif?
[ ] Apakah setiap halaman punya struktur berbeda?
[ ] Apakah statistik punya konteks?
[ ] Apakah ada primary action yang jelas?
[ ] Apakah icon punya fungsi?
[ ] Apakah animasi menjelaskan state change?
```

---

## 8. Sales-Ready Definition

### Functional Criteria

- [x] Demo flow selesai tanpa dead end — setiap langkah punya next step
- [x] Data konsisten lintas halaman — kendaraan yang dipilih di tracking muncul di history dan reports
- [x] Tidak ada toast keberhasilan palsu dalam demo flow — kecuali yang memang simulated action
- [x] Filter dan search bekerja di semua table dan list
- [x] Map dan table selection sinkron
- [x] Report demo menghasilkan file (bisa mock PDF/CSV placeholder)

### Visual Criteria

- [ ] Semua halaman konsisten dengan design system
- [ ] Layout berfungsi di 1366x768, 1440x900, 1920x1080
- [ ] Interaksi utama tidak terasa lag (smooth scroll, responsive clicks)
- [ ] Loading state terlihat profesional (skeleton bukan spinner)
- [ ] Empty state informatif (ada ilustrasi dan teks, bukan blank screen)
- [ ] Error state actionable (ada retry button)

### Content Criteria

- [x] Synthetic data dinyatakan dengan jujur dengan satu workspace chip global
- [ ] Tidak ada dead buttons dalam demo flow utama
- [ ] Semua placeholder images menggunakan ilustrasi yang tidak menyesatkan
- [ ] Text tidak Lorem ipsum

### Technical Criteria

- [x] Seluruh Open Decisions sudah terkunci
- [ ] No hardcoded fleet count berbeda dari 25 kendaraan
- [ ] MapLibre GL sebagai satu-satunya map engine
- [ ] LocalStorage dengan schema version dan reset mechanism
- [ ] Grayscale/neutral baseline sebelum dark mode

### Accessibility Criteria

- [ ] Color contrast WCAG AA minimum
- [ ] Keyboard navigation berfungsi untuk semua interactive elements
- [ ] Screen reader bisa baca informasi utama
- [ ] Focus visible di semua interactive elements
- [ ] Font size minimum 14px untuk body text

---

## 9. Redesign Priorities

### Prioritas 1: Information Architecture dan App Shell

**Durasi:** Sebelum semua redesign lainnya

**Pekerjaan:**
- Audit navigation structure (14 pages → perlu grouping)
- Tentukan page priority untuk demo
- Setup design tokens
- Baseline component library
- App shell responsive behavior

**Dependency:** Tidak ada

---

### Prioritas 2: Dashboard Redesign

**Durasi:** 2–3 hari

**Pekerjaan:**
- KPI cards dengan data binding
- Exception list dengan priority sorting
- Status distribution visualization
- Mini fleet map integration
- Responsive behavior

**Dependency:** App shell harus selesai

---

### Prioritas 3: Realtime Monitor Redesign

**Durasi:** 4–6 hari

**Pekerjaan:**
- Map dengan full-bleed layout
- Vehicle markers dengan status + heading
- Route visualization (planned vs actual)
- Vehicle list sidebar
- Detail panel with data freshness
- Speeding alert popup

**Dependency:** Dashboard selesai

---

### Prioritas 4: Task Monitor Redesign

**Durasi:** 3–4 hari

**Pekerjaan:**
- Table view dengan sorting dan filtering
- Map view dengan task overlay
- Task detail panel
- ETA and delay prediction
- Timeline visualization

**Dependency:** Realtime Monitor selesai

---

### Prioritas 5: Trip History Redesign

**Durasi:** 3–4 hari

**Pekerjaan:**
- Telemetry replay map
- Playback controls
- Event timeline
- Export CSV functionality

**Dependency:** Task Monitor selesai

---

### Prioritas 6: Reports Center Redesign

**Durasi:** 2–3 hari

**Pekerjaan:**
- Report catalog dengan categories
- Generate form
- Report history
- Mock PDF/CSV generation

**Dependency:** Task Monitor selesai

---

### Prioritas 7: Geofences Redesign

**Durasi:** 2–3 hari

**Pekerjaan:**
- Zone CRUD panel
- Map visualization
- Zone toggle controls

**Dependency:** Realtime Monitor selesai

---

### Prioritas 8: Vehicle dan Driver Registry

**Durasi:** 3–4 hari

**Pekerjaan:**
- Vehicle CRUD form
- Driver CRUD form
- Table dengan sorting dan filtering
- Safety score display

**Dependency:** Reports selesai

---

### Prioritas 9: Administration dan Settings

**Durasi:** 2–3 hari

**Pekerjaan:**
- User preferences
- Integration settings
- Theme toggle

**Dependency:** Vehicle selesai

---

### Prioritas 10: Advanced Features (Tunda)

- Accident Log
- Camera Snapshot
- Dashcam Monitor
- Control Panel

---

## 10. Open Decisions

### OD1: Locate digabung atau dihapus?

**Keputusan final:**

- fungsi Locate digabung ke global search dan Realtime Monitor;
- route `/locate` tidak langsung dihapus;
- selama masa transisi, `/locate` dapat mengarahkan pengguna ke Tracking dengan search mode terbuka.

**Alasannya:** Mencari unit adalah tindakan, bukan area produk yang membutuhkan halaman utama sendiri.

---

### OD2: Data freshness bagaimana ditampilkan?

**Keputusan final:** Hybrid — dua lapisan:

1. **Global:** `Fleet data updated 8s ago` — ambient awareness untuk seluruh workspace
2. **Per-unit:** Badge hanya untuk kondisi kritis:
   - `Live` — data fresh
   - `42s ago` — normal, cukup waktu kecil
   - `Stale 18m` — perlu perhatian
   - `Offline 1h` — prioritas tinggi

**Aturan:** Jangan tampilkan badge freshness pada setiap row jika datanya masih live. Untuk kondisi normal cukup tampilkan waktu relatif; badge digunakan untuk stale dan offline.

---

### OD3: Label demo bagaimana ditampilkan?

**Keputusan final:** Satu workspace chip global:

```
VANGUARD / Demo Workspace
```

Klik chip membuka keterangan:

```
This environment uses synthetic fleet data for product demonstration.
```

**Aturan:** Cukup satu indikator global. Jangan mengulang `DEMO` pada setiap halaman. Tidak ada watermark pada map — watermark merusak tampilannya saat presentasi.

---

### OD4: Dark mode atau light mode dulu?

**Keputusan final:** Jangan mengunci dark mode sekarang.

Saat grayscale, tema belum boleh menjadi keputusan utama. Urutan:

1. Desain neutral/light sebagai baseline keterbacaan
2. Turunkan token yang sama ke operational dark
3. Uji keduanya
4. Mode pengguna dapat disimpan

**Alasan:** Light mode lebih aman untuk:
- Berbagai usia pengguna
- Ruangan kantor terang
- Proyektor
- Sales presentation
- Keterbacaan tabel panjang

Dark mode tetap penting untuk control room, tetapi tidak boleh menjadi alasan menghidupkan kembali "Graphite Command" aesthetic.

---

### OD5: Berapa kendaraan demo yang ditampilkan?

**Keputusan final:** 25 kendaraan, konsisten di seluruh produk.

Seluruh teks hardcoded yang berbeda (misalnya "103 units") harus dihapus ketika implementasi dimulai.

Jangan tampilkan 25 row sekaligus — gunakan clustering, grouping, dan filter untuk memberi kesan skala tanpa overwhelming.

---

### OD6: Map provider apa yang digunakan?

**Keputusan final:** MapLibre GL — bukan Leaflet.

Project sudah memiliki implementasi MapLibre yang cukup luas:
- Marker dengan heading rotation
- Route visualization (planned vs actual)
- Geofence circle/polygon
- Clustering
- Satellite layer
- Selection highlight
- Pitch dan bearing 3D
- Trip replay map

Kembali ke Leaflet akan:
- Membuang implementasi yang sudah ada
- Menambah pekerjaan migrasi
- Mempertahankan dua map library
- Menghasilkan perilaku map yang berbeda antar halaman

**MapLibre GL adalah satu-satunya map engine VANGUARD. Leaflet dan React-Leaflet dihapus setelah memastikan tidak lagi digunakan.**

---

### OD7: Demo data persistence bagaimana?

**Keputusan final:** LocalStorage versioned + Reset mechanism.

Struktur:

```
vanguard-demo:v1:state     — demo actions (filter, selection, task updates)
vanguard-demo:v1:preferences — user preferences (theme, density)
vanguard-demo:v1:activity  — recent searches, visited pages
```

Komponen:

1. **Schema version** — `v1` prefix untuk future migration
2. **Initial dataset immutable** — seed tidak pernah ditimpa, hanya di-clone ke state
3. **Reset Demo button** — kembalikan ke initial state, presenter dapat prepare sebelum demo
4. **Demo actions terpisah** — tidak contaminate initial seed
5. **Fallback if corrupted** — auto-reset jika JSON parse gagal

Presenter harus dapat mengembalikan kondisi awal sebelum demo dimulai.
