# VANGUARD Visual Direction

**Direction:** Calm Operational Light
**Status:** Visual foundation specification
**Scope:** Color, typography, spacing, surfaces, controls, map, motion
**Bukan:** Perubahan workflow, route, layout, atau source code

---

## 1. Visual Promise

VANGUARD harus terasa seperti operational control system yang:

- tenang;
- dapat dipercaya;
- cepat dipindai;
- tidak melelahkan mata;
- dapat digunakan oleh berbagai usia;
- tidak terlihat seperti template AI;
- tidak terlihat seperti landing page SaaS;
- tidak menggunakan estetika futuristik tanpa fungsi.

Visual hierarchy harus datang dari:

1. posisi;
2. ukuran;
3. whitespace;
4. typography;
5. divider;
6. warna semantic.

Bukan dari card berlapis, gradient, glow, atau dekorasi.

---

## 2. Direction Decision

### Dipilih: Calm Operational Light

Karakter:

- light-first;
- neutral canvas;
- white operational surfaces;
- deep ink typography;
- satu brand accent;
- semantic colors terbatas;
- divider lebih dominan daripada shadow;
- radius kecil dan konsisten;
- map sebagai workspace, bukan background dekoratif.

### Tidak Dipilih

#### Operational Dark

Tidak menjadi baseline karena:

- tidak sesuai requirement grayscale/light-first;
- lebih sulit digunakan pada ruangan terang;
- semantic color lebih mudah terlalu menyala;
- berisiko terlihat seperti gaming atau command center palsu.

Dark mode dapat dibuat setelah light mode lolos accessibility dan usability.

#### Glassmorphism

Ditolak karena:

- mengurangi readability;
- membuat hierarchy bergantung pada blur;
- bertabrakan dengan map texture;
- mudah terlihat seperti AI-generated dashboard.

#### Marketing SaaS

Ditolak:

- hero banner;
- welcome card;
- gradient;
- oversized metric;
- decorative illustration;
- card grid seragam.

---

## 3. Color Foundation

### 3.1 Neutral Palette

| Token | Value | Usage |
|-------|-------|-------|
| `canvas` | `#F4F6F8` | Background aplikasi |
| `surface-1` | `#FFFFFF` | Surface utama |
| `surface-2` | `#F8FAFC` | Secondary region |
| `surface-3` | `#EEF2F6` | Hover, selected-soft |
| `border-subtle` | `#E4E7EC` | Divider ringan |
| `border-default` | `#D0D5DD` | Border controls |
| `border-strong` | `#98A2B3` | Focused structural border |
| `text-primary` | `#172033` | Informasi utama |
| `text-secondary` | `#475467` | Informasi pendukung |
| `text-muted` | `#667085` | Metadata non-kritis |
| `text-disabled` | `#98A2B3` | Disabled state |

### 3.2 Brand Accent

| Token | Value | Usage |
|-------|-------|-------|
| `brand-700` | `#1D4ED8` | Active navigation, primary action |
| `brand-600` | `#2563EB` | Interactive default |
| `brand-100` | `#DBEAFE` | Selected background |
| `brand-50` | `#EFF6FF` | Focused soft background |

Brand blue tidak digunakan untuk semua heading, icon, dan metric.

Brand hanya untuk:

- active navigation;
- primary action;
- selected row;
- keyboard focus;
- active control;
- link.

### 3.3 Semantic Palette

| State | Text/Icon | Soft Background | Usage |
|-------|-----------|-----------------|-------|
| Healthy | `#067647` | `#ECFDF3` | Fresh, completed, normal |
| Information | `#175CD3` | `#EFF8FF` | Neutral operational info |
| Warning | `#854D0E` | `#FFFBEB` | Delayed, attention |
| Critical | `#B42318` | `#FEF3F2` | Safety alert, severe exception |
| Offline | `#475467` | `#F2F4F7` | Explicit offline state |
| Unknown | `#667085` | `#F9FAFB` | Missing or unrecognized data |

Semantic status harus memiliki:

- icon atau shape;
- text label;
- warna.

Warna tidak boleh menjadi satu-satunya pembeda.

### 3.4 Forbidden Colors

Dilarang:

- neon cyan;
- purple-to-blue gradient;
- glowing red;
- rainbow status palette;
- translucent white di atas map;
- brand color pada seluruh icon;
- warna dekoratif tanpa semantic meaning.

---

## 4. Typography

### 4.1 Font Families

| Role | Family |
|------|--------|
| Interface | Inter atau system sans-serif |
| Plate/number | `ui-monospace`, SFMono-Regular, Menlo, monospace |

Jangan memuat banyak font family.

### 4.2 Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `display-sm` | 24px | 32px | 600 | Page title |
| `heading-md` | 18px | 26px | 600 | Region title besar |
| `heading-sm` | 16px | 24px | 600 | Section heading |
| `body-md` | 14px | 21px | 400 | Operational body |
| `body-strong` | 14px | 21px | 600 | Plate, important fact |
| `label-md` | 14px | 20px | 500 | Control dan status |
| `metadata-sm` | 12px | 18px | 400 | Non-critical metadata |
| `metric-lg` | 24px | 30px | 600 | Metric terbatas |

### 4.3 Typography Rules

- Informasi operasional minimum 14px.
- Plate menggunakan 14px monospace semibold.
- Timestamp yang memengaruhi keputusan menggunakan 14px.
- 12px hanya untuk suffix atau metadata non-kritis.
- Uppercase hanya untuk plate, singkatan, dan kode operasional.
- Dilarang memakai uppercase untuk seluruh navigation group.
- Dilarang memakai tracking letter berlebihan.
- Metric besar tidak boleh menjadi hero element.

---

## 5. Spacing System

Base unit: 4px.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Icon-text micro gap |
| `space-2` | 8px | Compact control |
| `space-3` | 12px | Row internal spacing |
| `space-4` | 16px | Region gap |
| `space-5` | 20px | Dense page section |
| `space-6` | 24px | Standard page padding |
| `space-8` | 32px | Major separation |
| `space-10` | 40px | Rare large separation |

Dilarang membuat spacing acak seperti 14px, 18px, 22px, atau 30px tanpa alasan.

---

## 6. Radius and Border

### 6.1 Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Badge, compact control |
| `radius-md` | 6px | Input, button, row group |
| `radius-lg` | 8px | Inspector dan modal |
| `radius-full` | 999px | Status dot atau true pill only |

Dilarang menggunakan radius 16–24px pada semua card.

### 6.2 Border

Divider adalah alat hierarchy utama.

- Region separation: 1px `border-subtle`.
- Control default: 1px `border-default`.
- Selected: 1px `brand-600`.
- Error: 1px Critical.
- Focus: 2px brand focus ring.

---

## 7. Elevation

| Level | Usage |
|-------|-------|
| Level 0 | Page dan normal region |
| Level 1 | Dropdown, sticky toolbar |
| Level 2 | Inspector, command palette |
| Level 3 | Modal only |

Rules:

- Normal content tidak memakai shadow.
- Map overlay memakai border dan Level 2.
- Tidak ada glow.
- Tidak ada inner shadow dekoratif.
- Tidak ada banyak elevation dalam satu region.

---

## 8. Surface Model

Maksimum tiga surface tone:

1. Canvas
2. Primary surface
3. Secondary surface

Dilarang:

- card di dalam card;
- glass panel;
- gradient panel;
- decorative floating card;
- setiap metric memiliki card sendiri.

Gunakan:

- divider;
- row;
- section header;
- whitespace;
- selected background.

---

## 9. Buttons

### 9.1 Variants

| Variant | Usage |
|---------|-------|
| Primary | Satu primary action per context |
| Secondary | Operational action |
| Ghost | Toolbar dan low-emphasis action |
| Destructive | Confirmed destructive action |
| Link | Navigation dalam text context |

### 9.2 Size

| Size | Height |
|------|--------|
| Compact | 32px |
| Default | 36px |
| Touch | 44px minimum |

Rules:

- Icon-only button wajib tooltip dan accessible label.
- Primary button tidak boleh muncul berulang dalam satu region.
- Dilarang memakai button generik `Explore`, `Optimize`, atau `Manage`.
- Loading button tidak boleh mengubah layout.
- Disabled button harus menjelaskan alasan jika action penting.

---

## 10. Inputs and Filters

- Height default: 36px.
- Label tetap terlihat jika meaning tidak jelas.
- Placeholder bukan pengganti label.
- Selected filter memakai border dan background, bukan warna saja.
- Clear action selalu tersedia untuk search/filter.
- Error message berada dekat field.
- Focus ring konsisten.
- Filter tidak menampilkan success toast.

---

## 11. Tables and Operational Rows

### 11.1 Table

- Header 14px medium.
- Body 14px.
- Row minimum 44px.
- Selected row memakai `brand-50` dan left indicator.
- Hover hanya feedback tambahan.
- Keyboard focus selalu terlihat.
- Sticky header hanya jika tabel scroll.

### 11.2 Operational Row

Priority order:

1. Identity
2. State
3. Exception
4. Timing
5. Context
6. Action

Jangan menampilkan seluruh entity detail dalam row.

---

## 12. Status and Badge

Badge digunakan untuk compact state, bukan dekorasi.

Badge wajib:

- text label;
- semantic color;
- icon atau shape jika status kritis;
- minimum 14px untuk operational status.

Pill hanya untuk status pendek. Paragraph atau long label tidak boleh dipaksa
menjadi pill.

---

## 13. Icons

- Style: outline.
- Stroke: konsisten 1.75–2px.
- Normal size: 16px.
- Navigation size: 18–20px.
- Tidak mencampur filled dan outline tanpa semantic reason.
- Icon-only wajib tooltip.
- Icon tidak boleh menjadi dekorasi metric.
- Gunakan icon yang familiar, bukan abstract sparkle.

Dilarang menggunakan sparkle icon untuk menandai AI atau kecanggihan.

---

## 14. Map Visual Direction

Map adalah operational workspace.

### 14.1 Basemap

- Muted light basemap.
- Road tetap terlihat.
- POI non-kritis dikurangi.
- Label tidak bersaing dengan vehicle markers.
- Tidak memakai dark basemap sebagai default.

### 14.2 Marker

Marker membedakan:

- driving;
- idle;
- stopped;
- explicit offline;
- not transmitting;
- needs attention;
- selected.

Marker menggunakan kombinasi:

- shape;
- border;
- icon;
- semantic color.

Tidak ada pulse pada seluruh marker.

Selected marker boleh menggunakan satu ring yang jelas.

Critical marker boleh menggunakan short finite animation ketika pertama muncul,
bukan infinite pulse.

### 14.3 Route

- Default route: neutral blue-gray.
- Completed route: muted.
- Remaining route: brand.
- Deviation segment: critical.
- Selected event: clear ring.
- Route width tidak berlebihan.

### 14.4 Inspector over Map

- Surface putih solid.
- Border kiri.
- Level 2 shadow.
- Tidak memakai glass blur.
- Map memakai effective padding.
- Inspector tidak menutupi selected entity.

---

## 15. Charts and Metrics

Chart hanya digunakan jika membantu keputusan.

Rules:

- satu accent plus semantic colors;
- axis dan label terbaca;
- tidak ada gradient area chart;
- tidak ada 3D;
- tidak ada donut untuk dua angka sederhana;
- tidak ada decorative sparkline;
- tooltip keyboard accessible jika memungkinkan.

Metric tidak selalu membutuhkan chart.

---

## 16. Motion

| Motion | Duration |
|--------|----------|
| Hover/focus | 120ms |
| Panel transition | 180ms |
| Modal transition | 200ms |
| Map recenter | 180–240ms |

Rules:

- easing natural, bukan bounce;
- tidak ada stagger animation pada dashboard;
- tidak ada infinite pulse massal;
- telemetry update tidak membuat seluruh page berkedip;
- reduced motion mematikan animation non-esensial;
- loading skeleton hanya initial load.

---

## 17. Empty, Loading, and Error States

### Empty

Harus menjelaskan:

- apa yang kosong;
- mengapa mungkin kosong;
- action berikutnya.

### Loading

- skeleton mengikuti struktur content;
- tidak memakai fullscreen spinner untuk update kecil;
- update berikutnya tidak memblokir interaksi.

### Error

- pesan operational;
- tidak mengekspos jargon API atau WebSocket;
- tersedia Retry, Clear, atau Back;
- toast bukan satu-satunya feedback.

---

## 18. Visual Examples by Product Area

### Dashboard

- Needs Attention dominan.
- Fleet State satu region.
- Operations Pulse satu region.
- Tidak ada KPI card grid.

### Realtime Monitor

- Map full bleed.
- List 320px.
- Inspector 360px.
- Toolbar compact dan solid.

### Task Monitor

- Task rows dense tetapi readable.
- ETA dan target memiliki hierarchy jelas.
- Late state semantic, bukan gradient.

### Trip History

- Timeline mudah dipindai.
- Replay controls familiar.
- Event selection jelas.
- Tidak terlihat seperti video editing software.

---

## 19. Anti AI Slop Rules

Dilarang:

1. gradient ungu-biru;
2. glassmorphism;
3. glow;
4. card di dalam card;
5. welcome hero;
6. oversized decorative metric;
7. sparkle icon;
8. pill untuk seluruh label;
9. uppercase microcopy berlebihan;
10. icon tanpa fungsi;
11. chart dekoratif;
12. floating widget tanpa workflow;
13. semua surface memiliki shadow;
14. semua item memiliki border-radius besar;
15. animasi masuk pada seluruh page.

---

## 20. Implementation Token Mapping

Saat implementation dimulai, token harus menjadi single source of truth:

```

color

typography

spacing

radius

border

elevation

motion

z-index

layout width

```

Dilarang menulis hex dan pixel acak pada setiap component.

Existing Tailwind config dan globals.css harus diaudit sebelum mengganti token.
Jangan menambah token baru jika token dengan fungsi sama sudah ada.

---

## 21. Visual QA Checklist

- [x] Light mode menjadi baseline
- [x] Tidak ada gradient dekoratif
- [x] Tidak ada glass blur
- [x] Operational text minimum 14px
- [x] Plate memakai monospace 14px
- [x] Status tidak bergantung pada warna
- [x] Radius maksimum normal 8px
- [x] Primary action terbatas
- [x] Map marker dapat dibedakan
- [x] Inspector solid dan readable
- [x] Focus ring terlihat
- [x] Reduced motion tersedia
- [x] Empty/loading/error state konsisten
- [x] Tidak ada card dalam card
- [x] Tidak ada sparkle icon
- [x] Tidak ada source code yang berubah
