# VANGUARD — DESIGN.md

> Design language untuk VANGUARD Fleet Control Tower.
> Konsep inti: **"Graphite Command" — industrial operations interface (control-tower / mission-control)**.
> Tujuan: enterprise, presisi, padat-data, dark-first, terasa "nyata/4D" lewat depth + motion — BUKAN tampilan generic-AI SaaS.

---

## 1. Design Philosophy

**Tiga kata:** Profesional · Operasional · Presisi.

VANGUARD adalah ruang kendali (control tower) untuk dispatcher, supervisor, admin transport, tim safety, dan management. Dipakai berjam-jam di desktop/monitor lebar untuk memantau puluhan–ratusan kendaraan sekaligus. Maka prinsipnya:

1. **Glanceability di atas dekorasi.** Status harus terbaca < 1 detik. Warna + ikon + label, jangan warna saja.
2. **Density adalah fitur.** Ini cockpit, bukan landing page. Tabel rapat, angka `tabular-nums`, ruang dipakai efisien.
3. **Depth = realisme ("4D").** Kedalaman spasial (elevation, glass, layering) + dimensi waktu (gerak data real-time, transisi fisik/spring). Bukan gradient hero atau blob.
4. **Industrial, bukan playful.** Steel/graphite, hairline, sudut tegas-terukur, aksen sinyal hi-vis yang dipakai hemat.
5. **Anti generic-AI.** Tidak ada: background cream/sand, serba rounded-2xl, gradient ungu-biru, emoji dekoratif, glassmorphism berlebihan, drop-shadow lembek di semua kartu.

**Touchstones (rasa, bukan jiplak):** Samsara, Motive (KeepTruckin), Flightradar24, Datadog, Linear, Vercel Dashboard, Palantir Gotham. Industrial detailing ala Teenage Engineering.

---

## 2. Color System

Dark-first (mode utama control room), light tetap didukung penuh.

### 2.1 Neutrals — "Graphite/Steel"

| Token | Dark | Light | Pakai |
|---|---|---|---|
| `--bg` | `#0B0E11` | `#FAFAFB` | Canvas paling belakang |
| `--surface-1` | `#14181D` | `#FFFFFF` | Kartu, panel |
| `--surface-2` | `#1C2128` | `#F4F5F7` | Elevated (popover, dropdown, modal) |
| `--surface-3` | `#242B33` | `#ECEEF1` | Hover row, active cell |
| `--border` | `#262C34` | `#E4E7EB` | Hairline border (1px) |
| `--border-strong` | `#39424D` | `#CBD1D9` | Divider tegas, input focus ring base |
| `--text` | `#E6EAEF` | `#0E1217` | Teks utama |
| `--text-muted` | `#9AA4B2` | `#5B6470` | Teks sekunder, label |
| `--text-faint` | `#5E6773` | `#8A93A0` | Placeholder, disabled |

### 2.2 Brand & Signal

| Token | Hex | Pakai |
|---|---|---|
| `--brand` | `#3B82F6` (industrial cobalt, sedikit desaturasi) | Primary action, link, seleksi aktif |
| `--brand-hover` | `#2563EB` | Hover state primary |
| `--brand-soft` | `rgba(59,130,246,0.12)` | Background seleksi, highlight aktif nav |
| `--signal` | `#F59E0B` (hi-vis amber) | Aksen perhatian / CTA sekunder (HEMAT) |
| `--hud` | `#22D3EE` (technical cyan) | Aksen data/HUD: garis chart, glow live (HEMAT) |

### 2.3 Status Semantik (samakan dengan TRAMOS)

| Status kendaraan | Token | Hex | Ikon pendamping |
|---|---|---|---|
| Driving (bergerak) | `--st-driving` | `#10B981` emerald | ▶ / arrow |
| Idle (mesin nyala, diam) | `--st-idle` | `#F59E0B` amber | ◷ |
| Stopped / Parking | `--st-stop` | `#64748B` slate | ■ |
| Offline / No GPS | `--st-offline` | `#EF4444` red | ⦸ |
| Delayed (>30 mnt) | `--st-delayed` | `#F97316` orange | ⚠ |

| Status task | Token | Hex |
|---|---|---|
| Waiting | `--task-waiting` | `#64748B` |
| Assigned | `--task-assigned` | `#3B82F6` |
| Progress | `--task-progress` | `#10B981` |
| Unloading | `--task-unloading` | `#F59E0B` |
| Completed | `--task-completed` | `#22C55E` (atau muted check) |

Setiap warna status WAJIB punya varian `-bg` (alpha ~12%) untuk badge/pill dan `-fg` untuk teks kontras.

### 2.4 Data-viz palette (chart)
Urutan kategori: `#3B82F6, #22D3EE, #10B981, #F59E0B, #A78BFA, #F472B6, #64748B`. Hindari rainbow penuh; jaga harmoni cool-dominant. Untuk donut status, pakai langsung warna status semantik.

---

## 3. Typography

- **Sans (UI):** `Geist` atau `Inter` (variable). Fallback: system stack.
- **Mono (angka, plat, koordinat, ref):** `Geist Mono` / `JetBrains Mono`. Selalu `font-variant-numeric: tabular-nums` untuk angka di tabel & KPI.
- **Skala (desktop, base 14px):**

| Token | Size / LH | Weight | Pakai |
|---|---|---|---|
| `display` | 28 / 34 | 600 | KPI besar, angka hero |
| `h1` | 20 / 28 | 600 | Judul halaman |
| `h2` | 16 / 24 | 600 | Judul section/panel |
| `body` | 14 / 20 | 400 | Teks umum |
| `sm` | 13 / 18 | 400 | Tabel, detail |
| `label` | 11 / 14 | 600, `letter-spacing: 0.04em`, UPPERCASE | Label metrik, header kolom |
| `mono-kpi` | 24 / 30 | 600 tabular | Angka KPI |

- Heading: `tracking-tight`. Label/eyebrow: `tracking-wide` uppercase. Jangan italic untuk data.

---

## 4. Spacing, Grid & Density

- Base unit 4px. Skala: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48.
- **Density toggle (Compact ↔ Comfortable)** harus nyata: Compact row height 32px, Comfortable 44px.
- Page padding 24px (desktop), gap antar section 20px, padding kartu 16–20px.
- Sidebar lebar 248px (expanded) / 64px (rail/collapsed).
- Layout cockpit: sidebar tetap + header tetap (sticky) + konten scroll. Map pages = full-bleed, panel detail overlay/dock.

---

## 5. Elevation & Depth ("4D")

Kedalaman dibangun berlapis, bukan dari satu drop-shadow generik.

```
--elev-0: none;                                  /* flat di canvas */
--elev-1: 0 1px 0 rgba(0,0,0,.4), 0 1px 2px rgba(0,0,0,.3);     /* kartu */
--elev-2: 0 4px 12px rgba(0,0,0,.35), 0 1px 0 rgba(255,255,255,.03) inset; /* dropdown */
--elev-3: 0 16px 48px rgba(0,0,0,.5),  0 1px 0 rgba(255,255,255,.04) inset; /* modal, panel map */
--glow-live: 0 0 0 2px rgba(34,211,238,.25), 0 0 16px rgba(34,211,238,.25); /* elemen live */
```

Teknik depth:
- **Hairline + inner highlight** (1px top inset putih 3–4% alpha) → permukaan terasa "machined".
- **Glass dock** di atas map: `backdrop-blur(12px)` + `surface-1` alpha 70% + border-strong. Dipakai HANYA untuk panel di atas peta, tidak di mana-mana.
- **Layering z**: map (0) < route (10) < marker (20) < cluster (25) < dock/panel (40) < toast (60) < modal (80).
- **Long shadow halus** untuk marker terpilih agar "mengambang" di atas peta.

### Borders / radius
- Card 10px · Button 8px · Input 8px · Badge/pill 999px · Modal 14px. Konsisten; jangan campur rounded-2xl di mana-mana.

---

## 6. Motion System

Prinsip: **fisik, cepat, bermakna.** Gerak menjelaskan perubahan state & data real-time, bukan dekorasi.

- **Durasi:** micro 120ms · standar 200ms · panel/overlay 280ms · route draw 600–900ms.
- **Easing:** UI `cubic-bezier(.2,.8,.2,1)` (ease-out-quint-ish). Spring (framer-motion) untuk panel & marker: `stiffness 320, damping 30`.
- **Wajib hormati `prefers-reduced-motion`:** matikan marker interpolation, route-draw, number-ticker → fallback ke perpindahan instan + fade.

Animasi khas VANGUARD:
1. **Marker interpolation** — truk bergeser mulus antar ping GPS (lerp posisi + rotasi heading), bukan "loncat".
2. **Live pulse** — titik status driving ber-pulse halus (cyan `--hud`), berhenti saat reduced-motion.
3. **Route draw-on** — garis actual route ter-"gambar" (stroke-dashoffset) saat dibuka.
4. **Number ticker** — KPI count-up saat load/refresh (tabular-nums, no layout shift).
5. **Panel slide+depth** — detail panel masuk dari kanan dengan spring + naik elevasi.
6. **Toast stack** — notifikasi speeding muncul dari kanan-bawah, stack, auto-dismiss + progress bar.
7. **Row enter** — tabel realtime: baris baru fade+slide 8px; perubahan nilai highlight sekejap (flash `brand-soft`).
8. **Skeleton shimmer** — saat fetch, bukan spinner kosong.

Library saran: **framer-motion** (spring/orchestration), **react-leaflet** marker animation atau pindah ke **MapLibre GL** (lihat §7), **lucide-react** ikon, opsi **lottie** untuk ikon status mikro.

---

## 7. Map Design System (inti produk)

> Untuk efek "4D / nyata" + pion truck + tilt, REKOMENDASI: migrasi dari Leaflet 2D ke **MapLibre GL JS** (vektor, gratis, mendukung `pitch`/`bearing` 3D, symbol layer custom, animasi marker mulus, 3D extrusion). Kalau ingin tetap cepat & minim risiko, Leaflet tetap bisa dengan `DivIcon` truk + rotasi + canvas route — tapi tanpa tilt 3D asli.

**Base map (dark):** style vektor gelap (graphite) — kurangi saturasi, jalan abu, air `#0E141B`, label `text-muted`. Hindari peta default OSM terang di mode dark.

**Truck markers (pion truk):**
- SVG/sprite truk top-down (atau low-poly isometric untuk kesan 3D) yang **berotasi sesuai `heading`**.
- Warna body = warna status (driving/idle/stop/offline/delayed).
- Label chip menempel: `B 9068 NU` + sub-label task `[PLI - DEPOK]` (mono, tabular).
- Driving → halo pulse `--hud`; Offline → marker meredup + ikon ⦸.
- **Motion trail** tipis di belakang truk yang sedang driving (fade gradient) → kesan kecepatan/real.
- Selected → naik elevasi (long shadow) + ring `--brand`.

**Clustering:** angka di lingkaran graphite dengan ring tipis; warna ring = status dominan cluster. Animasi spider/zoom saat di-expand.

**Route visualization (WAJIB, fitur TRAMOS):**
- **Planned route** (jalur seharusnya): garis **putus-putus**, `--text-muted` / abu, lebar 3px.
- **Actual route** (jalur sebenarnya dilalui): garis **solid** dengan gradient `--st-driving → --hud`, lebar 4px, animasi draw-on, arrowhead arah.
- Tampil bersamaan untuk perbandingan deviasi. Tandai titik deviasi/speeding di sepanjang actual route (dot merah/orange).
- Markers **[START]** (hijau) & **[END]** (checkered/brand) di origin/destination.

**Geofence:** lingkaran/poligon dengan fill alpha 8–12% sesuai tipe (Depot/Customer/Port/Checkpoint), border solid warna tipe, label nama zone.

**Layer control (glass dock kanan-atas):** toggle Show Track · Planned Route · Actual Route · Checkpoint · Geofence · Cluster · Traffic.

---

## 8. Components

**Sidebar (rombak total, ikuti struktur TRAMOS):** grup kolapsibel — MONITOR / OPERATION / EVIDENCE / ADMINISTRATION. Rail collapsible (64px) dengan tooltip. Item aktif: bar aksen `--brand` kiri + `brand-soft` bg + ikon brand. Footer: System Status (xx units online, dot live) + user.

**Header/Toolbar:** sticky, tinggi 56px, glass tipis. Kiri: judul halaman + ringkasan (`25 units · 12 driving`). Tengah: search global (⌘K). Kanan: clock live, bell notif (badge merah), avatar+role.

**Status pill/badge:** radius full, `status-bg` + `status-fg` + dot/ikon. Konsisten di tabel, marker, panel.

**Tables (cockpit grade):** header sticky uppercase 11px, sortable (ikon arah), row hover `surface-3`, zebra opsional, **double-click → view on map**, **Alt+click → copy cell**, grouping kolapsibel (`1. Waiting (21)`), density-aware, kolom resizable/customizable, footer record count.

**KPI card:** label uppercase + angka mono display + delta/spark + ikon status. Saat kritis (mis. Offline > 0) → border/aksen `--st-offline`.

**Buttons:** Primary (brand, teks putih), Secondary (surface-2 + border), Ghost (transparan), Danger (red), Toolbar (icon-only + tooltip). Tinggi 32px (compact) / 36px. Fokus ring `--brand` 2px.

**Detail panel (map):** dock kanan, section Identity / Task Info / Traveled / Estimated / Layers (persis TRAMOS §8.7). Slide+spring.

**Toast / speeding notification:** kanan-bawah, stack, ikon ⚠, judul unit + `Speeding in public area (44 Km/h)` + alamat + waktu, progress auto-dismiss, klik → fokus unit di map.

**Modal/Drawer:** elev-3, backdrop blur gelap, ESC + click-out, fokus trap.

**Empty/Loading/Error states:** skeleton shimmer (bukan spinner), empty state ber-ikon + CTA, error inline retry.

---

## 9. Iconography
- **Lucide React**, stroke 1.5–1.75, ukuran 16/18/20. Konsisten. Truk/peta/route/kamera pakai metафora yang jelas. Hindari emoji di UI produksi.

---

## 10. Accessibility
- Target **WCAG 2.1 AA**, kontras teks ≥ 4.5:1 (cek warna status di kedua tema).
- **Status jangan andalkan warna saja** → selalu + ikon/label.
- Fokus terlihat di semua interaktif. Navigasi keyboard penuh (tabel, ⌘K, modal trap).
- `prefers-reduced-motion` dihormati (lihat §6).
- Dark mode wajib; light mode setara.
- Target klik ≥ 32px; tooltip untuk icon-only.

---

## 11. Copy / Terminologi (Bahasa — ikuti TRAMOS, Indonesia)

Gunakan istilah operasional TRAMOS, jangan istilah generik:

| Konteks | Pakai | Hindari |
|---|---|---|
| Status unit | Driving · Idle · Stop/Parking · Offline · Delayed · No GPS | "Active/Inactive" |
| Task | Waiting · Progress · Unloading · Assigned · Completed | "Open/Closed" |
| Trip | Main Task · Pre Task; Origin · Destination · Distance | — |
| Unit | "Unit" / plat (mono) + group (CDDL BEKASI) | "Item" |
| Halaman | Realtime Monitor · Task Monitor · Trip History · Locate · Geofence · Report · Camera Snapshot · Dashcam Monitor · Accident Log · Control Panel | — |
| Aksi map | "Double Click to view unit on map" · "Alt + click to copy" | — |
| Event | "Speeding in public area (XX Km/h)" · "GPS delayed" · "Geofence enter/exit" | — |

Label UI Indonesia bila perlu (Ringkasan, Laporan, Performa) — konsisten dengan halaman live.

---

## 12. Definition of Done (tiap halaman)
- [ ] Dark + light konsisten, kontras AA
- [ ] Density-aware, tabular-nums untuk angka
- [ ] Status + ikon (bukan warna saja)
- [ ] Loading (skeleton), empty, error state ada
- [ ] Motion sesuai §6 + reduced-motion fallback
- [ ] Semua tombol FUNGSIONAL (tidak ada dead button)
- [ ] Keyboard + fokus + ⌘K
- [ ] Bahasa/terminologi sesuai §11
