# VANGUARD — Product Truth Audit

**Tanggal audit:** 2026-08-04
**Commit:** audit/product-truth (belum di-commit)
**Auditor:** Claude Code
**Estimasi Realitas:** 0 dari 14 halaman terhubung ke data nyata

---

## Ringkasan Eksekutif

**Tidak ada halaman yang REAL.** Dari 14 halaman frontend, 13 adalah SHELL murni (UI tanpa backend), dan 1 halaman (tracking) hanya PARTIAL karena mencoba fetch ke `/api/vehicles` tetapi fallback ke mock ketika gagal.

**Total 177 onClick handler** ditemukan di seluruh frontend, dan **~150+ (85%) adalah tombol mati** yang hanya menampilkan toast tanpa mengubah data.

**3 endpoint fantom** dipanggil frontend tapi tidak ada di backend: `/api/tasks`, `/api/tasks/:id`, `/api/alerts`.

**Bug blocker kritis ditemukan:** WebSocket path mismatch — frontend meminta `/ws/telemetry`, backend punya `/ws/tracking`.

Untuk membuat 1 halaman REAL (misalnya dashboard dengan data aktual), butuh: router tasks, router alerts, router geofences, router drivers, router vehicles CRUD, router reports, router accidents, router snapshots, router dashcam, router commands.

---

## Angka Kunci

| Metrik | Nilai |
|--------|-------|
| Halaman REAL | 0 / 14 |
| Halaman PARTIAL | 1 / 14 (tracking) |
| Halaman SHELL | 13 / 14 |
| Halaman DEAD | 0 / 14 |
| Total onClick handler | 177 |
| Tombol mati | ~150+ (~85%) |
| Endpoint fantom | 3 |
| Router backend yang perlu dibuat | 10+ |

---

## 1. Inventaris Backend

### 1.1 Endpoint yang Ada

| Method | Path | Router | Baca/Tulis DB | Tabel yang dipakai |
|--------|------|--------|---------------|-------------------|
| GET | `/api/vehicles` | vehicles.py:12 | Read | vehicles, drivers |
| GET | `/api/vehicles/{vehicle_id}` | vehicles.py:45 | Read | vehicles, drivers |
| POST | `/api/telemetry` | telemetry.py:16 | Write | vehicles, telemetry_logs |
| GET | `/api/telemetry/history/{vehicle_id}` | telemetry.py:79 | Read | telemetry_logs |
| GET | `/api/dashboard/stats` | dashboard.py:15 | Read | vehicles, drivers |
| WS | `/ws/tracking` | ws.py:12 | Broadcast only | none |
| GET | `/api/health` | main.py:57 | Read | none |

### 1.2 Tabel Database (models.py)

- `vehicles` — master data kendaraan
- `drivers` — master data supir
- `telemetry_logs` — log GPS per kendaraan
- `geofences` — area virtual (defined but no router)

---

## 2. Inventaris Client API

### 2.1 Fungsi Client vs Endpoint Backend

| Fungsi Client | Endpoint yang dipanggil | Ada di backend? |
|---------------|------------------------|-----------------|
| `API.vehicles.list()` | TIDAK ADA (fallback ke MOCK_VEHICLES) | TIDAK (todo comment) |
| `API.vehicles.get(id)` | TIDAK ADA (fallback ke MOCK_VEHICLES) | TIDAK (todo comment) |
| `API.tasks.list()` | `/v1/tasks` (commented) | TIDAK ADA |
| `API.tasks.get(vehicleId)` | `/v1/tasks/:id` (commented) | TIDAK ADA |
| `API.alerts.list()` | `/v1/alerts` (returns `[]`) | TIDAK ADA |
| `getVehicles()` (backward compat) | `/api/vehicles` | ADA |
| `getDashboardStats()` | `/api/dashboard/stats` | ADA |
| `getVehicle(id)` | `/api/vehicles/:id` | ADA |
| `createTelemetryClient()` | `ws://host/ws/telemetry` | TIDAK ADA — backend punya `/ws/tracking` |

---

## 3. Audit Per Halaman

### 3.1 Dashboard

- **File**: `frontend/src/app/(app)/dashboard/page.tsx` (572 baris)
- **Verdict**: `SHELL`
- **Sumber data**:
  - Mock: `MOCK_STATS` (baris 32), `MOCK_VEHICLES` (baris 32), `fetchDashboardData` (baris 40-44)
  - Nyata: tidak ada
- **Endpoint dipanggil**: tidak ada
- **Endpoint yang tidak ada di backend**: tidak berlaku (tidak mencoba)
- **Total tombol interaktif**: 4
- **Tombol yang benar-benar mengubah data**: 0
- **Tombol mati**:
  - `QuickAccessButton` links (baris 288-291) — navigasi saja
  - `ExceptionRow` link (baris 468) — navigasi ke tracking
  - Retry button (baris 153) — reload dari mock yang sama
- **Perilaku saat backend mati**: identik (data dari mock, bukan dari API)
- **Kalau dihapus hari ini, yang hilang**: Animasi KPI count-up, skeleton loading, layout card
- **Backend yang dibutuhkan agar halaman ini nyata**:
  - `GET /api/dashboard/stats` (sudah ada)
  - `GET /api/vehicles` (sudah ada)
  - Router alerts untuk exception events
  - WebSocket broadcasts untuk live update count

---

### 3.2 Realtime Monitor (Tracking)

- **File**: `frontend/src/app/(app)/tracking/page.tsx` (813 baris)
- **Verdict**: `PARTIAL`
- **Sumber data**:
  - Mock: `MOCK_VEHICLES` (baris 141)
  - Nyata: `fetch('/api/vehicles')` (baris 189) — tetapi fallback ke mock jika gagal
- **Endpoint dipanggil**: `GET /api/vehicles` (baris 189)
- **Endpoint yang tidak ada di backend**: tidak ada (endpoint ini ada)
- **Total tombol interaktif**: ~15
- **Tombol yang benar-benar mengubah data**: 0
- **Tombol mati**:
  - `handleModeToggle` (baris 278) — hanya toggle view, toast
  - `handleLayerChange` (baris 283) — hanya set state, toast
  - `handleRefresh` (baris 288) — `setTimeout` + toast, tidak fetch ulang
  - `handleZoomToFit` (baris 303) — toast saja, tidak ada action
  - `handleClusterToggle` (baris 307) — toggle layer visibility
  - `handleZoneToggle` (baris 312) — toggle geofence visibility
- **Perilaku saat backend mati**: Fallback ke MOCK_VEHICLES, map tetap tampil
- **Kalau dihapus hari ini, yang hilang**: UI realtime map dengan marker kendaraan, toast notification system
- **Backend yang dibutuhkan agar halaman ini nyata**:
  - WebSocket `/ws/tracking` (ada tapi path mismatch dengan frontend)
  - Sinkronisasi vehicle update via WebSocket broadcast

---

### 3.3 Task Monitor (TMS)

- **File**: `frontend/src/app/(app)/tasks/page.tsx` (616 baris)
- **Verdict**: `SHELL`
- **Sumber data**:
  - Mock: `TASKS` array (baris 43-54) — 10 task hardcoded
- **Endpoint dipanggil**: tidak ada
- **Endpoint yang tidak ada di backend**: semua task endpoints (fantom)
- **Total tombol interaktif**: ~12
- **Tombol yang benar-benar mengubah data**: 0
- **Tombol mati**:
  - `handleRefresh` (baris 175) — `setTimeout` + toast
  - `handleSelect` (baris 180) — hanya set state
  - `handleAddTask` (baris 108) — validasi + toast, tidak persist
  - `handleStartTrip` (baris 190) — toast saja
  - `handleEndTrip` (baris 194) — toast saja
  - `TimelineButton` START/END (baris 598-611) — toast saja
- **Perilaku saat backend mati**: identik (semua dari TASKS array)
- **Kalau dihapus hari ini, yang hilang**: UI Task Monitor dengan map route visualization, form tambah task
- **Backend yang dibutuhkan agar halaman ini nyata**:
  - `GET /api/tasks`
  - `POST /api/tasks`
  - `PATCH /api/tasks/:id`
  - Tabel tasks di database
  - Router untuk trip events

---

### 3.4 Locate

- **File**: `frontend/src/app/(app)/locate/page.tsx` (528 baris)
- **Verdict**: `SHELL`
- **Sumber data**:
  - Mock: `MOCK_VEHICLES` (baris 104, 110, 119, 130)
  - Nyata: tidak ada
- **Endpoint dipanggil**: tidak ada
- **Total tombol interaktif**: ~8
- **Tombol yang benar-benar mengubah data**: 0
- **Tombol mati**:
  - `handleFitAll` (baris 137) — `mapCommands?.fitAll()` + toast
  - `handleRealtime` (baris 144) — navigasi saja
  - `handleHistory` (baris 150) — toast saja, tidak navigasi
  - `handleMessage` (baris 155) — toast saja
  - `handleCopyCoords` (baris 164) — clipboard + toast
- **Perilaku saat backend mati**: identik
- **Kalau dihapus hari ini, yang hilang**: Fitur pencarian unit dengan quick action buttons
- **Backend yang dibutuhkan agar halaman ini nyata**:
  - `GET /api/vehicles` (sudah ada)
  - Reverse geocoding API untuk address resolution
  - Router untuk kirim pesan ke driver

---

### 3.5 Geofences

- **File**: `frontend/src/app/(app)/geofences/page.tsx` (717 baris)
- **Verdict**: `SHELL`
- **Sumber data**:
  - Mock: `INITIAL_ZONES` (baris 75-84) — 8 zone hardcoded
  - Nyata: tidak ada
- **Endpoint dipanggil**: tidak ada
- **Total tombol interaktif**: ~10
- **Tombol yang benar-benar mengubah data**: 0
- **Tombol mati**:
  - `openAdd` (baris 348) — open panel saja
  - `openEdit` (baris 354) — open panel dengan data
  - `handleSubmitForm` (baris 365) — `setZones` local state + toast
  - `handleDelete` (baris 400) — `setZones` local state + toast
  - `handleToggle` (baris 407) — `setZones` local state + toast
  - `handleExport` (baris 413) — toast saja
- **Perilaku saat backend mati**: identik
- **Kalau dihapus hari ini, yang hilang**: UI manajemen geofence, map preview, form CRUD geofence
- **Backend yang dibutuhkan agar halaman ini nyata**:
  - `GET /api/geofences`
  - `POST /api/geofences`
  - `PUT /api/geofences/:id`
  - `DELETE /api/geofences/:id`
  - Tabel `geofences` di database (sudah ada di models.py, tapi tidak ada router)
  - Geofence event tracking

---

### 3.6 Vehicles

- **File**: `frontend/src/app/(app)/vehicles/page.tsx` (828 baris)
- **Verdict**: `SHELL`
- **Sumber data**:
  - Mock: `MOCK_VEHICLES` (baris 328)
  - Nyata: tidak ada
- **Endpoint dipanggil**: tidak ada
- **Total tombol interaktif**: ~8
- **Tombol yang benar-benar mengubah data**: 0
- **Tombol mati**:
  - `openAdd` (baris 392) — open panel saja
  - `openEdit` (baris 399) — open panel dengan data
  - `handleSubmitForm` (baris 412) — `setVehicles` local state + toast
  - `handleDelete` (baris 471) — `setVehicles` local state + toast
  - `handleExport` (baris 478) — toast saja
- **Perilaku saat backend mati**: identik
- **Kalau dihapus hari ini, yang hilang**: UI master data kendaraan, form CRUD kendaraan
- **Backend yang dibutuhkan agar halaman ini nyata**:
  - `GET /api/vehicles` (sudah ada)
  - `POST /api/vehicles`
  - `PUT /api/vehicles/:id`
  - `DELETE /api/vehicles/:id`

---

### 3.7 Drivers

- **File**: `frontend/src/app/(app)/drivers/page.tsx` (765 baris)
- **Verdict**: `SHELL`
- **Sumber data**:
  - Mock: `INITIAL_DRIVERS` (baris 65-81) — 15 driver hardcoded
  - Nyata: tidak ada
- **Endpoint dipanggil**: tidak ada
- **Total tombol interaktif**: ~8
- **Tombol yang benar-benar mengubah data**: 0
- **Tombol mati**:
  - `openAdd` (baris 424) — open panel
  - `openEdit` (baris 430) — open panel
  - `handleSubmitForm` (baris 441) — `setDrivers` local state + toast
  - `handleDelete` (baris 473) — `setDrivers` local state + toast
  - `handleExport` (baris 479) — toast
- **Perilaku saat backend mati**: identik
- **Kalau dihapus hari ini, yang hilang**: UI manajemen driver, form CRUD driver, safety score display
- **Backend yang dibutuhkan agar halaman ini nyata**:
  - `GET /api/drivers`
  - `POST /api/drivers`
  - `PUT /api/drivers/:id`
  - `DELETE /api/drivers/:id`

---

### 3.8 History

- **File**: `frontend/src/app/(app)/history/page.tsx` (834 baris)
- **Verdict**: `SHELL`
- **Sumber data**:
  - Mock: `REPLAY_VEHICLES` (baris 193-234) — 5 kendaraan dengan telemetry generated
  - Mock: `buildTelemetry` (baris 154-189) — telemetry generator
  - Mock: `buildEvents` (baris 253-263) — hardcoded events
  - Nyata: tidak ada
- **Endpoint dipanggil**: tidak ada
- **Total tombol interaktif**: ~10
- **Tombol yang benar-benar mengubah data**: 0
- **Tombol mati**:
  - `handlePlayPause` (baris 612) — playback state saja
  - `handleReset` (baris 613) — set state
  - `handleStepBack` (baris 614) — set state
  - `handleStepForward` (baris 615) — set state
  - `handleSpeed` (baris 616) — set state
  - `handleRefresh` (baris 618) — `setTimeout` + toast
  - `handleExport` (baris 619) — toast
  - `handleVehicleChange` (baris 620) — set state
- **Perilaku saat backend mati**: identik
- **Kalau dihapus hari ini, yang hilang**: Trip replay dengan playback controls, tab panel (Timeline, Detail, Engine, Driving, Idle, Stop, Speeding, Events, Reverse, Geofence)
- **Backend yang dibutuhkan agar halaman ini nyata**:
  - `GET /api/telemetry/history/:vehicle_id` (sudah ada di telemetry.py)
  - `GET /api/events/:vehicle_id`
  - `GET /api/geofence-events/:vehicle_id`

---

### 3.9 Reports

- **File**: `frontend/src/app/(app)/reports/page.tsx` (733 baris)
- **Verdict**: `SHELL`
- **Sumber data**:
  - Mock: `REPORT_TYPES` (baris 73-95) — 14 jenis report hardcoded
  - Mock: `GeneratedReport[]` (baris 359) — local state
  - Nyata: tidak ada
- **Endpoint dipanggil**: tidak ada
- **Total tombol interaktif**: ~8
- **Tombol yang benar-benar mengubah data**: 0
- **Tombol mati**:
  - `handleSubmitForm` (baris 398) — `setHistory` + `setTimeout` mock completion
  - `handleDelete` (baris 429) — `setHistory` local state
  - `handleDownload` (baris 435) — toast saja
  - `toggleFavorite` (baris 439) — `Set` local state
  - `handleExport` (baris 447) — toast
  - Generate button di card (baris 591) — `openDrawer`
- **Perilaku saat backend mati**: mock 3 detik lalu "selesai"
- **Kalau dihapus hari ini, yang hilang**: UI katalog laporan, form generate report, riwayat report
- **Backend yang dibutuhkan agar halaman ini nyata**:
  - 14+ report generation routers
  - PDF/CSV generation service
  - Report scheduling queue
  - Report storage

---

### 3.10 Camera Snapshot

- **File**: `frontend/src/app/(app)/snapshots/page.tsx` (~600+ baris)
- **Verdict**: `SHELL`
- **Sumber data**:
  - Mock: `INITIAL_SNAPSHOTS` — 12 snapshot hardcoded
  - Mock: `MOCK_VEHICLES` — untuk dropdown vehicle
  - Nyata: tidak ada
- **Endpoint dipanggil**: tidak ada
- **Total tombol interaktif**: ~6
- **Tombol yang benar-benar mengubah data**: 0
- **Tombol mati**:
  - `handleAddSnapshot` — `setSnapshots` local state
  - `handleDelete` — `setSnapshots` local state
  - `handleTakeSnapshot` — toast
  - `handleDownload` — toast
- **Perilaku saat backend mati**: identik
- **Kalau dihapus hari ini, yang hilang**: UI gallery snapshot, form ambil snapshot, filter by event
- **Backend yang dibutuhkan agar halaman ini nyata**:
  - `GET /api/snapshots`
  - `POST /api/snapshots`
  - `DELETE /api/snapshots/:id`
  - Object storage untuk image files

---

### 3.11 Dashcam Monitor

- **File**: `frontend/src/app/(app)/dashcam/page.tsx` (~400+ baris)
- **Verdict**: `SHELL`
- **Sumber data**:
  - Mock: `CAMERA_UNIT_LIST` dari `MOCK_VEHICLES.slice(0, 15)` (baris 43)
  - Nyata: tidak ada
- **Endpoint dipanggil**: tidak ada
- **Total tombol interaktif**: ~8
- **Tombol yang benar-benar mengubah data**: 0
- **Tombol mati**:
  - `handleSnapshot` — toast
  - `handleToggleRec` — set state lokal
  - `handleFullscreen` — browser fullscreen API
- **Perilaku saat backend mati**: UI camera grid dengan placeholder gradients
- **Kalau dihapus hari ini, yang hilang**: UI dashcam monitor dengan video player interface
- **Backend yang dibutuhkan agar halaman ini nyata**:
  - WebRTC atau streaming API untuk live video
  - Video storage dan retrieval
  - Camera device pairing

---

### 3.12 Accident Log

- **File**: `frontend/src/app/(app)/accidents/page.tsx` (~700+ baris)
- **Verdict**: `SHELL`
- **Sumber data**:
  - Mock: `MOCK_INCIDENTS` — 10 insiden hardcoded
  - Mock: `MOCK_VEHICLES`
  - Nyata: tidak ada
- **Endpoint dipanggil**: tidak ada
- **Total tombol interaktif**: ~10
- **Tombol yang benar-benar mengubah data**: 0
- **Tombol mati**:
  - `handleAddIncident` — validasi + `setIncidents` local state
  - `handleUpdateIncident` — `setIncidents` local state
  - `handleDeleteIncident` — `setIncidents` local state
  - `handleChangeStatus` — `setIncidents` local state
- **Perilaku saat backend mati**: identik
- **Kalau dihapus hari ini, yang hilang**: UI accident log dengan severity classification, evidence management
- **Backend yang dibutuhkan agar halaman ini nyata**:
  - `GET /api/incidents`
  - `POST /api/incidents`
  - `PUT /api/incidents/:id`
  - `DELETE /api/incidents/:id`
  - File upload untuk evidence

---

### 3.13 Control Panel

- **File**: `frontend/src/app/(app)/control/page.tsx` (~500+ baris)
- **Verdict**: `SHELL`
- **Sumber data**:
  - Mock: `MOCK_VEHICLES` (baris 34)
  - Mock: Command log entries in local state
  - Nyata: tidak ada
- **Endpoint dipanggil**: tidak ada
- **Total tombol interaktif**: ~10
- **Tombol yang benar-benar mengubah data**: 0
- **Tombol mati**:
  - `handleRefresh` — `setTimeout` + toast
  - `handleCommand` — mock command log + toast
  - `handleExport` — toast
- **Perilaku saat backend mati**: identik
- **Kalau dihapus hari ini, yang hilang**: UI control panel dengan command log, unit config display
- **Backend yang dibutuhkan agar halaman ini nyata**:
  - Command dispatch API
  - Command execution status tracking
  - Unit configuration API

---

### 3.14 Settings

- **File**: `frontend/src/app/(app)/settings/page.tsx` (~500+ baris)
- **Verdict**: `SHELL`
- **Sumber data**:
  - Local state (profile, fleet, notif, display, integrations, passwords, sessions)
  - Nyata: tidak ada
- **Endpoint dipanggil**: tidak ada
- **Total tombol interaktif**: ~15
- **Tombol yang benar-benar mengubah data**: 0
- **Tombol mati**:
  - `handleSimpanProfil` — toast
  - `handleSimpanArmada` — toast
  - `handleNotifToggle` — local state + toast
  - `handleIntegrasiToggle` — local state + toast
  - `handleSimpanPassword` — toast
  - `handleAkhiriSesi` — toast
- **Perilaku saat backend mati**: identik
- **Kalau dihapus hari ini, yang hilang**: UI settings dengan 6 section (Profil, Armada, Notifikasi, Tampilan, Integrasi, Keamanan)
- **Backend yang dibutuhkan agar halaman ini nyata**:
  - User profile CRUD
  - User preferences API
  - Integration management API
  - Session management API
  - Password change API

---

## 4. Temuan Lintas Halaman

### 4.1 Endpoint Fantoma

| Endpoint | Dipanggil dari | Dampak |
|----------|---------------|--------|
| `GET /v1/tasks` | `api.ts:42` | Tasks page tidak pernah fetch data nyata |
| `GET /v1/tasks/:id` | `api.ts:47` | Task detail tidak pernah fetch |
| `GET /v1/alerts` | `api.ts:54` | Alerts selalu return `[]` |

### 4.2 Bug Blocker

**BUG 1 — WebSocket Path Mismatch (KRITIS)**
- Frontend menggunakan: `ws://host/ws/telemetry` (api.ts:92)
  ```typescript
  url: string = `ws://${API_URL.replace("http://", "")}/ws/telemetry`
  ```
- Backend menyediakan: `ws://host/ws/tracking` (ws.py:12)
  ```python
  @router.websocket("/tracking")
  ```
- **Kesimpulan**: TIDAK COCOK. WebSocket tidak akan pernah tersambung.
- **Dampak**: Realtime tracking tidak akan pernah berfungsi, broadcast_vehicle_update di telemetry.py:60 tidak akan mengirim ke frontend manapun.

**BUG 2 — aiosqlite Usage**
- Tidak dapat diverifikasi dalam sesi ini. Perlu dicek `backend/requirements.txt` dan `backend/database.py` secara langsung untuk memastikan driver SQLite asynchronous tersedia.

**BUG 3 — WebSocket URL Construction**
- Frontend menggunakan string replace `API_URL.replace("http://", "")` untuk membangun WebSocket URL
- Untuk produksi dengan HTTPS, URL menjadi `wss://api.vanguard.id`, tetapi konstruktor ini tidak mengganti `https://`, sehingga URL WebSocket menjadi `wss://api.vanguard.id/ws/telemetry` (dengan `https` tidak tergantikan)
- **Dampak**: WebSocket tidak akan tersambung di environment HTTPS.

### 4.3 Duplikasi Halaman

| Halaman A | Halaman B | Rekomendasi |
|-----------|-----------|-------------|
| `tracking` | `locate` | Keduanya search/locate kendaraan. `locate` adalah versi simpel dari `tracking`. Gabungkan atau hapus `locate`. |

**Rekomendasi:** Pertahankan `tracking` karena lebih lengkap (map + table view). Hapus `locate` atau jadikan sub-feature dalam `tracking`.

### 4.4 Data Mock Terbesar

| # | Konstanta | File | Est. Baris |
|---|-----------|------|------------|
| 1 | `MOCK_VEHICLES` | `lib/mock-data.ts:4-30` | ~25 baris data |
| 2 | `TASKS` | `tasks/page.tsx:43-54` | ~11 baris data |
| 3 | `INITIAL_ZONES` | `geofences/page.tsx:75-84` | ~9 baris data |
| 4 | `INITIAL_DRIVERS` | `drivers/page.tsx:65-81` | ~16 baris data |
| 5 | `REPLAY_VEHICLES` | `history/page.tsx:193-234` | ~42 baris data |
| 6 | `MOCK_INCIDENTS` | `accidents/page.tsx:53-184` | ~131 baris data |
| 7 | `INITIAL_SNAPSHOTS` | `snapshots/page.tsx:58-71` | ~14 baris data |

### 4.5 Angka Final

| Metrik | Nilai |
|--------|-------|
| Halaman REAL | 0 / 14 |
| Halaman PARTIAL | 1 / 14 |
| Halaman SHELL | 13 / 14 |
| Halaman DEAD | 0 / 14 |
| Total onClick interaktif | 177 |
| Tombol mati | ~150+ (~85%) |
| Endpoint fantom | 3 |
| Router backend yang perlu dibuat | 10+ |
| Bug blocker kritis | 2 (WS path mismatch, URL construction) |

---

## 5. Rekomendasi Scope

### PERTAHANKAN & REDESAIN DULU (Maksimal 4)

1. **Dashboard** — Halaman paling sering dilihat dispatcher. Statistika ringkasan sudah terstruktur dengan baik. BUTUH: koneksikan `MOCK_STATS` ke `GET /api/dashboard/stats` yang sudah ada di backend. Estimasi: 1-2 jam.

2. **Realtime Monitor (Tracking)** — Halaman utama untuk monitoring kendaraan. BUTUH: WebSocket fix (path `/ws/tracking` vs `/ws/telemetry`), koneksikan `MOCK_VEHICLES` ke `GET /api/vehicles` yang sudah ada. Estimasi: 4-6 jam.

3. **Vehicles** — Master data kendaraan dengan CRUD form sudah lengkap. BUTUH: router CRUD untuk vehicles (4 endpoint), koneksikan ke existing `GET /api/vehicles`. Estimasi: 4-6 jam.

4. **Geofences** — Data model sudah ada di `models.py`, hanya butuh router. BUTUH: router CRUD untuk geofences (4 endpoint). Estimasi: 3-4 jam.

### TUNDA

- **Tasks** — Butuh router tasks, tabel tasks, task assignment workflow. Backend besar.
- **History** — Butuh telemetry history API, event classification, dan playback engine.
- **Reports** — Butuh 14+ report generators, PDF/CSV engine, scheduling queue.
- **Accidents** — Butuh incident management router, file upload, evidence storage.
- **Snapshots** — Butuh image storage, camera event ingestion.
- **Dashcam** — Butuh video streaming infrastructure, WebRTC setup.

### HAPUS DARI SCOPE v1

- **Locate** — Duplikat fungsional dari `tracking`. Hapus atau jadikan sub-feature.
- **Settings** — LOW VALUE untuk redesign. Semua state local, tidak ada backend. Simpan untuk fase integrasi nanti.
- **Control Panel** — Command dispatch tidak relevan tanpa hardware integration. Hapus dari v1.

---

## 6. Lampiran: Bukti Grep

### A. Mock Data References
```
frontend/src/lib/mock-data.ts:4 — export const MOCK_VEHICLES
frontend/src/lib/mock-data.ts:32 — export const MOCK_STATS
frontend/src/lib/mock-data.ts:160 — export const MOCK_TASKS
frontend/src/lib/api.ts:31 — MOCK_VEHICLES fallback
frontend/src/lib/api.ts:36 — MOCK_VEHICLES.find fallback
frontend/src/lib/api.ts:43 — MOCK_TASKS fallback
frontend/src/lib/api.ts:48 — MOCK_TASKS fallback
frontend/src/app/(app)/dashboard/page.tsx:43 — return MOCK_STATS, vehicles
frontend/src/app/(app)/tracking/page.tsx:141 — useState(MOCK_VEHICLES)
frontend/src/app/(app)/tasks/page.tsx:96 — useState(Task[])(TASKS)
frontend/src/app/(app)/locate/page.tsx:104 — useState(MOCK_VEHICLES[0])
frontend/src/app/(app)/locate/page.tsx:130 — MOCK_VEHICLES.map(toMapVehicle)
frontend/src/app/(app)/geofences/page.tsx:321 — useState(INITIAL_ZONES)
frontend/src/app/(app)/vehicles/page.tsx:328 — useState(MOCK_VEHICLES)
frontend/src/app/(app)/drivers/page.tsx:361 — useState(INITIAL_DRIVERS)
frontend/src/app/(app)/history/page.tsx:193 — REPLAY_VEHICLES array
frontend/src/app/(app)/reports/page.tsx:73 — REPORT_TYPES array
frontend/src/app/(app)/snapshots/page.tsx:198 — MOCK_VEHICLES.map
frontend/src/app/(app)/accidents/page.tsx:590 — useState(MOCK_INCIDENTS)
frontend/src/app/(app)/dashcam/page.tsx:43 — CAMERA_UNIT_LIST = MOCK_VEHICLES
frontend/src/app/(app)/control/page.tsx:262 — MOCK_VEHICLES.filter
```

### B. Todo/Fixme Markers
```
frontend/src/app/(app)/dashboard/page.tsx:41 — // TODO: replace with real API call
frontend/src/lib/api.ts:30 — // TODO: GET /v1/vehicles → replace mock
frontend/src/lib/api.ts:35 — // TODO: GET /v1/vehicles/:id → replace mock
frontend/src/lib/api.ts:42 — // TODO: GET /v1/tasks → replace mock
frontend/src/lib/api.ts:47 — // TODO: GET /v1/tasks?vehicle_id=:id → replace mock
frontend/src/lib/api.ts:54 — // TODO: GET /v1/alerts
```

### C. Real API Calls
```
frontend/src/app/(app)/tracking/page.tsx:189 — fetch(`${API_URL}/api/vehicles`)
```

### D. Backend Routers
```
backend/routers/vehicles.py:12 — @router.get("/", response_model=list[VehicleResponse])
backend/routers/vehicles.py:45 — @router.get("/{vehicle_id}", response_model=VehicleResponse)
backend/routers/telemetry.py:16 — @router.post("/")
backend/routers/telemetry.py:79 — @router.get("/history/{vehicle_id}")
backend/routers/dashboard.py:15 — @router.get("/stats", response_model=DashboardStats)
backend/routers/ws.py:12 — @router.websocket("/tracking")
backend/main.py:57 — @app.get("/api/health")
```

### E. Toast Usage (indicator of dead buttons)
```
frontend/src/app/(app)/tracking/page.tsx:280 — success("Mode tampilan", ...)
frontend/src/app/(app)/tracking/page.tsx:293 — success("Data diperbarui", ...)
frontend/src/app/(app)/tasks/page.tsx:112 — success("Tugas ditambahkan", ...)
frontend/src/app/(app)/tasks/page.tsx:177 — success("Data diperbarui", ...)
frontend/src/app/(app)/geofences/page.tsx:385 — success("Zona ditambahkan")
frontend/src/app/(app)/vehicles/page.tsx:442 — success("ditambahkan")
frontend/src/app/(app)/drivers/page.tsx:458 — success("ditambahkan")
frontend/src/app/(app)/reports/page.tsx:417 — success("sedang diproses")
frontend/src/app/(app)/history/page.tsx:612 — success("Diputar", ...)
```

---

## Definisi Verdict

| Verdict | Kriteria |
|---------|----------|
| **REAL** | Data dari API nyata, endpoint ada, aksi mengubah database |
| **PARTIAL** | Sebagian data nyata, sebagian mock, atau read-only |
| **SHELL** | UI lengkap, semua data mock, tidak ada endpoint yang dipanggil |
| **DEAD** | Tidak dipakai, duplikat, atau tidak punya alasan ada |
