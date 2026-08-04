#!/bin/bash
python3 - << 'PY'
import glob, re, sys
pat = re.compile(r'[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]')
bad = 0
for f in sorted(glob.glob("docs/*.md")) + sorted(glob.glob("docs/prompts/*.md")):
    for i, line in enumerate(open(f, encoding="utf-8"), 1):
        if pat.search(line):
            print(f"{f}:{i}: {line.rstrip()}")
            bad = 1
print("OK: tidak ada karakter CJK di docs/" if not bad else "GAGAL: bersihkan karakter di atas.")
sys.exit(bad)
PY
