"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/dashboard");
    } else {
      router.replace("/auth");
    }
  }, [loading, router, user]);

  return (
    <div className="ambient-grid flex min-h-screen items-center justify-center">
      <div className="text-sm text-text-secondary">Preparing your grid…</div>
    </div>
  );
}

