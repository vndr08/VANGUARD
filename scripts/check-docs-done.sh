#!/bin/bash
echo "Checklist proses dokumen yang belum tercentang:"
grep -n "^- \[ \]" docs/UX-AUDIT.md docs/INFORMATION-ARCHITECTURE.md 2>/dev/null || echo "  tidak ada"
echo
echo "Kriteria kesiapan produk yang masih terbuka, ini normal sampai implementasi selesai:"
grep -c "^- \[ \]" docs/PRODUCT-DEMO-BRIEF.md
