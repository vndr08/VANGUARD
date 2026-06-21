import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFB" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0E11" },
  ],
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        {/* Favicon */}
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230E1217'/><path d='M8 22V10l8-4 8 4v12l-8 4-8-4z' fill='none' stroke='%233B82F6' stroke-width='2'/><circle cx='16' cy='16' r='3' fill='%2322D3EE'/></svg>"
        />
      </head>
      <body className="bg-background text-foreground antialiased font-sans">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
