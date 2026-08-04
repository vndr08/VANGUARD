"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { User, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Link from "next/link";

interface UserMenuDropdownProps {
  userName: string;
  userRole: string;
  userInitials: string;
  onClose: () => void;
}

export function UserMenuDropdown({ userName, userRole, userInitials, onClose }: UserMenuDropdownProps) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  function handleLogout() {
    // Clear mock session
    localStorage.removeItem("vanguard-session");
    localStorage.removeItem("vanguard-token");
    onClose();
    router.push("/");
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
      className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-surface-1 shadow-elev-3 overflow-hidden z-50"
      role="dialog"
      aria-label="User menu"
    >
      {/* User info */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-surface-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white text-sm font-bold shrink-0">
          {userInitials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
          <p className="text-xs text-muted truncate">{userRole}</p>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface-2 transition-colors focus-visible:outline-2 focus-visible:outline-brand"
        >
          <User className="h-4 w-4 text-muted shrink-0" />
          Profil Saya
        </Link>
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-surface-2 transition-colors focus-visible:outline-2 focus-visible:outline-brand"
        >
          <Settings className="h-4 w-4 text-muted shrink-0" />
          Pengaturan
        </Link>
      </div>

      <div className="border-t border-border py-1">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-st-offline hover:bg-surface-2 transition-colors focus-visible:outline-2 focus-visible:outline-brand"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </motion.div>
  );
}
