# VANGUARD - Engineering Roadmap

Roadmap ini melanjutkan UI foundation yang sudah stabil. Jangan menghidupkan kembali simulated refresh, fake success, atau mutation lokal yang tampak persisten.

## 1. Fleet Runtime Contract

- Tetapkan immutable vehicle identity lintas database, REST, WebSocket, task, dan history.
- Dokumentasikan apakah 15 unit visible merupakan tenant scope atau filter produk.
- Tambahkan connection state, backoff, structured error, dan observability.

## 2. Security Boundary

- Identity provider dan protected application routes.
- RBAC untuk dispatcher, supervisor, safety, dan administrator.
- Device credential terpisah untuk telemetry ingestion.
- Audit log untuk command dan mutation.

## 3. Persistence Foundation

- Alembic migration dan PostgreSQL runtime configuration.
- Canonical read APIs untuk task, trip, event, driver, geofence, dan incident.
- Pagination, filtering, stable IDs, dan optimistic concurrency.
- Shared mutation store hanya setelah endpoint dan audit contract tersedia.

## 4. Regression Coverage

- Unit test selector dan integrity contract.
- API integration test untuk telemetry dan fleet projection.
- Playwright untuk route selection, keyboard navigation, CSV, map smoke, light/dark, dan responsive overflow.
- Accessibility scan untuk dialog, table interaction, focus order, dan contrast.

## 5. Maintainability

- Pecah `MapView.tsx` menjadi lifecycle, marker, cluster, route, dan geofence modules tanpa mengubah behavior.
- Pecah halaman Tracking dan History berdasarkan region yang stabil.
- Pindahkan dataset lokal domain ke module canonical sebelum menambah fitur baru.
- Pertahankan Graphite Command, density tinggi, copy Indonesia, dan divider-first layout.

## Urutan Delivery

1. Vehicle identity dan connection contract.
2. Authentication, authorization, dan device ingestion security.
3. Database migration dan canonical operations read API.
4. Domain persistence satu per satu.
5. Performance, offline resilience, dan observability.
