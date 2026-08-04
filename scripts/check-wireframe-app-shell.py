from pathlib import Path
import collections
import re
import sys

path = Path("docs/WIREFRAME-APP-SHELL.md")
text = path.read_text(encoding="utf-8")
lines = text.splitlines()
errors = []

headers = [
    line.strip()
    for line in lines
    if re.match(r"^#{2,3} ", line)
]

duplicates = [
    header
    for header, count in collections.Counter(headers).items()
    if count > 1
]

for header in duplicates:
    errors.append(f"Judul ganda: {header}")

for match in re.finditer(
    r"Total:\s*((?:\d+\s*\+\s*)+\d+)\s*=\s*(\d+)",
    text,
):
    expression = match.group(1)
    declared = int(match.group(2))
    calculated = sum(
        int(value)
        for value in re.findall(r"\d+", expression)
    )

    if calculated != declared:
        errors.append(
            f"Jumlah salah: {expression} = {declared}, hasil sebenarnya {calculated}"
        )

for forbidden in [
    "Rail + list + inspector",
    "Expanded + list + inspector",
    "Panel inspector | Semua halaman dengan inspector | 320px",
    "Lebar standar: 320px",
    "occludeed",
]:
    if forbidden.lower() in text.lower():
        errors.append(f"Konten terlarang masih ada: {forbidden}")

required = [
    "64 + 942 + 360 = 1366",
    "64 + 320 + 982 = 1366",
    "64 + 1302 = 1366",
    "**942px**",
    "**1016px**",
    "**1496px**",
    "**982px**",
    "**1056px**",
    "**1536px**",
    "**1302px**",
    "**1376px**",
    "**1856px**",
    "effective right padding 360px",
    "Displacement visual entity adalah 180px ke kiri",
    "list dan inspector saling menggantikan",
]

for value in required:
    if value.lower() not in text.lower():
        errors.append(f"Konten wajib tidak ditemukan: {value}")

if errors:
    print("GAGAL:")
    for error in errors:
        print(" -", error)
    sys.exit(1)

print("OK: invariants app-shell wireframe terpenuhi")
