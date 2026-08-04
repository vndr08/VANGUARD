# VANGUARD Task Monitor Grayscale Wireframe

**Status:** Grayscale specification
**Scope:** Task list, route map, task inspector, filter, sort, dan demo persistence
**Source route:** `/tasks`

---

## 1. Task Monitor Job

Task Monitor adalah operational workspace untuk menjawab:

1. Task mana yang aktif sekarang?
2. Task mana yang diperkirakan terlambat?
3. Kendaraan dan driver mana yang menjalankan task?
4. Task mana yang terlalu lama pada loading atau unloading?
5. Route atau detail task mana yang harus diperiksa berikutnya?

Task Monitor bukan dashboard kedua dan bukan kumpulan KPI card.

---

## 2. Diagnosis Implementasi Sekarang

| Temuan | Evidence | Dampak |
|--------|----------|--------|
| List memakai 380px | `tasks/page.tsx:273`, `grid-cols-[380px_1fr]` | Tidak sesuai skala App Shell |
| Selection memakai `selectedId` lokal | `tasks/page.tsx:98` | Tidak dapat dibagikan atau dipulihkan setelah reload |
| Tidak ada URL selection | Evidence URL state tidak menemukan `searchParams` atau router | Deep link belum tersedia |
| Refresh menggunakan `setTimeout(800ms)` | `tasks/page.tsx:177` | Simulated success |
| Sort toggle rusak | `d === "asc" ? "desc" : "desc"` | Sort tidak dapat kembali ke ascending |
| Filter mengubah state dan menampilkan toast | `setFilter(...)` disertai `info(...)` | Toast redundant |
| Task array tidak memiliki setter | `const [tasks] = useState<Task[]>(TASKS)` | Add Task tidak dapat persisten ke array utama |
| Small text | 16 kemunculan | Informasi operasional sulit dipindai |

Status yang ditemukan pada source:

- `assigned`
- `completed`
- `progress`
- `unloading`
- `waiting`

Tidak boleh menambahkan status baru tanpa normalization rule.

---

## 3. Locked Layout Model

Task Monitor adalah split map workspace.

### 3.1 Navigation

- Navigation rail: 64px.
- Expanded sidebar tidak dipakai pada split map workspace.
- App Shell tidak dirancang ulang.

### 3.2 Contextual Surfaces

Dua contextual surfaces:

| Surface | Width | Fungsi |
|---------|-------|--------|
| Task List | 320px | Search, filter, sort, dan task rows |
| Task Inspector | 360px | Selected task detail dan operational links |

Task List dan Task Inspector saling menggantikan.

Dilarang menampilkan keduanya bersamaan.

### 3.3 State Transitions

- `/tasks` membuka Task List dan map.
- Memilih task membuka `/tasks?task=:id&view=map`.
- Saat task dipilih, list tersembunyi dan inspector terbuka.
- Menutup inspector menghapus query `task` dan memulihkan list.
- `/tasks/:id` membuka full task record.
- `L` membuka list dan menutup inspector.
- `I` membuka inspector untuk selected task.
- `Escape` menutup inspector dan memulihkan list.

---

## 4. Space Budget

### 4.1 List Open

| Viewport | Rail | List | Map | Total |
|----------|------|------|-----|-------|
| 1366 | 64 | 320 | 982 | 1366 |
| 1440 | 64 | 320 | 1056 | 1440 |
| 1920 | 64 | 320 | 1536 | 1920 |

Persamaan:

64 + 320 + 982 = 1366
64 + 320 + 1056 = 1440
64 + 320 + 1536 = 1920

### 4.2 Inspector Open

Inspector 360px adalah overlay. Map canvas tetap penuh di belakang inspector.

| Viewport | Rail | Map Canvas | Occluded | Unoccluded | Total Visual |
|----------|------|------------|----------|------------|--------------|
| 1366 | 64 | 1302 | 360 | 942 | 1366 |
| 1440 | 64 | 1376 | 360 | 1016 | 1440 |
| 1920 | 64 | 1856 | 360 | 1496 | 1920 |

Persamaan visual:

64 + 942 + 360 = 1366
64 + 1016 + 360 = 1440
64 + 1496 + 360 = 1920

Saat inspector terbuka:

- effective right padding: 360px;
- selected route atau marker dipusatkan pada area yang tidak tertutup;
- displacement visual: 180px ke kiri;
- zoom dan bearing tidak berubah tanpa user action.

### 4.3 Full Map

64 + 1302 = 1366
64 + 1376 = 1440
64 + 1856 = 1920

---

## 5. Task List 320px

### 5.1 Informasi Row

Informasi yang selalu terlihat:

1. Task reference atau identity.
2. Status.
3. Plate number.
4. Driver atau `Unassigned`.
5. Origin menuju destination.
6. ETA dan target arrival jika tersedia.
7. Progress atau dwell duration jika relevan.
8. Exception indicator.

Jangan memasukkan seluruh detail task ke row.

### 5.2 Search

Search membaca seluruh task pada demo store.

Search minimal:

- task reference;
- plate number;
- driver;
- origin;
- destination.

### 5.3 Filter

Filter canonical:

- All
- Assigned
- Waiting
- In Progress
- Unloading
- Completed
- Needs Attention

Filter state diusulkan menggunakan:

/tasks?status=:status

Query state harus diparse, divalidasi, dan diuji.

### 5.4 Sort

Sort options:

- Needs Attention
- Target Arrival
- Estimated Arrival
- Progress
- Task Reference

Sort state diusulkan menggunakan:

/tasks?sort=:key&direction=:direction

Bug sekarang:

d === "asc" ? "desc" : "desc"

Target:

d === "asc" ? "desc" : "asc"

Tidak ada toast ketika sort atau filter berhasil. Perubahan list adalah feedback.

### 5.5 Row States

- default;
- hover;
- keyboard focus;
- selected;
- late forecast;
- dwell risk;
- completed;
- partial data;
- loading;
- empty search;
- empty filter.

Status tidak boleh dibedakan dengan warna saja.

---

## 6. Task Inspector 360px

Gunakan urutan:

1. Identity
2. State
3. Route Context
4. Timing
5. Actions
6. Links

### 6.1 Identity

- task reference;
- current status;
- plate number;
- driver;
- task freshness.

### 6.2 State

- origin;
- destination;
- current route position jika tersedia;
- progress;
- operational phase;
- loading atau unloading state.

### 6.3 Timing

- target arrival;
- estimated arrival;
- forecast difference;
- dwell duration;
- last update.

### 6.4 Actions

| Action | Destination/state |
|--------|-------------------|
| Open full task record | `/tasks/:id` |
| Open vehicle operational context | `/tracking?vehicle=:plateSlug` |
| Open vehicle record | `/vehicles/:id` |
| Open related trip history | `/history?vehicle=:plateSlug&event=:id` jika event tersedia |
| Recenter route | Local map state |
| Close inspector | Hapus `task` query dan pulihkan list |

Tidak ada action yang hanya menghasilkan success toast.

---

## 7. Canonical Scenarios

### 7.1 Forecast Late

**Vehicle:** B 9012 XYZ
**Estimated arrival:** 14:58
**Target arrival:** 14:20

Formula:

forecastLate =
isOperationallyActive(task)
dan estimatedArrival > targetArrival

Jangan menggunakan `eta < now` sebagai satu-satunya late definition.

### 7.2 Long Unloading

**Vehicle:** L 3456 ABC
**Unloading duration:** 2 jam 18 menit

Formula:

dwellRisk =
normalizedPhase termasuk loading atau unloading
dan now - dwellStart > DWELL_THRESHOLD

`DWELL_THRESHOLD` berasal dari versioned demo-store configuration.

---

## 8. Add Task Truth

Current task state tidak memiliki `setTasks`, sehingga form Add Task belum dapat
mengubah task array utama.

Target hanya boleh memilih salah satu:

### Persistent Demo Action

- validasi form;
- buat stable task id;
- tulis ke versioned demo store;
- update list;
- tambahkan activity record;
- state bertahan setelah reload;
- tampilkan task yang baru dibuat.

### Explicitly Unavailable

- tombol disabled;
- penjelasan singkat bahwa create flow belum tersedia;
- tidak menampilkan success toast.

Dilarang menampilkan task creation success jika task tidak tersimpan.

---

## 9. Manual Refresh

Manual Refresh dihapus.

Task data membaca demo store dan bereaksi terhadap store update.

Demo Reset tetap berada pada Workspace Chip App Shell.

Freshness ditampilkan sebagai state, bukan tombol Refresh.

---

## 10. Action Truth Table

| Element | User Intent | Action Class | Destination/state change | Persistence | Failure Behavior |
|---------|-------------|--------------|--------------------------|-------------|------------------|
| Task row | Pilih task | Persistent state | `/tasks?task=:id&view=map` | URL | Inspector error + Back to List |
| Inspector close | Kembali ke list | Persistent state | Hapus task query | URL | Pulihkan list |
| Search | Cari task | Local/query state | Filter task rows | Session atau URL | Empty search + Clear |
| Status filter | Batasi task | Proposed query state | `status=:status` | URL | Empty filter + Clear |
| Sort | Urutkan task | Proposed query state | `sort` dan `direction` | URL | Default sort |
| Recenter route | Fokus route | Local map interaction | Map viewport berubah | None | Map control error |
| Open full record | Lihat task lengkap | Operational navigation | `/tasks/:id` | None | Error + Retry |
| Add Task | Buat task | Persistent demo action atau unavailable | Demo store mutation | LocalStorage | Validation error |
| Manual Refresh | Tidak digunakan | Removed | Tidak dirender | None | None |

---

## 11. Data Contract

| Field | Source | Derived/normalized | Consumer |
|-------|--------|--------------------|----------|
| Task identity | Task.id/reference | Stable id | Row, URL, inspector |
| Status | Task.status | Canonical task status | Filter, row |
| Vehicle | Task.vehicle relation | Plate slug dan vehicle id | Row, links |
| Driver | Task.driver relation | Name atau Unassigned | Row, inspector |
| ETA | Task.estimatedArrival | Asia/Jakarta display | Row, inspector |
| Target | Task.targetArrival | Asia/Jakarta display | Row, inspector |
| Forecast delay | ETA dan target | ETA minus target | Exception |
| Phase | Task.status/phase | Normalized phase | Row, inspector |
| Dwell duration | dwellStart | now minus dwellStart | Dwell risk |
| Progress | Task progress | Clamp 0 sampai 100 | Row, inspector |
| Route | Task route data | Valid coordinate sequence | Map |

Jika field tidak tersedia, tampilkan partial-data state. Jangan membuat nilai
pengganti.

---

## 12. Interaction and State Matrix

- initial loading;
- list ready;
- task selected;
- deep link selected;
- task not found;
- search no result;
- filter empty;
- partial task;
- route unavailable;
- map error;
- forecast late;
- dwell risk;
- add validation error;
- add unavailable;
- permission limited;
- demo reset.

Pesan harus operasional dan actionable.

---

## 13. Responsive Grayscale Wireframes

### 13.1 1366 — List Open

```
┌──────┬──────────────┬──────────────────────────────────────┐
│ Rail │ Task List    │ Map                                  │
│ 64px │ 320px        │ 982px                                │
│      │ Search       │ Selected route preview               │
│      │ Filters      │                                      │
│      │ Task rows    │                                      │
└──────┴──────────────┴──────────────────────────────────────┘
64 + 320 + 982 = 1366
```

### 13.2 1366 — Inspector Open

```
┌──────┬──────────────────────────────────────┬──────────────┐
│ Rail │ Unoccluded Map                       │ Inspector    │
│ 64px │ 942px                                │ 360px        │
│      │ Selected route recentered            │ Task detail  │
└──────┴──────────────────────────────────────┴──────────────┘
64 + 942 + 360 = 1366
```

### 13.3 1440

List:      64 + 320 + 1056 = 1440
Inspector: 64 + 1016 + 360 = 1440
Full map:  64 + 1376 = 1440

### 13.4 1920

List:      64 + 320 + 1536 = 1920
Inspector: 64 + 1496 + 360 = 1920
Full map:  64 + 1856 = 1920

### 13.5 Tablet 768px

- rail 64px;
- map tetap primary surface;
- Task List menjadi drawer;
- Task Inspector menjadi bottom sheet;
- list dan inspector tetap saling menggantikan;
- row tidak bergantung pada hover;
- bottom sheet dapat ditutup dengan Escape dan close button.

---

## 14. Typography and Accessibility

Informasi operasional minimum 14px:

- task reference;
- status;
- plate;
- driver;
- ETA;
- target;
- progress;
- dwell duration;
- exception.

12px hanya untuk suffix atau metadata non-kritis.

Keyboard:

- `/` atau Cmd+K: search;
- `L`: Task List;
- `I`: Task Inspector untuk selection aktif;
- Arrow Up/Down: navigasi rows;
- Enter: pilih task;
- Escape: tutup inspector.

---

## 15. Implementation Notes

| Area | Current | Target |
|------|---------|--------|
| List width | 380px | 320px |
| Selection | `selectedId` lokal | URL task query |
| Refresh | setTimeout + success toast | Dihapus |
| Filter | Local state + info toast | URL/local state tanpa toast |
| Sort | Ascending toggle rusak | Toggle asc/desc benar |
| Add Task | Tidak memiliki task setter | Persistent demo store atau unavailable |
| Small text | 16 kemunculan | Operational minimum 14px |

---

## 16. Definition of Done

- [x] Task List 320px
- [x] Task Inspector 360px
- [x] List dan inspector saling menggantikan
- [x] Rail 64px
- [x] Space budget 1366, 1440, dan 1920 benar
- [x] Selection tersimpan di URL
- [x] `/tasks/:id` tetap menjadi full task record
- [x] Map selection memakai `task=:id&view=map`
- [x] Forecast Late memakai ETA dibanding target
- [x] Dwell Risk mencakup loading dan unloading
- [x] Refresh manual dihapus
- [x] Sort toggle diperbaiki
- [x] Add Task persisten atau explicitly unavailable
- [x] Tidak ada simulated success
- [x] Informasi operasional minimum 14px
- [x] Narasi bahasa Indonesia dan bebas karakter CJK
- [x] Source code tidak berubah
