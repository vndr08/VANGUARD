# VANGUARD Dashboard Wireframe

**Tanggal:** 2026-08-04
**Status:** Grayscale wireframe specification untuk Dashboard
**Scope:** Layout, region, interaction, state, data

---

## 1. Dashboard Job

Dashboard adalah **operational entry point**, bukan halaman laporan dan bukan kumpulan KPI card.

Dalam lima detik, pengguna harus dapat menjawab:

1. **Apa yang membutuhkan perhatian sekarang?** — Needs Attention region
2. **Unit atau pekerjaan mana yang paling berisiko?** — Urutan berdasarkan severity
3. **Apa yang berubah sejak pemeriksaan terakhir?** — Operations Pulse region
4. **Tindakan atau halaman mana yang harus dibuka berikutnya?** — Navigation dari setiap row
5. **Apakah data armada masih segar?** — Indikator di top bar (dari App Shell)

Dashboard mengarahkan pengguna ke workflow operasional. Dashboard tidak boleh menggantikan Tracking, Tasks, Safety, History, atau Reports.

---

## 2. Diagnosis Dashboard Sekarang

### 2.1 Masalah Utama

| Masalah | Bukti | Dampak |
|---------|-------|--------|
| Enam KPI card terpisah | dashboard/page.tsx baris 174-179 | Bukan region ringkas, terlalu banyak surface |
| Angka hardcoded 103 units | AppShell.tsx baris 42, Sidebar.tsx baris 235, 248, 260 | Kredibilitas demo rendah |
| Quick Access button | dashboard/page.tsx baris 287-292 | Dead navigation |
| Activity Feed tanpa action | dashboard/page.tsx baris 118-125 | Noise tanpa nilai |
| Refresh hanya re-trigger mock data | dashboard/page.tsx baris 53-65 | Tidak ada bedanya |

### 2.2 Component yang Harus Dihapus

| Component | Alasan |
|-----------|--------|
| KPIStatCard (x4) | Fleet State adalah satu region |
| KPIMetricCard (x2) | Operations Pulse adalah satu region |
| MiniFleetMap | Tidak ada pekerjaan operasional jelas |
| QuickAccessButton (x4) | Navigasi dari region |
| ActivityRow | Tidak ada nilai operasional |

---

## 3. Information Hierarchy

### 3.1 Tiga Region Utama

Dashboard desktop maksimum memiliki tiga region utama:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NEEDS ATTENTION                               │
│                      (region paling dominan)                         │
├─────────────────────────────────────────────────────────────────────┤
│                          FLEET STATE                                │
│                    (satu region ringkas)                            │
├─────────────────────────────────────────────────────────────────────┤
│                        OPERATIONS PULSE                              │
│                   (empat metric dalam satu region)                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Prioritas Visual

Urutan prioritas visual di layar:
1. **Needs Attention** — Region paling atas, paling dominan
2. **Fleet State** — Region tengah, selalu terlihat
3. **Operations Pulse** — Region bawah, ringkasan

---

## 4. Region Specifications

### 4.1 Needs Attention

**Region paling dominan.** Menampilkan exception yang butuh perhatian pengguna.

**Lima exception canonical:**

| # | Plate | Fakta | Destination |
|---|-------|-------|-------------|
| 1 | D 6600 WXY | Tidak mengirim data selama 42 menit | /tracking?vehicle=:plateSlug |
| 2 | B 5678 TGP | Overspeed 82 km/h pada 13:42, unreviewed | /safety?alert=:id |
| 3 | B 9012 XYZ | Estimated arrival 14:58, target arrival 14:20 | /tasks/:id |
| 4 | L 3456 ABC | Unloading selama 2 jam 18 menit | /tasks/:id |
| 5 | B 1234 KJT | Route deviation 1,8 km selama 7 menit | /history?vehicle=:plateSlug&event=:id |

**Interaksi:**
- Urutkan berdasarkan severity dan recency
- Filter: All, Safety, Operations, Connectivity
- Keyboard navigation
- States: default, hover, focus, selected, loading, empty

### 4.2 Fleet State

**Bukan sekumpulan KPI card.** Satu region yang menjelaskan distribusi kondisi armada.

**Struktur:**
```
┌──────────────────────────────────────────────────────────────┐
│ Driving {derived}  Idle {derived}  Stopped {derived}  Offline {derived} │
│ ────────────────────────bar────────────────────── Total 25 unit ─┘
```

**Validasi:**
```
driving + idle + stopped + offline + unknown = vehicles.length
```

Jika ada status yang tidak dikenali, masukkan ke Unknown. Tidak ada unit yang dibuang dari total.

**Klik segment** membuka /tracking?status=:status.

### 4.3 Operations Pulse

Empat metric dalam satu region:

| Metric | Formula | Action |
|--------|---------|--------|
| Active tasks | tasks dengan status operasional aktif | /tasks |
| Forecast late | tasks aktif dengan estimatedArrival lebih lambat dari targetArrival | /tasks?filter=late |
| Dwell risk | tasks aktif pada loading atau unloading yang melewati dwell threshold | /tasks |
| Completed today | tasks completed dalam hari kalender Asia/Jakarta | /tasks?filter=today |

**Data requirement:**
- Dwell threshold harus tersedia di demo store
- Tidak mengarang angka threshold

---

## 5. Action Truth Table

| Element | User Intent | Action Class | Destination/state change | Persistence | Empty Behavior |
|---------|-------------|--------------|--------------------------|-------------|---------------|
| Exception row | Investigate | Operational navigation | Canonical route | None | "Tidak ada exception" |
| Fleet segment | Lihat distribusi | Operational navigation | /tracking?status=:status | None | "Loading..." |
| Active tasks | Buka task monitor | Operational navigation | /tasks | None | "Tidak ada task aktif" |
| Forecast late | Buka task monitor | Proposed operational navigation | /tasks?filter=late | None | Badge tersembunyi |
| Dwell risk | Buka task monitor | Proposed operational navigation | /tasks | None | Badge tersembunyi |
| Completed today | Buka task monitor | Proposed operational navigation | /tasks?filter=today | None | Badge tersembunyi |

**Catatan untuk proposed navigation:**
- Query state /tasks?filter=late dan /tasks?filter=today harus diimplementasikan dan diuji
- Label "Proposed" menunjukkan fitur belum diverifikasi ada di demo store

**Klasifikasi action:**
- Operational navigation: destination canonical sudah tersedia
- Proposed operational navigation: destination memerlukan implementasi query state

---

## 6. Interaction and State Matrix

### 6.1 States untuk Setiap Interactive Element

| State | Visual | Behavior |
|-------|--------|----------|
| Default | Baseline styling | Siap untuk interaksi |
| Hover | Background highlight, cursor pointer | Feedback visual |
| Keyboard focus | Focus ring brand | Tab navigation |
| Selected | Background berbeda | Navigasi siap |
| Loading | Skeleton shimmer | Data sedang dimuat |
| Empty | Ilustrasi + teks | Tidak ada data |
| Partial data | Jumlah terbatas | Tidak semua ditampilkan |
| Delayed data | Warning indicator di top bar | Data mungkin tidak terkini |
| Global error | Error boundary + retry | Gagal memuat |
| Permission limited | Region tersembunyi | User tidak punya akses |
| Demo reset | Refresh semua data | Kembali ke seed |

---

## 7. Data Contract

### 7.1 Source Entity dan Field

| Source Entity | Field | Derived Value | Consumer Region |
|---------------|-------|--------------|----------------|
| Vehicle | status | driving count | Fleet State |
| Vehicle | status | idle count | Fleet State |
| Vehicle | status | stopped count | Fleet State |
| Vehicle | status | offline count | Fleet State |
| Vehicle | status tidak dikenali | unknown count | Fleet State |
| Vehicle | last_update | stale duration | Needs Attention |
| Task | status | active tasks | Operations Pulse |
| Task | estimatedArrival, targetArrival | forecast late | Operations Pulse |
| Task | normalizedPhase, dwellStart | dwell risk | Operations Pulse |
| Task | status, completedAt | completed today | Operations Pulse |
| Alert | severity, reviewed | unreviewed alerts | Needs Attention |

### 7.2 Formula

```typescript
// Total fleet (keputusan demo)
total = vehicles.length // harus = 25

// Fleet status distribution
driving = vehicles.filter(v => v.status === "driving").length
idle = vehicles.filter(v => v.status === "idle").length
stopped = vehicles.filter(v => v.status === "stopped").length
offline = vehicles.filter(v => v.status === "offline").length
unknown = vehicles.filter(v => !["driving","idle","stopped","offline"].includes(v.status)).length

// Validasi
// Jika driving + idle + stopped + offline + unknown !== total
// maka tampilkan demo data integrity error
// Jangan memaksa hasil menjadi 25 secara visual

// Operations Pulse
// isOperationallyActive menggunakan normalized demo-store adapter
// normalizedPhase mencegah halaman bergantung pada variasi status mentah
activeTasks = tasks.filter(task => isOperationallyActive(task)).length

// Forecast Late hanya menghitung task aktif
forecastLate = activeTasks.filter(task =>
  task.estimatedArrival > task.targetArrival
).length

// Dwell Risk mencakup loading dan unloading
// DWELL_THRESHOLD harus berasal dari demo-store configuration
dwellRisk = activeTasks.filter(task =>
  ["loading","unloading"].includes(task.normalizedPhase)
  && now - task.dwellStart > DWELL_THRESHOLD
).length

// Completed today menggunakan Asia/Jakarta timezone
dwellRisk = activeTasks.filter(task =>
  ["loading", "unloading"].includes(task.normalizedPhase)
  && now - task.dwellStart > DWELL_THRESHOLD
)

completedToday = tasks.filter(task =>
  task.status === "completed"
  && isToday(task.completedAt, "Asia/Jakarta")
).length
```

---

## 8. Responsive Grayscale Wireframes

### 8.1 Wireframe 1366x768

Sidebar expanded 248px. Horizontal padding 24px. Vertical height 768px.

```
+------+--------------------------------------------------------------------+
|      | Needs Attention                              [All v] [Safety]   |
| [=]  +--------------------------------------------------------------------+
| [O]  | [TYPE]  PLATE         FAKTA                   WAKTU        [>]  |
| [L]  | [--]    D 6600 WXY    Tidak mengirim data      42 menit           |
| [T]  | [--]    B 5678 TGP    Overspeed 82 km/h      13:42              |
| [S]  | [--]    B 9012 XYZ    ETA 14:58 target 14:20                        |
| [R]  | [--]    L 3456 ABC    Unloading               2 jam 18 menit       |
| [A]  | [--]    B 1234 KJT    Deviasi 1,8 km          7 menit            |
+------+--------------------------------------------------------------------+
|      | Fleet State                                                     |
|      | Driving {derived}  Idle {derived}  Stopped {derived}  Offline {derived} |
|      | Unknown {derived}  Total 25                                      |
+------+--------------------------------------------------------------------+
|      | Operations Pulse                                               |
|      | Active {derived}  Forecast late {derived}  Dwell risk {derived}  Done today {derived} |
+------+--------------------------------------------------------------------+
  248       24                    1070                              24

Horisontal: 248 + 24 + 1070 + 24 = 1366
Vertikal:
  Top bar 56px + region 320px + gap 16px + region 112px + gap 16px + region 112px + padding 24px = 664px
  Content: 320 + 16 + 112 + 16 + 112 = 576
664 - 576 = 88px
  Sisa 88px untuk breathing room


### 8.2 Wireframe 1440x900

Sidebar expanded 248px.

```
+------+--------------------------------------------------------------------+
|      | Needs Attention                              [All v] [Safety]   |
| [=]  +--------------------------------------------------------------------+
| [O]  | [TYPE]  PLATE         FAKTA                   WAKTU        [>]  |
| [L]  | [--]    D 6600 WXY    Tidak mengirim data      42 menit           |
| [T]  | [--]    B 5678 TGP    Overspeed 82 km/h      13:42              |
| [S]  | [--]    B 9012 XYZ    ETA 14:58 target 14:20                        |
| [R]  | [--]    L 3456 ABC    Unloading               2 jam 18 menit       |
| [A]  | [--]    B 1234 KJT    Deviasi 1,8 km          7 menit            |
+------+--------------------------------------------------------------------+
|      | Fleet State                                                     |
|      | Driving {derived}  Idle {derived}  Stopped {derived}  Offline {derived} |
|      | Unknown {derived}  Total 25                                      |
+------+--------------------------------------------------------------------+
|      | Operations Pulse                                               |
|      | Active {derived}  Forecast late {derived}  Dwell risk {derived}  Done today {derived} |
+------+--------------------------------------------------------------------+
  248       24                    1144                              24

Horisontal: 248 + 24 + 1144 + 24 = 1440


### 8.3 Wireframe 1920x1080

Sidebar expanded 248px. Wrapper 1600px dipusatkan.

```
+------+--------------------------------------------------------------------+
|      | Needs Attention                              [All v] [Safety]   |
| [=]  +--------------------------------------------------------------------+
| [O]  | [TYPE]  PLATE         FAKTA                   WAKTU        [>]  |
| [L]  | [--]    D 6600 WXY    Tidak mengirim data      42 menit           |
| [T]  | [--]    B 5678 TGP    Overspeed 82 km/h      13:42              |
| [S]  | [--]    B 9012 XYZ    ETA 14:58 target 14:20                        |
| [R]  | [--]    L 3456 ABC    Unloading               2 jam 18 menit       |
| [A]  | [--]    B 1234 KJT    Deviasi 1,8 km          7 menit            |
+------+--------------------------------------------------------------------+
|      | Fleet State                                                     |
|      | Driving {derived}  Idle {derived}  Stopped {derived}  Offline {derived} |
|      | Unknown {derived}  Total 25                                      |
+------+--------------------------------------------------------------------+
|      | Operations Pulse                                               |
|      | Active {derived}  Forecast late {derived}  Dwell risk {derived}  Done today {derived} |
+------+--------------------------------------------------------------------+
  248       36  24                    1552                    24  36

Horisontal: 248 + 36 + 24 + 1552 + 24 + 36 = 1920


### 8.4 Wireframe Tablet 768px

Rail 64px, satu kolom.

```
+------+--------------------------------------------------------------------+
|      | Needs Attention                                    [All v]        |
| [=]  +--------------------------------------------------------------------+
| [O]  | [TYPE]  PLATE         FAKTA                   WAKTU        [>]  |
| [L]  | [--]    D 6600 WXY    Tidak mengirim data      42 menit           |
| [T]  | [--]    B 5678 TGP    Overspeed 82 km/h      13:42              |
| [S]  | [--]    B 9012 XYZ    ETA 14:58 target 14:20                        |
| [R]  | [--]    L 3456 ABC    Unloading               2 jam 18 menit       |
| [A]  | [--]    B 1234 KJT    Deviasi 1,8 km          7 menit            |
+------+--------------------------------------------------------------------+
|      | Fleet State                                                     |
|      | Driving {derived}  Idle {derived}  Stopped {derived}  Offline {derived} |
|      | Unknown {derived}  Total 25                                      |
+------+--------------------------------------------------------------------+
|      | Operations Pulse                                               |
|      | Active {derived}  Forecast late {derived}  Dwell risk {derived}  Done today {derived} |
+------+--------------------------------------------------------------------+
   64       24                    656                    24

Horisontal: 64 + 24 + 656 + 24 = 768


---

## 9. Space Budget

### 9.1 Anggaran Ruang Horisontal

| Viewport | Sidebar | Outer Gap | Padding | Inner Content | Total |
|----------|---------|----------|---------|--------------|-------|
| 1366 | 248 | — | 24+24 | 1070 | 1366 |
| 1440 | 248 | — | 24+24 | 1144 | 1440 |
| 1920 | 248 | 36+36 | 24+24 | 1552 | 1920 |
| Tablet | 64 | — | 24+24 | 656 | 768 |

### 9.2 Anggaran Ruang Vertikal 1366x768

| Komponen | Nilai |
|----------|-------|
| Viewport height | 768px |
| Global top bar | 56px |
| Page vertical padding | 24+24px |
| Available inner height | 664px |
| Needs Attention region | 320px |
| Gap | 16px |
| Fleet State region | 112px |
| Gap | 16px |
| Operations Pulse region | 112px |
| **Total content** | **576px** |
| Sisa | 88px |

Rincian Needs Attention 320px:
- Region header: 44px
- Column header: 36px
- Lima exception row: 5 x 48px = 240px

### 9.3 Verifikasi Horisontal

**1366:**
```
248 + 24 + 1070 + 24 = 1366
```

**1440:**
```
248 + 24 + 1144 + 24 = 1440
```

**1920:**
```
248 + 36 + 24 + 1552 + 24 + 36 = 1920
```
Wrapper 1600px dipusatkan dalam shell content 1672px.

**Tablet:**
```
64 + 24 + 656 + 24 = 768
```

---

## 10. Typography dan Accessibility

### 10.1 Skala Typography

| Element | Minimum | Weight |
|---------|---------|--------|
| Region title | 16px | semibold |
| Plate number | 14px mono | semibold |
| Exception type | 14px | medium |
| Exception fact | 14px | normal |
| Timestamp/duration exception | 14px | normal |
| Operational status/badge | 14px | medium |
| Metric label | 14px | normal |
| Metric value | 24px | semibold |
| Secondary non-critical metadata | 12px | normal |

### 10.2 Uppercase Rules

Uppercase hanya untuk:
- Singkatan (ETA, GPS, km/h)
- Plate number format (B 1234 KJT)
- Kode operasional yang memang uppercase

### 10.3 Minimum Size

Informasi yang menentukan keputusan operasional minimum 14px.

Pengecualian 12px hanya untuk metadata sekunder yang tidak memengaruhi keputusan.

---

## 11. Anti AI Slop Verification

1. **Tidak ada card dalam card** — Border dan divider digunakan, bukan Card wrapper bertingkat
   Bukti: Wireframe hanya menggunakan dividers horizontal

2. **Tidak ada gradient dekoratif** — Tidak ada gradient di wireframe
   Bukti: Semua background solid colors

3. **Tidak ada hero marketing** — Tidak ada banner selamat datang
   Bukti: Needs Attention langsung muncul setelah top bar

4. **Tidak ada welcome banner** — Langsung ke konten operasional
   Bukti: Region pertama adalah Needs Attention

5. **Tidak ada enam KPI card seragam** — Fleet State adalah satu region dengan bar
   Bukti: Satu bar distribusi, bukan card terpisah

6. **Tidak ada icon tanpa fungsi** — Setiap icon menjelaskan exception type
   Bukti: Icon maps ke type: connectivity, overspeed, task, dll

7. **Tidak ada chart tanpa keputusan** — Bar distribusi membantu filter cepat
   Bukti: Klik bar membuka /tracking?status=:status

8. **Tidak ada teks operasional di bawah 14px** — Plate number, type, fact, timestamp 14px
   Bukti: Wireframe typography section

9. **Tidak ada button generik** — Tidak ada Explore, Manage, atau Optimize
   Bukti: Tidak ada Quick Access button

10. **Tidak ada region yang hanya mengisi ruang kosong** — Setiap region punya action
    Bukti: Needs Attention navigasi, Fleet State filter, Operations Pulse navigasi

---

## 12. Implementation Notes

### 12.1 Component yang Dihapus

| Component | Reason |
|-----------|--------|
| KPIStatCard (x4) | Fleet State satu region |
| KPIMetricCard (x2) | Operations Pulse satu region |
| MiniFleetMap | Tidak ada pekerjaan operasional jelas |
| QuickAccessButton (x4) | Navigasi dari region |
| ActivityRow | Tidak ada nilai operasional |

### 12.2 Component yang Dipertahankan

| Component | Adaptasi |
|-----------|----------|
| ExceptionRow | Bisa diadaptasi untuk Needs Attention |
| StatusDistribution | Disederhanakan menjadi bar tanpa card |

### 12.3 Data yang Harus Diperbaiki

| Data | Sekarang | Menjadi |
|------|---------|--------|
| 103 units | Hardcoded | Dihapus, hitung dari vehicles.length |
| Active tasks | Math.floor(total * 0.68) | tasks.filter status operasional aktif |
| On-time rate | 87.4 | Dihapus dari Dashboard, arahkan ke Reports |

### 12.4 Action yang Harus Dihubungkan ke Route

| Action | Route |
|--------|-------|
| Exception connectivity | /tracking?vehicle=:plateSlug |
| Exception overspeed | /safety?alert=:id |
| Exception task | /tasks/:id |
| Exception route deviation | /history?vehicle=:plateSlug&event=:id |
| Fleet segment | /tracking?status=:status |
| Active tasks | /tasks |
| Forecast late | /tasks?filter=late (proposed query state) |
| Dwell risk | /tasks |
| Completed today | /tasks?filter=today (proposed query state) |

### 12.5 Regression Risk

| Risk | Mitigation |
|------|------------|
| Fleet State berbeda tampilan | Test semua viewport |
| Exception tidak muncul | Verify data sources |
| Navigation broken | Test setiap link |
| Query state tidak berfungsi | /tasks?filter=late harus diuji |

---

## 13. Keputusan Produk Terkunci

Tidak ada pertanyaan produk terbuka pada tahap ini.

### 13.1 Keputusan yang Sudah Dikunci

| Keputusan | Alasan |
|-----------|--------|
| Tidak ada Mini Fleet Map | Tidak ada pekerjaan operasional jelas |
| Fleet State tidak expandable | Klik langsung navigasi |
| Tidak ada Quick Access | Navigasi dari region |
| Tidak ada Activity Feed | Tidak ada nilai operasional |
| Tidak ada welcome banner | Needs Attention pertama |
| Maksimum tiga region utama | Fokus pada keputusan |

---

## 14. Chat Output

### 14.1 Tiga Region Final

```
1. Needs Attention (paling dominan)
   - Lima exception canonical
   - Filter: All, Safety, Operations, Connectivity

2. Fleet State (satu region)
   - Bar distribusi visual
   - driving + idle + stopped + offline + unknown = 25

3. Operations Pulse (satu region)
   - Active tasks {derived}
   - Forecast late {derived}
   - Dwell risk {derived}
   - Completed today {derived}
```

### 14.2 Empat Metric Operations Pulse

| Metric | Formula |
|--------|---------|
| Active tasks | tasks dengan status operasional aktif |
| Forecast late | tasks aktif dengan estimatedArrival > targetArrival |
| Dwell risk | tasks unloading melewati dwell threshold |
| Completed today | tasks completed hari ini (Asia/Jakarta) |

### 14.3 Lima Exception dan Destination

| # | Plate | Fakta | Destination |
|---|-------|-------|-------------|
| 1 | D 6600 WXY | Tidak mengirim data selama 42 menit | /tracking?vehicle=:plateSlug |
| 2 | B 5678 TGP | Overspeed 82 km/h pada 13:42 | /safety?alert=:id |
| 3 | B 9012 XYZ | ETA 14:58 target 14:20 | /tasks/:id |
| 4 | L 3456 ABC | Unloading 2 jam 18 menit | /tasks/:id |
| 5 | B 1234 KJT | Deviasi 1,8 km selama 7 menit | /history?vehicle=:plateSlug&event=:id |

### 14.4 Persamaan Ruang

**1366:**
248 + 24 + 1070 + 24 = 1366

**1440:**
248 + 24 + 1144 + 24 = 1440

**1920:**
248 + 36 + 24 + 1552 + 24 + 36 = 1920

---

## 15. Definition of Done

- [x] Dashboard menjawab lima pertanyaan operasional utama
- [x] Needs Attention menjadi region paling dominan
- [x] Total armada berasal dari data dan sama dengan 25
- [x] Tidak ada 103 units pada proposed UI; referensi hanya muncul dalam diagnosis dan removal notes
- [x] Maksimum tiga region utama
- [x] Tidak ada kumpulan KPI cards seragam
- [x] Semua action memiliki destination atau state change
- [x] Semua wireframe desktop memiliki perhitungan ruang yang benar
- [x] Layout 1366x768 tidak horizontal scroll
- [x] Informasi operasional minimum 14px
- [x] Narasi bahasa Indonesia dan bebas karakter CJK
- [x] Tidak ada code, CSS, component, atau route yang diubah
- [x] Tidak ada angka status fleet atau Operations Pulse yang dikarang
- [x] Persamaan space budget memasukkan sidebar, padding, inner content, dan outer gap
- [x] Route deviation menyertakan event=:id
- [x] Proposed Dashboard tidak merender Mini Fleet Map
- [x] Needs Attention hanya memuat lima exception canonical
- [x] Keempat responsive wireframe menampilkan Needs Attention, Fleet State, dan Operations Pulse
- [x] Tiga region utama muat dalam vertical budget 1366x768
- [x] Formula Forecast Late hanya menghitung task aktif
- [x] Dwell Risk mencakup loading dan unloading
- [x] Seluruh narasi memakai bahasa Indonesia atau istilah UI dan teknis yang diizinkan
