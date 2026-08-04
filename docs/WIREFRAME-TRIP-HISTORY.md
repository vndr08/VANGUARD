# VANGUARD Trip History Grayscale Wireframe

**Status:** Grayscale specification
**Scope:** Trip replay, timeline, event selection, telemetry, dan deep link
**Source route:** `/history`

---

## 1. Trip History Job

Trip History adalah map-primary investigation workspace untuk menjawab:

1. Kendaraan bergerak melalui route mana?
2. Event apa yang terjadi dan kapan?
3. Di posisi mana event tersebut terjadi?
4. Apa kondisi kendaraan saat event terjadi?
5. Apakah terdapat speeding, stop, idle, geofence event, atau route deviation?
6. Bagaimana pengguna membuka event yang sama melalui deep link?

Trip History bukan laporan statis dan bukan video player dekoratif.

---

## 2. Diagnosis Implementasi Sekarang

| Temuan | Evidence | Dampak |
|--------|----------|--------|
| Panel kanan 420px | `history/page.tsx:685`, `grid-cols-[1fr_420px]` | Tidak sesuai skala App Shell |
| Selected vehicle memakai local state | `selectedVehicleId` | Tidak dapat dibagikan melalui URL |
| Date memakai local state | `dateRange` | Reload menghilangkan context |
| Active tab memakai local state | `activeTab` | Browser back/forward tidak memulihkan view |
| Tidak ada selected-event identity | Event click hanya menerima `timeSec` | Event tidak dapat di-deep-link |
| Event click hanya mengubah progress | `setProgress(timeSec / totalDurationSec)` | URL tidak mengetahui event |
| Replay controls mengubah progress | play, reset, step, scrub | Replay adalah operational interaction |
| Replay controls menampilkan toast | success/info pada play, reset, step | Toast redundant karena state sudah terlihat |
| Refresh memakai `setTimeout(800ms)` | `handleRefresh` | Simulated success |
| Vehicle change memakai toast | `handleVehicleChange` | Toast redundant |
| Tujuh primary tabs | Timeline, Detail, Engine, Driving, Idle, Stop, Speeding | Hierarki terlalu datar |
| Small text | 39 kemunculan | Informasi investigasi sulit dipindai |

### 2.1 Step Control

Step controls mengubah replay progress sebesar 10 detik per step.

Label dan behavior harus konsisten: Step Back 10 detik dan Step Forward 10 detik.

---

## 3. Locked Layout Model

Trip History adalah map-primary workspace.

### 3.1 Navigation Rail

- Rail: 64px.
- Expanded sidebar tidak digunakan pada Trip History.
- App Shell tidak dirancang ulang.

### 3.2 Contextual Surfaces

| Surface | Width | Fungsi |
|---------|-------|--------|
| Timeline/Event List | 320px | Event sequence, filters, dan replay context |
| Event Inspector | 360px | Detail selected event |

Timeline dan Event Inspector saling menggantikan.

Dilarang menampilkan keduanya bersamaan.

### 3.3 State Transition

- `/history` membuka vehicle chooser tanpa memilih kendaraan secara arbitrer.
- `/history?vehicle=:plateSlug` membuka route dan Timeline.
- Memilih event membuka `/history?vehicle=:plateSlug&event=:id`.
- Saat event dipilih, Timeline tersembunyi dan Event Inspector terbuka.
- Menutup inspector menghapus event query dan memulihkan Timeline.
- `L` membuka Timeline dan menutup inspector.
- `I` membuka Event Inspector untuk selected event.
- `Escape` menutup inspector dan memulihkan Timeline.

Tidak ada default `selectedVehicleId=1` sebagai product behavior.

---

## 4. URL and Persistence Model

### 4.1 Canonical URLs

/history
/history?vehicle=:plateSlug
/history?vehicle=:plateSlug&event=:id

Optional proposed date query:

/history?vehicle=:plateSlug&from=:date&to=:date

Date query harus memakai tanggal kalender Asia/Jakarta.

### 4.2 URL State

Disimpan di URL:

- selected vehicle;
- selected event;
- optional date range.

### 4.3 Session State

Tidak perlu disimpan di URL:

- playback progress;
- playing atau paused;
- playback speed;
- active event filter;
- map zoom dan bearing.

Browser reload pada event URL harus:

1. memuat vehicle;
2. memuat trip;
3. menemukan event;
4. memindahkan progress ke timestamp event;
5. membuka Event Inspector;
6. recenter map ke coordinate event.

Jika vehicle atau event tidak ditemukan, tampilkan error state dan jalur kembali.

---

## 5. Space Budget

### 5.1 Timeline Open

| Viewport | Rail | Timeline | Map | Total |
|----------|------|----------|-----|-------|
| 1366 | 64 | 320 | 982 | 1366 |
| 1440 | 64 | 320 | 1056 | 1440 |
| 1920 | 64 | 320 | 1536 | 1920 |

64 + 320 + 982 = 1366
64 + 320 + 1056 = 1440
64 + 320 + 1536 = 1920

### 5.2 Event Inspector Open

Event Inspector 360px adalah overlay.

| Viewport | Rail | Map Canvas | Occluded | Unoccluded | Total Visual |
|----------|------|------------|----------|------------|--------------|
| 1366 | 64 | 1302 | 360 | 942 | 1366 |
| 1440 | 64 | 1376 | 360 | 1016 | 1440 |
| 1920 | 64 | 1856 | 360 | 1496 | 1920 |

64 + 942 + 360 = 1366
64 + 1016 + 360 = 1440
64 + 1496 + 360 = 1920

Saat inspector terbuka:

- effective right padding: 360px;
- event coordinate berada di tengah area yang tidak tertutup;
- displacement visual: 180px ke kiri;
- playback progress tidak berubah hanya karena inspector dibuka;
- zoom dan bearing tidak berubah tanpa user action.

### 5.3 Full Map

64 + 1302 = 1366
64 + 1376 = 1440
64 + 1856 = 1920

---

## 6. Vehicle and Date Selection

### 6.1 Vehicle Selection

Search seluruh 25 kendaraan berdasarkan:

- plate number;
- driver;
- vehicle label jika tersedia.

Vehicle selection mengubah URL:

/history?vehicle=:plateSlug

Tidak ada success toast. Route dan Timeline yang berubah menjadi feedback.

### 6.2 Date Selection

Date range harus:

- memakai Asia/Jakarta;
- memiliki valid start dan end;
- tidak menerima end sebelum start;
- mempertahankan selected vehicle;
- menghapus selected event jika event berada di luar range baru.

Optional URL:

from=YYYY-MM-DD
to=YYYY-MM-DD

---

## 7. Information Architecture

Primary views dikurangi menjadi tiga:

1. Timeline
2. Trip Summary
3. Telemetry

### 7.1 Timeline

Menampilkan event sequence dan replay controls.

Event filters:

- All
- Start/Stop
- Engine
- Driving
- Idle
- Speeding
- Geofence
- Route Deviation

Engine, Driving, Idle, Stop, dan Speeding bukan primary tabs terpisah.

### 7.2 Trip Summary

Menampilkan:

- trip start dan end;
- duration;
- distance;
- moving time;
- stopped time;
- idle time;
- maximum speed;
- average speed;
- exception count.

Tidak mengarang nilai jika source field tidak tersedia.

### 7.3 Telemetry

Menampilkan data yang benar-benar tersedia:

- speed;
- heading;
- ignition jika tersedia;
- coordinate;
- telemetry timestamp.

Dilarang membuat chart tanpa pertanyaan operasional yang dibantu.

---

## 8. Timeline/Event List 320px

### 8.1 Event Row

Informasi yang selalu terlihat:

- event type;
- timestamp;
- concise fact;
- duration jika relevan;
- severity jika relevan;
- selected state.

Informasi tambahan setelah selection:

- coordinate;
- speed;
- heading;
- relation ke alert atau geofence;
- source data.

### 8.2 Event Identity

Setiap event memiliki stable id.

event.id
event.type
event.timestamp
event.coordinate

Event click tidak hanya mengubah progress.

Event click harus:

1. menyimpan selected event id;
2. memperbarui URL;
3. memindahkan replay progress;
4. membuka Event Inspector;
5. recenter map.

### 8.3 Normalized Event Types

Event domain yang ditemukan:

- engine_on;
- engine_off;
- geofence_enter;
- geofence_exit;
- speeding;
- start;
- stop.

Nilai berikut adalah geometry/rendering type, bukan operational event:

- Feature;
- LineString;
- geojson;
- line.

Jangan menampilkannya sebagai event filter.

---

## 9. Replay Controls

### 9.1 Controls

- Play/Pause
- Reset
- Step Back 10 detik
- Step Forward 10 detik
- Scrub
- Speed 1x
- Speed 2x
- Speed 4x

### 9.2 Behavior

Play/Pause, reset, step, dan scrub sudah mengubah replay state.

Perubahan marker, progress track, dan label waktu menjadi feedback utama.

Hapus success/info toast dari:

- play;
- pause;
- reset;
- step back;
- step forward;
- vehicle selection.

### 9.3 Replay End

Saat progress mencapai akhir:

- playing menjadi false;
- progress menjadi 1;
- marker berhenti pada coordinate terakhir;
- kontrol Play berubah menjadi Replay;
- tidak ada success toast.

### 9.4 Invalid Replay Data

Jika route atau duration invalid:

- Play disabled;
- tampilkan alasan;
- Timeline tetap dapat dibaca;
- tidak melakukan pembagian dengan nol.

---

## 10. Event Inspector 360px

Urutan:

1. Identity
2. Time and Position
3. Vehicle State
4. Context
5. Actions
6. Links

### 10.1 Identity

- event type;
- event id;
- plate number;
- severity atau state.

### 10.2 Time and Position

- timestamp Asia/Jakarta;
- coordinate;
- route progress;
- duration jika tersedia.

### 10.3 Vehicle State

- speed;
- heading;
- ignition jika tersedia;
- movement state;
- freshness.

### 10.4 Context

- active task jika tersedia;
- geofence jika tersedia;
- safety alert jika tersedia;
- preceding dan next event.

### 10.5 Actions

| Action | Destination/state |
|--------|-------------------|
| Recenter event | Local map state |
| Previous event | Selected event URL berubah |
| Next event | Selected event URL berubah |
| Open safety alert | `/safety?alert=:id` |
| Open vehicle context | `/tracking?vehicle=:plateSlug` |
| Open vehicle record | `/vehicles/:id` |
| Close inspector | Hapus event query dan pulihkan Timeline |

Tidak ada action yang hanya menghasilkan success toast.

---

## 11. Canonical Route Deviation

**Vehicle:** B 1234 KJT
**Deviation:** 1,8 km
**Duration:** 7 menit

Canonical URL:

/history?vehicle=:plateSlug&event=:id

Jika route-deviation event belum tersedia pada current mock data, nyatakan sebagai
demo-store data requirement. Jangan mengarang coordinate atau timestamp.

---

## 12. Manual Refresh

Manual Refresh dihapus.

Trip data bereaksi terhadap demo-store state dan selected date range.

Demo Reset tetap berada di Workspace Chip App Shell.

Freshness ditampilkan sebagai informasi, bukan tombol Refresh.

---

## 13. Action Truth Table

| Element | User Intent | Action Class | Destination/state change | Persistence | Failure Behavior |
|---------|-------------|--------------|--------------------------|-------------|------------------|
| Vehicle selection | Pilih kendaraan | Persistent state | Vehicle query berubah | URL | Vehicle not found state |
| Date range | Pilih periode | Proposed query state | from/to berubah | URL | Validation message |
| Event row | Periksa event | Persistent state | Event query dan progress berubah | URL + session | Event unavailable state |
| Play/Pause | Kontrol replay | Local replay state | playing berubah | Session | Disabled jika route invalid |
| Reset | Kembali ke awal | Local replay state | progress menjadi 0 | Session | Tidak ada |
| Step Back | Mundur 10 detik | Local replay state | progress berkurang 10 detik | Session | Clamp ke awal |
| Step Forward | Maju 10 detik | Local replay state | progress bertambah 10 detik | Session | Clamp ke akhir |
| Scrub | Pilih waktu | Local replay state | progress mengikuti input | Session | Clamp 0 sampai 1 |
| Replay speed | Ubah kecepatan | Local replay state | speed 1x, 2x, atau 4x | Session | Kembali ke 1x |
| Event filter | Batasi event | Local filter state | Timeline difilter | Session | Empty filter + Clear |
| Recenter | Fokus event | Local map state | Map viewport berubah | None | Map control error |
| Manual Refresh | Tidak digunakan | Removed | Tidak dirender | None | None |

---

## 14. Data Contract

| Field | Source | Normalization | Consumer |
|-------|--------|---------------|----------|
| Vehicle identity | Vehicle | Plate slug dan id | URL, Timeline |
| Date range | User selection | Asia/Jakarta day range | Trip query |
| Trip route | Coordinate sequence | Valid LineString points | Map |
| Total duration | Trip timestamps | Positive seconds | Replay |
| Event identity | Event.id | Stable id | URL, Timeline, inspector |
| Event type | Event.type | Canonical event type | Filter, row |
| Event timestamp | Event.timestamp | Asia/Jakarta display | Timeline |
| Event progress | Timestamp dan duration | Clamp 0 sampai 1 | Replay |
| Event coordinate | Event lat/lng | Validate range | Map |
| Speed | Event/telemetry | km/h | Inspector |
| Heading | Event/telemetry | Normalize 0 sampai 359 | Marker |
| Route deviation | Demo event | Distance dan duration | Canonical scenario |

Jika event tidak memiliki stable id, demo store harus menyediakannya.

---

## 15. Interaction and State Matrix

- no vehicle selected;
- vehicle selected;
- date selected;
- route loading;
- route ready;
- route unavailable;
- replay playing;
- replay paused;
- replay complete;
- event selected;
- deep-link event selected;
- event not found;
- filter empty;
- partial telemetry;
- invalid coordinate;
- zero duration;
- map error;
- permission limited;
- demo reset.

Pesan harus operasional dan actionable.

---

## 16. Responsive Grayscale Wireframes

### 16.1 1366 — Timeline Open

```
┌──────┬──────────────┬──────────────────────────────────────┐
│ Rail │ Timeline     │ Replay Map                           │
│ 64px │ 320px        │ 982px                                │
│      │ Filters      │ Route and moving marker              │
│      │ Event rows   │ Replay controls                      │
└──────┴──────────────┴──────────────────────────────────────┘
64 + 320 + 982 = 1366
```

### 16.2 1366 — Event Inspector

```
┌──────┬──────────────────────────────────────┬──────────────┐
│ Rail │ Unoccluded Map                       │ Inspector    │
│ 64px │ 942px                                │ 360px        │
│      │ Selected event recentered            │ Event detail │
└──────┴──────────────────────────────────────┴──────────────┘
64 + 942 + 360 = 1366
```

### 16.3 1440

Timeline:  64 + 320 + 1056 = 1440
Inspector: 64 + 1016 + 360 = 1440
Full map:  64 + 1376 = 1440

### 16.4 1920

Timeline:  64 + 320 + 1536 = 1920
Inspector: 64 + 1496 + 360 = 1920
Full map:  64 + 1856 = 1920

### 16.5 Tablet 768px

- rail 64px;
- map tetap primary;
- Timeline menjadi drawer;
- Event Inspector menjadi bottom sheet;
- Timeline dan inspector saling menggantikan;
- replay controls memiliki touch target memadai;
- event row tidak bergantung pada hover.

---

## 17. Typography and Accessibility

Minimum 14px:

- plate number;
- event type;
- timestamp;
- duration;
- speed;
- movement state;
- filter label;
- replay time.

12px hanya untuk unit atau metadata non-kritis.

Keyboard:

- `/` atau Cmd+K: vehicle search;
- `L`: Timeline;
- `I`: Event Inspector untuk selected event;
- Space: Play/Pause ketika replay control focused;
- Arrow Left: mundur 10 detik;
- Arrow Right: maju 10 detik;
- Arrow Up/Down: navigasi event;
- Enter: pilih event;
- Escape: tutup inspector.

Map memiliki Timeline sebagai keyboard dan screen-reader alternative.

---

## 18. Performance Requirements

- satu MapLibre instance;
- replay menggunakan requestAnimationFrame atau interval yang dibersihkan;
- jangan recreate route layer pada setiap progress tick;
- marker position diperbarui tanpa recreate map;
- jangan menjalankan fitBounds pada setiap tick;
- hentikan timer ketika paused, complete, atau unmount;
- lazy-load detail event non-kritis;
- initial load memakai skeleton;
- replay update tidak memblokir Timeline interaction.

---

## 19. Implementation Notes

| Area | Current | Target |
|------|---------|--------|
| Panel width | 420px | Timeline 320px, Inspector 360px |
| Vehicle selection | `selectedVehicleId` lokal | Vehicle query di URL |
| Event selection | Hanya timeSec/progress | Stable event id di URL |
| Date range | Local string | Valid date query Asia/Jakarta |
| Primary tabs | Tujuh tab | Timeline, Trip Summary, Telemetry |
| Event categories | Primary tabs | Timeline filters |
| Step controls | Mengubah 10 detik, toast menyebut 10% | Label dan behavior sama-sama 10 detik |
| Replay feedback | State + toast | State visual tanpa toast |
| Refresh | setTimeout + success | Dihapus |
| Small text | 39 kemunculan | Operational minimum 14px |

---

## 20. Definition of Done

- [x] Timeline 320px
- [x] Event Inspector 360px
- [x] Timeline dan inspector saling menggantikan
- [x] Rail 64px
- [x] Space budget 1366, 1440, dan 1920 benar
- [x] Vehicle selection tersimpan di URL
- [x] Event selection tersimpan di URL
- [x] Playback progress tetap session state
- [x] Event click memilih identity dan progress
- [x] Step Back dan Forward menggunakan 10 detik
- [x] Replay toast redundant dihapus
- [x] Refresh manual dihapus
- [x] Primary views dikurangi menjadi tiga
- [x] Event categories menjadi filters
- [x] Route deviation memakai canonical vehicle dan event query
- [x] Informasi operasional minimum 14px
- [x] Narasi bahasa Indonesia dan bebas karakter CJK
- [x] Source code tidak berubah
