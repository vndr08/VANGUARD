from pathlib import Path
import sys

path = Path("docs/WIREFRAME-TASK-MONITOR.md")
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
    "/tasks?task=:id&view=map",
    "/tasks/:id",
    'd === "asc" ? "desc" : "asc"',
    "estimatedarrival > targetarrival",
    "dwell_threshold",
    "persistent demo action atau unavailable",
    "manual refresh dihapus",
]

for value in required:
    if value.lower() not in lower:
        errors.append(f"Konten wajib tidak ditemukan: {value}")

for forbidden in [
    "380px list",
    "list dan inspector bersamaan",
    "eta < now sebagai satu-satunya",
    "trigger demo store reload",
    "refresh simulated",
]:
    if forbidden in lower:
        errors.append(f"Konten terlarang ditemukan: {forbidden}")

if text.count("## 16. Definition of Done") != 1:
    errors.append("Definition of Done harus muncul tepat satu kali")

if errors:
    print("GAGAL:")
    for error in errors:
        print(" -", error)
    sys.exit(1)

print("OK: Task Monitor wireframe konsisten")
