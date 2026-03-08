"use client";

import { useCallback } from "react";
import { useSelectionStore } from "@/store/selectionStore";
import type { CellCoord } from "@/lib/spreadsheet/cellAddress";
import { toCellId } from "@/lib/spreadsheet/cellAddress";

const ROWS = 100;
const COLS = 26;

export function useCellSelection() {
  const { activeCell, selectionRange, setActiveCell, setSelectionRange } =
    useSelectionStore();

  const activeCellId = activeCell ? toCellId(activeCell) : null;

  const selectCell = useCallback(
    (row: number, col: number) => {
      const coord: CellCoord = { row, col };
      setActiveCell(coord);
    },
    [setActiveCell]
  );

  const selectRange = useCallback(
    (startRow: number, startCol: number, endRow: number, endCol: number) => {
      setSelectionRange(
        { row: startRow, col: startCol },
        { row: endRow, col: endCol }
      );
    },
    [setSelectionRange]
  );

  const isCellSelected = useCallback(
    (row: number, col: number): boolean => {
      if (!selectionRange) return false;
      const { start, end } = selectionRange;
      const minR = Math.min(start.row, end.row);
      const maxR = Math.max(start.row, end.row);
      const minC = Math.min(start.col, end.col);
      const maxC = Math.max(start.col, end.col);
      return row >= minR && row <= maxR && col >= minC && col <= maxC;
    },
    [selectionRange]
  );

  const isActiveCell = useCallback(
    (row: number, col: number): boolean => {
      return activeCell !== null && activeCell.row === row && activeCell.col === col;
    },
    [activeCell]
  );

  return {
    activeCell,
    activeCellId,
    selectionRange,
    selectCell,
    selectRange,
    isCellSelected,
    isActiveCell,
    rows: ROWS,
    cols: COLS,
  };
}
