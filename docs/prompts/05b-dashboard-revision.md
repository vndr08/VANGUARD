# TASK: Revisi Final Dashboard Grayscale

Tulis ulang docs/WIREFRAME-DASHBOARD.md dalam satu operasi tulis.

Jangan mengubah code, CSS, component, route, dependency, atau konfigurasi.
Jangan membuat file output lain.
App Shell tidak boleh dirancang ulang.

## YANG SUDAH BENAR DAN HARUS DIPERTAHANKAN

Tiga region utama:

1. Needs Attention
2. Fleet State
3. Operations Pulse

Needs Attention tetap menjadi region pertama dan paling dominan.

## G1 — PERBAIKI SPACE BUDGET

Gunakan perhitungan berikut tanpa perubahan:

### 1366

- viewport: 1366px
- sidebar: 248px
- shell content: 1118px
- left padding: 24px
- inner content: 1070px
- right padding: 24px

Persamaan:

248 + 24 + 1070 + 24 = 1366

Status: muat tanpa horizontal scroll.

### 1440

- viewport: 1440px
- sidebar: 248px
- shell content: 1192px
- left padding: 24px
- inner content: 1144px
- right padding: 24px

Persamaan:

248 + 24 + 1144 + 24 = 1440

Status: muat tanpa horizontal scroll.

### 1920

- viewport: 1920px
- sidebar: 248px
- shell content: 1672px
- content wrapper: max 1600px
- outer gap: 36px pada setiap sisi
- wrapper left padding: 24px
- inner content: 1552px
- wrapper right padding: 24px

Persamaan:

248 + 36 + 24 + 1552 + 24 + 36 = 1920

Status: wrapper 1600px dipusatkan dalam shell content 1672px.

### Tablet 768

- rail: 64px
- shell content: 704px
- padding: 24px setiap sisi
- inner content: 656px

Persamaan:

64 + 24 + 656 + 24 = 768

Hapus seluruh klaim bahwa Dashboard membutuhkan horizontal scroll pada 1366
atau 1440.

## G2 — JANGAN MENGARANG ANGKA

Hapus angka berikut kecuali ada bukti langsung dari demo store:

- Driving 12
- Idle 8
- Stopped 3
- Offline 2
- Active 17
- Late 2
- Done today 8
- On-time 87%

Dalam wireframe gunakan:

- Driving {derived}
- Idle {derived}
- Stopped {derived}
- Offline {derived}
- Active tasks {derived}
- Forecast late {derived}
- Dwell risk {derived}
- Completed today {derived}

Total fleet tetap 25 karena merupakan keputusan demo yang terkunci.

Fleet State harus memvalidasi:

driving + idle + stopped + offline + unknown = vehicles.length

Jika ada status yang tidak dikenali, masukkan ke Unknown. Jangan membuang unit
dari total.

## G3 — LIMA EXCEPTION CANONICAL

Gunakan fakta berikut tanpa mengubah atau menambah detail:

1. D 6600 WXY
   Tidak mengirim data selama 42 menit
   Destination: /tracking?vehicle=:plateSlug

2. B 5678 TGP
   Overspeed 82 km/h pada 13:42, unreviewed
   Destination: /safety?alert=:id

3. B 9012 XYZ
   Estimated arrival 14:58, target arrival 14:20
   Destination: /tasks/:id

4. L 3456 ABC
   Unloading selama 2 jam 18 menit
   Destination: /tasks/:id

5. B 1234 KJT
   Route deviation 1,8 km selama 7 menit
   Destination: /history?vehicle=:plateSlug&event=:id

Dilarang menambahkan timestamp lain.

Dilarang memakai:
- GPS mati
- 14:32 untuk GPS
- 14:18 untuk unloading
- 2h sebagai pengganti 2 jam 18 menit

Hapus low fuel dari Needs Attention dan Data Contract karena bukan bagian dari
lima skenario canonical.

## G4 — OPERATIONS PULSE

Operations Pulse berisi tepat empat metric dalam satu region:

1. Active tasks
2. Forecast late
3. Loading/unloading dwell risk
4. Completed today

Jangan gunakan empat KPI card.

Formula konseptual:

activeTasks =
tasks dengan status operasional aktif

forecastLate =
tasks aktif dengan estimatedArrival lebih lambat dari targetArrival

dwellRisk =
tasks aktif pada loading atau unloading yang melewati dwell threshold

completedToday =
tasks completed dalam hari kalender Asia/Jakarta

Jangan memakai formula eta < now sebagai satu-satunya definisi late.

Jika dwell threshold belum tersedia di demo store, nyatakan sebagai data
requirement. Jangan mengarang angka threshold.

On-time rate tidak menjadi metric utama Dashboard. Jika dibutuhkan, arahkan ke
Reports.

## G5 — KEPUTUSAN PRODUK TERKUNCI

- Tidak ada Mini Fleet Map di Dashboard.
- Hapus MiniFleetMap dari Implementation Notes.
- Hapus performance risk MiniFleetMap.
- Hapus pertanyaan apakah Mini Fleet Map dipertahankan.
- Fleet State tidak expandable.
- Klik segment Fleet State membuka /tracking?status=:status.
- Tidak ada Quick Access.
- Tidak ada Activity Feed.
- Maksimum tiga region utama.
- Tidak ada welcome banner.
- Tidak ada kumpulan KPI cards.

## G6 — TYPOGRAPHY

Informasi yang menentukan keputusan minimum 14px.

Gunakan:

| Element | Minimum |
|---------|---------|
| Region title | 16px |
| Plate number | 14px |
| Exception type | 14px |
| Exception fact | 14px |
| Decision-critical timestamp/duration | 14px |
| Operational status/badge | 14px |
| Metric label | 14px |
| Metric value | 24px |
| Secondary non-critical metadata | 12px |

Jangan menyatakan badge/status 12px.

Jangan menyatakan semua timestamp 12px. Timestamp exception adalah 14px.

## G7 — ACTIONS DAN ROUTE

Canonical exception routes:

- connectivity -> /tracking?vehicle=:plateSlug
- overspeed -> /safety?alert=:id
- task exception -> /tasks/:id
- route deviation -> /history?vehicle=:plateSlug&event=:id

Jangan hardcode slug seperti d6600wxy atau b1234kjt.

Filter routes seperti /tasks?filter=late boleh ditulis sebagai proposed query
state, bukan route canonical yang sudah tersedia. Tandai bahwa implementasi
harus menyediakan dan menguji query state tersebut.

## G8 — RESPONSIVE WIREFRAMES

Buat ulang wireframe:

1. 1366x768
2. 1440x900
3. 1920x1080
4. Tablet 768px

Setiap wireframe harus menunjukkan:
- sidebar atau rail
- outer gap jika ada
- padding
- inner content
- persamaan yang tepat
- tidak ada horizontal scroll

Gunakan placeholder {derived} untuk semua metric yang belum terverifikasi.

## G9 — ANTI AI SLOP

Perbarui bukti agar sesuai dengan wireframe hasil revisi.

Jangan mengklaim tidak ada informasi operasional di bawah 14px jika tabel
typography masih menetapkan status atau timestamp operasional 12px.

## G10 — DEFINITION OF DONE

Checklist tetap belum dicentang sampai semua pemeriksaan selesai.

Tambahkan:

- [ ] Tidak ada angka status fleet atau Operations Pulse yang dikarang
- [ ] Persamaan space budget memasukkan sidebar, padding, inner content, dan outer gap
- [ ] Route deviation menyertakan event=:id
- [ ] Tidak ada Mini Fleet Map
- [ ] Tidak ada low fuel sebagai skenario keenam
- [ ] Status dan waktu operasional minimum 14px

## VERIFIKASI

Jalankan:

./scripts/check-docs-language.sh
./scripts/check-doc-structure.sh

Lalu pastikan pencarian berikut bersih:

grep -n "Driving 12\|Idle 8\|Stopped 3\|Offline 2\|Active 17\|Late 2\|Done today 8\|87%" docs/WIREFRAME-DASHBOARD.md

grep -n "GPS mati\|14:32\|14:18\|MiniFleetMap\|low fuel" docs/WIREFRAME-DASHBOARD.md

grep -n "248 + 24 + 1070 + 24 = 1366" docs/WIREFRAME-DASHBOARD.md

grep -n "248 + 24 + 1144 + 24 = 1440" docs/WIREFRAME-DASHBOARD.md

grep -n "248 + 36 + 24 + 1552 + 24 + 36 = 1920" docs/WIREFRAME-DASHBOARD.md

Pastikan hanya docs/WIREFRAME-DASHBOARD.md yang berubah.

## CHAT OUTPUT

Tampilkan hanya:

1. tiga region final
2. empat metric Operations Pulse
3. lima exception dan canonical destination
4. persamaan ruang untuk 1366, 1440, dan 1920
5. hasil verifikasi angka rekaan
