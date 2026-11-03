# VANGUARD - Product Truth

**Diperbarui:** 2026-10-23
**Baseline:** `main` setelah hardening read-only operational surfaces

## Status Produk

VANGUARD saat ini adalah control tower armada yang dapat dijalankan sebagai demo operasional deterministik dan dapat menerima overlay telemetry dari API lokal. UI tidak boleh mengklaim persistence, remote command, report generation, atau media capture sebelum layanan terkait tersedia.

## Source of Truth

| Domain | Source saat ini | Sifat |
| --- | --- | --- |
| Fleet visible | `frontend/src/lib/fleet-data.ts` dengan overlay `GET /api/vehicles/` | 15 unit terpilih; fallback deterministik |
| Telemetry realtime | `POST /api/telemetry/` dan `/ws/tracking` | Nyata ketika backend aktif |
| Task, trip, event | `operations-data.ts` dan `operations-selectors.ts` | Canonical deterministic read-only |
| Driver | Dataset lokal halaman Driver | Read-only |
| Geofence | Dataset lokal halaman Geofence | Read-only |
| Accident | Dataset lokal halaman Accident Log | Read-only |
| Snapshot | Metadata lokal | Read-only; bukan file gambar |
| Report | Katalog lokal | Read-only; tidak menghasilkan dokumen |
| Settings | Theme, accent, density di browser; interval telemetry di session aplikasi | Preferensi lokal |

## Endpoint Backend yang Tersedia

- `GET /api/health`
- `GET /api/vehicles/`
- `GET /api/vehicles/{vehicle_id}`
- `POST /api/telemetry/`
- `GET /api/telemetry/history/{vehicle_id}`
- `GET /api/dashboard/stats`
- `WS /ws/tracking`

Tidak ada endpoint task, trip, event, driver CRUD, geofence CRUD, accident, snapshot, report, command, identity, atau authorization.

## Kontrak UI

- Dashboard, Tasks, dan History memakai task/trip/event canonical yang sama.
- URL selection yang didukung: `/tracking?focus=<numeric-id>`, `/tasks?task=<task-id>`, dan `/history?trip=<trip-id>&event=<event-id>`.
- Vehicles, Drivers, Geofence, Accident Log, Reports, Snapshots, dan Control Panel tidak menawarkan mutasi palsu.
- Export yang terlihat harus menghasilkan file nyata.
- UI production tidak menampilkan label Demo, Mock, Synthetic, fixture, atau seed.
- Kata "Mode baca" berarti data dapat diperiksa dan difilter tetapi tidak dipersistensikan dari halaman tersebut.

## Batas Production

- Login saat ini hanya gerbang workspace lokal, bukan autentikasi organisasi.
- Belum ada RBAC, device credential, audit log, migration framework, atau operations store.
- Default database development adalah SQLite. PostGIS dan Redis pada Compose belum menjadi runtime application stack.
- Map dan font menggunakan provider eksternal dan memerlukan jaringan.

## Definition of Truth

Sebuah kemampuan hanya boleh disebut tersedia jika sumber datanya jelas, action benar-benar selesai, state tujuan dapat dibaca kembali, error tidak disamarkan sebagai sukses, dan perilakunya mempunyai regression check.
