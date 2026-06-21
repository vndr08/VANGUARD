# VANGUARD — Product

## Register

product

## Users

**Dispatcher & Supervisor** yang memantau dan mengontrol armada kendaraan operasional secara realtime dari desktop control room. Bukan operator lapangan via HP — ini adalah _cockpit_ profesional di layar lebar.

**Konteks penggunaan:**
- Sesi panjang (berjam-jam) di depan monitor/desktop
- Layar lebar, multi-window
- Memantau puluhan–ratusan kendaraan sekaligus
- Kebutuhan: glanceability tinggi, density tinggi, glance-to-action dalam hitungan detik
- Informasi real-time berubah terus — motion adalah data, bukan dekorasi

## Product Purpose

VANGUARD adalah **Fleet Control Tower** — ruang kendali terpusat untuk fleet operations. Aplikasi ini berfungsi sebagai "nerve center" bagi tim operasional untuk:

1. **Monitoring realtime** — posisi, status, dan kesehatan seluruh armada
2. **Task management** — perencanaan, penugasan, dan tracking trip/pengiriman
3. **Incident response** — deteksi dan penanganan speeding, geofence violation, GPS delay
4. **Evidence & compliance** — akses kamera, snapshot, dashcam untuk audit dan investigasi
5. **Operational intelligence** — laporan, history replay, dan analytics untuk pengambilan keputusan

**Success metrics:** Dispatcher bisa menemukan status fleet dalam <1 detik. Incident teratasi sebelum eskalasi. Zero "dead menu" atau funkc yang tidak berfungsi.

## Brand Personality

**Tiga kata:** Profesional · Operasional · Presisi

- **Professional** — enterprise-grade, bukan startup MVP. Tidak ada _playful_ atau kaku.
- **Operational** — fungsi di atas segalanya. Setiap piksel harus bercerita tentang fleet operations.
- **Precise** — angka akurat, status jelas, feedback tepat. Cockpit pilot, bukan landing page.

**Touchstones:** Samsara, Motive (KeepTruckin), Flightradar24, Datadog, Linear, Vercel Dashboard, Palantir Gotham. Industrial detailing ala Teenage Engineering.

**Emotional goal:** _Confidence through clarity._ User merasa punya kendali penuh atas operasi, bukan overwhelmed oleh data.

## Anti-references

**Explicitly NOT:**
- Generic AI-generated SaaS dashboard (gradient purple-blue hero, card grid everywhere)
- Marketing landing page aesthetic
- Warm/cream backgrounds (parchment, sand, beige, ivory)
- Overly rounded corners (rounded-2xl on everything)
- Glassmorphism decorative (frosted glass cards)
- Gradient text headings
- Emoji decorative in UI
- Soft/shallow drop shadows on every card
- Flat/gray palette without hierarchy

**Anti-patterns to reject:**
- Side-stripe borders as accent
- Numbered section markers (01/02/03)
- Tiny uppercase eyebrow above every section
- Identical card grids with same-sized cards repeated
- Text overflow in containers
- "AI slop" test — if someone could say "AI made that" without doubt, it's failed

## Design Principles

1. **Glanceability over decoration** — Status harus terbaca < 1 detik. Warna + ikon + label selalu bersamaan, tidak pernah warna saja.

2. **Density is a feature** — Ini cockpit, bukan landing page. Tabel rapat, angka tabular-nums, ruang dipakai efisien.

3. **Depth = realism (4D)** — Kedalaman spasial (elevation, glass, layering) + dimensi waktu (motion real-time, transisi fisik) bikin interface terasa nyata.

4. **Motion communicates state** — Gerak menjelaskan perubahan data, bukan dekorasi. Marker interpolation, pulse live, route draw-on.

5. **Industrial precision** — Steel/graphite, hairline borders, sudut tegas-terukur. Aksen sinyal hi-vis (amber, cyan) dipakai hemat untuk hal yang penting.

6. **Zero dead UI** — Setiap tombol berfungsi. Setiap menu navigable. Feedback Toast untuk setiap aksi.

## Accessibility & Inclusion

- **Target:** WCAG 2.1 AA minimum
- **Kontras:** Teks ≥ 4.5:1, large text ≥ 3:1 — semua warna harus diverifikasi di kedua tema
- **Status tidak andalkan warna saja** — selalu ada ikon atau label pendamping
- **Fokus terlihat** — semua elemen interaktif punya focus ring yang jelas
- **Navigasi keyboard penuh** — tabel, ⌘K command palette, modal trap
- **Reduced motion dihormati** — fallback ke fade/crossfade, tidak ada motion yang gated di class-triggered transition
- **Dark + Light mode setara** — keduanya citizen, bukan second-class citizen
- **Touch target ≥ 32px** — tooltip untuk icon-only buttons
