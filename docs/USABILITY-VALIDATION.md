# VANGUARD Grayscale Usability Validation

**Status:** Wireflow and specification validation
**Scope:** App Shell, Dashboard, Realtime Monitor, Task Monitor, Trip History
**Bukan:** Pengujian pengguna pada UI yang sudah diimplementasikan

---

## 1. Validation Goal

Validasi ini memastikan bahwa seluruh grayscale specification:

1. membentuk workflow yang konsisten;
2. tidak memiliki route yang saling bertentangan;
3. mempertahankan context antarhalaman;
4. dapat digunakan pada viewport minimum 1366x768;
5. memiliki keyboard path;
6. tidak mengandung dead action atau simulated success;
7. membedakan fakta demo dan data turunan;
8. siap masuk visual direction.

Validasi ini tidak menyatakan bahwa source code sudah memenuhi specification.

---

## 2. Documents Under Validation

1. `WIREFRAME-APP-SHELL.md`
2. `WIREFRAME-DASHBOARD.md`
3. `WIREFRAME-REALTIME-MONITOR.md`
4. `WIREFRAME-TASK-MONITOR.md`
5. `WIREFRAME-TRIP-HISTORY.md`
6. `INFORMATION-ARCHITECTURE.md`
7. `PRODUCT-DEMO-BRIEF.md`
8. `PRODUCT-TRUTH.md`

---

## 3. Locked Cross-Product Rules

| Rule | Locked Value |
|------|--------------|
| Navigation rail pada map workspace | 64px |
| List atau timeline | 320px |
| Inspector | 360px |
| Contextual surfaces | Maksimum satu |
| List dan inspector | Saling menggantikan |
| Inspector map padding | 360px |
| Inspector visual displacement | 180px |
| Operational typography | Minimum 14px |
| Runtime map target | MapLibre GL |
| Demo fleet total | 25 kendaraan |
| Fresh | Kurang dari 2 menit |
| Delayed | 2 sampai 10 menit |
| Not transmitting | Lebih dari 10 menit |
| Manual Refresh | Tidak dirender |
| Demo Reset | Workspace Chip App Shell |
| Selection identity | URL |
| Playback progress | Session state |

---

## 4. Canonical Route Contract

| Context | Canonical Route |
|---------|-----------------|
| Dashboard | `/dashboard` |
| Tracking default | `/tracking` |
| Selected vehicle | `/tracking?vehicle=:plateSlug` |
| Tracking search | `/tracking?search=open` |
| Task list/map | `/tasks` |
| Selected task on map | `/tasks?task=:id&view=map` |
| Full task record | `/tasks/:id` |
| Safety alert | `/safety?alert=:id` |
| Trip History vehicle | `/history?vehicle=:plateSlug` |
| Trip History event | `/history?vehicle=:plateSlug&event=:id` |
| Vehicle record | `/vehicles/:id` |

Transient selection tidak boleh hanya disimpan dalam component state jika perlu
dibagikan atau dipulihkan melalui browser navigation.

---

## 5. Canonical Demo Scenarios

| Scenario | Entity | Verified Fact | Primary Destination |
|----------|--------|---------------|---------------------|
| Connectivity | D 6600 WXY | Tidak mengirim data 42 menit | `/tracking?vehicle=:plateSlug` |
| Overspeed | B 5678 TGP | 82 km/h pada 13:42, unreviewed | `/safety?alert=:id` |
| Forecast Late | B 9012 XYZ | ETA 14:58, target 14:20 | `/tasks/:id` |
| Long Unloading | L 3456 ABC | 2 jam 18 menit | `/tasks/:id` |
| Route Deviation | B 1234 KJT | 1,8 km selama 7 menit | `/history?vehicle=:plateSlug&event=:id` |

Dilarang menambahkan timestamp, coordinate, atau angka baru tanpa source.

---

## 6. Wireflow Validation Matrix

### USV-01 — Dashboard to Connectivity Exception

**Start:** `/dashboard`

**Steps:**
1. Pengguna memindai Needs Attention.
2. Pengguna memilih D 6600 WXY.
3. Sistem membuka `/tracking?vehicle=:plateSlug`.
4. Vehicle Inspector terbuka.
5. Vehicle List tersembunyi.
6. Map recenter ke kendaraan.

**Expected:**
- context kendaraan dipertahankan;
- state menunjukkan Tidak mengirim data 42 menit;
- tidak menyimpulkan GPS rusak;
- browser Back kembali ke Dashboard.

Specification status: PASS
Implementation status: DEFERRED

### USV-02 — Dashboard to Overspeed Review

**Start:** `/dashboard`

**Steps:**
1. Pengguna memilih B 5678 TGP.
2. Sistem membuka `/safety?alert=:id`.
3. Alert tetap unreviewed sampai review action nyata dilakukan.

**Expected:**
- tidak ada simulated reviewed state;
- speed 82 km/h dan timestamp 13:42 tetap konsisten.

Specification status: PASS
Implementation status: DEFERRED

### USV-03 — Dashboard to Late Task

**Start:** `/dashboard`

**Steps:**
1. Pengguna memilih B 9012 XYZ.
2. Sistem membuka `/tasks/:id`.
3. Task menampilkan ETA 14:58 dan target 14:20.
4. Pengguna dapat membuka map context.

**Expected:**
- late ditentukan dari ETA lebih lambat daripada target;
- task identity tetap konsisten;
- tidak memakai `eta < now` sebagai satu-satunya late rule.

Specification status: PASS
Implementation status: DEFERRED

### USV-04 — Task Monitor Map Selection

**Start:** `/tasks`

**Steps:**
1. Task List 320px terbuka.
2. Pengguna memilih task.
3. URL berubah menjadi `/tasks?task=:id&view=map`.
4. List tersembunyi.
5. Task Inspector 360px terbuka.
6. Map menggunakan effective padding.

**Expected:**
- list dan inspector tidak tampil bersama;
- browser Back memulihkan Task List;
- selected task dapat dipulihkan setelah reload.

Specification status: PASS
Implementation status: DEFERRED

### USV-05 — Long Unloading

**Start:** `/tasks`

**Steps:**
1. Filter Needs Attention dipilih.
2. Pengguna memilih L 3456 ABC.
3. Inspector menampilkan unloading selama 2 jam 18 menit.

**Expected:**
- dwell threshold berasal dari configuration;
- tidak ada success toast;
- action membuka full task record atau vehicle context.

Specification status: PASS
Implementation status: DEFERRED

### USV-06 — Route Deviation Investigation

**Start:** `/history?vehicle=:plateSlug&event=:id`

**Steps:**
1. Vehicle dan event dimuat dari URL.
2. Replay progress pindah ke timestamp event.
3. Timeline tersembunyi.
4. Event Inspector terbuka.
5. Map recenter ke event.

**Expected:**
- deviation 1,8 km selama 7 menit;
- event memiliki stable identity;
- browser Back memulihkan Timeline;
- event URL dapat dibuka ulang.

Specification status: PASS
Implementation status: DEFERRED

### USV-07 — Trip Replay Controls

**Start:** `/history?vehicle=:plateSlug`

**Steps:**
1. Pengguna menjalankan Play.
2. Marker dan progress berubah.
3. Step Forward memajukan 10 detik.
4. Step Back memundurkan 10 detik.
5. Reset mengembalikan progress ke awal.

**Expected:**
- state visual menjadi feedback;
- tidak ada success/info toast;
- progress di-clamp 0 sampai 1;
- timer berhenti saat pause, complete, atau unmount.

Specification status: PASS
Implementation status: DEFERRED

### USV-08 — Keyboard Path

**Steps:**
1. Tab mencapai global search.
2. Arrow keys menavigasi list atau timeline.
3. Enter memilih entity.
4. `L` membuka list/timeline.
5. `I` membuka inspector untuk selection aktif.
6. Escape menutup inspector.
7. Space mengontrol replay ketika control focused.

**Expected:**
- focus selalu terlihat;
- tidak ada action yang hanya tersedia melalui hover;
- map memiliki list atau timeline alternative.

Specification status: PASS
Implementation status: DEFERRED

### USV-09 — Viewport 1366x768

**Expected budgets:**

```

List:

64 + 320 + 982 = 1366

Inspector:

64 + 942 + 360 = 1366

Full map:

64 + 1302 = 1366

```

Dashboard:

```

248 + 24 + 1070 + 24 = 1366

```

**Expected:**
- tidak ada horizontal scroll;
- operational text minimum 14px;
- map tetap dapat digunakan.

Specification status: PASS
Implementation status: DEFERRED

### USV-10 — Failure and Empty States

**Cases:**
- vehicle tidak ditemukan;
- task tidak ditemukan;
- event tidak ditemukan;
- route tidak tersedia;
- invalid coordinate;
- empty filter;
- search no result;
- partial telemetry;
- permission limited.

**Expected:**
- pesan operational;
- tersedia Retry, Clear, atau Back;
- toast bukan satu-satunya feedback;
- tidak ada false success.

Specification status: PASS
Implementation status: DEFERRED

---

## 7. Action Truth Validation

| Action Class | Requirement |
|--------------|-------------|
| Persistent state | Memiliki URL atau versioned demo-store mutation |
| Operational navigation | Memiliki canonical destination |
| Local map interaction | Mengubah map state yang terlihat |
| Local replay interaction | Mengubah progress atau playback state |
| Proposed query state | Ditandai perlu implementasi dan pengujian |
| Future/unavailable | Tidak mengaku berhasil |
| Removed | Tidak dirender |

Manual Refresh tidak termasuk action final.

Add Task hanya boleh:

- persistent ke versioned demo store; atau
- explicitly unavailable.

---

## 8. Accessibility Validation

Specification requirements:

- operational information minimum 14px;
- visible focus;
- semantic buttons;
- minimum touch target;
- status tidak bergantung pada warna;
- map memiliki list alternative;
- replay dapat digunakan dengan keyboard;
- reduced motion menghentikan animation non-esensial;
- screen reader menerima plate, status, freshness, dan event identity.

**Specification status:** PASS
**Implementation verification:** DEFERRED

---

## 9. Performance Validation

Specification requirements:

- satu MapLibre instance per page;
- cleanup listener dan timer;
- marker tidak dibuat ulang pada setiap telemetry update;
- fitBounds tidak berjalan pada setiap update;
- replay tidak membuat ulang route layer pada setiap tick;
- skeleton hanya untuk initial load;
- LocalStorage menggunakan versioned schema;
- update tidak memblokir interaksi.

**Specification status:** PASS
**Implementation verification:** DEFERRED

---

## 10. Known Implementation Gaps

Belum diimplementasikan dan harus masuk implementation plan:

1. Single versioned demo store.
2. URL selection untuk vehicle, task, dan event.
3. Mutual exclusion contextual surfaces.
4. Recenter dengan effective padding.
5. Persistent Add Task atau explicitly unavailable state.
6. Task sort ascending bug.
7. Removal manual Refresh.
8. Removal redundant toast.
9. Alert entity persistence.
10. Trip event stable identity.
11. Replay timer cleanup.
12. MapLibre technical-leftover cleanup.
13. Typography normalization.
14. Keyboard dan screen-reader verification.
15. Responsive browser testing.

Daftar ini bukan kegagalan wireframe. Ini adalah implementation backlog.

---

## 11. Gate to Visual Direction

Visual direction dapat dimulai karena:

- route contract konsisten;
- space budget konsisten;
- entity identity konsisten;
- contextual-surface model konsisten;
- canonical scenarios konsisten;
- typography minimum terkunci;
- action truth terkunci.

Visual direction tidak boleh mengubah workflow atau layout model.

---

## 12. Definition of Done

- [x] Lima wireframe utama lolos validator
- [x] Sepuluh wireflow scenario terdokumentasi
- [x] Canonical route konsisten
- [x] Lima canonical demo scenario konsisten
- [x] Space budget 1366 konsisten
- [x] Keyboard path terdokumentasi
- [x] Failure dan empty state terdokumentasi
- [x] Action truth terdokumentasi
- [x] Implementation gaps dipisahkan dari specification pass
- [x] Tidak ada klaim bahwa implementation usability sudah diuji
- [x] Narasi bahasa Indonesia dan bebas karakter CJK
- [x] Source code tidak berubah
