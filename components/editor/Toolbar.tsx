"use client";

import { useCallback } from "react";
import { useSelectionStore } from "@/store/selectionStore";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { toCellId, parseCellId } from "@/lib/spreadsheet/cellAddress";
import { evaluateSheet } from "@/lib/spreadsheet/evaluator";
import { ColorPickerButton } from "./ColorPicker";
import { ExportMenu } from "./ExportMenu";
import { useToast } from "@/components/ui/Toast";

interface ToolbarProps {
  updatedBy: string;
  documentTitle?: string;
}

export function Toolbar({ updatedBy, documentTitle }: ToolbarProps) {
  const { activeCell, selectionRange } = useSelectionStore();
  const { sheet, setSheet, frozenRows, frozenCols, setFrozenRows, setFrozenCols } = useSpreadsheetStore();
  const { updateCell } = useSpreadsheet(updatedBy);
  const { undo, redo } = useKeyboardNav({ updatedBy });
  const { addToast } = useToast();

  const cellId = activeCell ? toCellId(activeCell) : null;
  const cell = cellId ? sheet[cellId] : null;
  const formatting = cell?.formatting ?? {};

  // Get all cells in selection
  const getSelectedCells = useCallback(() => {
    if (!selectionRange) return activeCell ? [activeCell] : [];
    const { start, end } = selectionRange;
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    
    const cells = [];
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        cells.push({ row: r, col: c });
      }
    }
    return cells;
  }, [selectionRange, activeCell]);

  const applyToSelection = useCallback((newFormatting: Partial<typeof formatting>) => {
    const cells = getSelectedCells();
    for (const coord of cells) {
      const id = toCellId(coord);
      const existingCell = sheet[id];
      updateCell(id, existingCell?.raw ?? "", {
        ...existingCell?.formatting,
        ...newFormatting,
      });
    }
  }, [getSelectedCells, sheet, updateCell]);

  const toggleBold = useCallback(() => {
    applyToSelection({ bold: !formatting.bold });
  }, [formatting.bold, applyToSelection]);

  const toggleItalic = useCallback(() => {
    applyToSelection({ italic: !formatting.italic });
  }, [formatting.italic, applyToSelection]);

  const setAlign = useCallback((align: "left" | "center" | "right") => {
    applyToSelection({ align });
  }, [applyToSelection]);

  const setTextColor = useCallback((color: string) => {
    applyToSelection({ color });
  }, [applyToSelection]);

  const setBgColor = useCallback((bgColor: string) => {
    applyToSelection({ bgColor });
  }, [applyToSelection]);

  const clearFormatting = useCallback(() => {
    applyToSelection({
      bold: false,
      italic: false,
      color: undefined,
      bgColor: undefined,
      align: undefined,
    });
  }, [applyToSelection]);

  // Freeze panes
  const toggleFreezeRows = useCallback(() => {
    const newFrozen = frozenRows === 0 ? 1 : 0;
    setFrozenRows(newFrozen);
    addToast(
      "info",
      newFrozen ? "Frozen top row" : "Unfroze top row",
      2000
    );
  }, [frozenRows, setFrozenRows, addToast]);

  const toggleFreezeCols = useCallback(() => {
    const newFrozen = frozenCols === 0 ? 1 : 0;
    setFrozenCols(newFrozen);
    addToast(
      "info",
      newFrozen ? "Frozen first column" : "Unfroze first column",
      2000
    );
  }, [frozenCols, setFrozenCols, addToast]);

  // Row operations
  const insertRowAbove = useCallback(() => {
    if (!activeCell) return;
    const currentRow = activeCell.row;
    const newSheet: typeof sheet = {};

    for (const [id, data] of Object.entries(sheet)) {
      try {
        const coord = parseCellId(id);
        if (coord.row >= currentRow) {
          // Shift down
          newSheet[toCellId({ row: coord.row + 1, col: coord.col })] = data;
        } else {
          newSheet[id] = data;
        }
      } catch {
        // skip invalid
      }
    }

    setSheet(evaluateSheet(newSheet));
  }, [activeCell, sheet, setSheet]);

  // Column operations
  const insertColLeft = useCallback(() => {
    if (!activeCell) return;
    const currentCol = activeCell.col;
    const newSheet: typeof sheet = {};

    for (const [id, data] of Object.entries(sheet)) {
      try {
        const coord = parseCellId(id);
        if (coord.col >= currentCol) {
          // Shift right
          newSheet[toCellId({ row: coord.row, col: coord.col + 1 })] = data;
        } else {
          newSheet[id] = data;
        }
      } catch {
        // skip invalid
      }
    }

    setSheet(evaluateSheet(newSheet));
  }, [activeCell, sheet, setSheet]);

  const deleteCol = useCallback(() => {
    if (!activeCell) return;
    const currentCol = activeCell.col;
    const newSheet: typeof sheet = {};

    for (const [id, data] of Object.entries(sheet)) {
      try {
        const coord = parseCellId(id);
        if (coord.col < currentCol) {
          newSheet[id] = data;
        } else if (coord.col > currentCol) {
          // Shift left
          newSheet[toCellId({ row: coord.row, col: coord.col - 1 })] = data;
        }
        // coord.col === currentCol → deleted (skip)
      } catch {
        // skip invalid
      }
    }

    setSheet(evaluateSheet(newSheet));
  }, [activeCell, sheet, setSheet]);

  const insertRowBelow = useCallback(() => {
    if (!activeCell) return;
    const currentRow = activeCell.row;
    const newSheet: typeof sheet = {};

    for (const [id, data] of Object.entries(sheet)) {
      try {
        const coord = parseCellId(id);
        if (coord.row > currentRow) {
          // Shift down
          newSheet[toCellId({ row: coord.row + 1, col: coord.col })] = data;
        } else {
          newSheet[id] = data;
        }
      } catch {
        // skip invalid
      }
    }

    setSheet(evaluateSheet(newSheet));
  }, [activeCell, sheet, setSheet]);

  const deleteRow = useCallback(() => {
    if (!activeCell) return;
    const currentRow = activeCell.row;
    const newSheet: typeof sheet = {};

    for (const [id, data] of Object.entries(sheet)) {
      try {
        const coord = parseCellId(id);
        if (coord.row < currentRow) {
          newSheet[id] = data;
        } else if (coord.row > currentRow) {
          // Shift up
          newSheet[toCellId({ row: coord.row - 1, col: coord.col })] = data;
        }
        // coord.row === currentRow → deleted (skip)
      } catch {
        // skip invalid
      }
    }

    setSheet(evaluateSheet(newSheet));
  }, [activeCell, sheet, setSheet]);

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border-subtle bg-surface-2 px-4 py-2">
      {/* Formatting buttons */}
      <div className="flex items-center gap-1">
        <button title="Bold (Ctrl+B)"
            type="button"
            onClick={toggleBold}
            className={`rounded-md px-3 py-1.5 text-sm font-bold transition ${
              formatting.bold ? "bg-primary/20 text-primary" : "hover:bg-surface-3"
            }`}
            aria-label="Bold"
          >
            B
          </button>
        
        
        <button title="Italic (Ctrl+I)"
            type="button"
            onClick={toggleItalic}
            className={`rounded-md px-3 py-1.5 text-sm italic transition ${
              formatting.italic ? "bg-primary/20 text-primary" : "hover:bg-surface-3"
            }`}
            aria-label="Italic"
          >
            I
          </button>
        
      </div>

      <div className="mx-2 h-6 w-px bg-border-subtle" />

      {/* Color pickers */}
      <div className="flex items-center gap-1">
        <ColorPickerButton
          selectedColor={formatting.color}
          onColorSelect={setTextColor}
          type="text"
          label="Text color"
        />
        <ColorPickerButton
          selectedColor={formatting.bgColor}
          onColorSelect={setBgColor}
          type="background"
          label="Background color"
        />
      </div>

      <div className="mx-2 h-6 w-px bg-border-subtle" />

      {/* Alignment buttons */}
      <div className="flex items-center gap-0.5">
        <button title="Align left"
            type="button"
            onClick={() => setAlign("left")}
            className={`rounded-md px-2 py-1.5 text-sm transition ${
              formatting.align === "left" ? "bg-primary/20 text-primary" : "hover:bg-surface-3"
            }`}
            aria-label="Align left"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />
            </svg>
          </button>
        
        
        <button title="Align center"
            type="button"
            onClick={() => setAlign("center")}
            className={`rounded-md px-2 py-1.5 text-sm transition ${
              formatting.align === "center" ? "bg-primary/20 text-primary" : "hover:bg-surface-3"
            }`}
            aria-label="Align center"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" />
            </svg>
          </button>
        
        
        <button title="Align right"
            type="button"
            onClick={() => setAlign("right")}
            className={`rounded-md px-2 py-1.5 text-sm transition ${
              formatting.align === "right" ? "bg-primary/20 text-primary" : "hover:bg-surface-3"
            }`}
            aria-label="Align right"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />
            </svg>
          </button>
        
      </div>

      <div className="mx-2 h-6 w-px bg-border-subtle" />

      {/* Row operations */}
      <div className="flex items-center gap-1">
        <button title="Insert row above"
            type="button"
            onClick={insertRowAbove}
            className="rounded-md px-2 py-1.5 text-sm transition hover:bg-surface-3"
            aria-label="Insert row above"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0-16l-4 4m4-4l4 4" />
            </svg>
          </button>
        
        
        <button title="Insert row below"
            type="button"
            onClick={insertRowBelow}
            className="rounded-md px-2 py-1.5 text-sm transition hover:bg-surface-3"
            aria-label="Insert row below"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V4m0 16l-4-4m4 4l4-4" />
            </svg>
          </button>
        
        
        <button title="Delete row"
            type="button"
            onClick={deleteRow}
            className="rounded-md px-2 py-1.5 text-sm text-danger transition hover:bg-danger/10"
            aria-label="Delete row"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        
      </div>

      <div className="mx-2 h-6 w-px bg-border-subtle" />

      {/* Column operations */}
      <div className="flex items-center gap-1">
        <button title="Insert column left"
            type="button"
            onClick={insertColLeft}
            className="rounded-md px-2 py-1.5 text-sm transition hover:bg-surface-3"
            aria-label="Insert column left"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16m0 0h16M4 20l4-4m-4 4l4 4" />
            </svg>
          </button>
        
        
        <button title="Delete column"
            type="button"
            onClick={deleteCol}
            className="rounded-md px-2 py-1.5 text-sm text-danger transition hover:bg-danger/10"
            aria-label="Delete column"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 4v16m0 0H4m16 0l-4-4m4 4l-4-4" />
            </svg>
          </button>
        
      </div>

      <div className="mx-2 h-6 w-px bg-border-subtle" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <button title="Undo (Ctrl+Z)"
            type="button"
            onClick={undo}
            className="rounded-md px-2 py-1.5 text-sm transition hover:bg-surface-3 disabled:opacity-40"
            aria-label="Undo"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>
        
        
        <button title="Redo (Ctrl+Y)"
            type="button"
            onClick={redo}
            className="rounded-md px-2 py-1.5 text-sm transition hover:bg-surface-3 disabled:opacity-40"
            aria-label="Redo"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9l6-6m0 0l-6 6m6-6H9a6 6 0 000 12h3" />
            </svg>
          </button>
        
      </div>

      <div className="mx-2 h-6 w-px bg-border-subtle" />

      {/* Search in sheet */}
      <button title="Search (Ctrl+F)"
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("sheet:open-search"))}
          className="rounded-md px-2 py-1.5 text-sm transition hover:bg-surface-3"
          aria-label="Search in sheet"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </button>
      

      <div className="mx-2 h-6 w-px bg-border-subtle" />

      {/* Clear formatting */}
      <button title="Clear formatting"
          type="button"
          onClick={clearFormatting}
          className="rounded-md px-2 py-1.5 text-sm transition hover:bg-surface-3"
          aria-label="Clear formatting"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      

      <div className="mx-2 h-6 w-px bg-border-subtle" />

      {/* Freeze panes */}
      <div className="flex items-center gap-1">
        <button title={frozenRows > 0 ? "Unfreeze top row" : "Freeze top row"}
            type="button"
            onClick={toggleFreezeRows}
            className={`rounded-md px-2 py-1.5 text-sm transition ${
              frozenRows > 0 ? "bg-primary/20 text-primary" : "hover:bg-surface-3"
            }`}
            aria-label="Freeze top row"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15h18M3 9h18M3 3v18" />
            </svg>
          </button>
        
        
        <button title={frozenCols > 0 ? "Unfreeze first column" : "Freeze first column"}
            type="button"
            onClick={toggleFreezeCols}
            className={`rounded-md px-2 py-1.5 text-sm transition ${
              frozenCols > 0 ? "bg-primary/20 text-primary" : "hover:bg-surface-3"
            }`}
            aria-label="Freeze first column"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v18m6-18v18M3 3h18" />
            </svg>
          </button>
        
      </div>

      {/* Export menu - positioned at the end */}
      <div className="ml-auto">
        <ExportMenu documentTitle={documentTitle} />
      </div>
    </div>
  );
}
