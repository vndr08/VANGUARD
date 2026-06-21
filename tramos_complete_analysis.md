# 🛰️ TRAMOS Systems — Complete Analysis & Reference

> **Sumber data:** Browser exploration (screenshot + DOM), user-provided screenshots, `tramos_knowledge_base.txt`, `claude_code_uiux_rebuild_prompt.txt`, dan `PROJECT_DESCRIPTION.txt`.

---

## 1. Overview TRAMOS

**TRAMOS Systems** adalah web-based fleet tracking, monitoring & safety platform untuk armada kendaraan. Digunakan oleh **Tempo Group** (103 unit kendaraan aktif).

**URL:** `https://tramos.systems`  
**Versi:** v4  
**Vendor:** PT. Andakara Informatika Nusantara (© 2015–2025)

**Fungsi utama:**
- Realtime vehicle monitoring di peta
- Task/shipment management dan tracking
- Trip history replay dan investigasi
- Report operasional (15+ jenis)
- Camera snapshot & dashcam evidence
- Geofence management
- Driver, vehicle, dan user management
- Notification system (speeding, geofence, GPS delayed)

---

## 2. Sidebar Navigation — Struktur Lengkap

Sidebar dibuka via **hamburger menu (☰)** di kiri atas. Background hijau gelap (#2E7D32 area).

```
📁 MAIN MENU (Direct Links)
├── Dashboard                    → /iv/dashboard
├── Realtime Monitor             → /iv/rtmon
├── Dashcam Monitor              → /iv/dashcam (atau serupa)
├── Trip History                 → /iv/history
├── Photo Camera Snapshot        → /iv/snapshot
├── Locate Unit                  → /iv/locate
├── Accident Log                 → /iv/accident
│
📁 Reports ▸ (expandable submenu)
├── Daily Summary
├── Trip Summary
├── Parking Summary
├── Idle Summary
├── Speed Summary
├── Door Summary
├── Geofence Summary
├── Operational Summary
├── GPS/GSM Summary
├── Sensor Log
├── RFID Reader Log
├── Driver Log
├── Temperature Log
├── Fuel Log
├── Odometer Summary
│
📁 Task & Shipment ▸ (expandable submenu)
├── Trip/Shipment Management     → /task/manage
├── Trip/Shipment Tracking       (trial)
├── Trip/Shipment History        (new)
├── Task Summary
│
📁 Control Panel ▸ (expandable submenu)
├── Units
├── Drivers
├── Users
├── Geofence
├── Route
├── Telegram
│
📁 Support ▸ (expandable submenu)
├── Technical Support            (new)
│
📁 Legacy (Old Style) ▸ (expandable submenu)
├── Realtime Monitor
├── Trip History
├── Stop Summary
├── Idle Summary
├── Task Monitor
├── Monthly Summary
├── Camera Snapshot
├── Accident Log
├── Route
│
🔒 Sign out                     (bottom)
```

---

## 3. Header / Toolbar Global

Setiap halaman memiliki header hijau (gradient green) dengan:

| Elemen | Posisi | Fungsi |
|--------|--------|--------|
| **☰ Hamburger menu** | Kiri | Buka sidebar navigation |
| **Logo TEMPO GROUP** | Kiri | Branding customer |
| **Page title** | Center | Judul halaman aktif |
| **Toolbar buttons** | Center-right | Aksi spesifik halaman |
| **🔔 Notification bell** | Kanan | Alert speeding, GPS delayed, dll. (badge merah jika ada notif) |
| **User avatar (JE)** | Kanan | Profile circle dengan inisial user |

---

## 4. Halaman-Halaman Detail

### 4.1 Dashboard (`/iv/dashboard`)

**Layout:** Full-page summary dengan widget cards.

**Widget/Komponen:**

| Widget | Konten |
|--------|--------|
| **Vehicles Status Summary** | Total units: 103, Driving: 22, Stop/Parking: 80, Delayed: 2, No GPS: 1 |
| **Engine Status** | Pie/donut chart — Engine ON vs OFF distribution |
| **In Area** | Chart — Distribusi kendaraan di area private vs public |
| **Vehicle Status** | Bar/chart — Breakdown status kendaraan (driving, idle, stop, offline) |

**Fungsi:**
- Overview cepat kondisi armada
- Klik section untuk masuk ke modul detail
- Identifikasi unit bermasalah (offline, delayed, no GPS, no RFID)

**KPI yang ditampilkan:**
- Total Vehicle
- Driving
- Idle
- Stop / Parking
- Offline
- Delayed Update
- No GPS Data
- No RFID Driver
- In Private Areas
- In Public Areas

---

### 4.2 Realtime Monitor (`/iv/rtmon`)

**Layout:** Full-screen — toolbar atas + konten (map ATAU table).

#### Toolbar Buttons (kiri ke kanan):

| Button | ID | Fungsi |
|--------|----|--------|
| **MAP** / **TBL** toggle | `tsb-mode-tbl` | Switch antara map view dan table view |
| **Map: [dropdown]** | `tsb-map-layer-button` | Pilih tile: OpenStreetMap, dll. |
| **🔄 Refresh** | `tsb-reload` | Reload data kendaraan |
| **🔍 Search** | `tsb-find` | Cari unit/driver |
| **🏷️ Filter** | `tsb-filter` | Filter berdasarkan status |
| **⊕ Center Focus** | `tsb-zoom` | Zoom to fit semua kendaraan |
| **👥 Cluster** | `tsb-cluster` | Toggle marker clustering |
| **📍 Edit Geozone** | `tsb-zone` | Management geozone |
| **⬇️ Download/Export** | — | Export data |
| **⊞ Customize** | — | Customize column layout |

#### MAP View:
- **Leaflet/OpenStreetMap** sebagai base map
- **Marker clustering** — angka di circle (contoh: 55, 34, 7, 3, 2)
- **Individual markers** — icon kendaraan dengan label: `B9616SEU (BDL)` + `[DC LAMPUNG - PTT PADANG]`
- **Marker warna:**
  - 🟢 Hijau = Driving/Progress
  - 🔴 Merah = Stopped/Offline
  - 🟡 Kuning = Idle/Waiting
- **Zoom controls** (+/−) kiri atas
- **Layer control** kanan atas
- **Map bounds** = Indonesia (Sumatera sampai NTT)

#### TABLE View:

**Kolom-kolom tabel:**

| # | Kolom | Keterangan |
|---|-------|------------|
| 1 | **#** | Nomor urut |
| 2 | **🟥 Icon** | Status indicator (merah = flag) |
| 3 | **REF NUMBER** | Nomor referensi task (contoh: `5410297202`) |
| 4 | **TASK** | Nama task (contoh: `KLN - BEKASI`, `PLI - BEKASI`) |
| 5 | **UNIT NAME** | Nomor polisi kendaraan (contoh: `B9001SXS`, `B9068NU (ECFS)`) |
| 6 | **☑ Icon** | Checkbox/assignment indicator |
| 7 | **DRIVER** | Nama driver (contoh: `ANDY HARI PRAYONO (NEW ...)`) |
| 8 | **TRIP TYPE** | Tipe trip: `Main Task`, `Pre Task` |
| 9 | **STATE DUR** | Durasi state saat ini (contoh: `18h 30m`, `07h 32m`) |
| 10 | **STATUS** | Status task: `Waiting`, `Progress`, `Unloading` |
| 11 | **TRIP** | Nama trip (contoh: `KLN - BEKASI`) |
| 12 | **ORIGIN** | Lokasi asal (contoh: `PTT KLN`, `PLI DMG`) |
| 13 | **DESTINATION** | (kolom lanjutan, perlu scroll kanan) |

**Group dropdown options:**
- No Group, Unit Group, Engine Status, Area, Area Type, Location, District, Province, Task Status, **Shipment Status** (default), Shipment Origin, Shipment Destination

**Sort dropdown options:**
- **Unit Name** (default), Driver, Engine Status, Area, Area Type, Location, Task Status, Trip Name, Shipment Status, Shipment Origin, Shipment Destination

**Grouping section:** Data dikelompokkan, contoh: `1. Waiting (21)` — artinya 21 task berstatus Waiting.

**Footer bar:**
- `103 records`
- `Double Click to view unit on map.`
- `Alt + click to copy cell content.`

#### Notification Popup (Bottom-Right):

```
┌────────────────────────────────────────────┐
│ Jun 20, 16:13                          ✕   │
│ B9672SEU                                    │
│ Speeding in public area (44 Km/h)           │
│                                             │
│ Jalan Raya Bogor, Cisalak, Cimanggis,       │
│ Kota Depok, Jawa Barat, 16416               │
└────────────────────────────────────────────┘
```

- Muncul otomatis saat ada event speeding
- Tombol ✕ untuk dismiss
- Menampilkan: waktu, unit, jenis alert, kecepatan, alamat lengkap

---

### 4.3 Task & Route / Task Management (`/task/manage`)

**Layout:** Split panel — **left panel** (task list / detail form) + **right panel** (map).

#### Toolbar:
| Button | Warna | Fungsi |
|--------|-------|--------|
| **⟳ Reload** | Hijau | Refresh task list |
| **+ New Task** | Hijau | Buat task baru |
| **Real Time** | Orange | Buka Realtime Monitor |
| **History** | Hijau | Buka Trip History |

#### Tabs (atas left panel):
- **Task List** — Daftar semua task
- **Trip List** — Daftar trip dalam task terpilih
- **Task Description** — Form detail task

#### Task List View:
```
1. BKS - PADALARANG
   #5410296734 / BKS - PADALARANG
   B9675SEU / SUGITO (NEW IPI SMG) / 2 trip
   2026-06-20 14:00
   [Waiting] 📍

2. BKS - PURBALINGGA
   #5410296735 / BKS - PURBALINGGA
   B9882SEU / H. YANTO / 1 trip
   2026-06-20 14:00
   [Waiting] 📍
```

Setiap task item menampilkan:
- **Task name** (bold, contoh: `BKS - PADALARANG`)
- **Ref number** (link hijau, contoh: `#5410296734`)
- **Route** (link hijau, contoh: `BKS - PADALARANG`)
- **Vehicle / Driver / trip count**
- **Datetime**
- **Status badge** (`[Waiting]`)
- **📍 Location icon**

#### Task Description (Detail Form):

| Field | Tipe | Contoh |
|-------|------|--------|
| **Task Ref No.** | Text (readonly) | `5410296734` |
| **Task Name*** | Text input | `BKS - PADALARANG` |
| **Description** | Textarea | `BKS - PADALARANG` |
| **Vehicle*** | Link (clickable) | `B9675SEU (ISUZU Wing Box)` |
| **Driver*** | Link (clickable) | `SUGITO (NEW IPI SMG)` |
| **Task Start*** | Date + Time | `2026-06-20` `14:00` |
| **Task End*** | Date + Time | `2026-06-30` `00:00` |
| **Task complete** | Dropdown | `Manual` |

#### Trips Section (dalam Task Description):

```
Trips:

  BDG2 - BEKASI                    ⏱ Waiting
  PTT PADALARANG - DC BEKASI
  Origin: PTT BDG2, Destination: DC BKS
  Distance: 124.85 km
  Trip Type: Pre Task

  BKS - PADALARANG                 ⏱ Waiting
  BKS - PADALARANG
  Origin: DC BKS, Destination: PTT BDG2
  Distance: 124.85 km
  Trip Type: Main Task

  [Add Trip]
```

#### Bottom Action Bar:
| Button | Warna | Fungsi |
|--------|-------|--------|
| **+ New Task** | Hijau | Buat task baru |
| **🗑 Delete** | Merah | Hapus task |
| **↩ Cancel** | Biru | Cancel perubahan |
| **💾 Save** | Hijau | Simpan task |

#### Map (right panel):
- Leaflet/OpenStreetMap
- **[START] marker** hijau di origin (contoh: `DC BKS`)
- **[END] marker** hijau di destination (contoh: `PTT BDG2`)
- **Route line** merah/oranye menunjukkan planned route
- Zoom controls

---

### 4.4 Trip History (`/iv/history`)

**Fungsi:** Replay dan investigasi perjalanan masa lalu.

**Filter Panel:**
- Pilih Unit (plate number)
- Pilih Driver / Group
- Date range (start – end)
- Search / Load button
- Export CSV

**View Modes:**
- Map replay (track aktual di peta)
- Timeline (visualisasi kronologis)
- Detail table

**Tabs Kategori:**

| Tab | Isi |
|-----|-----|
| **Timeline** | Kronologi perjalanan |
| **Detail** | Informasi trip lengkap |
| **Engine** | Engine on/off events |
| **Driving** | Driving duration dan segments |
| **Idle** | Idle events (mesin hidup, tidak bergerak) |
| **Stop** | Stop/parking events dengan lokasi dan durasi |
| **Speeding** | Pelanggaran kecepatan |
| **Events** | Semua event (alarm, geofence, dll) |
| **Reverse** | Kendaraan mundur |
| **Geofence** | Enter/exit geofence events |

**Replay Controls:**
- ▶️ Play / ⏸️ Pause
- Speed selector: 1x, 2x, 4x
- Reset

---

### 4.5 Photo Camera Snapshot

**Fungsi:** Gallery bukti foto dari kamera kendaraan.

**Event Types:**
- Arrival proof
- Speed alert
- Fuel stop
- Engine off
- Customer gate / Geofence entry

**Informasi per snapshot:**
- Unit (plate number)
- Driver
- Location
- Time
- Event type
- Camera channel
- Thumbnail / full image

**Actions:**
- Filter by event type, unit, date
- Search by unit/location
- Review (buka modal detail)
- Download full resolution

---

### 4.6 Dashcam Monitor

**Fungsi:** Live video dan review kamera kendaraan.

**Features:**
- Video player utama
- Multi-channel: **Front**, **Cabin**, **Rear**
- Status: **Live** / **Review** / **Offline**
- Event list

**Controls:**
- ▶️ Play / ⏸️ Pause
- ⏭️ Skip
- 🔇 Mute toggle
- 📸 Snapshot capture
- ⛶ Fullscreen
- Channel selector (klik untuk switch camera)

---

### 4.7 Locate Unit

**Fungsi:** Pencarian cepat satu unit.

**Features:**
- Search input prominent
- Result list
- Map focus ke unit yang dicari
- Unit detail (posisi, speed, status, driver)
- Recent searches

**Actions:**
- Locate (tampilkan di map)
- Open in Realtime Monitor
- Open History
- Copy coordinates

---

### 4.8 Accident Log

**Fungsi:** Catatan insiden keselamatan.

**Data per incident:**
- Time / Date
- Unit (plate number)
- Driver
- Severity (High / Medium / Low)
- Location
- Status (Review / Action / Closed)
- Evidence

**Actions:**
- Filter by severity, status, date
- Review evidence
- Mark as resolved

---

### 4.9 Reports (15 Jenis)

**Report types lengkap:**

| # | Report | Deskripsi |
|---|--------|-----------|
| 1 | **Daily Summary** | Rekap harian per unit |
| 2 | **Trip Summary** | Ringkasan perjalanan: jarak, durasi, start/end, avg speed |
| 3 | **Parking Summary** | Lokasi parkir, durasi berhenti |
| 4 | **Idle Summary** | Engine on tapi tidak bergerak — waste fuel |
| 5 | **Speed Summary** | Pelanggaran batas kecepatan |
| 6 | **Door Summary** | Buka/tutup pintu events |
| 7 | **Geofence Summary** | Enter/exit area events |
| 8 | **Operational Summary** | Overview operasional |
| 9 | **GPS/GSM Summary** | Status sinyal GPS dan GSM |
| 10 | **Sensor Log** | Data sensor tambahan |
| 11 | **RFID Reader Log** | Log pembacaan RFID driver |
| 12 | **Driver Log** | Aktivitas driver |
| 13 | **Temperature Log** | Data suhu (cold chain) |
| 14 | **Fuel Log** | Trend fuel, low fuel events, fuel drop |
| 15 | **Odometer Summary** | Kilometer tracking |

**Workflow:**
1. Pilih jenis report
2. Pilih unit/group/driver
3. Pilih tanggal
4. Generate report
5. Review preview table
6. Export PDF/CSV/Excel

---

### 4.10 Control Panel (Admin)

**Modules:**

| Module | Fungsi |
|--------|--------|
| **Units** | Master data kendaraan (plate, brand, model, GPS device, SIM card) |
| **Drivers** | Master data driver (name, phone, license, RFID) |
| **Users** | User accounts & role management |
| **Geofence** | Area virtual management (create, edit, delete zones) |
| **Route** | Route planning / management |
| **Telegram** | Telegram bot alert configuration |

---

## 5. Design System TRAMOS

### Warna

| Elemen | Warna | Hex (approx) |
|--------|-------|--------------|
| **Header/Toolbar** | Green gradient | `#4CAF50` → `#2E7D32` |
| **Sidebar background** | Dark green | `#1B5E20` |
| **Sidebar text** | White | `#FFFFFF` |
| **Sidebar hover** | Lighter green | `#2E7D32` |
| **Table header** | Light gray | `#F5F5F5` |
| **Table border** | Gray | `#E0E0E0` |
| **Table row hover** | Light blue/gray | `#E3F2FD` |
| **Status: Waiting** | Green text | `#4CAF50` |
| **Status: Progress** | Blue | `#2196F3` |
| **Status: Unloading** | Orange | `#FF9800` |
| **Flag icon** | Red square | `#F44336` |
| **Notification popup bg** | Light yellow | `#FFFDE7` |
| **Button primary** | Green | `#4CAF50` |
| **Button danger** | Red | `#F44336` |
| **Button neutral** | Blue | `#2196F3` |
| **Page background** | White | `#FFFFFF` |
| **Footer** | Light gray | `#F5F5F5` |

### Layout Pattern

```
┌─────────────────────────────────────────────────────────┐
│ ☰  TEMPO GROUP   [Page Title]   [Toolbar...]   🔔 [JE] │  ← Green header
├─────────────────────────────────────────────────────────┤
│                                                         │
│              Main Content Area                          │
│        (Map / Table / Form / Gallery)                   │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ © PT. Andakara Informatika       Supported by Tramos v4 │  ← Footer
└─────────────────────────────────────────────────────────┘
```

### Typography
- Font: System default (sans-serif)
- Header: Bold, white on green
- Table headers: 12px, uppercase, gray, semibold
- Table data: 13-14px, regular
- Labels: 11px uppercase for metrics

### Interaction Patterns
- **Double-click** row → Open unit on map
- **Alt + click** → Copy cell content
- **Single click** → Select row / expand detail
- **Hamburger menu** → Slide-in sidebar from left
- **Sub-menus** → Expand/collapse with arrow (▸)
- **Notification popup** → Auto-appear bottom-right, dismiss with ✕

---

## 6. Data Models / Entities

### Vehicle / Unit
```
- plate_number        (e.g., "B9001SXS", "B9068NU (ECFS)")
- vehicle_type        (truck, trailer, pickup)
- brand               (Hino, Isuzu, Mitsubishi, UD Trucks, Mercedes-Benz)
- model
- year
- status              (driving | idle | stopped | offline | delayed)
- speed               (km/h)
- latitude / longitude
- heading             (direction)
- engine_on           (boolean)
- fuel_level           (%)
- odometer            (km)
- last_update         (datetime)
- driver_id           (FK)
- group               (e.g., "CDDL BEKASI", "CDE BEKASI")
- gps_device_id
- sim_card
```

### Driver
```
- name                (e.g., "NANA SUTRISNA", "ANDY HARI PRAYONO")
- phone
- license_number
- license_type        (B2, etc.)
- rfid_tag
- status              (active | off-duty | on-leave)
- safety_score
- assigned_vehicle
```

### Task
```
- task_ref            (e.g., "5410296734")
- task_name           (e.g., "BKS - PADALARANG")
- description
- vehicle             (FK)
- driver              (FK)
- schedule_start      (datetime)
- schedule_end        (datetime)
- task_complete       (Manual | Auto)
- status              (Waiting | Progress | Unloading | Assigned | Completed)
```

### Trip (child of Task)
```
- trip_name           (e.g., "BDG2 - BEKASI")
- trip_type           (Main Task | Pre Task)
- origin              (e.g., "PTT BDG2")
- destination         (e.g., "DC BKS")
- distance            (km, e.g., 124.85)
- status              (Waiting | Progress | Completed)
- route_planned       (polyline coordinates)
- route_actual        (GPS track points)
- traveled_distance
- estimated_distance_left
- estimated_arrival
- avg_speed
- duration
```

### Geofence
```
- name                (e.g., "DC BEKASI", "PTT PADANG")
- type                (Warehouse | Depot | Customer | Port | Pool | Rest Area)
- latitude / longitude
- radius              (meters)
- alert_on_enter      (boolean)
- alert_on_exit       (boolean)
```

### Event / Notification
```
- event_type          (speeding | geofence_enter | geofence_exit | gps_delayed | camera | accident)
- vehicle
- driver
- speed               (for speeding events)
- location            (address string)
- latitude / longitude
- timestamp
- severity            (high | medium | low)
- evidence_url        (for camera/dashcam events)
```

---

## 7. Status Values Reference

### Vehicle Status
| Status | Arti | Warna |
|--------|------|-------|
| **Driving** | Kendaraan bergerak | 🟢 Hijau |
| **Idle** | Mesin hidup, tidak bergerak | 🟡 Kuning/Amber |
| **Stopped / Parking** | Kendaraan berhenti | ⚪ Abu-abu |
| **Offline** | Tidak mengirim data GPS | 🔴 Merah |
| **Delayed Update** | Data GPS terlambat >30 min | 🟠 Orange |
| **No GPS Data** | Tidak ada data GPS sama sekali | 🔴 Merah |
| **No RFID Driver** | Driver tidak terbaca RFID | ⚠️ Warning |

### Task Status
| Status | Arti |
|--------|------|
| **Waiting** | Task belum mulai / menunggu |
| **Progress** | Task sedang berjalan, kendaraan menuju destination |
| **Unloading** | Kendaraan di destination, proses bongkar |
| **Assigned** | Task sudah ditugaskan, belum jalan |
| **Completed** | Task selesai |

### Trip Type
| Type | Arti |
|------|------|
| **Main Task** | Perjalanan utama |
| **Pre Task** | Perjalanan sebelum task utama (pickup, staging) |

---

## 8. Unique TRAMOS Features to Replicate

### 8.1 Realtime Speeding Notification
- Popup kuning muncul di **bottom-right** saat ada kendaraan speeding
- Menampilkan: waktu, unit, `Speeding in public area (XX Km/h)`, alamat lengkap
- Auto-dismiss atau manual close (✕)
- Multiple notifications bisa stack

### 8.2 Double-Click to View on Map
- Di table view, double-click row → switch ke map view dan zoom ke kendaraan tersebut
- Alt+click → copy cell content

### 8.3 Task with Multi-Trip
- Satu task bisa memiliki **multiple trips** (Pre Task + Main Task)
- Setiap trip punya origin/destination/distance sendiri
- Map menampilkan **[START]** dan **[END]** markers

### 8.4 Route Visualization (2 jenis)
- **Route yang sudah dilalui** (actual GPS track) — warna hijau
- **Route yang ditentukan** (planned route) — warna abu-abu/putus-putus
- Keduanya tampil bersamaan di map untuk perbandingan

### 8.5 Marker Label
- Marker kendaraan di map menampilkan label:
  - `B9616SEU (BDL)` — plate number
  - `[DC LAMPUNG - PTT PADANG]` — task/trip saat ini
- Warna marker sesuai status

### 8.6 Grouping System
- Table bisa di-group berdasarkan berbagai kriteria
- Setiap group menampilkan header: `1. Waiting (21)` dengan count
- Collapsible groups

### 8.7 Task Detail Panel
Panel kanan pada map menampilkan info unit terpilih:

```
📋 Identity
├── Vehicle
├── Driver  
├── State
├── Speed
├── Direction
├── Location

📦 Task Info
├── Task
├── Schedule
├── Trip
├── Type
├── Origin
├── Destination
├── Distance
├── Start at

🛣️ Traveled
├── Distance
├── Duration
├── Avg Speed

⏱️ Estimated
├── Distance left
├── Time left
├── Arrive at

🗺️ Layers
├── ☐ Show Track
├── ☐ Checkpoint
├── ☐ Geofence
```

---

## 9. Perbedaan TRAMOS vs VANGUARD Saat Ini

| Aspek | TRAMOS | VANGUARD |
|-------|--------|----------|
| **Task/Shipment** | Full TMS: create, assign, multi-trip, track | Minimal mock data |
| **Reports** | 15 jenis report | 13 jenis, belum ada generator |
| **Grouping** | 12 group options di table | Tidak ada grouping |
| **Realtime notification** | Live speeding popup | Tidak ada |
| **Double-click** | Row → view on map | Tidak ada |
| **Route visualization** | Actual + planned route | Mock only |
| **Driver RFID** | Real RFID integration | Mock only |
| **Geofence** | Full CRUD + alerts | List only |
| **Camera** | Real camera integration | Mock gallery |
| **Dashcam** | Live/review multi-channel | Mock player |
| **Sidebar** | Expandable sub-menus | Flat list |
| **Design** | Green-based, operational | Zinc-based, modern |
| **Data** | 103 real units | 25 mock units |
| **Auth** | Full login/session | None |

---

## 10. Ringkasan untuk Implementasi VANGUARD

### Prioritas Tinggi (Core Features)
1. ✅ Realtime Monitor — Map + Table view toggle dengan semua toolbar buttons
2. ✅ Task Management — Task list, detail form, multi-trip, map with route
3. ✅ Dashboard — KPI cards, status distribution, exception monitor
4. ✅ Speeding notification popup system
5. ✅ Table grouping dan sorting system
6. ✅ Double-click row → view on map

### Prioritas Sedang
7. Trip History dengan replay dan 10 tabs
8. Report center dengan 15 jenis report dan generator
9. Geofence CRUD + map visualization
10. Camera Snapshot gallery + review modal
11. Dashcam multi-channel player
12. Locate Unit — quick search

### Prioritas Rendah
13. Control Panel — admin modules
14. Accident Log — incident tracking
15. Telegram alert config
16. Legacy page support

---

> **Dokumen ini adalah referensi lengkap TRAMOS untuk membangun VANGUARD. Semua fitur, button, navigasi, data model, dan design telah didokumentasi.**
