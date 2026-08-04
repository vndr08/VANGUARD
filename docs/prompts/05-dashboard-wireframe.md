# TASK: VANGUARD Dashboard Grayscale Wireframe

## OUTPUT

Buat satu file saja:

docs/WIREFRAME-DASHBOARD.md

Jangan mengubah code, CSS, component, route, dependency, atau konfigurasi.
Jangan merancang ulang App Shell.
App Shell dalam docs/WIREFRAME-APP-SHELL.md sudah terkunci.

## DOKUMEN WAJIB DIBACA

1. docs/PRODUCT-DEMO-BRIEF.md
2. docs/INFORMATION-ARCHITECTURE.md
3. docs/UX-AUDIT.md
4. docs/WIREFRAME-APP-SHELL.md
5. docs/_evidence/dashboard-current.txt
6. docs/_evidence/mock-sources.txt
7. docs/_evidence/hardcoded-counts.txt
8. docs/_evidence/small-text.txt
9. frontend/src/app/(app)/dashboard/page.tsx
10. frontend/src/lib/mock-data.ts
11. frontend/src/lib/api.ts

Jika ada konflik, keputusan dalam WIREFRAME-APP-SHELL.md menjadi aturan layout
tertinggi. PRODUCT-DEMO-BRIEF.md menjadi sumber kebenaran untuk demo story dan
dataset.

## TUJUAN DASHBOARD

Dashboard adalah operational entry point, bukan halaman laporan dan bukan
kumpulan KPI card.

Dalam lima detik, pengguna harus dapat menjawab:

1. Apa yang membutuhkan perhatian sekarang?
2. Unit atau pekerjaan mana yang paling berisiko?
3. Apa yang berubah sejak pemeriksaan terakhir?
4. Tindakan atau halaman mana yang harus dibuka berikutnya?
5. Apakah data armada masih segar?

Dashboard harus mengarahkan pengguna ke workflow operasional. Dashboard tidak
boleh menggantikan Tracking, Tasks, Safety, History, atau Reports.

## KEPUTUSAN TERKUNCI

D1. Dashboard tetap route /dashboard dan menjadi halaman pertama setelah masuk.

D2. Gunakan App Shell yang sudah dikunci:
- sidebar expanded 248px pada Dashboard
- top bar global tetap mengikuti WIREFRAME-APP-SHELL.md
- content region non-map memiliki maksimum 1600px
- horizontal page padding 24px
- tidak ada jam di top bar
- angka fleet dihitung dari data, bukan hardcoded

D3. Anggaran ruang wajib dihitung:

| Viewport | Sidebar | Shell Content | Inner Content setelah padding |
|----------|---------|---------------|-------------------------------|
| 1366 | 248 | 1118 | 1070 |
| 1440 | 248 | 1192 | 1144 |
| 1920 | 248 | 1672, dibatasi 1600 | 1552 |

Setiap wireframe wajib memakai angka tersebut dan menjumlah dengan benar.

D4. Informasi operasional minimum 14px. Uppercase hanya boleh untuk singkatan,
plate number, atau kode operasional yang memang uppercase.

D5. Dilarang memakai card untuk setiap angka. Status fleet harus menjadi satu
region ringkas, bukan empat sampai enam KPI cards terpisah.

D6. Region prioritas utama adalah Needs Attention. Region ini harus tampil
sebelum ringkasan umum.

D7. Dashboard maksimum memiliki tiga region utama di desktop:
- Needs Attention
- Fleet State
- Operations Pulse

Subregion diperbolehkan jika tidak menjadi card bertumpuk.

D8. Peta preview tidak wajib. Jika dipakai, jelaskan pekerjaan operasional yang
dibantu. Dilarang menambahkan peta hanya agar Dashboard terlihat canggih.

D9. Tidak ada dead button, toast-only action, atau simulated success. Aksi
Dashboard harus berupa:
- navigasi ke workflow nyata
- perubahan state demo yang persisten
- atau label yang jelas sebagai unavailable/future

D10. Semua angka berasal dari satu demo data store. Total armada adalah 25
kendaraan. Hapus seluruh referensi 103 units.

D11. Dashboard harus memprioritaskan exception, bukan semua data.

D12. Dashboard tidak boleh mengulang semua isi Tracking atau Tasks. Setiap
region hanya menampilkan ringkasan yang cukup untuk memutuskan halaman tujuan.

## DEMO SCENARIOS WAJIB

Needs Attention harus dapat memuat lima skenario canonical:

1. GPS tidak mengirim data:
   D 6600 WXY, 42 menit

2. Overspeed:
   B 5678 TGP, 82 km/h, 13:42, unreviewed

3. Late task:
   B 9012 XYZ, ETA 14:58 dibanding target 14:20

4. Long unloading:
   L 3456 ABC, 2 jam 18 menit

5. Route deviation:
   B 1234 KJT, deviasi 1,8 km selama 7 menit

Jangan membuat skenario keenam tanpa bukti dari dokumen atau source.

## HIERARKI YANG HARUS DIRANCANG

### 1. Needs Attention

Region paling dominan.

Setiap row minimal menampilkan:
- severity
- exception type
- plate number
- ringkasan fakta
- waktu atau durasi
- primary destination
- review state jika relevan

Harus dapat:
- diurutkan berdasarkan severity dan recency
- difilter minimal All, Safety, Operations, Connectivity
- dibuka dengan keyboard
- menunjukkan selected, hover, focus, reviewed, dan unreviewed state

Tujuan canonical:
- overspeed -> /safety?alert=:id
- GPS tidak mengirim data -> /tracking?vehicle=:plateSlug
- late task -> /tasks/:id
- long unloading -> /tasks/:id
- route deviation -> /history?vehicle=:slug&event=:id

### 2. Fleet State

Bukan sekumpulan KPI card.

Rancang sebagai satu region yang menjelaskan distribusi kondisi armada.
Jumlah driving, idle, stopped, dan offline wajib dihitung dari demo data.
Jika nilai tepatnya tidak dapat diverifikasi, tulis formula/data requirement,
bukan angka rekaan.

Total seluruh status harus sama dengan 25.

Klik status harus membuka Tracking dengan filter yang sesuai.

### 3. Operations Pulse

Ringkas kondisi pekerjaan operasional:
- active tasks
- late tasks
- loading/unloading risk
- completed today
- perubahan terbaru yang relevan

Jangan membuat setiap metric menjadi card.

Region harus membantu pengguna memilih apakah perlu membuka Tasks, History,
atau Reports.

## ACTION TRUTH TABLE

Buat tabel untuk setiap interactive element dengan kolom:

| Element | User intent | Action | Destination/state change | Persistence | Empty/error behavior |

Klasifikasikan setiap action:

- Persistent action
- Operational navigation
- Demo simulation with explicit label
- Future/unavailable

Dilarang memakai simulated success yang mengaku aksi berhasil.

## INTERACTION STATES

Definisikan minimal:

- default
- hover
- keyboard focus
- selected
- loading
- empty
- partial data
- delayed data
- global error
- permission-limited
- demo reset

Jelaskan perubahan state tanpa mengandalkan warna saja.

## RESPONSIVE WIREFRAMES

Buat grayscale text wireframe untuk:

1. 1366x768
2. 1440x900
3. 1920x1080
4. Tablet 768 sampai 1024

Untuk setiap desktop wireframe:
- tulis lebar sidebar
- tulis lebar shell content
- tulis inner content width
- tulis jumlah kolom
- tulis gap
- buktikan jumlah horizontalnya tepat

Dashboard harus tetap dapat dipindai tanpa horizontal scroll pada 1366x768.

Tablet:
- navigation mengikuti aturan App Shell
- region menjadi satu kolom
- Needs Attention tetap pertama
- tabel atau row tidak boleh bergantung pada hover

## INFORMATION DENSITY

Tetapkan:
- maksimum jumlah exception row yang tampil sebelum View All
- maksimum jumlah status atau metric pada satu region
- aturan truncation
- aturan progressive disclosure
- informasi yang selalu terlihat
- informasi yang baru terlihat setelah selection

Jangan menebak angka tanpa alasan. Jelaskan dasar usability setiap batas.

## TYPOGRAPHY

Definisikan skala typography Dashboard:

- page title
- region title
- body operational
- plate number
- metric value
- metadata
- timestamp
- badge/status

Informasi operasional minimum 14px.
Pengecualian 12px hanya boleh untuk metadata sekunder yang tidak menentukan
keputusan dan tetap harus memenuhi contrast.

## DATA CONTRACT

Buat tabel untuk:

- source entity
- field
- derived value
- component/region consumer
- empty behavior
- freshness behavior

Dashboard harus membaca dari satu demo data store.

Jelaskan formula untuk:
- total fleet
- fleet status distribution
- active exception count
- late task count
- stale unit count
- completed today

Dilarang menulis angka turunan secara manual di component.

## ANTI AI SLOP CHECK

Untuk setiap aturan berikut, sertakan bukti dari rancangan:

1. Tidak ada card di dalam card
2. Tidak ada gradient dekoratif
3. Tidak ada hero marketing
4. Tidak ada welcome banner
5. Tidak ada enam KPI card seragam
6. Tidak ada icon tanpa fungsi
7. Tidak ada chart tanpa keputusan yang dibantu
8. Tidak ada teks operasional di bawah 14px
9. Tidak ada button generik seperti Explore, Manage, atau Optimize
10. Tidak ada region yang hanya mengisi ruang kosong

Jangan mencentang checklist tanpa menunjukkan bukti bagian atau wireframe.

## STRUKTUR OUTPUT WAJIB

1. Dashboard Job
2. Existing Dashboard Diagnosis
3. Information Hierarchy
4. Region Specifications
5. Needs Attention
6. Fleet State
7. Operations Pulse
8. Action Truth Table
9. Interaction and State Matrix
10. Data Contract
11. Responsive Grayscale Wireframes
12. Space Budget
13. Typography and Accessibility
14. Anti AI Slop Verification
15. Implementation Notes
16. Open Product Questions
17. Definition of Done

## IMPLEMENTATION NOTES

Sebutkan:
- component yang dapat dipertahankan
- component yang harus diganti
- data yang harus dipindahkan ke demo store
- hardcoded value yang harus dihapus
- action yang harus dihubungkan ke route
- regression risk
- performance risk

Namun jangan mengubah source code.

## DEFINITION OF DONE

Biarkan checklist belum dicentang sampai verifikasi dijalankan.

- [ ] Dashboard menjawab lima pertanyaan operasional utama
- [ ] Needs Attention menjadi region paling dominan
- [ ] Total armada berasal dari data dan sama dengan 25
- [ ] Tidak ada referensi 103 units
- [ ] Maksimum tiga region utama
- [ ] Tidak ada kumpulan KPI cards seragam
- [ ] Semua action memiliki destination atau state change
- [ ] Semua wireframe desktop memiliki perhitungan ruang yang benar
- [ ] Layout 1366x768 tidak horizontal scroll
- [ ] Informasi operasional minimum 14px
- [ ] Narasi bahasa Indonesia dan bebas karakter CJK
- [ ] Tidak ada code, CSS, component, atau route yang diubah

## VERIFIKASI SEBELUM SELESAI

Jalankan:

./scripts/check-docs-language.sh
./scripts/check-doc-structure.sh

Pastikan hanya docs/WIREFRAME-DASHBOARD.md yang dibuat atau diubah.

## CHAT OUTPUT

Tampilkan hanya:
1. hierarki tiga region final
2. wireframe ringkas 1366x768
3. lima exception canonical dan destination
4. action yang masih simulated atau dead pada Dashboard sekarang
5. pertanyaan yang benar-benar membutuhkan keputusan produk
