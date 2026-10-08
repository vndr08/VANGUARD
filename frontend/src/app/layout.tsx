import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

/* ─── Metadata ─────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "VANGUARD — Fleet Control Tower",
  description: "Real-time fleet monitoring and GPS tracking platform. Control tower untuk dispatcher, supervisor, dan tim operasional.",
  keywords: ["fleet management", "GPS tracking", "fleet monitoring", "logistics", "dispatch"],
};

export const viewport: Viewport = {
  themeColor: "#FFC500",
  width: "device-width",
  initialScale: 1,
};

/* ─── Layout ───────────────────────────────────────────────────────────────── */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-theme="dark" data-density="comfortable" suppressHydrationWarning>
      <head>
        {/* Favicon - Signal yellow truck icon */}
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path d='M2 6 20 2l10 8-2 14-16 6L2 22z' fill='%23FFC500'/><path d='M9 11l7 5-2 6-7-5z' fill='%23151200'/></svg>"
        />
      </head>
      <body className="antialiased font-sans">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
