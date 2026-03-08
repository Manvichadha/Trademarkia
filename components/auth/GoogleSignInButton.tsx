"use client";

import type { MouseEventHandler } from "react";

interface GoogleSignInButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  loading?: boolean;
}

export function GoogleSignInButton({
  onClick,
  loading = false,
}: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="group relative flex h-14 w-full items-center justify-center gap-4 overflow-hidden rounded-xl border-2 border-border-subtle bg-surface-1 px-8 text-base font-semibold text-text-primary shadow-md outline-none transition-all duration-200 hover:border-primary hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="Sign in with Google"
    >
      <span className="absolute inset-0 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100">
        <span className="absolute inset-0 bg-gradient-to-r from-primary/40 via-secondary/30 to-primary/40" />
      </span>
      <span className="relative flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
          <span className="text-xl leading-none text-[#4285F4]">G</span>
        </span>
        <span className="font-medium tracking-wide">
          {loading ? "Connecting…" : "Continue with Google"}
        </span>
      </span>
    </button>
  );
}

