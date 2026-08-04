from pathlib import Path
import sys

path = Path("docs/WIREFRAME-REALTIME-MONITOR.md")
text = path.read_text(encoding="utf-8")
lower = text.lower()
errors = []

for forbidden in [
    "speeding detection inline",
    "speeding inline detection",
    "inline loop per render",
    "hapus inline speeding",
    "import usespeedingmonitor",
    "stale/offline condition",
    "vehicle row double-click |",
    "| none | toast |",
    "trigger demo store reload",
    "driver name | 12px",
    "leaflet + maplibre",
    "4 toast-only",
    "/tracking?vehicle=b6600wxy",
]:
    if forbidden in lower:
        errors.append(f"Konten terlarang ditemukan: {forbidden}")

for required in [
    "current runtime engine",
    "maplibre gl",
    "technical leftovers",
    "usespeedingmonitor.ts sudah tersedia sebagai hook terpisah",
    "monitor dijalankan tepat satu kali",
    "explicit demo simulation",
    "detailpanel menerima selected alert",
    "detailpanel tidak mengimpor atau menjalankan",
    "not-transmitting condition",
    "explicit offline state",
    "driver name atau unassigned | 14px",
    "duplicate monitor subscription",
    "demo reset tetap berada pada workspace chip",
    "dua kemunculan toast/settimeout",
]:
    if required not in lower:
        errors.append(f"Konten wajib tidak ditemukan: {required}")

for equation in [
    "64 + 320 + 982 = 1366",
    "64 + 942 + 360 = 1366",
    "64 + 1302 = 1366",
    "64 + 320 + 1056 = 1440",
    "64 + 1016 + 360 = 1440",
    "64 + 1376 = 1440",
    "64 + 320 + 1536 = 1920",
    "64 + 1496 + 360 = 1920",
    "64 + 1856 = 1920",
]:
    if equation not in text:
        errors.append(f"Persamaan tidak ditemukan: {equation}")

if text.count("## 21. Definition of Done") != 1:
    errors.append("Definition of Done harus muncul tepat satu kali")

if errors:
    print("GAGAL:")
    for error in errors:
        print(" -", error)
    sys.exit(1)

print("OK: Realtime Monitor konsisten")
