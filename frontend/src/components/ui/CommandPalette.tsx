"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Truck, Users, ClipboardList, MapPin, Settings,
  Radio, ChevronRight, Command, X, ArrowRight,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MOCK_VEHICLES } from "@/lib/mock-data";
import { StatusPill } from "@/components/ui/Badge";

type SearchResult = {
  id: string;
  type: "vehicle" | "driver" | "task" | "page";
  label: string;
  sublabel: string;
  href?: string;
  vehicleId?: number;
};

const PAGES: SearchResult[] = [
  { id: "p-dashboard", type: "page", label: "Dashboard", sublabel: "Ringkasan armada", href: "/dashboard" },
  { id: "p-tracking", type: "page", label: "Realtime Monitor", sublabel: "Pantau unit langsung", href: "/tracking" },
  { id: "p-locate", type: "page", label: "Lacak Unit", sublabel: "Cari dan pantau kendaraan", href: "/locate" },
  { id: "p-geofences", type: "page", label: "Geofence", sublabel: "Zona virtual", href: "/geofences" },
  { id: "p-tasks", type: "page", label: "Task Monitor", sublabel: "Pemantauan shipment", href: "/tasks" },
  { id: "p-vehicles", type: "page", label: "Vehicle", sublabel: "Kelola kendaraan", href: "/vehicles" },
  { id: "p-drivers", type: "page", label: "Driver", sublabel: "Kelola pengemudi", href: "/drivers" },
  { id: "p-history", type: "page", label: "Trip History", sublabel: "Riwayat perjalanan", href: "/history" },
  { id: "p-accidents", type: "page", label: "Accident Log", sublabel: "Log kejadian", href: "/accidents" },
  { id: "p-reports", type: "page", label: "Reports", sublabel: "Analitik operasional", href: "/reports" },
  { id: "p-snapshots", type: "page", label: "Camera Snapshot", sublabel: "Bukti foto", href: "/snapshots" },
  { id: "p-dashcam", type: "page", label: "Dashcam Monitor", sublabel: "Live video", href: "/dashcam" },
  { id: "p-control", type: "page", label: "Control Panel", sublabel: "Remote commands", href: "/control" },
  { id: "p-settings", type: "page", label: "Settings", sublabel: "Pengaturan", href: "/settings" },
];

function buildResults(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  // Vehicles
  if (!q || "unit".includes(q) || "kendaraan".includes(q) || "plat".includes(q)) {
    const q2 = q.replace("unit", "").replace("kendaraan", "").replace("plat", "").trim();
    MOCK_VEHICLES.slice(0, 8).forEach(v => {
      if (!q2 || v.plate_number.toLowerCase().includes(q2) || (v.driver_name ?? "").toLowerCase().includes(q2)) {
        results.push({
          id: `v-${v.id}`,
          type: "vehicle",
          label: v.plate_number,
          sublabel: v.driver_name ?? "Tanpa driver",
          href: `/locate?q=${encodeURIComponent(v.plate_number)}`,
          vehicleId: v.id,
        });
      }
    });
  }

  // Pages (if query matches)
  PAGES.forEach(p => {
    if (!q || p.label.toLowerCase().includes(q) || p.sublabel.toLowerCase().includes(q)) {
      results.push(p);
    }
  });

  return results.slice(0, 12);
}

const TYPE_ICONS: Record<SearchResult["type"], React.ElementType> = {
  vehicle: Truck,
  driver: Users,
  task: ClipboardList,
  page: MapPin,
};

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const COMMAND_PALETTE_LISTBOX_ID =
  "command-palette-results";

function getCommandOptionId(
  result: SearchResult
): string {
  return `command-palette-option-${result.id}`;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const results = buildResults(query);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const navigate = useCallback((result: SearchResult) => {
    if (result.href) {
      router.push(result.href);
    }
    onClose();
  }, [router, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        navigate(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  }, [results, selectedIndex, navigate, onClose]);

  // Group results
  const vehicleResults = results.filter(r => r.type === "vehicle");
  const pageResults = results.filter(r => r.type === "page");

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -8 }}
        transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
        className="fixed left-1/2 top-[15vh] z-[101] w-full max-w-lg -translate-x-1/2"
      >
        <div className="mx-4 rounded-xl border border-border bg-surface-1 shadow-elev-3 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="h-5 w-5 text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari unit, driver, halaman..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-faint outline-none"
              aria-label="Pencarian global"
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
              aria-haspopup="listbox"
              aria-controls={
                COMMAND_PALETTE_LISTBOX_ID
              }
              aria-activedescendant={
                results[selectedIndex]
                  ? getCommandOptionId(
                      results[selectedIndex]
                    )
                  : undefined
              }
            />
            <button
              onClick={onClose}
              className="shrink-0 rounded px-1.5 py-0.5 text-xs text-muted hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Results */}
          <div
            id={COMMAND_PALETTE_LISTBOX_ID}
            className="max-h-[360px] overflow-y-auto py-2"
            role="listbox"
            aria-label="Hasil pencarian"
          >
            {results.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted">
                Tidak ada hasil untuk &quot;{query}&quot;
              </div>
            )}

            {vehicleResults.length > 0 && (
              <div>
                <div className="px-4 py-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-faint">Unit</span>
                </div>
                {vehicleResults.map((result, i) => {
                  const globalIdx = results.indexOf(result);
                  const Icon = TYPE_ICONS[result.type];
                  const isSelected = globalIdx === selectedIndex;
                  const v = MOCK_VEHICLES.find(mv => mv.id === result.vehicleId);
                  return (
                    <button
                      key={result.id}
                      onClick={() => navigate(result)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                        isSelected ? "bg-brand-soft" : "hover:bg-surface-2"
                      }`}
                      id={getCommandOptionId(result)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-muted" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold font-mono tabular-nums ${isSelected ? "text-brand" : "text-foreground"}`}>
                          {result.label}
                        </p>
                        <p className="text-xs text-muted truncate">{result.sublabel}</p>
                      </div>
                      <div className="shrink-0">
                        {v && <StatusPill status={v.status === "stopped" ? "stop" : v.status as any} live={v.status === "driving"} className="text-xs" />}
                        {isSelected && <ArrowRight className="h-3.5 w-3.5 text-brand" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {pageResults.length > 0 && (
              <div>
                {vehicleResults.length > 0 && <div className="mx-4 my-2 border-t border-border" />}
                <div className="px-4 py-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-faint">Halaman</span>
                </div>
                {pageResults.map((result) => {
                  const globalIdx = results.indexOf(result);
                  const Icon = TYPE_ICONS[result.type];
                  const isSelected = globalIdx === selectedIndex;
                  return (
                    <button
                      key={result.id}
                      onClick={() => navigate(result)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                        isSelected ? "bg-brand-soft" : "hover:bg-surface-2"
                      }`}
                      id={getCommandOptionId(result)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-muted" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isSelected ? "text-brand" : "text-foreground"}`}>
                          {result.label}
                        </p>
                        <p className="text-xs text-muted">{result.sublabel}</p>
                      </div>
                      {isSelected ? (
                        <ArrowRight className="h-3.5 w-3.5 text-brand shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-faint shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-surface-2">
            <div className="flex items-center gap-1.5 text-[10px] text-faint">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-border">
                <span>↑↓</span>
              </span>
              <span>Navigasi</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-faint">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-border">
                <span>↵</span>
              </span>
              <span>Pilih</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-faint">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-border">
                <span>esc</span>
              </span>
              <span>Tutup</span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
