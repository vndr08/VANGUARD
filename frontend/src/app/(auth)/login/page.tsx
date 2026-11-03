"use client";

import { Suspense, useEffect } from "react";
import GateLogin from "@/components/v2/GateLogin";
import { useRouter, useSearchParams } from "next/navigation";

const LOCAL_SESSION_COOKIE = "vanguard-local-session";

function setLocalSessionCookie() {
  document.cookie = `${LOCAL_SESSION_COOKIE}=1; Path=/; SameSite=Lax`;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedDestination = searchParams.get("next");
  const destination = requestedDestination?.startsWith("/") && !requestedDestination.startsWith("//")
    ? requestedDestination
    : "/dashboard";

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("vanguard:logged-in");
    if (loggedIn === "true") {
      setLocalSessionCookie();
      router.replace(destination);
    }
  }, [destination, router]);

  const handleEnter = () => {
    sessionStorage.setItem("vanguard:logged-in", "true");
    sessionStorage.setItem("vanguard:user", "local-workspace");
    setLocalSessionCookie();
    router.push(destination);
  };

  return <GateLogin onEnter={handleEnter} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
