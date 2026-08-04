from pathlib import Path
import re
import sys

path = Path("docs/WIREFRAME-DASHBOARD.md")
text = path.read_text(encoding="utf-8")
errors = []

required = [
    "248 + 24 + 1070 + 24 = 1366",
    "248 + 24 + 1144 + 24 = 1440",
    "248 + 36 + 24 + 1552 + 24 + 36 = 1920",
    "64 + 24 + 656 + 24 = 768",
    "320 + 16 + 112 + 16 + 112 = 576",
    "664 - 576 = 88",
    "isOperationallyActive",
    '["loading", "unloading"]',
    "unknown count",
    "## 13. Keputusan Produk Terkunci",
    "/tracking?vehicle=:plateSlug",
    "/safety?alert=:id",
    "/tasks/:id",
    "/history?vehicle=:plateSlug&event=:id",
]

for value in required:
    if value not in text:
        errors.append(f"Konten wajib tidak ditemukan: {value}")

for forbidden in [
    "Anzahl",
    "Driving 12",
    "Idle 8",
    "Stopped 3",
    "Offline 2",
    "Active 17",
    "Late 2",
    "Done today 8",
    "On-time 87%",
    "GPS mati",
    "14:32",
    "14:18",
    "low fuel",
    "## 13. Open Product Questions",
    "### 8.4 Wireframe Tablet 768-1024",
]:
    if forbidden in text:
        errors.append(f"Konten terlarang ditemukan: {forbidden}")

parts = re.split(r"(?=### 8\.[1-4] )", text)

wireframes = [
    part
    for part in parts
    if re.match(r"### 8\.[1-4] ", part)
]

if len(wireframes) != 4:
    errors.append(
        f"Jumlah responsive wireframe seharusnya 4, ditemukan {len(wireframes)}"
    )

for wireframe in wireframes:
    title = wireframe.splitlines()[0]

    for region in [
        "Needs Attention",
        "Fleet State",
        "Operations Pulse",
    ]:
        if region not in wireframe:
            errors.append(f"{title} tidak menampilkan {region}")

if "forecastLate = activeTasks.filter" not in text:
    errors.append("Forecast Late belum dibatasi pada activeTasks")

if "normalizedPhase" not in text:
    errors.append("Dwell Risk belum memakai normalizedPhase")

if "DWELL_THRESHOLD" not in text:
    errors.append("Dwell threshold belum dinyatakan sebagai data requirement")

if "driving + idle + stopped + offline + unknown" not in text:
    errors.append("Validasi distribusi Fleet State belum lengkap")

if errors:
    print("GAGAL:")
    for error in errors:
        print(" -", error)
    sys.exit(1)

print("OK: Dashboard wireframe final terpenuhi")
