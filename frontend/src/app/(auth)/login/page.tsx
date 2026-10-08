"use client";

import { useEffect } from "react";
import GateLogin from "@/components/v2/GateLogin";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    const loggedIn = sessionStorage.getItem("vanguard:logged-in");
    if (loggedIn === "true") {
      router.push("/dashboard");
    }
  }, [router]);

  const handleEnter = () => {
    sessionStorage.setItem("vanguard:logged-in", "true");
    sessionStorage.setItem("vanguard:user", "local-workspace");
    router.push("/dashboard");
  };

  return <GateLogin onEnter={handleEnter} />;
}
