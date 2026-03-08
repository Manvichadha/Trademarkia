"use client";

/**
 * PresenceAvatars
 *
 * Displays a stacked row of circular avatars for other users in the document.
 * - Max 5 shown, +N overflow chip
 * - Spring-bounce animation on join (CSS keyframes)
 * - Fade-out on leave (CSS transition)
 * - Hover tooltip: name + current cell
 */

import { useEffect, useRef, useState } from "react";
import {
  subscribeToPresence,
  type PresenceUser,
} from "@/lib/firebase/presence";

interface PresenceAvatarsProps {
  docId: string;
  currentUid: string;
}

const MAX_VISIBLE = 5;

export function PresenceAvatars({ docId, currentUid }: PresenceAvatarsProps) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [newUids, setNewUids] = useState<Set<string>>(new Set());
  const prevUidsRef = useRef<Set<string>>(new Set());
  const [tooltip, setTooltip] = useState<{ uid: string; label: string } | null>(null);

  useEffect(() => {
    const unsub = subscribeToPresence(docId, currentUid, (presence) => {
      const list = Object.values(presence);
      setUsers(list);

      // Detect newly joined users for spring animation
      const incoming = new Set(list.map((u) => u.uid));
      const fresh = new Set<string>();
      for (const uid of incoming) {
        if (!prevUidsRef.current.has(uid)) fresh.add(uid);
      }
      if (fresh.size > 0) {
        setNewUids(fresh);
        // Remove spring class after animation
        setTimeout(() => setNewUids(new Set()), 600);
      }
      prevUidsRef.current = incoming;
    });
    return unsub;
  }, [docId, currentUid]);

  if (users.length === 0) return null;

  const visible = users.slice(0, MAX_VISIBLE);
  const overflow = users.length - MAX_VISIBLE;

  return (
    <div
      className="flex items-center"
      role="group"
      aria-label="Online collaborators"
    >
      {visible.map((user, idx) => (
        <div
          key={user.uid}
          className="relative"
          style={{
            marginLeft: idx === 0 ? 0 : -8,
            zIndex: MAX_VISIBLE - idx,
          }}
          onMouseEnter={() =>
            setTooltip({
              uid: user.uid,
              label: `${user.displayName}${user.currentCell ? ` · ${user.currentCell}` : ""}`,
            })
          }
          onMouseLeave={() => setTooltip(null)}
        >
          <div
            aria-label={`${user.displayName} is online`}
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold text-white shadow-md transition-all ${
              newUids.has(user.uid) ? "animate-avatar-join" : ""
            }`}
            style={{
              backgroundColor: user.color,
              borderColor: "var(--bg-base)",
            }}
          >
            {user.displayName.slice(0, 2).toUpperCase()}
          </div>

          {/* Tooltip */}
          {tooltip?.uid === user.uid && (
            <div
              className="absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded bg-surface-3 px-2 py-1 text-xs font-medium text-text-primary shadow-lg"
              role="tooltip"
            >
              {tooltip.label}
            </div>
          )}
        </div>
      ))}

      {overflow > 0 && (
        <div
          className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-surface-3 text-xs font-semibold text-text-secondary shadow-md"
          style={{
            marginLeft: -8,
            zIndex: 0,
            borderColor: "var(--bg-base)",
          }}
          aria-label={`${overflow} more collaborators`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
