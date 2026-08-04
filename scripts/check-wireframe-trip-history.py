from pathlib import Path
import sys

path = Path("docs/WIREFRAME-TRIP-HISTORY.md")
text = path.read_text(encoding="utf-8")
lower = text.lower()
errors = []

required = [
    "64 + 320 + 982 = 1366",
    "64 + 942 + 360 = 1366",
    "64 + 320 + 1056 = 1440",
    "64 + 1016 + 360 = 1440",
    "64 + 320 + 1536 = 1920",
    "64 + 1496 + 360 = 1920",
    "/history?vehicle=:plateslug&event=:id",
    "step back 10 detik",
    "step forward 10 detik",
    "timeline, trip summary, telemetry",
    "event click harus",
    "manual refresh dihapus",
    "requestanimationframe",
]

for value in required:
    if value.lower() not in lower:
        errors.append(f"Konten wajib tidak ditemukan: {value}")

for forbidden in [
    "mundur 10%",
    "maju 10%",
    "420px timeline",
    "trigger demo store reload",
    "refresh simulated",
    "gps mati",
]:
    if forbidden in lower:
        errors.append(f"Konten terlarang ditemukan: {forbidden}")

if text.count("## 20. Definition of Done") != 1:
    errors.append("Definition of Done harus muncul tepat satu kali")

if errors:
    print("GAGAL:")
    for error in errors:
        print(" -", error)
    sys.exit(1)

print("OK: Trip History wireframe konsisten")
