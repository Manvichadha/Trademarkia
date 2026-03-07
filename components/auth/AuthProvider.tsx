"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // This component ensures the auth listener is mounted at the app root.
  // It intentionally does not block rendering on loading; individual pages
  // can decide how to handle intermediate states.
  useAuth();

  return <>{children}</>;
}

