#!/bin/bash
python3 << 'PY'
from pathlib import Path
import collections
import re
import sys

files = sorted(Path("docs").glob("*.md"))
failed = False

for path in files:
    text = path.read_text(encoding="utf-8")
    headers = [
        line.strip()
        for line in text.splitlines()
        if re.match(r"^#{2,3} ", line)
    ]

    duplicates = [
        header
        for header, count in collections.Counter(headers).items()
        if count > 1
    ]

    if duplicates:
        failed = True
        print(f"{path}: judul ganda")
        for header in duplicates:
            print("  ", header)

if failed:
    print("GAGAL: perbaiki judul ganda.")
    sys.exit(1)

print("OK: tidak ada judul ganda")
PY
