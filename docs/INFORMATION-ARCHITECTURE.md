# VANGUARD — Information Architecture

**Tanggal:** 2026-08-04
**Status:** Draft untuk review
**Tujuan:** Struktur produk VANGUARD untuk sales demo dan development

---

## 1. Domain Map

### Overview

**Tujuan:** Memberikan visibility cepat kondisi armada keseluruhan.

**Pengguna utama:** Semua role — dispatcher, supervisor, safety, management

**Entity utama:** Fleet, Exception, Alert

**Keputusan yang dibuat pengguna:**
- Apakah armada dalam kondisi normal?
- Kendaraan mana yang butuh perhatian?
- Buka halaman mana untuk investigate?

**Halaman dan fitur:**
- Dashboard (landing page)
- Exception monitor
- Quick actions

**Data yang dibutuhkan:**
- Fleet stats (total, driving, idle, stopped, offline)
- Exception list (prioritas tinggi ke rendah)
- Recent activity

**Hubungan dengan domain lain:**
- Link ke Realtime Monitor untuk exception yang dipilih
- Link ke Safety untuk alert kritis
- Link ke Reports untuk trend

---

### Live Operations

**Tujuan:** Monitoring kendaraan secara realtime dengan map.

**Pengguna utama:** Dispatcher, operations supervisor

**Entity utama:** Vehicle, Driver, Location, Geofence

**Keputusan yang dibuat pengguna:**
- Di mana kendaraan X sekarang?
- Apakah kendaraan sudah di route yang benar?
- Apakah ada kendaraan offline atau delayed?
- Fokus ke kendaraan tertentu

**Halaman dan fitur:**
- Realtime Monitor (tracking)
- Global Search (integrated)
- Geofence overlay

**Data yang dibutuhkan:**
- Vehicle positions (lat, lng, heading, speed)
- Driver assignments
- Geofence boundaries
- Task context

**Hubungan dengan domain lain:**
- Task context dari Operations
- Alert dari Safety
- Vehicle operational context dari dispatcher workflow
- Geofences visible di map untuk arrival, zone, checkpoint

---

### Transport Operations

**Tujuan:** Memantau pekerjaan pengiriman dan trip.

**Pengguna utama:** Dispatcher, operations supervisor, customer service

**Entity utama:** Task, Trip, Route, Stop

**Keputusan yang dibuat pengguna:**
- Task mana yang on track?
- Task mana yang akan terlambat?
- Di mana kendaraan sekarang relatif ke destination?
- Sudah sampai atau belum?

**Halaman dan fitur:**
- Task Monitor
- Trip History
- Vehicle detail
- Driver detail

**Data yang dibutuhkan:**
- Task list dengan status dan ETA
- Planned route vs actual route
- Origin dan destination
- Trip history

**Hubungan dengan domain lain:**
- Vehicle dari Live Operations
- Driver dari Administration
- Evidence dari Safety

---

### Safety dan Evidence

**Tujuan:** Monitoring safety event dan bukti visual.

**Pengguna utama:** Safety officer, compliance, customer service

**Entity utama:** Alert, Event, Evidence, Accident

**Keputusan yang dibuat pengguna:**
- Ada speeding event apa hari ini?
- Bukti apa yang tersedia untuk dispute?
- Accident sudah resolved atau belum?

**Halaman dan fitur:**
- Safety Review (alert dashboard)
- Camera Snapshot
- Dashcam Monitor
- Accident Log

**Data yang dibutuhkan:**
- Alert events (speeding, geofence, fatigue)
- Snapshot images
- Video footage
- Accident records

**Hubungan dengan domain lain:**
- Vehicle context dari Live Operations
- Driver context dari Administration
- Trip context dari Operations

---

### Intelligence → Reports

**Tujuan:** Laporan operasional dan analisis bisnis.

**Pengguna utama:** Management, finance, operations director

**Entity utama:** Report, Metric, Trend

**Keputusan yang dibuat pengguna:**
- Bagaimana performa armada minggu ini?
- Ada berapa speeding event bulan ini?
- Utilisasi kendaraan berapa persen?
- Fuel efficiency bagaimana?

**Halaman dan fitur:**
- Reports Center
- Dashboard analytics (future)

**Data yang dibutuhkan:**
- Aggregated metrics
- Historical trends
- Comparative data

**Hubungan dengan domain lain:**
- Data dari semua domain lain
- Driver performance dari Administration
- Vehicle utilization dari Live Operations

---

### Administration

**Tujuan:** Master data management, device pairing, rules, dan konfigurasi sistem.

**Pengguna utama:** Admin transport, IT admin

**Entity utama:** Vehicle, Driver, User, Role, Device, GeofenceRule, Integration

**Keputusan yang dibuat pengguna:**
- Unit baru bagaimana daftarkan?
- Device GPS sudah pairing dengan unit mana?
- User baru dapat akses apa?
- Alert rules apa yang aktif?
- RFID driver sudah terdaftar?
- Siapa saja di pool/group mana?

**Halaman dan fitur:**
- Vehicle Registry (CRUD, pairing, group)
- Driver Registry (CRUD, RFID, SIM)
- User & Roles Management
- Device Configuration & Pairing
- Geofence Rules & Notifications
- Integration Settings
- Settings (/settings/organization)

**Data yang dibutuhkan:**
- Master data vehicles (tidak realtime, cached snapshot)
- Driver records dan assignments
- User permissions
- Geofence rules
- Integration configs

**Hubungan dengan domain lain:**
- Vehicles dan Drivers muncul di Operations untuk usage context
- Administration fokus pada data management, bukan usage

**Catatan:** Vehicles dan Drivers di Operations untuk dispatcher melihat daftar dan status. Administration untuk admin mengelola data dan pairing device. Satu entity, dua halaman dengan tujuan berbeda.

---

## 2. Entity Map

### Vehicle

**Identitas utama:** Plate number (B 1234 KJT)

**Informasi ringkas:** Status, speed, driver, last update

**Informasi detail:** Brand, model, year, odometer, fuel, GPS device, group

**Status:** Driving, Idle, Stopped, Offline, Delayed

**Hubungan:**
- Ditugaskan ke 1 Driver
- Bagian dari 1 Group
- Memiliki GPS Device
- Menjalankan N Tasks
- Menghasilkan N Events
- Menjadi subjek N Reports

**Halaman tempat muncul:**
- Dashboard (summary)
- Realtime Monitor (tracking)
- Task Monitor (context)
- History (replay)
- Safety (event source)
- Reports (metric source)
- Vehicle Registry (master)

**Canonical destination:** Dua konteks berbeda:

| Konteks | Route | Pengguna |
|---------|-------|----------|
| Operational context | `/tracking?vehicle=<plate-slug>` |Dispatcher, Supervisor — melihat posisi live |
| Record detail | `/vehicles/:id` | Admin — profil lengkap, device, service, dokumen |

**Aturan:** Klik dari Dashboard exception atau map → operational context. Klik nama dari list, inspector, report → record detail.

---

### Driver

**Identitas utama:** Nama lengkap (Ahmad Sudirman)

**Informasi ringkas:** Status, assigned vehicle, safety score

**Informasi detail:** SIM, phone, address, join date, RFID, license

**Status:** Active, Off-duty, On-leave, Inactive

**Hubungan:**
- Ditugaskan ke 0-1 Vehicle
- Memiliki N Trips
- Menjadi subjek N Safety Events
- Memiliki safety score

**Halaman tempat muncul:**
- Task Monitor (context)
- History (context)
- Safety (event source)
- Reports (metric source)
- Driver Registry (/drivers/:id)

**Canonical destination:** Driver Registry (/drivers/:id)

---

### Task

**Identitas utama:** Task name (PLI - DEPOK)

**Informasi ringkas:** Vehicle, driver, status, ETA, progress

**Informasi detail:** Task ref, origin, destination, schedule, distance

**Status:** Waiting, Assigned, Progress, Unloading, Completed

**Hubungan:**
- Ditugaskan ke 1 Vehicle
- Ditugaskan ke 1 Driver
- Memiliki N Trips
- Berasal dari 1 Origin
- Bergerak ke 1 Destination

**Halaman tempat muncul:**
- Task Monitor (/tasks)
- Realtime Monitor (context)
- History (trip source)

**Canonical destination:** Task Monitor (/tasks/:id)

---

### Alert

**Identitas utama:** Alert type + vehicle + timestamp

**Informasi ringkas:** Type, vehicle, severity, timestamp

**Informasi detail:** Location, speed, threshold, value

**Tipe:** Speeding, Geofence enter/exit, GPS delayed, Low fuel, Fatigue

**Severity:** High, Medium, Low

**Status:** Open, Acknowledged, Resolved

**Hubungan:**
- Berkaitan ke 1 Vehicle
- Berkaitan ke 1 Driver
- Bisa punya Evidence

**Halaman tempat muncul:**
- Safety Review
- Realtime Monitor (popup)
- Dashboard (exception list)
- Reports (incident source)

**Canonical destination:** Safety Review (/safety)

---

### Evidence

**Identitas utama:** Type + vehicle + timestamp

**Tipe:** Camera snapshot, Dashcam footage

**Hubungan:**
- Terkait ke 1 Vehicle
- Terkait ke 1 Alert
- Terkait ke 1 Task

**Halaman tempat muncul:**
- Camera Snapshot (/snapshots)
- Dashcam Monitor (/dashcam)
- Safety Review (context)

**Canonical destination:** Camera Snapshot (/snapshots/:id)

---

### Geofence

**Identitas utama:** Zone name

**Informasi ringkas:** Type, radius, status

**Tipe:** Depot, Customer, Port, Checkpoint

**Hubungan:**
- Diobservasi oleh N Vehicles

**Halaman tempat muncul:**
- Geofences (/geofences)
- Realtime Monitor (overlay)
- Task Monitor (overlay)

**Canonical destination:** Geofences (/geofences/:id)

---

## 3. Primary Navigation

Enam area utama:

### 1. Overview

**Icon concept:** Gauge atau dashboard

**Label:** Overview

**Default destination:** /dashboard

**Submenu:** Tidak ada (langsung ke Dashboard)

**Role yang dapat melihat:** Semua role

**Selalu terlihat:** Ya

---

### 2. Live

**Icon concept:** Radio signal atau radar

**Label:** Live

**Default destination:** /tracking

**Submenu:**
- Realtime Monitor (tracking)
- Locate (redirect ke tracking dengan search terbuka)

**Role yang dapat melihat:** Dispatcher, Supervisor, Admin

**Selalu terlihat:** Ya

**Catatan:** Locate sebagai sub-feature, bukan primary navigation terpisah

---

### 3. Operations

**Icon concept:** Clipboard atau route

**Label:** Operations

**Default destination:** /tasks

**Submenu:**
- Task Monitor
- Trip History
- Vehicles
- Drivers
- Geofences

**Role yang dapat melihat:** Dispatcher, Supervisor, Admin, CS

**Selalu terlihat:** Ya

**Catatan:** Vehicles dan Drivers di sini untuk melihat daftar, status, dan penugasan. Bukan untuk edit master data.

---

### 4. Safety

**Icon concept:** Shield atau alert triangle

**Label:** Safety

**Default destination:** /safety

**Landing content:** Unreviewed alert queue — speeding, harsh driving, fatigue, deviation, accidents

**Submenu:**
- Safety Review (/safety) — alert queue
- Accidents (/accidents) — sub-view
- Camera Snapshot (/snapshots) — evidence library
- Dashcam Monitor (/dashcam) — video monitor

**Role yang dapat melihat:** Safety, Supervisor, Admin

**Selalu terlihat:** Ya

**Catatan:** Landing Safety queue adalah alert yang belum ditinjau. Accidents adalah sub-view, bukan landing.

---

### 5. Reports

**Icon concept:** Bar chart

**Label:** Reports

**Default destination:** /reports

**Submenu:** Tidak ada (satu halaman)

**Role yang dapat melihat:** Management, Supervisor, Admin

**Selalu terlihat:** Ya

---

### 6. Administration

**Icon concept:** Settings atau sliders

**Label:** Administration

**Default destination:** /settings/organization

**Submenu:**
- Users & Roles
- Devices & Pairing
- Fleet Data (vehicles, drivers, groups)
- Rules & Notifications
- Geofence Rules
- Integrations
- Preferences (/settings)

**Role yang dapat melihat:** Admin

**Selalu terlihat:** Permission-based (tidak semua role melihat)

**Catatan:** Vehicles dan Drivers untuk dispatcher ada di Operations. Administration hanya untuk CRUD master data, pairing device, dan konfigurasi.

---

## 4. Route Mapping

| Existing route | Domain baru | Label baru | Status | Canonical destination | Tindakan transisi |
|---------------|------------|------------|--------|---------------------|-------------------|
| /dashboard | Overview | Overview | Primary | /dashboard | Landing page utama |
| /tracking | Live | Live | Primary | /tracking | Map view utama |
| /locate | Live | Locate | Redirect | /tracking?search=open | Redirect dengan search mode |
| /tasks | Operations | Task Monitor | Primary | /tasks | Tabel task utama |
| /history | Operations | Trip History | Primary | /history | Replay dan investigasi |
| /vehicles | Operations | Vehicles | Primary | /vehicles | Daftar unit dan status |
| /drivers | Operations | Drivers | Primary | /drivers | Daftar driver dan penugasan |
| /geofences | Operations | Geofences | Primary | /geofences | Zone monitoring dan visibility |
| /safety | Safety | Safety Review | Primary | /safety | Alert queue unreviewed |
| /accidents | Safety | Accidents | Secondary | /accidents | Sub-view dari Safety |
| /reports | Reports | Reports | Primary | /reports | Report center |
| /snapshots | Safety | Snapshots | Secondary | /snapshots | Evidence library |
| /dashcam | Safety | Dashcam | Secondary | /dashcam | Video monitor |
| /control | Administration | Commands | Prototype | /control | Command dispatch, permission-based |
| /settings | Administration | Settings | Primary | /settings | User preferences |
| /settings/organization | Administration | Organization | Primary | /settings/organization | Default landing Administration |

**Status definitions:**
- **Primary:** Selalu terlihat di navigation atau permission-based visible
- **Secondary:** Bisa disembunyikan atau merge ke primary
- **Prototype:** Sudah ada kode, belum production-ready
- **Redirect:** Route dipertahankan, mengarahkan ke route lain

---

## 5. Global vs Contextual Actions

### Global Actions

**Selalu terlihat di header atau global chrome:**

| Action | Lokasi | Deskripsi |
|--------|---------|-----------|
| Global Search | Header, center | Cmd+K palette untuk search semua entity |
| Workspace Chip | Header, left | VANGUARD / Demo Workspace |
| Notification | Header, right | Inbox badge |
| User Menu | Header, right | Avatar, role, logout |
| Theme Toggle | User Menu | Light/dark mode |
| Help | User Menu | Keyboard shortcut, dokumentasi |

**Alasan global:** Semua role butuh akses, tidak context-specific.

---

### Contextual Actions

**Hanya terlihat saat context aktif:**

| Action | Lokasi | Context diperlukan | Deskripsi |
|--------|---------|-------------------|-----------|
| Map Layers | Map toolbar | Map page | Toggle track, geofence, satellite |
| Show Track | Map toolbar | Map page | Toggle route visualization |
| Cluster | Map toolbar | Map page | Toggle vehicle clustering |
| Customize Columns | Table header | Table page | Pilh kolom visible |
| Export | Table/Detail footer | Entity selected | Download data |
| Zoom to Fit | Map toolbar | Vehicle selected | Fit map ke selected vehicle |
| Filter Status | Table header | Table page | Filter by status |
| Add Task | Task toolbar | Task page | Form create task |
| Generate Report | Report header | Report page | Form generate report |
| View on Map | List item | Entity selected | Buka map dengan focus |
| View History | Vehicle detail | Vehicle selected | Buka trip history |
| View Evidence | Safety event | Alert selected | Buka snapshot/dashcam |
| Start/End Trip | Task detail | Task selected | Timeline controls |
| Edit | Detail panel | Entity selected | Form edit entity |
| Delete | Detail panel | Entity selected | Confirmation dialog |

**Alasan contextual:** Tidak semua pengguna butuh semua action. Context mengaktifkan action.

---

### Action yang Tidak Masuk Header

**Map controls:** Toolbar di atas map, bukan global header

**Table sorting:** Column header, bukan toolbar terpisah

**Panel navigation:** Breadcrumb atau back button, bukan global

**Admin actions:** Permissions-based, bukan selalu terlihat

---

## 6. Global Search Architecture

### Scope

Global search mendukung:

| Scope | Entity | Hasil ringkas |
|-------|---------|---------------|
| All | Semua | Aggregated results |
| Vehicle | Vehicle | Plate, driver, status |
| Driver | Driver | Nama, SIM, vehicle |
| Task | Task | Task name, vehicle, status |
| Location | Coordinate/address | Koordinat dengan nearby vehicles |
| Geofence | Geofence | Zone name, type |

### Format Hasil

```
[B] B 5678 TGP
    Hino Colt Diesel FE 74 HD — Budi Santoso
    ● Driving · 82 km/j · Updated 1m ago

[Driver] Budi Santoso
    SIM B2 2345-6789-0123 — Active
    Assigned to: B 5678 TGP

[Task] CIK-Kediri
    Vehicle: B 5678 TGP · Progress · ETA 17:30
```

### Metadata Minimum

- Type badge (Vehicle/Driver/Task/Location)
- Identitas utama (plate/name/task name)
- Status indicator
- Related entity (driver untuk vehicle, dll)
- Last update untuk vehicle

### Keyboard Behavior

| Key | Action |
|-----|--------|
| Cmd+K / Ctrl+K | Buka search |
| Arrow up/down | Navigate results |
| Enter | Select result |
| Esc | Close search |
| Tab | Cycle through scopes |

### Recent Searches

Tampilkan 5 search terakhir, persisted di localStorage.

### Empty State

"Tidak ada hasil untuk '{query}'. Coba gunakan plat nomor, nama driver, atau task name."

### Selected-Result Destination

Vehicle selected → Realtime Monitor dengan vehicle difokus
Driver selected → Driver detail (/drivers/:id)
Task selected → Task Monitor dengan task difokus
Location → Realtime Monitor dengan koordinat sebagai center

### Locate Function Integration

Search dengan location scope menampilkan nearby vehicles dalam radius 500m.
Ini menggantikan fungsi halaman /locate.

---

## 7. Context Preservation

### State yang Harus Dipertahankan

| State | Metode | Scope |
|-------|--------|-------|
| Selected Vehicle | URL param (plate slug) + context | Semua halaman |
| Selected Task | URL param | Operations domain |
| Selected Alert | URL param | Safety domain |
| Active Filters | URL param | Per page |
| Map Bounds | URL param | Map pages |
| Map/List Mode | URL param | Tracking, Tasks |
| Date Range | URL param | History, Reports |
| Selected Group | URL param | Per page |
| Return Destination | URL param | Detail pages |

### URL State Pattern

```
/tracking?vehicle=b5678tgp&status=driving
/tasks?vehicle=b5678tgp&status=progress
/history?vehicle=b5678tgp&date=2026-06-20
/safety?alert=speeding&vehicle=b5678tgp&date=today
```

### Contoh Flow: Dashboard ke History

```
Dashboard exception
  → Klik: B 1234 KJT (speeding)
  → URL: /tracking?vehicle=b1234kjt
  → Action: Realtime Monitor fokus ke B 1234 KJT
  → Panel: Task aktif tampil (task: PLI-Depok)

Klik: "Lihat History"
  → URL: /history?vehicle=b1234kjt
  → State: Selected vehicle b1234kjt dipertahankan
  → Display: Trip history untuk B 1234 KJT

Klik: Trip kemarin
  → URL: /history?vehicle=b1234kjt&trip=20260619
  → State: Selected trip ditambahkan
  → Display: Replay trip

Klik: Back atau Breadcrumb "History"
  → URL: /history?vehicle=b1234kjt
  → State: Selected vehicle b1234kjt masih ada
  → Display: List trip untuk B 1234 KJT
```

### State yang Di-Reset

| State | Kapan reset |
|-------|-------------|
| Selected alert | Navigasi ke halaman non-safety |
| Map zoom/pan | Tidak reset (user preference) |
| Table sort | Reset saat filter berubah |
| Panel expanded state | Reset saat navigate away |

### Return Destination

Detail pages harus punya cara kembali ke hasil sebelumnya.

Pattern: Back link atau breadcrumb dengan return context.

---

## 8. Role-Based Landing

### Dashboard Presets

Dashboard tetap satu route (/dashboard), tetapi informasi dapat di-preset berdasarkan role.

### Dispatcher

**Fokus:** Exception urgent, live fleet overview

**Widget yang diemphasize:**
1. Attention Required list (prioritas tinggi)
2. Live Fleet count
3. On-Time Rate
4. Active Tasks

**Widget yang de-emphasize:**
- Trend charts
- Long-term reports

**Landing:** Langsung ke Dashboard, exception list visible

---

### Supervisor

**Fokus:** Unresolved exception, delay, fleet performance

**Widget yang diemphasize:**
1. Exception count by type
2. Delay prediction alerts
3. On-Time Rate trend
4. Vehicle utilization

**Widget yang de-emphasize:**
- Detailed vehicle list
- Admin functions

**Landing:** Dashboard dengan filter "unresolved" aktif

---

### Safety

**Fokus:** Unreviewed event, evidence

**Widget yang diemphasize:**
1. Safety alerts (speeding, fatigue)
2. Unreviewed evidence count
3. Open accidents
4. Recent events

**Widget yang de-emphasize:**
- Task monitoring
- Route visualization

**Landing:** Redirect ke /safety (Safety Review)

---

### Admin

**Fokus:** Master data health, device status

**Widget yang diemphasize:**
1. Offline vehicles (device health)
2. Device connection status
3. Recent data sync status
4. Master data completeness

**Widget yang de-emphasize:**
- Realtime map (kecuali untuk investigate)

**Landing:** Dashboard dengan admin preset atau langsung ke /vehicles

---

### Management

**Fokus:** KPI, trend, SLA

**Widget yang diemphasize:**
1. Monthly summary
2. On-time delivery rate
3. Safety trend
4. Utilization rate

**Widget yang de-emphasize:**
- Exception detail list
- Raw vehicle table

**Landing:** Dashboard dengan date range "This Month" aktif

---

## 9. Page Responsibilities

### Dashboard

**Satu kalimat tanggung jawab:** Ringkasan kondisi armada dan exception yang butuh perhatian.

**Pertanyaan yang dijawab:**
- Berapa unit aktif, driving, idle, offline?
- Ada berapa exception yang perlu di-follow up?
- Berapa on-time rate?
- Ada aktivitas terbaru apa?

**Primary user:** Semua role

**Primary entity:** Fleet

**Primary action:** Klik exception untuk investigate

**Informasi selalu terlihat:** KPI cards, exception list, activity feed

**Informasi setelah selection:** Vehicle detail (dari exception)

**Informasi yang tidak boleh ada:** Raw data tables, form fields

---

### Realtime Monitor

**Satu kalimat tanggung jawab:** Lihat posisi kendaraan realtime dan kendalikan map.

**Pertanyaan yang dijawab:**
- Di mana kendaraan X sekarang?
- Apakah GPS masih mengirim data?
- Apakah ada kendaraan offline?
- Di mana kendaraan relatif ke route?

**Primary user:** Dispatcher, Supervisor

**Primary entity:** Vehicle, Location

**Primary action:** Klik kendaraan untuk lihat detail

**Informasi selalu terlihat:** Map dengan markers, vehicle list, count summary

**Informasi setelah selection:** Detail panel (driver, status, task, location, last update)

**Informasi yang tidak boleh ada:** Full table dengan semua columns, report forms

---

### Task Monitor

**Satu kalimat tanggung jawab:** Pantau status dan ETA task pengiriman.

**Pertanyaan yang dijawab:**
- Task mana yang on track?
- Task mana yang akan terlambat?
- ETA berapa?
- Sudah sampai destination?

**Primary user:** Dispatcher, CS

**Primary entity:** Task, Trip

**Primary action:** Klik task untuk lihat route

**Informasi selalu terlihat:** Task list dengan status dan ETA, filter options

**Informasi setelah selection:** Route map, trip detail, timeline

**Informasi yang tidak boleh ada:** Vehicle master data fields, device config

---

### Trip History

**Satu kalimat tanggung jawab:** Replay perjalanan dan investigasi perjalanan sebelumnya.

**Pertanyaan yang dijawab:**
- route apa yang dilalui kendaraan?
- Berapa lama berhenti di mana?
- Ada speeding event?
- Apakah deviate dari planned route?

**Primary user:** Supervisor, Safety

**Primary entity:** Trip, Telemetry

**Primary action:** Pilih kendaraan, play replay

**Informasi selalu terlihat:** Vehicle selector, playback controls, map dengan route

**Informasi setelah selection:** Timeline events, detail panel

**Informasi yang tidak boleh ada:** Realtime position, live tracking

---

### Safety Review

**Satu kalimat tanggung jawab:** Review alert safety dan evidence.

**Pertanyaan yang dijawab:**
- Ada speeding event apa?
- Accident sudah resolved?
- Evidence apa yang tersedia?

**Primary user:** Safety, CS

**Primary entity:** Alert, Evidence, Accident

**Primary action:** Review alert, open evidence

**Informasi selalu terlihat:** Alert list dengan severity, filter by type

**Informasi setelah selection:** Event detail, related evidence, snapshot/dashcam player

**Informasi yang tidak boleh ada:** Vehicle master data, admin functions

---

### Reports

**Satu kalimat tanggung jawab:** Generate dan export laporan operasional.

**Pertanyaan yang dijawab:**
- Ada berapa speeding event minggu ini?
- Fuel efficiency bagaimana?
- On-time rate bulan ini?

**Primary user:** Management, Supervisor

**Primary entity:** Report

**Primary action:** Generate report, download

**Informasi selalu terlihat:** Report catalog, recent reports

**Informasi setelah selection:** Generate form, preview

**Informasi yang tidak boleh ada:** Realtime tracking, raw vehicle data

---

### Vehicle Registry

**Satu kalimat tanggung jawab:** Master data kendaraan dan aset armada.

**Pertanyaan yang dijawab:**
- Kendaraan apa saja yang terdaftar?
- Siapa driver yang ditugaskan?
- Kapan service berikutnya?

**Primary user:** Admin

**Primary entity:** Vehicle

**Primary action:** CRUD vehicle

**Informasi selalu terlihat:** Vehicle table dengan key columns

**Informasi setelah selection:** Full vehicle detail, edit form

**Informasi yang tidak boleh ada:** Realtime position (itu di Live), live alerts

---

### Driver Registry

**Satu kalimat tanggung jawab:** Master data driver dan penugasan.

**Pertanyaan yang dijawab:**
- Driver siapa saja yang aktif?
- Siapa driver kendaraan X?
- Safety score berapa?

**Primary user:** Admin

**Primary entity:** Driver

**Primary action:** CRUD driver

**Informasi selalu terlihat:** Driver table dengan key columns

**Informasi setelah selection:** Full driver detail, edit form

**Informasi yang tidak boleh ada:** Realtime tracking, live alerts

---

### Geofences

**Satu kalimat tanggung jawab:** Manajemen zone virtual dan monitoring enter/exit.

**Pertanyaan yang dijawab:**
- Zone mana yang ada?
- Kendaraan mana yang masuk zone?
- Berapa lama di zone?

**Primary user:** Admin

**Primary entity:** Geofence

**Primary action:** CRUD geofence, toggle visibility

**Informasi selalu terlihat:** Zone list, map overlay

**Informasi setelah selection:** Zone detail, edit form

**Informasi yang tidak boleh ada:** Vehicle master data

---

### Accidents

**Satu kalimat tanggung jawab:** Log dan management accident/insiden.

**Pertanyaan yang dijawab:**
- Ada accident apa?
- Status resolution apa?
- Bukti apa yang ada?

**Primary user:** Safety

**Primary entity:** Accident

**Primary action:** Review accident, update status

**Informasi selalu terlihat:** Accident list dengan severity dan status

**Informasi setelah selection:** Detail incident, evidence, timeline

**Informasi yang tidak boleh ada:** Realtime map, live tracking

---

### Camera Snapshot

**Satu kalimat tanggung jawab:** Gallery bukti foto dari camera kendaraan.

**Pertanyaan yang dijawab:**
- Snapshot apa yang ada?
- Kapan dan di mana diambil?
- Bukti apa untuk event tertentu?

**Primary user:** Safety, CS

**Primary entity:** Snapshot

**Primary action:** Browse, filter, download

**Informasi selalu terlihat:** Gallery grid dengan thumbnails

**Informasi setelah selection:** Full image, metadata, download

**Informasi yang tidak boleh ada:** Vehicle CRUD, admin functions

---

### Dashcam

**Satu kalimat tanggung jawab:** Monitor dan review video dari dashcam kendaraan.

**Pertanyaan yang dijawab:**
- Camera status apa?
- Video apa yang tersedia?
- Footage saat event tertentu?

**Primary user:** Safety

**Primary entity:** Video footage

**Primary action:** Play footage, capture snapshot

**Informasi selalu terlihat:** Camera grid, vehicle selector

**Informasi setelah selection:** Video player, timeline scrubber

**Informasi yang tidak boleh ada:** Vehicle CRUD, report generation

---

### /control → Administration > Commands

**Status:** Prototype

**Catatan:** Sudah ada di kode. Permission-based, hidden untuk role non-admin. Command dispatch (cut engine, buzzer) butuh konfirmasi eksplisit dan audit log. Bukan bagian dari demo flow utama.

---

### Settings

**Satu kalimat tanggung jawab:** Preferensi user dan aplikasi.

**Pertanyaan yang dijawab:**
- Tema apa yang aktif?
- Notifikasi apa yang aktif?
- Bagaimana cara ubah profile?

**Primary user:** Semua role

**Primary entity:** User preferences

**Primary action:** Toggle preferences

**Informasi selalu terlihat:** Settings sections (collapsed)

**Informasi setelah selection:** Full section with controls

**Informasi yang tidak boleh ada:** Admin functions (itu di Administration)

---

## 10. Sales Demo Route

### Peta Demo 10 Menit

```
[1] /dashboard
    Entity: Fleet overview
    Action: Buka aplikasi, lihat exception
    Message: "Ini kondisi armada kita. 25 unit aktif. 3 butuh perhatian."

[2] /dashboard → /tracking?vehicle=b1234kjt
    Entity: Vehicle B 1234 KJT
    Action: Klik exception offline
    Message: "B 1234 KJT offline sejak 1 jam. GPS tidak mengirim data."

[3] /tracking?vehicle=b5678tgp
    Entity: Vehicle B 5678 TGP
    Action: Klik kendaraan delayed
    Message: "B 5678 TGP status DELAYED. Data GPS terakhir 47 menit lalu."

[4] /tasks?vehicle=b5678tgp
    Entity: Task CIK-Kediri
    Action: Task list terfilter ke kendaraan ini
    Message: "Task ini ETA 17:30. Sekarang jam 16:15. Diprediksi terlambat 90 menit."

[5] /tasks?vehicle=b5678tgp&view=map
    Entity: Route visualization
    Action: Map dengan actual vs planned route
    Message: "Hijau = actual route. Abu = planned route. Ada deviasi di sini."

[6] /tasks?vehicle=b5678tgp&highlight=speeding
    Entity: Speeding event di inspector
    Action: Alert popup di inspector panel
    Message: "Speeding 87 km/j di Tol Dalam Kota. 27 km/j di atas limit."

[7] /safety?alert=speeding-5
    Entity: Safety queue
    Action: Alert terbuka, evidence di inspector
    Message: "Kita bisa follow up. Evidence ada di inspector — snapshot dan footage."
    Evidence di inspector: snapshot + dashcam clip, tidak pindah halaman

[8] /safety?vehicle=b5678tgp
    Entity: Safety queue filtered
    Action: Trip history kendaraan
    Message: "Perjalanan kemarin. Kita bisa replay dan lihat detail stop dan speeding."
    Atau: link ke /history?vehicle=b5678tgp

[9] /reports?type=speeding&vehicle=b5678tgp&period=week
    Entity: Speeding report
    Action: Generate report
    Message: "Report speeding kendaraan ini untuk minggu ini. Bisa di-export PDF atau Excel."

[10] /dashboard
    Entity: Return ke overview
    Action: Selesai, tanya pertanyaan
    Message: "Demikian demo VANGUARD. Questions?"
```

**Catatan:** /snapshots (/snapshots) tetap ada sebagai evidence library, tetapi bukan bagian dari alur demo utama. Evidence diakses melalui inspector di Safety Review.

**Plate slug pattern:** `?vehicle=<lowercase-plate-without-spaces>` — contoh: `b1234kjt`, `b5678tgp`.

### Validasi Flow

- [x] Tidak ada dead end — setiap langkah punya next step
- [x] Selected vehicle dipertahankan di URL param
- [x] Filter tidak hilang saat navigate
- [x] Kembali ke awal punya alasan (restart demo)
- [x] Navigasi konsisten (sidebar, not URL direct)

---

## 11. Breadcrumb dan Back Behavior

### Kapan Pakai Browser Back

**Ya:** Navigasi antara primary navigation areas
- Dashboard → Task Monitor
- Reports → Dashboard
- Safety → Dashboard

**Tidak:** Drill-down dalam entity yang sama
- Task list → Task detail
- Vehicle list → Vehicle detail
- Alert list → Alert detail

### Kapan Pakai Breadcrumb

**Ya:** Drill-down 2+ level

```
Overview > Operations > Task Monitor > PLI - DEPOK
```

**Tidak:** Single entity context
- Task detail dari Task Monitor → tidak perlu breadcrumb, cukup back link atau close

### Kapan Pakai Close Inspector

**Ya:** Panel slide-in overlay
- Detail panel di Realtime Monitor
- Detail panel di Task Monitor
- Sidebar filter panel

**Tidak:** Full page navigation

### Kapan Pakai Return to Results

**Ya:** Dari detail kembali ke list dengan preserved selection

```
/vehicles → /vehicles/1 (Vehicle detail)
Klik "← Vehicles" → /vehicles dengan list preserved, scroll position maintained
```

**Tidak:** Cross-domain navigation

### Kapan Pakai Open Full Page

**Ya:** Panel content yang perlu lebih ruang

```
Task Monitor map view → /tasks/map/:id (full page map)
Vehicle detail in panel → /vehicles/:id (full page)
```

**Tidak:** Quick glance information

---

## 12. Responsive Scope

### Resolution Targets

| Resolution | Target | Behavior |
|------------|--------|----------|
| 1366×768 | Minimum | Scrollable, sidebar collapsed |
| 1440×900 | Optimal | Full sidebar, comfortable spacing |
| 1920×1080 | Optimal+ | Full sidebar, larger map |

### Tablet (768-1024px)

- Sidebar collapsed to rail
- Tables horizontal scroll
- Map full-width
- Panels become bottom sheet atau full page

**Scope:** Read-only minimum. Dispatcher dapat monitor fleet dari tablet.

### Mobile (<768px)

**Scope:** Companion only, read-only

- Simplified dashboard view
- Vehicle list (no map)
- Alert notifications
- Cannot dispatch atau configure

**Priority:** Future enhancement, bukan v1 scope

### Yang Collapse di Tablet

| Element | Desktop | Tablet |
|---------|---------|--------|
| Sidebar | Expanded (248px) | Rail (64px) |
| Map | Full panel | Full-width |
| Table columns | All visible | Priority only |
| Detail panel | Side panel | Bottom sheet |
| Toolbar | Header + inline | Overflow menu |

### Yang Disembunyikan di Mobile

- Admin functions
- Full map (simplified list view)
- Report generation (view only)

---

## 13. IA Validation Checklist

### Navigation

- [x] Maksimal enam primary area
- [x] Tidak ada fungsi duplikat di navigation
- [x] Locate terintegrasi ke global search dan Tracking
- [x] Safety dan Evidence terpisah dari Operations
- [x] Administration visible untuk admin, hidden untuk user lain
- [x] Administration default landing = /settings/organization
- [x] Vehicles dan Drivers di Operations; Administration hanya master data management
- [x] Geofences di Operations; rules di Administration

### Entity

- [x] Setiap entity punya canonical destination
- [x] Entity relationships jelas
- [x] Vehicle punya dua konteks: operational (/tracking?vehicle=) dan record (/vehicles/:id)
- [x] /safety route nyata dengan alert queue sebagai landing

### Route

- [x] Semua route lama terpetakan
- [x] /locate sebagai redirect
- [x] Route naming konsisten dengan domain
- [x] /control = Administration > Commands, prototype, permission-based

### Action

- [x] Global actions di header/chrome
- [x] Contextual actions di page-specific toolbar
- [x] Map controls tidak masuk global header
- [x] Table actions di table header

### Context

- [x] Selected vehicle tidak hilang saat berpindah halaman
- [x] URL state dengan plate slug pattern untuk shareable links
- [x] Filter dipertahankan di domain yang sama

### Demo

- [x] Sales-demo route tidak punya dead end
- [x] Setiap perpindahan punya pesan bisnis
- [x] Demo flow 10 menit feasible
- [x] Evidence dibuka di inspector, tidak pindah halaman

### Role

- [x] Landing preset berdasarkan role
- [x] Role tidak melihat menu yang tidak relevan
- [x] Safety menu untuk safety role

### Language

- [x] Bahasa Indonesia untuk narasi
- [x] Bahasa Inggris untuk istilah UI dan teknis
- [x] Tidak ada karakter non-Indonesia/Inggris di seluruh dokumen

---

## 14. Remaining Open Questions

### ROQ2: Bagaimana emergency alert (panic button) ditampilkan?

**Pertanyaan:** Panic button atau emergency alert harusnya bagaimana displayed dan action-nya?

**Rekomendasi:** Banner alert di atas semua content, tidak bisa di-dismiss sampai resolved. Permission-based, confirmation required.

---

### ROQ3: Command dispatch kapan production-ready?

**Pertanyaan:** /control (Commands) apakah sudah production-ready atau tetap prototype?

**Rekomendasi:** Prototype sampai ada testing yang memadai. Command dispatch berisiko tinggi — butuh audit trail dan permission yang sangat ketat.

---

### ROQ4: Customer portal

**Keputusan:** Separate application dari VANGUARD.

VANGUARD fokus ke internal operations. Customer-facing tracking portal adalah produk terpisah.

---

### ROQ5: Mobile app kapan

**Keputusan:** Separate consideration dari VANGUARD.

VANGUARD adalah dashboard desktop-first. Mobile companion read-only adalah future enhancement.

---

### ROQ6: Multi-tenant kapan

**Keputusan:** Single-tenant untuk sekarang.

Multi-tenant adalah future enterprise tier. VANGUARD v1 single-company deployment.
