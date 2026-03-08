"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSelectionStore } from "@/store/selectionStore";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";
import { evaluateSheet } from "@/lib/spreadsheet/evaluator";
import { toCellId, parseCellId } from "@/lib/spreadsheet/cellAddress";
import type { SheetData } from "@/lib/spreadsheet/types";
import type { CellCoord } from "@/lib/spreadsheet/cellAddress";

const ROWS = 100;
const COLS = 26;
const MAX_HISTORY = 50;

interface HistoryEntry {
  sheet: SheetData;
  activeCell: CellCoord | null;
}

interface UseKeyboardNavOptions {
  updatedBy: string;
  onEditStart?: (cellId: string) => void;
  onEditEnd?: () => void;
}

export function useKeyboardNav({
  updatedBy,
  onEditStart,
  onEditEnd,
}: UseKeyboardNavOptions) {
  const { activeCell, selectionRange, setActiveCell, setSelectionRange } =
    useSelectionStore();
  const { sheet, setSheet } = useSpreadsheetStore();

  // --- History (undo/redo) ---
  const historyRef = useRef<HistoryEntry[]>([]);
  const historyIndexRef = useRef(-1);

  const saveToHistory = useCallback(() => {
    const currentSheet = useSpreadsheetStore.getState().sheet;
    const currentActive = useSelectionStore.getState().activeCell;

    // Truncate any redo future
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push({
      sheet: { ...currentSheet },
      activeCell: currentActive ? { ...currentActive } : null,
    });
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    }
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const prev = historyRef.current[historyIndexRef.current];
    if (!prev) return;
    setSheet(prev.sheet);
    if (prev.activeCell) setActiveCell(prev.activeCell);
  }, [setSheet, setActiveCell]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const next = historyRef.current[historyIndexRef.current];
    if (!next) return;
    setSheet(next.sheet);
    if (next.activeCell) setActiveCell(next.activeCell);
  }, [setSheet, setActiveCell]);

  // --- Navigation ---
  const moveSelection = useCallback(
    (deltaRow: number, deltaCol: number, extend = false) => {
      const current = useSelectionStore.getState().activeCell;
      if (!current) {
        setActiveCell({ row: 0, col: 0 });
        return;
      }
      const newRow = Math.max(0, Math.min(ROWS - 1, current.row + deltaRow));
      const newCol = Math.max(0, Math.min(COLS - 1, current.col + deltaCol));
      if (extend) {
        const range = useSelectionStore.getState().selectionRange;
        setSelectionRange(range?.start ?? current, { row: newRow, col: newCol });
      } else {
        setActiveCell({ row: newRow, col: newCol });
      }
    },
    [setActiveCell, setSelectionRange]
  );

  // --- Copy/Paste ---
  const copy = useCallback(async () => {
    const ac = useSelectionStore.getState().activeCell;
    const sr = useSelectionStore.getState().selectionRange;
    const s = useSpreadsheetStore.getState().sheet;
    if (!ac) return;

    let text: string;
    if (sr) {
      const minRow = Math.min(sr.start.row, sr.end.row);
      const maxRow = Math.max(sr.start.row, sr.end.row);
      const minCol = Math.min(sr.start.col, sr.end.col);
      const maxCol = Math.max(sr.start.col, sr.end.col);
      const lines: string[] = [];
      for (let r = minRow; r <= maxRow; r++) {
        const cols: string[] = [];
        for (let c = minCol; c <= maxCol; c++) {
          const cell = s[toCellId({ row: r, col: c })];
          cols.push(String(cell?.computed ?? cell?.raw ?? ""));
        }
        lines.push(cols.join("\t"));
      }
      text = lines.join("\n");
    } else {
      const cell = s[toCellId(ac)];
      text = String(cell?.computed ?? cell?.raw ?? "");
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard not available
    }
  }, []);

  const paste = useCallback(async () => {
    const ac = useSelectionStore.getState().activeCell;
    if (!ac) return;
    saveToHistory();
    try {
      const text = await navigator.clipboard.readText();
      const rows = text.split("\n").map((r) => r.split("\t"));
      let s = { ...useSpreadsheetStore.getState().sheet };
      for (let r = 0; r < rows.length; r++) {
        const rowData = rows[r];
        if (!rowData) continue;
        for (let c = 0; c < rowData.length; c++) {
          const v = rowData[c] ?? "";
          const cellId = toCellId({ row: ac.row + r, col: ac.col + c });
          const formula = v.trim().startsWith("=") ? v.trim() : null;
          s = {
            ...s,
            [cellId]: {
              raw: v,
              computed: formula ? null : (isNaN(Number(v)) ? v || null : Number(v)) ,
              formula,
              formatting: s[cellId]?.formatting ?? {},
              updatedAt: Date.now(),
              updatedBy,
            },
          };
        }
      }
      setSheet(evaluateSheet(s));
    } catch {
      // clipboard not available
    }
  }, [saveToHistory, setSheet, updatedBy]);

  // --- Clear ---
  const clearCell = useCallback(() => {
    const ac = useSelectionStore.getState().activeCell;
    const sr = useSelectionStore.getState().selectionRange;
    if (!ac) return;
    saveToHistory();
    let s = { ...useSpreadsheetStore.getState().sheet };

    const cells: CellCoord[] = sr
      ? (() => {
          const list: CellCoord[] = [];
          const minRow = Math.min(sr.start.row, sr.end.row);
          const maxRow = Math.max(sr.start.row, sr.end.row);
          const minCol = Math.min(sr.start.col, sr.end.col);
          const maxCol = Math.max(sr.start.col, sr.end.col);
          for (let r = minRow; r <= maxRow; r++)
            for (let c = minCol; c <= maxCol; c++)
              list.push({ row: r, col: c });
          return list;
        })()
      : [ac];

    for (const coord of cells) {
      const id = toCellId(coord);
      const existing = s[id];
      if (existing) {
        s = { ...s, [id]: { ...existing, raw: "", computed: null, formula: null, updatedAt: Date.now(), updatedBy } };
      }
    }
    setSheet(evaluateSheet(s));
  }, [saveToHistory, setSheet, updatedBy]);

  // --- Format toggles ---
  const toggleBold = useCallback(() => {
    const ac = useSelectionStore.getState().activeCell;
    if (!ac) return;
    const id = toCellId(ac);
    const s = useSpreadsheetStore.getState().sheet;
    const cell = s[id];
    const next = {
      ...s,
      [id]: {
        raw: cell?.raw ?? "",
        computed: cell?.computed ?? null,
        formula: cell?.formula ?? null,
        formatting: { ...cell?.formatting, bold: !cell?.formatting?.bold },
        updatedAt: Date.now(),
        updatedBy,
      },
    };
    setSheet(evaluateSheet(next));
  }, [setSheet, updatedBy]);

  const toggleItalic = useCallback(() => {
    const ac = useSelectionStore.getState().activeCell;
    if (!ac) return;
    const id = toCellId(ac);
    const s = useSpreadsheetStore.getState().sheet;
    const cell = s[id];
    const next = {
      ...s,
      [id]: {
        raw: cell?.raw ?? "",
        computed: cell?.computed ?? null,
        formula: cell?.formula ?? null,
        formatting: { ...cell?.formatting, italic: !cell?.formatting?.italic },
        updatedAt: Date.now(),
        updatedBy,
      },
    };
    setSheet(evaluateSheet(next));
  }, [setSheet, updatedBy]);

  // --- Jump ---
  const jumpToCell = useCallback(
    (cellId: string) => {
      try {
        setActiveCell(parseCellId(cellId));
      } catch {
        // invalid
      }
    },
    [setActiveCell]
  );

  // --- Keyboard handler ---
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      if (isCtrl) {
        switch (e.key.toLowerCase()) {
          case "z":
            e.preventDefault();
            isShift ? redo() : undo();
            return;
          case "y":
            e.preventDefault();
            redo();
            return;
          case "b":
            e.preventDefault();
            toggleBold();
            return;
          case "i":
            e.preventDefault();
            toggleItalic();
            return;
          case "c":
            if (!inInput) { e.preventDefault(); copy(); }
            return;
          case "v":
            if (!inInput) { e.preventDefault(); paste(); }
            return;
          case "x":
            if (!inInput) { e.preventDefault(); copy().then(clearCell); }
            return;
          case "home":
            e.preventDefault();
            setActiveCell({ row: 0, col: 0 });
            return;
          case "end": {
            e.preventDefault();
            const s = useSpreadsheetStore.getState().sheet;
            let maxRow = 0, maxCol = 0;
            for (const id of Object.keys(s)) {
              try {
                const coord = parseCellId(id);
                maxRow = Math.max(maxRow, coord.row);
                maxCol = Math.max(maxCol, coord.col);
              } catch { /* skip */ }
            }
            setActiveCell({ row: maxRow, col: maxCol });
            return;
          }
          case "f":
            // Ctrl+F handled by search overlay via custom event
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("sheet:open-search"));
            return;
        }
      }

      if (inInput) return;

      const ac = useSelectionStore.getState().activeCell;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          moveSelection(-1, 0, isShift);
          break;
        case "ArrowDown":
          e.preventDefault();
          moveSelection(1, 0, isShift);
          break;
        case "ArrowLeft":
          e.preventDefault();
          moveSelection(0, -1, isShift);
          break;
        case "ArrowRight":
          e.preventDefault();
          moveSelection(0, 1, isShift);
          break;
        case "Tab":
          e.preventDefault();
          if (isShift) {
            moveSelection(0, -1);
          } else if (ac && ac.col === COLS - 1) {
            setActiveCell({ row: Math.min(ROWS - 1, ac.row + 1), col: 0 });
          } else {
            moveSelection(0, 1);
          }
          break;
        case "Enter":
          e.preventDefault();
          if (ac) onEditStart?.(toCellId(ac));
          break;
        case "Escape":
          e.preventDefault();
          onEditEnd?.();
          break;
        case "Delete":
        case "Backspace":
          e.preventDefault();
          clearCell();
          break;
        case "F2":
          e.preventDefault();
          if (ac) onEditStart?.(toCellId(ac));
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    moveSelection,
    setActiveCell,
    clearCell,
    toggleBold,
    toggleItalic,
    copy,
    paste,
    undo,
    redo,
    onEditStart,
    onEditEnd,
  ]);

  return {
    saveToHistory,
    undo,
    redo,
    copy,
    paste,
    clearCell,
    toggleBold,
    toggleItalic,
    jumpToCell,
    moveSelection,
  };
}
