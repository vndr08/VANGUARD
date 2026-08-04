# TASK: VANGUARD Realtime Monitor Grayscale Wireframe

## OUTPUT

Buat satu file saja:

docs/WIREFRAME-REALTIME-MONITOR.md

Jangan mengubah code, CSS, component, route, dependency, konfigurasi, App Shell,
atau Dashboard.

App Shell dan Dashboard sudah terkunci.

## DOKUMEN WAJIB DIBACA

1. docs/PRODUCT-DEMO-BRIEF.md
2. docs/INFORMATION-ARCHITECTURE.md
3. docs/UX-AUDIT.md
4. docs/WIREFRAME-APP-SHELL.md
5. docs/WIREFRAME-DASHBOARD.md
6. docs/_evidence/realtime-monitor-current.txt
7. docs/_evidence/realtime-map-engine.txt
8. docs/_evidence/realtime-map-files.txt
9. docs/_evidence/leaflet-traces.txt
10. frontend/src/app/(app)/tracking/page.tsx
11. frontend/src/components/map/DetailPanel.tsx
12. frontend/src/hooks/useSpeedingMonitor.ts
13. frontend/src/hooks/useMapHooks.ts
14. frontend/src/lib/mock-data.ts
15. frontend/src/lib/api.ts

Jika terjadi konflik:
- WIREFRAME-APP-SHELL.md adalah sumber kebenaran layout.
- INFORMATION-ARCHITECTURE.md adalah sumber kebenaran route dan entity.
- PRODUCT-DEMO-BRIEF.md adalah sumber kebenaran demo story.
- Evidence dan source code adalah sumber kebenaran kondisi implementasi sekarang.

## TUJUAN REALTIME MONITOR

Realtime Monitor adalah map-primary operational workspace.

Dalam lima detik pengguna harus dapat menjawab:

1. Di mana kendaraan yang membutuhkan perhatian?
2. Apa status dan kesegaran data kendaraan tersebut?
3. Kendaraan mana yang harus dibuka lebih dulu?
4. Apa konteks pekerjaan kendaraan terpilih?
5. Workflow mana yang harus dibuka berikutnya?

Realtime Monitor bukan dashboard kedua dan bukan halaman dekorasi peta.

## KEPUTUSAN LAYOUT TERKUNCI

### Navigation rail

- Rail 64px ketika list atau inspector aktif.
- Expanded sidebar tidak dipakai sebagai kondisi utama Realtime Monitor.
- App Shell tidak boleh dirancang ulang.

### Contextual surfaces

Hanya dua contextual surfaces:

1. Vehicle List: 320px
2. Vehicle Inspector: 360px

Pada map-primary, list dan inspector saling menggantikan.

Dilarang menampilkan list dan inspector bersamaan.

### Perilaku

- Kondisi awal: list terbuka, inspector tertutup.
- Memilih vehicle: list tersembunyi, inspector terbuka.
- Menutup inspector: state list sebelumnya dipulihkan.
- Tombol L: buka list dan tutup inspector.
- Tombol I: buka inspector untuk selection aktif dan tutup list.
- Escape: tutup inspector dan pulihkan list.
- Selection disimpan di URL:
  /tracking?vehicle=:plateSlug
- Search terbuka menggunakan:
  /tracking?search=open

### Inspector

Inspector tetap overlay dengan lebar 360px.

Saat inspector terbuka:
- map canvas tetap penuh di belakang overlay;
- effective right padding: 360px;
- selected entity berada di tengah area yang tidak tertutup;
- displacement visual: 180px ke kiri;
- zoom dan bearing tidak berubah;
- transition harus singkat dan tidak mengganggu.

## SPACE BUDGET TERKUNCI

Bedakan:

1. Map canvas width
2. Occluded width
3. Unoccluded map width

### 1366

Full map:
64 + 1302 = 1366

List:
64 + 320 + 982 = 1366

Inspector:
- map canvas: 1302
- occluded: 360
- unoccluded: 942
- persamaan visual: 64 + 942 + 360 = 1366

### 1440

Full map:
64 + 1376 = 1440

List:
64 + 320 + 1056 = 1440

Inspector:
- map canvas: 1376
- occluded: 360
- unoccluded: 1016
- persamaan visual: 64 + 1016 + 360 = 1440

### 1920

Full map:
64 + 1856 = 1920

List:
64 + 320 + 1536 = 1920

Inspector:
- map canvas: 1856
- occluded: 360
- unoccluded: 1496
- persamaan visual: 64 + 1496 + 360 = 1920

Dilarang mengubah angka di atas.

## MAP ENGINE

MapLibre GL adalah satu-satunya map engine.

Dokumentasikan sebagai implementation cleanup:
- hapus leaflet;
- hapus react-leaflet;
- hapus @types/leaflet;
- hapus Leaflet CSS overrides.

Jangan menggunakan Leaflet dalam rancangan baru.

## VEHICLE LIST

Vehicle List 320px harus mendukung:

### Informasi setiap row

Informasi yang selalu terlihat:
- status indicator;
- plate number;
- driver atau Unassigned;
- operational state;
- speed jika bergerak;
- freshness atau durasi sejak update;
- exception indicator jika ada.

Jangan memasukkan seluruh detail kendaraan ke row.

### Search

Search harus bekerja pada seluruh 25 kendaraan, bukan subset.

Search minimal mencakup:
- plate number;
- driver name;
- task identifier jika tersedia.

### Filter

Filter minimum:
- All
- Driving
- Idle
- Stopped
- Offline
- Needs Attention

Jika source memakai status berbeda, definisikan normalization adapter.
Jangan mengarang jumlah per status.

### Sort

Default:
1. severity exception;
2. freshness;
3. plate number.

Sediakan opsi:
- Needs Attention
- Last Update
- Plate Number

### Row states

Definisikan:
- default;
- hover;
- keyboard focus;
- selected;
- stale;
- offline;
- loading;
- partial data;
- no result.

Status tidak boleh dibedakan menggunakan warna saja.

## MAP MARKERS

Definisikan marker untuk:

- driving;
- idle;
- stopped;
- offline;
- needs attention;
- selected.

Setiap marker harus memiliki:
- status yang dapat dibaca tanpa hanya mengandalkan warna;
- selection state;
- hit area minimum;
- keyboard/list alternative;
- timestamp atau freshness melalui inspector, bukan label permanen di map.

Jangan menampilkan plate label pada seluruh marker secara permanen jika membuat
peta penuh teks.

Atur behavior untuk:
- marker overlap;
- selected marker;
- marker di balik inspector;
- viewport fit;
- zoom;
- map loading;
- map error;
- telemetry update;
- stale position.

Jangan menambahkan animasi pulse pada semua marker.

## MAP TOOLBAR

Map toolbar hanya berisi tindakan terkait peta:

- Search/find vehicle
- Fit fleet
- Layer selection jika benar-benar tersedia
- Zoom
- Toggle Vehicle List

Dilarang di map toolbar:
- global notifications;
- user menu;
- global refresh;
- customize columns;
- report export;
- action yang hanya menampilkan toast.

## INSPECTOR 360PX

Gunakan pattern App Shell:

1. Identity
2. State
3. Context
4. Actions
5. Links

### Identity

- plate number;
- driver;
- vehicle label/type;
- selection freshness.

### State

- operational status;
- speed;
- ignition jika tersedia;
- location;
- last update;
- stale/offline explanation.

### Context

- active task;
- task status;
- ETA dan target jika tersedia;
- active exception;
- last significant event.

### Actions

Hanya action yang nyata:
- Open vehicle record
- Open active task
- Open Safety alert jika ada
- Open trip history
- Locate/recenter selected vehicle
- Close inspector

Canonical destinations:
- vehicle operational context:
  /tracking?vehicle=:plateSlug
- vehicle record:
  /vehicles/:id
- active task:
  /tasks/:id
- safety alert:
  /safety?alert=:id
- trip event:
  /history?vehicle=:plateSlug&event=:id

Dilarang:
- simulated success;
- engine command dari inspector;
- button yang hanya memunculkan toast;
- action tanpa destination atau state change.

## FRESHNESS

Gunakan aturan terkunci:

| Age | State | Label |
|-----|-------|-------|
| kurang dari 2 menit | Segar | Updated recently |
| 2 sampai 10 menit | Tertunda | Data delayed |
| lebih dari 10 menit | Tidak mengirim data | Last update Xm ago |

Jangan menyimpulkan kerusakan GPS hanya dari telemetry yang tidak masuk.

Skenario canonical:
D 6600 WXY tidak mengirim data selama 42 menit.

## CANONICAL SCENARIOS

Realtime Monitor harus mendukung:

### Connectivity

D 6600 WXY:
- tidak mengirim data 42 menit;
- visible sebagai Needs Attention;
- destination /tracking?vehicle=:plateSlug.

### Overspeed

B 5678 TGP:
- 82 km/h;
- 13:42;
- unreviewed;
- link /safety?alert=:id.

### Route deviation

B 1234 KJT:
- deviasi 1,8 km;
- berlangsung 7 menit;
- link /history?vehicle=:plateSlug&event=:id.

Jangan menambahkan detail waktu atau angka lain tanpa evidence.

## URL DAN DEEP LINK

Definisikan behavior saat membuka:

- /tracking
- /tracking?vehicle=:plateSlug
- /tracking?search=open
- URL dengan vehicle tidak ditemukan
- URL dengan query tidak valid
- browser back/forward
- reload dengan inspector terbuka

URL adalah sumber selection state, bukan state component lokal semata.

## ACTION TRUTH TABLE

Gunakan kolom:

| Element | User intent | Action class | Destination/state change | Persistence | Failure behavior |

Action class:
- Persistent state
- Operational navigation
- Local map interaction
- Proposed query state
- Future/unavailable

Dilarang mengklasifikasikan toast sebagai keberhasilan.

## DATA CONTRACT

Definisikan source dan formula untuk:

- normalized vehicle status;
- selected vehicle;
- freshness;
- stale/offline condition;
- search result;
- filter result;
- sort order;
- active task;
- active alert;
- map coordinates;
- heading;
- speed;
- telemetry timestamp.

Jika field belum ada, tulis sebagai data requirement.
Jangan mengarang data.

useSpeedingMonitor.ts sudah ada. Jangan menyatakan speeding detection masih
inline di tracking/page.tsx.

## INTERACTION DAN STATE MATRIX

Definisikan:

- initial loading;
- map ready;
- telemetry connected;
- telemetry delayed;
- telemetry disconnected;
- list open;
- inspector open;
- no selection;
- vehicle selected;
- deep link selected;
- vehicle not found;
- search no result;
- filter empty;
- partial vehicle data;
- invalid coordinate;
- map error;
- permission limited;
- demo reset.

Pesan harus operational, bukan istilah teknis seperti WebSocket error.

## RESPONSIVE WIREFRAMES

Buat grayscale text wireframe untuk:

1. 1366x768:
   - list open;
   - inspector open;
   - full map.

2. 1440x900:
   - list open;
   - inspector open;
   - full map.

3. 1920x1080:
   - list open;
   - inspector open;
   - full map.

4. Tablet 768px:
   - rail 64px;
   - list sebagai bottom sheet atau drawer;
   - inspector sebagai bottom sheet;
   - map tetap menjadi primary surface.

Setiap desktop wireframe harus:
- mencantumkan lebar rail;
- mencantumkan list atau inspector;
- mencantumkan map canvas;
- mencantumkan occlusion;
- mencantumkan unoccluded map width;
- menjumlah tepat ke viewport.

Dilarang membuat wireframe list dan inspector terbuka bersamaan.

## TYPOGRAPHY DAN ACCESSIBILITY

Informasi operasional minimum 14px:

- plate;
- status;
- speed;
- freshness;
- exception;
- task context;
- timestamp yang memengaruhi keputusan.

12px hanya untuk metadata non-kritis.

Keyboard:
- / atau Cmd+K membuka search sesuai keputusan App Shell;
- L toggle list;
- I toggle inspector;
- Escape kembali;
- Arrow Up/Down navigasi list;
- Enter memilih vehicle.

Map wajib memiliki list alternative bagi pengguna keyboard dan screen reader.

## PERFORMANCE REQUIREMENTS

Dokumentasikan tanpa mengubah code:

- satu instance MapLibre;
- cleanup listener;
- batch telemetry updates;
- jangan recreate semua marker untuk satu update;
- jangan menjalankan fitBounds pada setiap telemetry event;
- lazy-load detail non-kritis;
- jangan menjalankan animasi marker terus-menerus;
- skeleton hanya untuk initial load;
- update berikutnya tidak memblokir interaksi.

Dataset demo tetap 25 kendaraan. Jangan mengarang target skala produksi tanpa
evidence.

## ANTI AI SLOP

Buktikan:

1. Map adalah workspace, bukan background dekoratif.
2. Tidak ada glass card dekoratif.
3. Tidak ada gradient hero.
4. Tidak ada floating widget tanpa fungsi.
5. Tidak ada card di dalam inspector section.
6. Tidak ada icon tanpa label, tooltip, atau makna status.
7. Tidak ada marker pulse massal.
8. Tidak ada teks operasional di bawah 14px.
9. Tidak ada lebih dari satu contextual surface.
10. Tidak ada action yang hanya menghasilkan toast.

## STRUKTUR OUTPUT

1. Realtime Monitor Job
2. Diagnosis Implementasi Sekarang
3. Locked Layout Model
4. Vehicle List
5. Map and Marker System
6. Map Toolbar
7. Vehicle Inspector
8. Freshness and Connectivity
9. Canonical Scenarios
10. URL and Deep-Link Behavior
11. Action Truth Table
12. Data Contract
13. Interaction and State Matrix
14. Responsive Grayscale Wireframes
15. Space Budget
16. Typography and Accessibility
17. Performance Requirements
18. Anti AI Slop Verification
19. Implementation Notes
20. Keputusan Produk Terkunci
21. Definition of Done

## DEFINITION OF DONE

Biarkan unchecked sampai verifikasi selesai.

- [ ] MapLibre adalah satu-satunya engine dalam rancangan baru
- [ ] List 320px dan inspector 360px
- [ ] List dan inspector tidak pernah terbuka bersama
- [ ] Rail 64px pada semua kondisi map-primary
- [ ] Semua desktop wireframe menjumlah tepat
- [ ] Inspector memakai effective right padding 360px
- [ ] Recenter memiliki displacement visual 180px
- [ ] Selection tersimpan di URL
- [ ] Search mencakup seluruh 25 kendaraan
- [ ] Filter dan sort memiliki behavior lengkap
- [ ] Freshness memakai ambang 2 dan 10 menit
- [ ] Tidak ada diagnosis GPS rusak tanpa data eksplisit
- [ ] useSpeedingMonitor dikenali sebagai hook terpisah
- [ ] Tidak ada toast-only action
- [ ] Informasi operasional minimum 14px
- [ ] Ketiga canonical scenario memiliki route benar
- [ ] Narasi bahasa Indonesia dan bebas karakter CJK
- [ ] Tidak ada code, CSS, component, route, atau dependency yang diubah

## VERIFIKASI

Jalankan:

./scripts/check-docs-language.sh
./scripts/check-doc-structure.sh

Pastikan hanya docs/WIREFRAME-REALTIME-MONITOR.md yang dibuat atau diubah.

## CHAT OUTPUT

Tampilkan hanya:

1. tiga kondisi layout final;
2. tabel space budget untuk 1366, 1440, 1920;
3. Vehicle List information hierarchy;
4. Vehicle Inspector information hierarchy;
5. URL state;
6. action yang sekarang simulated atau toast-only;
7. keputusan produk yang masih terbuka.
