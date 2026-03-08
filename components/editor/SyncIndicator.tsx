"use client";

import { useEffect, useRef } from "react";
import type { SyncState } from "@/hooks/useSpreadsheet";
import { useToast } from "@/components/ui/Toast";

interface SyncIndicatorProps {
  state: SyncState;
  queuedCount?: number;
}

export function SyncIndicator({ state, queuedCount = 0 }: SyncIndicatorProps) {
  const { addToast } = useToast();
  const prevStateRef = useRef<SyncState>("live");

  // Show toast on sync status changes
  useEffect(() => {
    const prevState = prevStateRef.current;
    if (prevState === state) return;

    if (state === "offline" && prevState !== "offline") {
      addToast("warning", "You're offline. Changes will sync when reconnected.", 5000);
    } else if (state === "live" && prevState === "offline") {
      addToast("success", "Back online! All changes synced.", 3000);
    } else if (state === "live" && prevState === "syncing" && queuedCount === 0) {
      // Silent success - don't spam toasts for normal syncs
    }

    prevStateRef.current = state;
  }, [state, queuedCount, addToast]);

  return (
    <div
      aria-live="polite"
      aria-label={`Sync status: ${state}`}
      className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-all duration-500 ${
        state === "live"
          ? "bg-success/10 text-success"
          : state === "syncing"
          ? "bg-warning/10 text-warning"
          : "bg-danger/10 text-danger"
      }`}
    >
      {state === "live" && (
        <>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span>Live</span>
        </>
      )}
      {state === "syncing" && (
        <>
          <svg
            className="h-3 w-3 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Syncing…</span>
        </>
      )}
      {state === "offline" && (
        <>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
          <span>
            Offline
            {queuedCount > 0 && ` — ${queuedCount} change${queuedCount > 1 ? "s" : ""} queued`}
          </span>
        </>
      )}
    </div>
  );
}
