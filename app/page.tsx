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
    <div className="flex min-h-screen items-center justify-center bg-bg-base">
      <div className="text-lg font-medium text-text-secondary">Preparing your grid…</div>
    </div>
  );
}

