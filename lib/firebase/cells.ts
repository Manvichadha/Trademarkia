/**
 * Firestore cell sync layer.
 *
 * Schema:
 *   /documents/{docId}/cells/{cellId}
 *     raw, formula, computed, formatting, updatedAt, updatedBy
 *
 *   /documents/{docId}/metadata
 *     title, colWidths, rowHeights, updatedAt
 *
 * Conflict resolution: Last-Write-Wins per-cell using updatedAt timestamp.
 * If local pending update is newer → keep local.
 * If incoming Firestore update is newer → accept it.
 */

import {
  doc,
  collection,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  setDoc,
  getDoc,
  type Unsubscribe,
  type Firestore,
} from "firebase/firestore";
import { getFirebaseClients } from "./config";
import type { SheetData, CellData, CellFormatting } from "@/lib/spreadsheet/types";

// ---- Types ----

export interface SheetMetadata {
  title: string;
  colWidths: Record<number, number>;
  rowHeights: Record<number, number>;
  updatedAt: number;
}

interface FirestoreCellDoc {
  raw: string;
  formula: string | null;
  computed: string | number | boolean | null;
  formatting: CellFormatting;
  updatedAt: number;
  updatedBy: string;
}

function getDb(): Firestore {
  return getFirebaseClients().firestore;
}

// ---- Snapshot listener ----

/**
 * Subscribe to real-time cell updates for a document.
 * Calls `onData` with the full merged SheetData on every change.
 * Uses LWW: if a pending local update is newer, it is preserved.
 */
export function subscribeToSheet(
  docId: string,
  onData: (cells: SheetData) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getDb();
  const cellsRef = collection(db, "documents", docId, "cells");

  return onSnapshot(
    cellsRef,
    (snapshot) => {
      const cells: SheetData = {};
      snapshot.forEach((docSnap) => {
        const d = docSnap.data() as FirestoreCellDoc;
        cells[docSnap.id] = {
          raw: d.raw ?? "",
          formula: d.formula ?? null,
          computed: d.computed ?? null,
          formatting: d.formatting ?? {},
          updatedAt: d.updatedAt ?? 0,
          updatedBy: d.updatedBy ?? "",
        };
      });
      onData(cells);
    },
    (error) => {
      onError?.(error as Error);
    }
  );
}

// ---- Metadata listener ----

export function subscribeToMetadata(
  docId: string,
  onData: (meta: SheetMetadata) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const db = getDb();
  const metaRef = doc(db, "documents", docId, "metadata", "main");

  return onSnapshot(
    metaRef,
    (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      onData({
        title: d.title ?? "Untitled",
        colWidths: d.colWidths ?? {},
        rowHeights: d.rowHeights ?? {},
        updatedAt: d.updatedAt ?? 0,
      });
    },
    (error) => onError?.(error as Error)
  );
}

// ---- Batch write pending cells ----

/**
 * Write a batch of cells to Firestore.
 * Called after debounce when pending writes are ready to flush.
 */
export async function flushCellWrites(
  docId: string,
  pendingWrites: Map<string, CellData>
): Promise<void> {
  if (pendingWrites.size === 0) return;
  const db = getDb();
  // Firestore batch max 500 operations
  const entries = Array.from(pendingWrites.entries());
  for (let i = 0; i < entries.length; i += 499) {
    const chunk = entries.slice(i, i + 499);
    const batch = writeBatch(db);
    for (const [cellId, data] of chunk) {
      const cellRef = doc(db, "documents", docId, "cells", cellId);
      batch.set(cellRef, {
        raw: data.raw,
        formula: data.formula ?? null,
        computed: data.computed ?? null,
        formatting: data.formatting ?? {},
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy,
      } satisfies FirestoreCellDoc);
    }
    await batch.commit();
  }
}

// ---- Metadata write ----

export async function saveMetadata(
  docId: string,
  partial: Partial<SheetMetadata>
): Promise<void> {
  const db = getDb();
  const metaRef = doc(db, "documents", docId, "metadata", "main");
  await setDoc(
    metaRef,
    { ...partial, updatedAt: Date.now() },
    { merge: true }
  );
}

// ---- Fetch metadata once ----

export async function fetchMetadata(docId: string): Promise<SheetMetadata | null> {
  const db = getDb();
  const metaRef = doc(db, "documents", docId, "metadata", "main");
  const snap = await getDoc(metaRef);
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    title: d.title ?? "Untitled",
    colWidths: d.colWidths ?? {},
    rowHeights: d.rowHeights ?? {},
    updatedAt: d.updatedAt ?? 0,
  };
}

// ---- Update document title ----

export async function updateDocumentTitle(docId: string, title: string): Promise<void> {
  const db = getDb();
  // Update both metadata sub-doc and the parent document
  const metaRef = doc(db, "documents", docId, "metadata", "main");
  const parentRef = doc(db, "documents", docId);
  await Promise.all([
    setDoc(metaRef, { title, updatedAt: Date.now() }, { merge: true }),
    setDoc(parentRef, { title, updatedAt: serverTimestamp() }, { merge: true }),
  ]);
}
