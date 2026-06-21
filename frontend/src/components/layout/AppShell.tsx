"use client";

import Sidebar from "./Sidebar";
import { Bell, Search } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
      <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Sidebar />
        <div className="flex-1 pl-[260px]">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search units, drivers, tasks..."
                  className="w-[320px] rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              </button>

              <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">
                  JE
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    Jhon Erizal
                  </p>
                  <p className="text-xs text-zinc-500">Dispatcher</p>
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </div>
      </div>
  );
}
