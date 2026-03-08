"use client";

/**
 * PresenceLayer
 *
 * Renders absolutely-positioned colored selection borders for other users,
 * with name chip labels attached to the top-left of each selection.
 * Also renders cursor comet trails (3 fading ghost dots) using a
 * position history ring buffer.
 *
 * GPU-accelerated movement via CSS transform: translate().
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  subscribeToPresence,
  joinPresence,
  updatePresenceCell,
  type PresenceMap,
  type PresenceUser,
} from "@/lib/firebase/presence";
import { useSelectionStore } from "@/store/selectionStore";
import { toCellId } from "@/lib/spreadsheet/cellAddress";

const HEADER_WIDTH = 48;
const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;
const TRAIL_LENGTH = 3;

interface PresenceLayerProps {
  docId: string;
  uid: string;
  displayName: string;
  getColumnWidth: (col: number) => number;
  getRowHeight: (row: number) => number;
  gridScrollRef: React.RefObject<HTMLDivElement | null>;
}

interface TrailDot {
  x: number;
  y: number;
  opacity: number;
}

interface UserState extends PresenceUser {
  trail: TrailDot[];
}

export function PresenceLayer({
  docId,
  uid,
  displayName,
  getColumnWidth,
  getRowHeight,
  gridScrollRef,
}: PresenceLayerProps) {
  const { activeCell } = useSelectionStore();
  const [otherUsers, setOtherUsers] = useState<PresenceMap>({});
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userStatesRef = useRef<Record<string, UserState>>({});
  const [, forceRender] = useState(0);

  // Join presence on mount
  useEffect(() => {
    const leave = joinPresence(docId, uid, displayName);
    const unsub = subscribeToPresence(docId, uid, (presence) => {
      setOtherUsers(presence);
      // Update trail for each user whose cell changed
      for (const [userId, user] of Object.entries(presence)) {
        const prev = userStatesRef.current[userId];
        const pos = getCellPosition(
          user.currentCell,
          getColumnWidth,
          getRowHeight
        );
        if (pos) {
          const prevTrail = prev?.trail ?? [];
          const newTrail: TrailDot[] = [
            ...(prev?.trail.slice(0, TRAIL_LENGTH - 1).map((d, i) => ({
              ...d,
              opacity: Math.max(0, d.opacity - 0.25),
            })) ?? []),
          ];
          if (prev) {
            const prevPos = getCellPosition(prev.currentCell, getColumnWidth, getRowHeight);
            if (prevPos) {
              newTrail.unshift({ x: prevPos.x, y: prevPos.y, opacity: 0.5 });
            }
          }
          userStatesRef.current[userId] = {
            ...user,
            trail: newTrail.slice(0, TRAIL_LENGTH),
          };
        } else {
          userStatesRef.current[userId] = { ...(prev ?? user), ...user, trail: prev?.trail ?? [] };
        }
      }
      forceRender((n) => n + 1);
    });

    return () => {
      leave();
      unsub();
    };
  }, [docId, uid, displayName, getColumnWidth, getRowHeight]);

  // Update presence cell on active cell change (throttled 100ms)
  useEffect(() => {
    if (throttleRef.current) clearTimeout(throttleRef.current);
    throttleRef.current = setTimeout(() => {
      const cellId = activeCell ? toCellId(activeCell) : null;
      updatePresenceCell(docId, uid, cellId);
    }, 100);
    return () => {
      if (throttleRef.current) clearTimeout(throttleRef.current);
    };
  }, [activeCell, docId, uid]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {Object.values(otherUsers).map((user) => {
        const pos = getCellPosition(user.currentCell, getColumnWidth, getRowHeight);
        const userState = userStatesRef.current[user.uid];
        if (!pos) return null;

        return (
          <div key={user.uid}>
            {/* Cursor trail dots */}
            {(userState?.trail ?? []).map((dot, i) => (
              <div
                key={i}
                className="absolute rounded-full transition-all"
                style={{
                  width: 8 - i * 2,
                  height: 8 - i * 2,
                  backgroundColor: user.color,
                  opacity: dot.opacity,
                  transform: `translate(${dot.x + pos.width / 2 - 4 + i * 2}px, ${dot.y + pos.height / 2 - 4 + i * 2}px)`,
                  transition: "transform 200ms ease-out, opacity 400ms ease",
                  top: 0,
                  left: 0,
                  zIndex: 40,
                }}
              />
            ))}

            {/* Selection border */}
            <div
              className="absolute transition-all duration-200"
              style={{
                left: pos.x,
                top: pos.y,
                width: pos.width,
                height: pos.height,
                border: `2px solid ${user.color}`,
                borderRadius: 2,
                boxShadow: `0 0 0 1px ${user.color}33, 0 0 8px ${user.color}44`,
                zIndex: 30,
              }}
            >
              {/* Name chip */}
              <div
                className="absolute -top-5 left-0 flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold text-white shadow-md"
                style={{
                  backgroundColor: user.color,
                  whiteSpace: "nowrap",
                  fontSize: "10px",
                  lineHeight: "14px",
                }}
              >
                {user.displayName}
                {user.currentCell && (
                  <span className="opacity-75"> · {user.currentCell}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Helpers ----

interface CellPos {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getCellPosition(
  cellId: string | null,
  getColumnWidth: (col: number) => number,
  getRowHeight: (row: number) => number
): CellPos | null {
  if (!cellId) return null;

  // Parse cellId like "A1" → { col: 0, row: 0 }
  const match = /^([A-Z]+)(\d+)$/.exec(cellId);
  if (!match) return null;
  const colStr = match[1]!;
  const rowIdx = parseInt(match[2]!, 10) - 1;
  let colIdx = 0;
  for (let i = 0; i < colStr.length; i++) {
    colIdx = colIdx * 26 + (colStr.charCodeAt(i) - 64);
  }
  colIdx -= 1;

  let x = HEADER_WIDTH;
  for (let c = 0; c < colIdx; c++) x += getColumnWidth(c);
  let y = DEFAULT_ROW_HEIGHT; // header
  for (let r = 0; r < rowIdx; r++) y += getRowHeight(r);

  return {
    x,
    y,
    width: getColumnWidth(colIdx),
    height: getRowHeight(rowIdx),
  };
}
