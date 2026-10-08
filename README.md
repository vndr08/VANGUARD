# VANGUARD Fleet Control

VANGUARD adalah antarmuka kontrol armada berbasis Next.js dengan API FastAPI. UI memakai dataset operasional deterministik sebagai fallback dan akan menggabungkan data kendaraan dari API ketika backend tersedia.

## Menjalankan proyek

Gunakan dua terminal dari root repository.

```bash
# Terminal 1: API
./venv/bin/python -m uvicorn backend.main:app --reload --port 8000
```

```bash
# Terminal 2: frontend
cd frontend
npm run dev -- --port 3000
```

Buka `http://localhost:3000`. Jalankan hanya satu proses `next dev` untuk folder ini karena beberapa proses yang berbagi `frontend/.next` dapat menyebabkan missing chunk dan asset 404.

## Validasi

```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

```bash
./venv/bin/python -m compileall -q backend
```

Database SQLite default selalu mengarah ke `vanguard.db` di root repository, terlepas dari direktori saat API dijalankan.

## Batas kemampuan saat ini

- Akses lokal belum memakai identity provider organisasi.
- Control Panel bersifat read-only sampai transport command dan acknowledgment audit tersedia.
- Reports dan Camera Snapshot menampilkan katalog/metadata; generate, capture, dan download belum diaktifkan.
- Vehicles, Drivers, Geofence, dan Accident Log berjalan dalam mode baca sampai endpoint mutasinya tersedia; ekspor CSV pada halaman data menghasilkan file nyata.
- Settings hanya menampilkan preferensi lokal yang benar-benar diterapkan dan disimpan oleh browser.

`index.html` di root adalah referensi visual lokal V2 dan tidak menjadi runtime aplikasi.
