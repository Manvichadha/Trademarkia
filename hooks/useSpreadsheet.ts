"use client";

/**
 * useSpreadsheet — the central hook for sheet data.
 *
 * Responsibilities:
 *  1. Load initial sheet data from Firestore on mount (onSnapshot)
 *  2. Apply optimistic updates immediately to local Zustand store
 *  3. Debounce (400ms) Firestore writes, batching pending cells
 *  4. LWW conflict resolution: incoming remote cell wins only if its
 *     updatedAt is newer than the local pending version
 *  5. Track sync state: "live" | "syncing" | "offline"
 *  6. Queue writes when offline, flush on reconnect
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";
import { evaluateSheet } from "@/lib/spreadsheet/evaluator";
import { setCell } from "@/lib/spreadsheet/engine";
import { subscribeToSheet, flushCellWrites } from "@/lib/firebase/cells";
import type { SheetData, CellData, CellFormatting } from "@/lib/spreadsheet/types";

export type SyncState = "live" | "syncing" | "offline";

const DEBOUNCE_MS = 400;

interface UseSpreadsheetOptions {
  docId: string;
  updatedBy: string;
}

export function useSpreadsheet(updatedByOrOptions: string | UseSpreadsheetOptions) {
  // Support both calling conventions:
  //   useSpreadsheet(uid)               — local-only (no Firestore sync)
  //   useSpreadsheet({ docId, updatedBy })  — full sync
  const isSync = typeof updatedByOrOptions !== "string";
  const updatedBy = isSync ? updatedByOrOptions.updatedBy : updatedByOrOptions;
  const docId = isSync ? updatedByOrOptions.docId : null;

  const { sheet, setCellValue, setSheet, frozenRows, frozenCols, setFrozenRows, setFrozenCols } = useSpreadsheetStore();

  const [syncState, setSyncState] = useState<SyncState>("live");
  const pendingWritesRef = useRef<Map<string, CellData>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOnlineRef = useRef(true);
  const offlineQueueRef = useRef<Map<string, CellData>>(new Map());
  const isSyncingRef = useRef(false);

  // --- Flush pending writes to Firestore ---
  const flush = useCallback(async () => {
    if (!docId || pendingWritesRef.current.size === 0) return;
    if (!isOnlineRef.current) {
      // Move pending to offline queue
      for (const [id, data] of pendingWritesRef.current) {
        offlineQueueRef.current.set(id, data);
      }
      pendingWritesRef.current.clear();
      return;
    }

    isSyncingRef.current = true;
    setSyncState("syncing");
    const toWrite = new Map(pendingWritesRef.current);
    pendingWritesRef.current.clear();

    try {
      await flushCellWrites(docId, toWrite);
      if (pendingWritesRef.current.size === 0 && offlineQueueRef.current.size === 0) {
        setSyncState("live");
      }
    } catch (err) {
      console.error("[useSpreadsheet] flush error:", err);
      // Put failed writes back into pending
      for (const [id, data] of toWrite) {
        pendingWritesRef.current.set(id, data);
      }
    } finally {
      isSyncingRef.current = false;
    }
  }, [docId]);

  // --- Schedule debounced flush ---
  const scheduleFlush = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(flush, DEBOUNCE_MS);
  }, [flush]);

  // --- Update a single cell (optimistic) ---
  const updateCell = useCallback(
    (cellId: string, raw: string, formatting?: Partial<CellFormatting>) => {
      // Optimistic: update Zustand immediately
      setCellValue(cellId, raw, updatedBy, formatting);

      if (docId) {
        // Stage for Firestore write
        const current = useSpreadsheetStore.getState().sheet[cellId];
        if (current) {
          pendingWritesRef.current.set(cellId, current);
        }
        scheduleFlush();
      }
    },
    [updatedBy, setCellValue, docId, scheduleFlush]
  );

  // --- Load sheet: Firestore onSnapshot ---
  useEffect(() => {
    if (!docId) return;

    const unsub = subscribeToSheet(
      docId,
      (remoteSheet: SheetData) => {
        // LWW merge: for each remote cell, only accept if its updatedAt
        // is newer than our local pending version.
        const localSheet = useSpreadsheetStore.getState().sheet;
        const merged: SheetData = { ...localSheet };

        for (const [cellId, remoteCell] of Object.entries(remoteSheet)) {
          const localCell = localSheet[cellId];
          const pendingLocal = pendingWritesRef.current.has(cellId);

          if (pendingLocal) {
            // We have an unsaved local edit — keep it
            continue;
          }

          if (!localCell || remoteCell.updatedAt >= (localCell.updatedAt ?? 0)) {
            merged[cellId] = remoteCell;
          }
        }

        setSheet(evaluateSheet(merged));
        if (pendingWritesRef.current.size === 0) {
          setSyncState("live");
        }
      },
      (err) => {
        console.error("[useSpreadsheet] snapshot error:", err);
        setSyncState("offline");
      }
    );

    return () => {
      unsub();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [docId, setSheet]);

  // --- Online/offline detection ---
  useEffect(() => {
    const handleOnline = async () => {
      isOnlineRef.current = true;
      setSyncState(pendingWritesRef.current.size > 0 ? "syncing" : "live");

      // Flush offline queue
      if (offlineQueueRef.current.size > 0 && docId) {
        isSyncingRef.current = true;
        setSyncState("syncing");
        try {
          await flushCellWrites(docId, offlineQueueRef.current);
          offlineQueueRef.current.clear();
          setSyncState("live");
        } catch (err) {
          console.error("[useSpreadsheet] offline flush error:", err);
        } finally {
          isSyncingRef.current = false;
        }
      }
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
      setSyncState("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initialize
    isOnlineRef.current = navigator.onLine;
    if (!navigator.onLine) setSyncState("offline");

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [docId]);

  // --- Public API ---
  const loadSheet = useCallback(
    (data: SheetData) => setSheet(data),
    [setSheet]
  );

  const offlineQueueCount = offlineQueueRef.current.size + pendingWritesRef.current.size;

  return {
    sheet,
    updateCell,
    loadSheet,
    syncState,
    offlineQueueCount,
    // Legacy: used by hooks that don't do Firestore sync
    setCellValue: (id: string, raw: string, by: string, fmt?: Partial<CellFormatting>) =>
      setCellValue(id, raw, by, fmt),
  };
}
