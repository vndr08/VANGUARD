"use client";

import { ArrowRight, Radio, ShieldCheck } from "lucide-react";

interface GateLoginProps {
  onEnter: () => void;
}

export default function GateLogin({ onEnter }: GateLoginProps) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-bg px-5 py-10 text-foreground">
      <div className="absolute inset-x-0 top-0 h-2 bg-brand" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-border-strong" aria-hidden="true" />

      <section
        className="relative w-full max-w-md border border-border-strong bg-surface-1 p-7 shadow-elev-3 sm:p-9"
        aria-labelledby="gate-title"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)",
        }}
      >
        <div className="flex items-start justify-between gap-6 border-b border-border pb-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand text-slate-950">
              <Radio className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <p className="sign text-lg font-bold tracking-[0.08em]">VANGUARD</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                Fleet Control Tower
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-st-driving">
            <span className="h-1.5 w-1.5 rounded-full bg-st-driving" />
            Siap
          </span>
        </div>

        <div className="py-8">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium text-muted">
            <ShieldCheck className="h-4 w-4 text-brand" />
            Workspace operasional
          </p>
          <h1 id="gate-title" className="sign text-3xl font-bold leading-tight text-foreground">
            Kendali armada dalam satu pandangan.
          </h1>
          <p className="mt-4 max-w-[44ch] text-sm leading-6 text-muted">
            Pantau telemetri, tugas, perjalanan, dan kondisi unit dari pusat kendali VANGUARD.
          </p>
        </div>

        <button
          type="button"
          onClick={onEnter}
          className="v2-button flex h-11 w-full items-center justify-between bg-brand px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Buka workspace
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-4 text-xs leading-5 text-faint">
          Akses saat ini bersifat lokal. Autentikasi organisasi belum diaktifkan.
        </p>
      </section>
    </main>
  );
}
