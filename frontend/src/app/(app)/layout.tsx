import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AppShell from "@/components/layout/AppShell";

const LOCAL_SESSION_COOKIE = "vanguard-local-session";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasSession = cookies().get(LOCAL_SESSION_COOKIE)?.value === "1";

  if (!hasSession) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
