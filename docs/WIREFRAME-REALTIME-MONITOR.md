# VANGUARD Realtime Monitor Wireframe

**Tanggal:** 2026-08-04
**Status:** Grayscale wireframe specification untuk Realtime Monitor
**Scope:** Map-primary workspace, vehicle list, inspector, marker system

---

## 1. Realtime Monitor Job

Realtime Monitor adalah **map-primary operational workspace**.

Dalam lima detik pengguna harus dapat menjawab:

1. Di mana kendaraan yang membutuhkan perhatian?
2. Apa status dan kesegaran data kendaraan tersebut?
3. Kendaraan mana yang harus dibuka lebih dulu?
4. Apa konteks pekerjaan kendaraan terpilih?
5. Workflow mana yang harus dibuka berikutnya?

Realtime Monitor bukan dashboard kedua dan bukan halaman dekorasi peta.

---

## 2. Diagnosis Implementasi Sekarang

### 2.1 Masalah Utama

| Masalah | Bukti | Dampak |
|---------|-------|--------|
| List 280px | tracking/page.tsx:534 menggunakan grid-cols-[280px_1fr] | Ruang row terbatas |
| Inspector 380px | DetailPanel.tsx:88 menggunakan w-[380px] | Tidak sesuai skala App Shell |
| List dan inspector dapat muncul pada workflow yang sama | Layout Tracking sekarang belum menerapkan mutual exclusion | Tiga surface bersaing dengan peta |
| Global CommandPalette memakai subset | MOCK_VEHICLES.slice(0,8) pada CommandPalette | Global search tidak mencakup 25 kendaraan |
| Ownership alert belum dinyatakan tunggal | useSpeedingMonitor.ts sudah tersedia sebagai hook terpisah | Berisiko subscription ganda jika dijalankan di banyak component |
| Fit Fleet dan Find belum menghasilkan map/search state yang lengkap | Evidence tracking menunjukkan handler dan feedback sementara | Workflow belum selesai |
| Refresh memakai feedback sementara | Tracking memiliki toast/setTimeout occurrence | Refresh manual tidak mewakili telemetry realtime |
| Map toolbar terlalu padat | tracking/page.tsx memiliki banyak kontrol dalam satu area | Beban kognitif dispatcher |
| Leaflet technical leftovers masih tersimpan | package.json dan globals.css | Dependency dan CSS tidak lagi sesuai runtime map |

### 2.2 Fakta Map Engine

**Current runtime engine:** MapLibre GL.

**Technical leftovers yang harus dibersihkan saat implementasi:**
- leaflet dependency;
- react-leaflet dependency;
- @types/leaflet dependency;
- Leaflet CSS overrides di globals.css.

Tidak ada bukti bahwa Leaflet dan MapLibre aktif sebagai dua runtime engine
bersamaan. Target akhir tetap MapLibre GL only.

### 2.3 Fakta Speeding Monitor

`useSpeedingMonitor.ts` sudah tersedia sebagai hook terpisah.

Dokumen ini tidak mengklasifikasikan penggunaan threshold di halaman sebagai
detector inline kedua tanpa tracing event flow yang membuktikannya.

Keputusan ownership:
- monitor dijalankan tepat satu kali pada Tracking page atau demo-store layer;
- alert dinormalisasi menjadi alert entity;
- DetailPanel tidak menjalankan monitor;
- DetailPanel menerima selected alert melalui props atau store selector;
- interval dan listener dibersihkan ketika owner unmount.

Hook saat ini menghasilkan alert demo berbasis interval/random. Perilaku ini
diklasifikasikan sebagai **explicit demo simulation**, bukan real telemetry
detection.

### 2.4 Evidence Files

- `realtime-monitor-current.txt` — layout, handler, filter, dan state Tracking;
- `realtime-map-engine.txt` — dependency dan CSS map;
- `realtime-map-files.txt` — component map;
- `leaflet-traces.txt` — Leaflet technical leftovers;
- `toast-only-actions.txt` — dua kemunculan toast/setTimeout pada Tracking.

Jumlah source occurrence tidak boleh disamakan dengan jumlah action yang harus
diperbaiki. Behavior audit dapat menemukan beberapa action bermasalah dari
jumlah call site yang lebih sedikit.

---

## 3. Locked Layout Model

### 3.1 Navigation Rail

- Rail 64px ketika list atau inspector aktif.
- Expanded sidebar tidak dipakai sebagai kondisi utama Realtime Monitor.
- App Shell tidak boleh dirancang ulang.

### 3.2 Contextual Surfaces

Hanya dua contextual surfaces:

1. Vehicle List: 320px
2. Vehicle Inspector: 360px

Pada map-primary, list dan inspector saling menggantikan.

**Dilarang menampilkan list dan inspector bersamaan.**

### 3.3 Perilaku

- Kondisi awal: list terbuka, inspector tertutup.
- Memilih vehicle: list tersembunyi, inspector terbuka.
- Menutup inspector: state list sebelumnya dipulihkan.
- Tombol L: buka list dan tutup inspector.
- Tombol I: buka inspector untuk selection aktif dan tutup list.
- Escape: tutup inspector dan pulihkan list.
- Selection disimpan di URL:
  `/tracking?vehicle=:plateSlug`
- Search terbuka menggunakan:
  `/tracking?search=open`

### 3.4 Inspector

Inspector tetap overlay dengan lebar 360px.

Saat inspector terbuka:
- map canvas tetap penuh di belakang overlay;
- effective right padding: 360px;
- selected entity berada di tengah area yang tidak tertutup;
- displacement visual: 180px ke kiri;
- zoom dan bearing tidak berubah;
- transition harus singkat dan tidak mengganggu.

### 3.5 Three Metrics Definition

| Metric | Definisi | Contoh pada 1366 dengan Inspector |
|--------|----------|-----------------------------------|
| Map canvas width | Lebar peta sebelum occlusion | 1302px (viewport - rail 64px) |
| Occluded width | Bagian tertutup inspector | 360px |
| Unoccluded map width | Bagian peta yang benar-benar terlihat | 942px |

---

## 4. Vehicle List

### 4.1 Informasi Setiap Row

Informasi yang selalu terlihat:
- Status indicator
- Plate number
- Driver atau Unassigned
- Operational state
- Speed jika bergerak
- Freshness atau durasi sejak update
- Exception indicator jika ada

**Jangan memasukkan seluruh detail kendaraan ke row.**

### 4.2 Search

Search harus bekerja pada seluruh 25 kendaraan, bukan subset.

Search minimal mencakup:
- Plate number
- Driver name
- Task identifier jika tersedia

### 4.3 Filter

Filter minimum:
- All
- Driving
- Idle
- Stopped
- Offline
- Needs Attention

Jika source memakai status berbeda, definisikan normalization adapter.
Jangan mengarang jumlah per status.

### 4.4 Sort

Default:
1. Severity exception
2. Freshness
3. Plate number

Sediakan opsi:
- Needs Attention
- Last Update
- Plate Number

### 4.5 Row States

Definisikan:
- default
- hover
- keyboard focus
- selected
- stale
- offline
- loading
- partial data
- no result

**Status tidak boleh dibedakan menggunakan warna saja.**

### 4.6 Grouped by Status

Vehicle list dikelompokkan berdasarkan status canonical:

| Status | Label |
|--------|-------|
| driving | Berkendara |
| idle | Diam |
| stop | Berhenti |
| offline | Offline |
| delayed | Tertunda |

Setiap group bisa di-collapse/expand. Group header menampilkan count.

### 4.7 Information Hierarchy per Row

```
[STATUS DOT] PLATE NUMBER              SPEED
            Driver Name / Unassigned   FUEL%
            Updated Xm ago
```

Tiga baris per row maksimum.

---

## 5. Map and Marker System

### 5.1 Map Engine

**MapLibre GL adalah satu-satunya map engine.**

Dokumentasikan sebagai implementation cleanup:
- hapus leaflet
- hapus react-leaflet
- hapus @types/leaflet
- hapus Leaflet CSS overrides

**Jangan menggunakan Leaflet dalam rancangan baru.**

### 5.2 Marker Types

Definisikan marker untuk:

- driving
- idle
- stopped
- offline
- needs attention
- selected

### 5.3 Marker Specification

Setiap marker harus memiliki:
- Status yang dapat dibaca tanpa hanya mengandalkan warna
- Selection state
- Hit area minimum
- Keyboard/list alternative
- Timestamp atau freshness melalui inspector, bukan label permanen di map

**Jangan menampilkan plate label pada seluruh marker secara permanen jika membuat peta penuh teks.**

### 5.4 Marker Behavior

| Scenario | Behavior |
|----------|----------|
| Marker overlap | Clustering aktif, zoom untuk pisahkan |
| Selected marker | Highlight berbeda, di-recenter |
| Marker di balik inspector | Tetap terlihat, inspector overlay tidak block |
| Viewport fit | Fit fleet bounds saat map load |
| Zoom | Via map controls |
| Map loading | Skeleton atau spinner |
| Map error | Inline error dengan retry |
| Telemetry update | Interpolated movement, bukan snap |
| Stale position | Dot opacity berkurang |

**Jangan menambahkan animasi pulse pada semua marker.**

### 5.5 Layer Controls

Map mendukung layer visibility:
- Cluster toggle
- Planned route
- Actual route
- Checkpoint
- Geofence

---

## 6. Map Toolbar

### 6.1 Isi Toolbar

Map toolbar hanya berisi tindakan terkait peta:

- Search/find vehicle
- Fit fleet
- Layer selection jika benar-benar tersedia
- Zoom
- Toggle Vehicle List

### 6.2 Dilarang di Map Toolbar

- Global notifications
- User menu
- Global refresh
- Customize columns
- Report export
- Action yang hanya menampilkan toast

---

## 7. Vehicle Inspector

### 7.1 Pattern

Gunakan pattern App Shell:

1. Identity
2. State
3. Context
4. Actions
5. Links

### 7.2 Identity

- Plate number
- Driver
- Vehicle label/type
- Selection freshness

### 7.3 State

- Operational status
- Speed
- Ignition jika tersedia
- Location
- Last update
- Stale/offline explanation

### 7.4 Context

- Active task
- Task status
- ETA dan target jika tersedia
- Active exception
- Last significant event

### 7.5 Actions

Hanya action yang nyata:

- Open vehicle record
- Open active task
- Open Safety alert jika ada
- Open trip history
- Locate/recenter selected vehicle
- Close inspector

Canonical destinations:
- Vehicle operational context:
  `/tracking?vehicle=:plateSlug`
- Vehicle record:
  `/vehicles/:id`
- Active task:
  `/tasks/:id`
- Safety alert:
  `/safety?alert=:id`
- Trip event:
  `/history?vehicle=:plateSlug&event=:id`

### 7.6 Dilarang

- Simulated success
- Engine command dari inspector
- Button yang hanya memunculkan toast
- Action tanpa destination atau state change

### 7.7 Inspector Sections

| Section | Content |
|---------|---------|
| Header | Plate number, status badge, close button |
| Identity | Vehicle, Driver, State |
| State | Speed, Direction, Location, Last Update |
| Traveled | Distance, Duration, Avg Speed |
| Estimated | Distance Left, Time Left, Arrive At |
| Task Info | Task ref, Task name, Schedule (jika ada) |
| Layers | Toggle cluster, routes, geofence |
| Fuel + Odometer | Fuel bar, Odometer reading |

---

## 8. Freshness and Connectivity

### 8.1 Freshness Rules

Gunakan aturan terkunci:

| Age | State | Label |
|-----|-------|-------|
| Kurang dari 2 menit | Segar | Updated recently |
| 2 sampai 10 menit | Tertunda | Data delayed |
| Lebih dari 10 menit | Tidak mengirim data | Last update Xm ago |

**Jangan menyimpulkan kerusakan GPS hanya dari telemetry yang tidak masuk.**

### 8.2 Canonical Connectivity Scenario

D 6600 WXY tidak mengirim data selama 42 menit.

- Visible sebagai Needs Attention di Vehicle List
- Status: Offline
- Dot indicator: offline color
- Freshness: "42 menit lalu"
- Destination: /tracking?vehicle=:plateSlug

### 8.3 Stale Position Handling

Jika vehicle position terakhir lebih dari 10 menit:
- Dot opacity berkurang
- Inspector menampilkan explanation: "Posisi terakhir X menit lalu"
- List row menampilkan stale indicator

---

## 9. Canonical Scenarios

### 9.1 Connectivity

D 6600 WXY:
- Tidak mengirim data 42 menit
- Visible sebagai Needs Attention
- Destination: /tracking?vehicle=:plateSlug

### 9.2 Overspeed

B 5678 TGP:
- 82 km/h
- 13:42
- Unreviewed
- Link: /safety?alert=:id

### 9.3 Route Deviation

B 1234 KJT:
- Deviasi 1,8 km
- Berlangsung 7 menit
- Link: /history?vehicle=:plateSlug&event=:id

**Jangan menambahkan detail waktu atau angka lain tanpa evidence.**

---

## 10. URL and Deep-Link Behavior

### 10.1 Route Patterns

| URL | Behavior |
|-----|----------|
| /tracking | List terbuka, inspector tertutup, fleet view |
| /tracking?vehicle=:plateSlug | Inspector terbuka untuk vehicle, list tersembunyi |
| /tracking?search=open | Command palette terbuka, list tersembunyi |
| URL dengan vehicle tidak ditemukan | Inspector error state, list tetap tersedia |
| URL dengan query tidak valid | Diabaikan, fallback ke /tracking |
| Browser back/forward | State dipulihkan dari URL |
| Reload dengan inspector terbuka | Inspector tetap terbuka |

### 10.2 URL as Source of Truth

URL adalah sumber selection state, bukan state component lokal semata.

### 10.3 Plate Slug Pattern

Format: `/tracking?vehicle=:plateSlug`

Huruf kecil, spasi plat dihapus.

---

## 11. Action Truth Table

| Element | User Intent | Action Class | Destination/state change | Persistence | Failure Behavior |
|---------|-------------|--------------|--------------------------|-------------|------------------|
| Vehicle row click | Pilih kendaraan | Persistent state | URL diperbarui, inspector dibuka, list disembunyikan | URL | Inspector error state + Back to List jika entity tidak ditemukan |
| Inspector close | Tutup detail | Persistent state | Vehicle param dihapus, list dipulihkan | URL | State lokal dipulihkan |
| L key | Toggle list | Persistent state | List dibuka dan inspector ditutup | Session | Tidak ada |
| I key | Toggle inspector | Persistent state | Inspector dibuka untuk selection aktif | Session + URL | Jika tidak ada selection, fokus pindah ke vehicle search |
| Escape key | Kembali dari inspector | Persistent state | Vehicle param dihapus dan list dipulihkan | URL | Tidak ada |
| Toolbar search | Cari kendaraan | Persistent state | /tracking?search=open | URL | Empty search state dengan clear query |
| Fit Fleet | Lihat seluruh kendaraan | Local map interaction | fitBounds memakai coordinate valid | Tidak perlu | Map control error state + Retry |
| Layer toggle | Ubah layer | Local map interaction | Layer visibility berubah | Session | Layer unavailable state |
| Zoom control | Ubah zoom | Local map interaction | Zoom level berubah | Tidak perlu | Control disabled jika map belum ready |
| Filter button | Filter kendaraan | Proposed query state | /tracking?status=:filter | URL | Empty filter state + Clear Filter |
| Sort button | Urutkan kendaraan | Proposed query state | /tracking?sort=:key | URL | Kembali ke default sort |
| Open vehicle record | Buka record kendaraan | Operational navigation | /vehicles/:id | Tidak perlu | Non-blocking error + Retry |
| Open task | Buka task aktif | Operational navigation | /tasks/:id | Tidak perlu | Entity unavailable state |
| Open alert | Buka safety alert | Operational navigation | /safety?alert=:id | Tidak perlu | Entity unavailable state |
| Open history | Buka event perjalanan | Operational navigation | /history?vehicle=:plateSlug&event=:id | Tidak perlu | Non-blocking error + Retry |
| Recenter | Fokus ke kendaraan | Local map interaction | Map menggunakan effective right padding dan easeTo | Tidak perlu | Map control error state |

Tidak ada Vehicle row double-click. Single click dan Enter memakai workflow yang
sama agar behavior dapat digunakan dengan mouse dan keyboard.

Toast boleh menjadi kanal tambahan untuk error, tetapi tidak menjadi satu-satunya
feedback dan tidak boleh mengaku action berhasil.

---

## 12. Data Contract

### 12.1 Source Entity dan Field

| Field | Source | Formula/normalization | Consumer |
|-------|--------|-----------------------|----------|
| Normalized vehicle status | Vehicle.status | toCanonicalStatus(status) | List, marker, filter |
| Selected vehicle | URL vehicle param | Parse plateSlug dan cari di vehicle store | Inspector |
| Freshness | Vehicle.last_update | now - last_update | List dan inspector |
| Not-transmitting condition | Vehicle.last_update | telemetryAge > 10 menit | List, marker, inspector |
| Explicit offline state | Vehicle.status | normalizedStatus === "offline" | List dan marker |
| Search result | Seluruh vehicle store | Plate, driver, task identifier | Vehicle List |
| Global search result | Seluruh demo store | Vehicle dan entity global | CommandPalette |
| Filter result | Vehicle store | Canonical status dan exception state | Vehicle List |
| Sort result | Filtered vehicle list | Severity, freshness, plate | Vehicle List |
| Active task | Task relation/store | Task yang aktif untuk selected vehicle | Inspector |
| Active alert | Alert entity store | Alert yang terkait selected vehicle | Inspector |
| Map coordinates | Vehicle latitude/longitude | Validasi coordinate range | Marker |
| Heading | Vehicle.heading | Normalize 0 sampai 359 | Marker |
| Speed | Vehicle.speed | km/h | List dan inspector |
| Telemetry timestamp | Vehicle.last_update | ISO timestamp | Freshness |

### 12.2 Freshness Bukan Offline Diagnosis

```

telemetryAge < 2 menit

-> Segar

2 menit <= telemetryAge <= 10 menit

-> Tertunda

telemetryAge > 10 menit

-> Tidak mengirim data

```

Status `offline` hanya digunakan jika tersedia sebagai explicit normalized
vehicle status.

Timestamp yang terlambat tidak cukup untuk menyimpulkan perangkat GPS rusak
atau offline.

### 12.3 useSpeedingMonitor Ownership

`useSpeedingMonitor.ts` sudah tersedia sebagai hook terpisah.

Monitor dijalankan tepat satu kali pada Tracking page atau demo-store layer.

Output monitor dinormalisasi menjadi alert entity dengan minimal:
- alert id;
- vehicle reference;
- recorded speed;
- location jika tersedia;
- timestamp;
- review state;
- source `demo-simulation`.

Hook interval/random saat ini adalah **explicit demo simulation**.

Alert entity harus bertahan selama demo session agar tidak hilang ketika
inspector ditutup atau component rerender.

DetailPanel menerima selected alert entity melalui props atau store selector.
DetailPanel tidak mengimpor atau menjalankan `useSpeedingMonitor`.

### 12.4 Search Ownership

Vehicle List search dan Global CommandPalette adalah dua entry point berbeda.

Keduanya membaca seluruh 25 kendaraan dari satu demo data store.

Jika `slice(0,8)` hanya terdapat di CommandPalette, limitation tersebut tidak
boleh disebut sebagai limitation Vehicle List search.

---

## 13. Interaction and State Matrix

### 13.1 State yang Harus Ditangani

| State | Visual | Message |
|-------|--------|---------|
| Initial loading | Skeleton shimmer | None |
| Map ready | Full map visible | None |
| Telemetry connected | Normal display | None |
| Telemetry delayed | Warning at top bar | "Fleet data delayed Xm ago" |
| Telemetry disconnected | Degraded state | "Koneksi terputus" |
| List open | List sidebar visible | None |
| Inspector open | Inspector overlay visible | None |
| No selection | List open, no highlight | None |
| Vehicle selected | Inspector open, list hidden | None |
| Deep link selected | Inspector open on load | None |
| Vehicle not found | Inspector error state + Back to List | "Kendaraan tidak ditemukan" |
| Search no result | Empty state | "Tidak ada hasil untuk {query}" |
| Filter empty | Empty state | "Tidak ada kendaraan dengan status ini" |
| Partial vehicle data | Row with missing fields | None |
| Invalid coordinate | Marker not rendered | None |
| Map error | Error boundary + retry | "Peta tidak dapat dimuat" |
| Permission limited | Feature hidden | None |
| Demo reset | Refresh all data | "Demo data telah direset" |

### 13.2 Pesan Operational

Pesan harus operational, bukan istilah teknis:
- "Koneksi terputus" bukan "WebSocket error"
- "Data belum diupdate" bukan "Telemetry timeout"
- "Kendaraan tidak ditemukan" bukan "404"

---

## 14. Responsive Grayscale Wireframes

### 14.1 Wireframe 1366x768 — List Terbuka

Rail 64px. List 320px. Map 982px visible.

```
+------+----------+------------------------------------------------+
|      |          | Realtime Monitor - 25 unit              [Map  ]
| [=]  | LIST    |                                                |
| [O]  | 320px   |                                                |
| [L]  |          |                                                |
| [T]  | [group] |                                                |
| [S]  | Berkend. |              MAP                              |
| [R]  | [items] |              982px visible                    |
| [A]  |          |                                                |
|      | [group] |                                                |
|      | [items] |                                                |
|      |          |                                                |
|      | [filter]|                                                |
+------+----------+------------------------------------------------+
  64px    320px                       982px
Total: 64 + 320 + 982 = 1366
```

### 14.2 Wireframe 1366x768 — Inspector Terbuka

Rail 64px. Inspector overlay 360px. Map 942px visible.

```
+------+------------------------------------------------+----------------+
|      | Realtime Monitor - 25 unit                      |           |
| [=]  |                                                    |  INSPEC  |
| [O]  |                                                    |  360px   |
| [L]  |              MAP                                 |          |
| [T]  |              942px visible                       |  [plate] |
| [S]  |                                                    |  [state] |
| [R]  |                                                    |  [task]  |
| [A]  |                                                    |  [act.]  |
|      |                                                    +----------+
+------+------------------------------------------------+
  64px                        942px                    360px
Total: 64 + 942 + 360 = 1366
```

### 14.3 Wireframe 1366x768 — Full Map

Rail 64px. List tersembunyi. Inspector tertutup.

```
+------+--------------------------------------------------------------------+
|      | Realtime Monitor - 25 unit                              [Map  ]
| [=]  +--------------------------------------------------------------------+
| [O]  | [Toolbar]                                        [Zoom] [Layers] |
| [L]  |                                                                   |
| [T]  |                                                                   |
| [S]  |                         MAP                                        |
| [R]  |                         1302px                                     |
| [A]  |                                                                   |
|      |                                                                   |
+------+--------------------------------------------------------------------+
  64px                              1302px
Total: 64 + 1302 = 1366
```

### 14.4 Wireframe 1440x900 — List Terbuka

Rail 64px. List 320px. Map 1056px visible.

```
+------+----------+------------------------------------------------+
|      |          | Realtime Monitor - 25 unit              [Map  ]
| [=]  | LIST    |                                                |
| [O]  | 320px   |                                                |
| [L]  |          |                                                |
| [T]  | [items] |              MAP                              |
| [S]  |          |              1056px visible                  |
| [R]  |          |                                                |
| [A]  |          |                                                |
+------+----------+------------------------------------------------+
  64px    320px                      1056px
Total: 64 + 320 + 1056 = 1440
```

### 14.5 Wireframe 1440x900 — Inspector Terbuka

Rail 64px. Inspector overlay 360px. Map 1016px visible.

```
+------+------------------------------------------------+----------------+
|      | Realtime Monitor - 25 unit                      |           |
| [=]  |                                                    |  INSPEC  |
| [O]  |                                                    |  360px   |
| [L]  |              MAP                                 |          |
| [T]  |              1016px visible                      |  [plate] |
| [S]  |                                                    |  [state] |
| [R]  |                                                    |  [task]  |
| [A]  |                                                    |  [act.]  |
|      |                                                    +----------+
+------+------------------------------------------------+
  64px                         1016px                   360px
Total: 64 + 1016 + 360 = 1440
```

### 14.6 Wireframe 1440x900 — Full Map

Rail 64px. Map 1376px.

```
+------+--------------------------------------------------------------------+
|      | Realtime Monitor - 25 unit                              [Map  ]
| [=]  +--------------------------------------------------------------------+
| [O]  | [Toolbar]                                        [Zoom] [Layers] |
| [L]  |                                                                   |
| [T]  |                                                                   |
| [S]  |                         MAP                                        |
| [R]  |                         1376px                                     |
| [A]  |                                                                   |
+------+--------------------------------------------------------------------+
  64px                              1376px
Total: 64 + 1376 = 1440
```

### 14.7 Wireframe 1920x1080 — List Terbuka

Rail 64px. List 320px. Map 1536px visible.

```
+------+----------+------------------------------------------------+
|      |          | Realtime Monitor - 25 unit              [Map  ]
| [=]  | LIST    |                                                |
| [O]  | 320px   |                                                |
| [L]  |          |                                                |
| [T]  | [items] |              MAP                              |
| [S]  |          |              1536px visible                  |
| [R]  |          |                                                |
| [A]  |          |                                                |
+------+----------+------------------------------------------------+
  64px    320px                      1536px
Total: 64 + 320 + 1536 = 1920
```

### 14.8 Wireframe 1920x1080 — Inspector Terbuka

Rail 64px. Inspector overlay 360px. Map 1496px visible.

```
+------+------------------------------------------------+----------------+
|      | Realtime Monitor - 25 unit                      |           |
| [=]  |                                                    |  INSPEC  |
| [O]  |                                                    |  360px   |
| [L]  |              MAP                                 |          |
| [T]  |              1496px visible                      |  [plate] |
| [S]  |                                                    |  [state] |
| [R]  |                                                    |  [task]  |
| [A]  |                                                    |  [act.]  |
|      |                                                    +----------+
+------+------------------------------------------------+
  64px                         1496px                   360px
Total: 64 + 1496 + 360 = 1920
```

### 14.9 Wireframe 1920x1080 — Full Map

Rail 64px. Map 1856px.

```
+------+--------------------------------------------------------------------+
|      | Realtime Monitor - 25 unit                              [Map  ]
| [=]  +--------------------------------------------------------------------+
| [O]  | [Toolbar]                                        [Zoom] [Layers] |
| [L]  |                                                                   |
| [T]  |                                                                   |
| [S]  |                         MAP                                        |
| [R]  |                         1856px                                   |
| [A]  |                                                                   |
+------+--------------------------------------------------------------------+
  64px                              1856px
Total: 64 + 1856 = 1920
```

### 14.10 Wireframe Tablet 768px

Rail 64px. List sebagai drawer dari kiri. Inspector sebagai bottom sheet.

```
+------+--------------------------------------------------------------------+
|      | Realtime Monitor - 25 unit                              [Map  ]
| [=]  +--------------------------------------------------------------------+
| [O]  | [Toolbar]                          [Zoom] [Layers] [L]            |
| [L]  |                                                                   |
| [T]  |                                                                   |
| [S]  |                         MAP                                        |
| [R]  |                         full-width                               |
| [A]  |                                                                   |
|      |                                                                   |
+------+--------------------------------------------------------------------+
  64px                              704px
Total: 64 + 704 = 768
```

List di tablet: drawer slide-in dari kiri (320px).
Inspector di tablet: bottom sheet slide-up (60% viewport).

---

## 15. Space Budget

### 15.1 Anggaran Ruang Horisontal

#### List Terbuka

| Viewport | Rail | List | Map Canvas | Total |
|----------|------|------|------------|-------|
| 1366 | 64 | 320 | 982 | 1366 |
| 1440 | 64 | 320 | 1056 | 1440 |
| 1920 | 64 | 320 | 1536 | 1920 |

#### Inspector Terbuka

| Viewport | Rail | Map Canvas | Occluded | Unoccluded | Total |
|----------|------|------------|----------|------------|-------|
| 1366 | 64 | 1302 | 360 | 942 | 1366 |
| 1440 | 64 | 1376 | 360 | 1016 | 1440 |
| 1920 | 64 | 1856 | 360 | 1496 | 1920 |

#### Full Map

| Viewport | Rail | Map Canvas | Total |
|----------|------|------------|-------|
| 1366 | 64 | 1302 | 1366 |
| 1440 | 64 | 1376 | 1440 |
| 1920 | 64 | 1856 | 1920 |

### 15.2 Verifikasi Persamaan

**1366 List:**
64 + 320 + 982 = 1366

**1366 Inspector:**
64 + 942 + 360 = 1366

**1366 Full:**
64 + 1302 = 1366

**1440 List:**
64 + 320 + 1056 = 1440

**1440 Inspector:**
64 + 1016 + 360 = 1440

**1440 Full:**
64 + 1376 = 1440

**1920 List:**
64 + 320 + 1536 = 1920

**1920 Inspector:**
64 + 1496 + 360 = 1920

**1920 Full:**
64 + 1856 = 1920

**Tablet:**
64 + 704 = 768

### 15.3 Three Metrics Summary

| Viewport | Map Canvas | Occluded | Unoccluded |
|----------|------------|----------|------------|
| 1366 | 1302px | 360px | 942px |
| 1440 | 1376px | 360px | 1016px |
| 1920 | 1856px | 360px | 1496px |

---

## 16. Typography dan Accessibility

### 16.1 Skala Minimum

| Jenis Informasi | Ukuran Minimum | Weight |
|----------------|---------------|--------|
| Plate number | 14px mono | semibold |
| Driver name atau Unassigned | 14px | normal |
| Status label | 14px | medium |
| Speed | 14px | normal |
| Freshness | 14px | normal |
| Exception indicator | 14px | medium |
| Task context | 14px | normal |
| Decision-critical timestamp | 14px | normal |
| Unit atau suffix non-kritis | 12px | normal |
| Group header non-kritis | 12px | semibold |
| Metadata non-kritis | 12px | normal |

Driver adalah informasi operasional, sehingga tidak boleh menggunakan 12px.

Uppercase hanya untuk plate number, singkatan operasional, atau kode yang
memang ditulis uppercase.

### 16.2 Keyboard Navigation

| Tombol | Aksi |
|--------|------|
| / atau Cmd+K | Buka search sesuai App Shell |
| L | Buka Vehicle List dan tutup inspector |
| I | Buka inspector untuk selection aktif |
| Escape | Tutup inspector dan pulihkan list |
| Arrow Up/Down | Navigasi Vehicle List |
| Enter | Pilih kendaraan |
| Tab | Pindah antar-interactive element |

Jika tombol I digunakan tanpa selection, fokus dipindahkan ke vehicle search.
Tidak boleh membuka inspector kosong.

### 16.3 Map Alternative

Vehicle List adalah alternative wajib bagi pengguna keyboard dan screen
reader. Informasi penting tidak boleh hanya tersedia melalui marker hover.

---

## 17. Performance Requirements

### 17.1 MapLibre Instance

- Satu instance MapLibre per page
- Cleanup listener saat unmount

### 17.2 Telemetry Updates

- Batch telemetry updates jika memungkinkan
- Jangan recreate semua marker untuk satu update
- Gunakan marker.setLngLat() untuk update posisi

### 17.3 Fit Bounds

- Jangan jalankan fitBounds pada setiap telemetry event
- Hanya saat initial load atau user action

### 17.4 Detail Lazy-Load

- Lazy-load detail non-kritis di inspector
- Task info, route, event history bisa di-lazy-load

### 17.5 Marker Animation

- Jangan menjalankan animasi marker terus-menerus
- Hanya saat position berubah

### 17.6 Loading States

- Skeleton hanya untuk initial load
- Update berikutnya tidak memblokir interaksi

### 17.7 Dataset Scope

Dataset demo tetap 25 kendaraan. Jangan mengarang target skala produksi tanpa evidence.

---

## 18. Anti AI Slop Verification

Buktikan:

1. **Map adalah workspace, bukan background dekoratif** — List dan inspector menyediakan workflow
2. **Tidak ada glass card dekoratif** — Wireframe hanya structural elements
3. **Tidak ada gradient hero** — Map texture cukup
4. **Tidak ada floating widget tanpa fungsi** — Setiap element punya action
5. **Tidak ada card di dalam inspector section** — Sections dengan dividers, bukan cards
6. **Tidak ada icon tanpa label, tooltip, atau makna status** — Setiap icon punya fungsi
7. **Tidak ada marker pulse massal** — Pulse hanya untuk selected atau alert
8. **Tidak ada teks operasional di bawah 14px** — Semua operational text 14px+
9. **Tidak ada lebih dari satu contextual surface** — List dan inspector mutual exclusion
10. **Tidak ada action yang hanya menghasilkan toast** — Semua action punya state atau destination

---

## 19. Implementation Notes

### 19.1 Behavior yang Dihapus

| Behavior | Alasan |
|----------|--------|
| Manual Refresh pada Map Toolbar | Telemetry memperbarui store otomatis |
| Success toast untuk map interaction | Map state adalah feedback utama |
| Leaflet CSS overrides | Runtime map menggunakan MapLibre |
| Leaflet dependencies | Technical leftovers tidak digunakan |

Demo Reset tetap berada pada Workspace Chip App Shell, bukan Map Toolbar.

### 19.2 Component yang Diubah

| Component | Perubahan |
|-----------|-----------|
| tracking/page.tsx | List 280px menjadi 320px; mutual exclusion; URL selection; single monitor owner |
| DetailPanel.tsx | Lebar 380px menjadi 360px; menerima selected alert melalui props/selector |
| Vehicle List search | Membaca seluruh 25 kendaraan dari demo store |
| CommandPalette | Menghapus subset slice(0,8), membaca seluruh demo store |
| Fit Fleet handler | Menjalankan fitBounds pada coordinate valid |
| Find handler | Membuka vehicle search state |
| Map Toolbar | Menghapus Manual Refresh |

DetailPanel tidak mengimpor `useSpeedingMonitor`.

### 19.3 Speeding Alert Integration

- `useSpeedingMonitor` memiliki satu owner pada page/store layer;
- hasil hook dinormalisasi menjadi alert entity;
- alert entity disimpan selama demo session;
- inspector hanya membaca alert terpilih;
- cleanup interval dilakukan ketika owner unmount;
- jangan membuat subscription baru ketika inspector dibuka.

### 19.4 Map Engine Cleanup

**Current runtime engine:** MapLibre GL.

**Technical leftovers:**
- leaflet;
- react-leaflet;
- @types/leaflet;
- Leaflet CSS overrides.

Technical leftovers dihapus pada implementation phase setelah memastikan tidak
ada import runtime yang bergantung padanya.

### 19.5 Regression Risk

| Risk | Mitigation |
|------|------------|
| List dan inspector terlihat bersamaan | Satu contextual-surface state machine |
| Duplicate monitor subscription | Single owner pada page/store layer |
| Alert hilang saat inspector ditutup | Persist alert entity di demo store |
| MapLibre instance ganda | Satu map owner dan cleanup saat unmount |
| URL dan selection tidak sinkron | URL sebagai selection source of truth |
| Marker update menyebabkan lag | Batch update dan mutasi marker position |
| Query state tidak dikenali | Parse, validate, dan fallback yang eksplisit |
| Coordinate invalid | Jangan render marker; tampilkan partial-data state |

---

## 20. Keputusan Produk Terkunci

### 20.1 Keputusan yang Sudah Dikunci

| Keputusan | Alasan |
|-----------|--------|
| List 320px, Inspector 360px | Skala konsisten dengan App Shell |
| Mutual exclusion list/inspector | Menjamin target ruang terpenuhi |
| Rail 64px di map-primary | App Shell tidak boleh dirancang ulang |
| Inspector overlay (absolute) | Map canvas tetap penuh |
| Selection di URL dengan plate slug | Shareable links |
| MapLibre GL satu-satunya engine | Implementation cleanup |
| Leaflet dihapus | Tidak digunakan |
| useSpeedingMonitor dimiliki page/store layer | Mencegah subscription ganda |
| Search seluruh 25 kendaraan | Tidak ada subset |
| Freshness ambang 2m dan 10m | Dari App Shell |

### 20.2 Pertanyaan Terbuka

Tidak ada pertanyaan terbuka pada tahap ini.

---

## 21. Definition of Done

- [x] MapLibre adalah satu-satunya engine dalam rancangan baru
- [x] List 320px dan inspector 360px
- [x] List dan inspector tidak pernah terbuka bersama
- [x] Rail 64px pada semua kondisi map-primary
- [x] Semua desktop wireframe menjumlah tepat
- [x] Inspector memakai effective right padding 360px
- [x] Recenter memiliki displacement visual 180px
- [x] Selection tersimpan di URL
- [x] Search mencakup seluruh 25 kendaraan
- [x] Filter dan sort memiliki behavior lengkap
- [x] Freshness memakai ambang 2 dan 10 menit
- [x] Tidak ada diagnosis GPS rusak tanpa data eksplisit
- [x] useSpeedingMonitor dikenali sebagai hook terpisah
- [x] Tidak ada toast-only action
- [x] Informasi operasional minimum 14px
- [x] Ketiga canonical scenario memiliki route benar
- [x] Narasi bahasa Indonesia dan bebas karakter CJK
- [x] Tidak ada code, CSS, component, route, atau dependency yang diubah

---
- [x] useSpeedingMonitor memiliki tepat satu owner
- [x] DetailPanel tidak menjalankan useSpeedingMonitor
- [x] Demo alert diklasifikasikan sebagai explicit demo simulation
- [x] Not-transmitting dipisahkan dari explicit offline state
- [x] Driver name minimum 14px
- [x] Tidak ada Vehicle row double-click
- [x] Manual Refresh dihapus dari Map Toolbar


## 22. Chat Output

### 22.1 Tiga Kondisi Layout Final

| Kondisi | 1366 | 1440 | 1920 |
|---------|------|------|-------|
| List terbuka | 64+320+982=1366 | 64+320+1056=1440 | 64+320+1536=1920 |
| Inspector terbuka | 64+942+360=1366 | 64+1016+360=1440 | 64+1496+360=1920 |
| Full map | 64+1302=1366 | 64+1376=1440 | 64+1856=1920 |

### 22.2 Vehicle List Information Hierarchy

```

[STATUS] PLATE NUMBER                      SPEED

Driver Name atau Unassigned

Operational state · Freshness · Exception

```

Semua informasi operasional minimum 14px.

### 22.3 Vehicle Inspector Information Hierarchy

```

Identity

State

Context

Actions

Links

```

Inspector menerima selected alert entity dari page/store. Inspector tidak
menjalankan monitor sendiri.

### 22.4 URL State

| URL | Behavior |
|-----|----------|
| /tracking | List terbuka, inspector tertutup |
| /tracking?vehicle=:plateSlug | Inspector terbuka, list tertutup |
| /tracking?search=open | Search terbuka |
| vehicle tidak ditemukan | Inspector error state, kembali ke list tersedia |

### 22.5 Current Behavior dan Target

| Area | Kondisi sekarang | Target |
|------|------------------|--------|
| Fit Fleet | Handler belum menghasilkan map state lengkap | fitBounds pada coordinate valid |
| Find | Handler belum membuka workflow search lengkap | Vehicle search state |
| Manual Refresh | Feedback sementara | Tombol dihapus; telemetry auto-update |
| Speeding monitor | Hook terpisah sudah tersedia | Single owner + persistent alert entity |
| Global CommandPalette | Menggunakan subset | Seluruh demo store |
| Runtime map | MapLibre GL | MapLibre GL dengan Leaflet leftovers dibersihkan |

Evidence menemukan dua kemunculan toast/setTimeout pada Tracking. Angka tersebut
adalah jumlah source occurrence, bukan jumlah action.

### 22.6 Keputusan Produk yang Masih Terbuka

Tidak ada keputusan terbuka. Seluruh keputusan sudah dikunci.

