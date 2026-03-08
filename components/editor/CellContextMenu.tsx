"use client";

import { useCallback } from "react";
import { ContextMenu } from "@/components/ui/ContextMenu";
import { useSelectionStore } from "@/store/selectionStore";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";
import { evaluateSheet } from "@/lib/spreadsheet/evaluator";
import { toCellId, parseCellId } from "@/lib/spreadsheet/cellAddress";
import type { ReactNode } from "react";
import type { SheetData } from "@/lib/spreadsheet/types";

interface CellContextMenuProps {
  children: ReactNode;
  updatedBy: string;
}

export function CellContextMenu({ children, updatedBy }: CellContextMenuProps) {
  const { activeCell, selectionRange } = useSelectionStore();
  const { sheet, setSheet } = useSpreadsheetStore();

  const getSelectedCoords = useCallback(() => {
    if (!selectionRange && !activeCell) return [];
    if (selectionRange) {
      const { start, end } = selectionRange;
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);
      const cells = [];
      for (let r = minRow; r <= maxRow; r++)
        for (let c = minCol; c <= maxCol; c++) cells.push({ row: r, col: c });
      return cells;
    }
    return activeCell ? [activeCell] : [];
  }, [selectionRange, activeCell]);

  // ---- Copy / Cut / Paste ----
  const handleCopy = useCallback(async () => {
    const coords = getSelectedCoords();
    if (coords.length === 0) return;
    let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
    for (const c of coords) {
      minRow = Math.min(minRow, c.row); maxRow = Math.max(maxRow, c.row);
      minCol = Math.min(minCol, c.col); maxCol = Math.max(maxCol, c.col);
    }
    const lines: string[] = [];
    for (let r = minRow; r <= maxRow; r++) {
      const cols: string[] = [];
      for (let c = minCol; c <= maxCol; c++) {
        const cell = sheet[toCellId({ row: r, col: c })];
        cols.push(String(cell?.computed ?? cell?.raw ?? ""));
      }
      lines.push(cols.join("\t"));
    }
    try { await navigator.clipboard.writeText(lines.join("\n")); } catch { /* noop */ }
  }, [getSelectedCoords, sheet]);

  const handleCut = useCallback(async () => {
    await handleCopy();
    const coords = getSelectedCoords();
    let s = { ...sheet };
    for (const coord of coords) {
      const id = toCellId(coord);
      const existing = s[id];
      if (existing) s = { ...s, [id]: { ...existing, raw: "", computed: null, formula: null, updatedAt: Date.now(), updatedBy } };
    }
    setSheet(evaluateSheet(s));
  }, [handleCopy, getSelectedCoords, sheet, setSheet, updatedBy]);

  const handlePaste = useCallback(async () => {
    if (!activeCell) return;
    try {
      const text = await navigator.clipboard.readText();
      const rows = text.split("\n").map((r) => r.split("\t"));
      let s = { ...sheet };
      for (let r = 0; r < rows.length; r++) {
        const rowData = rows[r];
        if (!rowData) continue;
        for (let c = 0; c < rowData.length; c++) {
          const v = rowData[c] ?? "";
          const id = toCellId({ row: activeCell.row + r, col: activeCell.col + c });
          const formula = v.trim().startsWith("=") ? v.trim() : null;
          s = { ...s, [id]: { raw: v, computed: formula ? null : v || null, formula, formatting: s[id]?.formatting ?? {}, updatedAt: Date.now(), updatedBy } };
        }
      }
      setSheet(evaluateSheet(s));
    } catch { /* noop */ }
  }, [activeCell, sheet, setSheet, updatedBy]);

  // ---- Clear ----
  const handleClearCells = useCallback(() => {
    const coords = getSelectedCoords();
    let s = { ...sheet };
    for (const coord of coords) {
      const id = toCellId(coord);
      const existing = s[id];
      if (existing) s = { ...s, [id]: { ...existing, raw: "", computed: null, formula: null, updatedAt: Date.now(), updatedBy } };
    }
    setSheet(evaluateSheet(s));
  }, [getSelectedCoords, sheet, setSheet, updatedBy]);

  const handleClearFormatting = useCallback(() => {
    const coords = getSelectedCoords();
    let s = { ...sheet };
    for (const coord of coords) {
      const id = toCellId(coord);
      const existing = s[id];
      if (existing) s = { ...s, [id]: { ...existing, formatting: {}, updatedAt: Date.now(), updatedBy } };
    }
    setSheet(evaluateSheet(s));
  }, [getSelectedCoords, sheet, setSheet, updatedBy]);

  // ---- Row operations ----
  const shiftRows = useCallback((targetRow: number, direction: "insert-above" | "insert-below" | "delete") => {
    const newSheet: SheetData = {};
    for (const [id, data] of Object.entries(sheet)) {
      try {
        const coord = parseCellId(id);
        if (direction === "insert-above") {
          if (coord.row >= targetRow) newSheet[toCellId({ row: coord.row + 1, col: coord.col })] = data;
          else newSheet[id] = data;
        } else if (direction === "insert-below") {
          if (coord.row > targetRow) newSheet[toCellId({ row: coord.row + 1, col: coord.col })] = data;
          else newSheet[id] = data;
        } else {
          if (coord.row < targetRow) newSheet[id] = data;
          else if (coord.row > targetRow) newSheet[toCellId({ row: coord.row - 1, col: coord.col })] = data;
        }
      } catch { /* skip */ }
    }
    setSheet(evaluateSheet(newSheet));
  }, [sheet, setSheet]);

  const handleInsertRowAbove = useCallback(() => {
    if (activeCell) shiftRows(activeCell.row, "insert-above");
  }, [activeCell, shiftRows]);

  const handleInsertRowBelow = useCallback(() => {
    if (activeCell) shiftRows(activeCell.row, "insert-below");
  }, [activeCell, shiftRows]);

  const handleDeleteRow = useCallback(() => {
    if (activeCell) shiftRows(activeCell.row, "delete");
  }, [activeCell, shiftRows]);

  // ---- Column operations ----
  const shiftCols = useCallback((targetCol: number, direction: "insert-left" | "insert-right" | "delete") => {
    const newSheet: SheetData = {};
    for (const [id, data] of Object.entries(sheet)) {
      try {
        const coord = parseCellId(id);
        if (direction === "insert-left") {
          if (coord.col >= targetCol) newSheet[toCellId({ row: coord.row, col: coord.col + 1 })] = data;
          else newSheet[id] = data;
        } else if (direction === "insert-right") {
          if (coord.col > targetCol) newSheet[toCellId({ row: coord.row, col: coord.col + 1 })] = data;
          else newSheet[id] = data;
        } else {
          if (coord.col < targetCol) newSheet[id] = data;
          else if (coord.col > targetCol) newSheet[toCellId({ row: coord.row, col: coord.col - 1 })] = data;
        }
      } catch { /* skip */ }
    }
    setSheet(evaluateSheet(newSheet));
  }, [sheet, setSheet]);

  const handleInsertColLeft = useCallback(() => {
    if (activeCell) shiftCols(activeCell.col, "insert-left");
  }, [activeCell, shiftCols]);

  const handleInsertColRight = useCallback(() => {
    if (activeCell) shiftCols(activeCell.col, "insert-right");
  }, [activeCell, shiftCols]);

  const handleDeleteCol = useCallback(() => {
    if (activeCell) shiftCols(activeCell.col, "delete");
  }, [activeCell, shiftCols]);

  const items = [
    { label: "Copy", shortcut: "⌘C", onClick: handleCopy },
    { label: "Cut", shortcut: "⌘X", onClick: handleCut },
    { label: "Paste", shortcut: "⌘V", onClick: handlePaste, divider: true },
    { label: "Clear Cells", onClick: handleClearCells },
    { label: "Clear Formatting", onClick: handleClearFormatting, divider: true },
    { label: "Insert Row Above", onClick: handleInsertRowAbove },
    { label: "Insert Row Below", onClick: handleInsertRowBelow },
    { label: "Delete Row", onClick: handleDeleteRow, divider: true },
    { label: "Insert Column Left", onClick: handleInsertColLeft },
    { label: "Insert Column Right", onClick: handleInsertColRight },
    { label: "Delete Column", onClick: handleDeleteCol },
  ];

  return <ContextMenu items={items}>{children}</ContextMenu>;
}
